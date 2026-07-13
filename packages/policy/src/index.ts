/** Policy stub — protection levels, boundaries, autonomy rules. */

export type ProtectionLevel = 'private' | 'sensitive' | 'shared' | 'public';

export interface PolicyRule {
  readonly id: string;
  readonly description: string;
  readonly protectionLevel: ProtectionLevel;
}

export interface PolicySet {
  readonly rules: ReadonlyArray<PolicyRule>;
  readonly maxWorkHoursPerDay: number;
}

export function getDefaultPolicies(): PolicySet {
  return {
    rules: [],
    maxWorkHoursPerDay: 8,
  };
}
