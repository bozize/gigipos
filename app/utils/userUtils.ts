// utils/userUtils.ts
import database from '../../db/index';
import { Q } from '@nozbe/watermelondb';
import * as Crypto from 'expo-crypto';
import type User from '../../models/user';

export async function isPinUnique(pin: string, excludeUserId?: string): Promise<boolean> {
  try {
    const hashedPin = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      pin
    );
    
    const existingUsers = await database.get<User>('users')
      .query(
        Q.and(
          Q.where('role', 'cashier'),
          Q.where('pin', hashedPin),
          excludeUserId ? Q.where('id', Q.notEq(excludeUserId)) : Q.where('id', Q.notEq(''))
        )
      )
      .fetch();

    return existingUsers.length === 0;
  } catch (error) {
    console.error('Error checking PIN uniqueness:', error);
    throw new Error('PIN uniqueness validation failed.');
  }
}