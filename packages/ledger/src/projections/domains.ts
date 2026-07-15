/**
 * Life-domains projection (Story 2.2, AD-4). Pure. Switches on `event.eventType`
 * ONLY, so a full rebuild-from-events yields identical state to an incrementally
 * maintained projection. The list is seeded from the canonical 11 defaults, then
 * folds rename/enable/add events latest-wins. Derived over the `joint` event
 * stream — there is no projection table (AD-4).
 */
import type { DomainEvent } from '../events/types.js';

/** A canonical default life domain: a stable kebab id + default display name. */
export interface DefaultDomain {
  readonly id: string;
  readonly name: string;
}

/**
 * The canonical 11 default life domains (PRD FR-1). Stable kebab ids so a
 * rename/enable event can never fail to bind to its row. Default display names
 * live here in core; presentation copy lives in the host (AD-1).
 */
export const DEFAULT_DOMAINS: readonly DefaultDomain[] = [
  { id: 'work', name: 'Work' },
  { id: 'spouse-partner', name: 'Spouse/partner' },
  { id: 'children-family', name: 'Children/family' },
  { id: 'friends-social', name: 'Friends/social' },
  { id: 'health-fitness', name: 'Health/fitness' },
  { id: 'household', name: 'Household' },
  { id: 'finances', name: 'Finances' },
  { id: 'personal-growth', name: 'Personal growth' },
  { id: 'recreation', name: 'Recreation' },
  { id: 'community', name: 'Community' },
  { id: 'rest-recovery', name: 'Rest/recovery' },
] as const;

/** A projected life-domain row: effective name, enabled state, custom flag. */
export interface DomainRow {
  readonly id: string;
  readonly name: string;
  readonly enabled: boolean;
  /** True for a user-added domain; false for one of the 11 defaults. */
  readonly custom: boolean;
}

/**
 * Rebuild the life-domain list from an ordered event list. Seeds the 11
 * canonical defaults (enabled, non-custom), then folds:
 *  - `DomainAdded`      → append a new enabled custom domain (ignore duplicate id)
 *  - `DomainRenamed`    → update that domain's effective name (latest-wins)
 *  - `DomainSetEnabled` → update that domain's enabled state (latest-wins)
 * Unknown event types and events referencing an unknown domain id are ignored.
 * Deterministic and independent of `compensatesEventId` (AD-4 undo purity).
 */
export function projectDomains(events: readonly DomainEvent[]): readonly DomainRow[] {
  // Preserve insertion order (defaults first, then customs in append order).
  const order: string[] = DEFAULT_DOMAINS.map((d) => d.id);
  const byId = new Map<string, DomainRow>(
    DEFAULT_DOMAINS.map((d) => [d.id, { id: d.id, name: d.name, enabled: true, custom: false }]),
  );

  for (const event of events) {
    switch (event.eventType) {
      case 'DomainAdded': {
        const { domainId, name } = event.payload;
        if (typeof domainId !== 'string' || typeof name !== 'string') break;
        // A repeated add for an existing id must not duplicate the row.
        if (byId.has(domainId)) break;
        order.push(domainId);
        byId.set(domainId, { id: domainId, name, enabled: true, custom: true });
        break;
      }
      case 'DomainRenamed': {
        const { domainId, name } = event.payload;
        if (typeof domainId !== 'string' || typeof name !== 'string') break;
        const row = byId.get(domainId);
        if (row) byId.set(domainId, { ...row, name });
        break;
      }
      case 'DomainSetEnabled': {
        const { domainId, enabled } = event.payload;
        if (typeof domainId !== 'string' || typeof enabled !== 'boolean') break;
        const row = byId.get(domainId);
        if (row) byId.set(domainId, { ...row, enabled });
        break;
      }
      default:
        // Ignore unrelated event types.
        break;
    }
  }

  return order.map((id) => byId.get(id)!);
}
