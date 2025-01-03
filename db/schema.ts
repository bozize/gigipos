import { appSchema, tableSchema } from '@nozbe/watermelondb';

const schemas = appSchema({
  version: 2,
  tables: [
    tableSchema({
      name: 'categories',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'slug', type: 'string', isOptional: true },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'status', type: 'number' },
        { name: 'date_added', type: 'number' },
        { name: 'date_updated', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'products',
      columns: [
        { name: 'code', type: 'string', isIndexed: true },
        { name: 'category_id', type: 'string', isIndexed: true },
        { name: 'name', type: 'string', isIndexed: true },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'price', type: 'number' },
        { name: 'cost', type: 'number' },
        
        { name: 'tax_rate', type: 'number' },
        { name: 'date_added', type: 'number', isIndexed: true },
        { name: 'date_updated', type: 'number' },
        { name: 'base_quantity', type: 'number' },
        { name: 'conversion_factor', type: 'number' },
        { name: 'default_unit', type: 'string', isOptional: true },
        { name: 'base_unit', type: 'string', isOptional: true },
      ],
    }),
    tableSchema({
      name: 'expenses',
      columns: [
       { name: 'amount', type: 'number' },
       { name: 'purpose', type: 'string' },
       { name: 'created_by', type: 'string', isIndexed: true },
       { name: 'date_added', type: 'number' },
       { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'inventory_transactions',
      columns: [
        { name: 'product_id', type: 'string', isIndexed: true },
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
        { name: 'supplier_id', type: 'string', isIndexed: true },
        { name: 'product_id', type: 'string', isIndexed: true },
        { name: 'cost', type: 'number' },
        { name: 'qty', type: 'number' },
        { name: 'tax_rate', type: 'number' },
        { name: 'total', type: 'number' },
        { name: 'date_added', type: 'number' },
        { name: 'date_updated', type: 'number' },
        { name: 'base_quantity', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'sessions',
      columns: [
        { name: 'user_id', type: 'string' },
        { name: 'created_at', type: 'number' },
        { name: 'last_active', type: 'number' },
      ]
    }),
    tableSchema({
      name: 'sales',
      columns: [
        { name: 'code', type: 'string', isIndexed: true },
        { name: 'sub_total', type: 'number' },
        { name: 'grand_total', type: 'number' },
        { name: 'total_tax', type: 'number' },
        { name: 'balance_due', type: 'number' },
        { name: 'discount', type: 'number' },
        { name: 'is_credit', type: 'boolean' },
        { name: 'customer', type: 'string', isOptional: true },
        { name: 'date_added', type: 'number' },
        { name: 'date_updated', type: 'number' },
        { name: 'payment_method', type: 'string' },
        { name: 'cashier_id', type: 'string', isIndexed: true },
        { name: 'total_paid', type: 'number' },
      ],
    }),
    
    
    tableSchema({
      name: 'sales_items',
      columns: [
        { name: 'sale_id', type: 'string', isIndexed: true },
        { name: 'product_id', type: 'string', isIndexed: true },
        { name: 'price', type: 'number' },
        { name: 'qty', type: 'number' },
        { name: 'unit_type', type: 'string' },
        { name: 'tax_amount', type: 'number' },
        { name: 'total_amount', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'users',
      columns: [
        { name: 'username', type: 'string', isIndexed: true },
        { name: 'email', type: 'string', isIndexed: true },
        { name: 'password', type: 'string' },
        { name: 'role', type: 'string', isIndexed: true },
        { name: 'pin_hash', type: 'string', isIndexed: true },
        { name: 'pin', type: 'string' },
        { name: 'date_added', type: 'number' },
        { name: 'date_updated', type: 'number' },
      ],
    }),
    
    
  ],
});

export default schemas;