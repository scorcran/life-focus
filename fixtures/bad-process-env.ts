// Fixture: demonstrates process.env access outside packages/config
// This file should NOT be linted in normal lint runs — only via check-fixtures.sh
const value = process.env['DATABASE_URL']; // lint-violation: no-restricted-syntax
export { value };
