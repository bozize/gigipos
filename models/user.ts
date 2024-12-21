import { Model } from '@nozbe/watermelondb';
import { field, date } from '@nozbe/watermelondb/decorators';
import bcrypt from 'bcryptjs';

export default class User extends Model {
  static table = 'users';

  @field('username') username!: string;
  @field('email') email!: string;
  @field('password') password!: string;
  @field('role') role!: string;
  @field('pin') pin!: string; // Encrypted 4-digit PIN
  @date('date_added') dateAdded!: Date;
  @date('date_updated') dateUpdated!: Date;

  async setPassword(rawPassword: string) {
    this.update(() => {
      this.password = bcrypt.hashSync(rawPassword, 10);
    });
  }

  async setPin(rawPin: string) {
    if (rawPin.length !== 4 || !/^\d+$/.test(rawPin)) {
      throw new Error('PIN must be a 4-digit number');
    }
    this.update(() => {
      this.pin = bcrypt.hashSync(rawPin, 10);
    });
  }

  async validatePin(rawPin: string) {
    return bcrypt.compareSync(rawPin, this.pin);
  }
}

