/**
 * Commitments-step read seam (Story 2.3, AD-1). Reads the raw event stream ONCE
 * via the injected `LedgerStore` — with NO context filter, because commitments
 * span both work and personal — and derives the captured list with the pure
 * `projectCommitments` projection. No new table or migration; the whole step is
 * served from the append-only event log (AD-4).
 */
import { projectCommitments, type CommitmentRow } from '@life-focus/ledger';
import { getStores } from '../stores.js';

/** The derived state the commitments step renders. */
export interface CommitmentsStepData {
  readonly commitments: readonly CommitmentRow[];
}

/**
 * Derive the commitments step's state from a single unfiltered event read.
 * Commitments span work + personal, so there is no context filter here.
 */
export async function readCommitmentsStepData(): Promise<CommitmentsStepData> {
  const events = await getStores().ledger.readEvents();
  return { commitments: projectCommitments(events) };
}
