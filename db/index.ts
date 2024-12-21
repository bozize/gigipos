import { Platform } from 'react-native';
import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import schema from './schema';
import migrations from './migrations';
import * as Crypto from 'expo-crypto';
import { setGenerator } from '@nozbe/watermelondb/utils/common/randomId';

import User from '../models/user';
import Category from '../models/category';
import Product from '../models/product';
import InventoryTransaction from '../models/transaction';
import Supplier from '../models/supplier';
import PurchaseProduct from '../models/purchase';
import Sale from '../models/sale';
import Payment from '../models/payment';
import SaleItem from '../models/item';
import ReturnProduct from '../models/return';
import Expense from '../models/expense';

// Set custom UUID generator
setGenerator(() => Crypto.randomUUID());

// Initialize SQLite Adapter
const adapter = new SQLiteAdapter({
  schema,
  jsi: true,
  onSetUpError: (error) => {
    console.error('Database setup error:', error);
  },
});

// Initialize the Database
const database = new Database({
  adapter,
  modelClasses: [
    User,
    Category,
    Product,
    InventoryTransaction,
    Supplier,
    PurchaseProduct,
    Sale,
    Payment,
    SaleItem,
    ReturnProduct,
    Expense,
  ],
});

export default database;

// Collection exports for querying
export const usersCollection = database.get<User>('users');
export const categoriesCollection = database.get<Category>('categories');
export const productsCollection = database.get<Product>('products');
export const inventoryTransactionsCollection =
  database.get<InventoryTransaction>('inventory_transactions');
export const suppliersCollection = database.get<Supplier>('suppliers');
export const purchaseProductsCollection =
  database.get<PurchaseProduct>('purchase_products');
export const salesCollection = database.get<Sale>('sales');
export const paymentsCollection = database.get<Payment>('payments');
export const salesItemsCollection = database.get<SaleItem>('sales_items');
export const ReturnProductCollection = database.get<ReturnProduct>('returns_products');
export const ExpenseCollection = database.get<Expense>('expense');
