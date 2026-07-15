import { describe, it, expect, vi } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { PersonRow } from '@life-focus/ledger';
import { PERSON_IMPORTANCE_OPTIONS } from '../../../lib/onboarding/people-content.js';

// The form imports the `'use server'` action module, which transitively pulls in
// auth/db. Mock it so the accessible-rendering tests stay pure — the action
// wiring is exercised at the projection/action level, not here.
vi.mock('../../../app/(app)/onboarding/people-actions.js', () => ({
  addPerson: vi.fn(),
}));

const { PersonForm } = await import('./person-form.js');
const { PersonList } = await import('./person-list.js');

// Scoring/ranking vocabulary that must never appear on a people surface (P5).
// Kept identical to the people-content catalog test so the same full guard
// covers both the catalog copy and the rendered component copy.
const SCORING_WORDS = ['score', 'rating', 'rank', 'ranked', 'health', 'grade'];

describe('PersonForm', () => {
  const html = renderToStaticMarkup(createElement(PersonForm));

  it('renders a labelled section, a name input, and a relationship-type input', () => {
    expect(html).toContain('aria-labelledby="person-form-heading"');
    expect(html).toContain('name="name"');
    expect(html).toContain('for="person-name"');
    expect(html).toContain('name="relationshipType"');
    expect(html).toContain('for="person-relationship"');
  });

  it('renders all closeness circles with their meanings and a non-color icon + label', () => {
    expect(PERSON_IMPORTANCE_OPTIONS).toHaveLength(3);
    for (const circle of PERSON_IMPORTANCE_OPTIONS) {
      // A radio option keyed to the canonical importance id.
      expect(html).toContain(`value="${circle.id}"`);
      // The visible text label carries the semantic.
      expect(html).toContain(circle.label);
      // The plain-language meaning is shown at the moment of selection.
      expect(html).toContain(circle.meaning);
      // A non-color glyph accompanies the label (aria-hidden).
      expect(html).toContain(circle.icon);
    }
    // The closeness radio group is a labelled fieldset.
    expect(html).toContain('<fieldset');
    expect(html).toContain('name="importance"');
  });

  it('offers an optional intention field and important-date rows', () => {
    expect(html).toContain('name="intention"');
    expect(html).toContain('name="importantDateLabel-0"');
    expect(html).toContain('name="importantDateValue-0"');
  });

  it('offers work/personal context radios (never joint)', () => {
    expect(html).toContain('name="context"');
    expect(html).toContain('value="personal"');
    expect(html).toContain('value="work"');
    expect(html).not.toContain('value="joint"');
  });

  it('offers an optional weekly communication rhythm with weekday checkboxes', () => {
    expect(html).toContain('name="rhythmEnabled"');
    expect(html).toContain('name="rhythmDaysOfWeek"');
    expect(html).toContain('type="checkbox"');
    for (const day of ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']) {
      expect(html).toContain(`value="${day}"`);
    }
  });

  it('uses no scoring or ranking language (FR-12 / P5)', () => {
    const lower = html.toLowerCase();
    for (const word of SCORING_WORDS) {
      expect(lower).not.toContain(word);
    }
  });
});

describe('PersonList', () => {
  const rows: PersonRow[] = [
    {
      id: 'p-1',
      name: 'Mom',
      relationshipType: 'Parent',
      importance: 'inner-circle',
      intention: 'Stay in regular touch',
      importantDates: [{ label: 'Birthday', date: '03-14' }],
      context: 'personal',
      rhythm: { protectionLevel: 'flexible-intention', frequency: 'weekly', daysOfWeek: ['sun'] },
      createdAt: 't1',
      updatedAt: 't1',
    },
    {
      id: 'p-2',
      name: 'Priya',
      relationshipType: 'Manager',
      importance: 'wider-circle',
      intention: null,
      importantDates: [],
      context: 'work',
      rhythm: null,
      createdAt: 't2',
      updatedAt: 't2',
    },
  ];

  it('renders captured people with closeness label, intention, dates, rhythm, and context', () => {
    const html = renderToStaticMarkup(createElement(PersonList, { people: rows }));
    expect(html).toContain('aria-labelledby="person-list-heading"');
    expect(html).toContain('Mom');
    expect(html).toContain('Parent');
    expect(html).toContain('Inner circle');
    expect(html).toContain('Stay in regular touch');
    expect(html).toContain('Birthday · Mar 14');
    expect(html).toContain('Communication rhythm: weekly (Sun)');
    expect(html).toContain('Personal');
    expect(html).toContain('Priya');
    expect(html).toContain('Manager');
    expect(html).toContain('Wider circle');
    expect(html).toContain('Work');
  });

  it('shows a calm empty state when no one is added', () => {
    const html = renderToStaticMarkup(createElement(PersonList, { people: [] }));
    expect(html).toContain('No one added yet.');
  });
});
