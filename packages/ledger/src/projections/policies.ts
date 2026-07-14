/**
 * Starter-policy-template projection (Story 2.2, AD-4). Pure. Switches on
 * `event.eventType` ONLY, so a full rebuild-from-events yields identical state
 * to an incrementally-maintained projection. Per template, the latest of
 * accepted/declined wins. Derived over the `joint` event stream — there is no
 * projection table (AD-4).
 */
import type { DomainEvent } from '../events/types.js';

/**
 * The canonical MVP starter policy template ids (PRD FR-4). The valid id SET
 * lives here in core; presentation copy (titles, explanations, default text)
 * lives in the host (AD-1). Only the two MVP templates ship at this story.
 */
export const POLICY_TEMPLATE_IDS = ['non-negotiables', 'work-boundaries'] as const;

/** A canonical starter policy template id. */
export type PolicyTemplateId = (typeof POLICY_TEMPLATE_IDS)[number];

/** The recorded decision status for one starter policy template. */
export type PolicyTemplateStatus = 'pending' | 'accepted' | 'declined';

/** The derived state for one starter policy template. */
export interface PolicyTemplateState {
  readonly templateId: PolicyTemplateId;
  readonly status: PolicyTemplateStatus;
  /** The saved content when `accepted`; `null` otherwise. */
  readonly content: string | null;
}

/** True if `id` is a canonical starter policy template id. */
function isPolicyTemplateId(id: unknown): id is PolicyTemplateId {
  return typeof id === 'string' && (POLICY_TEMPLATE_IDS as readonly string[]).includes(id);
}

/**
 * Rebuild the per-template state from an ordered event list. Every template
 * starts `pending`; the latest accepted/declined event for a template wins (a
 * re-accept after a decline → `accepted`). An accepted template carries its
 * saved content. Events referencing an unknown template id, and unrelated event
 * types, are ignored. Deterministic and independent of `compensatesEventId`
 * (AD-4 undo purity).
 */
export function projectPolicyTemplates(
  events: readonly DomainEvent[],
): readonly PolicyTemplateState[] {
  const byId = new Map<PolicyTemplateId, PolicyTemplateState>(
    POLICY_TEMPLATE_IDS.map((id) => [id, { templateId: id, status: 'pending', content: null }]),
  );

  for (const event of events) {
    switch (event.eventType) {
      case 'PolicyTemplateAccepted': {
        const { templateId, content } = event.payload;
        if (!isPolicyTemplateId(templateId) || typeof content !== 'string') break;
        byId.set(templateId, { templateId, status: 'accepted', content });
        break;
      }
      case 'PolicyTemplateDeclined': {
        const { templateId } = event.payload;
        if (!isPolicyTemplateId(templateId)) break;
        byId.set(templateId, { templateId, status: 'declined', content: null });
        break;
      }
      default:
        // Ignore unrelated event types.
        break;
    }
  }

  return POLICY_TEMPLATE_IDS.map((id) => byId.get(id)!);
}
