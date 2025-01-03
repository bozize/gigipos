// app/pos/_layout.tsx
import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, Pressable } from 'react-native';
import { Stack } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import { useAuth } from '../context/auth';

export default function PosLayout() {
  const { user, logout, isLoading } = useAuth();
  const pathname = usePathname();

  
  useEffect(() => {
    if (!isLoading && !user && pathname !== '/pos/login') {
      router.replace('/pos/login' as const);
    }
  }, [user, isLoading, pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/pos/login' as const);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleBackToPos = () => {
    router.push('/pos' as const);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000080" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#000080',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="login"
          options={{
            title: 'POS Login',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="index"
          options={{
            title: 'Point of Sale',
            headerRight: () => user && (
              <View style={styles.headerRight}>
                <Text style={styles.userInfo}>
                  {user.username} ({user.role})
                </Text>
                <Pressable
                  onPress={handleLogout}
                  style={({ pressed }) => [
                    styles.logoutButton,
                    pressed && styles.logoutButtonPressed,
                  ]}
                >
                  <MaterialIcons name="logout" size={24} color="#FFF" />
                </Pressable>
              </View>
            ),
          }}
        />
        <Stack.Screen
          name="print/index"
          options={{
            title: 'Receipt',
            headerLeft: () => (
              <Pressable
                onPress={handleBackToPos}
                style={({ pressed }) => [
                  styles.backButton,
                  pressed && styles.backButtonPressed,
                ]}
              >
                <MaterialIcons name="arrow-back" size={24} color="#FFF" />
              </Pressable>
            ),
          }}
        />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginRight: 10,
  },
  userInfo: {
    color: '#FFF',
    fontSize: 14,
  },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  logoutButtonPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  backButton: {
    padding: 8,
    marginLeft: 10,
    borderRadius: 8,
  },
  backButtonPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
});