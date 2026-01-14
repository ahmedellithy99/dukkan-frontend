'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AdBanner {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  link?: string;
  backgroundColor?: string;
}

const mockAds: AdBanner[] = [
  {
    id: '1',
    title: 'Summer Sale',
    description: 'Up to 50% off on all summer collection',
    imageUrl: '',
    link: '#',
    backgroundColor: 'from-blue-500 to-purple-600',
  },
  {
    id: '2',
    title: 'New Arrivals',
    description: 'Check out the latest fashion trends',
    imageUrl: '',
    link: '#',
    backgroundColor: 'from-pink-500 to-rose-600',
  },
  {
    id: '3',
    title: 'Kids Special',
    description: 'Buy 2 Get 1 Free on kids clothing',
    imageUrl: '',
    link: '#',
    backgroundColor: 'from-green-500 to-emerald-600',
  },
  {
    id: '4',
    title: 'Men\'s Collection',
    description: 'Premium quality at affordable prices',
    imageUrl: '',
    link: '#',
    backgroundColor: 'from-orange-500 to-amber-600',
  },
  {
    id: '5',
    title: 'Women\'s Fashion',
    description: 'Elegant styles for every occasion',
    imageUrl: '',
    link: '#',
    backgroundColor: 'from-violet-500 to-purple-600',
  },
];

export function AdsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % mockAds.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + mockAds.length) % mockAds.length);
  }, []);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // Auto-scroll every 5 seconds
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  const handleBannerClick = (ad: AdBanner) => {
    if (ad.link) {
      window.open(ad.link, '_blank');
    }
  };

  return (
    <div 
      className="relative w-full overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Main Carousel */}
      <div className="relative h-[300px] sm:h-[400px] md:h-[450px] lg:h-[500px]">
        {mockAds.map((ad, index) => (
          <div
            key={ad.id}
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
              className={`w-full h-full bg-gradient-to-br ${ad.backgroundColor} hover:scale-[1.02] transition-transform duration-300`}
            >
              {ad.imageUrl ? (
                <img
                  src={ad.imageUrl}
                  alt={ad.title}
                  loading={index === currentIndex ? 'eager' : 'lazy'}
                  className="w-full h-full object-cover"
                />
              ) : null}
              <div className="container mx-auto px-4 h-full flex items-center">
                <div className="max-w-2xl text-white">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">
                    {ad.title}
                  </h2>
                  <p className="text-lg sm:text-xl md:text-2xl drop-shadow-md">
                    {ad.description}
                  </p>
                </div>
              </div>
            </button>
          </div>
        ))}
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
        {mockAds.map((_, index) => (
          <button
            key={index}
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
        {currentIndex + 1} / {mockAds.length}
      </div>
    </div>
  );
}
