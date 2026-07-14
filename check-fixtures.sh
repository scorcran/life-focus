#!/usr/bin/env bash
# Asserts that the PRODUCTION ESLint config (eslint.config.js) correctly
# rejects each known-violation fixture and passes a known-clean fixture.
# Run from the repo root: bash check-fixtures.sh
# Exit 0 = all violations correctly detected and the clean fixture passes
# Exit 1 = a violation was NOT caught, or the clean fixture failed

PASS=0
FAIL=0

cd "$(dirname "$0")"

echo "=== Fixture lint check (production eslint.config.js) ==="
echo ""

# expect_violation <fixture-file> <expected-rule> <description>
expect_violation() {
  local file="$1" rule="$2" description="$3"
  echo "Checking: $file"
  echo "   Expects: ESLint error ($rule) — $description"
  local out exit_code
  out=$(npx eslint "$file" 2>&1)
  exit_code=$?
  if [ "$exit_code" -ne 0 ] && echo "$out" | grep -q "$rule"; then
    echo "   PASS: violation detected (exit $exit_code, rule $rule)"
    PASS=$((PASS + 1))
  else
    echo "   FAIL: ESLint exit=$exit_code or rule '$rule' not found in output"
    echo "$out"
    FAIL=$((FAIL + 1))
  fi
  echo ""
}

# expect_clean <fixture-file>
expect_clean() {
  local file="$1"
  echo "Checking: $file"
  echo "   Expects: no ESLint errors (known-clean fixture)"
  local out exit_code
  out=$(npx eslint "$file" 2>&1)
  exit_code=$?
  if [ "$exit_code" -eq 0 ]; then
    echo "   PASS: clean fixture passes (exit 0)"
    PASS=$((PASS + 1))
  else
    echo "   FAIL: ESLint exit=$exit_code on a fixture that must be clean"
    echo "$out"
    FAIL=$((FAIL + 1))
  fi
  echo ""
}

expect_violation \
  fixtures/packages/planner/src/bad-adapter-import-specifier.ts \
  no-restricted-imports \
  "core package imports an adapter via @life-focus/* specifier (AD-1)"

expect_violation \
  fixtures/packages/planner/src/bad-adapter-import-relative.ts \
  no-restricted-imports \
  "core package imports an adapter via relative path (AD-1)"

expect_violation \
  fixtures/bad-process-env.ts \
  no-restricted-syntax \
  "process.env read outside packages/config"

expect_violation \
  fixtures/bad-env-import.ts \
  no-restricted-imports \
  "import { env } from 'node:process' outside packages/config"

expect_clean fixtures/clean.ts

TOTAL=$((PASS + FAIL))
echo "=== Results: $PASS/$TOTAL fixture checks passed ==="
if [ $FAIL -gt 0 ]; then
  echo "FAIL: $FAIL fixture check(s) did not behave as expected"
  exit 1
fi
echo "All fixtures behave as expected under the production config."
