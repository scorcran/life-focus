import { describe, it, expect } from 'vitest';
import { getDefaultPolicies } from './index.js';

describe('packages/policy', () => {
  it('returns default policies with sensible work-hour limit', () => {
    const policies = getDefaultPolicies();
    expect(policies.maxWorkHoursPerDay).toBe(8);
    expect(Array.isArray(policies.rules)).toBe(true);
  });
});
