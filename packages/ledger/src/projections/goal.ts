/**
 * Goal projection reducer (Story 2.5, AD-4). Pure. Switches on `event.eventType`
 * ONLY — it never reads `compensatesEventId`, so a full rebuild-from-events
 * yields identical state to an incrementally-maintained projection.
 *
 * FR-40 / P5: no goal score/rating/rank/health field is ever produced;
 * `displacementCount` is a plain factual count folded from
 * `GoalAllocationDisplaced` events. The allocation is exposed as a
 * `protected-priority` intention (the shared 2.3 protection-level vocabulary)
 * linked by id — the user never chooses the level, it is fixed by construction.
 */
import type { GoalRow, DomainEvent } from '../events/types.js';
import { goalAllocationSchema, type GoalContext } from '../events/catalog.js';

/** Narrow a raw payload value to a goal context (work|personal), or `null`. */
function toContext(value: unknown): GoalContext | null {
  return value === 'work' || value === 'personal' ? (value as GoalContext) : null;
}

/** Narrow a non-empty trimmed string, or `null`. */
function toText(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

/** Derive a valid allocation as a protected-priority intention, or `null`. */
function toAllocation(value: unknown): GoalRow['allocation'] | null {
  const parsed = goalAllocationSchema.safeParse(value);
  if (!parsed.success) return null;
  return {
    protectionLevel: 'protected-priority',
    frequency: 'weekly',
    sessionsPerWeek: parsed.data.sessionsPerWeek,
    minutesPerSession: parsed.data.minutesPerSession,
  };
}

/**
 * Reduce one event into the goal row it concerns.
 * `(current | null, event) => next | null`. Returning `null` removes the row.
 * Events that don't concern this projection leave `current` untouched.
 */
export function reduceGoal(current: GoalRow | null, event: DomainEvent): GoalRow | null {
  switch (event.eventType) {
    case 'GoalAdded': {
      const p = event.payload;
      const title = toText(p.title);
      const nextAction = toText(p.nextAction);
      const context = toContext(p.context);
      const allocation = toAllocation(p.allocation);
      // A catalog-valid GoalAdded always carries a title, next action, a
      // work|personal context, and a valid allocation; a malformed event lacking
      // any of them is ignored (never yields a malformed or untagged row).
      if (title === null || nextAction === null || context === null || allocation === null) {
        return current;
      }
      return {
        id: String(p.goalId),
        title,
        nextAction,
        allocation,
        displacementCount: 0,
        context,
        createdAt: String(p.createdAt),
        updatedAt: String(p.updatedAt),
      };
    }
    case 'GoalAllocationDisplaced':
      // Increment only an existing goal's count; a displacement with no goal
      // (before add, or after undo) is ignored — never creates/resurrects a row.
      if (current === null) return current;
      return { ...current, displacementCount: current.displacementCount + 1 };
    case 'GoalAddUndone':
      // Compensating forward event: the goal is reduced away.
      return null;
    default:
      return current;
  }
}

/** Which goal id an event concerns, or null if it concerns none. */
function goalIdOf(event: DomainEvent): string | null {
  switch (event.eventType) {
    case 'GoalAdded':
    case 'GoalAddUndone':
    case 'GoalAllocationDisplaced':
      return String(event.payload.goalId);
    default:
      return null;
  }
}

/**
 * Rebuild the full goals projection from an ordered event list. Goals span
 * work + personal, so there is no context filter here. Deterministic and
 * independent of `compensatesEventId` (AD-4 undo purity).
 */
export function projectGoals(events: readonly DomainEvent[]): readonly GoalRow[] {
  const byId = new Map<string, GoalRow>();
  for (const event of events) {
    const id = goalIdOf(event);
    if (id === null) continue;
    const next = reduceGoal(byId.get(id) ?? null, event);
    if (next === null) {
      byId.delete(id);
    } else {
      byId.set(id, next);
    }
  }
  return [...byId.values()];
}
