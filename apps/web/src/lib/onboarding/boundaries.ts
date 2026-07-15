/**
 * Boundaries-step read seam (Story 2.2, AD-1). Reads the raw `joint` event
 * stream ONCE via the injected `LedgerStore` and derives all three sub-states
 * (boundaries, domains, policy templates) with the pure core projections. No
 * new table or migration — the whole step is served from the event log (AD-4).
 */
import {
  projectBoundaries,
  projectDomains,
  projectPolicyTemplates,
  type DailyBoundaries,
  type DomainRow,
  type PolicyTemplateState,
} from '@life-focus/ledger';
import { getStores } from '../stores.js';

/** The full derived state the boundaries step renders. */
export interface BoundariesStepData {
  readonly boundaries: DailyBoundaries | null;
  readonly domains: readonly DomainRow[];
  readonly policies: readonly PolicyTemplateState[];
}

/**
 * Derive the boundaries step's state from a single `joint` event read. One read,
 * three pure projections — the same seam the onboarding projection already uses.
 */
export async function readBoundariesStepData(): Promise<BoundariesStepData> {
  const events = await getStores().ledger.readEvents({ context: 'joint' });
  return {
    boundaries: projectBoundaries(events),
    domains: projectDomains(events),
    policies: projectPolicyTemplates(events),
  };
}
