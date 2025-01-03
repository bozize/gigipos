import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, NativeSyntheticEvent, NativeScrollEvent, Alert } from 'react-native';
import { router } from 'expo-router';
import { Q } from '@nozbe/watermelondb';
import { withObservables } from '@nozbe/watermelondb/react';
import database from '../../db/index';
import { useAuth } from '../context/auth';
import type { ProductModel, CategoryModel } from '../inventory/products/types';
import type Sale from '../../models/sale';
import type SaleItem from '../../models/item';
import type Product from '../../models/product';
import { CartItem, PaymentMethod, RawSale, RawSaleItem, RecentSale } from './types';

import CartSection from './components/CartSection';
import ProductsSection from './components/ProductsSection';
import NumPad from './components/NumPad';


const salesCollection = database.get<Sale>('sales');
const salesItemsCollection = database.get<SaleItem>('sales_items');
const productsCollection = database.get<Product>('products');


const ITEMS_PER_PAGE = 20;

interface POSScreenProps {
  categories: CategoryModel[];
}

const POSScreen: React.FC<POSScreenProps> = ({ categories }) => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCredit, setIsCredit] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [totalPaid, setTotalPaid] = useState('');
  const [discount, setDiscount] = useState('');
  const [loading, setLoading] = useState(true);
  const [showRecentSales, setShowRecentSales] = useState(false);
  const [recentSales, setRecentSales] = useState<RecentSale[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(false);
  const [editingSaleId, setEditingSaleId] = useState<string | null>(null);
  const [activeInput, setActiveInput] = useState<'quantity' | 'payment' | 'discount' | null>(null);
  const [tempValues, setTempValues] = useState({
    payment: '',
    discount: '',
    quantity: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [filteredProducts, setFilteredProducts] = useState<ProductModel[]>([]);
  
  
  const loadingRef = useRef(false);
  const categoryLoadingRef = useRef(false);

  
  useEffect(() => {
    const initializeScreen = async () => {
      try {
        if (categories.length > 0) {
          const firstCategoryId = categories[0].id;
          setSelectedCategory(firstCategoryId);
          await loadProductsForCategory(firstCategoryId, 1);
        }
      } catch (error) {
        console.error('Error initializing screen:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeScreen();
  }, [categories]);

  
  const loadProductsForCategory = async (
    categoryId: string, 
    page: number,
    isInitial = false
  ) => {
    if (!categoryId || loadingRef.current) return;
    
    loadingRef.current = true;
    if (!isInitial) setLoadingMore(true);
    
    try {
      // For initial load, fetch fewer items
      const limit = isInitial ? 10 : ITEMS_PER_PAGE;
      
      const products = await productsCollection
        .query(
          Q.where('category_id', categoryId),
          Q.skip(limit * (page - 1)),
          Q.take(limit)
        )
        .fetch();

      if (page === 1) {
        setFilteredProducts(products as unknown as ProductModel[]);
      } else {
        setFilteredProducts(prev => [...prev, ...(products as unknown as ProductModel[])]);
      }
      
      setHasMore(products.length === limit);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      loadingRef.current = false;
      if (!isInitial) setLoadingMore(false);
    }
  };


  
  const handleCategorySelect = useCallback(async (categoryId: string) => {
    if (categoryLoadingRef.current || categoryId === selectedCategory) return;
    
    categoryLoadingRef.current = true;
    setSelectedCategory(categoryId);
    setCurrentPage(1);
    setHasMore(true);
    setFilteredProducts([]);
    
    await loadProductsForCategory(categoryId, 1);
    categoryLoadingRef.current = false;
  }, [selectedCategory]);

  // Cart management functions
  const addToCart = useCallback((product: ProductModel) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.productId === product.id);
      
      if (existingItem) {
        return prev.map(item =>
          item.productId === product.id
            ? {
                ...item,
                qty: item.qty + 1,
                totalAmount: (item.qty + 1) * item.price,
                vat: (item.qty + 1) * item.price * (product.taxRate / 100)
              }
            : item
        );
      }

      return [...prev, {
        productId: product.id,
        name: product.name,
        price: product.price,
        qty: 1,
        totalAmount: product.price,
        vat: product.price * (product.taxRate / 100),
        unitType: product.defaultUnit
      }];
    });
  }, []);

  const updateQuantity = useCallback((productId: string, newQty: number) => {
    if (newQty < 1) return;
    
    setCartItems(prev => 
      prev.map(item => {
        if (item.productId === productId) {
          const product = filteredProducts.find(p => p.id === productId);
          if (!product) return item;

          return {
            ...item,
            qty: newQty,
            totalAmount: newQty * item.price,
            vat: newQty * item.price * (product.taxRate / 100)
          };
        }
        return item;
      })
    );
  }, [filteredProducts]);

  const removeFromCart = useCallback((productId: string) => {
    setCartItems(prev => prev.filter(item => item.productId !== productId));
  }, []);

  // Stock validation
  const validateStock = async (items: CartItem[]): Promise<boolean> => {
    try {
      for (const item of items) {
        const product = await productsCollection.find(item.productId);
        if (!product) {
          Alert.alert('Error', `Product ${item.name} not found`);
          return false;
        }
        
        if (product.baseQuantity < item.qty) {
          Alert.alert(
            'Insufficient Stock',
            `Only ${product.baseQuantity} units available for ${item.name}`
          );
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error validating stock:', error);
      Alert.alert('Error', 'Failed to validate stock levels');
      return false;
    }
  };

  // Payment validation
  const validatePayment = useCallback((): boolean => {
    if (isCredit) {
      const amountPaid = parseFloat(totalPaid) || 0;
      if (amountPaid <= 0) {
        Alert.alert('Invalid Payment', 'Please enter amount paid for credit sale.');
        return false;
      }
    }
    return true;
  }, [isCredit, totalPaid]);

  // Calculations
  const calculations = useMemo(() => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.totalAmount, 0);
    const totalVat = cartItems.reduce((sum, item) => sum + item.vat, 0);
    const discountAmount = parseFloat(discount) || 0;
    const grandTotal = Math.max(0, subtotal + totalVat - discountAmount);
    const amountPaid = parseFloat(totalPaid) || 0;
    const balanceDue = isCredit ? grandTotal - amountPaid : 0;

    return {
      subtotal,
      totalVat,
      grandTotal,
      balanceDue
    };
  }, [cartItems, discount, totalPaid, isCredit]);
  
  const navigateToPrint = useCallback((sale: Sale) => {
    const query = {
      saleId: sale.id,
      code: sale.code,
      date: sale.dateAdded.toLocaleString(),
      cashier: user?.username || 'Unknown',
      items: JSON.stringify(cartItems.map(item => ({
        productName: item.name,
        price: item.price,
        qty: item.qty,
        total: item.totalAmount,
        unitType: item.unitType,
        vat: item.vat,
      }))),
      subtotal: calculations.subtotal.toString(),
      tax: calculations.totalVat.toString(),
      discount: (parseFloat(discount) || 0).toString(),
      total: calculations.grandTotal.toString(),
      paymentMethod,
      amountPaid: (parseFloat(totalPaid) || calculations.grandTotal).toString(),
      balanceDue: calculations.balanceDue.toString(),
      isCredit: isCredit.toString(),
      customerName,
    };
  
    
    requestAnimationFrame(() => {
      router.push({
        pathname: '/pos/print',
        params: query,
      });
    });
  }, [cartItems, calculations, discount, totalPaid, paymentMethod, isCredit, customerName, user]);
  

  
  const resetForm = useCallback(() => {
    setCartItems([]);
    setCustomerName('');
    setTotalPaid('');
    setDiscount('');
    setIsCredit(false);
    setPaymentMethod('cash');
    setEditingSaleId(null);
  }, []);
  // Checkout handler
  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    if (!validatePayment()) return;
    if (isCredit && !customerName.trim()) {
      Alert.alert('Missing Information', 'Please enter customer name for credit sale.');
      return;
    }
    
    const hasStock = await validateStock(cartItems);
    if (!hasStock) return;

    try {
      await database.write(async () => {
        let sale;
        
        if (editingSaleId) {
          
          sale = await salesCollection.find(editingSaleId);
          await sale.update(s => {
            s.subTotal = calculations.subtotal;
            s.totalTax = calculations.totalVat;
            s.discount = parseFloat(discount) || 0;
            s.grandTotal = calculations.grandTotal;
            s.isCredit = isCredit;
            s.customerName = customerName;
            s.paymentMethod = paymentMethod;
            s.totalPaid = parseFloat(totalPaid) || calculations.grandTotal;
            s.balanceDue = calculations.balanceDue;
            s.dateUpdated = new Date();
          });

          const existingItems = await salesItemsCollection
            .query(Q.where('sale_id', editingSaleId))
            .fetch();
          await Promise.all(existingItems.map(item => item.destroyPermanently()));
        } else {
          
          sale = await salesCollection.create(s => {
            s.code = `SALE-${Date.now()}`;
            s.subTotal = calculations.subtotal;
            s.totalTax = calculations.totalVat;
            s.discount = parseFloat(discount) || 0;
            s.grandTotal = calculations.grandTotal;
            s.isCredit = isCredit;
            s.customerName = customerName
            s.paymentMethod = paymentMethod;
            s.totalPaid = parseFloat(totalPaid) || calculations.grandTotal;
            s.balanceDue = calculations.balanceDue;
            s.dateAdded = new Date();
            s.dateUpdated = new Date();
            if (user) {
              (s._raw as unknown as RawSale).cashier_id = user.id;
            }
          });
        }

        
        await Promise.all(cartItems.map(async item => {
          await salesItemsCollection.create(saleItem => {
            (saleItem._raw as unknown as RawSaleItem).sale_id = sale.id;
            (saleItem._raw as unknown as RawSaleItem).product_id = item.productId;
            saleItem.price = item.price;
            saleItem.qty = item.qty;
            saleItem.taxAmount = item.vat;
            saleItem.totalAmount = item.totalAmount;
            saleItem.unitType = item.unitType;
          });

          const product = await productsCollection.find(item.productId);
          if (product) {
            await product.updateQuantity(-item.qty, sale.id);
          }
        }));

        resetForm();
        navigateToPrint(sale);
      });
    } catch (error) {
      console.error('Error saving sale:', error);
      Alert.alert('Error', 'Failed to complete sale. Please try again.');
    }
  };
  
  const loadRecentSales = async () => {
    try {
      setLoadingRecent(true);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const sales = await salesCollection
        .query(
          Q.where('date_added', Q.gte(today.getTime())),
          Q.sortBy('date_added', Q.desc)
        )
        .fetch();

      setRecentSales(sales);
    } catch (error) {
      console.error('Error loading recent sales:', error);
    } finally {
      setLoadingRecent(false);
    }
  };

  const loadSaleForEditing = async (saleId: string) => {
    try {
      const sale = await salesCollection.find(saleId);
      const items = await salesItemsCollection
        .query(Q.where('sale_id', saleId))
        .fetch();

      setCartItems([]);
      
      const loadedItems = await Promise.all(
        items.map(async (item) => {
          const product = await item.product;
          return {
            productId: product.id,
            name: product.name,
            price: item.price,
            qty: item.qty,
            vat: item.taxAmount,
            totalAmount: item.totalAmount,
            unitType: item.unitType
          };
        })
      );

      setCartItems(loadedItems);
      setIsCredit(sale.isCredit);
      setCustomerName(sale.customerName || '');
      setDiscount(sale.discount.toString());
      setTotalPaid(sale.totalPaid.toString());
      setPaymentMethod(sale.paymentMethod as PaymentMethod);
      setEditingSaleId(saleId);
      setShowRecentSales(false);
    } catch (error) {
      console.error('Error loading sale:', error);
      Alert.alert('Error', 'Failed to load sale for editing');
    }
  };
  useEffect(() => {
    if (showRecentSales) {
      loadRecentSales();
    }
  }, [showRecentSales]);

  // NumPad handlers
  const handleNumPress = useCallback((num: string) => {
    if (!activeInput) return;
    
    if (num === '.' && tempValues[activeInput].includes('.')) return;
    
    setTempValues(prev => ({
      ...prev,
      [activeInput]: prev[activeInput] + num
    }));
  }, [activeInput, tempValues]);

  const handleNumClear = useCallback(() => {
    if (!activeInput) return;
    setTempValues(prev => ({
      ...prev,
      [activeInput]: ''
    }));
  }, [activeInput]);

  const handleNumBackspace = useCallback(() => {
    if (!activeInput) return;
    setTempValues(prev => ({
      ...prev,
      [activeInput]: prev[activeInput].slice(0, -1)
    }));
  }, [activeInput]);

  const handleNumEnter = useCallback(() => {
    if (!activeInput) return;

    const value = parseFloat(tempValues[activeInput]);
    if (isNaN(value)) return;
    
    switch (activeInput) {
      case 'quantity':
        const selectedItem = cartItems[cartItems.length - 1];
        if (selectedItem) {
          updateQuantity(selectedItem.productId, value);
        }
        break;
      case 'payment':
        setTotalPaid(value.toString());
        break;
      case 'discount':
        setDiscount(value.toString());
        break;
    }
    
    setActiveInput(null);
    setTempValues(prev => ({
      ...prev,
      [activeInput]: ''
    }));
  }, [activeInput, tempValues, cartItems, updateQuantity]);
  
  const handleProductsScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (loadingRef.current) return;

    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isCloseToBottom = (layoutMeasurement.height + contentOffset.y) 
      >= (contentSize.height - 20);

    if (isCloseToBottom && !loadingMore && hasMore && selectedCategory) {
      loadProductsForCategory(selectedCategory, currentPage + 1);
    }
  }, [currentPage, loadingMore, hasMore, selectedCategory]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000080" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CartSection
        cartItems={cartItems}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
        isCredit={isCredit}
        setIsCredit={setIsCredit}
        customerName={customerName}
        setCustomerName={setCustomerName}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        totalPaid={totalPaid}
        discount={discount}
        calculations={calculations}
        handleCheckout={handleCheckout}
        showRecentSales={showRecentSales}
        setShowRecentSales={setShowRecentSales}
        recentSales={recentSales}
        loadingRecent={loadingRecent}
        onLoadSale={loadSaleForEditing}
        setActiveInput={setActiveInput}
        tempValues={tempValues}
        activeInput={activeInput}
      />

      <ProductsSection
        categories={categories}
        selectedCategory={selectedCategory}
        onCategorySelect={handleCategorySelect}
        filteredProducts={filteredProducts}
        onProductSelect={addToCart}
        loadingMore={loadingMore}
        onScroll={handleProductsScroll}
      />

      <View style={styles.numPadSection}>
        <NumPad
          onNumberPress={handleNumPress}
          onClear={handleNumClear}
          onBackspace={handleNumBackspace}
          onEnter={handleNumEnter}
        />
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numPadSection: {
    width: '20%',
    backgroundColor: '#F9FAFB',
    borderLeftWidth: 1,
    borderLeftColor: '#E5E7EB',
    padding: 10,
    height: 'auto',
    alignSelf: 'flex-start'
  }
});

// Update the export to only observe categories
export default withObservables([], () => ({
  categories: database.get<CategoryModel>('categories')
    .query()
    .observe()
}))(POSScreen);

