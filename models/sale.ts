import { Model } from '@nozbe/watermelondb';
import { field, date, children, relation } from '@nozbe/watermelondb/decorators';
import { Collection } from '@nozbe/watermelondb';
import { Associations } from '@nozbe/watermelondb/Model';
import User from './user';
import SaleItem from './item';

export default class Sale extends Model {
  static table = 'sales';

  static associations: Associations = {
    sales_items: { type: 'has_many', foreignKey: 'sale_id' },
    users: { type: 'belongs_to', key: 'cashier_id' },
  };

  @field('code') code!: string;
  @field('sub_total') subTotal!: number;
  @field('grand_total') grandTotal!: number;
  @field('total_tax') totalTax!: number;
  @field('discount') discount!: number;
  @field('balance_due') balanceDue!: number;
  @field('is_credit') isCredit!: boolean;
  @field('customer') customerName!: string;
  @field('payment_method') paymentMethod!: string;
  @field('total_paid') totalPaid!: number;
  @date('date_added') dateAdded!: Date;
  @date('date_updated') dateUpdated!: Date;

  @relation('users', 'cashier_id') cashier!: User;
  @children('sales_items') saleItems!: Collection<SaleItem>;
  
}


