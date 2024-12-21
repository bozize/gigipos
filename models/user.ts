import { Model } from '@nozbe/watermelondb';
import { field, date } from '@nozbe/watermelondb/decorators';
import bcrypt from 'bcryptjs';

export default class User extends Model {
  static table = 'users';

  @field('username') username!: string;
  @field('email') email!: string;
  @field('password') password!: string;
  @field('role') role!: string;
  @date('date_added') dateAdded!: Date;
  @date('date_updated') dateUpdated!: Date;

  async setPassword(rawPassword: string) {
    this.update(() => {
      this.password = bcrypt.hashSync(rawPassword, 10);
    });
  }
}

