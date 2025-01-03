import React, { createContext, useContext, useState, useCallback } from 'react';
import { Alert } from 'react-native';
import type { CartItem, PaymentMethod } from './types';
import { useAuth } from '../../context/auth';

interface POSContextType {
  cartItems: CartItem[];
  isCredit: boolean;
  customerName: string;
  paymentMethod: PaymentMethod;
  totalPaid: string;
  discount: string;
  loading: boolean;
  activeInput: 'quantity' | 'payment' | 'discount' | null;
  tempValues: {
    payment: string;
    discount: string;
    quantity: string;
  };
  addToCart: (product: any) => void;
  updateQuantity: (productId: string, newQty: number) => void;
  removeFromCart: (productId: string) => void;
  setIsCredit: (value: boolean) => void;
  setCustomerName: (value: string) => void;
  setPaymentMethod: (value: PaymentMethod) => void;
  setTotalPaid: (value: string) => void;
  setDiscount: (value: string) => void;
  setActiveInput: (value: 'quantity' | 'payment' | 'discount' | null) => void;
  setTempValues: React.Dispatch<React.SetStateAction<{
    payment: string;
    discount: string;
    quantity: string;
  }>>;
  calculations: {
    subtotal: number;
    totalVat: number;
    grandTotal: number;
    balanceDue: number;
  };
}

const POSContext = createContext<POSContextType | undefined>(undefined);

export function POSProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCredit, setIsCredit] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [totalPaid, setTotalPaid] = useState('');
  const [discount, setDiscount] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeInput, setActiveInput] = useState<'quantity' | 'payment' | 'discount' | null>(null);
  const [tempValues, setTempValues] = useState({
    payment: '',
    discount: '',
    quantity: ''
  });

  const addToCart = useCallback((product: any) => {
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
          return {
            ...item,
            qty: newQty,
            totalAmount: newQty * item.price,
            vat: newQty * item.price * (item.vat / (item.price * item.qty))
          };
        }
        return item;
      })
    );
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCartItems(prev => prev.filter(item => item.productId !== productId));
  }, []);

  const calculations = React.useMemo(() => {
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

  return (
    <POSContext.Provider
      value={{
        cartItems,
        isCredit,
        customerName,
        paymentMethod,
        totalPaid,
        discount,
        loading,
        activeInput,
        tempValues,
        addToCart,
        updateQuantity,
        removeFromCart,
        setIsCredit,
        setCustomerName,
        setPaymentMethod,
        setTotalPaid,
        setDiscount,
        setActiveInput,
        setTempValues,
        calculations
      }}
    >
      {children}
    </POSContext.Provider>
  );
}

export function usePOS() {
  const context = useContext(POSContext);
  if (context === undefined) {
    throw new Error('usePOS must be used within a POSProvider');
  }
  return context;
}