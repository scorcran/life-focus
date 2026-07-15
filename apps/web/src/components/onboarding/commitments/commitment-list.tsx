import type { CSSProperties } from 'react';
import type { CommitmentRow } from '@life-focus/ledger';
import {
  protectionLevelContent,
  recurrenceSummary,
} from '../../../lib/onboarding/protection-levels.js';

/**
 * Captured-commitments list (Story 2.3). Each row shows the title, its
 * protection level (non-color glyph + text label), a calm recurrence summary
 * ("Repeats weekly: Thu" or "One-off"), and the work/personal context. An empty
 * list reads calmly. Capture is add-only here — no edit/remove controls (those
 * live on the 2.7 Policy & Boundaries surface). Protection status is conveyed by
 * TEXT + SHAPE, never color alone. Light tokens only.
 */

const sectionStyle: CSSProperties = {
  marginTop: 24,
  maxWidth: 640,
  padding: '20px 24px',
  backgroundColor: 'var(--light-surface-container-low)',
  border: '1px solid var(--light-outline-variant)',
  borderRadius: 12,
};

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
  alignItems: 'flex-start',
  gap: 12,
  padding: '12px 16px',
  borderRadius: 8,
  border: '1px solid var(--light-outline-variant)',
  backgroundColor: 'var(--light-surface-container-lowest)',
};

const markerStyle: CSSProperties = {
  minWidth: 20,
  textAlign: 'center',
  color: 'var(--light-on-surface-variant)',
};

const metaStyle: CSSProperties = {
  margin: '4px 0 0',
  color: 'var(--light-on-surface-variant)',
};

/** The visible context word for a commitment's context tag. */
function contextWord(context: CommitmentRow['context']): string {
  return context === 'work' ? 'Work' : 'Personal';
}

function CommitmentRowItem({ commitment }: { commitment: CommitmentRow }) {
  const level = protectionLevelContent(commitment.protectionLevel);
  const repeats = commitment.recurrence
    ? recurrenceSummary(commitment.recurrence.daysOfWeek)
    : 'One-off';

  return (
    <li style={rowStyle}>
      {/* Protection = shape + text, never color alone. */}
      <span aria-hidden="true" style={markerStyle}>
        {level.icon}
      </span>
      <div>
        <p className="label-md" style={{ margin: 0, color: 'var(--light-on-surface)' }}>
          {commitment.title}
        </p>
        <p className="label-md" style={metaStyle}>
          {level.label} · {repeats} · {contextWord(commitment.context)}
        </p>
      </div>
    </li>
  );
}

export function CommitmentList({ commitments }: { commitments: readonly CommitmentRow[] }) {
  return (
    <section aria-labelledby="commitment-list-heading" style={sectionStyle}>
      <h2
        id="commitment-list-heading"
        className="headline-md"
        style={{ margin: 0, color: 'var(--light-on-surface)' }}
      >
        Captured commitments
      </h2>

      {commitments.length === 0 ? (
        <p className="body-md" style={{ margin: '12px 0 0', color: 'var(--light-on-surface-variant)' }}>
          Nothing captured yet.
        </p>
      ) : (
        <ul style={listStyle} aria-label={`Captured commitments — ${commitments.length}`}>
          {commitments.map((commitment) => (
            <CommitmentRowItem key={commitment.id} commitment={commitment} />
          ))}
        </ul>
      )}
    </section>
  );
}
