import { Model } from '@nozbe/watermelondb';
import { field, date, children } from '@nozbe/watermelondb/decorators';
import PurchaseProduct from './purchase';
import ReturnProduct from './return';

export default class Supplier extends Model {
  static table = 'suppliers';

  @field('name') name!: string;
  @field('contact_info') contactInfo!: string;
  @date('date_added') dateAdded!: Date;
  @date('date_updated') dateUpdated!: Date;

  @children('purchase_products') purchaseProducts!: PurchaseProduct[];
  @children('return_products') returnProducts!: ReturnProduct[];
}
