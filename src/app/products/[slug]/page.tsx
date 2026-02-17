'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { productsApi, formatPrice, generateWhatsAppLink } from '@/lib/api';
import type { Product } from '@/types/marketplace';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, MapPin, Phone, ArrowLeft, Share2 } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await productsApi.getBySlug(slug);
        setProduct(response.data);
        
        // Track product view
        productsApi.trackView(slug);
      } catch (err) {
        console.error('Failed to fetch product:', err);
        setError('Failed to load product. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  const handleWhatsAppClick = () => {
    if (!product?.shop?.whatsapp_number) return;
    
    // Track WhatsApp click
    productsApi.trackWhatsAppClick(product.slug);
    
    const message = `Hi, I'm interested in ${product.name}`;
    window.open(generateWhatsAppLink(product.shop.whatsapp_number, message), '_blank');
  };

  const handleLocationClick = () => {
    if (!product?.shop?.location) return;
    
    // Track location click
    productsApi.trackLocationClick(product.slug);
    
    const { latitude, longitude } = product.shop.location;
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    window.open(mapsUrl, '_blank');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: product?.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  // Get all images
  const allImages = [
    ...(product?.main_image || []),
    ...(product?.secondary_image || []),
  ];

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading product...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error || 'Product not found'}</p>
            <Button onClick={() => router.push('/products')}>
              Back to Products
            </Button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-6">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="aspect-square bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
                {allImages.length > 0 ? (
                  <img
                    src={allImages[currentImageIndex].large_url || allImages[currentImageIndex].url}
                    alt={product.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl text-gray-300">
                    📦
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {allImages.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {allImages.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`aspect-square bg-white dark:bg-gray-800 rounded-lg overflow-hidden border-2 transition-all ${
                        index === currentImageIndex
                          ? 'border-primary'
                          : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={image.thumb_url || image.url}
                        alt={`${product.name} - view ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Product Info */}
            <div className="space-y-6">
              {/* Product Name & Share */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {product.name}
                  </h1>
                  {product.shop && (
                    <p className="text-muted-foreground">by {product.shop.name}</p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Price */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                  {product.has_discount && product.discounted_price ? (
                    <>
                      <span className="text-4xl font-bold text-gray-900 dark:text-white">
                        {formatPrice(product.discounted_price)}
                      </span>
                      <span className="text-2xl text-gray-400 dark:text-gray-500 line-through">
                        {formatPrice(product.price)}
                      </span>
                      {product.discount_value && (
                        <Badge className="bg-red-500 text-white">
                          -{product.discount_value}{product.discount_type === 'percent' ? '%' : ' EGP'}
                        </Badge>
                      )}
                    </>
                  ) : (
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">
                      {formatPrice(product.price)}
                    </span>
                  )}
                </div>
                {product.has_discount && product.savings_amount && (
                  <p className="text-green-600 dark:text-green-400 font-medium">
                    You save {formatPrice(product.savings_amount)}
                  </p>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Description
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Attributes */}
              {product.attribute_values && product.attribute_values.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Product Details
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {product.attribute_values.map((attr) => (
                      <Badge key={attr.id} variant="outline" className="text-sm px-3 py-1">
                        {attr.attribute?.name}: {attr.value}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Shop Contact Information */}
              {product.shop && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 space-y-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Shop Contact Information
                  </h2>

                  {/* Location */}
                  {product.shop.location && (
                    <button
                      onClick={handleLocationClick}
                      className="w-full flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors text-left"
                    >
                      <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-full shrink-0">
                        <MapPin className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Shop Location</p>
                        <p className="text-base text-blue-600 dark:text-blue-400 font-medium truncate">
                          {product.shop.location.full_address || product.shop.location.area}
                        </p>
                      </div>
                    </button>
                  )}

                  {/* Phone */}
                  {product.shop.phone_number && (
                    <div className="w-full flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-center justify-center w-12 h-12 bg-gray-100 dark:bg-gray-600 rounded-full shrink-0">
                        <Phone className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                        <p className="text-base text-gray-600 dark:text-gray-300 font-medium">
                          {product.shop.phone_number}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* WhatsApp Button */}
                  {product.shop.whatsapp_number && (
                    <Button
                      className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-semibold text-lg"
                      onClick={handleWhatsAppClick}
                    >
                      <MessageCircle className="h-6 w-6 mr-2" />
                      Contact on WhatsApp
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
