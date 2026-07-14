import { describe, it, expect } from 'vitest';
import type { OnboardingProgress } from '@life-focus/ledger';
import {
  ONBOARDING_STEPS,
  isValidStep,
  firstIncompleteStep,
  nextStep,
  stepContent,
} from './steps.js';

/** Build an OnboardingProgress with the given recorded steps. */
function progressWith(
  steps: OnboardingProgress['steps'],
  overrides: Partial<OnboardingProgress> = {},
): OnboardingProgress {
  return {
    started: true,
    startedAt: 't0',
    steps,
    completed: false,
    completedAt: null,
    ...overrides,
  };
}

describe('onboarding presentation catalog', () => {
  it('is ordered boundaries → commitments → people → goals', () => {
    expect(ONBOARDING_STEPS.map((s) => s.id)).toEqual([
      'boundaries',
      'commitments',
      'people',
      'goals',
    ]);
  });

  it('every step names why it matters ("What this protects")', () => {
    for (const step of ONBOARDING_STEPS) {
      expect(step.title.length).toBeGreaterThan(0);
      expect(step.whatThisProtects.length).toBeGreaterThan(0);
    }
  });
});

describe('isValidStep', () => {
  it('accepts canonical ids and rejects anything else', () => {
    expect(isValidStep('boundaries')).toBe(true);
    expect(isValidStep('goals')).toBe(true);
    expect(isValidStep('nonsense')).toBe(false);
    expect(isValidStep('')).toBe(false);
  });
});

describe('firstIncompleteStep (resume)', () => {
  it('returns the first step with no completion', () => {
    expect(firstIncompleteStep(progressWith({}))).toBe('boundaries');
    expect(
      firstIncompleteStep(progressWith({ boundaries: { mode: 'entered', at: 't1' } })),
    ).toBe('commitments');
  });

  it('skipped counts as recorded — resume moves past it', () => {
    expect(
      firstIncompleteStep(
        progressWith({
          boundaries: { mode: 'entered', at: 't1' },
          commitments: { mode: 'skipped', at: 't2' },
        }),
      ),
    ).toBe('people');
  });

  it('returns null when every step is recorded', () => {
    expect(
      firstIncompleteStep(
        progressWith({
          boundaries: { mode: 'entered', at: 't1' },
          commitments: { mode: 'skipped', at: 't2' },
          people: { mode: 'entered', at: 't3' },
          goals: { mode: 'entered', at: 't4' },
        }),
      ),
    ).toBeNull();
  });
});

describe('nextStep', () => {
  it('walks the canonical order and ends at null', () => {
    expect(nextStep('boundaries')).toBe('commitments');
    expect(nextStep('commitments')).toBe('people');
    expect(nextStep('people')).toBe('goals');
    expect(nextStep('goals')).toBeNull();
  });
});

describe('stepContent', () => {
  it('returns the content for a step id', () => {
    expect(stepContent('people').id).toBe('people');
    expect(stepContent('people').title.length).toBeGreaterThan(0);
  });
});
