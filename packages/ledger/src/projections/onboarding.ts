/**
 * Onboarding-progress projection (AD-4). Pure. Switches on `event.eventType`
 * ONLY, so a full rebuild-from-events yields identical state to an incrementally
 * maintained projection. Onboarding progress is a single-user singleton derived
 * over the `joint` event stream — there is no projection table (AD-4).
 */
import type { DomainEvent } from '../events/types.js';

/**
 * The canonical, ordered onboarding step ids (mapping to stories 2.2–2.5).
 * The valid step-id SET lives here in core; presentation order/copy lives in
 * the host. This list is ordered so the host's "first incomplete" and "next"
 * helpers have a single source of truth for the sequence.
 */
export const ONBOARDING_STEP_IDS = [
  'boundaries',
  'commitments',
  'people',
  'goals',
] as const;

/** A canonical onboarding step id. */
export type OnboardingStepId = (typeof ONBOARDING_STEP_IDS)[number];

/** How a step was advanced: the user entered it or skipped it. */
export type OnboardingStepMode = 'entered' | 'skipped';

/** The recorded outcome of one onboarding step. */
export interface OnboardingStepState {
  readonly mode: OnboardingStepMode;
  readonly at: string;
}

/** Derived onboarding progress — the whole flow's state, from events alone. */
export interface OnboardingProgress {
  readonly started: boolean;
  readonly startedAt: string | null;
  readonly steps: Readonly<Partial<Record<OnboardingStepId, OnboardingStepState>>>;
  readonly completed: boolean;
  readonly completedAt: string | null;
}

/** True if `id` is a canonical onboarding step id. */
function isOnboardingStepId(id: unknown): id is OnboardingStepId {
  return (
    typeof id === 'string' &&
    (ONBOARDING_STEP_IDS as readonly string[]).includes(id)
  );
}

const EMPTY_PROGRESS: OnboardingProgress = {
  started: false,
  startedAt: null,
  steps: {},
  completed: false,
  completedAt: null,
};

/**
 * Reduce one event into onboarding progress.
 * `OnboardingStarted` is idempotent (first wins — re-entry never restarts the
 * clock); a repeated `OnboardingStepCompleted` for a step is latest-wins.
 * Events that don't concern onboarding leave `current` untouched (default).
 */
export function reduceOnboarding(
  current: OnboardingProgress,
  event: DomainEvent,
): OnboardingProgress {
  switch (event.eventType) {
    case 'OnboardingStarted': {
      if (current.started) return current;
      // Narrow rather than String()-coerce: a missing field must not persist the
      // literal "undefined" as a timestamp (story 2.6 reads this as real time).
      const { startedAt } = event.payload;
      if (typeof startedAt !== 'string') return current;
      return { ...current, started: true, startedAt };
    }
    case 'OnboardingStepCompleted': {
      const { stepId, mode, at } = event.payload;
      // A skip vs. an entry is an explicit user choice; only record a well-formed
      // event, never coerce an unknown mode into 'entered'.
      if (!isOnboardingStepId(stepId)) return current;
      if (mode !== 'entered' && mode !== 'skipped') return current;
      if (typeof at !== 'string') return current;
      return {
        ...current,
        steps: { ...current.steps, [stepId]: { mode, at } },
      };
    }
    case 'OnboardingCompleted': {
      const { completedAt } = event.payload;
      if (typeof completedAt !== 'string') return current;
      return { ...current, completed: true, completedAt };
    }
    default:
      return current;
  }
}

/**
 * Rebuild onboarding progress from an ordered event list. Deterministic and
 * independent of `compensatesEventId` (AD-4 undo purity).
 */
export function projectOnboarding(
  events: readonly DomainEvent[],
): OnboardingProgress {
  let progress = EMPTY_PROGRESS;
  for (const event of events) {
    progress = reduceOnboarding(progress, event);
  }
  return progress;
}

// ── Sitting-duration instrument (Story 2.6, AC-2) ────────────────────────────
// The ≤45-minute verdict is a reusable derivation over the persisted
// `OnboardingStarted`/`OnboardingCompleted` pair (AD-4), so the instrumented
// timestamps are genuinely *measured*, not merely present. Pure: it reads only
// the projected progress singleton and never touches the wall clock.

/** The Epic-2 AC-2 target: a full life model set up in ≤45 minutes (inclusive). */
export const ONBOARDING_SITTING_LIMIT_MINUTES = 45;

/**
 * The measured onboarding sitting in fractional minutes, or `null` when it is
 * unmeasurable. Returns `null` unless the flow both started and completed and
 * both timestamps parse to real times with completion no earlier than the
 * start; otherwise `(completedMs - startedMs) / 60000`. Never throws — an
 * inverted or unparseable pair is treated as unmeasurable (`null`), not an error.
 */
export function onboardingSittingMinutes(progress: OnboardingProgress): number | null {
  if (!progress.started || !progress.completed) return null;
  if (progress.startedAt === null || progress.completedAt === null) return null;
  const startedMs = Date.parse(progress.startedAt);
  const completedMs = Date.parse(progress.completedAt);
  if (Number.isNaN(startedMs) || Number.isNaN(completedMs)) return null;
  if (completedMs < startedMs) return null;
  return (completedMs - startedMs) / 60000;
}

/**
 * Whether the onboarding sitting landed within the ≤45-minute limit (AC-2). The
 * boundary is inclusive (exactly 45 minutes passes). An unmeasurable sitting
 * (`null` minutes — not started/completed, inverted, or unparseable) is `false`.
 */
export function isOnboardingWithinSittingLimit(progress: OnboardingProgress): boolean {
  const minutes = onboardingSittingMinutes(progress);
  return minutes !== null && minutes <= ONBOARDING_SITTING_LIMIT_MINUTES;
}
