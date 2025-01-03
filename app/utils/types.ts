export const AUTH_ROLES = {
    ADMIN: 'admin',
    MANAGER: 'manager',
    CASHIER: 'cashier',
  } as const;
  
  export type Role = typeof AUTH_ROLES[keyof typeof AUTH_ROLES];
  
  export const PERMISSIONS = {
    MANAGE_USERS: 'manage_users',
    RESET_PIN: 'reset_pin',
    VIEW_REPORTS: 'view_reports',
    MAKE_SALES: 'make_sales',
    MANAGE_INVENTORY: 'manage_inventory',
    MANAGE_SUPPLIERS: 'manage_suppliers',
  } as const;
  
  export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];
  
  export interface User {
    id: string;
    username: string;
    email: string;
    role: Role;
    password: string;
    pin?: string;
    dateAdded: Date;
    dateUpdated: Date;
  }