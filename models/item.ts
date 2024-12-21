import { Model } from '@nozbe/watermelondb';
import { field, relation } from '@nozbe/watermelondb/decorators';
import Product from './product';
import Sale from './sale';

export default class SaleItem extends Model {
  static table = 'sales_items';

  @relation('sales', 'sale_id') sale!: Sale;
  @relation('products', 'product_id') product!: Product;
  @field('price') price!: number;
  @field('qty') qty!: number;
  @field('discount') discount!: number;
  @field('total') total!: number;
  @field('unit_type') unitType!: string; // Tracks unit type (default or base)
}
