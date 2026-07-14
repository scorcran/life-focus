'use server';

/**
 * Boundaries-step server actions (Story 2.2, AD-1 write seam).
 *
 * Each action appends exactly one catalog-valid, append-only event
 * (`context: 'joint'`, `actor: session.user.id`) then `redirect()`s back to
 * `/onboarding/boundaries` (PRG) so the re-render reflects the projection. Edits
 * are latest-wins forward events — no UPDATE/DELETE (AD-4). Blank names, empty
 * content, and malformed times are rejected WITHOUT appending. The onboarding
 * routes live under the authenticated `(app)` shell, so a session is always
 * present here. State lives entirely in the event log — no client wizard state.
 */
import { randomUUID } from 'node:crypto';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { POLICY_TEMPLATE_IDS } from '@life-focus/ledger';
import { getAuth } from '../../../lib/auth.js';
import { getStores } from '../../../lib/stores.js';

const BOUNDARIES_STEP_PATH = '/onboarding/boundaries';

/** True if `id` is one of the canonical MVP starter policy template ids. */
function isKnownTemplateId(id: string): boolean {
  return (POLICY_TEMPLATE_IDS as readonly string[]).includes(id);
}

/** "HH:MM" 24-hour clock format, matching the catalog schema. */
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

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

/**
 * Save the daily boundaries (workday start / hard stop / sleep window). Re-checks
 * the "HH:MM" format server-side; any malformed time rejects the whole set with
 * no append (values unchanged). No ordering constraint (sleep may cross midnight).
 */
export async function saveBoundaries(formData: FormData): Promise<void> {
  const workdayStart = field(formData, 'workdayStart');
  const hardStop = field(formData, 'hardStop');
  const sleepStart = field(formData, 'sleepStart');
  const sleepEnd = field(formData, 'sleepEnd');

  if (
    !TIME_RE.test(workdayStart) ||
    !TIME_RE.test(hardStop) ||
    !TIME_RE.test(sleepStart) ||
    !TIME_RE.test(sleepEnd)
  ) {
    // Malformed time → do not append; the step re-renders with prior values.
    redirect(BOUNDARIES_STEP_PATH);
  }

  const actor = await requireActor();
  await getStores().ledger.append({
    eventType: 'BoundariesSet',
    actor,
    context: 'joint',
    payload: {
      workdayStart,
      hardStop,
      sleepStart,
      sleepEnd,
      updatedAt: new Date().toISOString(),
    },
  });
  redirect(BOUNDARIES_STEP_PATH);
}

/** Rename a life domain. A blank name rejects with no append. */
export async function renameDomain(formData: FormData): Promise<void> {
  const domainId = field(formData, 'domainId');
  const name = field(formData, 'name');
  if (domainId === '' || name === '') {
    redirect(BOUNDARIES_STEP_PATH);
  }

  const actor = await requireActor();
  await getStores().ledger.append({
    eventType: 'DomainRenamed',
    actor,
    context: 'joint',
    payload: { domainId, name, at: new Date().toISOString() },
  });
  redirect(BOUNDARIES_STEP_PATH);
}

/** Enable or disable a life domain. `enabled` arrives as the string "true"/"false". */
export async function setDomainEnabled(formData: FormData): Promise<void> {
  const domainId = field(formData, 'domainId');
  const enabledRaw = field(formData, 'enabled');
  if (domainId === '' || (enabledRaw !== 'true' && enabledRaw !== 'false')) {
    redirect(BOUNDARIES_STEP_PATH);
  }

  const actor = await requireActor();
  await getStores().ledger.append({
    eventType: 'DomainSetEnabled',
    actor,
    context: 'joint',
    payload: { domainId, enabled: enabledRaw === 'true', at: new Date().toISOString() },
  });
  redirect(BOUNDARIES_STEP_PATH);
}

/** Add a custom life domain. A blank name rejects with no append. */
export async function addDomain(formData: FormData): Promise<void> {
  const name = field(formData, 'name');
  if (name === '') {
    redirect(BOUNDARIES_STEP_PATH);
  }

  const actor = await requireActor();
  await getStores().ledger.append({
    eventType: 'DomainAdded',
    actor,
    context: 'joint',
    // A fresh id per add — the projection binds rename/enable events to it.
    payload: { domainId: `custom-${randomUUID()}`, name, at: new Date().toISOString() },
  });
  redirect(BOUNDARIES_STEP_PATH);
}

/** Accept a starter policy template with its (possibly edited) content. Empty content rejects. */
export async function acceptPolicyTemplate(formData: FormData): Promise<void> {
  const templateId = field(formData, 'templateId');
  const content = field(formData, 'content');
  // Reject an unknown template id (tampered/stale form) so the append-only log
  // never accumulates a catalog-valid event the projection would silently drop.
  if (!isKnownTemplateId(templateId) || content === '') {
    redirect(BOUNDARIES_STEP_PATH);
  }

  const actor = await requireActor();
  await getStores().ledger.append({
    eventType: 'PolicyTemplateAccepted',
    actor,
    context: 'joint',
    payload: { templateId, content, at: new Date().toISOString() },
  });
  redirect(BOUNDARIES_STEP_PATH);
}

/** Decline a starter policy template. Recorded once; never re-prompted. */
export async function declinePolicyTemplate(formData: FormData): Promise<void> {
  const templateId = field(formData, 'templateId');
  if (!isKnownTemplateId(templateId)) {
    redirect(BOUNDARIES_STEP_PATH);
  }

  const actor = await requireActor();
  await getStores().ledger.append({
    eventType: 'PolicyTemplateDeclined',
    actor,
    context: 'joint',
    payload: { templateId, at: new Date().toISOString() },
  });
  redirect(BOUNDARIES_STEP_PATH);
}
