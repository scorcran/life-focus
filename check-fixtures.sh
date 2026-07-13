#!/usr/bin/env bash
# Asserts that ESLint correctly catches lint violation fixtures.
# Run from the repo root: bash check-fixtures.sh
# Exit 0 = both violations correctly detected (as expected)
# Exit 1 = a violation was NOT caught (unexpected ESLint success)

PASS=0
FAIL=0

cd "$(dirname "$0")"

echo "=== Fixture lint check ==="
echo ""

echo "1. Checking: fixtures/bad-process-env.ts"
echo "   Expects: ESLint error for process.env read outside packages/config"
ESLINT_OUT_1=$(npx eslint --config eslint.fixtures.config.js fixtures/bad-process-env.ts 2>&1)
ESLINT_EXIT_1=$?
if [ "$ESLINT_EXIT_1" -ne 0 ] && echo "$ESLINT_OUT_1" | grep -q "no-restricted-syntax"; then
  echo "   PASS: process.env violation detected (exit $ESLINT_EXIT_1, rule no-restricted-syntax)"
  PASS=$((PASS + 1))
else
  echo "   FAIL: ESLint exit=$ESLINT_EXIT_1 or rule 'no-restricted-syntax' not found in output"
  echo "$ESLINT_OUT_1"
  FAIL=$((FAIL + 1))
fi

echo ""
echo "2. Checking: fixtures/bad-core-imports-adapter.ts"
echo "   Expects: ESLint error for no-restricted-imports (AD-1)"
ESLINT_OUT_2=$(npx eslint --config eslint.fixtures.config.js fixtures/bad-core-imports-adapter.ts 2>&1)
ESLINT_EXIT_2=$?
if [ "$ESLINT_EXIT_2" -ne 0 ] && echo "$ESLINT_OUT_2" | grep -q "no-restricted-imports"; then
  echo "   PASS: AD-1 violation detected (exit $ESLINT_EXIT_2, rule no-restricted-imports)"
  PASS=$((PASS + 1))
else
  echo "   FAIL: ESLint exit=$ESLINT_EXIT_2 or rule 'no-restricted-imports' not found in output"
  echo "$ESLINT_OUT_2"
  FAIL=$((FAIL + 1))
fi

echo ""
echo "=== Results: $PASS/2 violations correctly detected ==="
if [ $FAIL -gt 0 ]; then
  echo "FAIL: $FAIL fixture(s) were not caught by ESLint"
  exit 1
fi
echo "All violation fixtures correctly detected."
