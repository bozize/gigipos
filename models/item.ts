import { Model } from '@nozbe/watermelondb';
import { field, relation } from '@nozbe/watermelondb/decorators';
import Product from './product';
import Sale from './sale';

export default class SaleItem extends Model {
  static table = 'sales_items';

  static associations = {
    sales: { type: 'belongs_to' as const, key: 'sale_id' },
    products: { type: 'belongs_to' as const, key: 'product_id' },
  };

  @relation('sales', 'sale_id') sale!: Sale;
  @relation('products', 'product_id') product!: Product;
  @field('price') price!: number;
  @field('qty') qty!: number;
  @field('unit_type') unitType!: string;
  @field('tax_amount') taxAmount!: number;
  @field('total_amount') totalAmount!: number;
}


