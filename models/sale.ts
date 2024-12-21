import { Model } from '@nozbe/watermelondb';
import { field, date, children, relation } from '@nozbe/watermelondb/decorators';
import User from './user';
import SaleItem from './item';

export default class Sale extends Model {
  static table = 'sales';

  @field('code') code!: string;
  @field('sub_total') subTotal!: number;
  @field('grand_total') grandTotal!: number;
  @field('tax_amount') taxAmount!: number;
  @field('tendered_amount') tenderedAmount!: number;
  @field('amount_change') amountChange!: number;
  @field('balance_due') balanceDue!: number;
  @field('is_credit') isCredit!: boolean;
  @field('customer_phone') customerPhone!: string;
  @date('date_added') dateAdded!: Date;
  @date('date_updated') dateUpdated!: Date;
  @field('payment_method') paymentMethod!: string;
  @relation('users', 'cashier_id') cashier!: User;
  @field('total_paid') totalPaid!: number;

  @children('sales_items') saleItems!: SaleItem[];
}
