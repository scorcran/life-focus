import type { CSSProperties } from 'react';
import {
  PROTECTION_LEVEL_OPTIONS,
  WEEKDAY_OPTIONS,
} from '../../../lib/onboarding/protection-levels.js';
import { addCommitment } from '../../../app/(app)/onboarding/commitments-actions.js';

/**
 * Commitment capture (Story 2.3). A native `<form>` posting one `addCommitment`
 * append: a title, a required protection-level radio group (each option shows
 * its plain-language meaning + a non-color glyph/label), a work/personal context
 * radio group, and optional weekday checkboxes for weekly recurrence. Radio and
 * checkbox groups are `fieldset`/`legend` for screen readers; every control is
 * keyboard-operable with the global `:focus-visible` ring. Protection status is
 * conveyed by TEXT + SHAPE, never color alone. Light tokens only.
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

const optionRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 10,
  padding: '10px 12px',
  marginTop: 8,
  borderRadius: 8,
  border: '1px solid var(--light-outline-variant)',
  backgroundColor: 'var(--light-surface)',
};

const markerStyle: CSSProperties = {
  minWidth: 20,
  textAlign: 'center',
  color: 'var(--light-on-surface-variant)',
};

const weekdayRowStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 12,
  marginTop: 8,
};

const weekdayItemStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '8px 12px',
  borderRadius: 8,
  border: '1px solid var(--light-outline-variant)',
  backgroundColor: 'var(--light-surface)',
  color: 'var(--light-on-surface)',
};

const contextRowStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 12,
  marginTop: 8,
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

export function CommitmentForm() {
  return (
    <section aria-labelledby="commitment-form-heading" style={sectionStyle}>
      <h2
        id="commitment-form-heading"
        className="headline-md"
        style={{ margin: 0, color: 'var(--light-on-surface)' }}
      >
        Name a commitment
      </h2>
      <p className="body-md" style={{ margin: '8px 0 0', color: 'var(--light-on-surface-variant)' }}>
        Add the things that stand — a standing pickup, a recurring block, a promise you keep.
        Choose how firmly each one is held. The time itself can live in the title.
      </p>

      <form action={addCommitment}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 20 }}>
          <label htmlFor="commitment-title" className="label-md">
            What is it
          </label>
          <input
            id="commitment-title"
            name="title"
            type="text"
            required
            placeholder="e.g. Thursday 3:30 school pickup"
            style={inputStyle}
          />
        </div>

        {/* Protection level — required radio group; each option shows its meaning
            + a non-color glyph/label. Status is text + shape, never color. */}
        <fieldset style={fieldsetStyle}>
          <legend className="label-md" style={legendStyle}>
            How firmly is it held?
          </legend>
          {/* No pre-selected level: protection is a deliberate choice, so the
              group starts unselected and `required` forces an explicit pick
              (rather than silently defaulting to the strongest level). */}
          {PROTECTION_LEVEL_OPTIONS.map((level) => (
            <label key={level.id} htmlFor={`level-${level.id}`} style={optionRowStyle}>
              <input
                type="radio"
                id={`level-${level.id}`}
                name="protectionLevel"
                value={level.id}
                required
              />
              <span aria-hidden="true" style={markerStyle}>
                {level.icon}
              </span>
              <span>
                <span className="label-md" style={{ display: 'block', color: 'var(--light-on-surface)' }}>
                  {level.label}
                </span>
                <span className="body-md" style={{ color: 'var(--light-on-surface-variant)' }}>
                  {level.meaning}
                </span>
              </span>
            </label>
          ))}
        </fieldset>

        {/* Context — work or personal (never joint on a plannable item, AD-5). */}
        <fieldset style={fieldsetStyle}>
          <legend className="label-md" style={legendStyle}>
            Which part of life?
          </legend>
          <div style={contextRowStyle}>
            <label htmlFor="context-personal" style={weekdayItemStyle}>
              <input
                type="radio"
                id="context-personal"
                name="context"
                value="personal"
                required
                defaultChecked
              />
              <span>Personal</span>
            </label>
            <label htmlFor="context-work" style={weekdayItemStyle}>
              <input type="radio" id="context-work" name="context" value="work" />
              <span>Work</span>
            </label>
          </div>
        </fieldset>

        {/* Weekly recurrence — optional. No day checked = a one-off. */}
        <fieldset style={fieldsetStyle}>
          <legend className="label-md" style={legendStyle}>
            Does it repeat weekly? (optional)
          </legend>
          <p className="body-md" style={{ margin: '4px 0 0', color: 'var(--light-on-surface-variant)' }}>
            Check the days it repeats, or leave them all clear for a one-off.
          </p>
          <div style={weekdayRowStyle}>
            {WEEKDAY_OPTIONS.map((day) => (
              <label key={day.id} htmlFor={`day-${day.id}`} style={weekdayItemStyle}>
                <input
                  type="checkbox"
                  id={`day-${day.id}`}
                  name="daysOfWeek"
                  value={day.id}
                />
                <span>{day.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <button type="submit" className="label-md" style={addButtonStyle}>
          Add commitment
        </button>
      </form>
    </section>
  );
}
