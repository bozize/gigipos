// app/_layout.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Link, Slot, usePathname } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { DatabaseProvider } from '@nozbe/watermelondb/DatabaseProvider';
import { PaperProvider } from 'react-native-paper';
import database from '../db/index';
import { AuthProvider } from './context/auth';
import * as Crypto from 'expo-crypto';
import { Q } from '@nozbe/watermelondb';
import User from '../models/user';

// Cache structures
export const PIN_HASHES = new Map<string, string>();
export const USERS_BY_PIN_HASH = new Map<string, {
  id: string;
  pinHash: string;
  hasSalesPermission: boolean;
}>();

// Initialize cache function
const initializeCache = async () => {
  console.time('cache-init');
  
  // Precompute all possible 4-digit PIN hashes (0000-9999)
  const pins = Array.from({ length: 10000 }, (_, i) => 
    i.toString().padStart(4, '0')
  );
  
  // Process PINs in batches
  const batchSize = 100;
  for (let i = 0; i < pins.length; i += batchSize) {
    const batch = pins.slice(i, i + batchSize);
    await Promise.all(
      batch.map(async (pin) => {
        const hash = await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.SHA256,
          pin
        );
        PIN_HASHES.set(pin, hash);
      })
    );
  }

  // Preload all users and their permissions
  const usersCollection = database.get<User>('users');
  const users = await usersCollection
    .query(Q.where('role', 'cashier'))
    .fetch();

  // Process users in parallel
  await Promise.all(
    users.map(async (user) => {
      const hasSalesPermission = await user.hasPermission('make_sales');
      USERS_BY_PIN_HASH.set(user.pinHash, {
        id: user.id,
        pinHash: user.pinHash,
        hasSalesPermission,
      });
    })
  );

  console.timeEnd('cache-init');
};

type MaterialIconName = keyof typeof MaterialIcons.glyphMap;

type NavRoute = '/pos' | '/inventory' | '/reports' | '/expenses' | '/users';

type NavItem = {
  path: NavRoute;
  label: string;
  iconName: MaterialIconName;
  IconComponent: typeof MaterialIcons;
}

interface NavIconProps extends NavItem {
  isActive: boolean;
}

const MainLayout = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const pathname = usePathname();

  // Initialize cache when component mounts
  useEffect(() => {
    initializeCache()
      .then(() => setIsInitialized(true))
      .catch(error => {
        console.error('Failed to initialize cache:', error);
        setIsInitialized(true); // Still set ready even on error
      });
  }, []);

  const navItems: NavItem[] = [
    {
      path: '/pos',
      label: 'POS',
      iconName: 'point-of-sale',
      IconComponent: MaterialIcons,
    },
    {
      path: '/inventory',
      label: 'Stock',
      iconName: 'inventory',
      IconComponent: MaterialIcons,
    },
    {
      path: '/reports',
      label: 'Reports',
      iconName: 'bar-chart',
      IconComponent: MaterialIcons,
    },
    {
      path: '/expenses',
      label: 'Expense',
      iconName: 'receipt-long',
      IconComponent: MaterialIcons,
    },
    
    {
      path: '/users',
      label: 'Users',
      iconName: 'people',
      IconComponent: MaterialIcons,
    },
  ];

  const NavIcon: React.FC<NavIconProps> = ({
    path,
    iconName,
    label,
    IconComponent,
    isActive,
  }) => (
    <Link href={path} asChild>
      <Pressable style={styles.sidebarItem}>
        <IconComponent
          name={iconName}
          size={24}
          color={isActive ? '#000080' : '#666'}
          style={styles.icon}
        />
        <Text style={[styles.sidebarItemText, isActive && styles.activeText]}>
          {label}
        </Text>
      </Pressable>
    </Link>
  );

  if (!isInitialized) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text>Initializing...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.sidebar}>
        {navItems.map((item) => (
          <NavIcon
            key={item.path}
            {...item}
            isActive={pathname.startsWith(item.path)}
          />
        ))}
      </View>
      <View style={styles.content}>
        <Slot />
      </View>
    </View>
  );
};

// Root Layout with Providers
const RootLayout = () => {
  return (
    <DatabaseProvider database={database}>
      <PaperProvider>
        <AuthProvider>
          <MainLayout />
        </AuthProvider>
      </PaperProvider>
    </DatabaseProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
  },
  sidebar: {
    width: 80,
    backgroundColor: '#FFFFFF',
    paddingTop: 20,
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  sidebarItem: {
    alignItems: 'center',
    paddingVertical: 12,
    width: '100%',
  },
  icon: {
    marginBottom: 4,
  },
  sidebarItemText: {
    color: '#666',
    fontSize: 12,
  },
  activeText: {
    color: '#000080',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default RootLayout;