'use server';

/**
 * Commitments-step server action (Story 2.3, AD-1 write seam).
 *
 * `addCommitment` appends exactly one catalog-valid, append-only
 * `CommitmentCaptured` event (`actor: session.user.id`, envelope + payload
 * `context` = the selected `work`/`personal` value) then `redirect()`s back to
 * `/onboarding/commitments` (PRG) so the re-render reflects the projection.
 * Capture is add-only — no UPDATE/DELETE, no edit/remove (AD-4). A blank title,
 * a missing/unknown protection level, an invalid context, or a weekly recurrence
 * intended with zero weekdays are all rejected WITHOUT appending — so no
 * untagged or malformed plannable item can ever be created. The onboarding
 * routes live under the authenticated `(app)` shell, so a session is always
 * present here. State lives entirely in the event log — no client wizard state.
 */
import { randomUUID } from 'node:crypto';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  PROTECTION_LEVELS,
  WEEKDAYS,
  type ProtectionLevel,
  type Weekday,
} from '@life-focus/ledger';
import { getAuth } from '../../../lib/auth.js';
import { getStores } from '../../../lib/stores.js';

const COMMITMENTS_STEP_PATH = '/onboarding/commitments';

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

/** True if `value` is one of the four canonical FR-3 protection levels. */
function isProtectionLevel(value: string): value is ProtectionLevel {
  return (PROTECTION_LEVELS as readonly string[]).includes(value);
}

/**
 * Capture one commitment. Validates title / protectionLevel / context /
 * weekdays; on any failure it returns to the step WITHOUT appending. On success
 * it appends one `CommitmentCaptured` — with a weekly recurrence when ≥1 weekday
 * is checked, and no recurrence at all when none are (a one-off).
 */
export async function addCommitment(formData: FormData): Promise<void> {
  const title = field(formData, 'title');
  const protectionLevel = field(formData, 'protectionLevel');
  const context = field(formData, 'context');

  // Non-empty title, a known protection level, and a work|personal context are
  // all mandatory — a tampered/partial form can never create an untagged item.
  if (title === '' || !isProtectionLevel(protectionLevel)) {
    redirect(COMMITMENTS_STEP_PATH);
  }
  if (context !== 'work' && context !== 'personal') {
    redirect(COMMITMENTS_STEP_PATH);
  }

  // Collect the checked weekdays in canonical order.
  const checked = formData.getAll('daysOfWeek');
  const daysOfWeek = WEEKDAYS.filter((d) => checked.includes(d)) as Weekday[];

  const now = new Date().toISOString();
  const actor = await requireActor();
  await getStores().ledger.append({
    eventType: 'CommitmentCaptured',
    actor,
    context,
    payload: {
      commitmentId: randomUUID(),
      title,
      context,
      protectionLevel,
      // ≥1 weekday → a weekly rule; 0 → omit recurrence entirely (a one-off).
      ...(daysOfWeek.length > 0
        ? { recurrence: { frequency: 'weekly' as const, daysOfWeek } }
        : {}),
      createdAt: now,
      updatedAt: now,
    },
  });
  redirect(COMMITMENTS_STEP_PATH);
}
