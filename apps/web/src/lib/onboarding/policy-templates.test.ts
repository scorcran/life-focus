import { describe, it, expect } from 'vitest';
import { POLICY_TEMPLATE_IDS } from '@life-focus/ledger';
import {
  POLICY_TEMPLATES,
  POLICY_TEMPLATE_CONTENT,
  policyTemplateContent,
} from './policy-templates.js';

/** Words EXPERIENCE.md forbids anywhere in system copy. */
const FORBIDDEN = [
  'productivity score',
  'relationship health',
  'utility score',
  'optimized life',
  'ai knows',
  'objective priority',
  'knowledge-graph score',
];

describe('policy-templates presentation catalog', () => {
  it('covers every canonical template id exactly once', () => {
    expect(POLICY_TEMPLATES.map((t) => t.id)).toEqual([...POLICY_TEMPLATE_IDS]);
    for (const id of POLICY_TEMPLATE_IDS) {
      expect(POLICY_TEMPLATE_CONTENT[id]).toBeDefined();
      expect(policyTemplateContent(id).id).toBe(id);
    }
  });

  it('every template has a title, explanation, and non-empty default content', () => {
    for (const t of POLICY_TEMPLATES) {
      expect(t.title.length).toBeGreaterThan(0);
      expect(t.explanation.length).toBeGreaterThan(0);
      expect(t.defaultContent.length).toBeGreaterThan(0);
    }
  });

  it('non-negotiables default text mentions the hard stop and protected family time', () => {
    const content = POLICY_TEMPLATE_CONTENT['non-negotiables'].defaultContent.toLowerCase();
    expect(content).toContain('hard stop');
    expect(content).toContain('family');
  });

  it('work-boundaries default text keeps work titles/customer names off personal surfaces (SEC-1)', () => {
    const content = POLICY_TEMPLATE_CONTENT['work-boundaries'].defaultContent.toLowerCase();
    expect(content).toContain('personal surfaces');
    expect(content).toContain('customer');
  });

  it('uses no forbidden (guilt/gamification) language', () => {
    for (const t of POLICY_TEMPLATES) {
      const blob = `${t.title} ${t.explanation} ${t.defaultContent}`.toLowerCase();
      for (const word of FORBIDDEN) {
        expect(blob).not.toContain(word);
      }
    }
  });
});
