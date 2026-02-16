'use client';

import type { Product } from '@/types/marketplace';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, MapPin, Phone, X } from 'lucide-react';
import { generateWhatsAppLink, formatPrice, productsApi } from '@/lib/api';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Extract image URLs
  const getMainImageUrl = () => {
    if (!product.main_image || product.main_image.length === 0) return null;
    const image = product.main_image[0];
    return image.large_url || image.url;
  };

  const getSecondaryImageUrl = () => {
    if (!product.secondary_image || product.secondary_image.length === 0) return null;
    const image = product.secondary_image[0];
    return image.large_url || image.url;
  };

  const mainImageUrl = getMainImageUrl();
  const secondaryImageUrl = getSecondaryImageUrl();
  
  // Combine images for card carousel
  const cardImages = [mainImageUrl, secondaryImageUrl].filter(Boolean) as string[];
  
  // Combine images for modal gallery
  const allImages = [mainImageUrl, secondaryImageUrl].filter(Boolean) as string[];

  // Extract color and size attributes
  const getColorAttribute = () => {
    return product.attribute_values?.find(attr => 
      attr.attribute?.name?.toLowerCase() === 'color'
    )?.value;
  };

  const getSizeAttribute = () => {
    return product.attribute_values?.find(attr => 
      attr.attribute?.name?.toLowerCase() === 'size'
    )?.value;
  };

  const color = getColorAttribute();
  const size = getSizeAttribute();

  // Handlers
  const handleWhatsAppClick = () => {
    if (!product.shop?.whatsapp_number) return;
    
    // Track WhatsApp click (fire-and-forget)
    productsApi.trackWhatsAppClick(product.slug);
    
    const message = `Hi, I'm interested in ${product.name}`;
    window.open(generateWhatsAppLink(product.shop.whatsapp_number, message), '_blank');
  };

  const handleLocationClick = () => {
    if (!product.shop?.location) return;
    
    // Track location click (fire-and-forget)
    productsApi.trackLocationClick(product.slug);
    
    const { latitude, longitude } = product.shop.location;
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    window.open(mapsUrl, '_blank');
  };

  const handleCardClick = () => {
    // Track product view when modal opens (fire-and-forget)
    productsApi.trackView(product.slug);
    
    setIsDialogOpen(true);
  };

  const handleImageScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollLeft = container.scrollLeft;
    const imageWidth = container.offsetWidth;
    const newIndex = Math.round(scrollLeft / imageWidth);
    setCurrentImageIndex(newIndex);
  };

  return (
    <>
      {/* Product Card - Professional E-commerce Style */}
      <div 
        className="group cursor-pointer bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg"
        onClick={handleCardClick}
      >
        {/* Image Container - Slider on Mobile, Hover on Desktop */}
        <div className="relative">
          {/* Mobile: Horizontal Scroll Slider */}
          <div className="lg:hidden">
            <div 
              className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide aspect-3/4"
              onScroll={handleImageScroll}
            >
              {cardImages.length > 0 ? (
                cardImages.map((imageUrl, index) => (
                  <div 
                    key={index}
                    className="w-full shrink-0 snap-center relative bg-gray-50 dark:bg-gray-900"
                  >
                    <img
                      src={imageUrl}
                      alt={`${product.name} - view ${index + 1}`}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))
              ) : (
                <div className="w-full shrink-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-5xl text-gray-300 dark:text-gray-600">
                  📦
                </div>
              )}
            </div>

            {/* Dots Indicator - Mobile Only */}
            {cardImages.length > 1 && (
              <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-10">
                {cardImages.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      index === currentImageIndex 
                        ? 'w-6 bg-white' 
                        : 'w-1.5 bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Desktop: Hover Effect */}
          <div className="hidden lg:block aspect-3/4 bg-gray-50 dark:bg-gray-900 overflow-hidden relative">
            {/* Main Image */}
            {mainImageUrl && (
              <img
                src={mainImageUrl}
                alt={product.name}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-in-out group-hover:opacity-0 group-hover:scale-105"
              />
            )}
            
            {/* Secondary Image - Shows on Hover (Desktop Only) */}
            {secondaryImageUrl && (
              <img
                src={secondaryImageUrl}
                alt={`${product.name} - alternate view`}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover opacity-0 scale-105 transition-all duration-700 ease-in-out group-hover:opacity-100 group-hover:scale-100"
              />
            )}
            
            {/* Fallback if no images */}
            {!mainImageUrl && !secondaryImageUrl && (
              <div className="absolute inset-0 flex items-center justify-center text-5xl text-gray-300 dark:text-gray-600">
                📦
              </div>
            )}
          </div>
          
          {/* Discount Badge */}
          {product.has_discount && product.discount_value && (
            <div className="absolute top-2 left-2 z-10">
              <Badge className="bg-red-500 text-white font-semibold px-2 py-1">
                -{product.discount_value}{product.discount_type === 'percent' ? '%' : ' EGP'}
              </Badge>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-3 space-y-2">
          {/* Combined Text: Name + Description + Attributes */}
          <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-3 leading-relaxed">
            {product.name}
            {product.description && ` ${product.description}`}
            {(color || size) && (
              <>
                {' '}
                {color && color}
                {color && size && ' '}
                {size && size}
              </>
            )}
          </h3>

          {/* Price Section */}
          <div className="flex items-center gap-2 pt-1">
            {product.has_discount && product.discounted_price ? (
              <>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatPrice(product.discounted_price)}
                </span>
                <span className="text-sm text-gray-400 dark:text-gray-500 line-through">
                  {formatPrice(product.price)}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Product Details Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[95vh] p-0 gap-0 overflow-hidden">
          {/* Visually Hidden Title for Accessibility */}
          <DialogTitle className="sr-only">{product.name}</DialogTitle>
          
          <button
            onClick={() => setIsDialogOpen(false)}
            className="absolute right-4 top-4 z-50 rounded-full bg-white dark:bg-gray-800 p-2 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Scrollable Content */}
          <div className="overflow-y-auto max-h-[95vh]">
            {/* Image Carousel - Slider on Mobile, Hover on Desktop */}
            <div className="relative">
              {/* Mobile: Horizontal Scroll Slider */}
              <div className="lg:hidden">
                <div 
                  className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide aspect-square"
                  onScroll={handleImageScroll}
                >
                  {allImages.length > 0 ? (
                    allImages.map((imageUrl, index) => (
                      <div 
                        key={index}
                        className="w-full shrink-0 snap-center relative bg-gray-50 dark:bg-gray-900"
                      >
                        <img
                          src={imageUrl}
                          alt={`${product.name} - view ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))
                  ) : (
                    <div className="w-full shrink-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-6xl text-gray-300 dark:text-gray-600">
                      📦
                    </div>
                  )}
                </div>

                {/* Dots Indicator - Mobile Only */}
                {allImages.length > 1 && (
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10">
                    {allImages.map((_, index) => (
                      <div
                        key={index}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          index === currentImageIndex 
                            ? 'w-6 bg-white' 
                            : 'w-1.5 bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Desktop: Hover Effect */}
              <div className="hidden lg:block aspect-video bg-gray-50 dark:bg-gray-900 overflow-hidden relative group">
                {/* Main Image */}
                {mainImageUrl && (
                  <img
                    src={mainImageUrl}
                    alt={product.name}
                    className="absolute inset-0 h-full w-full object-contain transition-all duration-700 ease-in-out group-hover:opacity-0 group-hover:scale-105"
                  />
                )}
                
                {/* Secondary Image - Shows on Hover (Desktop Only) */}
                {secondaryImageUrl && (
                  <img
                    src={secondaryImageUrl}
                    alt={`${product.name} - alternate view`}
                    className="absolute inset-0 h-full w-full object-contain opacity-0 scale-105 transition-all duration-700 ease-in-out group-hover:opacity-100 group-hover:scale-100"
                  />
                )}
                
                {/* Fallback if no images */}
                {!mainImageUrl && !secondaryImageUrl && (
                  <div className="absolute inset-0 flex items-center justify-center text-6xl text-gray-300 dark:text-gray-600">
                    📦
                  </div>
                )}
              </div>
            </div>

            {/* Product Details */}
            <div className="p-6 space-y-6 bg-white dark:bg-gray-800">
              {/* Product Name */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{product.name}</h2>
                {product.shop && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">by {product.shop.name}</p>
                )}
              </div>

              {/* Price */}
              <div className="border-t border-b border-gray-200 dark:border-gray-700 py-4">
                <div className="flex items-center gap-3">
                  {product.has_discount && product.discounted_price ? (
                    <>
                      <span className="text-3xl font-bold text-gray-900 dark:text-white">
                        {formatPrice(product.discounted_price)}
                      </span>
                      <span className="text-xl text-gray-400 dark:text-gray-500 line-through">
                        {formatPrice(product.price)}
                      </span>
                      {product.discount_value && (
                        <Badge className="bg-red-500 text-white">
                          -{product.discount_value}{product.discount_type === 'percent' ? '%' : ' EGP'}
                        </Badge>
                      )}
                    </>
                  ) : (
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                      {formatPrice(product.price)}
                    </span>
                  )}
                </div>
                {product.has_discount && product.savings_amount && (
                  <p className="mt-2 text-sm text-green-600 dark:text-green-400 font-medium">
                    You save {formatPrice(product.savings_amount)}
                  </p>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Attributes */}
              {product.attribute_values && product.attribute_values.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Product Details</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.attribute_values.map((attr) => (
                      <Badge key={attr.id} variant="outline" className="text-sm px-3 py-1">
                        {attr.value}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Shop Information & Contact */}
              {product.shop && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-3">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Shop Contact Information</h3>
                  
                  {/* Location - Clickable */}
                  {product.shop.location && (
                    <button
                      onClick={handleLocationClick}
                      className="w-full flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors text-left"
                    >
                      <div className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-full shrink-0">
                        <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Shop Location</p>
                        <p className="text-sm text-blue-600 dark:text-blue-400 font-medium truncate">
                          {product.shop.location.full_address || product.shop.location.area}
                        </p>
                      </div>
                    </button>
                  )}

                  {/* Phone - Display Only (Not Clickable) */}
                  {product.shop.phone_number && (
                    <div className="w-full flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-left">
                      <div className="flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-gray-600 rounded-full shrink-0">
                        <Phone className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                          {product.shop.phone_number}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Primary Contact Button */}
              {product.shop?.whatsapp_number && (
                <Button
                  className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold text-base"
                  onClick={handleWhatsAppClick}
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Contact on WhatsApp
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
