/**
 * Important-people projection reducer (Story 2.4, AD-4). Pure. Switches on
 * `event.eventType` ONLY — it never reads `compensatesEventId`, so a full
 * rebuild-from-events yields identical state to an incrementally-maintained
 * projection.
 *
 * FR-12 / P5: no relationship score/rating/rank/health field is ever produced;
 * `importance` is a user-asserted categorical label carried through verbatim, and
 * `importantDates` are user-asserted only. A present rhythm is exposed as a
 * `flexible-intention` (the shared 2.3 protection-level vocabulary) linked by id.
 */
import type { PersonRow, DomainEvent } from '../events/types.js';
import {
  PERSON_IMPORTANCE,
  importantDateSchema,
  rhythmCadenceSchema,
  type PersonImportance,
  type PersonContext,
  type ImportantDate,
} from '../events/catalog.js';

/** Narrow a raw payload value to a canonical closeness label, or `null`. */
function toImportance(value: unknown): PersonImportance | null {
  return (PERSON_IMPORTANCE as readonly string[]).includes(value as string)
    ? (value as PersonImportance)
    : null;
}

/** Narrow a raw payload value to a person context (work|personal), or `null`. */
function toContext(value: unknown): PersonContext | null {
  return value === 'work' || value === 'personal' ? (value as PersonContext) : null;
}

/** Narrow a non-empty trimmed string, or `null`. */
function toName(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

/** Narrow a raw payload value to the user-asserted important-date list. */
function toImportantDates(value: unknown): readonly ImportantDate[] {
  if (!Array.isArray(value)) return [];
  const out: ImportantDate[] = [];
  for (const entry of value) {
    const parsed = importantDateSchema.safeParse(entry);
    if (parsed.success) out.push(parsed.data);
  }
  return out;
}

/** Derive a present rhythm as a flexible-intention, or `null` when absent/invalid. */
function toRhythm(value: unknown): PersonRow['rhythm'] {
  if (value == null) return null;
  const parsed = rhythmCadenceSchema.safeParse(value);
  if (!parsed.success) return null;
  return {
    protectionLevel: 'flexible-intention',
    frequency: 'weekly',
    daysOfWeek: parsed.data.daysOfWeek,
  };
}

/**
 * Reduce one event into the person row it concerns.
 * `(current | null, event) => next | null`. Returning `null` removes the row.
 * Events that don't concern this projection leave `current` untouched.
 */
export function reducePerson(
  current: PersonRow | null,
  event: DomainEvent,
): PersonRow | null {
  switch (event.eventType) {
    case 'PersonAdded': {
      const p = event.payload;
      const name = toName(p.name);
      const importance = toImportance(p.importance);
      const context = toContext(p.context);
      const relationshipType = toName(p.relationshipType);
      // A catalog-valid PersonAdded always carries a name, relationship type,
      // importance, and a work|personal context; a malformed event lacking any
      // of them is ignored (never yields a malformed or untagged row).
      if (name === null || importance === null || context === null || relationshipType === null) {
        return current;
      }
      const intention =
        typeof p.intention === 'string' && p.intention.trim().length > 0 ? p.intention : null;
      return {
        id: String(p.personId),
        name,
        relationshipType,
        importance,
        intention,
        importantDates: toImportantDates(p.importantDates),
        context,
        rhythm: toRhythm(p.rhythm),
        createdAt: String(p.createdAt),
        updatedAt: String(p.updatedAt),
      };
    }
    case 'PersonAddUndone':
      // Compensating forward event: the person is reduced away.
      return null;
    default:
      return current;
  }
}

/** Which person id an event concerns, or null if it concerns none. */
function personIdOf(event: DomainEvent): string | null {
  switch (event.eventType) {
    case 'PersonAdded':
    case 'PersonAddUndone':
      return String(event.payload.personId);
    default:
      return null;
  }
}

/**
 * Rebuild the full people projection from an ordered event list. People span
 * work + personal, so there is no context filter here. Deterministic and
 * independent of `compensatesEventId` (AD-4 undo purity).
 */
export function projectPeople(events: readonly DomainEvent[]): readonly PersonRow[] {
  const byId = new Map<string, PersonRow>();
  for (const event of events) {
    const id = personIdOf(event);
    if (id === null) continue;
    const next = reducePerson(byId.get(id) ?? null, event);
    if (next === null) {
      byId.delete(id);
    } else {
      byId.set(id, next);
    }
  }
  return [...byId.values()];
}
