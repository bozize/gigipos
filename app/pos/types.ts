import type Product from '../../models/product';
import type Category from '../../models/category';
import type Sale from '../../models/sale';
import type SaleItem from '../../models/item';
import type User from '../../models/user';
import type { ProductModel, CategoryModel } from '../inventory/products/types';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
  totalAmount: number;
  vat: number;
  unitType: string;
}

export type PaymentMethod = 'cash' | 'mpesa';

export type RawSale = {
  cashier_id?: string;
};

export type RawSaleItem = {
  sale_id: string;
  product_id: string;
};

export interface RecentSale {
  id: string;
  code: string;
  dateAdded: Date;
  grandTotal: number;
  customerName?: string;
  isCredit: boolean;
}

export interface NumPadProps {
  onNumberPress: (num: string) => void;
  onClear: () => void;
  onEnter: () => void;
  onBackspace: () => void;
}

export interface CartSectionProps {
  cartItems: CartItem[];
  updateQuantity: (productId: string, qty: number) => void;
  removeFromCart: (productId: string) => void;
  isCredit: boolean;
  setIsCredit: (value: boolean) => void;
  customerName: string;
  setCustomerName: (value: string) => void;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (value: PaymentMethod) => void;
  totalPaid: string;
  discount: string;
  calculations: {
    subtotal: number;
    totalVat: number;
    grandTotal: number;
    balanceDue: number;
  };
  handleCheckout: () => void;
  showRecentSales: boolean;
  setShowRecentSales: (value: boolean) => void;
  recentSales: RecentSale[];
  loadingRecent: boolean;
  onLoadSale: (saleId: string) => void;
  setActiveInput: (type: 'payment' | 'discount' | 'quantity' | null) => void;
  tempValues: {
    payment: string;
    discount: string;
    quantity: string;
  };
  activeInput: 'payment' | 'discount' | 'quantity' | null;
}

export interface ProductsSectionProps {
  categories: CategoryModel[];
  selectedCategory: string | null;
  onCategorySelect: (categoryId: string) => void;
  filteredProducts: ProductModel[];
  onProductSelect: (product: ProductModel) => void;
  loadingMore: boolean;
  onScroll: (event: any) => void;
}

export interface CartItemProps {
  item: CartItem;
  onUpdateQuantity: (productId: string, qty: number) => void;
  onRemove: (productId: string) => void;
}

export interface RecentSalesPanelProps {
  sales: RecentSale[];
  loading: boolean;
  onSelectSale: (saleId: string) => void;
}