import { Model } from '@nozbe/watermelondb';
import { field, date, relation } from '@nozbe/watermelondb/decorators';
import Product from './product';

export default class InventoryTransaction extends Model {
  static table = 'inventory_transactions';

  @relation('products', 'product_id') product!: Product;
  @field('change_quantity') changeQuantity!: number;
  @field('previous_quantity') previousQuantity!: number;
  @field('new_quantity') newQuantity!: number;
  @date('change_date') changeDate!: Date;
}
