import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, TextInput, Modal, ActivityIndicator, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { withObservables } from '@nozbe/watermelondb/react';
import { Q } from '@nozbe/watermelondb';
import { MaterialIcons } from '@expo/vector-icons';
import { debounce } from 'lodash';
import database from '../../../db';
import { ProductItem } from './ProductItem';
import type { ProductModel, CategoryModel, FormData } from './types';

const ITEMS_PER_PAGE = 30;

const initialFormData: FormData = {
  name: '',
  description: '',
  code: '',
  price: '',
  cost: '',
  taxRate: '0',
  baseQuantity: '0',
  conversionFactor: '1',
  defaultUnit: 'pcs',
  baseUnit: 'pcs',
  categoryId: '',
};

interface ProductsScreenProps {
  products: ProductModel[];
  categories: CategoryModel[];
}

const ProductsScreen = ({ products, categories }: ProductsScreenProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedProduct, setSelectedProduct] = useState<ProductModel | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const debouncedSearch = useMemo(
    () => debounce((query: string) => {
      setSearchQuery(query);
    }, 300),
    []
  );

  const productsCollection = database.get<ProductModel>('products');

  const handleAddProduct = () => {
    setModalMode('add');
    setSelectedProduct(null);
    setFormData(initialFormData);
    setFormErrors({});
    setModalVisible(true);
  };

  const handleEditProduct = useCallback((product: ProductModel) => {
    setModalMode('edit');
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      code: product.code,
      price: product.price.toString(),
      cost: product.cost.toString(),
      taxRate: product.taxRate.toString(),
      baseQuantity: product.baseQuantity.toString(),
      conversionFactor: product.conversionFactor.toString(),
      defaultUnit: product.defaultUnit,
      baseUnit: product.baseUnit,
      categoryId: product.category.id,
    });
    setFormErrors({});
    setModalVisible(true);
  }, []);

  const handleDeleteProduct = useCallback(async (product: ProductModel) => {
    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await database.write(async () => {
                await product.markAsDeleted();
              });
            } catch (error) {
              console.error('Error deleting product:', error);
              Alert.alert('Error', 'Failed to delete product');
            }
          }
        }
      ]
    );
  }, []);

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.categoryId) errors.categoryId = 'Category is required';
    if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) errors.price = 'Price must be greater than 0';
    if (isNaN(Number(formData.cost)) || Number(formData.cost) <= 0) errors.cost = 'Cost must be greater than 0';
    if (isNaN(Number(formData.taxRate)) || Number(formData.taxRate) < 0) errors.taxRate = 'Tax rate must be 0 or greater';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      await database.write(async () => {
        const timestamp = Date.now();
        
        if (modalMode === 'add') {
          await productsCollection.create((product: ProductModel) => {
            product.name = formData.name.trim();
            product.description = formData.description.trim();
            product.code = formData.code || generateProductCode(formData.name);
            product.price = Number(formData.price);
            product.cost = Number(formData.cost);
            product.taxRate = Number(formData.taxRate);
            product.baseQuantity = Number(formData.baseQuantity);
            product.conversionFactor = Number(formData.conversionFactor);
            product.defaultUnit = formData.defaultUnit;
            product.baseUnit = formData.baseUnit;
            (product as any)._raw.category_id = formData.categoryId;
            product.dateAdded = timestamp;
            product.dateUpdated = timestamp;
          });
        } else if (selectedProduct) {
          await selectedProduct.update((product: ProductModel) => {
            product.name = formData.name.trim();
            product.description = formData.description.trim();
            product.price = Number(formData.price);
            product.cost = Number(formData.cost);
            product.taxRate = Number(formData.taxRate);
            product.baseQuantity = Number(formData.baseQuantity);
            product.conversionFactor = Number(formData.conversionFactor);
            product.defaultUnit = formData.defaultUnit;
            product.baseUnit = formData.baseUnit;
            (product as any)._raw.category_id = formData.categoryId;
            product.dateUpdated = timestamp;
          });
        }
      });

      setModalVisible(false);
    } catch (error) {
      console.error('Error saving product:', error);
      Alert.alert('Error', 'Failed to save product');
    }
  };

  const generateProductCode = (name: string): string => {
    const prefix = name.substring(0, 3).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${random}`;
  };

  const renderItem = useCallback(({ item }: { item: ProductModel }) => (
    <ProductItem 
      item={item}
      onEdit={handleEditProduct}
      onDelete={handleDeleteProduct}
    />
  ), [handleEditProduct, handleDeleteProduct]);

  const getItemLayout = useCallback((data: any, index: number) => ({
    length: 180,
    offset: 180 * index,
    index,
  }), []);

  const keyExtractor = useCallback((item: ProductModel) => item.id, []);

  const renderCategoryItem = ({ item }: { item: CategoryModel }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() => {
        setFormData(prev => ({ ...prev, categoryId: item.id }));
        setCategoryModalVisible(false);
      }}
    >
      <Text style={styles.categoryItemText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={24} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={debouncedSearch}
          />
          {searchQuery !== '' && (
            <Pressable onPress={() => setSearchQuery('')}>
              <MaterialIcons name="close" size={24} color="#666" />
            </Pressable>
          )}
        </View>
        <Pressable 
          style={styles.addButton}
          onPress={handleAddProduct}
        >
          <MaterialIcons name="add" size={24} color="#FFF" />
          <Text style={styles.addButtonText}>Add Product</Text>
        </Pressable>
      </View>

      <FlatList
        data={products}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
        contentContainerStyle={styles.list}
        numColumns={2}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="inventory-2" size={48} color="#666" />
            <Text style={styles.emptyText}>No products found</Text>
            <Text style={styles.emptySubText}>
              {searchQuery 
                ? 'Try adjusting your search'
                : 'Add your first product to get started'}
            </Text>
          </View>
        )}
      />

      
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {modalMode === 'add' ? 'Add Product' : 'Edit Product'}
              </Text>
              <Pressable 
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <MaterialIcons name="close" size={24} color="#666" />
              </Pressable>
            </View>

            <ScrollView style={styles.formContainer}>
              {/* Category Selection */}
              <View style={styles.formField}>
                <Text style={styles.label}>Category</Text>
                <Pressable
                  style={[styles.input, styles.dropdownButton]}
                  onPress={() => setCategoryModalVisible(true)}
                >
                  <Text style={formData.categoryId ? styles.dropdownText : styles.placeholderText}>
                    {categories.find(c => c.id === formData.categoryId)?.name || 'Select Category'}
                  </Text>
                  <MaterialIcons name="arrow-drop-down" size={24} color="#666" />
                </Pressable>
                {formErrors.categoryId && (
                  <Text style={styles.errorText}>{formErrors.categoryId}</Text>
                )}
              </View>

              {/* Basic Information */}
              <View style={styles.formField}>
                <Text style={styles.label}>Name</Text>
                <TextInput
                  style={[styles.input, formErrors.name && styles.inputError]}
                  value={formData.name}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                  placeholder="Product Name"
                />
                {formErrors.name && (
                  <Text style={styles.errorText}>{formErrors.name}</Text>
                )}
              </View>

              <View style={styles.formField}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[
                    styles.input, 
                    styles.textArea,
                    formErrors.description && styles.inputError
                  ]}
                  value={formData.description}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                  placeholder="Product Description"
                  multiline
                  numberOfLines={4}
                />
                {formErrors.description && (
                  <Text style={styles.errorText}>{formErrors.description}</Text>
                )}
              </View>

              {/* Pricing */}
              <View style={styles.rowFields}>
                <View style={[styles.formField, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.label}>Price</Text>
                  <TextInput
                    style={[styles.input, formErrors.price && styles.inputError]}
                    value={formData.price}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, price: text }))}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                  />
                  {formErrors.price && (
                    <Text style={styles.errorText}>{formErrors.price}</Text>
                  )}
                </View>

                <View style={[styles.formField, { flex: 1 }]}>
                  <Text style={styles.label}>Cost</Text>
                  <TextInput
                    style={[styles.input, formErrors.cost && styles.inputError]}
                    value={formData.cost}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, cost: text }))}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                  />
                  {formErrors.cost && (
                    <Text style={styles.errorText}>{formErrors.cost}</Text>
                  )}
                </View>
              </View>

              {/* Units */}
              <View style={styles.rowFields}>
                <View style={[styles.formField, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.label}>Default Unit</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.defaultUnit}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, defaultUnit: text }))}
                    placeholder="e.g., pcs, kg, box"
                  />
                </View>

                <View style={[styles.formField, { flex: 1 }]}>
                  <Text style={styles.label}>Base Unit</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.baseUnit}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, baseUnit: text }))}
                    placeholder="e.g., pcs, kg, box"
                  />
                </View>
              </View>

              {/* Quantity and Conversion */}
              <View style={styles.rowFields}>
                <View style={[styles.formField, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.label}>Base Quantity</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.baseQuantity}
                    onChangeText={(text) => setFormData(prev => ({ 
                      ...prev,
                      baseQuantity: text.replace(/[^0-9]/g, '')
                    }))}
                    keyboardType="numeric"
                    placeholder="0"
                  />
                </View>

                <View style={[styles.formField, { flex: 1 }]}>
                  <Text style={styles.label}>Conversion Factor</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.conversionFactor}
                    onChangeText={(text) => setFormData(prev => ({ 
                      ...prev,
                      conversionFactor: text.replace(/[^0-9.]/g, '')
                    }))}
                    keyboardType="decimal-pad"
                    placeholder="1"
                  />
                </View>
              </View>

              {/* Tax Rate */}
              <View style={styles.formField}>
                <Text style={styles.label}>Tax Rate (%)</Text>
                <TextInput
                  style={[styles.input, formErrors.taxRate && styles.inputError]}
                  value={formData.taxRate}
                  onChangeText={(text) => setFormData(prev => ({ 
                    ...prev,
                    taxRate: text.replace(/[^0-9.]/g, '')
                  }))}
                  keyboardType="decimal-pad"
                  placeholder="0"
                />
                {formErrors.taxRate && (
                  <Text style={styles.errorText}>{formErrors.taxRate}</Text>
                )}
              </View>
            </ScrollView>

            {/* Modal Actions */}
            <View style={styles.modalActions}>
              <Pressable 
                style={[styles.button, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </Pressable>
              <Pressable 
                style={[styles.button, styles.saveButton]}
                onPress={handleSubmit}
              >
                <Text style={[styles.buttonText, styles.saveButtonText]}>
                  {modalMode === 'add' ? 'Add Product' : 'Save Changes'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Category Selection Modal */}
      <Modal
        visible={categoryModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { maxHeight: '60%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <Pressable 
                onPress={() => setCategoryModalVisible(false)}
                style={styles.closeButton}
              >
                <MaterialIcons name="close" size={24} color="#666" />
              </Pressable>
            </View>
            
            <FlatList
              data={categories}
              keyExtractor={(item) => item.id}
              renderItem={renderCategoryItem}
              ListEmptyComponent={() => (
                <View style={styles.emptyCategories}>
                  <Text style={styles.emptyCategoriesText}>No categories available</Text>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFF',
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000080',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFF',
    marginLeft: 5,
    fontSize: 16,
  },
  list: {
    padding: 15,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 10,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  formContainer: {
    padding: 15,
  },
  formField: {
    marginBottom: 20,
  },
  rowFields: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 4,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#FFF',
  },
  inputError: {
    borderColor: '#C62828',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#C62828',
    fontSize: 12,
    marginTop: 5,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 16,
    color: '#000',
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  categoryItemText: {
    fontSize: 16,
    color: '#000',
  },
  emptyCategories: {
    padding: 20,
    alignItems: 'center',
  },
  emptyCategoriesText: {
    color: '#666',
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 10,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#EEE',
  },
  saveButton: {
    backgroundColor: '#000080',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  saveButtonText: {
    color: '#FFF',
  },
});

export default withObservables([], () => ({
  products: database.get<ProductModel>('products').query(),
  categories: database.get<CategoryModel>('categories').query()
}))(ProductsScreen);