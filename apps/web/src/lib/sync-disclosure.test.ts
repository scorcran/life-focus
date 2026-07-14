import { describe, it, expect } from 'vitest';
import type { SourceRecord } from '@life-focus/db';
import { syncDisclosure, formatSyncTime } from './sync-disclosure.js';

const BANNED = ['error', 'sync failed', 'failed', 'failure'];

function source(overrides: Partial<SourceRecord> = {}): SourceRecord {
  return {
    id: 's1',
    provider: 'gcal',
    account: 'me@example.com',
    context: 'work',
    googleCalendarId: 'primary',
    status: 'active',
    syncToken: null,
    lastSyncedAt: '2026-07-14T13:20:00.000Z',
    lastSyncStatus: 'ok',
    lastError: null,
    ...overrides,
  };
}

/** No disclosure string (visible text OR aria-label) may use banned copy. */
function assertNoBannedCopy(d: { text: string; label: string }): void {
  const haystack = `${d.text} ${d.label}`.toLowerCase();
  for (const term of BANNED) {
    expect(haystack).not.toContain(term);
  }
}

describe('formatSyncTime', () => {
  it('returns "not yet synced" for null', () => {
    expect(formatSyncTime(null)).toBe('not yet synced');
  });

  it('formats a real ISO timestamp', () => {
    expect(formatSyncTime('2026-07-14T13:20:00.000Z')).toBe(new Date('2026-07-14T13:20:00.000Z').toLocaleString());
  });

  it('never surfaces a raw "Invalid Date" for a malformed timestamp', () => {
    expect(formatSyncTime('not-a-date')).toBe('not yet synced');
  });
});

describe('syncDisclosure', () => {
  it('shows a healthy synced source with a check icon and no degraded framing', () => {
    const d = syncDisclosure(source({ lastSyncStatus: 'ok' }));
    expect(d.icon).toBe('✓');
    expect(d.text).toContain('Last synced');
    assertNoBannedCopy(d);
  });

  it('shows the degraded reconnect voice when lastSyncStatus is failed (never "Error")', () => {
    const d = syncDisclosure(source({ lastSyncStatus: 'failed' }));
    expect(d.icon).toBe('⚠');
    expect(d.text).toContain('reconnect to keep this calendar current');
    assertNoBannedCopy(d);
  });

  it('shows the degraded reconnect voice when the source is revoked (never "Error")', () => {
    const d = syncDisclosure(source({ status: 'revoked', lastSyncStatus: null }));
    expect(d.icon).toBe('⚠');
    expect(d.text).toContain('reconnect to keep this calendar current');
    assertNoBannedCopy(d);
  });

  it('shows an awaiting-first-sync state before any sync outcome', () => {
    const d = syncDisclosure(source({ lastSyncStatus: null, lastSyncedAt: null }));
    expect(d.icon).toBe('◷');
    expect(d.text).toBe('Connected — awaiting first sync.');
    assertNoBannedCopy(d);
  });
});
