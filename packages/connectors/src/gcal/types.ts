/**
 * Google Calendar connector types + constants (Story 1.4).
 *
 * This is an ADAPTER package (AD-1): it may import TYPES from `@life-focus/ledger`
 * and do HTTP I/O via an INJECTED `HttpClient` port, but must NOT import
 * `@life-focus/db` or any host. No real network module is imported here — the
 * port is a plain function type so tests inject fakes.
 */
import type { EventContext } from '@life-focus/ledger';

// ── OAuth / API constants ────────────────────────────────────────────────────

/** Read-only calendar scope + minimal identity scopes (AD-8, least privilege). */
export const GCAL_SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'openid',
  'email',
] as const;

export const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
export const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
export const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';
export const GOOGLE_CALENDAR_EVENTS_URL = (calendarId: string): string =>
  `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`;

/** The default calendar we sync from (the account's primary calendar). */
export const DEFAULT_CALENDAR_ID = 'primary';

// ── HTTP port ────────────────────────────────────────────────────────────────

/** A minimal HTTP response shape (fetch-like). */
export interface HttpResponse {
  readonly status: number;
  json(): Promise<unknown>;
}

/** Init options passed to the injected HTTP client (fetch-compatible subset). */
export interface HttpRequestInit {
  readonly method?: string;
  readonly headers?: Record<string, string>;
  readonly body?: string;
}

/**
 * The injected HTTP port. In hosts this is backed by `fetch`; in tests it is a
 * fake. Keeping I/O behind this port is what lets normalize/oauth/sync run
 * without real network (AD-1, test gate).
 */
export type HttpClient = (url: string, init?: HttpRequestInit) => Promise<HttpResponse>;

// ── DTOs ─────────────────────────────────────────────────────────────────────

/**
 * A normalized calendar event ready for the source-mirror cache (AD-7).
 * Only planning-necessary fields — no bodies, attachments, or attendee PII
 * (NFR-6). Times are ISO-8601; timed events are UTC, all-day events are
 * date-only (`YYYY-MM-DD`) with `allDay=true`.
 */
export interface MirrorEvent {
  readonly externalId: string;
  readonly context: EventContext;
  readonly summary: string | null;
  readonly startsAt: string;
  readonly endsAt: string;
  readonly allDay: boolean;
  readonly status: string;
  readonly recurringEventId: string | null;
  readonly updatedAt: string | null;
}

/** A cancelled instance to remove from the mirror (normalize result variant). */
export interface CancelledEvent {
  readonly cancelledExternalId: string;
}

/** A reference to a connected source, enough to run a sync. */
export interface GcalSourceRef {
  readonly sourceId: string;
  readonly context: EventContext;
  readonly account: string;
  readonly googleCalendarId: string;
}

// ── Error types (sync orchestration maps HTTP status → these) ─────────────────

/** Thrown when a token is revoked / invalid (401 / invalid_grant). */
export class TokenRevokedError extends Error {
  constructor(message = 'Google token revoked or invalid') {
    super(message);
    this.name = 'TokenRevokedError';
  }
}

/** Thrown when an incremental syncToken has expired (410 GONE). */
export class SyncTokenExpiredError extends Error {
  constructor(message = 'Sync token expired; a full resync is required') {
    super(message);
    this.name = 'SyncTokenExpiredError';
  }
}
