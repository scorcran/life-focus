/** Pure planning function stub — no I/O, no LLM calls (AD-1, AD-2). */
// ContextSnapshot and PolicySet are the canonical types from
// interpretation-schema (AD-2: single source of truth, no duplication).
export type { ContextSnapshot, PolicySet } from '@life-focus/interpretation-schema';
import type { ContextSnapshot, PolicySet } from '@life-focus/interpretation-schema';

export interface PlanProposal {
  readonly id: string;
  readonly generatedAt: Date;
  readonly items: ReadonlyArray<{ title: string; durationMinutes: number }>;
}

/**
 * Pure planning function: (ContextSnapshot, PolicySet, now) → PlanProposal
 * Stub implementation — returns an empty proposal.
 */
export function planDay(
  _snapshot: ContextSnapshot,
  _policies: PolicySet,
  now: Date,
): PlanProposal {
  return {
    id: `plan-${now.getTime()}`,
    generatedAt: now,
    items: [],
  };
}
