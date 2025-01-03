import { Model } from '@nozbe/watermelondb';
import type { Relation } from '@nozbe/watermelondb';
import type Category from '../../../models/category';

export interface CategoryModel extends Model {
    id: string;
    name: string;
    description: string;
    dateAdded: number;
    dateUpdated: number;
}

export interface ProductModel extends Model {
    id: string;
    code: string;
    name: string;
    description: string;
    price: number;
    cost: number;
    taxRate: number;
    baseQuantity: number;
    conversionFactor: number;
    defaultUnit: string;
    baseUnit: string;
    dateAdded: number;
    dateUpdated: number;
    category: Relation<Category>;
    profitMargin: number;
}

export interface FormData {
    name: string;
    description: string;
    code: string;
    price: string;
    cost: string;
    taxRate: string;
    baseQuantity: string;
    conversionFactor: string;
    defaultUnit: string;
    baseUnit: string;
    categoryId: string;
}