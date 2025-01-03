import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Link, Slot } from 'expo-router';

const ExpensesLayout = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Expenses</Text>
        <Link href="/expenses/add" style={styles.addButton}>
          <Text style={styles.addButtonText}>Add Expense</Text>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#000080',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 20,
  },
});

export default ExpensesLayout;