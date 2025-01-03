import React, { memo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import type { ProductModel } from './types';

interface ProductItemProps {
  item: ProductModel;
  onEdit: (item: ProductModel) => void;
  onDelete: (item: ProductModel) => void;
}

export const ProductItem = memo(({ item, onEdit, onDelete }: ProductItemProps) => {
  const profitMargin = ((item.price - item.cost) / item.price) * 100;

  return (
    <View style={styles.productCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.productCode}>{item.code}</Text>
        <View style={styles.actionButtons}>
          <Pressable
            onPress={() => onEdit(item)}
            style={[styles.actionButton, styles.editButton]}
          >
            <MaterialIcons name="edit" size={16} color="#000080" />
          </Pressable>
          <Pressable
            onPress={() => onDelete(item)}
            style={[styles.actionButton, styles.deleteButton]}
          >
            <MaterialIcons name="delete" size={16} color="#C62828" />
          </Pressable>
        </View>
      </View>
      
      <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.description} numberOfLines={1}>
        {item.description}
      </Text>

      <View style={styles.infoGrid}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Price</Text>
          <Text style={styles.infoValue} numberOfLines={1}>
            ksh{item.price.toFixed(2)}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Stock</Text>
          <Text style={styles.infoValue} numberOfLines={1}>
            {item.baseQuantity} {item.baseUnit}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Margin</Text>
          <Text style={[
            styles.infoValue,
            { color: profitMargin < 0 ? '#C62828' : '#2E7D32' }
          ]} numberOfLines={1}>
            {profitMargin.toFixed(1)}%
          </Text>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  productCard: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    flex: 1,
    margin: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  productCode: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 4,
  },
  editButton: {
    backgroundColor: '#E3F2FD',
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
  },
  description: {
    color: '#666',
    fontSize: 14,
    marginBottom: 15,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingTop: 10,
  },
  infoItem: {
    width: '50%',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
  },
});