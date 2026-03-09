/**
 * Default mock data for builder edit/preview mode.
 * Used to populate data-bound blocks when no real data is available.
 */

export const DEFAULT_MOCK_PRODUCTS = [
  { id: '1', name: 'Classic Leather Watch', price: 129.99, original_price: 179.99, image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop', category: 'Accessories', badge: 'Sale', sku: 'CLW-001', in_stock: true, description: 'A timeless leather watch with a minimalist design.' },
  { id: '2', name: 'Wireless Earbuds Pro', price: 89.99, original_price: null, image_url: 'https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=400&h=400&fit=crop', category: 'Electronics', badge: 'New', sku: 'WEP-002', in_stock: true, description: 'Premium sound quality with noise cancellation.' },
  { id: '3', name: 'Organic Cotton T-Shirt', price: 34.99, original_price: 44.99, image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop', category: 'Clothing', badge: null, sku: 'OCT-003', in_stock: true, description: 'Soft, sustainable, and stylish.' },
  { id: '4', name: 'Minimalist Backpack', price: 79.99, original_price: null, image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop', category: 'Accessories', badge: 'Popular', sku: 'MB-004', in_stock: true, description: 'Sleek design with maximum storage.' },
  { id: '5', name: 'Ceramic Coffee Mug Set', price: 24.99, original_price: 34.99, image_url: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&h=400&fit=crop', category: 'Home', badge: 'Sale', sku: 'CCM-005', in_stock: true, description: 'Set of 4 handcrafted ceramic mugs.' },
  { id: '6', name: 'Running Shoes Ultra', price: 149.99, original_price: null, image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop', category: 'Footwear', badge: 'New', sku: 'RSU-006', in_stock: true, description: 'Lightweight and responsive for every run.' },
  { id: '7', name: 'Bamboo Sunglasses', price: 49.99, original_price: 69.99, image_url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop', category: 'Accessories', badge: null, sku: 'BS-007', in_stock: false, description: 'Eco-friendly frames with polarized lenses.' },
  { id: '8', name: 'Smart Water Bottle', price: 39.99, original_price: null, image_url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=400&fit=crop', category: 'Home', badge: null, sku: 'SWB-008', in_stock: true, description: 'Tracks your hydration throughout the day.' },
];

export const DEFAULT_MOCK_COLLECTIONS = [
  { id: 'c1', name: 'Summer Collection', slug: 'summer', image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&h=400&fit=crop', description: 'Light and breezy styles for the season.', productCount: 24 },
  { id: 'c2', name: 'Best Sellers', slug: 'best-sellers', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop', description: 'Our most popular products.', productCount: 18 },
  { id: 'c3', name: 'New Arrivals', slug: 'new-arrivals', image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=600&h=400&fit=crop', description: 'Fresh drops every week.', productCount: 12 },
  { id: 'c4', name: 'Gift Guide', slug: 'gifts', image: 'https://images.unsplash.com/photo-1549465220-1a8b9238f5ff?w=600&h=400&fit=crop', description: 'Perfect presents for everyone.', productCount: 32 },
  { id: 'c5', name: 'Sale', slug: 'sale', image: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=600&h=400&fit=crop', description: 'Great deals on top products.', productCount: 15 },
  { id: 'c6', name: 'Eco-Friendly', slug: 'eco', image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&h=400&fit=crop', description: 'Sustainable choices for a better planet.', productCount: 9 },
];

export const DEFAULT_MOCK_SETTINGS = {
  storeName: 'My Store',
  currency: '$',
  language: 'en',
};

/**
 * Build a complete RenderContext data object from mock data
 */
export function buildMockRenderData(mockData?: Record<string, any>) {
  return {
    products: mockData?.products || DEFAULT_MOCK_PRODUCTS,
    collections: mockData?.collections || DEFAULT_MOCK_COLLECTIONS,
    settings: mockData?.settings || DEFAULT_MOCK_SETTINGS,
    pages: mockData?.pages || [],
    custom: mockData?.custom || {},
  };
}
