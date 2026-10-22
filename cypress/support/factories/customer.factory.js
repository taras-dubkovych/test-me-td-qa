const customers = require('../../fixtures/customers.json');

const createCustomer = (overrides = {}) => ({...customers.default, ...overrides});

module.exports = {createCustomer};
