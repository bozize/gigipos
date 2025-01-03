import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { withObservables } from '@nozbe/watermelondb/react';
import database from '../../db/index';
import type User from '../../models/user';
import { Feather } from '@expo/vector-icons';

function UsersList({ users }: { users: User[] }) {
  const router = useRouter();

  const handleDeleteUser = async (userId: string) => {
    Alert.alert(
      'Delete User',
      'Are you sure you want to delete this user?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await database.write(async () => {
                const user = await database.get<User>('users').find(userId);
                await user.markAsDeleted();
              });
            } catch (error) {
              Alert.alert('Error', 'Failed to delete user');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: User }) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <Text style={styles.username}>{item.username}</Text>
        <Text style={styles.email}>{item.email}</Text>
        <View style={[styles.badge, getRoleBadgeStyle(item.role)]}>
          <Text style={styles.roleText}>{item.role.toUpperCase()}</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity 
          onPress={() => router.push(`/users/${item.id}`)}
          style={styles.actionButton}
        >
          <Feather name="edit-2" size={20} color="#4B5563" />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => handleDeleteUser(item.id)}
          style={styles.actionButton}
        >
          <Feather name="trash-2" size={20} color="#DC2626" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'admin':
        return styles.adminBadge;
      case 'manager':
        return styles.managerBadge;
      default:
        return styles.cashierBadge;
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push('/users/add')}
      >
        <Feather name="plus" size={20} color="#FFFFFF" />
        <Text style={styles.addButtonText}>Add User</Text>
      </TouchableOpacity>

      <FlatList
        data={users}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    padding: 12,
    borderRadius: 8,
    margin: 16,
  },
  addButtonText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    padding: 16,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  email: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  adminBadge: {
    backgroundColor: '#FEE2E2',
  },
  managerBadge: {
    backgroundColor: '#DBEAFE',
  },
  cashierBadge: {
    backgroundColor: '#D1FAE5',
  },
  roleText: {
    fontSize: 12,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
});

// Enhanced with WatermelonDB observations
export default withObservables([], () => ({
  users: database.get<User>('users').query(),
}))(UsersList);