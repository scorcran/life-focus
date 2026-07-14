import type { CSSProperties } from 'react';
import { redirect } from 'next/navigation';
import { readOnboardingProgress } from '../../../../lib/onboarding/progress.js';
import { isValidStep, stepContent } from '../../../../lib/onboarding/steps.js';
import { OnboardingProgressIndicator } from '../../../../components/onboarding/onboarding-progress.js';
import { readBoundariesStepData } from '../../../../lib/onboarding/boundaries.js';
import { BoundariesForm } from '../../../../components/onboarding/boundaries/boundaries-form.js';
import { DomainList } from '../../../../components/onboarding/boundaries/domain-list.js';
import { PolicyTemplates } from '../../../../components/onboarding/boundaries/policy-templates.js';
import { advanceStep } from '../actions.js';

// Reads live onboarding progress from the event log per request. Never cached.
export const dynamic = 'force-dynamic';

const rationaleStyle: CSSProperties = {
  marginTop: 24,
  maxWidth: 640,
  padding: '20px 24px',
  backgroundColor: 'var(--light-surface-container-low)',
  border: '1px solid var(--light-outline-variant)',
  borderRadius: 12,
};

const actionsStyle: CSSProperties = {
  display: 'flex',
  gap: 12,
  marginTop: 24,
};

const continueButtonStyle: CSSProperties = {
  padding: '10px 18px',
  borderRadius: 8,
  border: 'none',
  backgroundColor: 'var(--light-primary)',
  color: 'var(--light-on-primary)',
  cursor: 'pointer',
};

const skipButtonStyle: CSSProperties = {
  padding: '10px 18px',
  borderRadius: 8,
  border: '1px solid var(--light-outline)',
  backgroundColor: 'transparent',
  color: 'var(--light-on-surface-variant)',
  cursor: 'pointer',
};

/**
 * Onboarding step shell (Story 2.1). Renders the progress indicator, the step
 * title, its "What this protects" rationale, and Continue / Skip — no step
 * body (2.2–2.5 fill those). An unknown step id redirects to `/onboarding`,
 * which resumes at the right place (never a 500).
 */
export default async function OnboardingStepPage({
  params,
}: {
  params: Promise<{ step: string }>;
}) {
  const { step } = await params;
  if (!isValidStep(step)) {
    redirect('/onboarding');
  }

  const progress = await readOnboardingProgress();
  // A step is only a mid-flow surface: before starting, the entry welcome owns
  // the screen; after finishing, the done summary does. Sending stray visits
  // back to `/onboarding` prevents pre-start / post-completion step mutation.
  if (!progress.started || progress.completed) {
    redirect('/onboarding');
  }
  const content = stepContent(step);

  // Only the boundaries step has a filled body at this story (2.2); the other
  // steps keep the generic rationale + Continue/Skip placeholder (2.3–2.5).
  const boundariesData = step === 'boundaries' ? await readBoundariesStepData() : null;

  // Bind the step + mode so each form posts one append + redirect.
  const onContinue = advanceStep.bind(null, step, 'entered');
  const onSkip = advanceStep.bind(null, step, 'skipped');

  return (
    <section aria-labelledby="onboarding-step-heading">
      <p className="label-caps" style={{ margin: 0, color: 'var(--light-on-surface-variant)' }}>
        Set up your life model
      </p>
      <h1 id="onboarding-step-heading" className="display-lg" style={{ margin: '4px 0 0' }}>
        {content.title}
      </h1>

      {/* Announce progress; status conveyed by text/shape, not color alone. */}
      <section aria-labelledby="onboarding-progress-heading" style={{ marginTop: 16 }}>
        <h2
          id="onboarding-progress-heading"
          className="label-caps"
          style={{ margin: 0, color: 'var(--light-on-surface-variant)' }}
        >
          Progress
        </h2>
        <OnboardingProgressIndicator progress={progress} currentStepId={content.id} />
      </section>

      <section aria-labelledby="onboarding-rationale-heading" style={rationaleStyle}>
        <h2
          id="onboarding-rationale-heading"
          className="headline-md"
          style={{ margin: 0, color: 'var(--light-on-surface)' }}
        >
          What this protects
        </h2>
        <p className="body-md" style={{ margin: '12px 0 0', color: 'var(--light-on-surface-variant)' }}>
          {content.whatThisProtects}
        </p>
      </section>

      {boundariesData && (
        // Plain grouping, not a named landmark: each child section carries its
        // own heading, so an extra labelled region here would only clutter the
        // screen-reader landmark tree.
        <div>
          <BoundariesForm boundaries={boundariesData.boundaries} />
          <DomainList domains={boundariesData.domains} />
          <PolicyTemplates policies={boundariesData.policies} />
        </div>
      )}

      <div style={actionsStyle}>
        <form action={onContinue}>
          <button type="submit" className="label-md" style={continueButtonStyle}>
            Continue
          </button>
        </form>
        <form action={onSkip}>
          <button type="submit" className="label-md" style={skipButtonStyle}>
            Skip for now
          </button>
        </form>
      </div>
    </section>
  );
}
