import { describe, it, expect } from 'vitest';
import {
  GOAL_PROTECTION,
  SESSIONS_PER_WEEK_OPTIONS,
  MINUTES_PER_SESSION_OPTIONS,
  DEFAULT_SESSIONS_PER_WEEK,
  DEFAULT_MINUTES_PER_SESSION,
  allocationSummary,
  displacementSummary,
} from './goals-content.js';

// Forbidden language, verbatim from EXPERIENCE.md Voice and Tone.
const FORBIDDEN_WORDS = [
  'productivity score',
  'relationship health',
  'utility score',
  'optimized life',
  'ai knows',
  'objective priority',
  'knowledge-graph score',
];

// Scoring/ranking/gamification vocabulary that must never appear on a goal
// surface (FR-40 / P5).
const SCORING_WORDS = ['score', 'rating', 'rank', 'ranked', 'health', 'grade', 'streak', 'badge'];

describe('goal allocation formatting', () => {
  it('summarizes a protected weekly allocation in plain language', () => {
    expect(allocationSummary(3, 45)).toBe('Protected time: 3 × 45 min each week');
    expect(allocationSummary(1, 30)).toBe('Protected time: 1 × 30 min each week');
  });
});

describe('goal displacement summary (neutral, no guilt)', () => {
  it('reads calmly at zero', () => {
    expect(displacementSummary(0)).toBe("Protected time hasn't moved yet.");
    expect(displacementSummary(-1)).toBe("Protected time hasn't moved yet.");
  });

  it('states a positive count factually, singular vs plural', () => {
    expect(displacementSummary(1)).toBe('Protected time has been moved 1 time.');
    expect(displacementSummary(2)).toBe('Protected time has been moved 2 times.');
  });

  it('never uses guilt, scoring, gamification, or forbidden words', () => {
    const corpus = [
      allocationSummary(3, 45),
      displacementSummary(0),
      displacementSummary(1),
      displacementSummary(4),
      GOAL_PROTECTION.label,
      GOAL_PROTECTION.meaning,
    ]
      .join(' ')
      .toLowerCase();
    for (const word of FORBIDDEN_WORDS) {
      expect(corpus).not.toContain(word);
    }
    for (const word of SCORING_WORDS) {
      expect(corpus).not.toContain(word);
    }
  });
});

describe('goal form option lists and protected-priority framing', () => {
  it('offers whole-number sessions 1–7 with a sensible default', () => {
    expect(SESSIONS_PER_WEEK_OPTIONS).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(SESSIONS_PER_WEEK_OPTIONS).toContain(DEFAULT_SESSIONS_PER_WEEK);
    expect(SESSIONS_PER_WEEK_OPTIONS.every((n) => Number.isInteger(n) && n >= 1 && n <= 7)).toBe(true);
  });

  it('offers whole-minute session lengths within range with a sensible default', () => {
    expect(MINUTES_PER_SESSION_OPTIONS).toContain(DEFAULT_MINUTES_PER_SESSION);
    expect(
      MINUTES_PER_SESSION_OPTIONS.every((m) => Number.isInteger(m) && m >= 1 && m <= 480),
    ).toBe(true);
  });

  it('reuses the protected-priority lock glyph + label (non-color marker present)', () => {
    expect(GOAL_PROTECTION.id).toBe('protected-priority');
    expect(GOAL_PROTECTION.label).toBe('Protected priority');
    // A non-color glyph accompanies the label; the label carries the semantic.
    expect(GOAL_PROTECTION.icon.trim().length).toBeGreaterThan(0);
  });
});
