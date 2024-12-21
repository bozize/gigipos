import { appSchema, tableSchema } from '@nozbe/watermelondb';

const schemas = appSchema({
  version: 2, // Incremented version for migration purposes
  tables: [
    tableSchema({
      name: 'categories',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'slug', type: 'string', isOptional: true },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'status', type: 'number' }, // Use enums for clearer status codes
        { name: 'date_added', type: 'number' },
        { name: 'date_updated', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'products',
      columns: [
        { name: 'code', type: 'string', isIndexed: true }, // Added index for better search performance
        { name: 'category_id', type: 'string', isIndexed: true }, // Index foreign key
        { name: 'name', type: 'string' },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'price', type: 'number' },
        { name: 'cost', type: 'number' },
        { name: 'status', type: 'number' },
        { name: 'tax_rate', type: 'number' },
        { name: 'date_added', type: 'number' },
        { name: 'date_updated', type: 'number' },
        { name: 'quantity', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'inventory_transactions',
      columns: [
        { name: 'product_id', type: 'string', isIndexed: true }, // Index foreign key
        { name: 'change_quantity', type: 'number' },
        { name: 'previous_quantity', type: 'number' },
        { name: 'new_quantity', type: 'number' },
        { name: 'change_date', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'suppliers',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'contact_info', type: 'string', isOptional: true },
        { name: 'date_added', type: 'number' },
        { name: 'date_updated', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'purchase_products',
      columns: [
        { name: 'supplier_id', type: 'string', isIndexed: true }, // Optional foreign key with index
        { name: 'product_id', type: 'string', isIndexed: true }, // Optional foreign key with index
        { name: 'cost', type: 'number' },
        { name: 'qty', type: 'number' },
        { name: 'tax_rate', type: 'number' },
        { name: 'total', type: 'number' },
        { name: 'date_added', type: 'number' },
        { name: 'date_updated', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'sales',
      columns: [
        { name: 'code', type: 'string', isIndexed: true },
        { name: 'sub_total', type: 'number' },
        { name: 'grand_total', type: 'number' },
        { name: 'tax_amount', type: 'number' },
        { name: 'tendered_amount', type: 'number' },
        { name: 'amount_change', type: 'number' },
        { name: 'balance_due', type: 'number' },
        { name: 'is_credit', type: 'boolean' },
        { name: 'customer_phone', type: 'string', isOptional: true },
        { name: 'date_added', type: 'number' },
        { name: 'date_updated', type: 'number' },
        { name: 'payment_method', type: 'string' },
        { name: 'cashier_id', type: 'string', isIndexed: true },
        { name: 'total_paid', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'payments',
      columns: [
        { name: 'sale_id', type: 'string', isIndexed: true },
        { name: 'method', type: 'string' },
        { name: 'amount', type: 'number' },
        { name: 'date', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'sales_items',
      columns: [
        { name: 'sale_id', type: 'string', isIndexed: true },
        { name: 'product_id', type: 'string', isIndexed: true },
        { name: 'price', type: 'number' },
        { name: 'qty', type: 'number' },
        { name: 'discount', type: 'number' },
        { name: 'total', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'users',
      columns: [
        { name: 'username', type: 'string', isIndexed: true },
        { name: 'email', type: 'string', isIndexed: true },
        { name: 'password', type: 'string' }, // Ensure encryption in the application layer
        { name: 'role', type: 'string' }, // Consider using enums for roles
        { name: 'date_added', type: 'number' },
        { name: 'date_updated', type: 'number' },
      ],
    }),
  ],
});

export default schemas;