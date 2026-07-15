import { describe, it, expect, vi } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { CommitmentRow } from '@life-focus/ledger';
import { PROTECTION_LEVEL_OPTIONS } from '../../../lib/onboarding/protection-levels.js';

// The form imports the `'use server'` action module, which transitively pulls in
// auth/db. Mock it so the accessible-rendering tests stay pure — the action
// wiring is exercised at the projection/action level, not here.
vi.mock('../../../app/(app)/onboarding/commitments-actions.js', () => ({
  addCommitment: vi.fn(),
}));

const { CommitmentForm } = await import('./commitment-form.js');
const { CommitmentList } = await import('./commitment-list.js');

describe('CommitmentForm', () => {
  const html = renderToStaticMarkup(createElement(CommitmentForm));

  it('renders a labelled section and a title input', () => {
    expect(html).toContain('aria-labelledby="commitment-form-heading"');
    expect(html).toContain('name="title"');
    expect(html).toContain('for="commitment-title"');
  });

  it('renders all four protection levels with their meanings and a non-color icon + label', () => {
    expect(PROTECTION_LEVEL_OPTIONS).toHaveLength(4);
    for (const level of PROTECTION_LEVEL_OPTIONS) {
      // A radio option keyed to the canonical level id.
      expect(html).toContain(`value="${level.id}"`);
      // The visible text label carries the semantic.
      expect(html).toContain(level.label);
      // The plain-language meaning is shown at the moment of selection.
      expect(html).toContain(level.meaning);
      // A non-color glyph accompanies the label (aria-hidden).
      expect(html).toContain(level.icon);
    }
    // The protection level radio group is a labelled fieldset.
    expect(html).toContain('<fieldset');
    expect(html).toContain('name="protectionLevel"');
  });

  it('offers work/personal context radios (never joint)', () => {
    expect(html).toContain('name="context"');
    expect(html).toContain('value="personal"');
    expect(html).toContain('value="work"');
    expect(html).not.toContain('value="joint"');
  });

  it('offers weekday checkboxes for optional weekly recurrence', () => {
    expect(html).toContain('name="daysOfWeek"');
    expect(html).toContain('type="checkbox"');
    for (const day of ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']) {
      expect(html).toContain(`value="${day}"`);
    }
  });
});

describe('CommitmentList', () => {
  const rows: CommitmentRow[] = [
    {
      id: 'c-1',
      title: 'Thursday 3:30 pickup',
      context: 'personal',
      status: 'captured',
      protectionLevel: 'hard-commitment',
      recurrence: { frequency: 'weekly', daysOfWeek: ['thu'] },
      createdAt: 't1',
      updatedAt: 't1',
    },
    {
      id: 'c-2',
      title: 'Ship the release',
      context: 'work',
      status: 'captured',
      protectionLevel: 'protected-priority',
      recurrence: null,
      createdAt: 't2',
      updatedAt: 't2',
    },
  ];

  it('renders captured items with level label, recurrence summary, and context', () => {
    const html = renderToStaticMarkup(createElement(CommitmentList, { commitments: rows }));
    expect(html).toContain('aria-labelledby="commitment-list-heading"');
    expect(html).toContain('Thursday 3:30 pickup');
    expect(html).toContain('Hard commitment');
    expect(html).toContain('Repeats weekly: Thu');
    expect(html).toContain('Personal');
    expect(html).toContain('Ship the release');
    expect(html).toContain('Protected priority');
    expect(html).toContain('One-off');
    expect(html).toContain('Work');
  });

  it('shows a calm empty state when nothing is captured', () => {
    const html = renderToStaticMarkup(createElement(CommitmentList, { commitments: [] }));
    expect(html).toContain('Nothing captured yet.');
  });
});
