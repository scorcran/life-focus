/**
 * Onboarding presentation catalog (host layer, AD-1). The canonical valid
 * step-id SET lives in `@life-focus/ledger` (`ONBOARDING_STEP_IDS`); the ORDER,
 * titles, and "What this protects" rationale copy live here in the host. Copy
 * obeys EXPERIENCE.md calm voice — no guilt, cheerleading, or gamification.
 *
 * This module owns the resume/next/validation logic that the server-driven
 * flow uses to walk the ordered sequence. It builds no fake input fields — the
 * step BODIES arrive with stories 2.2–2.5.
 */
import {
  ONBOARDING_STEP_IDS,
  type OnboardingStepId,
  type OnboardingProgress,
} from '@life-focus/ledger';

/** The presentation content for one onboarding step. */
export interface OnboardingStepContent {
  readonly id: OnboardingStepId;
  readonly title: string;
  /** Why this step matters — the "What this protects" rationale (calm voice). */
  readonly whatThisProtects: string;
}

/** Content lookup keyed by step id. */
export const ONBOARDING_STEP_CONTENT: Record<OnboardingStepId, OnboardingStepContent> = {
  boundaries: {
    id: 'boundaries',
    title: 'Your boundaries',
    whatThisProtects:
      'Setting where work ends and personal time begins lets the day protect the hours you have already spoken for, instead of quietly filling them.',
  },
  commitments: {
    id: 'commitments',
    title: 'Your commitments',
    whatThisProtects:
      'Naming what you have already promised keeps those obligations visible, so a commitment is never displaced without you noticing.',
  },
  people: {
    id: 'people',
    title: 'The people who matter',
    whatThisProtects:
      'Recording who you want to stay close to, and how often, keeps those relationships in view when the calendar is deciding what moves.',
  },
  goals: {
    id: 'goals',
    title: 'What you are working toward',
    whatThisProtects:
      'Stating the goals you care about lets the plan notice when one has gone without time, and name the best remaining opening for it.',
  },
};

/**
 * The ordered onboarding steps, keyed off the canonical `ONBOARDING_STEP_IDS`
 * so the order here can never drift from the core's valid set.
 */
export const ONBOARDING_STEPS: readonly OnboardingStepContent[] = ONBOARDING_STEP_IDS.map(
  (id) => ONBOARDING_STEP_CONTENT[id],
);

/** True if `id` is a canonical onboarding step id. */
export function isValidStep(id: string): id is OnboardingStepId {
  return (ONBOARDING_STEP_IDS as readonly string[]).includes(id);
}

/**
 * The first step with no recorded completion, or `null` if every step is done.
 * This is where entering `/onboarding` resumes (AC: resume mid-flow).
 */
export function firstIncompleteStep(progress: OnboardingProgress): OnboardingStepId | null {
  for (const id of ONBOARDING_STEP_IDS) {
    if (!progress.steps[id]) return id;
  }
  return null;
}

/** The step after `id` in the canonical order, or `null` if `id` is the last. */
export function nextStep(id: OnboardingStepId): OnboardingStepId | null {
  const index = ONBOARDING_STEP_IDS.indexOf(id);
  const next = ONBOARDING_STEP_IDS[index + 1];
  return next ?? null;
}

/** The presentation content for a step id. */
export function stepContent(id: OnboardingStepId): OnboardingStepContent {
  return ONBOARDING_STEP_CONTENT[id];
}
