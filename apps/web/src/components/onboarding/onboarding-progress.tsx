import type { CSSProperties } from 'react';
import type { OnboardingProgress } from '@life-focus/ledger';
import { ONBOARDING_STEPS } from '../../lib/onboarding/steps.js';

/**
 * Accessible onboarding progress indicator (Story 2.1).
 *
 * Status is conveyed by text + shape, never by color alone (accessibility
 * floor): a done step shows "✓ Done", a skipped step shows "– Skipped", the
 * current step is marked `aria-current="step"`, and a step still ahead shows
 * "○ Not yet". An `aria-label` on the list announces overall progress to
 * screen readers. This renders the sequence only — no step bodies (2.2–2.5).
 */

const listStyle: CSSProperties = {
  listStyle: 'none',
  margin: '16px 0 0',
  padding: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
};

const rowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'baseline',
  gap: 12,
  padding: '8px 12px',
  borderRadius: 8,
  border: '1px solid var(--light-outline-variant)',
  backgroundColor: 'var(--light-surface-container-low)',
};

const currentRowStyle: CSSProperties = {
  ...rowStyle,
  backgroundColor: 'var(--light-surface-container)',
  borderColor: 'var(--light-primary)',
};

const markerStyle: CSSProperties = {
  minWidth: 20,
  textAlign: 'center',
  color: 'var(--light-on-surface-variant)',
};

interface StepStatus {
  readonly shape: string;
  readonly word: string;
}

/** The text + shape for each state — status is never color alone. */
function statusFor(
  progress: OnboardingProgress,
  stepId: (typeof ONBOARDING_STEPS)[number]['id'],
  isCurrent: boolean,
): StepStatus {
  const recorded = progress.steps[stepId];
  if (recorded) {
    return recorded.mode === 'skipped'
      ? { shape: '–', word: 'Skipped' }
      : { shape: '✓', word: 'Done' };
  }
  if (isCurrent) return { shape: '◐', word: 'In progress' };
  return { shape: '○', word: 'Not yet' };
}

export function OnboardingProgressIndicator({
  progress,
  currentStepId,
}: {
  progress: OnboardingProgress;
  currentStepId?: string;
}) {
  const total = ONBOARDING_STEPS.length;
  const doneCount = ONBOARDING_STEPS.filter((s) => progress.steps[s.id]).length;
  // Announce position and recorded-count separately so neither is mistaken for
  // the other: on a step page "on step N of M, K recorded"; on the review
  // screen (no current step) just "K of M steps recorded". An unknown current
  // step id falls back to the count form rather than announcing "step 0".
  const idx = currentStepId ? ONBOARDING_STEPS.findIndex((s) => s.id === currentStepId) : -1;
  const ariaLabel =
    idx >= 0
      ? `Setup progress: on step ${idx + 1} of ${total}, ${doneCount} recorded so far`
      : `Setup progress: ${doneCount} of ${total} steps recorded`;

  return (
    <ol style={listStyle} aria-label={ariaLabel}>
      {ONBOARDING_STEPS.map((step) => {
        const isCurrent = step.id === currentStepId;
        const status = statusFor(progress, step.id, isCurrent);
        return (
          <li
            key={step.id}
            aria-current={isCurrent ? 'step' : undefined}
            style={isCurrent ? currentRowStyle : rowStyle}
          >
            <span aria-hidden="true" className="body-md" style={markerStyle}>
              {status.shape}
            </span>
            <span className="body-md" style={{ color: 'var(--light-on-surface)' }}>
              {step.title}
            </span>
            <span
              className="label-caps"
              style={{ marginLeft: 'auto', color: 'var(--light-on-surface-variant)' }}
            >
              {status.word}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
