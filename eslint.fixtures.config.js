// @ts-check
// Config used ONLY by check-fixtures.sh to assert lint violations are detected.
// Never used in normal npm run lint.
import babelParser from '@babel/eslint-parser';

export default [
  {
    files: ['fixtures/**/*.ts'],
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
      // Detect: process.env read outside packages/config
      'no-restricted-syntax': [
        'error',
        {
          selector: 'MemberExpression[object.name="process"][property.name="env"]',
          message:
            'All env access must go through @life-focus/config. Do not read process.env directly.',
        },
      ],
      // Detect: core package importing an adapter (AD-1)
      // Note: AD-1 structural enforcement at scale is via dependency-cruiser.
      // This fixture checks the npm-package-name based lint rule.
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@life-focus/broker',
                '@life-focus/connectors',
                '@life-focus/llm-gateway',
                '@life-focus/notify',
                '@life-focus/db',
              ],
              message: 'AD-1: Core packages cannot import adapter packages.',
            },
          ],
        },
      ],
    },
  },
];
