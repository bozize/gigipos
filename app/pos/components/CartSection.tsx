import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { CartSectionProps } from '../types';
import CartItem from './CartItem';
import RecentSalesPanel from './RecentSalesPanel';

const CartSection: React.FC<CartSectionProps> = ({
  cartItems,
  updateQuantity,
  removeFromCart,
  isCredit,
  setIsCredit,
  customerName,
  setCustomerName,
  paymentMethod,
  setPaymentMethod,
  totalPaid,
  discount,
  calculations,
  handleCheckout,
  showRecentSales,
  setShowRecentSales,
  recentSales,
  loadingRecent,
  onLoadSale,
  setActiveInput,
  tempValues,
  activeInput
}) => {
  return (
    <View style={styles.cartSection}>
      <Pressable
        style={styles.recentSalesButton}
        onPress={() => setShowRecentSales(!showRecentSales)}
      >
        <MaterialIcons 
          name={showRecentSales ? "close" : "history"} 
          size={24} 
          color="#FFF" 
        />
        <Text style={styles.recentSalesButtonText}>
          {showRecentSales ? 'Hide Recent Sales' : 'Recent Sales'}
        </Text>
      </Pressable>

      {showRecentSales ? (
        <RecentSalesPanel
          sales={recentSales}
          loading={loadingRecent}
          onSelectSale={onLoadSale}
        />
      ) : (
        <ScrollView style={styles.cartList}>
          {cartItems.map(item => (
            <CartItem
              key={item.productId}
              item={item}
              onUpdateQuantity={updateQuantity}
              onRemove={removeFromCart}
            />
          ))}
        </ScrollView>
      )}

      <View style={styles.cartOptions}>
        <View style={styles.creditSection}>
          <Pressable
            style={[styles.creditButton, isCredit && styles.creditButtonActive]}
            onPress={() => setIsCredit(!isCredit)}
          >
            <Text style={[styles.creditButtonText, isCredit && styles.creditButtonTextActive]}>
              Credit Sale
            </Text>
          </Pressable>
          
          {isCredit && (
            <TextInput
              style={styles.input}
              placeholder="Customer Name"
              value={customerName}
              onChangeText={setCustomerName}
            />
          )}
        </View>

        <View style={styles.paymentSection}>
          <View style={styles.paymentMethod}>
            <Pressable
              style={[
                styles.methodButton,
                paymentMethod === 'cash' && styles.methodButtonActive
              ]}
              onPress={() => setPaymentMethod('cash')}
            >
              <Text style={styles.methodButtonText}>Cash</Text>
            </Pressable>
            <Pressable
              style={[
                styles.methodButton,
                paymentMethod === 'mpesa' && styles.methodButtonActive
              ]}
              onPress={() => setPaymentMethod('mpesa')}
            >
              <Text style={styles.methodButtonText}>M-Pesa</Text>
            </Pressable>
          </View>

          <TextInput
            style={[
              styles.input,
              activeInput === 'payment' && styles.activeInput
            ]}
            placeholder="Total Paid"
            keyboardType="numeric"
            value={tempValues.payment || totalPaid}
            onFocus={() => {
              setActiveInput('payment');
              if (!tempValues.payment) {
                setActiveInput('payment');
              }
            }}
          />

          <TextInput
            style={[
              styles.input,
              activeInput === 'discount' && styles.activeInput
            ]}
            placeholder="Discount"
            keyboardType="numeric"
            value={tempValues.discount || discount}
            onFocus={() => {
              setActiveInput('discount');
              if (!tempValues.discount) {
                setActiveInput('discount');
              }
            }}
          />
        </View>

        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>
              ${calculations.subtotal.toFixed(2)}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>VAT:</Text>
            <Text style={styles.totalValue}>
              ${calculations.totalVat.toFixed(2)}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Grand Total:</Text>
            <Text style={styles.grandTotal}>
              ${calculations.grandTotal.toFixed(2)}
            </Text>
          </View>
          {isCredit && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Balance Due:</Text>
              <Text style={styles.balanceDue}>
                ${calculations.balanceDue.toFixed(2)}
              </Text>
            </View>
          )}
        </View>

        <Pressable
          style={styles.checkoutButton}
          onPress={handleCheckout}
        >
          <MaterialIcons name="shopping-cart-checkout" size={24} color="#FFF" />
          <Text style={styles.checkoutButtonText}>Checkout</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cartSection: {
    width: '30%',
    backgroundColor: '#FFF',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
    display: 'flex',
    flexDirection: 'column',
  },
  cartList: {
    padding: 15,
    flex: 1,
  },
  cartOptions: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFF',
  },
  creditSection: {
    marginBottom: 8,
  },
  creditButton: {
    padding: 4,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
    marginBottom: 4,
    height: 28,
  },
  creditButtonActive: {
    backgroundColor: '#000080',
  },
  creditButtonText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    color: '#374151',
  },
  creditButtonTextActive: {
    color: '#FFF',
  },
  input: {
    height: 28,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
    paddingHorizontal: 6,
    marginBottom: 4,
    backgroundColor: '#F9FAFB',
    fontSize: 12,
  },
  activeInput: {
    backgroundColor: '#E5E7EB',
  },
  paymentSection: {
    marginBottom: 8,
  },
  paymentMethod: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  methodButton: {
    flex: 1,
    padding: 4,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    height: 28,
  },
  methodButtonActive: {
    backgroundColor: '#000080',
  },
  methodButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  totalsSection: {
    marginVertical: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  totalLabel: {
    fontSize: 14,
    color: '#374151',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  grandTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000080',
  },
  balanceDue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#DC2626',
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    backgroundColor: '#000080',
    borderRadius: 6,
    marginTop: 4,
    gap: 4,
    height: 32,
  },
  checkoutButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFF',
  },
  recentSalesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    backgroundColor: '#000080',
    borderRadius: 8,
    marginBottom: 10,
    gap: 8,
    marginTop: 10,
  },
  recentSalesButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default CartSection;