// Fixture: env-discipline violation — process.env read outside packages/config.
// check-fixtures.sh asserts the production eslint.config.js rejects this file
// (rule: no-restricted-syntax).
const value = process.env['DATABASE_URL']; // lint-violation: no-restricted-syntax
export { value };
