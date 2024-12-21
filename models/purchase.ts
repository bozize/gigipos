import { Model } from '@nozbe/watermelondb';
import { field, date, relation } from '@nozbe/watermelondb/decorators';
import Product from './product';
import Supplier from './supplier';

export default class PurchaseProduct extends Model {
  static table = 'purchase_products';

  @relation('suppliers', 'supplier_id') supplier!: Supplier;
  @relation('products', 'product_id') product!: Product;

  @field('cost') cost!: number;
  @field('qty') qty!: number;
  @field('tax_rate') taxRate!: number;
  @field('total') total!: number;
  @date('date_added') dateAdded!: Date;
  @date('date_updated') dateUpdated!: Date;
  @field('base_quantity') baseQuantity!: number; // Derived from qty * conversion_factor
  @field('conversion_factor') conversionFactor!: number;
  @field('default_unit') defaultUnit!: string;
  @field('base_unit') baseUnit!: string;
}


