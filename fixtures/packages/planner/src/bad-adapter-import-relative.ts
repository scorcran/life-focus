// Fixture: AD-1 violation — a core package (planner) imports an adapter (db)
// via a RELATIVE path into the adapter's src/ and dist/ directories.
// check-fixtures.sh asserts the production eslint.config.js rejects this file
// (rule: no-restricted-imports).
import '../../db/src/index.js'; // AD-1 violation (relative path into src)
import '../../db/dist/index.js'; // AD-1 violation (relative path into dist)
