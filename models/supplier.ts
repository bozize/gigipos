import { Model } from '@nozbe/watermelondb';
import { field, date, children } from '@nozbe/watermelondb/decorators';
import Product from './product';
import PurchaseProduct from './purchase';


export default class Supplier extends Model {
  static table = 'suppliers';

  static associations = {
    products: { type: 'has_many' as const, foreignKey: 'supplier_id' },
  };

  @field('name') name!: string;
  @field('contact_info') contactInfo!: string;
  @date('date_added') dateAdded!: Date;
  @date('date_updated') dateUpdated!: Date;

  @children('purchase_products') purchaseProducts!: PurchaseProduct[];
  
  @children('products') suppliedProducts!: Product[];
}

