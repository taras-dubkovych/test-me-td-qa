const api = require('../api-client');

module.exports = {
  quote: (token, body) => api.post('/api/quote', body, {token}),
  create: (token, body) => api.post('/api/orders', body, {token}),
  list: token => api.get('/api/orders', {token}),
  get: (token, orderId) => api.get(`/api/orders/${orderId}`, {token}),
  cancel: (token, orderId) => api.post(`/api/orders/${orderId}/cancel`, undefined, {token})
};
