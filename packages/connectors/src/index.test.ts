import { describe, it, expect } from 'vitest';
import { createGcalConnector } from './index.js';

describe('packages/connectors', () => {
  it('creates a gcal connector with the given accountId', () => {
    const connector = createGcalConnector('account-1');
    expect(connector.accountId).toBe('account-1');
  });
});
