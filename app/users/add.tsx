import React, { useState } from 'react';
import { isPinUnique } from '../utils/userUtils';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  Pressable
} from 'react-native';
import { useRouter } from 'expo-router';
import database from '../../db/index';
import type User from '../../models/user';

type FormData = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'admin' | 'manager' | 'cashier';
  pin?: string;
};

export default function AddUser() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'cashier',
  });
  const [showRoleModal, setShowRoleModal] = useState(false);

  const roles = [
    { label: 'Cashier', value: 'cashier' },
    { label: 'Manager', value: 'manager' },
    { label: 'Admin', value: 'admin' }
  ];

  // Rest of your validation and submit logic remains the same
  const validate = async (): Promise<boolean> => {
    if (!formData.username || !formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return false;
    }
  
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }
  
    if (formData.role === 'cashier') {
      if (!formData.pin || formData.pin.length !== 4) {
        Alert.alert('Error', 'Cashiers must have a 4-digit PIN');
        return false;
      }
  
      // Check PIN uniqueness
      const isUnique = await isPinUnique(formData.pin);
      if (!isUnique) {
        Alert.alert('Error', 'This PIN is already in use. Please choose a different PIN.');
        return false;
      }
    }
  
    return true;
  };

  // In add.tsx
  const handleSubmit = async () => {
    try {
      const isValid = await validate();
      if (!isValid) return;
  
      await database.write(async () => {
        const user = await database.get<User>('users').create((user) => {
          user.username = formData.username;
          user.email = formData.email;
          user.role = formData.role;
          user.dateAdded = new Date();  // Changed from timestamp to Date object
          user.dateUpdated = new Date(); // Changed from timestamp to Date object
        });
  
        await user.setPassword(formData.password);
        if (formData.pin && formData.role === 'cashier') {
          await user.setPin(formData.pin);
        }
      });
  
      Alert.alert('Success', 'User created successfully', [
        { text: 'OK', onPress: () => router.replace('/users') }
      ]);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Error', 'Failed to create user');
      }
      console.error('Create user error:', error);
    }
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        {/* Username field */}
        <View style={styles.field}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            value={formData.username}
            onChangeText={(text) => setFormData({ ...formData, username: text })}
            placeholder="Enter username"
            autoCapitalize="none"
          />
        </View>

        {/* Email field */}
        <View style={styles.field}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            placeholder="Enter email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Password field */}
        <View style={styles.field}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={formData.password}
            onChangeText={(text) => setFormData({ ...formData, password: text })}
            placeholder="Enter password"
            secureTextEntry
          />
        </View>

        {/* Confirm Password field */}
        <View style={styles.field}>
          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            value={formData.confirmPassword}
            onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
            placeholder="Confirm password"
            secureTextEntry
          />
        </View>

        {/* Role Selection */}
        <View style={styles.field}>
          <Text style={styles.label}>Role</Text>
          <TouchableOpacity 
            style={styles.roleSelector}
            onPress={() => setShowRoleModal(true)}
          >
            <Text style={styles.roleSelectorText}>
              {roles.find(r => r.value === formData.role)?.label || 'Select Role'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* PIN field for cashiers */}
        {formData.role === 'cashier' && (
          <View style={styles.field}>
            <Text style={styles.label}>PIN (4 digits)</Text>
            <TextInput
              style={styles.input}
              value={formData.pin}
              onChangeText={(text) => {
                const numericPin = text.replace(/[^0-9]/g, '');
                if (numericPin.length <= 4) {
                  setFormData({ ...formData, pin: numericPin });
                }
              }}
              placeholder="Enter 4-digit PIN"
              keyboardType="numeric"
              maxLength={4}
              secureTextEntry
            />
          </View>
        )}

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.cancelButton]} 
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.submitButton]}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>Create User</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Role Selection Modal */}
      <Modal
        visible={showRoleModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRoleModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Role</Text>
            {roles.map((role) => (
              <TouchableOpacity
                key={role.value}
                style={styles.roleOption}
                onPress={() => {
                  setFormData({ ...formData, role: role.value as FormData['role'] });
                  setShowRoleModal(false);
                }}
              >
                <Text style={styles.roleOptionText}>{role.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowRoleModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F9FAFB',
    },
    form: {
      padding: 16,
    },
    field: {
      marginBottom: 16,
    },
    label: {
      fontSize: 14,
      fontWeight: '500',
      color: '#374151',
      marginBottom: 8,
    },
    input: {
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#D1D5DB',
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 24,
    },
    button: {
      flex: 1,
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: '#F3F4F6',
      marginRight: 8,
    },
    submitButton: {
      backgroundColor: '#3B82F6',
      marginLeft: 8,
    },
    cancelButtonText: {
      color: '#4B5563',
      fontSize: 16,
      fontWeight: '600',
    },
    submitButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    // Modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: '#FFFFFF',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#111827',
      marginBottom: 15,
      textAlign: 'center',
    },
    roleOption: {
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#E5E7EB',
    },
    roleOptionText: {
      fontSize: 16,
      color: '#374151',
      textAlign: 'center',
    },
    modalCloseButton: {
      marginTop: 15,
      paddingVertical: 15,
    },
    modalCloseButtonText: {
      fontSize: 16,
      color: '#EF4444',
      textAlign: 'center',
      fontWeight: '600',
    },
    roleSelector: {
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#D1D5DB',
      borderRadius: 8,
      padding: 12,
    },
    roleSelectorText: {
      fontSize: 16,
      color: '#374151',
    }
  });