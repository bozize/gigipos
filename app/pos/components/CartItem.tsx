import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { CartItemProps } from '../types';

const CartItem: React.FC<CartItemProps> = ({ 
  item, 
  onUpdateQuantity, 
  onRemove 
}) => {
  return (
    <View style={styles.cartItem}>
      <Text 
        style={styles.cartItemName}
        numberOfLines={2}
        adjustsFontSizeToFit
      >
        {item.name}
      </Text>
      <View style={styles.cartItemControls}>
        <Pressable
          style={styles.qtyButton}
          onPress={() => onUpdateQuantity(item.productId, item.qty - 1)}
        >
          <Text style={styles.qtyButtonText}>-</Text>
        </Pressable>
        <Text style={styles.qtyText}>{item.qty}</Text>
        <Pressable
          style={styles.qtyButton}
          onPress={() => onUpdateQuantity(item.productId, item.qty + 1)}
        >
          <Text style={styles.qtyButtonText}>+</Text>
        </Pressable>
      </View>
      <Text 
        style={styles.cartItemAmount}
        adjustsFontSizeToFit
        numberOfLines={1}
      >
        ${item.totalAmount.toFixed(2)}
      </Text>
      <Pressable
        style={styles.removeButton}
        onPress={() => onRemove(item.productId)}
      >
        <MaterialIcons name="close" size={20} color="#666" />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginBottom: 6,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minHeight: 40,
  },
  cartItemName: {
    flex: 2,
    fontSize: 14,
    paddingRight: 4,
    minWidth: 0,
  },
  cartItemControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginHorizontal: 4,
  },
  qtyButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
  },
  qtyButtonText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 16,
  },
  qtyText: {
    fontSize: 14,
    minWidth: 24,
    textAlign: 'center',
  },
  cartItemAmount: {
    flex: 1,
    fontSize: 13,
    textAlign: 'right',
    paddingRight: 4,
    minWidth: 0,
  },
  removeButton: {
    padding: 4,
    marginLeft: 4,
  },
});

export default CartItem;