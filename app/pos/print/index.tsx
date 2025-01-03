// app/pos/print/index.tsx
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Pressable
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { businessConfig } from '../../config/business';

interface ReceiptItem {
  productName: string;
  price: number;
  qty: number;
  total: number;
  unitType: string;
  vat: number;
}


type SearchParams = {
  [K in keyof PrintParams]: string | string[];
};

interface PrintParams {
  items: string;
  code: string;
  date: string;
  cashier: string;
  subtotal: string;
  tax: string;
  discount: string;
  total: string;
  paymentMethod: string;
  amountPaid: string;
  balanceDue: string;
  isCredit: string;
  customerName?: string;
}


const getParamAsString = (param: string | string[] | undefined): string => {
  if (Array.isArray(param)) return param[0] || '';
  return param || '';
};

export default function ReceiptScreen() {
  const rawParams = useLocalSearchParams<SearchParams>();
  
  
  const params = {
    items: getParamAsString(rawParams.items),
    code: getParamAsString(rawParams.code),
    date: getParamAsString(rawParams.date),
    cashier: getParamAsString(rawParams.cashier),
    subtotal: getParamAsString(rawParams.subtotal),
    tax: getParamAsString(rawParams.tax),
    discount: getParamAsString(rawParams.discount),
    total: getParamAsString(rawParams.total),
    paymentMethod: getParamAsString(rawParams.paymentMethod),
    amountPaid: getParamAsString(rawParams.amountPaid),
    balanceDue: getParamAsString(rawParams.balanceDue),
    isCredit: getParamAsString(rawParams.isCredit),
    customerName: getParamAsString(rawParams.customerName),
  };

  const items: ReceiptItem[] = JSON.parse(params.items || '[]');

  const handlePrint = () => {
    
    console.log('Printing functionality to be implemented');
  };

  const handleDone = () => {
    router.push('/pos');
  };

  return (
    <View style={styles.container}>
      <View style={styles.receiptCard}>
        <ScrollView style={styles.receipt}>
          {/* Business Header */}
          <View style={styles.businessHeader}>
            <Text style={styles.businessName}>{businessConfig.name}</Text>
            <Text style={styles.businessInfo}>{businessConfig.address}</Text>
            <Text style={styles.businessInfo}>{businessConfig.phone}</Text>
            <Text style={styles.businessInfo}>{businessConfig.email}</Text>
            {businessConfig.taxId && (
              <Text style={styles.businessInfo}>Tax ID: {businessConfig.taxId}</Text>
            )}
          </View>

          {/* Receipt Details */}
          <View style={styles.receiptDetails}>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Receipt #:</Text>
              <Text style={styles.receiptValue}>{params.code}</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Date:</Text>
              <Text style={styles.receiptValue}>{params.date}</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Cashier:</Text>
              <Text style={styles.receiptValue}>{params.cashier}</Text>
            </View>
          </View>

          {/* Items */}
          <View style={styles.itemsContainer}>
            <View style={styles.itemsHeader}>
              <Text style={[styles.itemText, styles.itemName]}>Item</Text>
              <Text style={[styles.itemText, styles.itemQty]}>Qty</Text>
              <Text style={[styles.itemText, styles.itemPrice]}>Price</Text>
              <Text style={[styles.itemText, styles.itemVat]}>VAT</Text>
              <Text style={[styles.itemText, styles.itemTotal]}>Total</Text>
            </View>

            {items.map((item, index) => (
              <View key={index}>
                <View style={styles.itemRow}>
                  <Text style={[styles.itemText, styles.itemName]}>
                    {item.productName}
                  </Text>
                  <Text style={[styles.itemText, styles.itemQty]}>
                    {item.qty} {item.unitType}
                  </Text>
                  <Text style={[styles.itemText, styles.itemPrice]}>
                    ${item.price.toFixed(2)}
                  </Text>
                  <Text style={[styles.itemText, styles.itemVat]}>
                    ${item.vat.toFixed(2)}
                  </Text>
                  <Text style={[styles.itemText, styles.itemTotal]}>
                    ${item.total.toFixed(2)}
                  </Text>
                </View>
                {item.vat > 0 && (
                  <Text style={styles.vatNote}>
                    *Includes VAT
                  </Text>
                )}
              </View>
            ))}
          </View>

          {/* Totals */}
          <View style={styles.totalsContainer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal:</Text>
              <Text style={styles.totalValue}>
                ${parseFloat(params.subtotal).toFixed(2)}
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax:</Text>
              <Text style={styles.totalValue}>
                ${parseFloat(params.tax).toFixed(2)}
              </Text>
            </View>
            {parseFloat(params.discount) > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Discount:</Text>
                <Text style={styles.totalValue}>
                  -${parseFloat(params.discount).toFixed(2)}
                </Text>
              </View>
            )}
            <View style={[styles.totalRow, styles.grandTotal]}>
              <Text style={styles.grandTotalLabel}>Total:</Text>
              <Text style={styles.grandTotalValue}>
                ${parseFloat(params.total).toFixed(2)}
              </Text>
            </View>

            <View style={styles.paymentDetails}>
              <Text style={styles.paymentLabel}>
                Payment Method: {params.paymentMethod.toUpperCase()}
              </Text>
              <Text style={styles.paymentLabel}>
                Amount Paid: ${parseFloat(params.amountPaid).toFixed(2)}
              </Text>
              {parseFloat(params.balanceDue) > 0 && (
                <Text style={styles.paymentLabel}>
                  Balance Due: ${parseFloat(params.balanceDue).toFixed(2)}
                </Text>
              )}
              {params.isCredit === 'true' && params.customerName && (
                <Text style={styles.paymentLabel}>
                  Customer: {params.customerName}
                </Text>
              )}
            </View>
          </View>

          {/* Footer */}
          {businessConfig.footer && (
            <Text style={styles.footer}>{businessConfig.footer}</Text>
          )}
        </ScrollView>

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable style={styles.actionButton} onPress={handlePrint}>
            <MaterialIcons name="print" size={24} color="#000080" />
            <Text style={styles.actionButtonText}>Print</Text>
          </Pressable>
          <Pressable 
            style={[styles.actionButton, styles.doneButton]} 
            onPress={handleDone}
          >
            <MaterialIcons name="check" size={24} color="#FFF" />
            <Text style={[styles.actionButtonText, styles.doneButtonText]}>
              Done
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  receiptCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  receipt: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#C62828',
    marginTop: 10,
  },
  businessHeader: {
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  businessName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  businessInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  receiptDetails: {
    marginBottom: 20,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  receiptLabel: {
    fontSize: 14,
    color: '#666',
  },
  receiptValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  itemsContainer: {
    marginBottom: 20,
  },
  itemsHeader: {
    flexDirection: 'row',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  itemText: {
    fontSize: 14,
  },
  itemName: {
    flex: 2,
    paddingRight: 10,
  },
  itemQty: {
    flex: 1,
    textAlign: 'center',
  },
  itemPrice: {
    flex: 1,
    textAlign: 'right',
  },
  itemVat: {
    flex: 1,
    textAlign: 'right',
  },
  itemTotal: {
    flex: 1,
    textAlign: 'right',
  },
  totalsContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
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
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  grandTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000080',
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000080',
  },
  paymentDetails: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  paymentLabel: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  footer: {
    marginTop: 30,
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    gap: 8,
  },
  doneButton: {
    backgroundColor: '#000080',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000080',
  },
  doneButtonText: {
    color: '#FFF',
  },
  backButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#000080',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFF',
    fontSize: 16,
  },
  vatNote: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginLeft: 10,
    marginTop: 2,
  },
});
