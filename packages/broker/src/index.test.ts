import { describe, it, expect } from 'vitest';
import { checkCrossContextOutput } from './index.js';

describe('packages/broker', () => {
  it('allows same-context output', () => {
    const result = checkCrossContextOutput('work', 'work');
    expect(result.allowed).toBe(true);
  });

  it('blocks cross-context output', () => {
    const result = checkCrossContextOutput('work', 'personal');
    expect(result.allowed).toBe(false);
  });

  it('allows joint-context output', () => {
    const result = checkCrossContextOutput('joint', 'work');
    expect(result.allowed).toBe(true);
  });
});
