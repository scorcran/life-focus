import { describe, it, expect } from 'vitest';
import { PROTECTION_LEVELS, WEEKDAYS } from '@life-focus/ledger';
import {
  PROTECTION_LEVEL_CONTENT,
  PROTECTION_LEVEL_OPTIONS,
  WEEKDAY_OPTIONS,
  protectionLevelContent,
  recurrenceSummary,
} from './protection-levels.js';

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

describe('protection-level catalog', () => {
  it('has exactly one entry per canonical PROTECTION_LEVELS id, in order', () => {
    expect(PROTECTION_LEVEL_OPTIONS.map((o) => o.id)).toEqual([...PROTECTION_LEVELS]);
    for (const id of PROTECTION_LEVELS) {
      expect(PROTECTION_LEVEL_CONTENT[id].id).toBe(id);
      expect(protectionLevelContent(id).id).toBe(id);
    }
    expect(PROTECTION_LEVEL_OPTIONS).toHaveLength(PROTECTION_LEVELS.length);
  });

  it('gives every level a non-empty label and a plain-language meaning', () => {
    for (const option of PROTECTION_LEVEL_OPTIONS) {
      expect(option.label.trim().length).toBeGreaterThan(0);
      expect(option.meaning.trim().length).toBeGreaterThan(0);
    }
  });

  it('uses a distinct non-color glyph per level', () => {
    const icons = PROTECTION_LEVEL_OPTIONS.map((o) => o.icon);
    expect(new Set(icons).size).toBe(icons.length);
    expect(icons.every((i) => i.trim().length > 0)).toBe(true);
  });

  it('names hard commitment as should-not-move except a genuine emergency', () => {
    expect(protectionLevelContent('hard-commitment').meaning).toContain('emergency');
  });

  it('contains no EXPERIENCE.md forbidden words (calm voice)', () => {
    const corpus = PROTECTION_LEVEL_OPTIONS.map((o) => `${o.label} ${o.meaning}`)
      .join(' ')
      .toLowerCase();
    for (const word of FORBIDDEN_WORDS) {
      expect(corpus).not.toContain(word);
    }
  });
});

describe('weekday labels and recurrence summary', () => {
  it('has one label per canonical weekday, in order', () => {
    expect(WEEKDAY_OPTIONS.map((w) => w.id)).toEqual([...WEEKDAYS]);
    for (const option of WEEKDAY_OPTIONS) {
      expect(option.label.trim().length).toBeGreaterThan(0);
    }
  });

  it('summarizes a weekly recurrence in calm, canonical order', () => {
    expect(recurrenceSummary(['thu'])).toBe('Repeats weekly: Thu');
    expect(recurrenceSummary(['fri', 'mon'])).toBe('Repeats weekly: Mon, Fri');
  });
});
