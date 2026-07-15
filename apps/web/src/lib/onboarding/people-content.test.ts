import { describe, it, expect } from 'vitest';
import { PERSON_IMPORTANCE, WEEKDAYS } from '@life-focus/ledger';
import {
  PERSON_IMPORTANCE_CONTENT,
  PERSON_IMPORTANCE_OPTIONS,
  WEEKDAY_OPTIONS,
  personImportanceContent,
  rhythmSummary,
  formatImportantDate,
} from './people-content.js';

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

// Scoring/ranking vocabulary that must never appear on a people surface (P5).
const SCORING_WORDS = ['score', 'rating', 'rank', 'ranked', 'health', 'grade'];

describe('person-importance catalog', () => {
  it('has exactly one entry per canonical PERSON_IMPORTANCE id, in order', () => {
    expect(PERSON_IMPORTANCE_OPTIONS.map((o) => o.id)).toEqual([...PERSON_IMPORTANCE]);
    for (const id of PERSON_IMPORTANCE) {
      expect(PERSON_IMPORTANCE_CONTENT[id].id).toBe(id);
      expect(personImportanceContent(id).id).toBe(id);
    }
    expect(PERSON_IMPORTANCE_OPTIONS).toHaveLength(PERSON_IMPORTANCE.length);
  });

  it('gives every circle a non-empty label and a plain-language meaning', () => {
    for (const option of PERSON_IMPORTANCE_OPTIONS) {
      expect(option.label.trim().length).toBeGreaterThan(0);
      expect(option.meaning.trim().length).toBeGreaterThan(0);
    }
  });

  it('uses a distinct non-color glyph per circle', () => {
    const icons = PERSON_IMPORTANCE_OPTIONS.map((o) => o.icon);
    expect(new Set(icons).size).toBe(icons.length);
    expect(icons.every((i) => i.trim().length > 0)).toBe(true);
  });

  it('contains no EXPERIENCE.md forbidden words or scoring language (calm voice, P5)', () => {
    const corpus = PERSON_IMPORTANCE_OPTIONS.map((o) => `${o.label} ${o.meaning}`)
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

describe('weekday labels, rhythm summary, and important-date formatting', () => {
  it('has one label per canonical weekday, in order', () => {
    expect(WEEKDAY_OPTIONS.map((w) => w.id)).toEqual([...WEEKDAYS]);
    for (const option of WEEKDAY_OPTIONS) {
      expect(option.label.trim().length).toBeGreaterThan(0);
    }
  });

  it('summarizes a weekly rhythm, and the empty set as a flexible weekly window', () => {
    expect(rhythmSummary([])).toBe('Communication rhythm: weekly');
    expect(rhythmSummary(['sun'])).toBe('Communication rhythm: weekly (Sun)');
    expect(rhythmSummary(['fri', 'mon'])).toBe('Communication rhythm: weekly (Mon, Fri)');
  });

  it('formats user-asserted important dates in a calm, plain-language form', () => {
    expect(formatImportantDate('03-14')).toBe('Mar 14');
    expect(formatImportantDate('2026-06-01')).toBe('Jun 1');
    // Unrecognized input is returned verbatim (never inferred, never dropped).
    expect(formatImportantDate('sometime')).toBe('sometime');
  });
});
