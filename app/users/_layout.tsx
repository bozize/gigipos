import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Link, Stack, router } from 'expo-router';

const UsersLayout = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Link href="/users" style={styles.headerItem}>
          <Text style={styles.headerItemText}>Users List</Text>
        </Link>
        <Link href="/users/add" style={styles.headerItem}>
          <Text style={styles.headerItemText}>Add User</Text>
        </Link>
      </View>
      <View style={styles.content}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#FFFFFF' },
            // Change presentation mode for Android compatibility
            presentation: Platform.OS === 'ios' ? 'modal' : 'card',
            // Use simple animation for Android
            animation: Platform.OS === 'android' ? 'slide_from_right' : undefined
          }}
        >
          <Stack.Screen 
            name="index"
          />
          <Stack.Screen 
            name="add"
            options={{ 
              headerShown: true,
              title: 'Add User',
              // Remove modal presentation for Android
              presentation: Platform.OS === 'ios' ? 'modal' : 'card'
            }} 
          />
          <Stack.Screen 
            name="edit"
            options={{ 
              headerShown: true,
              title: 'Edit User',
              // Remove modal presentation for Android
              presentation: Platform.OS === 'ios' ? 'modal' : 'card'
            }} 
          />
        </Stack>
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
    borderBottomColor: '#000000',
    paddingVertical: 10,
  },
  headerItem: {
    marginRight: 15,
    paddingHorizontal: 10,
  },
  headerItemText: {
    color: '#000000',
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 20,
  },
});

export default UsersLayout;