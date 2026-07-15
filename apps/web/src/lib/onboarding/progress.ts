/**
 * Onboarding progress read seam (AD-1). Reads the raw `joint` event stream via
 * the injected `LedgerStore` and derives progress with the pure core projection.
 * No new table or migration — progress is served from the event log.
 */
import { projectOnboarding, type OnboardingProgress } from '@life-focus/ledger';
import { getStores } from '../stores.js';

/** Derive the current onboarding progress from the `joint` event stream. */
export async function readOnboardingProgress(): Promise<OnboardingProgress> {
  const events = await getStores().ledger.readEvents({ context: 'joint' });
  return projectOnboarding(events);
}
