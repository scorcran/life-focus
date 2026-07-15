/** Policy stub — protection levels, boundaries, autonomy rules. */
// PolicySet is the canonical type from interpretation-schema (AD-2: no duplication).
export type { PolicySet, PolicyRule, ProtectionLevel } from '@life-focus/interpretation-schema';
import type { PolicySet } from '@life-focus/interpretation-schema';

export function getDefaultPolicies(): PolicySet {
  return {
    rules: [],
    maxWorkHoursPerDay: 8,
  };
}
