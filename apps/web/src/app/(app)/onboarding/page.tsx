import type { CSSProperties } from 'react';
import { redirect } from 'next/navigation';
import { readOnboardingProgress } from '../../../lib/onboarding/progress.js';
import { firstIncompleteStep } from '../../../lib/onboarding/steps.js';
import { beginOnboarding } from './actions.js';

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

const primaryButtonStyle: CSSProperties = {
  marginTop: 20,
  padding: '10px 18px',
  borderRadius: 8,
  border: 'none',
  backgroundColor: 'var(--light-primary)',
  color: 'var(--light-on-primary)',
  cursor: 'pointer',
};

const linkButtonStyle: CSSProperties = {
  ...primaryButtonStyle,
  display: 'inline-block',
  textDecoration: 'none',
};

/**
 * Onboarding entry (Story 2.1 container). Based on progress derived from the
 * event log:
 *  - not started → a calm first-run welcome with "Begin setup";
 *  - in progress → resume-redirect to the first incomplete step;
 *  - all steps done, not finished → forward to the review screen;
 *  - completed → a calm done summary (Finish already landed the user on /today).
 */
export default async function OnboardingPage() {
  const progress = await readOnboardingProgress();

  if (progress.started && !progress.completed) {
    const next = firstIncompleteStep(progress);
    redirect(next ? `/onboarding/${next}` : '/onboarding/complete');
  }

  if (progress.completed) {
    return (
      <section aria-labelledby="onboarding-done-heading">
        <h1 id="onboarding-done-heading" className="display-lg" style={{ margin: 0 }}>
          Setup complete
        </h1>
        <p className="body-lg" style={{ color: 'var(--light-on-surface-variant)' }}>
          You have walked through the whole life model. You can return to any part of it whenever
          something changes.
        </p>
        <div style={panelStyle}>
          <p className="body-md" style={{ margin: 0, color: 'var(--light-on-surface)' }}>
            Your boundaries, commitments, people, and goals are in place. The plan will use them to
            keep what matters in view.
          </p>
          <a href="/today" className="label-md" style={linkButtonStyle}>
            Go to Today
          </a>
        </div>
      </section>
    );
  }

  // Not started: the calm first-run welcome.
  return (
    <section aria-labelledby="onboarding-welcome-heading">
      <h1 id="onboarding-welcome-heading" className="display-lg" style={{ margin: 0 }}>
        Set up your life model
      </h1>
      <p className="body-lg" style={{ color: 'var(--light-on-surface-variant)' }}>
        A short, guided walk through four parts of how you want your time to work. You can skip any
        part and come back to it — nothing you set is locked, and leaving partway loses nothing.
      </p>
      <div style={panelStyle}>
        <p className="body-md" style={{ margin: 0, color: 'var(--light-on-surface)' }}>
          We will cover your boundaries, your commitments, the people who matter, and what you are
          working toward. Each part explains what it protects before you decide.
        </p>
        <form action={beginOnboarding}>
          <button type="submit" className="label-md" style={primaryButtonStyle}>
            Begin setup
          </button>
        </form>
      </div>
    </section>
  );
}
