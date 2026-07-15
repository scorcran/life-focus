import { describe, it, expect, vi } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { GoalRow } from '@life-focus/ledger';
import {
  GOAL_PROTECTION,
  SESSIONS_PER_WEEK_OPTIONS,
  MINUTES_PER_SESSION_OPTIONS,
} from '../../../lib/onboarding/goals-content.js';

// The form imports the `'use server'` action module, which transitively pulls in
// auth/db. Mock it so the accessible-rendering tests stay pure — the action
// wiring is exercised at the projection/action level, not here.
vi.mock('../../../app/(app)/onboarding/goals-actions.js', () => ({
  addGoal: vi.fn(),
}));

const { GoalForm } = await import('./goal-form.js');
const { GoalList } = await import('./goal-list.js');

// Scoring/ranking/gamification vocabulary that must never appear on a goal
// surface (FR-40 / P5).
const SCORING_WORDS = ['score', 'rating', 'rank', 'ranked', 'health', 'grade', 'streak', 'badge'];

describe('GoalForm', () => {
  const html = renderToStaticMarkup(createElement(GoalForm, { atLimit: false }));

  it('renders a labelled section, a title input, and one next-action input', () => {
    expect(html).toContain('aria-labelledby="goal-form-heading"');
    expect(html).toContain('name="title"');
    expect(html).toContain('for="goal-title"');
    expect(html).toContain('name="nextAction"');
    expect(html).toContain('for="goal-next-action"');
  });

  it('renders allocation selects for sessions-per-week and minutes-per-session', () => {
    expect(html).toContain('name="sessionsPerWeek"');
    expect(html).toContain('name="minutesPerSession"');
    expect(html).toContain('<fieldset');
    for (const n of SESSIONS_PER_WEEK_OPTIONS) {
      expect(html).toContain(`value="${n}"`);
    }
    for (const m of MINUTES_PER_SESSION_OPTIONS) {
      expect(html).toContain(`value="${m}"`);
    }
  });

  it('shows the fixed protected-priority framing with a non-color glyph + label (no chooser)', () => {
    expect(html).toContain(GOAL_PROTECTION.label);
    expect(html).toContain(GOAL_PROTECTION.meaning);
    expect(html).toContain(GOAL_PROTECTION.icon);
    // There is NO protection-level radio group — the level is fixed.
    expect(html).not.toContain('name="protectionLevel"');
  });

  it('offers work/personal context radios (never joint)', () => {
    expect(html).toContain('name="context"');
    expect(html).toContain('value="personal"');
    expect(html).toContain('value="work"');
    expect(html).not.toContain('value="joint"');
  });

  it('renders a calm at-limit state and no inputs when three goals exist', () => {
    const atLimit = renderToStaticMarkup(createElement(GoalForm, { atLimit: true }));
    expect(atLimit).toContain('three goals');
    expect(atLimit).not.toContain('name="title"');
    expect(atLimit).not.toContain('name="sessionsPerWeek"');
  });

  it('uses no scoring, ranking, or gamification language (FR-40 / P5)', () => {
    const lower = html.toLowerCase();
    for (const word of SCORING_WORDS) {
      expect(lower).not.toContain(word);
    }
  });
});

describe('GoalList', () => {
  const rows: GoalRow[] = [
    {
      id: 'g-1',
      title: 'Learn to paint',
      nextAction: 'Buy a starter watercolor set',
      allocation: {
        protectionLevel: 'protected-priority',
        frequency: 'weekly',
        sessionsPerWeek: 3,
        minutesPerSession: 45,
      },
      displacementCount: 0,
      context: 'personal',
      createdAt: 't1',
      updatedAt: 't1',
    },
    {
      id: 'g-2',
      title: 'Ship the launch',
      nextAction: 'Draft the plan',
      allocation: {
        protectionLevel: 'protected-priority',
        frequency: 'weekly',
        sessionsPerWeek: 2,
        minutesPerSession: 60,
      },
      displacementCount: 2,
      context: 'work',
      createdAt: 't2',
      updatedAt: 't2',
    },
  ];

  it('renders captured goals with next action, allocation summary, lock label, and context', () => {
    const html = renderToStaticMarkup(createElement(GoalList, { goals: rows }));
    expect(html).toContain('aria-labelledby="goal-list-heading"');
    expect(html).toContain('Learn to paint');
    expect(html).toContain('Next action: Buy a starter watercolor set');
    expect(html).toContain('Protected time: 3 × 45 min each week');
    expect(html).toContain(GOAL_PROTECTION.label);
    expect(html).toContain(GOAL_PROTECTION.icon);
    expect(html).toContain('Personal');
    // Neutral displacement lines: zero-state and a factual count. The apostrophe
    // is HTML-escaped by renderToStaticMarkup (hasn&#x27;t).
    expect(html).toContain('Protected time hasn&#x27;t moved yet.');
    expect(html).toContain('Protected time has been moved 2 times.');
    expect(html).toContain('Ship the launch');
    expect(html).toContain('Work');
  });

  it('shows a calm empty state when no goals are added', () => {
    const html = renderToStaticMarkup(createElement(GoalList, { goals: [] }));
    expect(html).toContain('No goals yet.');
  });

  it('uses no scoring, ranking, or gamification language (FR-40 / P5)', () => {
    const html = renderToStaticMarkup(createElement(GoalList, { goals: rows })).toLowerCase();
    for (const word of SCORING_WORDS) {
      expect(html).not.toContain(word);
    }
  });
});
