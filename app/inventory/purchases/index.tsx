// app/inventory/purchases/index.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Pressable,
  TextInput,
  Modal,
  Alert,
  ScrollView,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Q } from '@nozbe/watermelondb';
import { MaterialIcons } from '@expo/vector-icons';
import database from '../../../db/index';
import withObservables from '@nozbe/with-observables';
import type Product from '../../../models/product';
import type Supplier from '../../../models/supplier';
import type PurchaseProduct from '../../../models/purchase';

// Constants
const ITEMS_PER_PAGE = 20;
const SEARCH_DEBOUNCE_MS = 300;

// Types
interface FormData {
  productId: string;
  supplierId: string;
  qty: string;
  cost: string;
}

interface SupplierFormData {
  name: string;
  contactInfo: string;
}

interface EnrichedPurchase extends PurchaseProduct {
  product: Product;
  supplier: Supplier;
}

// Initial States
const initialFormData: FormData = {
  productId: '',
  supplierId: '',
  qty: '',
  cost: ''
};

const initialSupplierForm: SupplierFormData = {
  name: '',
  contactInfo: ''
};

// Enhanced PurchaseItem component with memo
const BasePurchaseItem = React.memo<{
  purchase: PurchaseProduct;
  product?: Product;
  supplier?: Supplier;
  onDelete: (purchase: PurchaseProduct) => void;
}>(({ purchase, product, supplier, onDelete }) => {
  const formatCurrency = useCallback((value: number | undefined): string => {
    return typeof value === 'number' ? value.toFixed(2) : '0.00';
  }, []);

  const formatDate = useCallback((date: Date | undefined): string => {
    if (!date) return '-';
    try {
      return new Date(date).toLocaleDateString();
    } catch {
      return '-';
    }
  }, []);

  return (
    <View style={styles.purchaseCard}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.productName}>
            {product?.name || 'Unknown Product'}
          </Text>
          <Text style={styles.supplierName}>
            {supplier?.name || 'Unknown Supplier'}
          </Text>
        </View>
        <Pressable
          onPress={() => onDelete(purchase)}
          style={styles.deleteButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialIcons name="delete" size={20} color="#C62828" />
        </Pressable>
      </View>
      
      <View style={styles.infoGrid}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Quantity</Text>
          <Text style={styles.infoValue}>{purchase.qty || 0}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Cost/Unit</Text>
          <Text style={styles.infoValue}>
            ${formatCurrency(purchase.cost)}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Total</Text>
          <Text style={styles.infoValue}>
            ${formatCurrency(purchase.total)}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Date</Text>
          <Text style={styles.infoValue}>
            {formatDate(purchase.dateAdded)}
          </Text>
        </View>
      </View>
    </View>
  );
});

// Enhanced Purchase List component with withObservables
const enhance = withObservables(['purchase'], ({ purchase }: { purchase: PurchaseProduct }) => ({
  product: purchase.product,
  supplier: purchase.supplier,
}));

const EnhancedPurchaseItem = enhance(BasePurchaseItem);

const PurchaseList = withObservables(['searchQuery', 'page'], ({ searchQuery, page }) => ({
  purchases: database.collections
    .get<PurchaseProduct>('purchase_products')
    .query(
      ...([
        Q.sortBy('date_added', Q.desc),
        ...(searchQuery ? [
          Q.or(
            Q.on('products', Q.where('name', Q.like(`%${searchQuery}%`))),
            Q.on('suppliers', Q.where('name', Q.like(`%${searchQuery}%`)))
          )
        ] : []),
        Q.skip(page * ITEMS_PER_PAGE),
        Q.take(ITEMS_PER_PAGE)
      ])
    )
    .observe(),
}))(({ purchases, onDelete, ListEmptyComponent, onEndReached }) => (
  <FlatList
    data={purchases}
    renderItem={({ item }) => (
      <EnhancedPurchaseItem 
        purchase={item}
        onDelete={onDelete}
      />
    )}
    keyExtractor={item => item.id}
    contentContainerStyle={styles.list}
    ListEmptyComponent={ListEmptyComponent}
    onEndReached={onEndReached}
    onEndReachedThreshold={0.5}
    removeClippedSubviews={true}
    maxToRenderPerBatch={10}
    updateCellsBatchingPeriod={50}
    windowSize={10}
  />
));

// Main Component
export default function PurchasesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [supplierModalVisible, setSupplierModalVisible] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [supplierForm, setSupplierForm] = useState<SupplierFormData>(initialSupplierForm);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [supplierErrors, setSupplierErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(0);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  
  useEffect(() => {
    const productsSubscription = database.collections
      .get<Product>('products')
      .query()
      .observe()
      .subscribe(setProducts);

    const suppliersSubscription = database.collections
      .get<Supplier>('suppliers')
      .query()
      .observe()
      .subscribe(setSuppliers);

    return () => {
      productsSubscription.unsubscribe();
      suppliersSubscription.unsubscribe();
    };
  }, []);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      setPage(prev => prev + 1);
    }
  }, [hasMore, isLoading]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setPage(0);
    setIsRefreshing(false);
  }, []);

  const validateForm = useCallback(() => {
    const errors: {[key: string]: string} = {};
    if (!formData.productId) errors.productId = 'Product is required';
    if (!formData.supplierId) errors.supplierId = 'Supplier is required';
    if (!formData.qty || Number(formData.qty) <= 0) errors.qty = 'Valid quantity required';
    if (!formData.cost || Number(formData.cost) <= 0) errors.cost = 'Valid cost required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const validateSupplierForm = useCallback(() => {
    const errors: {[key: string]: string} = {};
    if (!supplierForm.name.trim()) errors.name = 'Name is required';
    if (!supplierForm.contactInfo.trim()) errors.contactInfo = 'Contact info is required';
    setSupplierErrors(errors);
    return Object.keys(errors).length === 0;
  }, [supplierForm]);

  const handleCreateSupplier = async () => {
    if (!validateSupplierForm()) return;

    try {
      await database.write(async () => {
        const newSupplier = await database.collections
          .get<Supplier>('suppliers')
          .create(supplier => {
            supplier.name = supplierForm.name.trim();
            supplier.contactInfo = supplierForm.contactInfo.trim();
            supplier.dateAdded = new Date();
            supplier.dateUpdated = new Date();
          });

        setFormData(prev => ({ ...prev, supplierId: newSupplier.id }));
      });

      setSupplierModalVisible(false);
      setSupplierForm(initialSupplierForm);
    } catch (error) {
      Alert.alert('Error', 'Failed to create supplier');
    }
  };

  const handleCreatePurchase = async () => {
    if (!validateForm()) return;

    try {
      await database.write(async () => {
        const total = Number(formData.qty) * Number(formData.cost);
        
        const purchase = await database.collections
          .get<PurchaseProduct>('purchase_products')
          .create(p => {
            p.cost = Number(formData.cost);
            p.qty = Number(formData.qty);
            p.total = total;
            p.dateAdded = new Date();
            p.dateUpdated = new Date();
            (p as any)._raw.supplier_id = formData.supplierId;
            (p as any)._raw.product_id = formData.productId;
          });

        const product = await purchase.product;
        await product.updateQuantity(Number(formData.qty), `PURCHASE-${purchase.id}`);
      });

      setModalVisible(false);
      setFormData(initialFormData);
    } catch (error) {
      Alert.alert('Error', 'Failed to create purchase');
    }
  };

  const handleDeletePurchase = useCallback(async (purchase: EnrichedPurchase) => {
    try {
      await database.write(async () => {
        const purchaseRecord = await database.collections
          .get<PurchaseProduct>('purchase_products')
          .find(purchase.id);

        if (!purchaseRecord) {
          throw new Error('Purchase record not found');
        }

        const product = await purchaseRecord.product;
        if (product) {
          await product.updateQuantity(
            -purchaseRecord.qty,
            `DELETE-PURCHASE-${purchaseRecord.id}`
          );
        }
        
        await purchaseRecord.markAsDeleted();
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to delete purchase');
    }
  }, []);

  const EmptyListComponent = useMemo(() => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="shopping-cart" size={48} color="#666" />
      <Text style={styles.emptyText}>No purchases found</Text>
      <Text style={styles.emptySubText}>
        {searchQuery ? 'Try adjusting your search' : 'Add your first purchase to get started'}
      </Text>
    </View>
  ), [searchQuery]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={24} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search purchases..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <Pressable 
              onPress={() => setSearchQuery('')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialIcons name="close" size={24} color="#666" />
            </Pressable>
          )}
        </View>
        <Pressable 
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <MaterialIcons name="add" size={24} color="#FFF" />
          <Text style={styles.addButtonText}>Add Purchase</Text>
        </Pressable>
      </View>

      {/* Purchases List */}
      <PurchaseList
        searchQuery={debouncedSearch}
        page={page}
        onDelete={handleDeletePurchase}
        ListEmptyComponent={EmptyListComponent}
        onEndReached={handleLoadMore}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#000080']}
          />
        }
      />

      {/* Add Purchase Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Purchase</Text>
              <Pressable 
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <MaterialIcons name="close" size={24} color="#666" />
              </Pressable>
            </View>

            <ScrollView style={styles.formContainer}>
              {/* Product Selection */}
              <View style={styles.formField}>
                <Text style={styles.label}>Product</Text>
                <View style={styles.pickerContainer}>
                  {products.map(product => (
                    <Pressable
                      key={product.id}
                      style={[
                        styles.pickerItem,
                        formData.productId === product.id && styles.pickerItemSelected
                      ]}
                      onPress={() => setFormData(prev => ({ ...prev, productId: product.id }))}
                    >
                      <Text style={styles.pickerText}>{product.name}</Text>
                    </Pressable>
                  ))}
                </View>
                {formErrors.productId && (
                  <Text style={styles.errorText}>{formErrors.productId}</Text>
                )}
              </View>

              {/* Supplier Selection */}
              <View style={styles.formField}>
                <View style={styles.labelContainer}>
                  <Text style={styles.label}>Supplier</Text>
                  <Pressable
                    style={styles.addSupplierButton}
                    onPress={() => setSupplierModalVisible(true)}
                  >
                    <MaterialIcons name="add" size={20} color="#000080" />
                    <Text style={styles.addSupplierText}>New Supplier</Text>
                  </Pressable>
                </View>
                <View style={styles.pickerContainer}>
                  {suppliers.map(supplier => (
                    <Pressable
                      key={supplier.id}
                      style={[
                        styles.pickerItem,
                        formData.supplierId === supplier.id && styles.pickerItemSelected
                      ]}
                      onPress={() => setFormData(prev => ({ ...prev, supplierId: supplier.id }))}
                    >
                      <Text style={styles.pickerText}>{supplier.name}</Text>
                    </Pressable>
                  ))}
                </View>
                {formErrors.supplierId && (
                  <Text style={styles.errorText}>{formErrors.supplierId}</Text>
                )}
              </View>

              {/* Quantity and Cost */}
              <View style={styles.rowFields}>
                <View style={[styles.formField, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.label}>Quantity</Text>
                  <TextInput
                    style={[styles.input, formErrors.qty && styles.inputError]}
                    value={formData.qty}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, qty: text }))}
                    keyboardType="numeric"
                    placeholder="0"
                  />
                  {formErrors.qty && (
                    <Text style={styles.errorText}>{formErrors.qty}</Text>
                  )}
                </View>

                <View style={[styles.formField, { flex: 1 }]}>
                  <Text style={styles.label}>Cost per unit</Text>
                  <TextInput
                    style={[styles.input, formErrors.cost && styles.inputError]}
                    value={formData.cost}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, cost: text }))}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                  />
                  {formErrors.cost && (
                    <Text style={styles.errorText}>{formErrors.cost}</Text>
                  )}
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <Pressable 
                style={[styles.button, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </Pressable>
              <Pressable 
                style={[styles.button, styles.saveButton]}
                onPress={handleCreatePurchase}
              >
                <Text style={[styles.buttonText, styles.saveButtonText]}>
                  Create Purchase
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Supplier Modal */}
      <Modal
        visible={supplierModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSupplierModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { maxHeight: '60%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Supplier</Text>
              <Pressable 
                onPress={() => setSupplierModalVisible(false)}
                style={styles.closeButton}
              >
                <MaterialIcons name="close" size={24} color="#666" />
              </Pressable>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.formField}>
                <Text style={styles.label}>Name</Text>
                <TextInput
                  style={[styles.input, supplierErrors.name && styles.inputError]}
                  value={supplierForm.name}
                  onChangeText={(text) => setSupplierForm(prev => ({ ...prev, name: text }))}
                  placeholder="Supplier Name"
                />
                {supplierErrors.name && (
                  <Text style={styles.errorText}>{supplierErrors.name}</Text>
                )}
              </View>

              <View style={styles.formField}>
                <Text style={styles.label}>Contact Information</Text>
                <TextInput
                  style={[
                    styles.input,
                    styles.textArea,
                    supplierErrors.contactInfo && styles.inputError
                  ]}
                  value={supplierForm.contactInfo}
                  onChangeText={(text) => setSupplierForm(prev => ({ ...prev, contactInfo: text }))}
                  placeholder="Phone, Email, Address..."
                  multiline
                  numberOfLines={4}
                />
                {supplierErrors.contactInfo && (
                  <Text style={styles.errorText}>{supplierErrors.contactInfo}</Text>
                )}
              </View>
            </View>

            <View style={styles.modalActions}>
              <Pressable 
                style={[styles.button, styles.cancelButton]}
                onPress={() => setSupplierModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </Pressable>
              <Pressable 
                style={[styles.button, styles.saveButton]}
                onPress={handleCreateSupplier}
              >
                <Text style={[styles.buttonText, styles.saveButtonText]}>
                  Create Supplier
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFF',
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000080',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFF',
    marginLeft: 5,
    fontSize: 16,
  },
  list: {
    padding: 15,
  },
  purchaseCard: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  supplierName: {
    fontSize: 14,
    color: '#666',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: '#FFEBEE',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingTop: 10,
    marginTop: 10,
  },
  infoItem: {
    width: '50%',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  formContainer: {
    padding: 15,
  },
  formField: {
    marginBottom: 20,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  label: {
    fontSize: 16,
    color: '#333',
  },
  addSupplierButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
  },
  addSupplierText: {
    color: '#000080',
    marginLeft: 5,
    fontSize: 14,
  },
  rowFields: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 4,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#FFF',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#C62828',
  },
  errorText: {
    color: '#C62828',
    fontSize: 12,
    marginTop: 5,
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pickerItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#DDD',
    backgroundColor: '#FFF',
  },
  pickerItemSelected: {
    backgroundColor: '#E3F2FD',
    borderColor: '#000080',
  },
  pickerText: {
    fontSize: 14,
    color: '#333',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 10,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#EEE',
  },
  saveButton: {
    backgroundColor: '#000080',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  saveButtonText: {
    color: '#FFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 10,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
});