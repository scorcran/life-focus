import type { CSSProperties } from 'react';
import type { DailyBoundaries } from '@life-focus/ledger';
import { saveBoundaries } from '../../../app/(app)/onboarding/boundaries-actions.js';

/**
 * Daily-boundaries capture (Story 2.2). A native `<form>` posting one
 * `saveBoundaries` append — workday start / hard stop / sleep window as
 * `type="time"` inputs. The hard stop is labelled as the firm line. Every
 * control is keyboard-operable with the global `:focus-visible` ring; sections
 * and fields are labelled for screen readers. Light tokens only.
 */

const sectionStyle: CSSProperties = {
  marginTop: 24,
  maxWidth: 640,
  padding: '20px 24px',
  backgroundColor: 'var(--light-surface-container-low)',
  border: '1px solid var(--light-outline-variant)',
  borderRadius: 12,
};

const gridStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 16,
  marginTop: 16,
};

const fieldStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
};

const inputStyle: CSSProperties = {
  padding: '10px 12px',
  borderRadius: 6,
  border: '1px solid var(--light-outline)',
  background: 'var(--light-surface)',
  color: 'var(--light-on-surface)',
  fontFamily: 'var(--font-body)',
  fontSize: 16,
};

const hintStyle: CSSProperties = {
  margin: '4px 0 0',
  color: 'var(--light-on-surface-variant)',
};

const saveButtonStyle: CSSProperties = {
  marginTop: 16,
  padding: '10px 18px',
  borderRadius: 8,
  border: 'none',
  backgroundColor: 'var(--light-primary)',
  color: 'var(--light-on-primary)',
  cursor: 'pointer',
};

export function BoundariesForm({ boundaries }: { boundaries: DailyBoundaries | null }) {
  return (
    <section aria-labelledby="boundaries-form-heading" style={sectionStyle}>
      <h2
        id="boundaries-form-heading"
        className="headline-md"
        style={{ margin: 0, color: 'var(--light-on-surface)' }}
      >
        Your daily boundaries
      </h2>
      <p className="body-md" style={{ margin: '8px 0 0', color: 'var(--light-on-surface-variant)' }}>
        When work starts, when it ends, and the sleep window the day protects. Your sleep window may
        cross midnight.
      </p>

      <form action={saveBoundaries}>
        <div style={gridStyle}>
          <div style={fieldStyle}>
            <label htmlFor="workdayStart" className="label-md">
              Workday start
            </label>
            <input
              id="workdayStart"
              name="workdayStart"
              type="time"
              required
              defaultValue={boundaries?.workdayStart ?? ''}
              style={inputStyle}
            />
          </div>

          <div style={fieldStyle}>
            <label htmlFor="hardStop" className="label-md">
              Hard stop
            </label>
            <input
              id="hardStop"
              name="hardStop"
              type="time"
              required
              defaultValue={boundaries?.hardStop ?? ''}
              aria-describedby="hardStop-hint"
              style={inputStyle}
            />
            <p id="hardStop-hint" className="label-caps" style={hintStyle}>
              The firm line — work ends here
            </p>
          </div>

          <div style={fieldStyle}>
            <label htmlFor="sleepStart" className="label-md">
              Sleep window start
            </label>
            <input
              id="sleepStart"
              name="sleepStart"
              type="time"
              required
              defaultValue={boundaries?.sleepStart ?? ''}
              style={inputStyle}
            />
          </div>

          <div style={fieldStyle}>
            <label htmlFor="sleepEnd" className="label-md">
              Sleep window end
            </label>
            <input
              id="sleepEnd"
              name="sleepEnd"
              type="time"
              required
              defaultValue={boundaries?.sleepEnd ?? ''}
              style={inputStyle}
            />
          </div>
        </div>

        <button type="submit" className="label-md" style={saveButtonStyle}>
          Save boundaries
        </button>
      </form>
    </section>
  );
}
