// @ts-check
// Note: @typescript-eslint/parser is incompatible with TypeScript 7 at this time
// (ts.Extension enum was removed in TS7). We use @babel/eslint-parser for syntax parsing.
// AD-1 structural enforcement (workspace package specifiers AND relative-path imports)
// is done here via no-restricted-imports; check-fixtures.sh lints known-violation
// files in fixtures/ with THIS config to prove the rules fire.
import js from '@eslint/js';
import babelParser from '@babel/eslint-parser';
import jsxA11y from 'eslint-plugin-jsx-a11y';

// All source file extensions the architecture rules apply to.
const SOURCE_EXTS = ['ts', 'tsx', 'mts', 'cts', 'js', 'jsx', 'mjs', 'cjs'];

/** Globs for every source file under the given directories (and, via the
 * leading `**`, their mirrors under fixtures/ so check-fixtures.sh exercises
 * the exact same config objects). */
function sourceGlobs(...dirs) {
  return dirs.flatMap((dir) => SOURCE_EXTS.map((ext) => `**/${dir}/**/*.${ext}`));
}

/** Relative-path import patterns that reach into a workspace package's
 * directory (src or dist), no matter how many `../` segments the specifier
 * uses — e.g. `import '../../db/src/index.js'` or `'../../../packages/db'`. */
function workspaceDirPatterns(parent, ...names) {
  return names.flatMap((name) => [
    `**/${parent}/${name}`, `**/${parent}/${name}/**`,
    `**/${name}/src`, `**/${name}/src/**`,
    `**/${name}/dist`, `**/${name}/dist/**`,
  ]);
}

const adapterDirPatterns = workspaceDirPatterns(
  'packages', 'broker', 'connectors', 'llm-gateway', 'notify', 'db',
);
const hostDirPatterns = workspaceDirPatterns('apps', 'web', 'worker');
const plannerPolicyDirPatterns = workspaceDirPatterns('packages', 'planner', 'policy');

// `import { env } from 'process'` is equivalent to reading process.env —
// restrict it wherever process.env itself is banned.
const restrictedEnvImportPaths = [
  {
    name: 'process',
    importNames: ['env'],
    message:
      'All env access must go through @life-focus/config (packages/config). ' +
      "Do not import 'env' from process outside packages/config.",
  },
  {
    name: 'node:process',
    importNames: ['env'],
    message:
      'All env access must go through @life-focus/config (packages/config). ' +
      "Do not import 'env' from node:process outside packages/config.",
  },
];

const ioLibraryPatterns = [
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
];

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
      // Handled by tsc for TS files: noUnusedLocals/noUnusedParameters in
      // tsconfig.base.json. (JS files keep no-unused-vars from js.configs.recommended.)
      'no-unused-vars': 'off',
    },
  },
  // Env discipline for ALL source files except packages/config
  // (structural: all env reads must go through packages/config)
  {
    files: SOURCE_EXTS.map((ext) => `**/*.${ext}`),
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
      'no-restricted-imports': ['error', { paths: restrictedEnvImportPaths }],
    },
  },
  // AD-1: core packages import no adapter, host, framework, or I/O library.
  // Covers both @life-focus/* specifiers and relative paths into other packages.
  {
    files: sourceGlobs('packages/planner', 'packages/policy'),
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: restrictedEnvImportPaths,
          patterns: [
            {
              group: [
                '@life-focus/broker*', '@life-focus/connectors*', '@life-focus/llm-gateway*',
                '@life-focus/notify*', '@life-focus/db*', '@life-focus/web*', '@life-focus/worker*',
              ],
              message: 'AD-1: core packages may not import adapter or host packages.',
            },
            {
              group: [...adapterDirPatterns, ...hostDirPatterns],
              message:
                'AD-1: core packages may not import adapter or host packages (relative path).',
            },
            {
              group: ioLibraryPatterns,
              message: 'AD-1: core packages import no framework or I/O library.',
            },
          ],
        },
      ],
    },
  },
  {
    files: sourceGlobs('packages/ledger', 'packages/interpretation-schema'),
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: restrictedEnvImportPaths,
          patterns: [
            {
              group: [
                '@life-focus/broker*', '@life-focus/connectors*', '@life-focus/llm-gateway*',
                '@life-focus/notify*', '@life-focus/db*', '@life-focus/web*', '@life-focus/worker*',
              ],
              message: 'AD-1: core packages may not import adapter or host packages.',
            },
            {
              group: [...adapterDirPatterns, ...hostDirPatterns],
              message:
                'AD-1: core packages may not import adapter or host packages (relative path).',
            },
            {
              group: ['@life-focus/planner*', '@life-focus/policy*'],
              message:
                'AD-1 intra-core direction: ledger/interpretation-schema may not import planner/policy.',
            },
            {
              group: plannerPolicyDirPatterns,
              message:
                'AD-1 intra-core direction: ledger/interpretation-schema may not import planner/policy (relative path).',
            },
            {
              group: ioLibraryPatterns,
              message: 'AD-1: core packages import no framework or I/O library.',
            },
          ],
        },
      ],
    },
  },
  // AD-1: adapters may not import host applications.
  {
    files: sourceGlobs(
      'packages/broker', 'packages/connectors', 'packages/llm-gateway',
      'packages/notify', 'packages/db',
    ),
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: restrictedEnvImportPaths,
          patterns: [
            {
              group: ['@life-focus/web*', '@life-focus/worker*'],
              message: 'AD-1: adapter packages may not import host applications.',
            },
            {
              group: hostDirPatterns,
              message:
                'AD-1: adapter packages may not import host applications (relative path).',
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
