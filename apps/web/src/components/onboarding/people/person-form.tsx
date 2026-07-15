import type { CSSProperties } from 'react';
import {
  PERSON_IMPORTANCE_OPTIONS,
  WEEKDAY_OPTIONS,
} from '../../../lib/onboarding/people-content.js';
import { addPerson } from '../../../app/(app)/onboarding/people-actions.js';

/**
 * Important-person capture (Story 2.4). A native `<form>` posting one `addPerson`
 * append: a name, a relationship-type input, a required closeness radio group
 * (each option shows its plain-language meaning + a non-color glyph/label), an
 * optional intention field, a small fixed set of optional important-date rows
 * (label + date), a work/personal context radio group, and an optional weekly
 * communication-rhythm section (weekday checkboxes; none checked = a flexible
 * weekly window). Radio and checkbox groups are `fieldset`/`legend` for screen
 * readers; every control is keyboard-operable with the global `:focus-visible`
 * ring. FR-12 / P5: closeness is a user-asserted label conveyed by TEXT + SHAPE,
 * never color alone, and nothing is scored. Light tokens only.
 */

const IMPORTANT_DATE_ROWS = 3;

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

const dateRowStyle: CSSProperties = {
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

export function PersonForm() {
  return (
    <section aria-labelledby="person-form-heading" style={sectionStyle}>
      <h2
        id="person-form-heading"
        className="headline-md"
        style={{ margin: 0, color: 'var(--light-on-surface)' }}
      >
        Add someone who matters
      </h2>
      <p className="body-md" style={{ margin: '8px 0 0', color: 'var(--light-on-surface-variant)' }}>
        Name the people you want to stay close to, and how often. You can note an intention
        and dates that matter to you. This is simply what you have told us — nothing here is
        measured or compared.
      </p>

      <form action={addPerson}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 20 }}>
          <label htmlFor="person-name" className="label-md">
            Their name
          </label>
          <input
            id="person-name"
            name="name"
            type="text"
            required
            placeholder="e.g. Mom"
            style={inputStyle}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 16 }}>
          <label htmlFor="person-relationship" className="label-md">
            How you know them
          </label>
          <input
            id="person-relationship"
            name="relationshipType"
            type="text"
            required
            placeholder="e.g. Parent, close friend, mentor"
            style={inputStyle}
          />
        </div>

        {/* Closeness — required radio group; each option shows its meaning + a
            non-color glyph/label. It is a user-asserted label, never a score. */}
        <fieldset style={fieldsetStyle}>
          <legend className="label-md" style={legendStyle}>
            How close are they to you?
          </legend>
          {/* No pre-selected circle: closeness is the person's own assertion, so
              the group starts unselected and `required` forces an explicit pick. */}
          {PERSON_IMPORTANCE_OPTIONS.map((circle) => (
            <label key={circle.id} htmlFor={`importance-${circle.id}`} style={optionRowStyle}>
              <input
                type="radio"
                id={`importance-${circle.id}`}
                name="importance"
                value={circle.id}
                required
              />
              <span aria-hidden="true" style={markerStyle}>
                {circle.icon}
              </span>
              <span>
                <span className="label-md" style={{ display: 'block', color: 'var(--light-on-surface)' }}>
                  {circle.label}
                </span>
                <span className="body-md" style={{ color: 'var(--light-on-surface-variant)' }}>
                  {circle.meaning}
                </span>
              </span>
            </label>
          ))}
        </fieldset>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 16 }}>
          <label htmlFor="person-intention" className="label-md">
            What you would like from this relationship (optional)
          </label>
          <input
            id="person-intention"
            name="intention"
            type="text"
            placeholder="e.g. Stay in regular touch"
            style={inputStyle}
          />
        </div>

        {/* Important dates — a small fixed set of optional label + date rows.
            User-asserted only; never inferred. */}
        <fieldset style={fieldsetStyle}>
          <legend className="label-md" style={legendStyle}>
            Dates that matter (optional)
          </legend>
          <p className="body-md" style={{ margin: '4px 0 0', color: 'var(--light-on-surface-variant)' }}>
            Add a label and a date (MM-DD, or YYYY-MM-DD). Leave a row blank to skip it.
          </p>
          {Array.from({ length: IMPORTANT_DATE_ROWS }, (_, i) => (
            <div key={i} style={dateRowStyle}>
              <label htmlFor={`important-date-label-${i}`} className="label-md" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span>Label</span>
                <input
                  id={`important-date-label-${i}`}
                  name={`importantDateLabel-${i}`}
                  type="text"
                  placeholder="e.g. Birthday"
                  style={inputStyle}
                />
              </label>
              <label htmlFor={`important-date-value-${i}`} className="label-md" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span>Date</span>
                <input
                  id={`important-date-value-${i}`}
                  name={`importantDateValue-${i}`}
                  type="text"
                  placeholder="e.g. 03-14"
                  style={inputStyle}
                />
              </label>
            </div>
          ))}
        </fieldset>

        {/* Context — work or personal (never joint on a person, AD-5). */}
        <fieldset style={fieldsetStyle}>
          <legend className="label-md" style={legendStyle}>
            Which part of life?
          </legend>
          <div style={chipRowStyle}>
            <label htmlFor="person-context-personal" style={chipItemStyle}>
              <input
                type="radio"
                id="person-context-personal"
                name="context"
                value="personal"
                required
                defaultChecked
              />
              <span>Personal</span>
            </label>
            <label htmlFor="person-context-work" style={chipItemStyle}>
              <input type="radio" id="person-context-work" name="context" value="work" />
              <span>Work</span>
            </label>
          </div>
        </fieldset>

        {/* Communication rhythm — optional, weekly. No day checked = a flexible
            "sometime each week" window. */}
        <fieldset style={fieldsetStyle}>
          <legend className="label-md" style={legendStyle}>
            A weekly communication rhythm (optional)
          </legend>
          <label htmlFor="person-rhythm-enabled" style={{ ...chipItemStyle, marginTop: 8 }}>
            <input type="checkbox" id="person-rhythm-enabled" name="rhythmEnabled" />
            <span>Keep a weekly rhythm with them</span>
          </label>
          <p className="body-md" style={{ margin: '8px 0 0', color: 'var(--light-on-surface-variant)' }}>
            Pick the days it usually happens, or leave them all clear for sometime each week.
          </p>
          <div style={chipRowStyle}>
            {WEEKDAY_OPTIONS.map((day) => (
              <label key={day.id} htmlFor={`rhythm-day-${day.id}`} style={chipItemStyle}>
                <input
                  type="checkbox"
                  id={`rhythm-day-${day.id}`}
                  name="rhythmDaysOfWeek"
                  value={day.id}
                />
                <span>{day.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <button type="submit" className="label-md" style={addButtonStyle}>
          Add person
        </button>
      </form>
    </section>
  );
}
