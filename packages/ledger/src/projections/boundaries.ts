/**
 * Daily-boundaries projection (Story 2.2, AD-4). Pure. Switches on
 * `event.eventType` ONLY, so a full rebuild-from-events yields identical state
 * to an incrementally-maintained projection. Boundaries are a single-user
 * latest-wins singleton derived over the `joint` event stream — there is no
 * projection table (AD-4).
 */
import type { DomainEvent } from '../events/types.js';

/** The daily boundaries: workday shape, hard stop, and sleep window. */
export interface DailyBoundaries {
  /** "HH:MM" 24-hour clock string. */
  readonly workdayStart: string;
  /** "HH:MM" — the firm line the day will not cross. */
  readonly hardStop: string;
  /** "HH:MM" — start of the sleep window (may cross midnight vs. sleepEnd). */
  readonly sleepStart: string;
  /** "HH:MM" — end of the sleep window. */
  readonly sleepEnd: string;
  /** ISO-8601 timestamp of the last update. */
  readonly updatedAt: string;
}

/**
 * Reduce one event into the boundaries singleton. `BoundariesSet` is
 * latest-wins (a later set fully replaces the prior one). Events that don't
 * concern boundaries leave `current` untouched (default). Payload fields are
 * narrowed defensively — a malformed event never corrupts derived state.
 */
export function reduceBoundaries(
  current: DailyBoundaries | null,
  event: DomainEvent,
): DailyBoundaries | null {
  switch (event.eventType) {
    case 'BoundariesSet': {
      const { workdayStart, hardStop, sleepStart, sleepEnd, updatedAt } = event.payload;
      if (
        typeof workdayStart !== 'string' ||
        typeof hardStop !== 'string' ||
        typeof sleepStart !== 'string' ||
        typeof sleepEnd !== 'string' ||
        typeof updatedAt !== 'string'
      ) {
        return current;
      }
      return { workdayStart, hardStop, sleepStart, sleepEnd, updatedAt };
    }
    default:
      return current;
  }
}

/**
 * Rebuild the daily boundaries from an ordered event list. `null` until the
 * first `BoundariesSet`. Deterministic and independent of `compensatesEventId`
 * (AD-4 undo purity).
 */
export function projectBoundaries(
  events: readonly DomainEvent[],
): DailyBoundaries | null {
  let boundaries: DailyBoundaries | null = null;
  for (const event of events) {
    boundaries = reduceBoundaries(boundaries, event);
  }
  return boundaries;
}
