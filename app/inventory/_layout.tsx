// app/inventory/_layout.tsx
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Link, Slot, usePathname } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

type RouteType = {
  path: string;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}

const routes: RouteType[] = [
  { 
    path: '/inventory',
    label: 'Overview', 
    icon: 'dashboard' 
  },
  { 
    path: '/inventory/categories',
    label: 'Categories', 
    icon: 'category' 
  },
  { 
    path: '/inventory/products', 
    label: 'Products', 
    icon: 'inventory-2' 
  },
  { 
    path: '/inventory/purchases', 
    label: 'Purchases', 
    icon: 'shopping-cart' 
  },
  { 
    path: '/inventory/sales', 
    label: 'Sales', 
    icon: 'receipt' 
  },
];

const InventoryLayout = () => {
  const pathname = usePathname();

  // Check if the current path is a sales detail page
  const isActive = (path: string) => {
    if (path === '/inventory/sales') {
      // Return true for both /inventory/sales and /inventory/sales/[id]
      return pathname === path || pathname.startsWith('/inventory/sales/');
    }
    return pathname === path;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {routes.map((route) => (
          <Link 
            key={route.path}
            href={route.path as any}
            asChild
          >
            <Pressable 
              style={[
                styles.headerItem,
                isActive(route.path) && styles.activeHeaderItem
              ]}
            >
              <MaterialIcons 
                name={route.icon} 
                size={20} 
                color={isActive(route.path) ? '#000080' : '#666666'} 
              />
              <Text style={[
                styles.headerItemText,
                isActive(route.path) && styles.activeHeaderItemText
              ]}>
                {route.label}
              </Text>
            </Pressable>
          </Link>
        ))}
      </View>
      <View style={styles.content}>
        <Slot />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 10,
  },
  headerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 4,
  },
  activeHeaderItem: {
    backgroundColor: '#F0F9FF',
  },
  headerItemText: {
    color: '#666666',
    fontSize: 16,
    marginLeft: 8,
  },
  activeHeaderItemText: {
    color: '#000080',
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
});

export default InventoryLayout;
