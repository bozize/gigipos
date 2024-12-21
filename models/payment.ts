import { Model } from '@nozbe/watermelondb';
import { field, date, children, relation } from '@nozbe/watermelondb/decorators';
import bcrypt from 'bcryptjs'; // For password hashing in User model
import Sale  from './sale';



export default class Payment extends Model {
    static table = 'payments';
  
    @relation('sales', 'sale_id') sale!: Sale;
    @field('method') method!: string;
    @field('amount') amount!: number;
    @date('date') date!: Date;
  }
  