/**
 * API utility functions for Laravel backend integration
 * Configure your Laravel API base URL in environment variable: NEXT_PUBLIC_API_BASE_URL
 */

import type {
  ApiResponse,
  ApiErrorResponse,
  Product,
  Shop,
  Category,
  Subcategory,
  Attribute,
  AttributeValue,
  AdCarousel,
  SearchSuggestionsResponse,
  ProductStats,
  ProductFilters,
  ShopFilters,
} from '@/types/marketplace';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://your-domain.com/api/v1';

export const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  version: 'v1.0.0',
};

/**
 * Generic fetch wrapper with error handling
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      const errorData = data as ApiErrorResponse;
      throw new Error(errorData.error?.message || `API Error: ${response.status}`);
    }

    return data as ApiResponse<T>;
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
}

/**
 * Build query string from filters
 */
function buildQueryString(filters: Record<string, any>): string {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    
    if (key === 'attributes' && typeof value === 'object') {
      // Handle attributes filter: attributes[color]=12,13&attributes[size]=44
      Object.entries(value).forEach(([attrName, attrValues]) => {
        if (Array.isArray(attrValues) && attrValues.length > 0) {
          params.append(`attributes[${attrName}]`, attrValues.join(','));
        }
      });
    } else if (key === 'near' && typeof value === 'object') {
      // Handle proximity filter: near[lat]=30.0444&near[lng]=31.2357&near[radius]=10
      if (value.lat) params.append('near[lat]', value.lat.toString());
      if (value.lng) params.append('near[lng]', value.lng.toString());
      if (value.radius) params.append('near[radius]', value.radius.toString());
    } else if (typeof value === 'boolean') {
      params.append(key, value ? 'true' : 'false');
    } else {
      params.append(key, value.toString());
    }
  });
  
  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Products API
 */
export const productsApi = {
  /**
   * Get all products with filters
   */
  getAll: async (filters: ProductFilters = {}) => {
    const queryString = buildQueryString(filters);
    return apiRequest<Product[]>(`/products${queryString}`);
  },

  /**
   * Get single product by slug
   */
  getBySlug: async (slug: string) => {
    return apiRequest<Product>(`/products/${slug}`);
  },

  /**
   * Track WhatsApp click
   */
  trackWhatsAppClick: async (productSlug: string) => {
    return apiRequest(`/products/${productSlug}/track/whatsapp`, {
      method: 'POST',
    });
  },

  /**
   * Track location click
   */
  trackLocationClick: async (productSlug: string) => {
    return apiRequest(`/products/${productSlug}/track/location`, {
      method: 'POST',
    });
  },
};

/**
 * Shops API
 */
export const shopsApi = {
  /**
   * Get all shops with filters
   */
  getAll: async (filters: ShopFilters = {}) => {
    const queryString = buildQueryString(filters);
    return apiRequest<Shop[]>(`/shops${queryString}`);
  },

  /**
   * Get single shop by slug
   */
  getBySlug: async (slug: string) => {
    return apiRequest<Shop>(`/shops/${slug}`);
  },
};

/**
 * Categories API
 */
export const categoriesApi = {
  /**
   * Get all categories
   */
  getAll: async () => {
    return apiRequest<Category[]>('/categories');
  },

  /**
   * Get single category by slug
   */
  getBySlug: async (slug: string) => {
    return apiRequest<Category>(`/categories/${slug}`);
  },

  /**
   * Get subcategories for a category
   */
  getSubcategories: async (categorySlug: string) => {
    return apiRequest<Subcategory[]>(`/categories/${categorySlug}/subcategories`);
  },

  /**
   * Get single subcategory
   */
  getSubcategory: async (categorySlug: string, subcategorySlug: string) => {
    return apiRequest<Subcategory>(`/categories/${categorySlug}/subcategories/${subcategorySlug}`);
  },
};

/**
 * Attributes API
 */
export const attributesApi = {
  /**
   * Get all attributes with their values
   */
  getAll: async () => {
    return apiRequest<Attribute[]>('/attributes');
  },

  /**
   * Get single attribute by slug
   */
  getBySlug: async (slug: string) => {
    return apiRequest<Attribute>(`/attributes/${slug}`);
  },
};

/**
 * Offers API
 */
export const offersApi = {
  /**
   * Get products with active discounts
   */
  getAll: async (limit?: number) => {
    const queryString = limit ? `?limit=${limit}` : '';
    return apiRequest<Product[]>(`/offers${queryString}`);
  },
};

/**
 * Ad Carousel API
 */
export const adCarouselApi = {
  /**
   * Get all active ad carousels
   */
  getAll: async () => {
    return apiRequest<AdCarousel[]>('/ad-carousels');
  },
};

/**
 * Search API
 */
export const searchApi = {
  /**
   * Get search suggestions (autocomplete)
   */
  getSuggestions: async (query: string, type: 'products' | 'shops', limit: number = 5) => {
    const queryString = buildQueryString({ q: query, type, limit });
    return apiRequest<SearchSuggestionsResponse>(`/search/suggestions${queryString}`);
  },

  /**
   * Full search with pagination
   */
  search: async (query: string, type: 'products' | 'shops', limit: number = 10) => {
    const queryString = buildQueryString({ q: query, type, limit });
    return apiRequest<Product[] | Shop[]>(`/search${queryString}`);
  },
};

/**
 * Utility functions
 */
export const generateWhatsAppLink = (phoneNumber: string, message: string) => {
  const cleanNumber = phoneNumber.replace(/[^\d+]/g, '');
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
};

export const formatPrice = (price: number, currency: string = 'EGP') => {
  return `${price.toLocaleString()} ${currency}`;
};

export const calculateDiscountedPrice = (price: number, discountType: 'percent' | 'amount', discountValue: number): number => {
  if (discountType === 'percent') {
    return price - (price * discountValue / 100);
  }
  return price - discountValue;
};

export const getDiscountPercentage = (originalPrice: number, discountedPrice: number): number => {
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
};
export const mockData = {
  shops: [
    {
      id: 1,
      name: 'Fashion Hub',
      slug: 'fashion-hub',
      description: 'Your one-stop shop for trendy fashion',
      address: 'Main Street, Abu Hommos',
      category: 'clothes' as const,
      logo: '',
      bannerImage: '',
      whatsappNumber: '+201234567890',
      rating: 4.5,
      featured: true,
    },
    {
      id: 2,
      name: 'Elegant Styles',
      slug: 'elegant-styles',
      description: 'Modern and elegant clothing for women',
      address: 'El-Nasr Road, Abu Hommos',
      category: 'clothes' as const,
      logo: '',
      bannerImage: '',
      whatsappNumber: '+201234567891',
      rating: 4.8,
      featured: true,
    },
    {
      id: 3,
      name: 'Kids Corner',
      slug: 'kids-corner',
      description: 'Fun and comfortable clothes for kids',
      address: 'Market Square, Abu Hommos',
      category: 'toys' as const,
      logo: '',
      bannerImage: '',
      whatsappNumber: '+201234567892',
      rating: 4.3,
      featured: true,
    },
  ],
  products: [
    {
      id: 1,
      shopId: 1,
      name: 'Casual Shirt',
      slug: 'casual-shirt',
      description: 'Comfortable cotton shirt',
      price: 250,
      category: 'clothes',
      imageUrl: '',
    },
    {
      id: 2,
      shopId: 1,
      name: 'Formal Trousers',
      slug: 'formal-trousers',
      description: 'Elegant formal wear',
      price: 350,
      category: 'clothes',
      imageUrl: '',
    },
    {
      id: 3,
      shopId: 2,
      name: 'Summer Dress',
      slug: 'summer-dress',
      description: 'Light and breathable summer dress',
      price: 450,
      category: 'clothes',
      imageUrl: '',
    },
    {
      id: 4,
      shopId: 3,
      name: 'Kids T-Shirt',
      slug: 'kids-tshirt',
      description: 'Colorful t-shirt for kids',
      price: 150,
      category: 'toys',
      imageUrl: '',
    },
    {
      id: 5,
      shopId: 1,
      name: 'Denim Jeans',
      slug: 'denim-jeans',
      description: 'Classic blue denim jeans for everyday wear',
      price: 400,
      category: 'clothes',
      imageUrl: '',
    },
    {
      id: 6,
      shopId: 2,
      name: 'Evening Gown',
      slug: 'evening-gown',
      description: 'Elegant evening dress for special occasions',
      price: 800,
      category: 'clothes',
      imageUrl: '',
    },
    {
      id: 7,
      shopId: 1,
      name: 'Leather Jacket',
      slug: 'leather-jacket',
      description: 'Premium leather jacket for style and warmth',
      price: 1200,
      category: 'clothes',
      imageUrl: '',
    },
    {
      id: 8,
      shopId: 3,
      name: 'Educational Puzzle',
      slug: 'educational-puzzle',
      description: 'Fun learning puzzle for children aged 5-10',
      price: 80,
      category: 'toys',
      imageUrl: '',
    },
    {
      id: 9,
      shopId: 2,
      name: 'High Heels',
      slug: 'high-heels',
      description: 'Stylish high heels for formal events',
      price: 600,
      category: 'shoes',
      imageUrl: '',
    },
    {
      id: 10,
      shopId: 1,
      name: 'Polo Shirt',
      slug: 'polo-shirt',
      description: 'Classic polo shirt for casual and business casual wear',
      price: 300,
      category: 'clothes',
      imageUrl: '',
    },
    {
      id: 11,
      shopId: 3,
      name: 'Building Blocks Set',
      slug: 'building-blocks',
      description: 'Creative building blocks for imaginative play',
      price: 200,
      category: 'toys',
      imageUrl: '',
    },
    {
      id: 12,
      shopId: 2,
      name: 'Maxi Dress',
      slug: 'maxi-dress',
      description: 'Flowing maxi dress perfect for summer',
      price: 500,
      category: 'clothes',
      imageUrl: '',
    },
    {
      id: 13,
      shopId: 1,
      name: 'Sneakers',
      slug: 'sneakers',
      description: 'Comfortable sneakers for daily activities',
      price: 450,
      category: 'shoes',
      imageUrl: '',
    },
    {
      id: 14,
      shopId: 3,
      name: 'Action Figure',
      slug: 'action-figure',
      description: 'Superhero action figure with accessories',
      price: 120,
      category: 'toys',
      imageUrl: '',
    },
    {
      id: 15,
      shopId: 2,
      name: 'Blazer',
      slug: 'blazer',
      description: 'Professional blazer for business attire',
      price: 700,
      category: 'clothes',
      imageUrl: '',
    },
    {
      id: 16,
      shopId: 1,
      name: 'Chinos',
      slug: 'chinos',
      description: 'Versatile chino pants for smart casual look',
      price: 320,
      category: 'clothes',
      imageUrl: '',
    },
    {
      id: 17,
      shopId: 3,
      name: 'Doll House',
      slug: 'doll-house',
      description: 'Beautiful dollhouse with furniture included',
      price: 350,
      category: 'toys',
      imageUrl: '',
    },
    {
      id: 18,
      shopId: 2,
      name: 'Ankle Boots',
      slug: 'ankle-boots',
      description: 'Trendy ankle boots for autumn and winter',
      price: 550,
      category: 'shoes',
      imageUrl: '',
    },
    {
      id: 19,
      shopId: 1,
      name: 'Hoodie',
      slug: 'hoodie',
      description: 'Comfortable hoodie for casual wear',
      price: 280,
      category: 'clothes',
      imageUrl: '',
    },
    {
      id: 20,
      shopId: 3,
      name: 'Remote Control Car',
      slug: 'rc-car',
      description: 'Fast remote control car for outdoor fun',
      price: 180,
      category: 'toys',
      imageUrl: '',
    },
  ],
  categories: [
    { id: 'clothes' as const, name: 'Clothes', icon: '👕' },
    { id: 'shoes' as const, name: 'Shoes', icon: '👟' },
    { id: 'accessories' as const, name: 'Accessories', icon: '⌚' },
    { id: 'cosmetics' as const, name: 'Cosmetics', icon: '💄' },
    { id: 'toys' as const, name: 'Toys', icon: '🧸' },
    { id: 'phones' as const, name: 'Phones', icon: '📱' },
    { id: 'laptops' as const, name: 'Laptops', icon: '💻' },
  ],
  offers: [
    {
      id: 1,
      title: 'Summer Sale - Cotton Shirts',
      description: 'Get 30% off on all cotton shirts. Perfect for the hot summer weather!',
      discountPercentage: 30,
      originalPrice: 250,
      discountedPrice: 175,
      imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop',
      shopId: 1,
      shopName: 'Fashion Hub',
      shopWhatsApp: '+201234567890',
      category: 'clothes' as const,
      validUntil: '2026-02-28T23:59:59.000Z',
      featured: true,
    },
    {
      id: 2,
      title: 'Buy 2 Get 1 Free - Summer Dresses',
      description: 'Amazing deal on elegant summer dresses. Mix and match your favorites!',
      discountPercentage: 33,
      originalPrice: 450,
      discountedPrice: 300,
      imageUrl: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=300&fit=crop',
      shopId: 2,
      shopName: 'Elegant Styles',
      shopWhatsApp: '+201234567891',
      category: 'clothes' as const,
      validUntil: '2026-02-15T23:59:59.000Z',
      featured: true,
    },
    {
      id: 3,
      title: 'Kids Clothing Clearance',
      description: 'Up to 50% off on selected kids clothing. Limited time offer!',
      discountPercentage: 50,
      originalPrice: 150,
      discountedPrice: 75,
      imageUrl: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=400&h=300&fit=crop',
      shopId: 3,
      shopName: 'Kids Corner',
      shopWhatsApp: '+201234567892',
      category: 'toys' as const,
      validUntil: '2026-01-30T23:59:59.000Z',
      featured: false,
    },
    {
      id: 4,
      title: 'Formal Wear Special',
      description: 'Professional attire at unbeatable prices. Perfect for office wear.',
      discountPercentage: 25,
      originalPrice: 350,
      discountedPrice: 262,
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
      shopId: 1,
      shopName: 'Fashion Hub',
      shopWhatsApp: '+201234567890',
      category: 'clothes' as const,
      validUntil: '2026-03-15T23:59:59.000Z',
      featured: false,
    },
    {
      id: 5,
      title: 'Weekend Flash Sale',
      description: 'This weekend only! Massive discounts on trendy outfits.',
      discountPercentage: 40,
      originalPrice: 400,
      discountedPrice: 240,
      imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop',
      shopId: 2,
      shopName: 'Elegant Styles',
      shopWhatsApp: '+201234567891',
      category: 'clothes' as const,
      validUntil: '2026-01-26T23:59:59.000Z',
      featured: true,
    },
    {
      id: 6,
      title: 'Accessories Bundle Deal',
      description: 'Buy any 3 accessories and get 20% off your entire purchase!',
      discountPercentage: 20,
      originalPrice: 300,
      discountedPrice: 240,
      imageUrl: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=300&fit=crop',
      shopId: 1,
      shopName: 'Fashion Hub',
      shopWhatsApp: '+201234567890',
      category: 'accessories' as const,
      validUntil: '2026-02-20T23:59:59.000Z',
      featured: false,
    },
    {
      id: 7,
      title: 'Shoes Mega Sale',
      description: 'Up to 45% off on all footwear. Limited stock available!',
      discountPercentage: 45,
      originalPrice: 500,
      discountedPrice: 275,
      imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=300&fit=crop',
      shopId: 2,
      shopName: 'Elegant Styles',
      shopWhatsApp: '+201234567891',
      category: 'shoes' as const,
      validUntil: '2026-03-01T23:59:59.000Z',
      featured: true,
    },
    {
      id: 8,
      title: 'Cosmetics Clearance',
      description: 'End of season sale on premium cosmetics. Hurry while stocks last!',
      discountPercentage: 35,
      originalPrice: 200,
      discountedPrice: 130,
      imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=300&fit=crop',
      shopId: 3,
      shopName: 'Kids Corner',
      shopWhatsApp: '+201234567892',
      category: 'cosmetics' as const,
      validUntil: '2026-02-10T23:59:59.000Z',
      featured: false,
    },
    {
      id: 9,
      title: 'Phone Accessories Sale',
      description: 'Get the best deals on phone cases, chargers, and more!',
      discountPercentage: 30,
      originalPrice: 180,
      discountedPrice: 126,
      imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop',
      shopId: 1,
      shopName: 'Fashion Hub',
      shopWhatsApp: '+201234567890',
      category: 'phones' as const,
      validUntil: '2026-02-25T23:59:59.000Z',
      featured: false,
    },
    {
      id: 10,
      title: 'Laptop Deals',
      description: 'Special discount on selected laptop models. Perfect for students!',
      discountPercentage: 15,
      originalPrice: 8000,
      discountedPrice: 6800,
      imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop',
      shopId: 2,
      shopName: 'Elegant Styles',
      shopWhatsApp: '+201234567891',
      category: 'laptops' as const,
      validUntil: '2026-03-10T23:59:59.000Z',
      featured: true,
    },
    {
      id: 11,
      title: 'Toys Bonanza',
      description: 'Educational toys at amazing prices. Great for kids development!',
      discountPercentage: 40,
      originalPrice: 250,
      discountedPrice: 150,
      imageUrl: 'https://images.unsplash.com/photo-1558877385-1c4c7e9e1c6e?w=400&h=300&fit=crop',
      shopId: 3,
      shopName: 'Kids Corner',
      shopWhatsApp: '+201234567892',
      category: 'toys' as const,
      validUntil: '2026-02-05T23:59:59.000Z',
      featured: false,
    },
    {
      id: 12,
      title: 'Winter Jackets Sale',
      description: 'Stay warm with our premium winter collection at discounted prices.',
      discountPercentage: 35,
      originalPrice: 600,
      discountedPrice: 390,
      imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=300&fit=crop',
      shopId: 1,
      shopName: 'Fashion Hub',
      shopWhatsApp: '+201234567890',
      category: 'clothes' as const,
      validUntil: '2026-02-28T23:59:59.000Z',
      featured: true,
    },
    {
      id: 13,
      title: 'Handbags Collection',
      description: 'Designer-inspired handbags at unbeatable prices. Limited edition!',
      discountPercentage: 28,
      originalPrice: 400,
      discountedPrice: 288,
      imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop',
      shopId: 2,
      shopName: 'Elegant Styles',
      shopWhatsApp: '+201234567891',
      category: 'accessories' as const,
      validUntil: '2026-03-05T23:59:59.000Z',
      featured: false,
    },
    {
      id: 14,
      title: 'Sports Shoes Special',
      description: 'Premium sports shoes for running, gym, and outdoor activities.',
      discountPercentage: 32,
      originalPrice: 550,
      discountedPrice: 374,
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop',
      shopId: 3,
      shopName: 'Kids Corner',
      shopWhatsApp: '+201234567892',
      category: 'shoes' as const,
      validUntil: '2026-02-18T23:59:59.000Z',
      featured: false,
    },
    {
      id: 15,
      title: 'Beauty Products Bundle',
      description: 'Complete beauty care package with skincare and makeup essentials.',
      discountPercentage: 38,
      originalPrice: 320,
      discountedPrice: 198,
      imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=300&fit=crop',
      shopId: 1,
      shopName: 'Fashion Hub',
      shopWhatsApp: '+201234567890',
      category: 'cosmetics' as const,
      validUntil: '2026-02-22T23:59:59.000Z',
      featured: true,
    },
    {
      id: 16,
      title: 'Tech Gadgets Sale',
      description: 'Latest tech accessories and gadgets at incredible prices!',
      discountPercentage: 25,
      originalPrice: 300,
      discountedPrice: 225,
      imageUrl: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=400&h=300&fit=crop',
      shopId: 2,
      shopName: 'Elegant Styles',
      shopWhatsApp: '+201234567891',
      category: 'phones' as const,
      validUntil: '2026-03-08T23:59:59.000Z',
      featured: false,
    },
    {
      id: 17,
      title: 'Denim Collection',
      description: 'Premium denim jeans and jackets with modern fits.',
      discountPercentage: 22,
      originalPrice: 450,
      discountedPrice: 351,
      imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=300&fit=crop',
      shopId: 3,
      shopName: 'Kids Corner',
      shopWhatsApp: '+201234567892',
      category: 'clothes' as const,
      validUntil: '2026-02-14T23:59:59.000Z',
      featured: true,
    },
    {
      id: 18,
      title: 'Gaming Accessories',
      description: 'Level up your gaming with our premium accessories collection.',
      discountPercentage: 18,
      originalPrice: 220,
      discountedPrice: 180,
      imageUrl: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=400&h=300&fit=crop',
      shopId: 1,
      shopName: 'Fashion Hub',
      shopWhatsApp: '+201234567890',
      category: 'laptops' as const,
      validUntil: '2026-03-12T23:59:59.000Z',
      featured: false,
    },
    {
      id: 19,
      title: 'Jewelry Flash Sale',
      description: 'Stunning jewelry pieces at unbeatable flash sale prices!',
      discountPercentage: 42,
      originalPrice: 380,
      discountedPrice: 220,
      imageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=300&fit=crop',
      shopId: 2,
      shopName: 'Elegant Styles',
      shopWhatsApp: '+201234567891',
      category: 'accessories' as const,
      validUntil: '2026-01-28T23:59:59.000Z',
      featured: true,
    },
    {
      id: 20,
      title: 'Outdoor Gear Sale',
      description: 'Adventure-ready gear for hiking, camping, and outdoor fun.',
      discountPercentage: 30,
      originalPrice: 500,
      discountedPrice: 350,
      imageUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=300&fit=crop',
      shopId: 3,
      shopName: 'Kids Corner',
      shopWhatsApp: '+201234567892',
      category: 'shoes' as const,
      validUntil: '2026-02-28T23:59:59.000Z',
      featured: false,
    },
    {
      id: 21,
      title: 'Smart Watch Deals',
      description: 'Stay connected with our smart watch collection at great prices.',
      discountPercentage: 27,
      originalPrice: 800,
      discountedPrice: 584,
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop',
      shopId: 1,
      shopName: 'Fashion Hub',
      shopWhatsApp: '+201234567890',
      category: 'phones' as const,
      validUntil: '2026-03-15T23:59:59.000Z',
      featured: true,
    },
    {
      id: 22,
      title: 'Skincare Essentials',
      description: 'Complete skincare routine products for healthy, glowing skin.',
      discountPercentage: 33,
      originalPrice: 280,
      discountedPrice: 188,
      imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=300&fit=crop',
      shopId: 2,
      shopName: 'Elegant Styles',
      shopWhatsApp: '+201234567891',
      category: 'cosmetics' as const,
      validUntil: '2026-02-20T23:59:59.000Z',
      featured: false,
    },
    {
      id: 23,
      title: 'Board Games Bonanza',
      description: 'Family-friendly board games for hours of entertainment.',
      discountPercentage: 35,
      originalPrice: 160,
      discountedPrice: 104,
      imageUrl: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=400&h=300&fit=crop',
      shopId: 3,
      shopName: 'Kids Corner',
      shopWhatsApp: '+201234567892',
      category: 'toys' as const,
      validUntil: '2026-02-12T23:59:59.000Z',
      featured: false,
    },
    {
      id: 24,
      title: 'Formal Wear Collection',
      description: 'Elegant formal wear for weddings, parties, and special events.',
      discountPercentage: 20,
      originalPrice: 900,
      discountedPrice: 720,
      imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=300&fit=crop',
      shopId: 1,
      shopName: 'Fashion Hub',
      shopWhatsApp: '+201234567890',
      category: 'clothes' as const,
      validUntil: '2026-03-20T23:59:59.000Z',
      featured: true,
    },
    {
      id: 25,
      title: 'Fitness Equipment Sale',
      description: 'Home fitness equipment to keep you healthy and active.',
      discountPercentage: 28,
      originalPrice: 600,
      discountedPrice: 432,
      imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
      shopId: 2,
      shopName: 'Elegant Styles',
      shopWhatsApp: '+201234567891',
      category: 'accessories' as const,
      validUntil: '2026-02-25T23:59:59.000Z',
      featured: false,
    },
  ],
};


/**
 * Mock Data for Development
 * TODO: Remove this when backend is fully integrated
 */
export const mockData = {
  shops: [
    {
      id: 1,
      name: 'Fashion Hub',
      slug: 'fashion-hub',
      description: 'Your one-stop shop for trendy fashion',
      whatsapp_number: '+201234567890',
      phone_number: '+201234567890',
      is_active: true,
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 2,
      name: 'Elegant Styles',
      slug: 'elegant-styles',
      description: 'Modern and elegant clothing for women',
      whatsapp_number: '+201234567891',
      phone_number: '+201234567891',
      is_active: true,
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 3,
      name: 'Kids Corner',
      slug: 'kids-corner',
      description: 'Fun and comfortable clothes for kids',
      whatsapp_number: '+201234567892',
      phone_number: '+201234567892',
      is_active: true,
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    },
  ],
  products: [
    {
      id: 1,
      shop_id: 1,
      subcategory_id: 1,
      name: 'Casual Shirt',
      slug: 'casual-shirt',
      description: 'Comfortable cotton shirt',
      price: 250,
      stock_quantity: 50,
      is_active: true,
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 2,
      shop_id: 1,
      subcategory_id: 1,
      name: 'Formal Trousers',
      slug: 'formal-trousers',
      description: 'Elegant formal wear',
      price: 350,
      stock_quantity: 30,
      is_active: true,
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 3,
      shop_id: 2,
      subcategory_id: 2,
      name: 'Summer Dress',
      slug: 'summer-dress',
      description: 'Light and breathable summer dress',
      price: 450,
      stock_quantity: 25,
      is_active: true,
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 4,
      shop_id: 3,
      subcategory_id: 3,
      name: 'Kids T-Shirt',
      slug: 'kids-tshirt',
      description: 'Colorful t-shirt for kids',
      price: 150,
      stock_quantity: 100,
      is_active: true,
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 5,
      shop_id: 1,
      subcategory_id: 1,
      name: 'Denim Jeans',
      slug: 'denim-jeans',
      description: 'Classic blue denim jeans for everyday wear',
      price: 400,
      stock_quantity: 40,
      is_active: true,
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 6,
      shop_id: 2,
      subcategory_id: 2,
      name: 'Evening Gown',
      slug: 'evening-gown',
      description: 'Elegant evening dress for special occasions',
      price: 800,
      stock_quantity: 15,
      discount_type: 'percent' as const,
      discount_value: 20,
      discounted_price: 640,
      is_active: true,
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 7,
      shop_id: 1,
      subcategory_id: 1,
      name: 'Leather Jacket',
      slug: 'leather-jacket',
      description: 'Premium leather jacket for style and warmth',
      price: 1200,
      stock_quantity: 10,
      discount_type: 'amount' as const,
      discount_value: 200,
      discounted_price: 1000,
      is_active: true,
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 8,
      shop_id: 3,
      subcategory_id: 3,
      name: 'Educational Puzzle',
      slug: 'educational-puzzle',
      description: 'Fun learning puzzle for children aged 5-10',
      price: 80,
      stock_quantity: 60,
      is_active: true,
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 9,
      shop_id: 2,
      subcategory_id: 4,
      name: 'High Heels',
      slug: 'high-heels',
      description: 'Stylish high heels for formal events',
      price: 600,
      stock_quantity: 20,
      discount_type: 'percent' as const,
      discount_value: 15,
      discounted_price: 510,
      is_active: true,
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 10,
      shop_id: 1,
      subcategory_id: 1,
      name: 'Polo Shirt',
      slug: 'polo-shirt',
      description: 'Classic polo shirt for casual and business casual wear',
      price: 300,
      stock_quantity: 45,
      is_active: true,
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    },
  ],
  categories: [
    { id: 1, name: 'Clothes', slug: 'clothes' },
    { id: 2, name: 'Shoes', slug: 'shoes' },
    { id: 3, name: 'Accessories', slug: 'accessories' },
    { id: 4, name: 'Cosmetics', slug: 'cosmetics' },
    { id: 5, name: 'Toys', slug: 'toys' },
    { id: 6, name: 'Phones', slug: 'phones' },
    { id: 7, name: 'Laptops', slug: 'laptops' },
  ],
};
