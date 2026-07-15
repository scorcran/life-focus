/**
 * Goals-step read seam (Story 2.5, AD-1). Reads the raw event stream ONCE via the
 * injected `LedgerStore` — with NO context filter, because goals span both work
 * and personal — and derives the captured list with the pure `projectGoals`
 * projection. No new table or migration; the whole step is served from the
 * append-only event log (AD-4). `title`/`nextAction` decrypt through the store's
 * sensitive-field read.
 */
import { projectGoals, type GoalRow } from '@life-focus/ledger';
import { getStores } from '../stores.js';

/** The derived state the goals step renders. */
export interface GoalsStepData {
  readonly goals: readonly GoalRow[];
}

/**
 * Derive the goals step's state from a single unfiltered event read. Goals span
 * work + personal, so there is no context filter here.
 */
export async function readGoalsStepData(): Promise<GoalsStepData> {
  const events = await getStores().ledger.readEvents();
  return { goals: projectGoals(events) };
}
