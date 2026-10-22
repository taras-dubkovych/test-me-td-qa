const orders = require('../../fixtures/orders.json');
const {createCustomer} = require('./customer.factory');

const createItems = overrides => overrides ?? orders.defaultItems.map(item => ({...item}));

const createQuote = (overrides = {}) => ({items: createItems(), ...overrides});

const createOrder = (overrides = {}) => ({
  items: createItems(),
  ...createCustomer(),
  payment: 'approved',
  ...overrides
});

const expectedTotals = ({subtotal, shipping}) => {
  const discount = Math.floor(subtotal / 10);
  return {subtotal, discount, shipping, total: subtotal - discount + shipping};
};

module.exports = {createItems, createQuote, createOrder, expectedTotals};
