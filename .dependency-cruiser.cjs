/**
 * Dependency Cruiser config — enforces AD-1 architectural direction rules.
 * Core packages (planner, ledger, policy, interpretation-schema) must not import
 * adapters (broker, connectors, llm-gateway, notify, db), hosts, or I/O libraries.
 *
 * Run: depcruise --config .dependency-cruiser.cjs packages apps
 * This is part of npm run lint.
 */

/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'AD-1-no-core-imports-adapter',
      severity: 'error',
      comment:
        'AD-1: Core packages (planner, ledger, policy, interpretation-schema) ' +
        'must not import adapter packages (broker, connectors, llm-gateway, notify, db).',
      from: {
        path: '^packages/(planner|ledger|policy|interpretation-schema)/src',
      },
      to: {
        path: '^packages/(broker|connectors|llm-gateway|notify|db)/(src|dist)',
      },
    },
    {
      name: 'AD-1-no-core-imports-host',
      severity: 'error',
      comment:
        'AD-1: Core packages must not import host applications (apps/web, apps/worker).',
      from: {
        path: '^packages/(planner|ledger|policy|interpretation-schema)/src',
      },
      to: {
        path: '^apps/',
      },
    },
    {
      name: 'AD-1-no-ledger-imports-planner-policy',
      severity: 'error',
      comment:
        'AD-1 intra-core direction: ledger and interpretation-schema may not import ' +
        'planner or policy (direction: planner/policy may import ledger/interpretation-schema, ' +
        'never the reverse).',
      from: {
        path: '^packages/(ledger|interpretation-schema)/src',
      },
      to: {
        path: '^packages/(planner|policy)/src',
      },
    },
    {
      name: 'no-adapter-imports-host',
      severity: 'error',
      comment:
        'AD-1: Adapter packages (broker, connectors, llm-gateway, notify, db) ' +
        'must not import host applications (apps/web, apps/worker).',
      from: {
        path: '^packages/(broker|connectors|llm-gateway|notify|db)/src',
      },
      to: {
        path: '^apps/',
      },
    },
  ],
  options: {
    doNotFollow: {
      path: 'node_modules',
    },
    exclude: {
      path: [
        'node_modules',
        '\\.test\\.ts$',
        'dist/',
      ],
    },
    moduleSystems: ['es6', 'cjs'],
    tsPreCompilationDeps: true,
    reporterOptions: {
      text: {
        highlightFocused: true,
      },
    },
  },
};
