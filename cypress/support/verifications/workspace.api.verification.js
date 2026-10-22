const base = require('./base.verification');

module.exports = {
  workspaceCreated: response => {
    base.equal(response.status, 201);
    base.isString(response.body.token);
    base.notEmpty(response.body.token);
  },
  tokensAreUnique: tokens => base.equal(tokens[0] === tokens[1], false, 'unique tokens'),
  unauthorized: response => base.equal(response.status, 401),
  collectionEmpty: response => {
    const body = response.body;
    base.equal(response.status, 200);
    const rows = Array.isArray(body) ? body : body.items ?? body.orders ?? body.favorites ?? body.product_ids;
    base.deepEqual(rows, [], 'empty workspace collection');
  },

  favoritesUpdated: (response, productIds) => {
    base.equal(response.status, 200);
    base.deepEqual(response.body.product_ids, productIds);
  },
  favoritesAre: (response, productIds) => base.deepEqual(response.body.product_ids, productIds),

  reviewCreated: response => base.equal(response.status, 201),
  reviewConflict: response => base.equal(response.status, 409),
  reviewIs: (response, review) => base.include(response.body.review, review),
  noReview: response => base.equal(response.body.review, null)
};
