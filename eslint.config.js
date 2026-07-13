// @ts-check
// Note: @typescript-eslint/parser is incompatible with TypeScript 7 at this time
// (ts.Extension enum was removed in TS7). We use @babel/eslint-parser for syntax parsing
// and dependency-cruiser (via 'depcruise' in npm run lint) for AD-1 structural enforcement.
import js from '@eslint/js';
import babelParser from '@babel/eslint-parser';
import jsxA11y from 'eslint-plugin-jsx-a11y';

export default [
  // Global ignores
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/.next/**',
      '**/.claude/**',
      '**/.agents/**',
      '**/.bmad-loop/**',
      '**/.codex/**',
      '_bmad*/**',
      '_bmad-output/**',
      'design-artifacts/**',
      'docs/**',
      'stitch_life_focus_intelligence 2/**',
      'fixtures/**',
      'eslint.fixtures.config.js',
      '.dependency-cruiser.cjs',
    ],
  },
  // Base recommended rules for JS
  js.configs.recommended,
  // TypeScript + general rules for all TS/TSX files
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'],
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: true,
        babelOptions: {
          configFile: './babel.config.json',
        },
        ecmaVersion: 2022,
        sourceType: 'module',
      },
    },
    rules: {
      // Relax JS-only rules that don't apply well to TS
      'no-undef': 'off', // TypeScript handles this
      'no-unused-vars': 'off', // TypeScript handles this
    },
  },
  // no-process-env rule for ALL TS files except packages/config
  // AD-1 process.env enforcement (structural: all env reads must go through packages/config)
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'],
    ignores: ['packages/config/src/**'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          // process.env.FOO (dotted access)
          selector: 'MemberExpression[object.name="process"][property.name="env"]',
          message:
            'All env access must go through @life-focus/config (packages/config). ' +
            'Do not read process.env directly outside packages/config.',
        },
        {
          // process["env"] (computed access with literal "env")
          selector: 'MemberExpression[object.name="process"][computed=true][property.value="env"]',
          message:
            'All env access must go through @life-focus/config (packages/config). ' +
            'Do not read process.env directly outside packages/config.',
        },
        {
          // const { env } = process — destructuring
          selector: 'VariableDeclarator[id.type="ObjectPattern"] > Identifier[name="process"]',
          message:
            'All env access must go through @life-focus/config (packages/config). ' +
            'Do not destructure process outside packages/config.',
        },
      ],
    },
  },
  // AD-1: core packages import no adapter, host, framework, or I/O library.
  // Workspace-specifier level (dependency-cruiser covers relative-path edges).
  {
    files: [
      'packages/planner/**/*.ts', 'packages/planner/**/*.tsx',
      'packages/planner/**/*.mts', 'packages/planner/**/*.cts',
      'packages/policy/**/*.ts', 'packages/policy/**/*.tsx',
      'packages/policy/**/*.mts', 'packages/policy/**/*.cts',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@life-focus/broker*', '@life-focus/connectors*', '@life-focus/llm-gateway*',
                '@life-focus/notify*', '@life-focus/db*', '@life-focus/web*', '@life-focus/worker*',
              ],
              message: 'AD-1: core packages may not import adapter or host packages.',
            },
            {
              group: [
                'next', 'next/*', 'react', 'react-dom', 'pg', 'pg-boss', 'drizzle-orm*',
                'pino*', 'better-auth*',
                'fs', 'fs/*', 'node:fs*',
                'http', 'node:http*', 'https', 'node:https*',
                'net', 'net/*', 'node:net*',
                'child_process', 'node:child_process',
                'dns', 'node:dns*',
                'tls', 'node:tls*',
                'dgram', 'node:dgram*',
                'worker_threads', 'node:worker_threads',
              ],
              message: 'AD-1: core packages import no framework or I/O library.',
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      'packages/ledger/**/*.ts', 'packages/ledger/**/*.tsx',
      'packages/ledger/**/*.mts', 'packages/ledger/**/*.cts',
      'packages/interpretation-schema/**/*.ts', 'packages/interpretation-schema/**/*.tsx',
      'packages/interpretation-schema/**/*.mts', 'packages/interpretation-schema/**/*.cts',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@life-focus/broker*', '@life-focus/connectors*', '@life-focus/llm-gateway*',
                '@life-focus/notify*', '@life-focus/db*', '@life-focus/web*', '@life-focus/worker*',
              ],
              message: 'AD-1: core packages may not import adapter or host packages.',
            },
            {
              group: ['@life-focus/planner*', '@life-focus/policy*'],
              message:
                'AD-1 intra-core direction: ledger/interpretation-schema may not import planner/policy.',
            },
            {
              group: [
                'next', 'next/*', 'react', 'react-dom', 'pg', 'pg-boss', 'drizzle-orm*',
                'pino*', 'better-auth*',
                'fs', 'fs/*', 'node:fs*',
                'http', 'node:http*', 'https', 'node:https*',
                'net', 'net/*', 'node:net*',
                'child_process', 'node:child_process',
                'dns', 'node:dns*',
                'tls', 'node:tls*',
                'dgram', 'node:dgram*',
                'worker_threads', 'node:worker_threads',
              ],
              message: 'AD-1: core packages import no framework or I/O library.',
            },
          ],
        },
      ],
    },
  },
  // jsx-a11y for apps/web TSX files
  {
    files: ['apps/web/**/*.tsx', 'apps/web/**/*.jsx'],
    plugins: {
      'jsx-a11y': jsxA11y,
    },
    rules: {
      ...jsxA11y.configs.recommended.rules,
    },
  },
];
