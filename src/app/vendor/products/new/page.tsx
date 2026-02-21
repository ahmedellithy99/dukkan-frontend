'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { ProductForm } from '@/components/vendor/ProductForm';
import { ImageUpload } from '@/components/vendor/ImageUpload';
import { vendorApi } from '@/lib/api';
import type { ProductFormData, MediaResource } from '@/types/marketplace';

export default function NewProductPage() {
  const router = useRouter();
  const [step, setStep] = useState<'form' | 'images'>('form');
  const [createdProductId, setCreatedProductId] = useState<number | null>(null);
  const [createdProductSlug, setCreatedProductSlug] = useState<string | null>(null);
  const [shopSlug, setShopSlug] = useState<string | null>(null);
  const [mainImage, setMainImage] = useState<MediaResource | null>(null);
  const [secondaryImages, setSecondaryImages] = useState<MediaResource[]>([]);
  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingSecondary, setUploadingSecondary] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [productFormData, setProductFormData] = useState<ProductFormData | null>(null);

  // Handle product form submission
  const handleProductSubmit = async (data: ProductFormData) => {
    const token = localStorage.getItem('vendor_token');

    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }

    try {
      setError(null);

      // Get shop ID from vendor's shops
      const shopsResponse = await vendorApi.getMyShops(token);

      if (!shopsResponse.data || shopsResponse.data.length === 0) {
        throw new Error('No shop found. Please create a shop first.');
      }

      const currentShop = shopsResponse.data[0];
      setShopSlug(currentShop.slug);

      // Create product without images
      const productResponse = await vendorApi.createProduct(
        token,
        currentShop.slug,
        data
      );

      if (!productResponse.data) {
        throw new Error('Failed to create product');
      }

      // Store product ID and slug for image uploads
      setCreatedProductId(productResponse.data.id);
      setCreatedProductSlug(productResponse.data.slug);
      setProductFormData(data);

      // Move to image upload step
      setStep('images');
    } catch (err) {
      console.error('Failed to create product:', err);
      throw err;
    }
  };

  // Handle main image upload
  const handleMainImageUpload = async (file: File) => {
    const token = localStorage.getItem('vendor_token');

    if (!token || !shopSlug || !createdProductSlug) {
      throw new Error('Missing required data for image upload');
    }

    setUploadingMain(true);
    setError(null);

    try {
      const response = await vendorApi.uploadMainImage(
        token,
        shopSlug,
        createdProductSlug,
        file
      );

      if (response.data) {
        setMainImage(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload main image');
      throw err;
    } finally {
      setUploadingMain(false);
    }
  };

  // Handle main image delete
  const handleMainImageDelete = async () => {
    const token = localStorage.getItem('vendor_token');

    if (!token || !shopSlug || !createdProductSlug) {
      throw new Error('Missing required data for image deletion');
    }

    setError(null);

    try {
      await vendorApi.deleteMainImage(token, shopSlug, createdProductSlug);
      setMainImage(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete main image');
      throw err;
    }
  };

  // Handle secondary image upload
  const handleSecondaryImageUpload = async (file: File) => {
    const token = localStorage.getItem('vendor_token');

    if (!token || !shopSlug || !createdProductSlug) {
      throw new Error('Missing required data for image upload');
    }

    setUploadingSecondary(true);
    setError(null);

    try {
      const response = await vendorApi.uploadSecondaryImage(
        token,
        shopSlug,
        createdProductSlug,
        file
      );

      if (response.data) {
        setSecondaryImages((prev) => [...prev, response.data]);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to upload secondary image'
      );
      throw err;
    } finally {
      setUploadingSecondary(false);
    }
  };

  // Handle secondary image delete
  const handleSecondaryImageDelete = async (index: number) => {
    const token = localStorage.getItem('vendor_token');

    if (!token || !shopSlug || !createdProductSlug) {
      throw new Error('Missing required data for image deletion');
    }

    setError(null);

    try {
      await vendorApi.deleteSecondaryImage(token, shopSlug, createdProductSlug);
      setSecondaryImages((prev) => prev.filter((_, i) => i !== index));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to delete secondary image'
      );
      throw err;
    }
  };

  // Handle finish and apply discount if specified
  const handleFinish = async () => {
    const token = localStorage.getItem('vendor_token');

    if (!token || !shopSlug || !createdProductSlug || !productFormData) {
      setError('Missing required data');
      return;
    }

    try {
      setError(null);

      // Apply discount if specified
      if (
        productFormData.discount_type &&
        productFormData.discount_value &&
        productFormData.discount_value > 0
      ) {
        await vendorApi.applyDiscount(
          token,
          shopSlug,
          createdProductSlug,
          productFormData.discount_type,
          productFormData.discount_value
        );
      }

      // Redirect to products list
      router.push('/vendor/products');
    } catch (err) {
      console.error('Failed to apply discount:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to apply discount'
      );
    }
  };

  // Handle skip images and go directly to products list
  const handleSkipImages = () => {
    router.push('/vendor/products');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => {
              if (step === 'images') {
                setStep('form');
              } else {
                router.back();
              }
            }}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>

          <h1 className="text-2xl font-bold">Add New Product</h1>
          <p className="text-muted-foreground">
            {step === 'form'
              ? 'Fill in the product details'
              : 'Upload product images'}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === 'form'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-green-500 text-white'
                }`}
              >
                {step === 'form' ? '1' : '✓'}
              </div>
              <span className="text-sm font-medium">Product Details</span>
            </div>

            <div className="flex-1 h-0.5 bg-gray-200 dark:bg-gray-700" />

            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === 'images'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                }`}
              >
                2
              </div>
              <span className="text-sm font-medium">Product Images</span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
            <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Step Content */}
        {step === 'form' ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <ProductForm
              onSubmit={handleProductSubmit}
              onCancel={() => router.back()}
            />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold mb-4">Product Images</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Upload high-quality images of your product. The main image is
                required and will be displayed as the primary product image.
              </p>

              {/* Main Image Upload */}
              <div className="mb-8">
                <ImageUpload
                  label="Main Product Image"
                  currentImage={mainImage || undefined}
                  onUpload={handleMainImageUpload}
                  onDelete={mainImage ? handleMainImageDelete : undefined}
                  required
                  maxSize={5}
                />
              </div>

              {/* Secondary Images Upload */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">
                    Secondary Images (Optional)
                  </h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    Add up to 4 additional images to showcase your product from
                    different angles
                  </p>
                </div>

                {/* Display existing secondary images */}
                {secondaryImages.length > 0 && (
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {secondaryImages.map((image, index) => (
                      <div key={image.id} className="relative group">
                        <div className="aspect-video rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                          <img
                            src={image.large_url || image.url}
                            alt={`Secondary ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          onClick={() => handleSecondaryImageDelete(index)}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add more secondary images */}
                {secondaryImages.length < 4 && (
                  <ImageUpload
                    label={`Secondary Image ${secondaryImages.length + 1}`}
                    onUpload={handleSecondaryImageUpload}
                    required={false}
                    maxSize={5}
                  />
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={handleSkipImages}
                className="px-6 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip Images
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setStep('form')}
                  className="px-6 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Back to Details
                </button>

                <button
                  onClick={handleFinish}
                  disabled={!mainImage || uploadingMain || uploadingSecondary}
                  className="px-6 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {uploadingMain || uploadingSecondary ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    'Finish & View Products'
                  )}
                </button>
              </div>
            </div>

            {/* Help Text */}
            {!mainImage && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark:text-blue-400">
                  <strong>Tip:</strong> Upload a main image to complete your
                  product listing. High-quality images help customers make
                  informed decisions.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
