import { describe, it, expect } from 'vitest';
import { AssertionSchema, PolicySetSchema } from './index.js';

describe('packages/interpretation-schema', () => {
  it('validates a well-formed Assertion', () => {
    const result = AssertionSchema.safeParse({
      id: 'a1',
      fact: 'Meeting at 2pm',
      confidence: 0.9,
      provenance: { sourceRef: 'email-123', model: 'claude-haiku-4-5', promptVersion: '1.0' },
      context: 'work',
    });
    expect(result.success).toBe(true);
  });

  it('rejects an Assertion with confidence > 1', () => {
    const result = AssertionSchema.safeParse({
      id: 'a2',
      fact: 'x',
      confidence: 1.5,
      provenance: { sourceRef: 's', model: 'm', promptVersion: 'v1' },
      context: 'work',
    });
    expect(result.success).toBe(false);
  });

  it('validates a well-formed PolicySet', () => {
    const result = PolicySetSchema.safeParse({
      rules: [{ id: 'r1', description: 'No work after 6pm', protectionLevel: 'private' }],
      maxWorkHoursPerDay: 8,
    });
    expect(result.success).toBe(true);
  });

  it('rejects a PolicySet with non-positive maxWorkHoursPerDay', () => {
    const result = PolicySetSchema.safeParse({ rules: [], maxWorkHoursPerDay: 0 });
    expect(result.success).toBe(false);
  });
});
