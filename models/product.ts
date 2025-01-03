import { Model, Q } from '@nozbe/watermelondb';
import { field, date, relation, children, writer, lazy, readonly } from '@nozbe/watermelondb/decorators';
import { nanoid } from 'nanoid'; // Replaced 'shortid' with 'nanoid'
import Category from './category';
import PurchaseProduct from './purchase';

export default class Product extends Model {
  static table = 'products';

  static associations = {
    categories: { type: 'belongs_to' as const, key: 'category_id' },
    inventory_transactions: { type: 'has_many' as const, foreignKey: 'product_id' },
    sales_items: { type: 'has_many' as const, foreignKey: 'product_id' },
    return_products: { type: 'has_many' as const, foreignKey: 'product_id' },
  };

  @field('code') code!: string;
  @field('name') name!: string;
  @field('description') description!: string;
  @field('price') price!: number;
  @field('cost') cost!: number;
  @field('tax_rate') taxRate!: number;
  @field('base_quantity') baseQuantity!: number;
  @field('conversion_factor') conversionFactor!: number;
  @field('default_unit') defaultUnit!: string;
  @field('base_unit') baseUnit!: string;
  @date('date_added') dateAdded!: number;
  @date('date_updated') dateUpdated!: number;

  @relation('categories', 'category_id') category!: Category;

  @children('inventory_transactions') inventoryTransactions!: Model[];
  @children('sales_items') saleItems!: Model[];
  @children('return_products') returnProducts!: Model[];
  @children('purchase_products') purchaseProducts!: PurchaseProduct[];


  

 
  

  
  async updateQuantity(changeAmount: number, reference: string) {
    const newQuantity = this.baseQuantity + changeAmount;

    if (newQuantity < 0) {
      throw new Error('Insufficient inventory');
    }

    // Create inventory transaction
    await this.collections.get('inventory_transactions').create(transaction => {
      (transaction as any)._raw.product_id = this.id;
      (transaction as any).changeQuantity = changeAmount;
      (transaction as any).previousQuantity = this.baseQuantity;
      (transaction as any).newQuantity = newQuantity;
      (transaction as any).changeDate = Date.now();
      (transaction as any).referenceId = reference;
    });

    
    await this.update(product => {
      product.baseQuantity = newQuantity;
      product.dateUpdated = Date.now();
    });

    
    
  }

  // Validation
  async validate() {
    if (!this.name) throw new Error('Product name is required');
    if (!this.description) throw new Error('Product description is required');
    if (this.price <= 0) throw new Error('Price must be greater than 0');
    if (this.cost <= 0) throw new Error('Cost must be greater than 0');
    if (this.baseQuantity < 0) throw new Error('Quantity cannot be negative');
  }

  
  static generateProductCode(name: string): string {
    const prefix = name.substring(0, 3).toUpperCase();
    const unique = nanoid(6).toUpperCase();
    return `${prefix}-${unique}`;
  }

  
  async save() {
    await this.validate();
    if (!this.code) {
      this.code = Product.generateProductCode(this.name);
    }
    await this.update(product => {
      product.code = this.code;
      product.dateUpdated = Date.now();
    });
  }
}