import { describe, it, expect } from 'vitest';
import { planDay } from './index.js';

describe('packages/planner', () => {
  it('returns a plan proposal with generatedAt matching now', () => {
    const now = new Date('2026-07-12T00:00:00Z');
    const proposal = planDay(
      { userId: 'u1', now },
      { rules: [], maxWorkHoursPerDay: 8 },
      now,
    );
    expect(proposal.generatedAt).toBe(now);
    expect(Array.isArray(proposal.items)).toBe(true);
  });
});
