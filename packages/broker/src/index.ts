/** Broker — cross-context output filter (SEC-2, AD-5, AC-14). */
// EventContext is the canonical type from ledger (AD-2: no duplication; adapter→core allowed).
// Import ONLY the port TYPE from ledger — the broker never imports @life-focus/db (AD-1).
export type { EventContext } from '@life-focus/ledger';
import type { EventContext, LedgerStore } from '@life-focus/ledger';

export interface BrokerOutput {
  readonly allowed: boolean;
  /** The id of the appended `CrossContextAccessAudited` event (AC-14). */
  readonly auditId: string;
}

/**
 * Check whether outputting content from `sourceContext` to `targetContext` is
 * permitted, and append a real `CrossContextAccessAudited` event through the
 * injected `LedgerStore` port (AC-14 — audit is written even when denied).
 *
 * AD-5 rules:
 * - Same-context flows are always allowed.
 * - 'joint' is legal ONLY as a target, and only for planning-layer artifacts
 *   (`isPlanningArtifact` must be true).
 * - work ↔ personal flows are always blocked.
 *
 * The `LedgerStore` implementation is supplied by the caller (a host), so the
 * broker stays free of any adapter/DB dependency (AD-1).
 */
export async function checkCrossContextOutput(
  store: LedgerStore,
  sourceContext: EventContext,
  targetContext: EventContext,
  options: { readonly isPlanningArtifact?: boolean } = {},
): Promise<BrokerOutput> {
  const isPlanningArtifact = options.isPlanningArtifact === true;
  const sameContext = sourceContext === targetContext;
  const jointPlanningTarget = targetContext === 'joint' && isPlanningArtifact;
  const allowed = sameContext || jointPlanningTarget;

  // AC-14: every cross-context read/emit is a real appended audit event.
  const audit = await store.append({
    eventType: 'CrossContextAccessAudited',
    actor: 'broker',
    context: sourceContext,
    payload: {
      sourceContext,
      targetContext,
      allowed,
      isPlanningArtifact,
    },
  });

  return { allowed, auditId: audit.id };
}
