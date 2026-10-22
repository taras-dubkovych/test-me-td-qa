const base = require('./base.verification');
const {items} = require('../catalog');

const ids = rows => rows.map(p => p.id).sort();

module.exports = {
  datasetHasProducts: (products, message) => base.notEmpty(products, message),
  datasetContainsZeroStock: products =>
    base.equal(products.some(p => p.stock === 0), true, 'dataset contains zero stock'),
  fixtureExists: (product, message) => base.exists(product, message),

  defaultPageHasSixProducts: response => {
    base.equal(response.status, 200);
    base.equal(items(response.body).length, 6);
  },
  searchFound: response => base.notEmpty(items(response.body)),
  sameProducts: (actual, expected) =>
    base.deepEqual(ids(items(actual.body)), ids(items(expected.body))),
  returnsProducts: (response, expected) =>
    base.deepEqual(ids(items(response.body)), ids(expected)),
  pricesAreOrdered: (response, products, direction) => {
    const actual = items(response.body).map(p => p.price);
    actual.forEach(price => base.isInteger(price, 'integer kopecks'));
    const expected = products.map(p => p.price).sort((a, b) => direction * (a - b)).slice(0, 20);
    base.deepEqual(actual, expected);
  },
  onlyInStock: response => {
    const rows = items(response.body);
    base.notEmpty(rows);
    rows.forEach(p => base.greaterThan(p.stock, 0));
  },
  invalidQueryRejected: response => base.equal(response.status, 422),
  detailsMatch: (response, product) => {
    base.equal(response.status, 200);
    base.include(response.body, {id: product.id, price: product.price, stock: product.stock});
  }
};
