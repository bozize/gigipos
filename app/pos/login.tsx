import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../context/auth';
import { router } from 'expo-router';
import database from '../../db';
import User from '../../models/user';
import * as Crypto from 'expo-crypto';
import { Q } from '@nozbe/watermelondb';

const PIN_LENGTH = 4;
const PIN_MASK = '•';


const Cache = {
  usersByPinHash: new Map<string, { id: string; role: string }>(),
  pinHashCache: new Map<string, string>(),
  initialized: false,

  
  async initializePinHashes() {
    const promises = [];
    for (let i = 0; i < 10000; i++) {
      const pin = i.toString().padStart(4, '0');
      promises.push(
        Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.SHA256,
          pin
        ).then(hash => {
          this.pinHashCache.set(pin, hash);
        })
      );
      
      
      if (promises.length === 100) {
        await Promise.all(promises);
        promises.length = 0;
      }
    }
    if (promises.length > 0) {
      await Promise.all(promises);
    }
  },

  async initialize() {
    if (this.initialized) return;
    
    console.time('cache-init');
    try {
      
      const users = await database.get<User>('users')
        .query(Q.where('role', Q.oneOf(['admin', 'manager', 'cashier'])))
        .fetch();
      
      users.forEach(user => {
        this.usersByPinHash.set(user.pinHash, {
          id: user.id,
          role: user.role
        });
      });

      
      this.initializePinHashes().catch(console.error);
      
      this.initialized = true;
    } catch (error) {
      console.error('Cache initialization error:', error);
    }
    console.timeEnd('cache-init');
  },

  validatePin(pin: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = this.pinHashCache.get(pin);
      if (hash) {
        resolve(hash);
      } else {
        
        Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.SHA256,
          pin
        ).then(resolve, reject);
      }
    });
  }
};


Cache.initialize();

function NumericButton({ value, onPress, disabled }: { 
  value: string; 
  onPress: (value: string) => void; 
  disabled?: boolean; 
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.numericButton,
        pressed && styles.numericButtonPressed,
        disabled && styles.numericButtonDisabled
      ]}
      onPress={() => onPress(value)}
      disabled={disabled}
    >
      <Text style={styles.numericButtonText}>{value}</Text>
    </Pressable>
  );
}

function PosLogin() {
  const [pin, setPin] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const authInProgress = useRef(false);
  const pinValidationTimeout = useRef<NodeJS.Timeout>();

  const handleLogin = useCallback(async (pinString: string) => {
    if (authInProgress.current) return;
    authInProgress.current = true;
    setLoading(true);
    console.time('total-login');

    try {
      console.time('pin-validation');
      const pinHash = await Cache.validatePin(pinString);
      const userData = Cache.usersByPinHash.get(pinHash);
      console.timeEnd('pin-validation');

      if (!userData) {
        throw new Error('Invalid PIN');
      }

      console.time('actual-login');
      await login(userData.id);
      console.timeEnd('actual-login');

      console.time('navigation');
      await router.replace('/pos');
      console.timeEnd('navigation');
    } catch (error) {
      const message = error instanceof Error 
        ? error.message === 'No sales permission'
          ? 'Access Denied. You do not have permission to access POS.'
          : 'Invalid PIN. Please try again.'
        : 'An error occurred';
      setPin('');
      alert(message);
    } finally {
      console.timeEnd('total-login');
      setLoading(false);
      authInProgress.current = false;
    }
  }, [login]);

  const handlePinInput = useCallback((value: string) => {
    setPin(prev => {
      const newPin = prev + value;
      if (newPin.length === PIN_LENGTH) {
        
        if (pinValidationTimeout.current) {
          clearTimeout(pinValidationTimeout.current);
        }
        
        pinValidationTimeout.current = setTimeout(() => {
          handleLogin(newPin);
        }, 50);
      }
      return newPin.slice(0, PIN_LENGTH);
    });
  }, [handleLogin]);

  const handleClear = useCallback(() => setPin(''), []);
  const handleBackspace = useCallback(() => setPin(prev => prev.slice(0, -1)), []);

  
  useEffect(() => {
    return () => {
      if (pinValidationTimeout.current) {
        clearTimeout(pinValidationTimeout.current);
      }
    };
  }, []);

  if (!Cache.initialized) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#000080" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.loginCard}>
        <MaterialIcons name="lock" size={48} color="#000080" />
        <Text style={styles.title}>Enter PIN</Text>
        <Text style={styles.subtitle}>Please enter your 4-digit PIN to access POS</Text>

        <View style={styles.pinDisplay}>
          {Array(PIN_LENGTH).fill(0).map((_, index) => (
            <View 
              key={index} 
              style={[
                styles.pinDot,
                pin.length > index && styles.pinDotFilled
              ]}
            >
              {pin.length > index && (
                <Text style={styles.pinDotText}>{PIN_MASK}</Text>
              )}
            </View>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#000080" style={styles.loader} />
        ) : (
          <View style={styles.keypad}>
            {[['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9']].map((row, rowIndex) => (
              <View key={rowIndex} style={styles.keypadRow}>
                {row.map((num) => (
                  <NumericButton
                    key={num}
                    value={num}
                    onPress={handlePinInput}
                    disabled={loading || pin.length >= PIN_LENGTH}
                  />
                ))}
              </View>
            ))}
            <View style={styles.keypadRow}>
              <Pressable
                style={[styles.numericButton, styles.actionButton]}
                onPress={handleClear}
                disabled={loading}
              >
                <MaterialIcons name="clear" size={24} color="#DC2626" />
              </Pressable>
              <NumericButton
                value="0"
                onPress={handlePinInput}
                disabled={loading || pin.length >= PIN_LENGTH}
              />
              <Pressable
                style={[styles.numericButton, styles.actionButton]}
                onPress={handleBackspace}
                disabled={loading}
              >
                <MaterialIcons name="backspace" size={24} color="#666" />
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loginCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 40,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000080',
    marginTop: 20,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  pinDisplay: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 30,
  },
  pinDot: {
    width: 50,
    height: 60,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  pinDotFilled: {
    backgroundColor: '#E3F2FD',
    borderColor: '#000080',
  },
  pinDotText: {
    fontSize: 24,
    color: '#000080',
  },
  loader: {
    marginVertical: 30,
  },
  keypad: {
    gap: 12,
  },
  keypadRow: {
    flexDirection: 'row',
    gap: 12,
  },
  numericButton: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    elevation: 2,
  },
  numericButtonPressed: {
    backgroundColor: '#E5E7EB',
  },
  numericButtonDisabled: {
    opacity: 0.5,
  },
  numericButtonText: {
    fontSize: 24,
    fontWeight: '500',
    color: '#000080',
  },
  actionButton: {
    backgroundColor: '#F9FAFB',
  },
});

export default PosLogin;