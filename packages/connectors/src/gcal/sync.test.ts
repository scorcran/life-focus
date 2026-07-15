import { describe, it, expect } from 'vitest';
import { syncEvents } from './sync.js';
import {
  SyncTokenExpiredError,
  TokenRevokedError,
  type HttpClient,
  type HttpResponse,
} from './types.js';

/** A fake HTTP client that returns queued responses in order. */
function queuedHttp(
  responses: Array<{ status: number; body: unknown }>,
): { http: HttpClient; urls: string[] } {
  const urls: string[] = [];
  let i = 0;
  const http: HttpClient = async (url) => {
    urls.push(url);
    const r = responses[i++] ?? { status: 200, body: { items: [] } };
    const res: HttpResponse = { status: r.status, json: async () => r.body };
    return res;
  };
  return { http, urls };
}

describe('syncEvents', () => {
  it('initial full sync: normalizes items, collects cancellations, stores nextSyncToken', async () => {
    const { http, urls } = queuedHttp([
      {
        status: 200,
        body: {
          items: [
            {
              id: 'e1',
              status: 'confirmed',
              summary: 'A',
              start: { dateTime: '2026-07-04T09:00:00Z' },
              end: { dateTime: '2026-07-04T10:00:00Z' },
            },
            { id: 'e2', status: 'cancelled' },
          ],
          nextSyncToken: 'tok-1',
        },
      },
    ]);
    const result = await syncEvents(http, {
      accessToken: 'at',
      calendarId: 'primary',
      context: 'work',
    });
    expect(result.mode).toBe('initial');
    expect(result.events.map((e) => e.externalId)).toEqual(['e1']);
    expect(result.cancelledIds).toEqual(['e2']);
    expect(result.nextSyncToken).toBe('tok-1');
    // Initial run must NOT send a syncToken param.
    expect(urls[0]).not.toContain('syncToken=');
    expect(urls[0]).toContain('singleEvents=true');
    expect(urls[0]).toContain('showDeleted=true');
  });

  it('paginates across pages and only keeps the final nextSyncToken', async () => {
    const { http } = queuedHttp([
      {
        status: 200,
        body: {
          items: [
            {
              id: 'p1',
              start: { dateTime: '2026-07-04T09:00:00Z' },
              end: { dateTime: '2026-07-04T10:00:00Z' },
            },
          ],
          nextPageToken: 'page-2',
        },
      },
      {
        status: 200,
        body: {
          items: [
            {
              id: 'p2',
              start: { dateTime: '2026-07-05T09:00:00Z' },
              end: { dateTime: '2026-07-05T10:00:00Z' },
            },
          ],
          nextSyncToken: 'tok-final',
        },
      },
    ]);
    const result = await syncEvents(http, {
      accessToken: 'at',
      calendarId: 'primary',
      context: 'personal',
    });
    expect(result.events.map((e) => e.externalId)).toEqual(['p1', 'p2']);
    expect(result.nextSyncToken).toBe('tok-final');
  });

  it('incremental sync sends the stored syncToken', async () => {
    const { http, urls } = queuedHttp([{ status: 200, body: { items: [], nextSyncToken: 'tok-2' } }]);
    const result = await syncEvents(http, {
      accessToken: 'at',
      calendarId: 'primary',
      context: 'work',
      syncToken: 'tok-1',
    });
    expect(result.mode).toBe('incremental');
    expect(urls[0]).toContain('syncToken=tok-1');
  });

  it('410 GONE maps to SyncTokenExpiredError', async () => {
    const { http } = queuedHttp([{ status: 410, body: {} }]);
    await expect(
      syncEvents(http, { accessToken: 'at', calendarId: 'primary', context: 'work', syncToken: 'stale' }),
    ).rejects.toBeInstanceOf(SyncTokenExpiredError);
  });

  it('401 maps to TokenRevokedError', async () => {
    const { http } = queuedHttp([{ status: 401, body: {} }]);
    await expect(
      syncEvents(http, { accessToken: 'at', calendarId: 'primary', context: 'work' }),
    ).rejects.toBeInstanceOf(TokenRevokedError);
  });
});
