/**
 * Host wiring for the ledger + calendar mirror stores (Story 1.4).
 *
 * Builds a single DB client and the injected stores from `loadConfig()`. Lazy
 * singleton so server components/actions/routes share one pool. This is host
 * glue (AD-1): it composes adapters; it contains no domain logic.
 */
import { loadConfig } from '@life-focus/config';
import {
  createDbClient,
  createLedgerStore,
  createMirrorStore,
  type MirrorStore,
} from '@life-focus/db';
import type { LedgerStore } from '@life-focus/ledger';

interface Stores {
  readonly ledger: LedgerStore;
  readonly mirror: MirrorStore;
}

let _stores: Stores | null = null;

export function getStores(): Stores {
  if (_stores === null) {
    const config = loadConfig();
    const client = createDbClient(config.DATABASE_URL);
    const ledger = createLedgerStore(client, { masterKey: config.LEDGER_MASTER_KEY });
    const mirror = createMirrorStore(client, { masterKey: config.LEDGER_MASTER_KEY, ledger });
    _stores = { ledger, mirror };
  }
  return _stores;
}
