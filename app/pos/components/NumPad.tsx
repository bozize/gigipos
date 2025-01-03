import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NumPadProps } from '../types';

const NumPad: React.FC<NumPadProps> = ({ 
  onNumberPress, 
  onClear, 
  onEnter, 
  onBackspace 
}) => {
  return (
    <View style={styles.numPadContainer}>
      <View style={styles.numPadGrid}>
        {['7', '8', '9', '4', '5', '6', '1', '2', '3', '.', '0'].map((num) => (
          <Pressable
            key={num}
            style={styles.numKey}
            onPress={() => onNumberPress(num)}
          >
            <Text style={styles.numKeyText}>{num}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.numPadActions}>
        <Pressable style={[styles.numKey, styles.actionKey]} onPress={onClear}>
          <Text style={styles.actionKeyText}>Clear</Text>
        </Pressable>
        <Pressable style={[styles.numKey, styles.actionKey]} onPress={onBackspace}>
          <MaterialIcons name="backspace" size={24} color="#666" />
        </Pressable>
        <Pressable 
          style={[styles.numKey, styles.actionKey, styles.enterKey]} 
          onPress={onEnter}
        >
          <Text style={[styles.actionKeyText, styles.enterKeyText]}>Enter</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  numPadContainer: {
    backgroundColor: '#1F2937',
    borderRadius: 8,
    padding: 8,
    maxHeight: 400,
  },
  numPadGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 6,
    maxHeight: 300,
  },
  numKey: {
    width: '30%',
    aspectRatio: 1.5,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 6,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  numKeyText: {
    fontSize: 20,
    color: '#374151',
    fontWeight: '500',
  },
  numPadActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
    marginTop: 6,
  },
  actionKey: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    padding: 10,
  },
  actionKeyText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
  },
  enterKey: {
    backgroundColor: '#000080',
  },
  enterKeyText: {
    color: '#FFFFFF',
  },
});

export default NumPad;