import type { CSSProperties } from 'react';
import {
  GOAL_PROTECTION,
  SESSIONS_PER_WEEK_OPTIONS,
  MINUTES_PER_SESSION_OPTIONS,
  DEFAULT_SESSIONS_PER_WEEK,
  DEFAULT_MINUTES_PER_SESSION,
} from '../../../lib/onboarding/goals-content.js';
import { addGoal } from '../../../app/(app)/onboarding/goals-actions.js';

/**
 * Goal capture (Story 2.5). A native `<form>` posting one `addGoal` append: a
 * title, one next-action input, allocation selects (sessions-per-week +
 * minutes-per-session, with sensible defaults), and a work/personal context radio
 * group (personal default). The allocation is a protected priority BY
 * CONSTRUCTION — there is NO protection-level chooser; the fixed level is shown as
 * calm framing (a non-color glyph + text label reused from the 2.3 catalog).
 * Radio groups are `fieldset`/`legend` for screen readers; every control is
 * keyboard-operable with the global `:focus-visible` ring. When three goals
 * already exist, `atLimit` renders a calm at-limit state instead of the inputs —
 * the number is never framed as a score. Light tokens only.
 */

const sectionStyle: CSSProperties = {
  marginTop: 24,
  maxWidth: 640,
  padding: '20px 24px',
  backgroundColor: 'var(--light-surface-container-low)',
  border: '1px solid var(--light-outline-variant)',
  borderRadius: 12,
};

const fieldsetStyle: CSSProperties = {
  marginTop: 20,
  padding: '12px 16px 16px',
  border: '1px solid var(--light-outline-variant)',
  borderRadius: 8,
  backgroundColor: 'var(--light-surface-container-lowest)',
};

const legendStyle: CSSProperties = {
  padding: '0 6px',
  color: 'var(--light-on-surface)',
};

const inputStyle: CSSProperties = {
  padding: '10px 12px',
  borderRadius: 6,
  border: '1px solid var(--light-outline)',
  background: 'var(--light-surface)',
  color: 'var(--light-on-surface)',
  fontFamily: 'var(--font-body)',
  fontSize: 16,
  minWidth: 260,
};

const selectStyle: CSSProperties = {
  padding: '10px 12px',
  borderRadius: 6,
  border: '1px solid var(--light-outline)',
  background: 'var(--light-surface)',
  color: 'var(--light-on-surface)',
  fontFamily: 'var(--font-body)',
  fontSize: 16,
  minWidth: 140,
};

const chipRowStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 12,
  marginTop: 8,
};

const chipItemStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '8px 12px',
  borderRadius: 8,
  border: '1px solid var(--light-outline-variant)',
  backgroundColor: 'var(--light-surface)',
  color: 'var(--light-on-surface)',
};

const allocRowStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 16,
  marginTop: 8,
};

const markerStyle: CSSProperties = {
  minWidth: 20,
  textAlign: 'center',
  color: 'var(--light-on-surface-variant)',
};

const protectionRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 10,
  marginTop: 12,
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid var(--light-outline-variant)',
  backgroundColor: 'var(--light-surface)',
};

const addButtonStyle: CSSProperties = {
  marginTop: 20,
  padding: '10px 18px',
  borderRadius: 8,
  border: 'none',
  backgroundColor: 'var(--light-primary)',
  color: 'var(--light-on-primary)',
  cursor: 'pointer',
};

export function GoalForm({ atLimit }: { atLimit: boolean }) {
  return (
    <section aria-labelledby="goal-form-heading" style={sectionStyle}>
      <h2
        id="goal-form-heading"
        className="headline-md"
        style={{ margin: 0, color: 'var(--light-on-surface)' }}
      >
        Name a goal and protect time for it
      </h2>

      {atLimit ? (
        <p className="body-md" style={{ margin: '12px 0 0', color: 'var(--light-on-surface-variant)' }}>
          You&rsquo;ve set your three goals. That&rsquo;s plenty to hold with care for now.
        </p>
      ) : (
        <>
          <p
            className="body-md"
            style={{ margin: '8px 0 0', color: 'var(--light-on-surface-variant)' }}
          >
            Name up to three goals, each with one next action and a weekly slice of protected
            time. This is simply what you have told us matters — nothing here is measured or
            compared.
          </p>

          <form action={addGoal}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 20 }}>
              <label htmlFor="goal-title" className="label-md">
                What is the goal?
              </label>
              <input
                id="goal-title"
                name="title"
                type="text"
                required
                placeholder="e.g. Learn to paint"
                style={inputStyle}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 16 }}>
              <label htmlFor="goal-next-action" className="label-md">
                The one next action
              </label>
              <input
                id="goal-next-action"
                name="nextAction"
                type="text"
                required
                placeholder="e.g. Buy a starter watercolor set"
                style={inputStyle}
              />
            </div>

            {/* Allocation — weekly by construction; whole sessions × whole minutes. */}
            <fieldset style={fieldsetStyle}>
              <legend className="label-md" style={legendStyle}>
                Protected time each week
              </legend>
              <div style={allocRowStyle}>
                <label
                  htmlFor="goal-sessions"
                  className="label-md"
                  style={{ display: 'flex', flexDirection: 'column', gap: 4 }}
                >
                  <span>Sessions per week</span>
                  <select
                    id="goal-sessions"
                    name="sessionsPerWeek"
                    defaultValue={DEFAULT_SESSIONS_PER_WEEK}
                    style={selectStyle}
                  >
                    {SESSIONS_PER_WEEK_OPTIONS.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </label>
                <label
                  htmlFor="goal-minutes"
                  className="label-md"
                  style={{ display: 'flex', flexDirection: 'column', gap: 4 }}
                >
                  <span>Minutes per session</span>
                  <select
                    id="goal-minutes"
                    name="minutesPerSession"
                    defaultValue={DEFAULT_MINUTES_PER_SESSION}
                    style={selectStyle}
                  >
                    {MINUTES_PER_SESSION_OPTIONS.map((m) => (
                      <option key={m} value={m}>
                        {m} min
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {/* Fixed protected-priority framing (no chooser) — text + shape. */}
              <div style={protectionRowStyle}>
                <span aria-hidden="true" style={markerStyle}>
                  {GOAL_PROTECTION.icon}
                </span>
                <span>
                  <span
                    className="label-md"
                    style={{ display: 'block', color: 'var(--light-on-surface)' }}
                  >
                    {GOAL_PROTECTION.label}
                  </span>
                  <span className="body-md" style={{ color: 'var(--light-on-surface-variant)' }}>
                    {GOAL_PROTECTION.meaning}
                  </span>
                </span>
              </div>
            </fieldset>

            {/* Context — work or personal (never joint on a goal, AD-5). */}
            <fieldset style={fieldsetStyle}>
              <legend className="label-md" style={legendStyle}>
                Which part of life?
              </legend>
              <div style={chipRowStyle}>
                <label htmlFor="goal-context-personal" style={chipItemStyle}>
                  <input
                    type="radio"
                    id="goal-context-personal"
                    name="context"
                    value="personal"
                    required
                    defaultChecked
                  />
                  <span>Personal</span>
                </label>
                <label htmlFor="goal-context-work" style={chipItemStyle}>
                  <input type="radio" id="goal-context-work" name="context" value="work" />
                  <span>Work</span>
                </label>
              </div>
            </fieldset>

            <button type="submit" className="label-md" style={addButtonStyle}>
              Add goal
            </button>
          </form>
        </>
      )}
    </section>
  );
}
