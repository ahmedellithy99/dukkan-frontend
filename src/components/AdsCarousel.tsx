'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { AdCarousel } from '@/types/marketplace';

interface AdsCarouselProps {
  ads: AdCarousel[];
}

export function AdsCarousel({ ads }: AdsCarouselProps) {
  // Helper function to get image URL from carousel_image (single or array)
  const getImageUrl = (ad: AdCarousel): string | null => {
    if (!ad.carousel_image) return null;
    
    // Handle array of MediaResource (website endpoint)
    if (Array.isArray(ad.carousel_image)) {
      if (ad.carousel_image.length === 0) return null;
      const firstImage = ad.carousel_image[0];
      return firstImage.large_url || firstImage.url;
    }
    
    // Handle single MediaResource (admin endpoint)
    return ad.carousel_image.large_url || ad.carousel_image.url || null;
  };

  // Filter out ads that don't have required data - MUST be before any hooks
  const validAds = ads?.filter(ad => {
    const hasImage = getImageUrl(ad);
    const hasTitle = ad.title;
    return hasImage || hasTitle; // At least one of these should exist
  }) || [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Debug logging
  console.log('AdsCarousel rendered with:', {
    adsCount: ads?.length || 0,
    validAdsCount: validAds.length,
    ads: ads,
    firstAd: ads?.[0]
  });

  const nextSlide = useCallback(() => {
    if (validAds.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % validAds.length);
  }, [validAds.length]);

  const prevSlide = useCallback(() => {
    if (validAds.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + validAds.length) % validAds.length);
  }, [validAds.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // Auto-scroll every 5 seconds
  useEffect(() => {
    if (isPaused || validAds.length === 0) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused, nextSlide, validAds.length]);

  const handleBannerClick = (ad: AdCarousel) => {
    if (ad.link_url) {
      window.open(ad.link_url, '_blank');
    }
  };

  // If no ads provided, show a loading skeleton or placeholder
  if (!ads || ads.length === 0) {
    return (
      <div className="relative w-full overflow-hidden bg-gradient-to-br from-muted to-muted/50">
        <div className="relative h-[300px] sm:h-[400px] md:h-[450px] lg:h-[500px] flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <div className="animate-pulse">
              <div className="text-4xl mb-4">🎪</div>
              <p className="text-lg">Loading promotions...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If no valid ads after filtering, show placeholder
  if (validAds.length === 0) {
    return (
      <div className="relative w-full overflow-hidden bg-gradient-to-br from-primary/20 to-primary/10">
        <div className="relative h-[300px] sm:h-[400px] md:h-[450px] lg:h-[500px] flex items-center justify-center">
          <div className="container mx-auto px-4 text-center">
            <div className="text-4xl mb-4">🏪</div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Welcome to Dukkan
            </h2>
            <p className="text-lg text-muted-foreground">
              Discover amazing deals from local shops
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="relative w-full overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Main Carousel */}
      <div className="relative h-[300px] sm:h-[400px] md:h-[450px] lg:h-[500px]">
        {validAds.map((ad, index) => {
          // Get image URL using helper function
          const imageUrl = getImageUrl(ad);
          
          return (
            <div
              key={`carousel-slide-${ad.id || index}`}
              className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                index === currentIndex
                  ? 'opacity-100 translate-x-0'
                  : index < currentIndex
                  ? 'opacity-0 -translate-x-full'
                  : 'opacity-0 translate-x-full'
              }`}
            >
              <button
                onClick={() => handleBannerClick(ad)}
                className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10 hover:scale-[1.02] transition-transform duration-300"
              >
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={ad.title || 'Promotional banner'}
                    loading={index === currentIndex ? 'eager' : 'lazy'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="container mx-auto px-4 h-full flex items-center">
                    <div className="max-w-2xl text-foreground">
                      <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">
                        {ad.title || 'Special Offer'}
                      </h2>
                    </div>
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows */}
      <Button
        variant="ghost"
        size="icon"
        onClick={prevSlide}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-black rounded-full p-2 shadow-lg hover:shadow-xl transition-all opacity-0 hover:opacity-100 group-hover:opacity-100"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={nextSlide}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-black rounded-full p-2 shadow-lg hover:shadow-xl transition-all opacity-0 hover:opacity-100 group-hover:opacity-100"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      {/* Pagination Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/30 backdrop-blur-sm rounded-full px-4 py-2">
        {validAds.map((ad, index) => (
          <button
            key={`carousel-dot-${ad.id || index}`}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'bg-white w-8'
                : 'bg-white/50 hover:bg-white/80'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Slide Counter */}
      <div className="absolute top-4 right-4 bg-black/30 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
        {currentIndex + 1} / {validAds.length}
      </div>
    </div>
  );
}


