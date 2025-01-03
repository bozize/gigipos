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
import SaleItem from '../models/item';
import Expense from '../models/expense';


setGenerator(() => Crypto.randomUUID());


const adapter = new SQLiteAdapter({
  schema,
  // @ts-ignore - These are valid options but TypeScript definitions might be outdated
  jsi: true,
  // @ts-ignore
  experimentalFeatures: {
    queriesObserveExperimental: true,
    sanitizeSql: true,
  },
  onSetUpError: (error) => {
    console.error('Database setup error:', error);
  },
});


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
    SaleItem,
    Expense,
  ],
});

export default database;


export const usersCollection = database.get<User>('users');
export const categoriesCollection = database.get<Category>('categories');
export const productsCollection = database.get<Product>('products');
export const inventoryTransactionsCollection = 
  database.get<InventoryTransaction>('inventory_transactions');
export const suppliersCollection = database.get<Supplier>('suppliers');
export const purchaseProductsCollection = 
  database.get<PurchaseProduct>('purchase_products');
export const salesCollection = database.get<Sale>('sales');
export const salesItemsCollection = database.get<SaleItem>('sales_items');
export const expenseCollection = database.get<Expense>('expense');