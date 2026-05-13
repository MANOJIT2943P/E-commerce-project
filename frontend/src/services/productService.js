import api from './api';

const placeholderImage = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'><rect width='100%' height='100%' fill='%23ddd'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23666' font-size='24'>Product</text></svg>";

// API_BASE is used for REST endpoints; API_HOST is used for direct static image access.
export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
export const API_HOST = API_BASE.replace(/\/api\/?$/, '');

const mapProduct = (p) => {
  let images = [];

  // Check for images array (if populated in DB)
  if (Array.isArray(p.images) && p.images.length > 0) {
    images = p.images.map((img) => {
      if (!img) return placeholderImage;
      // If the image field is already a full URL, return it
      if (/^https?:\/\//i.test(img)) return img;

      // Otherwise assume it's a filename
      const cleanImg = img.replace(/^\/?(images\/)?/, '');
      return `${API_HOST.replace(/\/$/, '')}/images/${encodeURIComponent(cleanImg)}`;
    });
  } else if (p.imageUrl) {
    const cleanImgUrl = p.imageUrl.replace(/^\/?(images\/)?/, '');
    images = [/^https?:\/\//i.test(p.imageUrl) ? p.imageUrl : `${API_HOST.replace(/\/$/, '')}/images/${encodeURIComponent(cleanImgUrl)}`];
  } else if (p.u_id) {
    // Fallback: use u_id to look for product image in Product_db
    // Example: u_id="6ZYYRKYT" maps to /images/6ZYYRKYT.jpg
    images = [
      `${API_HOST.replace(/\/$/, '')}/images/${encodeURIComponent(p.u_id)}.jpg`
    ];
  } else {
    images = [placeholderImage];
  }

  const rating = (typeof p.rating === 'number' ? p.rating : (typeof p.metadata?.rating === 'number' ? p.metadata.rating : 0));
  const reviewCount = (typeof p.total_reviews === 'number' ? p.total_reviews : (typeof p.reviewCount === 'number' ? p.reviewCount : 0));
  const inStock = typeof p.stock === 'number' ? p.stock > 0 : true;
  const price = typeof p.price === 'number' ? p.price : (typeof p.original_price === 'number' ? p.original_price : undefined);
  const originalPrice = typeof p.original_price === 'number' ? p.original_price : (typeof p.metadata?.originalPrice === 'number' ? p.metadata.originalPrice : undefined);
  const category = p.category || p['product type'] || '';
  const rawId = p._id ?? p.id ?? p.u_id;
  return {
    id: rawId != null && rawId !== '' ? String(rawId) : '',
    name: p.name,
    description: p.description || '',
    price,
    originalPrice,
    images,
    category,
    brand: p.brand || '',
    rating,
    reviewCount,
    inStock,
  };
};

export const productService = {
  getProducts: async (params = {}) => {
    try {
      const response = await api.get('/products', { params, withCredentials: false, headers: { Accept: 'application/json' } });
      const data = response.data?.data || [];
      return data.map(mapProduct);
    } catch (_) {
      return [];
    }
  },

  getProduct: async (id) => {
    try {
      const response = await api.get(`/products/${id}`, { withCredentials: false, headers: { Accept: 'application/json' } });
      const product = response.data?.data;
      return product ? mapProduct(product) : null;
    } catch (_) {
      return null;
    }
  },

  getProductsByCategory: async (category, params = {}) => {
    try {
      const response = await api.get('/products', { params: { ...params, category }, withCredentials: false, headers: { Accept: 'application/json' } });
      const data = response.data?.data || [];
      return data.map(mapProduct);
    } catch (_) {
      return [];
    }
  },

  getFeaturedProducts: async () => {
    try {
      const response = await api.get('/products', { params: { pageSize: 4 }, withCredentials: false, headers: { Accept: 'application/json' } });
      const data = response.data?.data || [];
      return data.map(mapProduct);
    } catch (_) {
      return [];
    }
  },
};
