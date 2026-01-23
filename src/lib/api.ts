/**
 * API utility functions for Laravel backend integration
 * Configure your Laravel API base URL in environment variable: NEXT_PUBLIC_API_BASE_URL
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.abuhommos-marketplace.com/api';

export const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: 10000,
};

/**
 * Generic fetch wrapper with error handling
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
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

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
}

/**
 * Shops API
 */
export const shopsApi = {
  /**
   * Get all shops
   */
  getAll: (category?: string) =>
    apiRequest(`/shops${category ? `?category=${category}` : ''}`),

  /**
   * Get featured shops
   */
  getFeatured: () => apiRequest('/shops/featured'),

  /**
   * Get shop by slug
   */
  getBySlug: (slug: string) => apiRequest(`/shops/${slug}`),

  /**
   * Get shop by ID
   */
  getById: (id: string | number) => apiRequest(`/shops/${id}`),
};

/**
 * Products API
 */
export const productsApi = {
  /**
   * Get products by shop ID
   */
  getByShopId: (shopId: string | number) =>
    apiRequest(`/shops/${shopId}/products`),

  /**
   * Get product by ID
   */
  getById: (id: string | number) => apiRequest(`/products/${id}`),

  /**
   * Search products
   */
  search: (query: string) => apiRequest(`/products/search?q=${query}`),
};

/**
 * Categories API
 */
export const categoriesApi = {
  /**
   * Get all categories
   */
  getAll: () => apiRequest('/categories'),

  /**
   * Get shops by category
   */
  getShops: (category: string) => apiRequest(`/categories/${category}/shops`),
};

/**
 * Offers API
 */
export const offersApi = {
  /**
   * Get all offers
   */
  getAll: () => apiRequest('/offers'),

  /**
   * Get featured offers
   */
  getFeatured: () => apiRequest('/offers/featured'),

  /**
   * Get offers by shop ID
   */
  getByShopId: (shopId: string | number) => apiRequest(`/shops/${shopId}/offers`),

  /**
   * Get offers by category
   */
  getByCategory: (category: string) => apiRequest(`/offers?category=${category}`),
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
  return `${price} ${currency}`;
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
