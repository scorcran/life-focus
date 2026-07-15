/**
 * People-step read seam (Story 2.4, AD-1). Reads the raw event stream ONCE via
 * the injected `LedgerStore` — with NO context filter, because people span both
 * work and personal — and derives the captured list with the pure `projectPeople`
 * projection. No new table or migration; the whole step is served from the
 * append-only event log (AD-4). `name`/`intention` decrypt through the store's
 * sensitive-field read.
 */
import { projectPeople, type PersonRow } from '@life-focus/ledger';
import { getStores } from '../stores.js';

/** The derived state the people step renders. */
export interface PeopleStepData {
  readonly people: readonly PersonRow[];
}

/**
 * Derive the people step's state from a single unfiltered event read. People
 * span work + personal, so there is no context filter here.
 */
export async function readPeopleStepData(): Promise<PeopleStepData> {
  const events = await getStores().ledger.readEvents();
  return { people: projectPeople(events) };
}
