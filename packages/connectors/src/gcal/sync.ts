/**
 * Google Calendar events fetch + normalization orchestration (Story 1.4) over
 * the injected `HttpClient` port. Read-only (AD-8). Handles pagination, the
 * incremental sync token, and maps HTTP failure statuses to typed errors:
 *  - 410 GONE   → SyncTokenExpiredError (token expired; caller does a full resync)
 *  - 401 / invalid_grant → TokenRevokedError (revocation; caller flags the source)
 */
import type { EventContext } from '@life-focus/ledger';
import {
  GOOGLE_CALENDAR_EVENTS_URL,
  SyncTokenExpiredError,
  TokenRevokedError,
  type HttpClient,
  type MirrorEvent,
} from './types.js';
import { normalizeEvent, type GoogleEvent } from './normalize.js';

interface EventsListResponse {
  items?: GoogleEvent[];
  nextPageToken?: string;
  nextSyncToken?: string;
  error?: { status?: string; message?: string };
}

export interface SyncEventsParams {
  readonly accessToken: string;
  readonly calendarId: string;
  readonly context: EventContext;
  /** Incremental token from the last successful sync; null → initial full sync. */
  readonly syncToken?: string | null;
}

export interface SyncEventsResult {
  /** Live events to upsert into the mirror. */
  readonly events: readonly MirrorEvent[];
  /** External ids to remove from the mirror (cancelled instances). */
  readonly cancelledIds: readonly string[];
  /** The sync token to persist for the next incremental run. */
  readonly nextSyncToken: string | null;
  /** Which mode this run used. */
  readonly mode: 'initial' | 'incremental';
}

/**
 * Fetch (paginated) and normalize events for one calendar. Requests
 * `singleEvents=true` so recurrences are expanded into instances, and
 * `showDeleted=true` so incremental syncs receive `status:'cancelled'`
 * tombstones to remove.
 */
export async function syncEvents(
  http: HttpClient,
  params: SyncEventsParams,
): Promise<SyncEventsResult> {
  const mode: 'initial' | 'incremental' = params.syncToken ? 'incremental' : 'initial';
  const events: MirrorEvent[] = [];
  const cancelledIds: string[] = [];
  let pageToken: string | undefined;
  let nextSyncToken: string | null = null;

  do {
    const url = new URL(GOOGLE_CALENDAR_EVENTS_URL(params.calendarId));
    url.searchParams.set('singleEvents', 'true');
    url.searchParams.set('showDeleted', 'true');
    url.searchParams.set('maxResults', '250');
    if (params.syncToken) {
      url.searchParams.set('syncToken', params.syncToken);
    }
    if (pageToken) {
      url.searchParams.set('pageToken', pageToken);
    }

    const res = await http(url.toString(), {
      method: 'GET',
      headers: { authorization: `Bearer ${params.accessToken}` },
    });

    if (res.status === 410) {
      // Incremental token expired — caller must clear it and do a full resync.
      throw new SyncTokenExpiredError();
    }
    if (res.status === 401) {
      throw new TokenRevokedError('events.list: 401');
    }

    const body = (await res.json()) as EventsListResponse;
    if (res.status >= 400 || body.error) {
      if (body.error?.status === 'GONE') {
        throw new SyncTokenExpiredError();
      }
      throw new Error(
        `Google events.list failed (${res.status}): ${body.error?.message ?? 'unknown'}`,
      );
    }

    for (const item of body.items ?? []) {
      const normalized = normalizeEvent(item, { context: params.context });
      if (normalized === null) continue;
      if ('cancelledExternalId' in normalized) {
        cancelledIds.push(normalized.cancelledExternalId);
      } else {
        events.push(normalized);
      }
    }

    pageToken = body.nextPageToken;
    // nextSyncToken appears on the LAST page only.
    if (typeof body.nextSyncToken === 'string') {
      nextSyncToken = body.nextSyncToken;
    }
  } while (pageToken);

  return { events, cancelledIds, nextSyncToken, mode };
}
