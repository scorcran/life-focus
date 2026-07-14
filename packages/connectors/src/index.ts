/**
 * Connectors adapter (AD-1, AD-7): sense-layer that writes to source-mirror
 * caches only. This package may import TYPES from `@life-focus/ledger` and do
 * HTTP I/O via an INJECTED client, but never imports `@life-focus/db` or a host.
 *
 * The Google Calendar connector is a thin, injectable wrapper over the pure
 * `oauth`/`sync`/`normalize` modules so hosts (apps/web, apps/worker) do the
 * wiring and tests inject fakes.
 */

export * from './gcal/types.js';
export { normalizeEvent } from './gcal/normalize.js';
export type { GoogleEvent, GoogleEventDateTime } from './gcal/normalize.js';
export {
  buildAuthUrl,
  exchangeCode,
  refreshAccessToken,
  fetchAccountEmail,
} from './gcal/oauth.js';
export type {
  BuildAuthUrlParams,
  ExchangeCodeParams,
  RefreshTokenParams,
  OAuthTokens,
} from './gcal/oauth.js';
export { syncEvents } from './gcal/sync.js';
export type { SyncEventsParams, SyncEventsResult } from './gcal/sync.js';

import {
  buildAuthUrl,
  exchangeCode,
  refreshAccessToken,
  fetchAccountEmail,
  type BuildAuthUrlParams,
  type ExchangeCodeParams,
  type RefreshTokenParams,
  type OAuthTokens,
} from './gcal/oauth.js';
import { syncEvents, type SyncEventsParams, type SyncEventsResult } from './gcal/sync.js';
import type { HttpClient } from './gcal/types.js';

/** The real, client-backed Google Calendar connector. */
export interface GcalConnector {
  buildAuthUrl(params: BuildAuthUrlParams): string;
  exchangeCode(params: ExchangeCodeParams): Promise<OAuthTokens>;
  refreshAccessToken(params: RefreshTokenParams): Promise<OAuthTokens>;
  fetchAccountEmail(accessToken: string): Promise<string>;
  syncEvents(params: SyncEventsParams): Promise<SyncEventsResult>;
}

/**
 * Create a Google Calendar connector bound to an injected HTTP client.
 * `buildAuthUrl` is pure; the rest close over `http` so hosts supply `fetch`
 * and tests supply a fake — no real network in the test gate (AD-1).
 */
export function createGcalConnector(http: HttpClient): GcalConnector {
  return {
    buildAuthUrl,
    exchangeCode: (params) => exchangeCode(http, params),
    refreshAccessToken: (params) => refreshAccessToken(http, params),
    fetchAccountEmail: (accessToken) => fetchAccountEmail(http, accessToken),
    syncEvents: (params) => syncEvents(http, params),
  };
}
