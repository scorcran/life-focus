// Fixture: env-discipline violation — importing `env` from node:process is
// equivalent to reading process.env directly.
// check-fixtures.sh asserts the production eslint.config.js rejects this file
// (rule: no-restricted-imports).
import { env } from 'node:process'; // lint-violation: no-restricted-imports
export const value = env['DATABASE_URL'];
