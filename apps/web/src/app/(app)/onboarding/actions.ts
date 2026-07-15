'use server';

/**
 * Guided-onboarding server actions (Story 2.1, AD-1 write seam).
 *
 * Every advance appends exactly one catalog-valid, append-only event
 * (`context: 'joint'`, `actor: session.user.id`) then `redirect()`s to the next
 * incomplete step. State lives entirely in the event log, so resume and "lose
 * nothing" fall out of the ledger — no client wizard state (RSC + server
 * actions, matching the codebase). The onboarding routes live under the
 * authenticated `(app)` shell, so a session is always present here.
 */
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import type { OnboardingStepId, OnboardingStepMode } from '@life-focus/ledger';
import { getAuth } from '../../../lib/auth.js';
import { getStores } from '../../../lib/stores.js';
import { readOnboardingProgress } from '../../../lib/onboarding/progress.js';
import { firstIncompleteStep, isValidStep } from '../../../lib/onboarding/steps.js';

/** Resolve the current actor id from the DB-backed session (AD-6). */
async function requireActor(): Promise<string> {
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session?.user) {
    // The (app) layout already gates on the session; this is a defensive guard.
    redirect('/sign-in');
  }
  return session.user.id;
}

/**
 * Begin the flow: append `OnboardingStarted` (idempotent at the projection),
 * then send the user to the first step with no recorded completion.
 */
export async function beginOnboarding(): Promise<void> {
  const actor = await requireActor();
  await getStores().ledger.append({
    eventType: 'OnboardingStarted',
    actor,
    context: 'joint',
    payload: { startedAt: new Date().toISOString() },
  });
  const progress = await readOnboardingProgress();
  const step = firstIncompleteStep(progress);
  redirect(step ? `/onboarding/${step}` : '/onboarding/complete');
}

/**
 * Advance a step by an explicit user action (Continue → `entered`, Skip →
 * `skipped`). Records the step, then redirects to the next incomplete step, or
 * to the review screen once every step is done.
 */
export async function advanceStep(
  stepId: OnboardingStepId,
  mode: OnboardingStepMode,
): Promise<void> {
  // Server-action args are untrusted at runtime despite the TS type — a crafted
  // form post could carry a non-canonical step id. Reject it rather than append.
  if (!isValidStep(stepId)) {
    redirect('/onboarding');
  }
  const actor = await requireActor();
  await getStores().ledger.append({
    eventType: 'OnboardingStepCompleted',
    actor,
    context: 'joint',
    payload: { stepId, mode, at: new Date().toISOString() },
  });
  // `firstIncompleteStep` is the single source of truth for the resume point
  // (null = every step recorded → the review screen). Routing on it alone avoids
  // a second, linear "next step" ordering that could disagree with the log.
  const next = firstIncompleteStep(await readOnboardingProgress());
  redirect(next ? `/onboarding/${next}` : '/onboarding/complete');
}

/**
 * Finish the flow: append `OnboardingCompleted` (pairs with `OnboardingStarted`
 * to enable story 2.6's timing proof), then land on `/today`.
 */
export async function finishOnboarding(): Promise<void> {
  const actor = await requireActor();
  // Only the terminal transition appends. A double-submit, a start-less finish,
  // or a re-finish must not accrete duplicate/orphan `OnboardingCompleted`
  // events (the log is append-only; story 2.6 pairs start/complete for timing).
  const progress = await readOnboardingProgress();
  if (progress.completed) redirect('/today');
  if (!progress.started) redirect('/onboarding');
  await getStores().ledger.append({
    eventType: 'OnboardingCompleted',
    actor,
    context: 'joint',
    payload: { completedAt: new Date().toISOString() },
  });
  redirect('/today');
}
