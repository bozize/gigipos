import { Model } from '@nozbe/watermelondb';
import { field, date, relation } from '@nozbe/watermelondb/decorators';
import Product from './product';
import Supplier from './supplier';

export default class ReturnProduct extends Model {
  static table = 'return_products';

  @relation('products', 'product_id') product!: Product;
  @relation('suppliers', 'supplier_id') supplier!: Supplier;
  @field('qty') qty!: number;
  @date('return_date') returnDate!: Date;
  @field('reason') reason!: string;
  @date('date_added') dateAdded!: Date;
  @date('date_updated') dateUpdated!: Date;
}
