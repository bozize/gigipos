import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator, FlatList } from 'react-native';
import type { ProductsSectionProps } from '../types';
import type { ProductModel, CategoryModel } from '../../inventory/products/types';


const CategoryButton = memo(({ 
  category,
  isSelected,
  onSelect
}: {
  category: CategoryModel;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) => (
  <Pressable
    key={category.id}
    style={[
      styles.categoryButton,
      isSelected && styles.categoryButtonActive
    ]}
    onPress={() => onSelect(category.id)}
  >
    <Text style={[
      styles.categoryButtonText,
      isSelected && styles.categoryButtonTextActive
    ]}>
      {category.name}
    </Text>
  </Pressable>
));


const ProductCard = memo(({ 
  product, 
  onSelect 
}: { 
  product: ProductModel; 
  onSelect: (product: ProductModel) => void;
}) => (
  <Pressable
    style={styles.productCard}
    onPress={() => onSelect(product)}
  >
    <Text 
      style={styles.productName}
      numberOfLines={2}
      adjustsFontSizeToFit
    >
      {product.name}
    </Text>
    <Text style={styles.productPrice}>
      ksh{product.price.toFixed(2)}
    </Text>
  </Pressable>
));

const ProductsSection: React.FC<ProductsSectionProps> = memo(({
  categories,
  selectedCategory,
  onCategorySelect,
  filteredProducts,
  onProductSelect,
  loadingMore,
  onScroll
}) => {
  
  const renderCategories = useMemo(() => (
    categories.map(category => (
      <CategoryButton
        key={category.id}
        category={category}
        isSelected={selectedCategory === category.id}
        onSelect={onCategorySelect}
      />
    ))
  ), [categories, selectedCategory, onCategorySelect]);

  
  const renderProduct = ({ item: product }: { item: ProductModel }) => (
    <ProductCard
      key={product.id}
      product={product}
      onSelect={onProductSelect}
    />
  );

  // Memoize key extractor
  const keyExtractor = (item: ProductModel) => item.id;

  return (
    <View style={styles.productsSection}>
      {/* Categories - Horizontal ScrollView */}
      <ScrollView 
        horizontal 
        style={styles.categoriesList}
        showsHorizontalScrollIndicator={false}
        bounces={false}
        decelerationRate="fast"
        snapToAlignment="start"
      >
        {renderCategories}
      </ScrollView>

      {/* Products - Virtualized List */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={keyExtractor}
        numColumns={5}
        columnWrapperStyle={styles.productRow}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={5}
        initialNumToRender={20}
        ListFooterComponent={loadingMore ? (
          <ActivityIndicator 
            size="large" 
            color="#000080" 
            style={styles.loadingMore} 
          />
        ) : null}
        getItemLayout={(data, index) => ({
          length: PRODUCT_CARD_SIZE,
          offset: PRODUCT_CARD_SIZE * Math.floor(index / 5),
          index,
        })}
      />
    </View>
  );
});


const PRODUCT_CARD_SIZE = 150;

const styles = StyleSheet.create({
  productsSection: {
    width: '50%',
    padding: 15,
  },
  categoriesList: {
    maxHeight: 50,
    marginBottom: 15,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minWidth: 100,
    alignItems: 'center',
  },
  categoryButtonActive: {
    backgroundColor: '#000080',
    borderColor: '#000080',
  },
  categoryButtonText: {
    fontSize: 16,
    color: '#374151',
  },
  categoryButtonTextActive: {
    color: '#FFF',
  },
  productRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 5,
  },
  productCard: {
    width: `${100 / 5 - 2}%`,
    aspectRatio: 1,
    padding: 15,
    backgroundColor: '#FFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    margin: 5,
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 14,
    color: '#000080',
    fontWeight: '500',
  },
  loadingMore: {
    padding: 20,
  },
});

export default memo(ProductsSection);