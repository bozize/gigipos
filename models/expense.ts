import { Model } from '@nozbe/watermelondb';
import { field, date, relation } from '@nozbe/watermelondb/decorators';
import User from './user';

export default class Expense extends Model {
  static table = 'expenses';

  @field('amount') amount!: number;
  @field('purpose') purpose!: string;
  @relation('users', 'created_by') createdBy!: User;
  @date('date_added') dateAdded!: Date;
}
