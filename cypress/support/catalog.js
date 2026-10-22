// The API schema could not be retrieved. These explicit adapters fail closed
// on an unknown envelope; they do not silently treat it as an empty catalogue.
const api = require('./api-client');
const verify = require('./verifications/base.verification');

function items(body) {
  const value = Array.isArray(body) ? body : body.items ?? body.products;
  verify.isArray(value, 'catalogue response must expose an array');
  return value;
}
function allProducts() {
  const collected = [];
  function next(page) {
    if (page > 100) throw new Error('Unexpected pagination: more than 100 pages');
    return api.get('/api/products', {qs: {page, limit: 20}})
      .then(({body}) => {
        const batch = items(body);
        const previous = new Set(collected.map(p => p.id));
        batch.forEach(p => {
          verify.isString(p.id, 'product id');
          verify.equal(previous.has(p.id), false, 'pagination must not repeat ids');
          previous.add(p.id);
        });
        collected.push(...batch);
        if (batch.length === 20) return next(page + 1);
        verify.greaterThan(collected.length, 6, 'nonempty test dataset');
        return collected;
      });
  }
  return next(1);
}
module.exports = {items, allProducts};
