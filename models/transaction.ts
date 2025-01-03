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

  async validate() {
    if (!this.product) throw new Error('Product is required for inventory transaction');
    if (this.changeQuantity === 0) throw new Error('Change quantity must not be zero');
    if (this.newQuantity < 0) throw new Error('New quantity cannot be negative');
  }

  async save() {
    await this.validate();
    await this.update(transaction => {
      transaction.changeDate = new Date();
    });
  }
}
