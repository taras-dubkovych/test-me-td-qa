const createReview = (overrides = {}) => ({
  rating: 5,
  text: '<b>Тестовий відгук</b>',
  ...overrides
});

module.exports = {createReview};
