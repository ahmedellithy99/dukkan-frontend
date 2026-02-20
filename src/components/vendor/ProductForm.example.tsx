/**
 * ProductForm Component Example Usage
 * 
 * This file demonstrates how to use the ProductForm component
 * in both create and edit modes.
 */

import { ProductForm } from './ProductForm';
import { Product, ProductFormData } from '@/types/marketplace';

// Example 1: Create new product
export function CreateProductExample() {
  const handleSubmit = async (data: ProductFormData) => {
    console.log('Creating product:', data);
    // Call API to create product
    // await vendorApi.createProduct(token, shopSlug, data);
  };

  const handleCancel = () => {
    console.log('Cancelled');
    // Navigate back or close form
  };

  return (
    <ProductForm
      shopId={1}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
}

// Example 2: Edit existing product
export function EditProductExample() {
  const existingProduct: Product = {
    id: 1,
    name: 'Samsung Galaxy S21',
    slug: 'samsung-galaxy-s21',
    description: 'Latest Samsung flagship phone',
    price: 799.99,
    stock_quantity: 50,
    is_active: true,
    has_discount: true,
    discount_type: 'percent',
    discount_value: 20,
    discounted_price: 639.99,
    subcategory: {
      id: 10,
      category_id: 2,
      name: 'Smartphones',
      slug: 'smartphones',
    },
    attribute_values: [
      { id: 12, value: 'Black', slug: 'black' },
      { id: 44, value: '128GB', slug: '128gb' },
    ],
  };

  const handleSubmit = async (data: ProductFormData) => {
    console.log('Updating product:', data);
    // Call API to update product
    // await vendorApi.updateProduct(token, shopSlug, productSlug, data);
  };

  const handleCancel = () => {
    console.log('Cancelled');
    // Navigate back or close form
  };

  return (
    <ProductForm
      initialData={existingProduct}
      shopId={1}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
}

// Example 3: With error handling
export function ProductFormWithErrorHandling() {
  const handleSubmit = async (data: ProductFormData) => {
    try {
      // Simulate API call
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate random success/failure
          if (Math.random() > 0.5) {
            resolve({ success: true });
          } else {
            reject(new Error('Failed to save product'));
          }
        }, 1000);
      });
      
      console.log('Product saved successfully');
      // Show success message
      // Navigate to products list
    } catch (error) {
      console.error('Failed to save product:', error);
      // Error is handled by the form component
      throw error;
    }
  };

  const handleCancel = () => {
    console.log('Cancelled');
  };

  return (
    <ProductForm
      shopId={1}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
}
