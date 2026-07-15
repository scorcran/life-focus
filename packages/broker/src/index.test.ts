import { describe, it, expect } from 'vitest';
import { checkCrossContextOutput } from './index.js';

describe('packages/broker', () => {
  it('allows same-context output', () => {
    expect(checkCrossContextOutput('work', 'work').allowed).toBe(true);
    expect(checkCrossContextOutput('personal', 'personal').allowed).toBe(true);
    expect(checkCrossContextOutput('joint', 'joint').allowed).toBe(true);
  });

  it('blocks work↔personal output in both directions', () => {
    expect(checkCrossContextOutput('work', 'personal').allowed).toBe(false);
    expect(checkCrossContextOutput('personal', 'work').allowed).toBe(false);
    expect(checkCrossContextOutput('work', 'personal', { isPlanningArtifact: true }).allowed).toBe(false);
  });

  it('allows context→joint only for planning-layer artifacts', () => {
    expect(checkCrossContextOutput('work', 'joint', { isPlanningArtifact: true }).allowed).toBe(true);
    expect(checkCrossContextOutput('personal', 'joint', { isPlanningArtifact: true }).allowed).toBe(true);
    expect(checkCrossContextOutput('work', 'joint').allowed).toBe(false);
    expect(checkCrossContextOutput('personal', 'joint', { isPlanningArtifact: false }).allowed).toBe(false);
  });

  it('blocks joint as a source into work or personal (joint is target-only)', () => {
    expect(checkCrossContextOutput('joint', 'work').allowed).toBe(false);
    expect(checkCrossContextOutput('joint', 'personal').allowed).toBe(false);
    expect(checkCrossContextOutput('joint', 'work', { isPlanningArtifact: true }).allowed).toBe(false);
  });

  it('returns an auditId placeholder on every check', () => {
    const result = checkCrossContextOutput('work', 'personal');
    expect(result.auditId).toMatch(/^audit-/);
  });
});
