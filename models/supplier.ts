import { Model } from '@nozbe/watermelondb';
import { field, date, children, relation } from '@nozbe/watermelondb/decorators';
import bcrypt from 'bcryptjs'; // For password hashing in User model
import PurchaseProduct from './purchase';



export default class Supplier extends Model {
    static table = 'suppliers';
  
    @field('name') name!: string;
    @field('contact_info') contactInfo!: string;
    @date('date_added') dateAdded!: Date;
    @date('date_updated') dateUpdated!: Date;
  
    @children('purchase_products') purchaseProducts!: PurchaseProduct[];
  }