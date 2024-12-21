import { Model } from '@nozbe/watermelondb';
import { field, date, relation } from '@nozbe/watermelondb/decorators';
import Sale from './sale';

export default class Payment extends Model {
  static table = 'payments';

  @relation('sales', 'sale_id') sale!: Sale;
  @field('method') method!: string;
  @field('amount') amount!: number;
  @date('date') date!: Date;
}
