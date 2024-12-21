import { Model } from '@nozbe/watermelondb';
import { field, date, children, relation } from '@nozbe/watermelondb/decorators';
import bcrypt from 'bcryptjs'; // For password hashing in User model
import Category  from './category';



// Product model
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
}




