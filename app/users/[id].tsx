import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { withObservables } from '@nozbe/watermelondb/react';
import database from '../../db/index';
import type User from '../../models/user';

type FormData = {
  username: string;
  email: string;
  role: 'admin' | 'manager' | 'cashier';
  password?: string;
  confirmPassword?: string;
  pin?: string;
};

// Base component that handles the UI and logic
function EditUserBase({ user }: { user: User }) {
  const router = useRouter();
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    role: 'cashier',
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isChangingPin, setIsChangingPin] = useState(false);

  const roles = [
    { label: 'Cashier', value: 'cashier' },
    { label: 'Manager', value: 'manager' },
    { label: 'Admin', value: 'admin' }
  ];

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        role: user.role,
      });
    }
  }, [user]);

  const validate = async (): Promise<boolean> => {
    if (!formData.username || !formData.email) {
      Alert.alert('Error', 'Please fill in all required fields');
      return false;
    }
  
    if (isChangingPassword) {
      if (!formData.password || !formData.confirmPassword) {
        Alert.alert('Error', 'Please fill in both password fields');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return false;
      }
    }
  
    if (formData.role === 'cashier' && isChangingPin) {
      if (!formData.pin || formData.pin.length !== 4) {
        Alert.alert('Error', 'Cashiers must have a 4-digit PIN');
        return false;
      }
  
      // Check PIN uniqueness (excluding current user)
      const isUnique = await isPinUnique(formData.pin, user.id);
      if (!isUnique) {
        Alert.alert('Error', 'This PIN is already in use. Please choose a different PIN.');
        return false;
      }
    }
  
    return true;
  };

  const handleSubmit = async () => {
    try {
      const isValid = await validate();
      if (!isValid) return;
  
      await database.write(async () => {
        await user.update(user => {
          user.username = formData.username;
          user.email = formData.email;
          user.role = formData.role;
          user.dateUpdated = new Date();
        });
  
        if (isChangingPassword && formData.password) {
          await user.setPassword(formData.password);
        }
  
        if (isChangingPin && formData.pin && formData.role === 'cashier') {
          // Check PIN uniqueness before setting
          const isPinAvail = await isPinUnique(formData.pin, user.id);
          if (!isPinAvail) {
            throw new Error('This PIN is already in use. Please choose a different PIN.');
          }
          await user.setPin(formData.pin);
        }
      });
  
      Alert.alert(
        'Success',
        'User updated successfully',
        [{ text: 'OK', onPress: () => router.replace('/users') }]
      );
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Error', 'Failed to update user');
      }
      console.error('Update user error:', error);
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

        {/* Change Password Option */}
        <View style={styles.field}>
          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => setIsChangingPassword(!isChangingPassword)}
          >
            <Text style={styles.optionButtonText}>
              {isChangingPassword ? 'Cancel Password Change' : 'Change Password'}
            </Text>
          </TouchableOpacity>

          {isChangingPassword && (
            <>
              <View style={styles.field}>
                <Text style={styles.label}>New Password</Text>
                <TextInput
                  style={styles.input}
                  value={formData.password}
                  onChangeText={(text) => setFormData({ ...formData, password: text })}
                  placeholder="Enter new password"
                  secureTextEntry
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Confirm New Password</Text>
                <TextInput
                  style={styles.input}
                  value={formData.confirmPassword}
                  onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                  placeholder="Confirm new password"
                  secureTextEntry
                />
              </View>
            </>
          )}
        </View>

        {/* PIN Change Option for Cashiers */}
        {formData.role === 'cashier' && (
          <View style={styles.field}>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => setIsChangingPin(!isChangingPin)}
            >
              <Text style={styles.optionButtonText}>
                {isChangingPin ? 'Cancel PIN Change' : 'Change PIN'}
              </Text>
            </TouchableOpacity>

            {isChangingPin && (
              <View style={styles.field}>
                <Text style={styles.label}>New PIN (4 digits)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.pin}
                  onChangeText={(text) => {
                    const numericPin = text.replace(/[^0-9]/g, '');
                    if (numericPin.length <= 4) {
                      setFormData({ ...formData, pin: numericPin });
                    }
                  }}
                  placeholder="Enter new 4-digit PIN"
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry
                />
              </View>
            )}
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
            <Text style={styles.submitButtonText}>Update User</Text>
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

// Styles remain the same
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
    },
    optionButton: {
      backgroundColor: '#EEF2FF',
      padding: 12,
      borderRadius: 8,
      marginBottom: 16,
    },
    optionButtonText: {
      color: '#4F46E5',
      fontSize: 16,
      fontWeight: '600',
      textAlign: 'center',
    },
  });
// Wrapper component that handles the database connection
function EditUser() {
  const params = useLocalSearchParams();
  const userId = params.id as string;

  const EnhancedEditUser = withObservables([], () => ({
    user: database.get<User>('users').findAndObserve(userId)
  }))(EditUserBase);

  return <EnhancedEditUser />;
}

export default EditUser;





















