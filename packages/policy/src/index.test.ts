import { describe, it, expect } from 'vitest';
// PolicySet is the canonical type from @life-focus/interpretation-schema; the
// getDefaultPolicies return type is checked against it at compile time.
import { getDefaultPolicies } from './index.js';

describe('packages/policy', () => {
  it('returns default policies with sensible work-hour limit', () => {
    const policies = getDefaultPolicies();
    expect(policies.maxWorkHoursPerDay).toBe(8);
    expect(Array.isArray(policies.rules)).toBe(true);
  });

  it('default policies match the canonical PolicySet shape', () => {
    const policies = getDefaultPolicies();
    expect(policies).toEqual({ rules: [], maxWorkHoursPerDay: 8 });
    expect(policies.maxWorkHoursPerDay).toBeGreaterThan(0);
    expect(policies.maxWorkHoursPerDay).toBeLessThanOrEqual(24);
  });
});
