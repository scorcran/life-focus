// Fixture: known-clean file — check-fixtures.sh asserts the production
// eslint.config.js passes it with exit 0 (guards against over-broad rules).
export function add(a: number, b: number): number {
  return a + b;
}
