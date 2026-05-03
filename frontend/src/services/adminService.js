import api from './api';

/**
 * Admin service for managing admin operations
 * All endpoints require admin authentication and role
 */
export const adminService = {
  // Product Management
  getProducts: async (page = 1, pageSize = 20, filters = {}) => {
    const params = new URLSearchParams({
      page,
      pageSize,
      ...filters,
    });
    return api
      .get(`/admin/products?${params.toString()}`)
      .then((res) => res.data);
  },

  getProductStock: async (productId) => {
    return api
      .get(`/admin/products/${productId}/stock`)
      .then((res) => res.data);
  },

  createProduct: async (formData) => {
    return api
      .post('/admin/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((res) => res.data);
  },

  updateProduct: async (productId, formData) => {
    return api
      .put(`/admin/products/${productId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((res) => res.data);
  },

  deleteProduct: async (productId) => {
    return api
      .delete(`/admin/products/${productId}`)
      .then((res) => res.data);
  },

  restockProduct: async (productId, quantity, reason = '') => {
    return api
      .patch(`/admin/products/${productId}/restock`, {
        quantity,
        reason,
      })
      .then((res) => res.data);
  },

  createAdmin: async (credentials) => {
    return api
      .post('/admin/users/register', credentials)
      .then((res) => res.data);
  },

  // Analytics
  getInventoryStats: async () => {
    return api
      .get('/admin/stats/inventory')
      .then((res) => res.data);
  },
};
