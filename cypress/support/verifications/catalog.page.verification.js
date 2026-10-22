const base = require('./base.verification');
const catalogPage = require('../pages/catalog.page');

const parse = raw => JSON.parse(raw);

module.exports = {
  addToCartAvailable: () => {
    base.shouldBeVisible(catalogPage.addToCartButton);
    base.shouldBeEnabled(catalogPage.addToCartButton);
  },
  addToCartVisible: () => base.shouldBeVisible(catalogPage.addToCartButton),
  noHorizontalOverflow: () =>
    base.shouldBeAtMost(cy.document().its('documentElement.scrollWidth'),
      Cypress.env('MOBILE_VIEWPORT_WIDTH') + 1, 'mobile document width'),

  workspaceStored: raw => {
    base.isString(parse(raw).token, 'workspace created');
    base.notEmpty(parse(raw).token, 'workspace token');
  },
  cartStateChanged: before => cy.window().should(win => {
    const after = parse(win.localStorage.getItem(catalogPage.storageKey));
    base.equal(after.token === parse(before).token, true);
    base.equal(JSON.stringify(after) === JSON.stringify(parse(before)), false, 'cart persisted');
  }),
  storageEquals: saved => cy.window().should(win =>
    base.equal(win.localStorage.getItem(catalogPage.storageKey) === saved, true)),

  quoteMatches: (interception, totals) => {
    base.equal(interception.response.statusCode, 200);
    base.include(interception.response.body, totals);
  },
  discountIs: (interception, discount) =>
    base.equal(interception.response.body.discount, discount),
  cartTotalShows: digits => catalogPage.cartTotal.invoke('text').should(text =>
    base.include(text.replace(/\s/g, ''), digits)),
  orderRequestCreated: interception => base.equal(interception.response.statusCode, 201),
  oneOrderRequest: () => cy.get('@create.all').should('have.length', 1),
  orderConfirmedInList: () => {
    base.shouldHaveLength(catalogPage.orderCards, 1);
    base.shouldContainText(catalogPage.orderCards, 'Підтверджено');
  },
  cartCountIs: count => base.shouldHaveText(catalogPage.cartCount, count),
  singleOrderShown: orderId => {
    base.shouldHaveLength(catalogPage.orderCards, 1);
    base.shouldHaveText(catalogPage.orderId, orderId);
  },
  cartIsEmpty: () => base.shouldContainText(catalogPage.cartItems, 'Ваш кошик порожній'),
  cartHasSingleLine: (productId, quantity) => {
    base.shouldHaveLength(catalogPage.cartLines, 1);
    base.shouldHaveText(catalogPage.quantityFor(productId), quantity);
  },
  couponIs: code => base.shouldHaveValue(catalogPage.couponInput, code),

  compareDisabled: () => base.shouldBeDisabled(catalogPage.compareButton),
  compareEnabled: () => base.shouldBeEnabled(catalogPage.compareButton),
  compareTableShowsPriceAndCategory: () => {
    base.shouldContainText(catalogPage.compareTable, 'Ціна');
    base.shouldContainText(catalogPage.compareTable, 'Категорія');
  },
  compareCountIs: count => base.shouldHaveText(catalogPage.compareCount, count),
  compareBarHidden: () => base.shouldNotBeVisible(catalogPage.compareBar)
};
