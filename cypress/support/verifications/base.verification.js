// Low-level assertions. Used only by the page/API verification services.
const equal = (actual, expected, message) => expect(actual, message).to.equal(expected);
const deepEqual = (actual, expected, message) => expect(actual, message).to.deep.equal(expected);
const include = (actual, expected, message) => expect(actual, message).to.include(expected);
const atMost = (actual, maximum, message) => expect(actual, message).to.be.at.most(maximum);

module.exports = {
  equal,
  deepEqual,
  include,
  atMost,
  notEmpty: (actual, message) => expect(actual, message).not.to.be.empty,
  isString: (actual, message) => expect(actual, message).to.be.a('string'),
  isArray: (actual, message) => expect(actual, message).to.be.an('array'),
  isInteger: (actual, message) => expect(Number.isInteger(actual), message).to.equal(true),
  greaterThan: (actual, minimum, message) => expect(actual, message).to.be.greaterThan(minimum),
  exists: (actual, message) => expect(actual, message).to.exist,
  shouldHaveLength: (subject, expected, message) =>
    subject.should(actual => equal(actual.length, expected, message)),
  shouldHaveText: (subject, expected, message) =>
    subject.should(actual => equal(actual.text(), expected, message)),
  shouldHaveValue: (subject, expected, message) =>
    subject.should(actual => equal(actual.val(), expected, message)),
  shouldBeVisible: subject => subject.should('be.visible'),
  shouldNotBeVisible: subject => subject.should('not.be.visible'),
  shouldBeEnabled: subject => subject.should('not.be.disabled'),
  shouldBeDisabled: subject => subject.should('be.disabled'),
  shouldBeAtMost: (subject, maximum, message) =>
    subject.should(actual => atMost(actual, maximum, message)),
  shouldContainText: (subject, expected) => subject.should('contain', expected)
};
