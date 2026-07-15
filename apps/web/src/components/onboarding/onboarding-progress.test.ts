import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { OnboardingProgress } from '@life-focus/ledger';
import { OnboardingProgressIndicator } from './onboarding-progress.js';

function progressWith(steps: OnboardingProgress['steps']): OnboardingProgress {
  return { started: true, startedAt: 't0', steps, completed: false, completedAt: null };
}

describe('OnboardingProgressIndicator', () => {
  it('lists all four steps by title', () => {
    const html = renderToStaticMarkup(
      createElement(OnboardingProgressIndicator, { progress: progressWith({}) }),
    );
    for (const title of ['Your boundaries', 'Your commitments', 'The people who matter']) {
      expect(html).toContain(title);
    }
  });

  it('marks the current step with aria-current="step"', () => {
    const html = renderToStaticMarkup(
      createElement(OnboardingProgressIndicator, {
        progress: progressWith({}),
        currentStepId: 'commitments',
      }),
    );
    expect((html.match(/aria-current="step"/g) ?? []).length).toBe(1);
  });

  it('conveys done and skipped by text (not color alone)', () => {
    const html = renderToStaticMarkup(
      createElement(OnboardingProgressIndicator, {
        progress: progressWith({
          boundaries: { mode: 'entered', at: 't1' },
          commitments: { mode: 'skipped', at: 't2' },
        }),
        currentStepId: 'people',
      }),
    );
    // Status words render as text — a screen reader gets them without color.
    expect(html).toContain('Done');
    expect(html).toContain('Skipped');
    expect(html).toContain('Not yet');
  });

  it('announces position and recorded-count separately on a step page', () => {
    const html = renderToStaticMarkup(
      createElement(OnboardingProgressIndicator, {
        progress: progressWith({}),
        currentStepId: 'people',
      }),
    );
    // Position (step 3) must not be conflated with completion (0 recorded).
    expect(html).toContain('aria-label="Setup progress: on step 3 of 4, 0 recorded so far"');
  });

  it('announces a recorded-count (not a position) on the review screen', () => {
    const html = renderToStaticMarkup(
      createElement(OnboardingProgressIndicator, {
        progress: progressWith({
          boundaries: { mode: 'entered', at: 't' },
          commitments: { mode: 'skipped', at: 't' },
        }),
      }),
    );
    expect(html).toContain('aria-label="Setup progress: 2 of 4 steps recorded"');
  });

  it('renders an ordered list landmark', () => {
    const html = renderToStaticMarkup(
      createElement(OnboardingProgressIndicator, { progress: progressWith({}) }),
    );
    expect(html).toContain('<ol');
  });
});
