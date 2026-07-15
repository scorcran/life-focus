// Fixture: AD-1 violation — a core package (planner) imports an adapter (db)
// via its workspace package specifier.
// check-fixtures.sh asserts the production eslint.config.js rejects this file
// (rule: no-restricted-imports).
import type { DrizzleClient } from '@life-focus/db'; // AD-1 violation
export type { DrizzleClient };
