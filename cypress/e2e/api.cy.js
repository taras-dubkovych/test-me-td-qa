const {allProducts} = require('../support/catalog');
const productsApi = require('../support/api/products.api');
const workspaceApi = require('../support/api/workspace.api');
const productsVerify = require('../support/verifications/products.api.verification');
const workspaceVerify = require('../support/verifications/workspace.api.verification');
const data = require('../fixtures/products.json');

describe('API: catalogue business rules', () => {
  let products;
  before(() => allProducts().then(rows => { products = rows; }));
  it('API-001: six products on the default page', () => {
    productsApi.list({}).then(productsVerify.defaultPageHasSixProducts);
  });
  it('API-002: search ignores case and surrounding spaces', () => {
    const q = products[0].name.slice(0, 5);
    productsApi.list({q, limit: 20}).then(first => {
      productsVerify.searchFound(first);
      productsApi.list({q: `  ${q.toLocaleUpperCase('uk')}  `, limit: 20})
        .then(second => productsVerify.sameProducts(second, first));
    });
  });
  for (const category of data.categories) {
    it(`API-003-${category}: category filter`, () => {
      const expected = products.filter(p => p.category === category);
      productsVerify.datasetHasProducts(expected);
      productsApi.list({category, limit: 20})
        .then(r => productsVerify.returnsProducts(r, expected.slice(0, 20)));
    });
  }
  for (const {sort, direction} of data.sortCases) {
    it(`API-004-${sort}: numeric price ordering`, () => {
      productsApi.list({sort, limit: 20})
        .then(r => productsVerify.pricesAreOrdered(r, products, direction));
    });
  }
  it('API-005: inclusive minimum and maximum price', () => {
    const price = products[0].price;
    productsApi.list({min_price: price, max_price: price, limit: 20}).then(r =>
      productsVerify.returnsProducts(r, products.filter(p => p.price === price).slice(0, 20)));
  });
  it('API-006: stock, category, search, price and sort combine', () => {
    const p = products.find(p => p.stock > 0);
    productsVerify.fixtureExists(p, 'in-stock fixture');
    const q = p.name.slice(0, 3);
    const expected = products.filter(x => x.stock > 0 && x.category === p.category &&
      x.name.toLocaleLowerCase('uk').includes(q.toLocaleLowerCase('uk')) && x.price === p.price);
    productsApi.list({q, category: p.category, in_stock: true, min_price: p.price, max_price: p.price,
      sort: 'price_asc', limit: 20}).then(r => productsVerify.returnsProducts(r, expected.slice(0, 20)));
  });
  it('API-007: in-stock excludes zero stock', () => {
    productsVerify.datasetContainsZeroStock(products);
    productsApi.list({in_stock: true, limit: 20}).then(productsVerify.onlyInStock);
  });
  for (const qs of data.invalidQueries) {
    it(`API-008: invalid query ${JSON.stringify(qs)} returns 422`, () => {
      productsApi.list(qs).then(productsVerify.invalidQueryRejected);
    });
  }
  it('API-009: product details match list price and stock', () => {
    const p = products[0];
    productsApi.details(p.id).then(r => productsVerify.detailsMatch(r, p));
  });
});

describe('API: workspace security', () => {
  for (const url of data.protectedEndpoints) {
    for (const token of [undefined, Cypress.env('INVALID_TOKEN')]) {
      it(`API-010 ${url}, ${token ? 'unknown' : 'missing'} token → 401`, () => {
        workspaceApi.getProtected(url, token).then(workspaceVerify.unauthorized);
      });
    }
  }
  it('API-011: independent workspaces start with empty favorites and orders', () => {
    const tokens = [];
    for (let i = 0; i < 2; i++) {
      workspaceApi.create().then(r => {
        workspaceVerify.workspaceCreated(r);
        tokens.push(r.body.token);
        for (const url of data.emptyCollectionEndpoints) {
          workspaceApi.getProtected(url, r.body.token).then(workspaceVerify.collectionEmpty);
        }
      });
    }
    cy.then(() => workspaceVerify.tokensAreUnique(tokens));
  });
});
