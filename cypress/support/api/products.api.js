const api = require('../api-client');

module.exports = {
  list: qs => api.get('/api/products', {qs}),
  details: productId => api.get(`/api/products/${encodeURIComponent(productId)}`)
};
