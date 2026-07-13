/** Broker stub — cross-context output filter (SEC-2, AD-5). */
// EventContext is the canonical type from ledger (AD-2: no duplication; adapter→core allowed).
export type { EventContext } from '@life-focus/ledger';
import type { EventContext } from '@life-focus/ledger';

export interface BrokerOutput {
  readonly allowed: boolean;
  readonly auditId: string;
}

/**
 * Stub: check whether outputting content from `sourceContext` to `targetContext` is permitted.
 * MVP: same-context or joint always allowed; cross-context always blocked + audited.
 */
export function checkCrossContextOutput(
  sourceContext: EventContext,
  targetContext: EventContext,
): BrokerOutput {
  const allowed = sourceContext === targetContext || sourceContext === 'joint' || targetContext === 'joint';
  return {
    allowed,
    // crypto.randomUUID() is a global on Node 24; later stories will switch to uuidv7 per convention
    auditId: `audit-${crypto.randomUUID()}`,
  };
}
