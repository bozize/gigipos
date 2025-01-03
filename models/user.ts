import { Model } from '@nozbe/watermelondb';
import { field, date } from '@nozbe/watermelondb/decorators';
import * as Crypto from 'expo-crypto';

export default class User extends Model {
  static table = 'users';

  @field('username') username!: string;
  @field('email') email!: string;
  @field('password') password!: string;
  @field('role') role!: 'admin' | 'manager' | 'cashier';
  @field('pin') pin!: string;
  @field('pin_hash') pinHash!: string;
  @date('date_added') dateAdded!: Date;
  @date('date_updated') dateUpdated!: Date;

  async setPassword(rawPassword: string) {
    const hashedPassword = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      rawPassword
    );
    await this.update(() => {
      this.password = hashedPassword;
    });
  }

  async validatePassword(rawPassword: string) {
    const hashedPassword = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      rawPassword
    );
    return this.password === hashedPassword;
  }

  async setPin(rawPin: string) {
    if (rawPin.length !== 4 || !/^\d+$/.test(rawPin)) {
      throw new Error('PIN must be a 4-digit number');
    }
    const hashedPin = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      rawPin
    );
    await this.update(() => {
      this.pin = rawPin;        
      this.pinHash = hashedPin; 
    });
  }

  async validatePin(rawPin: string) {
    const hashedPin = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      rawPin
    );
    return this.pinHash === hashedPin; 
  }

  async hasPermission(permission: string): Promise<boolean> {
    const rolePermissions: { admin: string[]; manager: string[]; cashier: string[] } = {
      admin: ['manage_users', 'reset_pin', 'view_reports', 'make_sales'],
      manager: ['view_reports', 'make_sales'],
      cashier: ['make_sales'],
    };
  
    const permissions = rolePermissions[this.role] || [];
    return permissions.includes(permission);
  }

  async resetPin(newPin: string) {
    if (this.role !== 'admin') {
      throw new Error('Only Admins can reset PINs');
    }

    if (newPin.length !== 4 || !/^\d+$/.test(newPin)) {
      throw new Error('PIN must be a 4-digit number');
    }

    const hashedPin = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      newPin
    );

    await this.update(() => {
      this.pin = newPin;        
      this.pinHash = hashedPin; 
    });
  }
}


