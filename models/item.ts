import { Model } from '@nozbe/watermelondb';
import { field, date, children, relation } from '@nozbe/watermelondb/decorators';
import bcrypt from 'bcryptjs'; // For password hashing in User model
import Sale  from './sale';
import Product  from './product';


export default class SaleItem extends Model {
    static table = 'sales_items';
  
    @relation('sales', 'sale_id') sale!: Sale;
    @relation('products', 'product_id') product!: Product;
    @field('price') price!: number;
    @field('qty') qty!: number;
    @field('discount') discount!: number;
    @field('total') total!: number;
  }
  