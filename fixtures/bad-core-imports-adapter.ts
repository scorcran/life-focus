// Fixture: demonstrates a core package importing an adapter (AD-1 violation)
// This file should NOT be linted in normal lint runs — only via check-fixtures.sh
// Simulates: packages/planner/src/index.ts importing packages/db
import type { DrizzleClient } from '@life-focus/db'; // AD-1 violation
export type { DrizzleClient };
