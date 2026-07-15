'use server';

/**
 * Goals-step server action (Story 2.5, AD-1 write seam).
 *
 * `addGoal` appends exactly one catalog-valid, append-only `GoalAdded` event
 * (`actor: session.user.id`, envelope + payload `context` = the selected
 * `work`/`personal` value) then `redirect()`s back to `/onboarding/goals` (PRG)
 * so the re-render reflects the projection. Capture is add-only — no UPDATE/DELETE,
 * no edit/remove (AD-4). A blank title, a blank next action, an invalid context,
 * or an out-of-range/non-integer allocation are all rejected WITHOUT appending —
 * so no malformed or untagged goal can ever be created. At most 3 active goals
 * are allowed: a 4th add is rejected WITHOUT appending (the form renders a calm
 * at-limit state). The action passes an explicit `erasureScope: 'goal:'+goalId`
 * so a future erase can crypto-shred a specific goal. FR-40 / P5: nothing is
 * scored; the user never picks a protection level (the allocation is protected-
 * priority by construction). The onboarding routes live under the authenticated
 * `(app)` shell, so a session is always present here. State lives entirely in the
 * event log — no client wizard state.
 */
import { randomUUID } from 'node:crypto';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { projectGoals } from '@life-focus/ledger';
import { getAuth } from '../../../lib/auth.js';
import { getStores } from '../../../lib/stores.js';

const GOALS_STEP_PATH = '/onboarding/goals';

/** At most 3 active goals may be captured (a cross-event cap, enforced here). */
const MAX_ACTIVE_GOALS = 3;

/** Resolve the current actor id from the DB-backed session (AD-6). */
async function requireActor(): Promise<string> {
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session?.user) {
    // The (app) layout already gates on the session; this is a defensive guard.
    redirect('/sign-in');
  }
  return session.user.id;
}

/** Read a single trimmed string form field, or '' when absent. */
function field(formData: FormData, key: string): string {
  const raw = formData.get(key);
  return typeof raw === 'string' ? raw.trim() : '';
}

/** Parse a whole-number field, or NaN when absent/malformed. */
function intField(formData: FormData, key: string): number {
  const raw = field(formData, key);
  if (raw === '' || !/^\d+$/.test(raw)) return Number.NaN;
  return Number(raw);
}

/**
 * Add one goal. Validates title / next action / context / allocation and enforces
 * the ≤3-active-goals cap; on ANY failure it returns to the step WITHOUT
 * appending. On success it appends one `GoalAdded` with the fixed protected-
 * priority weekly allocation embedded.
 */
export async function addGoal(formData: FormData): Promise<void> {
  // Resolve the actor FIRST. A server action does not re-run the `(app)` layout,
  // so this is the real auth guard for the mutation — and because the ≤3 cap
  // reads (and decrypts) the whole event log below, an unauthenticated request
  // must short-circuit before any of that sensitive work runs.
  const actor = await requireActor();

  const title = field(formData, 'title');
  const nextAction = field(formData, 'nextAction');
  const context = field(formData, 'context');
  const sessionsPerWeek = intField(formData, 'sessionsPerWeek');
  const minutesPerSession = intField(formData, 'minutesPerSession');

  // Non-empty title + next action and a work|personal context are mandatory — a
  // tampered/partial form can never create a malformed or untagged goal.
  if (title === '' || nextAction === '') {
    redirect(GOALS_STEP_PATH);
  }
  if (context !== 'work' && context !== 'personal') {
    redirect(GOALS_STEP_PATH);
  }
  // Allocation must be whole numbers in range (weekly-only, 1–7 × 1–480 min).
  if (
    !Number.isInteger(sessionsPerWeek) ||
    sessionsPerWeek < 1 ||
    sessionsPerWeek > 7 ||
    !Number.isInteger(minutesPerSession) ||
    minutesPerSession < 1 ||
    minutesPerSession > 480
  ) {
    redirect(GOALS_STEP_PATH);
  }

  // At-most-3 cap is cross-event — enforce it against the current projection.
  // Because capture is add-only in 2.5, active count equals the projected count.
  const events = await getStores().ledger.readEvents();
  if (projectGoals(events).length >= MAX_ACTIVE_GOALS) {
    redirect(GOALS_STEP_PATH);
  }

  const now = new Date().toISOString();
  const goalId = randomUUID();
  await getStores().ledger.append({
    eventType: 'GoalAdded',
    actor,
    context,
    // Goal-precise erasure scope so a future erase can crypto-shred just it.
    erasureScope: `goal:${goalId}`,
    payload: {
      goalId,
      title,
      nextAction,
      allocation: { frequency: 'weekly' as const, sessionsPerWeek, minutesPerSession },
      context,
      createdAt: now,
      updatedAt: now,
    },
  });
  redirect(GOALS_STEP_PATH);
}
