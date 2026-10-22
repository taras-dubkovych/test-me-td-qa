const base = require('./base.verification');

const orderOf = response => response.body.order ?? response.body;

module.exports = {
  orderOf,
  quoteMatches: (response, totals) => {
    base.equal(response.status, 200);
    base.include(response.body, totals);
  },
  validationRejected: response => base.equal(response.status, 422),
  stockConflict: response => base.equal(response.status, 409),
  paymentDeclined: response => base.equal(response.status, 402),
  noOrders: response => base.deepEqual(response.body.items, []),

  orderConfirmed: (response, total) => {
    const order = orderOf(response);
    base.equal(response.status, 201);
    base.equal(order.status, 'confirmed');
    base.equal(order.totals.total, total);
  },
  orderMatches: (response, order) => base.deepEqual(orderOf(response), order),
  orderNotFound: response => base.equal(response.status, 404),
  orderCancelled: response => base.equal(response.status, 200),
  orderAlreadyCancelled: response => base.equal(response.status, 409)
};
