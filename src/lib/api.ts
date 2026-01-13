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
 * Mock data for development (replace with real API calls)
 */
export const mockData = {
  shops: [
    {
      id: 1,
      name: 'Fashion Hub',
      slug: 'fashion-hub',
      description: 'Your one-stop shop for trendy fashion',
      address: 'Main Street, Abu Hommos',
      category: 'men' as const,
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
      category: 'women' as const,
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
      category: 'kids' as const,
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
      category: 'men',
      imageUrl: '',
    },
    {
      id: 2,
      shopId: 1,
      name: 'Formal Trousers',
      slug: 'formal-trousers',
      description: 'Elegant formal wear',
      price: 350,
      category: 'men',
      imageUrl: '',
    },
    {
      id: 3,
      shopId: 2,
      name: 'Summer Dress',
      slug: 'summer-dress',
      description: 'Light and breathable summer dress',
      price: 450,
      category: 'women',
      imageUrl: '',
    },
    {
      id: 4,
      shopId: 3,
      name: 'Kids T-Shirt',
      slug: 'kids-tshirt',
      description: 'Colorful t-shirt for kids',
      price: 150,
      category: 'kids',
      imageUrl: '',
    },
  ],
  categories: [
    { id: 'men' as const, name: 'Men', icon: '👔' },
    { id: 'women' as const, name: 'Women', icon: '👗' },
    { id: 'kids' as const, name: 'Kids', icon: '🧒' },
  ],
};

/**
 * Helper function to generate WhatsApp link
 */
export const generateWhatsAppLink = (phoneNumber: string, message?: string): string => {
  const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
  const text = message ? `&text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${cleanNumber}${text}`;
};

/**
 * Helper function to format price
 */
export const formatPrice = (price: number): string => {
  return `EGP ${price.toLocaleString()}`;
};
