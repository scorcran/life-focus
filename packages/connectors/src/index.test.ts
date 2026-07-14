import { describe, it, expect } from 'vitest';
import { createGcalConnector } from './index.js';
import type { HttpClient, HttpResponse } from './index.js';

describe('packages/connectors — createGcalConnector', () => {
  it('creates a client-backed connector exposing the OAuth + sync surface', () => {
    const http: HttpClient = async () => ({ status: 200, json: async () => ({}) } as HttpResponse);
    const connector = createGcalConnector(http);
    expect(typeof connector.buildAuthUrl).toBe('function');
    expect(typeof connector.exchangeCode).toBe('function');
    expect(typeof connector.refreshAccessToken).toBe('function');
    expect(typeof connector.fetchAccountEmail).toBe('function');
    expect(typeof connector.syncEvents).toBe('function');
  });

  it('routes syncEvents through the injected HTTP client (no real network)', async () => {
    let called = false;
    const http: HttpClient = async () => {
      called = true;
      return { status: 200, json: async () => ({ items: [], nextSyncToken: 't' }) } as HttpResponse;
    };
    const connector = createGcalConnector(http);
    const result = await connector.syncEvents({
      accessToken: 'at',
      calendarId: 'primary',
      context: 'work',
    });
    expect(called).toBe(true);
    expect(result.nextSyncToken).toBe('t');
  });

  it('buildAuthUrl is pure and does not touch the HTTP client', () => {
    const http: HttpClient = async () => {
      throw new Error('should not be called');
    };
    const connector = createGcalConnector(http);
    const url = connector.buildAuthUrl({ clientId: 'c', redirectUri: 'http://x/cb', state: 's' });
    expect(url).toContain('client_id=c');
  });
});
