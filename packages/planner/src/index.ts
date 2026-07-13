/** Pure planning function stub — no I/O, no LLM calls (AD-1, AD-2). */
// ContextSnapshot is the canonical type from interpretation-schema (AD-2: no duplication).
export type { ContextSnapshot } from '@life-focus/interpretation-schema';
import type { ContextSnapshot } from '@life-focus/interpretation-schema';

export interface PolicySet {
  readonly maxWorkHoursPerDay: number;
}

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
  snapshot: ContextSnapshot,
  policies: PolicySet,
  now: Date,
): PlanProposal {
  return {
    id: `plan-${now.getTime()}`,
    generatedAt: now,
    items: [],
  };
}
