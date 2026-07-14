/**
 * Starter-policy-template presentation catalog (host layer, AD-1). The canonical
 * valid template-id SET lives in `@life-focus/ledger` (`POLICY_TEMPLATE_IDS`);
 * the plain-language title, explanation, and default policy text live here in
 * the host. Copy obeys EXPERIENCE.md calm voice — no guilt, cheerleading, or
 * gamification, and the forbidden-words list is respected. A declined template
 * is recorded once and never nagged.
 */
import { POLICY_TEMPLATE_IDS, type PolicyTemplateId } from '@life-focus/ledger';

/** The presentation content for one starter policy template. */
export interface PolicyTemplateContent {
  readonly id: PolicyTemplateId;
  readonly title: string;
  /** A plain-language explanation of what the template protects (calm voice). */
  readonly explanation: string;
  /** The suggested default policy text, shown in an editable field before accept. */
  readonly defaultContent: string;
}

/** Content lookup keyed by template id. */
export const POLICY_TEMPLATE_CONTENT: Record<PolicyTemplateId, PolicyTemplateContent> = {
  'non-negotiables': {
    id: 'non-negotiables',
    title: 'Non-negotiables',
    explanation: 'The lines your day will not cross.',
    defaultContent:
      'Work ends at the hard stop. The evening with family stays protected — nothing schedules over it without an explicit decision from me.',
  },
  'work-boundaries': {
    id: 'work-boundaries',
    title: 'Work boundaries',
    explanation: 'What stays inside work, and never shows up on personal surfaces.',
    defaultContent:
      'Work project titles and customer names stay inside work. They never appear on personal surfaces, and personal plans never carry work detail.',
  },
};

/**
 * The two MVP starter policy templates, keyed off the canonical
 * `POLICY_TEMPLATE_IDS` so the order here can never drift from the core set.
 */
export const POLICY_TEMPLATES: readonly PolicyTemplateContent[] = POLICY_TEMPLATE_IDS.map(
  (id) => POLICY_TEMPLATE_CONTENT[id],
);

/** The presentation content for a template id. */
export function policyTemplateContent(id: PolicyTemplateId): PolicyTemplateContent {
  return POLICY_TEMPLATE_CONTENT[id];
}
