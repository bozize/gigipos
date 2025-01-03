
import database from '../../db/index';
import type User from '../../models/user';
import { Q } from '@nozbe/watermelondb';
// Constants
export const AUTH_ROLES = {
    ADMIN: 'admin',
    MANAGER: 'manager',
    CASHIER: 'cashier'
  } as const;
  
  export const PERMISSIONS = {
    MANAGE_USERS: 'manage_users',
    RESET_PIN: 'reset_pin',
    VIEW_REPORTS: 'view_reports',
    MAKE_SALES: 'make_sales',
    MANAGE_INVENTORY: 'manage_inventory',
    MANAGE_SUPPLIERS: 'manage_suppliers'
  } as const;
  
  export const ROLE_PERMISSIONS: Record<string, string[]> = {
    [AUTH_ROLES.ADMIN]: Object.values(PERMISSIONS),
    [AUTH_ROLES.MANAGER]: [
      PERMISSIONS.VIEW_REPORTS,
      PERMISSIONS.MAKE_SALES,
      PERMISSIONS.MANAGE_INVENTORY
    ],
    [AUTH_ROLES.CASHIER]: [PERMISSIONS.MAKE_SALES]
  };
  
  // Types
  export type Role = typeof AUTH_ROLES[keyof typeof AUTH_ROLES];
  export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];
  
  export const authUtils = {
    // Check if user has specific permission
    hasPermission: async (userId: string, permission: Permission): Promise<boolean> => {
      try {
        const user = await database.get<User>('users').find(userId);
        return user ? user.hasPermission(permission) : false;
      } catch (error) {
        console.error('Error checking permission:', error);
        return false;
      }
    },
  
    // Get user by ID
    getUserById: async (userId: string): Promise<User | null> => {
      try {
        return await database.get<User>('users').find(userId);
      } catch (error) {
        console.error('Error getting user:', error);
        return null;
      }
    }
  };
  
  // Route/Screen permissions mapping
  export const SCREEN_PERMISSIONS: Record<string, Permission> = {
    'Users': PERMISSIONS.MANAGE_USERS,
    'Inventory': PERMISSIONS.MANAGE_INVENTORY,
    'Reports': PERMISSIONS.VIEW_REPORTS,
    'POS': PERMISSIONS.MAKE_SALES,
  };
  
  // Hook to check screen access
  export const useScreenAccess = (screenName: keyof typeof SCREEN_PERMISSIONS) => {
    const checkAccess = async (userId: string): Promise<boolean> => {
      const permission = SCREEN_PERMISSIONS[screenName];
      if (!permission) return true; // No permission required
      return await authUtils.hasPermission(userId, permission);
    };
  
    return { checkAccess };
  };
  
