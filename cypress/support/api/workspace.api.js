const api = require('../api-client');

module.exports = {
  create: () => api.createWorkspace(),
  getProtected: (url, token) => api.get(url, {token}),
  getFavorites: token => api.get('/api/favorites', {token}),
  putFavorites: (token, productIds) => api.put('/api/favorites', {product_ids: productIds}, {token}),
  getReview: (token, productId) => api.get(`/api/products/${productId}/review`, {token}),
  postReview: (token, productId, review) =>
    api.post(`/api/products/${productId}/review`, review, {token})
};
