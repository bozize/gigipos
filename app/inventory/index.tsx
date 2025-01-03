import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Button, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Q } from '@nozbe/watermelondb';
import { productsCollection, salesCollection } from '@/db';
import database from '@/db';
import SaleItem from '@/models/item';
import { useRouter } from 'expo-router';

interface LowStockProduct {
  id: string;
  name: string;
  baseQuantity: number;
  code: string;
}

interface SaleWithItems {
  id: string;
  code: string;
  dateAdded: Date;
  grandTotal: number;
  items: Array<{
    id: string;
    productName: string;
    qty: number;
  }>;
}

export default function InventoryScreen() {
  const router = useRouter();
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [sales, setSales] = useState<SaleWithItems[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    const loadLowStock = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!productsCollection) {
          throw new Error('Products collection not initialized');
        }

        const products = await productsCollection
          .query(Q.where('base_quantity', Q.lt(10)))
          .fetch();

        const formattedProducts: LowStockProduct[] = products.map(p => ({
          id: p.id,
          name: p.name,
          baseQuantity: p.baseQuantity,
          code: p.code
        }));

        setLowStockProducts(formattedProducts);
      } catch (err) {
        console.error('Error loading low stock products:', err);
        setError(err instanceof Error ? err.message : 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    loadLowStock();
  }, []);

  const loadSales = async (date: Date) => {
    try {
      setLoading(true);
      setError(null);

      if (!salesCollection || !database) {
        throw new Error('Sales collection not initialized');
      }

      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const salesForDate = await salesCollection
        .query(
          Q.and(
            Q.where('date_added', Q.gte(startOfDay.getTime())),
            Q.where('date_added', Q.lte(endOfDay.getTime()))
          )
        )
        .fetch();

      const salesWithItems = await Promise.all(
        salesForDate.map(async (sale) => {
          const items = await database
            .get<SaleItem>('sales_items')
            .query(Q.where('sale_id', sale.id))
            .fetch();

          return {
            id: sale.id,
            code: sale.code,
            dateAdded: sale.dateAdded,
            grandTotal: sale.grandTotal,
            items: await Promise.all(
              items.map(async (item: SaleItem) => {
                const product = await item.product;
                return {
                  id: item.id,
                  productName: product.name,
                  qty: item.qty
                };
              })
            )
          };
        })
      );

      setSales(salesWithItems);
    } catch (err) {
      console.error('Error loading sales:', err);
      setError(err instanceof Error ? err.message : 'Failed to load sales');
    } finally {
      setLoading(false);
    }
  };

  const navigateToSaleDetail = (saleId: string) => {
    router.push({
      pathname: '/inventory/sales/[id]',
      params: { id: saleId }
    });
  };

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Low Stock Alert</Text>
        {loading ? (
          <Text>Loading...</Text>
        ) : (
          <FlatList
            data={lowStockProducts}
            renderItem={({ item }) => (
              <View style={styles.alertItem}>
                <Text style={styles.alertText}>
                  {item.name} - Stock: {item.baseQuantity}
                </Text>
              </View>
            )}
            keyExtractor={item => item.id}
          />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sales Management</Text>
        
        <View style={styles.dateSection}>
          <Text>Selected Date: {selectedDate.toLocaleDateString()}</Text>
          <Button 
            title="Select Date" 
            onPress={() => setShowDatePicker(true)} 
          />
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            onChange={(event, date) => {
              setShowDatePicker(false);
              if (date) {
                setSelectedDate(date);
                loadSales(date);
              }
            }}
            mode="date"
          />
        )}
        
        {loading ? (
          <Text>Loading...</Text>
        ) : (
          <FlatList
            data={sales}
            renderItem={({ item: sale }) => (
              <TouchableOpacity 
                style={styles.saleItem}
                onPress={() => navigateToSaleDetail(sale.id)}
              >
                <View>
                  <Text style={styles.saleCode}>Sale Code: {sale.code}</Text>
                  <Text style={styles.saleTotal}>Total: ${sale.grandTotal}</Text>
                  <Text style={styles.itemCount}>
                    Items: {sale.items.length}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            keyExtractor={item => item.id}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  alertItem: {
    padding: 8,
    backgroundColor: '#ffebee',
    marginBottom: 4,
    borderRadius: 4,
  },
  alertText: {
    color: '#c62828',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  saleItem: {
    padding: 12,
    backgroundColor: '#fff',
    marginBottom: 8,
    borderRadius: 4,
    elevation: 2,
  },
  dateSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
  },
  saleCode: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  saleTotal: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  itemCount: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
});