import type { CSSProperties } from 'react';
import { redirect } from 'next/navigation';
import { readOnboardingProgress } from '../../../../lib/onboarding/progress.js';
import { OnboardingProgressIndicator } from '../../../../components/onboarding/onboarding-progress.js';
import { finishOnboarding } from '../actions.js';

// Reads live onboarding progress from the event log per request. Never cached.
export const dynamic = 'force-dynamic';

const panelStyle: CSSProperties = {
  marginTop: 24,
  maxWidth: 640,
  padding: '24px 28px',
  backgroundColor: 'var(--light-surface-container-low)',
  border: '1px solid var(--light-outline-variant)',
  borderRadius: 12,
};

const finishButtonStyle: CSSProperties = {
  marginTop: 20,
  padding: '10px 18px',
  borderRadius: 8,
  border: 'none',
  backgroundColor: 'var(--light-primary)',
  color: 'var(--light-on-primary)',
  cursor: 'pointer',
};

/**
 * Onboarding review + explicit Finish (Story 2.1). If the user reaches here
 * before starting or after already finishing, send them back to the entry,
 * which shows the right state. Finish appends `OnboardingCompleted` and lands
 * on `/today`.
 */
export default async function OnboardingCompletePage() {
  const progress = await readOnboardingProgress();

  if (!progress.started || progress.completed) {
    redirect('/onboarding');
  }

  return (
    <section aria-labelledby="onboarding-review-heading">
      <h1 id="onboarding-review-heading" className="display-lg" style={{ margin: 0 }}>
        Review your setup
      </h1>
      <p className="body-lg" style={{ color: 'var(--light-on-surface-variant)' }}>
        Here is where each part stands. Nothing is locked — you can return to any part later. When
        this looks right, finish setup.
      </p>

      <section aria-labelledby="onboarding-review-progress-heading" style={{ marginTop: 8 }}>
        <h2
          id="onboarding-review-progress-heading"
          className="label-caps"
          style={{ margin: 0, color: 'var(--light-on-surface-variant)' }}
        >
          What you covered
        </h2>
        <OnboardingProgressIndicator progress={progress} />
      </section>

      <div style={panelStyle}>
        <p className="body-md" style={{ margin: 0, color: 'var(--light-on-surface)' }}>
          Finishing records that you have been through setup, so the plan can begin using your life
          model. You can revisit any part whenever something changes.
        </p>
        <form action={finishOnboarding}>
          <button type="submit" className="label-md" style={finishButtonStyle}>
            Finish setup
          </button>
        </form>
      </div>
    </section>
  );
}
