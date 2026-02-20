'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Product,
  ProductFormData,
  Category,
  Subcategory,
  Attribute,
} from '@/types/marketplace';
import { categoriesApi, attributesApi } from '@/lib/api';
import { cn } from '@/lib/utils';

interface ProductFormProps {
  initialData?: Product;
  shopId: number;
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
}

export function ProductForm({
  initialData,
  shopId,
  onSubmit,
  onCancel,
}: ProductFormProps) {
  // Form state
  const [formData, setFormData] = useState<ProductFormData>({
    subcategory_id: initialData?.subcategory?.id || 0,
    name: initialData?.name || '',
    description: initialData?.description || '',
    price: initialData?.price || 0,
    stock_quantity: initialData?.stock_quantity || 0,
    is_active: initialData?.is_active ?? true,
    attribute_values: initialData?.attribute_values?.map((av) => av.id) || [],
    discount_type: initialData?.discount_type,
    discount_value: initialData?.discount_value,
  });

  // Loading states
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);
  const [loadingAttributes, setLoadingAttributes] = useState(true);

  // Data states
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Error states
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await categoriesApi.getAll();
        setCategories(response.data || []);

        // If editing, set the selected category
        if (initialData?.subcategory?.category) {
          setSelectedCategory(initialData.subcategory.category.slug);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        setApiError('Failed to load categories');
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [initialData]);

  // Fetch subcategories when category changes
  useEffect(() => {
    const fetchSubcategories = async () => {
      if (!selectedCategory) {
        setSubcategories([]);
        return;
      }

      try {
        setLoadingSubcategories(true);
        const response = await categoriesApi.getSubcategories(selectedCategory);
        setSubcategories(response.data || []);
      } catch (error) {
        console.error('Failed to fetch subcategories:', error);
        setApiError('Failed to load subcategories');
      } finally {
        setLoadingSubcategories(false);
      }
    };

    fetchSubcategories();
  }, [selectedCategory]);

  // Fetch attributes on mount
  useEffect(() => {
    const fetchAttributes = async () => {
      try {
        setLoadingAttributes(true);
        const response = await attributesApi.getAll();
        setAttributes(response.data || []);
      } catch (error) {
        console.error('Failed to fetch attributes:', error);
        setApiError('Failed to load attributes');
      } finally {
        setLoadingAttributes(false);
      }
    };

    fetchAttributes();
  }, []);

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (formData.subcategory_id === 0) {
      newErrors.subcategory_id = 'Please select a subcategory';
    }

    if (formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }

    if (formData.stock_quantity < 0) {
      newErrors.stock_quantity = 'Stock quantity cannot be negative';
    }

    if (formData.discount_type && formData.discount_value) {
      if (formData.discount_type === 'percent' && formData.discount_value > 100) {
        newErrors.discount_value = 'Discount percentage cannot exceed 100%';
      }
      if (formData.discount_value <= 0) {
        newErrors.discount_value = 'Discount value must be greater than 0';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await onSubmit(formData);
    } catch (error) {
      setApiError(
        error instanceof Error ? error.message : 'Failed to save product'
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle field changes
  const handleChange = (
    field: keyof ProductFormData,
    value: string | number | boolean | number[] | undefined
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Handle attribute value toggle
  const toggleAttributeValue = (attributeValueId: number) => {
    setFormData((prev) => {
      const currentValues = prev.attribute_values || [];
      const newValues = currentValues.includes(attributeValueId)
        ? currentValues.filter((id) => id !== attributeValueId)
        : [...currentValues, attributeValueId];
      return { ...prev, attribute_values: newValues };
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* API Error */}
      {apiError && (
        <div className="rounded-md bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-800">{apiError}</p>
        </div>
      )}

      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Basic Information</h3>

        {/* Product Name */}
        <div className="space-y-2">
          <Label htmlFor="name">
            Product Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Enter product name"
            className={cn(errors.name && 'border-red-500')}
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Enter product description"
            rows={4}
          />
        </div>
      </div>

      <Separator />

      {/* Category & Subcategory */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Category</h3>

        {/* Category Selection */}
        <div className="space-y-2">
          <Label htmlFor="category">
            Category <span className="text-red-500">*</span>
          </Label>
          <Select
            value={selectedCategory}
            onValueChange={setSelectedCategory}
            disabled={loadingCategories}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {loadingCategories ? (
                <div className="p-2 text-center text-sm text-gray-500">
                  Loading categories...
                </div>
              ) : categories.length === 0 ? (
                <div className="p-2 text-center text-sm text-gray-500">
                  No categories available
                </div>
              ) : (
                categories.map((category) => (
                  <SelectItem key={category.id} value={category.slug}>
                    {category.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Subcategory Selection */}
        <div className="space-y-2">
          <Label htmlFor="subcategory">
            Subcategory <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.subcategory_id.toString()}
            onValueChange={(value) =>
              handleChange('subcategory_id', parseInt(value))
            }
            disabled={!selectedCategory || loadingSubcategories}
          >
            <SelectTrigger
              id="subcategory"
              className={cn(errors.subcategory_id && 'border-red-500')}
            >
              <SelectValue placeholder="Select a subcategory" />
            </SelectTrigger>
            <SelectContent>
              {loadingSubcategories ? (
                <div className="p-2 text-center text-sm text-gray-500">
                  Loading subcategories...
                </div>
              ) : subcategories.length === 0 ? (
                <div className="p-2 text-center text-sm text-gray-500">
                  {selectedCategory
                    ? 'No subcategories available'
                    : 'Please select a category first'}
                </div>
              ) : (
                subcategories.map((subcategory) => (
                  <SelectItem
                    key={subcategory.id}
                    value={subcategory.id.toString()}
                  >
                    {subcategory.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {errors.subcategory_id && (
            <p className="text-sm text-red-500">{errors.subcategory_id}</p>
          )}
        </div>
      </div>

      <Separator />

      {/* Pricing & Stock */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Pricing & Stock</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price">
              Price (EGP) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => handleChange('price', parseFloat(e.target.value))}
              placeholder="0.00"
              className={cn(errors.price && 'border-red-500')}
            />
            {errors.price && (
              <p className="text-sm text-red-500">{errors.price}</p>
            )}
          </div>

          {/* Stock Quantity */}
          <div className="space-y-2">
            <Label htmlFor="stock_quantity">
              Stock Quantity <span className="text-red-500">*</span>
            </Label>
            <Input
              id="stock_quantity"
              type="number"
              min="0"
              value={formData.stock_quantity}
              onChange={(e) =>
                handleChange('stock_quantity', parseInt(e.target.value))
              }
              placeholder="0"
              className={cn(errors.stock_quantity && 'border-red-500')}
            />
            {errors.stock_quantity && (
              <p className="text-sm text-red-500">{errors.stock_quantity}</p>
            )}
          </div>
        </div>
      </div>

      <Separator />

      {/* Attributes */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Attributes</h3>

        {loadingAttributes ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            <span className="ml-2 text-sm text-gray-500">
              Loading attributes...
            </span>
          </div>
        ) : attributes.length === 0 ? (
          <p className="text-sm text-gray-500">No attributes available</p>
        ) : (
          <div className="space-y-4">
            {attributes.map((attribute) => (
              <div key={attribute.id} className="space-y-2">
                <Label>{attribute.name}</Label>
                <div className="flex flex-wrap gap-2">
                  {attribute.attribute_values?.map((value) => (
                    <button
                      key={value.id}
                      type="button"
                      onClick={() => toggleAttributeValue(value.id)}
                      className={cn(
                        'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                        formData.attribute_values?.includes(value.id)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      )}
                    >
                      {value.value}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Discount Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Discount (Optional)</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Discount Type */}
          <div className="space-y-2">
            <Label htmlFor="discount_type">Discount Type</Label>
            <Select
              value={formData.discount_type || 'none'}
              onValueChange={(value) =>
                handleChange(
                  'discount_type',
                  value === 'none' ? undefined : (value as 'percent' | 'amount')
                )
              }
            >
              <SelectTrigger id="discount_type">
                <SelectValue placeholder="No discount" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No discount</SelectItem>
                <SelectItem value="percent">Percentage (%)</SelectItem>
                <SelectItem value="amount">Fixed Amount (EGP)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Discount Value */}
          {formData.discount_type && (
            <div className="space-y-2">
              <Label htmlFor="discount_value">
                Discount Value{' '}
                {formData.discount_type === 'percent' ? '(%)' : '(EGP)'}
              </Label>
              <Input
                id="discount_value"
                type="number"
                step="0.01"
                min="0"
                max={formData.discount_type === 'percent' ? 100 : undefined}
                value={formData.discount_value || ''}
                onChange={(e) =>
                  handleChange('discount_value', parseFloat(e.target.value))
                }
                placeholder="0"
                className={cn(errors.discount_value && 'border-red-500')}
              />
              {errors.discount_value && (
                <p className="text-sm text-red-500">{errors.discount_value}</p>
              )}
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Active Status */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="is_active">Active Status</Label>
          <p className="text-sm text-gray-500">
            Make this product visible to customers
          </p>
        </div>
        <Switch
          id="is_active"
          checked={formData.is_active}
          onCheckedChange={(checked) => handleChange('is_active', checked)}
        />
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  );
}
