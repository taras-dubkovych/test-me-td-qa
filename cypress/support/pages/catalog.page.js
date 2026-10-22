const base = require('../verifications/base.verification');

const catalogPage = {
  storageKey: 'test-me:v2',

  visit() {
    cy.intercept('GET', '**/api/products*').as('catalog');
    cy.visit('/');
    return cy.wait('@catalog').its('response.statusCode')
      .then(status => base.equal(status, 200));
  },

  useMobileViewport() {
    cy.viewport(Cypress.env('MOBILE_VIEWPORT_WIDTH'), Cypress.env('MOBILE_VIEWPORT_HEIGHT'));
  },

  reload() {
    cy.reload();
    return cy.wait('@catalog');
  },

  watchCheckout(orderDelay = 0) {
    cy.intercept('POST', '**/api/quote').as('quote');
    if (orderDelay > 0) {
      cy.intercept('POST', '**/api/orders', request => {
        request.continue(response => response.setDelay(orderDelay));
      }).as('create');
    } else {
      cy.intercept('POST', '**/api/orders').as('create');
    }
  },

  waitForQuote() {
    return cy.wait('@quote');
  },

  waitForOrderCreated() {
    return cy.wait('@create');
  },

  readStorage() {
    return cy.window().then(win => win.localStorage.getItem(this.storageKey));
  },

  readOrderId() {
    return cy.get('.order-id').invoke('text');
  },

  captureCart(name) {
    return cy.get('#bag-dialog').screenshot(name, {overwrite: true});
  },

  addProductToCart(productId) {
    return cy.get(`[data-add="${productId}"]`).click();
  },

  selectProductForCompare(productId) {
    return this.compareProductButton(productId).click();
  },

  compareProductButton(productId) {
    return cy.get(`[data-compare="${productId}"]`);
  },

  quantityFor(productId) {
    return cy.get(`[data-testid="quantity-${productId}"]`);
  },

  get searchInput() {
    return cy.get('#search');
  },

  get couponInput() {
    return cy.get('#coupon');
  },

  get cartLines() {
    return cy.get('[data-cart-line]');
  },

  openCart() {
    return cy.get('#open-cart').click();
  },

  applyCoupon(code) {
    cy.get('#coupon').clear().type(code);
    return cy.get('#apply-coupon').click();
  },

  enterCustomerDetails(customer) {
    cy.get('#customer-name').type(customer.name);
    cy.get('#email').type(customer.email);
    return cy.get('#address').type(customer.address);
  },

  placeOrder() {
    return cy.get('[data-testid="place-order"]').click();
  },

  doubleClickPlaceOrder() {
    return cy.get('[data-testid="place-order"]').dblclick();
  },

  get addToCartButton() {
    return cy.contains('button', /^До кошика$/);
  },

  get cartCount() {
    return cy.get('#cart-count');
  },

  get cartTotal() {
    return cy.get('[data-testid="cart-total"]');
  },

  get orderCards() {
    return cy.get('[data-testid="order-card"]');
  },

  get orderId() {
    return cy.get('.order-id');
  },

  get cartItems() {
    return cy.get('#bag-items');
  },

  get cartDialog() {
    return cy.get('#bag-dialog');
  },

  get compareButton() {
    return cy.get('#open-compare');
  },

  get compareCount() {
    return cy.get('#compare-count');
  },

  get compareTable() {
    return cy.get('#compare-content table');
  },

  get compareDialogCloseButton() {
    return cy.get('[data-close="compare-dialog"]');
  },

  get clearCompareButton() {
    return cy.get('#clear-compare');
  },

  get compareBar() {
    return cy.get('#compare-bar');
  }
};

module.exports = catalogPage;
