import { Model } from '@nozbe/watermelondb';
import { field, date, children } from '@nozbe/watermelondb/decorators';
import Product from './product';

export default class Category extends Model {
  static table = 'categories';

  @field('name') name!: string;
  @field('slug') slug!: string;
  @field('description') description!: string;
  @field('status') status!: number;
  @date('date_added') dateAdded!: Date;
  @date('date_updated') dateUpdated!: Date;

  @children('products') products!: Product[];
}
