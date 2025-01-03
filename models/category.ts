import { Model, Q } from '@nozbe/watermelondb';
import { field, date, children, writer, lazy } from '@nozbe/watermelondb/decorators';
import Product from './product';

export default class Category extends Model {
  static table = 'categories';

  static associations = {
    products: { type: 'has_many' as const, foreignKey: 'category_id' },
  };

  @field('name') name!: string;
  @field('slug') slug!: string;
  @field('description') description!: string;
  @field('status') status!: boolean;
  @date('date_added') dateAdded!: Date;
  @date('date_updated') dateUpdated!: Date;

  @children('products') products!: Product[];

  
  @lazy
  activeProductsCount = this.collections
    .get('products')
    .query(Q.where('status', true))
    .observeCount();

  @lazy
  totalProducts = this.collections
    .get('products')
    .query()
    .observeCount();

  
@writer async updateStatus() {
  // First get the count outside the write operation
  const productsCollection = this.collections.get('products');
  const hasActiveProducts = await productsCollection
    .query(Q.where('category_id', this.id), Q.where('status', true))
    .fetchCount();

 
  await this.update(category => {
    category.status = hasActiveProducts > 0;
    category.dateUpdated = new Date();
  });
}

  
  async validate() {
    if (!this.name) {
      throw new Error('Category name is required');
    }
    if (this.name.length < 2) {
      throw new Error('Category name must be at least 2 characters');
    }
  }

  
  @writer async save() {
    await this.validate();
    if (!this.slug) {
      this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }
    await this.update(category => {
      category.name = this.name;
      category.slug = this.slug;
      category.dateUpdated = new Date();
    });
  }
}


