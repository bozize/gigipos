import React from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, FlatList } from 'react-native';
import { RecentSalesPanelProps } from '../types';

const RecentSalesPanel: React.FC<RecentSalesPanelProps> = ({ 
  sales, 
  loading, 
  onSelectSale 
}) => {
  if (loading) {
    return (
      <View style={styles.recentSalesPanel}>
        <ActivityIndicator size="large" color="#000080" />
      </View>
    );
  }

  return (
    <View style={styles.recentSalesPanel}>
      <FlatList
        data={sales}
        renderItem={({ item }) => (
          <Pressable
            style={styles.recentSaleItem}
            onPress={() => onSelectSale(item.id)}
          >
            <Text style={styles.saleCode}>{item.code}</Text>
            <Text style={styles.saleTime}>
              {new Date(item.dateAdded).toLocaleTimeString()}
            </Text>
            <Text style={styles.saleAmount}>
              ${item.grandTotal.toFixed(2)}
            </Text>
            {item.customerName && (
              <Text style={styles.customerName}>{item.customerName}</Text>
            )}
            {item.isCredit && (
              <View style={styles.creditBadge}>
                <Text style={styles.creditBadgeText}>Credit</Text>
              </View>
            )}
          </Pressable>
        )}
        keyExtractor={item => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  recentSalesPanel: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 10,
  },
  recentSaleItem: {
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  saleCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000080',
  },
  saleTime: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  saleAmount: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 4,
  },
  customerName: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  creditBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  creditBadgeText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default RecentSalesPanel;