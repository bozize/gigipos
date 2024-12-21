import { Model } from '@nozbe/watermelondb';
import { field, date, relation, children } from '@nozbe/watermelondb/decorators';
import Category from './category';
import InventoryTransaction from './transaction';
import ReturnProduct from './return';
import SaleItem from './item';

export default class Product extends Model {
  static table = 'products';

  @field('code') code!: string;
  @relation('categories', 'category_id') category!: Category;
  @field('name') name!: string;
  @field('description') description!: string;
  @field('price') price!: number;
  @field('cost') cost!: number;
  @field('status') status!: number;
  @field('tax_rate') taxRate!: number;
  @date('date_added') dateAdded!: Date;
  @date('date_updated') dateUpdated!: Date;
  @field('quantity') quantity!: number;

  @children('inventory_transactions') inventoryTransactions!: InventoryTransaction[];
  @children('return_products') returnProducts!: ReturnProduct[];
  @children('sales_items') saleItems!: SaleItem[];
}




