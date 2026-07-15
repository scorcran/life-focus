'use server';

/**
 * People-step server action (Story 2.4, AD-1 write seam).
 *
 * `addPerson` appends exactly one catalog-valid, append-only `PersonAdded` event
 * (`actor: session.user.id`, envelope + payload `context` = the selected
 * `work`/`personal` value) then `redirect()`s back to `/onboarding/people` (PRG)
 * so the re-render reflects the projection. Capture is add-only — no UPDATE/DELETE,
 * no edit/remove (AD-4). A blank name, a blank relationship type, a missing/unknown
 * importance, an invalid context, or a partial/malformed important date are all
 * rejected WITHOUT appending — so no malformed or untagged person can ever be
 * created. The action passes an explicit `erasureScope: 'person:'+personId` so a
 * future erase can crypto-shred a specific person. FR-12 / P5: nothing is scored;
 * importance is a user-asserted categorical label and important dates are
 * user-asserted only. The onboarding routes live under the authenticated `(app)`
 * shell, so a session is always present here. State lives entirely in the event
 * log — no client wizard state.
 */
import { randomUUID } from 'node:crypto';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  PERSON_IMPORTANCE,
  WEEKDAYS,
  importantDateSchema,
  type PersonImportance,
  type Weekday,
  type ImportantDate,
} from '@life-focus/ledger';
import { getAuth } from '../../../lib/auth.js';
import { getStores } from '../../../lib/stores.js';

const PEOPLE_STEP_PATH = '/onboarding/people';

/** How many optional important-date rows the form offers. */
const IMPORTANT_DATE_ROWS = 3;

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

/** True if `value` is one of the canonical closeness circles. */
function isImportance(value: string): value is PersonImportance {
  return (PERSON_IMPORTANCE as readonly string[]).includes(value);
}

/**
 * Add one core person. Validates name / relationshipType / importance / context /
 * important-date rows / rhythm; on ANY failure it returns to the step WITHOUT
 * appending. On success it appends one `PersonAdded` — with a weekly rhythm when
 * the rhythm toggle is on (any weekday set, possibly empty for a flexible weekly
 * window), and no rhythm at all when it is off.
 */
export async function addPerson(formData: FormData): Promise<void> {
  const name = field(formData, 'name');
  const relationshipType = field(formData, 'relationshipType');
  const importance = field(formData, 'importance');
  const context = field(formData, 'context');
  const intention = field(formData, 'intention');

  // Non-empty name + relationship type, a known importance, and a work|personal
  // context are all mandatory — a tampered/partial form can never create a
  // malformed or untagged person.
  if (name === '' || relationshipType === '' || !isImportance(importance)) {
    redirect(PEOPLE_STEP_PATH);
  }
  if (context !== 'work' && context !== 'personal') {
    redirect(PEOPLE_STEP_PATH);
  }

  // Parse the fixed set of optional important-date rows. A row with only ONE of
  // label/date filled is a partial the user meant to complete — reject rather
  // than silently drop it. A fully-blank row is simply skipped. A malformed date
  // is rejected via the catalog schema.
  const importantDates: ImportantDate[] = [];
  for (let i = 0; i < IMPORTANT_DATE_ROWS; i++) {
    const label = field(formData, `importantDateLabel-${i}`);
    const date = field(formData, `importantDateValue-${i}`);
    if (label === '' && date === '') continue;
    if (label === '' || date === '') {
      redirect(PEOPLE_STEP_PATH);
    }
    const parsed = importantDateSchema.safeParse({ label, date });
    if (!parsed.success) {
      redirect(PEOPLE_STEP_PATH);
    }
    importantDates.push(parsed.data);
  }

  // The rhythm is present only when its toggle is checked. Its weekday set may be
  // empty (a flexible "sometime each week" window).
  const rhythmOn = formData.get('rhythmEnabled') === 'on';
  const checked = formData.getAll('rhythmDaysOfWeek');
  const daysOfWeek = WEEKDAYS.filter((d) => checked.includes(d)) as Weekday[];

  const now = new Date().toISOString();
  const personId = randomUUID();
  const actor = await requireActor();
  await getStores().ledger.append({
    eventType: 'PersonAdded',
    actor,
    context,
    // Person-precise erasure scope so a future erase can crypto-shred just them.
    erasureScope: `person:${personId}`,
    payload: {
      personId,
      name,
      relationshipType,
      importance,
      ...(intention !== '' ? { intention } : {}),
      ...(importantDates.length > 0 ? { importantDates } : {}),
      context,
      ...(rhythmOn ? { rhythm: { frequency: 'weekly' as const, daysOfWeek } } : {}),
      createdAt: now,
      updatedAt: now,
    },
  });
  redirect(PEOPLE_STEP_PATH);
}
