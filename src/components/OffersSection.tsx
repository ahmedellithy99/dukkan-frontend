'use client';

import { useRef } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Clock, MessageCircle, Tag } from 'lucide-react';
import type { Offer } from '@/types/marketplace';
import { generateWhatsAppLink } from '@/lib/api';
import Link from 'next/link';

interface OffersSectionProps {
  offers: Offer[];
}

export function OffersSection({ offers }: OffersSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  const handleContactShop = (offer: Offer) => {
    const message = `Hi! I'm interested in your offer: ${offer.title}`;
    const whatsappUrl = generateWhatsAppLink(offer.shopWhatsApp, message);
    window.open(whatsappUrl, '_blank');
  };

  if (!offers || offers.length === 0) {
    return null;
  }

  return (
    <section className="container mx-auto px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Tag className="h-6 w-6 text-primary" />
            Best Offers
          </h2>
          <p className="text-muted-foreground mt-1">
            Don't miss these amazing deals from local shops
          </p>
        </div>
        <Link href="/offers">
          <Button variant="outline" size="sm">
            View All Offers
          </Button>
        </Link>
      </div>

      {/* Mobile: Horizontal scroll - Show more offers */}
      <div className="md:hidden relative">
        <Button
          variant="outline"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background shadow-lg"
          onClick={scrollLeft}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-4 px-12 scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {offers.slice(0, 20).map((offer) => (
            <OfferCard 
              key={offer.id} 
              offer={offer} 
              onContact={() => handleContactShop(offer)}
              className="flex-shrink-0 w-60"
            />
          ))}
        </div>

        <Button
          variant="outline"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background shadow-lg"
          onClick={scrollRight}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Desktop: Grid layout - 5 columns, up to 25 offers (5 rows) */}
      <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {offers.slice(0, 25).map((offer) => (
          <OfferCard 
            key={offer.id} 
            offer={offer} 
            onContact={() => handleContactShop(offer)}
          />
        ))}
      </div>
    </section>
  );
}

interface OfferCardProps {
  offer: Offer;
  onContact: () => void;
  className?: string;
}

function OfferCard({ offer, onContact, className = '' }: OfferCardProps) {
  const getDaysLeft = (dateString: string) => {
    const today = new Date();
    const validUntil = new Date(dateString);
    const diffTime = validUntil.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const daysLeft = getDaysLeft(offer.validUntil);
  const isExpiringSoon = daysLeft <= 3;
  const isExpired = daysLeft < 0;

  return (
    <Card className={`group overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 ${className} ${isExpired ? 'opacity-60' : ''} flex flex-col h-full`}>
      {/* Offer Image - Fixed aspect ratio */}
      <div className="relative aspect-[4/2.5] bg-gradient-to-br from-muted to-muted-50 flex-shrink-0">
        {offer.imageUrl ? (
          <img
            src={offer.imageUrl}
            alt={offer.title}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-4xl">🏷️</div>
          </div>
        )}
        
        {/* Discount Badge */}
        <div className="absolute top-2 left-2">
          <Badge className="bg-red-500 hover:bg-red-600 text-white font-bold text-xs px-2 py-0.5">
            -{offer.discountPercentage}%
          </Badge>
        </div>

        {/* Featured Badge */}
        {offer.featured && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold text-xs px-2 py-0.5">
              ⭐ Featured
            </Badge>
          </div>
        )}

        {/* Expiry Warning */}
        {isExpiringSoon && !isExpired && (
          <div className="absolute bottom-2 left-2">
            <Badge variant="destructive" className="text-xs font-medium px-1.5 py-0.5">
              <Clock className="h-2.5 w-2.5 mr-1" />
              {daysLeft === 0 ? 'Last Day!' : `${daysLeft} days left`}
            </Badge>
          </div>
        )}

        {isExpired && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="destructive" className="text-sm font-bold px-3 py-1">
              EXPIRED
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-3 flex-1 flex flex-col">
        {/* Shop Name - Fixed height */}
        <div className="text-xs text-muted-foreground mb-1 h-4 flex items-center">
          <span className="truncate">{offer.shopName}</span>
        </div>

        {/* Offer Title - Fixed height for 2 lines */}
        <h3 className="font-semibold text-sm mb-1.5 line-clamp-2 h-10 flex items-start">
          {offer.title}
        </h3>

        {/* Description - Fixed height for 2 lines */}
        <p className="text-xs text-muted-foreground mb-2 line-clamp-2 h-8 flex items-start">
          {offer.description}
        </p>

        {/* Price Section - Fixed height */}
        <div className="flex items-center gap-1.5 mb-2 h-6">
          <span className="text-lg font-bold text-primary">
            {offer.discountedPrice} EGP
          </span>
          <span className="text-sm text-muted-foreground line-through">
            {offer.originalPrice} EGP
          </span>
        </div>

        {/* Valid Until - Fixed height */}
        <div className="text-xs text-muted-foreground mb-2 h-4 flex items-center">
          Valid until: {formatDate(offer.validUntil)}
        </div>
      </CardContent>

      <CardFooter className="p-3 pt-0 flex-shrink-0">
        <Button 
          onClick={onContact}
          className="w-full gap-1.5 text-xs py-1.5 h-8"
          disabled={isExpired}
        >
          <MessageCircle className="h-3 w-3" />
          {isExpired ? 'Offer Expired' : 'Contact Shop'}
        </Button>
      </CardFooter>
    </Card>
  );
}