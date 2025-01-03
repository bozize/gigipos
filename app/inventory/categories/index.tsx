// app/inventory/categories/index.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Pressable,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert 
} from 'react-native';
import { Q } from '@nozbe/watermelondb';
import { Model } from '@nozbe/watermelondb';
import { MaterialIcons } from '@expo/vector-icons';
import database from '../../../db';


interface CategoryModel extends Model {
    id: string;
    name: string;
    description: string;
    dateAdded: Date;
    dateUpdated: Date;
    totalProducts: Promise<number>;
    activeProductsCount: Promise<number>;
    validate(): Promise<void>;
    save(): Promise<void>;
}

type ModalMode = 'add' | 'edit';

interface FormData {
  name: string;
  description: string;
}

const CategoryItem = ({ 
    item, 
    onEdit, 
    onDelete 
  }: { 
    item: CategoryModel; 
    onEdit: (item: CategoryModel) => void;
    onDelete: (item: CategoryModel) => void;
  }) => {
    const [totalProducts, setTotalProducts] = useState<number>(0);
  
    
    useEffect(() => {
      let isMounted = true;
  
      const loadCounts = async () => {
        try {
          
          const productsCollection = database.get('products');
          
          
          const total = await productsCollection
            .query(Q.where('category_id', item.id))
            .fetchCount();

          if (isMounted) {
            setTotalProducts(total);
          }
        } catch (error) {
          console.error('Error loading category counts:', error);
          if (isMounted) {
            setTotalProducts(0);
          }
        }
      };
  
      loadCounts();
  
      
      return () => {
        isMounted = false;
      };
    }, [item]);
  
    return (
      <View style={styles.categoryCard}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.categoryName}>{item.name}</Text>
          </View>
          <View style={styles.actionButtons}>
            <Pressable
              onPress={() => onEdit(item)}
              style={[styles.actionButton, styles.editButton]}
            >
              <MaterialIcons name="edit" size={20} color="#000080" />
            </Pressable>
            <Pressable
              onPress={() => onDelete(item)}
              style={[styles.actionButton, styles.deleteButton]}
            >
              <MaterialIcons name="delete" size={20} color="#C62828" />
            </Pressable>
          </View>
        </View>
        
        <Text style={styles.description} numberOfLines={2}>
          {item.description || 'No description'}
        </Text>
  
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <MaterialIcons name="inventory-2" size={16} color="#666" />
            <Text style={styles.statText}>
              {totalProducts} Products
            </Text>
          </View>
        </View>
      </View>
    );
};

// Main Component
const CategoriesScreen = () => {
  const [categories, setCategories] = useState<CategoryModel[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>('add');
  const [selectedCategory, setSelectedCategory] = useState<CategoryModel | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
  });
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  const sanitizeSearchText = (text: string) => {
    return text.replace(/[%_]/g, '');
  };
  
  useEffect(() => {
    const subscription = database.get<CategoryModel>('categories')
      .query(
        Q.where('name', Q.like(`%${sanitizeSearchText(searchQuery)}%`)),
        Q.sortBy('date_added', Q.desc)
      )
      .observe()
      .subscribe(result => {
        setCategories(result);
        setIsLoading(false);
      });
  
    return () => subscription.unsubscribe();
  }, [searchQuery]);

  const handleAddCategory = () => {
    setModalMode('add');
    setSelectedCategory(null);
    setFormData({
      name: '',
      description: '',
    });
    setFormErrors({});
    setModalVisible(true);
  };

  const handleEditCategory = (category: CategoryModel) => {
    setModalMode('edit');
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
    });
    setFormErrors({});
    setModalVisible(true);
  };

  const handleDeleteCategory = async (category: CategoryModel) => {
    Alert.alert(
      'Delete Category',
      'Are you sure you want to delete this category? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await database.write(async () => {
                await category.markAsDeleted();
              });
            } catch (error) {
              console.error('Error deleting category:', error);
              Alert.alert('Error', 'Failed to delete category');
            }
          }
        }
      ]
    );
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    if (formData.name.length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
  
    try {
      await database.write(async () => {
        if (modalMode === 'add') {
          await database.get<CategoryModel>('categories').create((category) => {
            category.name = formData.name.trim();
            category.description = formData.description.trim();
            category.dateAdded = new Date();
            category.dateUpdated = new Date();
          });
        } else if (selectedCategory) {
          await selectedCategory.update((category) => {
            category.name = formData.name.trim();
            category.description = formData.description.trim();
            category.dateUpdated = new Date();
          });
        }
      });
      setModalVisible(false);
    } catch (error) {
      console.error('Error saving category:', error);
      Alert.alert('Error', 'Failed to save category');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={24} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search categories..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <Pressable onPress={() => setSearchQuery('')}>
              <MaterialIcons name="close" size={24} color="#666" />
            </Pressable>
          )}
        </View>
        <Pressable 
          style={styles.addButton}
          onPress={handleAddCategory}
        >
          <MaterialIcons name="add" size={24} color="#FFF" />
          <Text style={styles.addButtonText}>Add Category</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000080" />
        </View>
      ) : (
        <FlatList
          data={categories}
          renderItem={({ item }) => (
            <CategoryItem 
              item={item} 
              onEdit={handleEditCategory}
              onDelete={handleDeleteCategory}
            />
          )}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="category" size={48} color="#666" />
              <Text style={styles.emptyText}>No categories found</Text>
              <Text style={styles.emptySubText}>
                {searchQuery 
                  ? 'Try adjusting your search'
                  : 'Add your first category to get started'}
              </Text>
            </View>
          )}
        />
      )}

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
                {modalMode === 'add' ? 'Add Category' : 'Edit Category'}
              </Text>
              <Pressable 
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <MaterialIcons name="close" size={24} color="#666" />
              </Pressable>
            </View>

            <View style={styles.formField}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={[styles.input, formErrors.name && styles.inputError]}
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                placeholder="Category Name"
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
                placeholder="Category Description"
                multiline
                numberOfLines={4}
              />
              {formErrors.description && (
                <Text style={styles.errorText}>{formErrors.description}</Text>
              )}
            </View>

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
                  {modalMode === 'add' ? 'Add Category' : 'Save Changes'}
                </Text>
              </Pressable>
            </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 15,
  },
  categoryCard: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  categoryName: {
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
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingTop: 10,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
      statText: {
    marginLeft: 5,
    color: '#666',
    fontSize: 12,
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
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  closeButton: {
    padding: 5,
  },
  formField: {
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
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
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
  }
});
export default CategoriesScreen ;