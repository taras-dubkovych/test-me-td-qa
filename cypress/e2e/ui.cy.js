// Locators verified against the published HTML and public browser JavaScript.
const catalogPage = require('../support/pages/catalog.page');
const verify = require('../support/verifications/catalog.page.verification');
const {createCustomer} = require('../support/factories/customer.factory');
const orders = require('../fixtures/orders.json');

describe('UI: critical public entry points', () => {
  beforeEach(() => catalogPage.visit());
  it('UI-001: catalogue offers an enabled add-to-cart control', () => {
    verify.addToCartAvailable();
  });
  it('UI-002: adding an item updates browser cart state and survives reload', () => {
    // Inspect public storage behavior instead of guessing cart drawer selectors.
    catalogPage.readStorage().then(before => {
      verify.workspaceStored(before);
      catalogPage.addToCartButton.click();
      verify.cartStateChanged(before);
      catalogPage.readStorage().then(saved => {
        catalogPage.reload();
        verify.storageEquals(saved);
      });
    });
  });
  it('UI-003: mobile layout has no horizontal document overflow', () => {
    catalogPage.useMobileViewport();
    verify.addToCartVisible();
    verify.noHorizontalOverflow();
  });
  it('M-001: checkout with WELCOME10 persists one order and clears cart', () => {
    catalogPage.watchCheckout();
    catalogPage.addProductToCart('p01');
    catalogPage.openCart();
    catalogPage.waitForQuote();
    catalogPage.applyCoupon(orders.coupon);
    catalogPage.waitForQuote().then(quote => verify.quoteMatches(quote, orders.welcome10));
    verify.cartTotalShows('2160');
    catalogPage.enterCustomerDetails(createCustomer());
    catalogPage.placeOrder();
    catalogPage.waitForOrderCreated().then(verify.orderRequestCreated);
    verify.orderConfirmedInList();
    verify.cartCountIs('0');
    catalogPage.readOrderId().then(id => {
      catalogPage.reload();
      verify.singleOrderShown(id);
      catalogPage.openCart();
      verify.cartIsEmpty();
    });
  });
  it('M-006: rapid double-click submits one order request', () => {
    catalogPage.watchCheckout(700);
    catalogPage.addProductToCart('p01');
    catalogPage.openCart();
    catalogPage.waitForQuote();
    catalogPage.enterCustomerDetails(createCustomer());
    catalogPage.doubleClickPlaceOrder();
    catalogPage.waitForOrderCreated().then(verify.orderRequestCreated);
    verify.oneOrderRequest();
    verify.orderConfirmedInList();
  });
  it('UI-004: p07 repeated add creates one cart line', () => {
    catalogPage.searchInput.type('Фокус');
    catalogPage.addProductToCart('p07').click();
    catalogPage.openCart();
    catalogPage.captureCart('p07-duplicate-cart');
    verify.cartHasSingleLine('p07', '2');
  });
  it('UI-005: applied coupon survives reload', () => {
    catalogPage.watchCheckout();
    catalogPage.addProductToCart('p01');
    catalogPage.openCart();
    catalogPage.waitForQuote();
    catalogPage.applyCoupon(orders.coupon);
    catalogPage.waitForQuote();
    catalogPage.reload();
    catalogPage.openCart();
    catalogPage.waitForQuote().then(quote => {
      catalogPage.captureCart('coupon-after-reload');
      verify.discountIs(quote, orders.welcome10.discount);
    });
    verify.couponIs(orders.coupon);
  });
  it('UI-006: compare selection persists and clears', () => {
    catalogPage.selectProductForCompare('p01');
    verify.compareCountIs('1');
    verify.compareDisabled();
    catalogPage.selectProductForCompare('p02');
    verify.compareCountIs('2');
    verify.compareEnabled();
    catalogPage.selectProductForCompare('p03');
    verify.compareCountIs('3');
    catalogPage.compareProductButton('p04').then(button => {
      if (!button.prop('disabled')) return cy.wrap(button).click();
    });
    verify.compareCountIs('3');
    catalogPage.compareButton.click();
    verify.compareTableShowsPriceAndCategory();
    catalogPage.compareDialogCloseButton.click();
    catalogPage.reload();
    verify.compareCountIs('3');
    catalogPage.clearCompareButton.click();
    verify.compareBarHidden();
  });
});
