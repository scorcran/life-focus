/** Broker stub — cross-context output filter (SEC-2, AD-5). */
// EventContext is the canonical type from ledger (AD-2: no duplication; adapter→core allowed).
export type { EventContext } from '@life-focus/ledger';
import type { EventContext } from '@life-focus/ledger';

export interface BrokerOutput {
  readonly allowed: boolean;
  readonly auditId: string;
}

/**
 * Check whether outputting content from `sourceContext` to `targetContext` is permitted.
 *
 * AD-5 rules:
 * - Same-context flows are always allowed.
 * - 'joint' is legal ONLY as a target, and only for planning-layer artifacts
 *   (`isPlanningArtifact` must be true).
 * - work ↔ personal flows are always blocked.
 *
 * The returned auditId is a placeholder — audit emission to the event ledger is
 * TODO for story 1.3 (the event ledger); no audit record is persisted yet.
 */
export function checkCrossContextOutput(
  sourceContext: EventContext,
  targetContext: EventContext,
  options: { readonly isPlanningArtifact?: boolean } = {},
): BrokerOutput {
  const sameContext = sourceContext === targetContext;
  const jointPlanningTarget =
    targetContext === 'joint' && options.isPlanningArtifact === true;
  const allowed = sameContext || jointPlanningTarget;
  return {
    allowed,
    // crypto.randomUUID() is a global on Node 24; later stories will switch to uuidv7 per convention
    auditId: `audit-${crypto.randomUUID()}`,
  };
}
