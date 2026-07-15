/**
 * Goals presentation catalog (host layer, AD-1). The canonical allocation shape
 * lives in `@life-focus/ledger` (`goalAllocationSchema`); the plain-language
 * allocation + displacement copy, the form option lists, and the protected-
 * priority lock glyph/label live here in the host. Copy obeys EXPERIENCE.md calm
 * voice — no guilt, cheerleading, gamification, scoring/streak language, or
 * forbidden words.
 *
 * FR-40 / P5: a goal is never scored. `displacementCount` is a plain factual
 * count shown in neutral language, never a "health" or "score". The allocation is
 * a `protected-priority` intention by construction — the lock glyph + label are
 * reused verbatim from the shared 2.3 protection-level catalog, and the VISIBLE
 * text label carries the semantic, so status is NEVER conveyed by color alone.
 */
import { PROTECTION_LEVEL_CONTENT } from './protection-levels.js';

/**
 * The fixed protected-priority framing for a goal allocation, reused from the
 * shared 2.3 protection-level catalog (monochrome `aria-hidden` glyph + label).
 */
export const GOAL_PROTECTION = PROTECTION_LEVEL_CONTENT['protected-priority'];

/** The sessions-per-week choices offered by the form (whole numbers 1–7). */
export const SESSIONS_PER_WEEK_OPTIONS: readonly number[] = [1, 2, 3, 4, 5, 6, 7];

/** The minutes-per-session choices offered by the form (sensible calm defaults). */
export const MINUTES_PER_SESSION_OPTIONS: readonly number[] = [15, 30, 45, 60, 90, 120];

/** Sensible defaults surfaced by the form: 3 sessions × 45 minutes each week. */
export const DEFAULT_SESSIONS_PER_WEEK = 3;
export const DEFAULT_MINUTES_PER_SESSION = 45;

/**
 * A calm summary of a goal's protected weekly allocation, e.g.
 * "Protected time: 3 × 45 min each week".
 */
export function allocationSummary(sessionsPerWeek: number, minutesPerSession: number): string {
  return `Protected time: ${sessionsPerWeek} × ${minutesPerSession} min each week`;
}

/**
 * A neutral, non-guilt summary of how often a goal's protected time has moved.
 * Zero reads calmly; a positive count is stated factually and never blames.
 */
export function displacementSummary(count: number): string {
  if (count <= 0) return "Protected time hasn't moved yet.";
  const times = count === 1 ? 'time' : 'times';
  return `Protected time has been moved ${count} ${times}.`;
}
