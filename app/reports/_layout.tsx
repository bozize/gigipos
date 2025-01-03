import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Link, Slot } from 'expo-router';


const ReportsLayout = () => {
  return (
    <View style={styles.container}>
      <View style={styles.sidebar}>
        <Link href="/reports" style={styles.sidebarItem}>
          <Text style={styles.sidebarItemText}>Dashboard</Text>
        </Link>
        <Link href="/reports/sales" style={styles.sidebarItem}>
          <Text style={styles.sidebarItemText}>Sales</Text>
        </Link>
        <Link href="/reports/inventory" style={styles.sidebarItem}>
          <Text style={styles.sidebarItemText}>Inventory</Text>
        </Link>
      </View>
      <View style={styles.content}>
        
       
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 200,
    backgroundColor: '#F0F0F0',
    paddingTop: 20,
  },
  sidebarItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  sidebarItemText: {
    color: '#000000',
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 20,
  },
});

export default ReportsLayout;