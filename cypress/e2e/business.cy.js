const workspaceApi = require('../support/api/workspace.api');
const ordersApi = require('../support/api/orders.api');
const {createQuote, createOrder, expectedTotals} = require('../support/factories/order.factory');
const {createReview} = require('../support/factories/review.factory');
const ordersVerify = require('../support/verifications/orders.api.verification');
const workspaceVerify = require('../support/verifications/workspace.api.verification');
const data = require('../fixtures/orders.json');

describe('API: financial rules and workspace isolation', () => {
  let token;
  beforeEach(() => workspaceApi.create().then(r => {
    workspaceVerify.workspaceCreated(r);
    token = r.body.token;
  }));
  for (const {delivery, shipping, total} of data.deliveryCases) {
    it(`M-002-${delivery}: normalized coupon and independent totals`, () => {
      ordersApi.quote(token, createQuote({coupon: `  ${data.coupon.toLowerCase()}  `, delivery}))
        .then(r => ordersVerify.quoteMatches(r, {...data.welcome10, shipping, total}));
    });
  }
  for (const {product_id, quantity, subtotal, shipping} of data.shippingThresholdCases) {
    it(`M-003: standard shipping threshold at ${subtotal}`, () => {
      ordersApi.quote(token, createQuote({items: [{product_id, quantity}], coupon: data.coupon}))
        .then(r => ordersVerify.quoteMatches(r, expectedTotals({subtotal, shipping})));
    });
  }
  it('M-002-invalid: unknown coupon returns 422', () => {
    ordersApi.quote(token, createQuote({coupon: 'UNKNOWN'})).then(ordersVerify.validationRejected);
  });
  for (const quantity of data.invalidQuantities) {
    it(`M-004-invalid-${quantity}: quantity validation`, () => {
      ordersApi.quote(token, createQuote({items: [{product_id: 'p05', quantity}]}))
        .then(ordersVerify.validationRejected);
    });
  }
  it('M-004-valid: quantity bounds and exact available stock', () => {
    const cases = [
      {item: {product_id: 'p05', quantity: 1}, totals: {subtotal: 50000, discount: 0, shipping: 8000, total: 58000}},
      {item: {product_id: 'p05', quantity: 10}, totals: {subtotal: 500000, discount: 0, shipping: 0, total: 500000}},
      {item: {product_id: 'p07', quantity: 3}, totals: {subtotal: 225000, discount: 0, shipping: 0, total: 225000}}
    ];
    for (const {item, totals} of cases) {
      ordersApi.quote(token, createQuote({items: [item]})).then(r => ordersVerify.quoteMatches(r, totals));
    }
  });
  it('M-004-stock: exceeding stock returns 409', () => {
    for (const item of data.stockConflicts) {
      ordersApi.quote(token, createQuote({items: [item]})).then(ordersVerify.stockConflict);
    }
  });
  it('M-005: declined payment creates no order', () => {
    ordersApi.create(token, createOrder({payment: 'declined'})).then(ordersVerify.paymentDeclined);
    ordersApi.list(token).then(ordersVerify.noOrders);
  });
  it('M-007: contact lengths and email validation', () => {
    const cases = [
      {label: 'name trim length 2', field: 'name', value: ' AB ', expected: 402},
      {label: 'name trim length 80', field: 'name', value: ` ${'A'.repeat(80)} `, expected: 402},
      {label: 'address trim length 5', field: 'address', value: ' Kyiv1 ', expected: 402},
      {label: 'address trim length 200', field: 'address', value: ` ${'A'.repeat(200)} `, expected: 402},
      {label: 'valid email', field: 'email', value: 'valid@example.test', expected: 402},
      {label: 'name trim length 1', field: 'name', value: ' A ', expected: 422},
      {label: 'name trim length 81', field: 'name', value: ` ${'A'.repeat(81)} `, expected: 422},
      {label: 'address trim length 4', field: 'address', value: ' 1234 ', expected: 422},
      {label: 'address trim length 201', field: 'address', value: ` ${'A'.repeat(201)} `, expected: 422},
      {label: 'invalid email', field: 'email', value: 'invalid-email', expected: 422}
    ];
    const mismatches = [];

    for (const {label, field, value, expected} of cases) {
      ordersApi.create(token, createOrder({payment: 'declined', [field]: value}))
        .then(response => {
          if (response.status !== expected) {
            mismatches.push({label, expected, actual: response.status, fields: response.body.fields});
          }
        });
    }
    ordersApi.list(token).then(ordersVerify.noOrders);
    cy.then(() => expect(mismatches, 'contact validation mismatches').to.deep.equal([]));
  });
  it('M-008: confirmed order, foreign access, cancel and repeated cancel', () => {
    ordersApi.create(token, createOrder({coupon: data.coupon})).then(created => {
      ordersVerify.orderConfirmed(created, data.welcome10.total);
      const order = ordersVerify.orderOf(created);
      ordersApi.get(token, order.id).then(r => ordersVerify.orderMatches(r, order));
      workspaceApi.create().then(w => {
        ordersApi.get(w.body.token, order.id).then(ordersVerify.orderNotFound);
      });
      ordersApi.cancel(token, order.id).then(ordersVerify.orderCancelled);
      ordersApi.cancel(token, order.id).then(ordersVerify.orderAlreadyCancelled);
    });
  });
  it('M-009: favorites deduplicate, persist and isolate', () => {
    workspaceApi.putFavorites(token, ['p01', 'p01'])
      .then(r => workspaceVerify.favoritesUpdated(r, ['p01']));
    workspaceApi.getFavorites(token).then(r => workspaceVerify.favoritesAre(r, ['p01']));
    workspaceApi.create().then(w => {
      workspaceApi.getFavorites(w.body.token).then(r => workspaceVerify.favoritesAre(r, []));
    });
    workspaceApi.putFavorites(token, []).then(r => workspaceVerify.favoritesAre(r, []));
  });
  it('M-010: review persists, duplicate conflicts and foreign workspace cannot see it', () => {
    const review = createReview();
    workspaceApi.postReview(token, 'p01', review).then(workspaceVerify.reviewCreated);
    workspaceApi.getReview(token, 'p01').then(r => workspaceVerify.reviewIs(r, review));
    workspaceApi.postReview(token, 'p01', review).then(workspaceVerify.reviewConflict);
    workspaceApi.create().then(w => {
      workspaceApi.getReview(w.body.token, 'p01').then(workspaceVerify.noReview);
    });
  });
});
