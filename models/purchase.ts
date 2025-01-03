import { Model } from '@nozbe/watermelondb';
import { field, date, relation, writer } from '@nozbe/watermelondb/decorators';
import Product from './product';
import Supplier from './supplier';

export default class PurchaseProduct extends Model {
  static table = 'purchase_products';

  static associations = {
    products: { type: 'belongs_to' as const, key: 'product_id' },
    suppliers: { type: 'belongs_to' as const, key: 'supplier_id' },
  };

  @relation('suppliers', 'supplier_id') supplier!: Supplier;
  @relation('products', 'product_id') product!: Product;

  @field('cost') cost!: number;
  @field('qty') qty!: number;
  @field('tax_rate') taxRate!: number;
  @field('total') total!: number;
  @field('base_quantity') baseQuantity!: number;
  @date('date_added') dateAdded!: Date;
  @date('date_updated') dateUpdated!: Date;

  
  async validate() {
    if (this.qty <= 0) throw new Error('Quantity must be greater than 0');
    if (this.cost <= 0) throw new Error('Cost must be greater than 0');
    if (this.taxRate < 0) throw new Error('Tax rate cannot be negative');
  }

  // Regular methods without @writer decorator
  async save() {
    await this.validate();
    await this.update(purchase => {
      purchase.dateUpdated = new Date();
    });
  }
}



