import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Button, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import database, { salesCollection, salesItemsCollection } from '@/db';
import { Q } from '@nozbe/watermelondb';
import SaleItem from '@/models/item';

interface SaleItemWithProduct {
  id: string;
  productName: string;
  qty: number;
  price: number;
  totalAmount: number;
}

interface SaleDetail {
  id: string;
  code: string;
  grandTotal: number;
  items: SaleItemWithProduct[];
}

export default function SaleDetailScreen() {
  const { id } = useLocalSearchParams();
  const [sale, setSale] = useState<SaleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSaleDetails();
  }, [id]);

  const loadSaleDetails = async () => {
    try {
      setLoading(true);
      const saleRecord = await salesCollection?.find(id as string);
      if (!saleRecord) throw new Error('Sale not found');

      const items = await database
        .get<SaleItem>('sales_items')
        .query(Q.where('sale_id', id as string))
        .fetch();

      const itemsWithProducts = await Promise.all(
        items.map(async (item: SaleItem) => {
          const product = await item.product;
          return {
            id: item.id,
            productName: product.name,
            qty: item.qty,
            price: item.price,
            totalAmount: item.totalAmount
          };
        })
      );

      setSale({
        id: saleRecord.id,
        code: saleRecord.code,
        grandTotal: saleRecord.grandTotal,
        items: itemsWithProducts
      });
    } catch (err) {
      console.error('Error loading sale details:', err);
      setError(err instanceof Error ? err.message : 'Failed to load sale details');
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      await database.write(async () => {
        const item = await salesItemsCollection?.find(itemId);
        if (item) {
          const saleRecord = await salesCollection?.find(id as string);
          if (!saleRecord) throw new Error('Sale not found');

          const product = await item.product;
          if (product) {
            await product.updateQuantity(
              item.qty,
              `${saleRecord.code}-item-removed`
            );
          }

          const itemTotal = item.totalAmount;
          const itemTax = item.taxAmount;

          await saleRecord.update(sale => {
            sale.subTotal = sale.subTotal - (itemTotal - itemTax);
            sale.totalTax = sale.totalTax - itemTax;
            sale.grandTotal = sale.grandTotal - itemTotal;
          });

          await item.destroyPermanently();

          await loadSaleDetails();
        }
      });
    } catch (err) {
      console.error('Error removing item:', err);
      Alert.alert('Error', 'Failed to remove item');
    }
  };

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text style={styles.error}>{error}</Text>;
  if (!sale) return <Text>Sale not found</Text>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sale Details</Text>
        <Text style={styles.code}>Code: {sale.code}</Text>
        <Text style={styles.total}>Total: ${sale.grandTotal}</Text>
      </View>

      <FlatList
        data={sale.items}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.productName}</Text>
              <Text>Qty: {item.qty} × ${item.price}</Text>
              <Text>Total: ${item.totalAmount}</Text>
            </View>
            <Button
              title="Remove"
              onPress={() => {
                Alert.alert(
                  'Remove Item',
                  'Are you sure you want to remove this item?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Remove', onPress: () => removeItem(item.id), style: 'destructive' }
                  ]
                );
              }}
              color="red"
            />
          </View>
        )}
        keyExtractor={item => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  code: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  total: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    marginBottom: 8,
    borderRadius: 4,
    elevation: 2,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});
