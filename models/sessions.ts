// models/session.ts
import { Model } from '@nozbe/watermelondb';
import { field, date } from '@nozbe/watermelondb/decorators';

export default class Session extends Model {
  static table = 'sessions'

  @field('user_id') userId!: string;
  @date('created_at') createdAt!: Date;
  @date('last_active') lastActive!: Date;
}