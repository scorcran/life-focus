import type { CSSProperties } from 'react';
import type { PersonRow } from '@life-focus/ledger';
import {
  personImportanceContent,
  rhythmSummary,
  formatImportantDate,
} from '../../../lib/onboarding/people-content.js';

/**
 * Captured-people list (Story 2.4). Each row shows the name, how you know them,
 * their closeness circle (non-color glyph + text label), a stated intention when
 * present, user-asserted important dates, a calm communication-rhythm summary
 * when present, and the work/personal context. An empty list reads calmly.
 * Capture is add-only here — no edit/remove controls (those live on the 2.7
 * Policy & Boundaries surface). FR-12 / P5: closeness is conveyed by TEXT +
 * SHAPE, never color alone, and nothing is scored. Light tokens only.
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

/** The visible context word for a person's context tag. */
function contextWord(context: PersonRow['context']): string {
  return context === 'work' ? 'Work' : 'Personal';
}

/** A calm summary of a person's user-asserted important dates. */
function importantDatesSummary(dates: PersonRow['importantDates']): string {
  return dates.map((d) => `${d.label} · ${formatImportantDate(d.date)}`).join(', ');
}

function PersonRowItem({ person }: { person: PersonRow }) {
  const circle = personImportanceContent(person.importance);

  return (
    <li style={rowStyle}>
      {/* Closeness = shape + text, never color alone. */}
      <span aria-hidden="true" style={markerStyle}>
        {circle.icon}
      </span>
      <div>
        <p className="label-md" style={{ margin: 0, color: 'var(--light-on-surface)' }}>
          {person.name}
        </p>
        <p className="label-md" style={metaStyle}>
          {person.relationshipType} · {circle.label} · {contextWord(person.context)}
        </p>
        {person.intention !== null && (
          <p className="body-md" style={metaStyle}>
            {person.intention}
          </p>
        )}
        {person.importantDates.length > 0 && (
          <p className="body-md" style={metaStyle}>
            {importantDatesSummary(person.importantDates)}
          </p>
        )}
        {person.rhythm !== null && (
          <p className="body-md" style={metaStyle}>
            {rhythmSummary(person.rhythm.daysOfWeek)}
          </p>
        )}
      </div>
    </li>
  );
}

export function PersonList({ people }: { people: readonly PersonRow[] }) {
  return (
    <section aria-labelledby="person-list-heading" style={sectionStyle}>
      <h2
        id="person-list-heading"
        className="headline-md"
        style={{ margin: 0, color: 'var(--light-on-surface)' }}
      >
        People you have added
      </h2>

      {people.length === 0 ? (
        <p className="body-md" style={{ margin: '12px 0 0', color: 'var(--light-on-surface-variant)' }}>
          No one added yet.
        </p>
      ) : (
        <ul style={listStyle} aria-label={`People you have added — ${people.length}`}>
          {people.map((person) => (
            <PersonRowItem key={person.id} person={person} />
          ))}
        </ul>
      )}
    </section>
  );
}
