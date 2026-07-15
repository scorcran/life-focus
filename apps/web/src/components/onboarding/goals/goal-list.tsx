import type { CSSProperties } from 'react';
import type { GoalRow } from '@life-focus/ledger';
import {
  GOAL_PROTECTION,
  allocationSummary,
  displacementSummary,
} from '../../../lib/onboarding/goals-content.js';

/**
 * Captured-goals list (Story 2.5). Each row shows the title, the one next action,
 * the protected weekly allocation (a non-color lock glyph + text label + summary),
 * a neutral displacement summary, and the work/personal context. An empty list
 * reads calmly. Capture is add-only here — no edit/remove controls (those live on
 * a later surface). FR-40 / P5: the allocation status is conveyed by TEXT + SHAPE,
 * never color alone, and nothing is scored — `displacementCount` renders as a
 * plain factual, non-guilt line. Light tokens only.
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

/** The visible context word for a goal's context tag. */
function contextWord(context: GoalRow['context']): string {
  return context === 'work' ? 'Work' : 'Personal';
}

function GoalRowItem({ goal }: { goal: GoalRow }) {
  return (
    <li style={rowStyle}>
      {/* Protected-priority = shape + text, never color alone. */}
      <span aria-hidden="true" style={markerStyle}>
        {GOAL_PROTECTION.icon}
      </span>
      <div>
        <p className="label-md" style={{ margin: 0, color: 'var(--light-on-surface)' }}>
          {goal.title}
        </p>
        <p className="body-md" style={metaStyle}>
          Next action: {goal.nextAction}
        </p>
        <p className="label-md" style={metaStyle}>
          {GOAL_PROTECTION.label} ·{' '}
          {allocationSummary(goal.allocation.sessionsPerWeek, goal.allocation.minutesPerSession)} ·{' '}
          {contextWord(goal.context)}
        </p>
        <p className="body-md" style={metaStyle}>
          {displacementSummary(goal.displacementCount)}
        </p>
      </div>
    </li>
  );
}

export function GoalList({ goals }: { goals: readonly GoalRow[] }) {
  return (
    <section aria-labelledby="goal-list-heading" style={sectionStyle}>
      <h2
        id="goal-list-heading"
        className="headline-md"
        style={{ margin: 0, color: 'var(--light-on-surface)' }}
      >
        Goals you have added
      </h2>

      {goals.length === 0 ? (
        <p className="body-md" style={{ margin: '12px 0 0', color: 'var(--light-on-surface-variant)' }}>
          No goals yet.
        </p>
      ) : (
        <ul style={listStyle} aria-label={`Goals you have added — ${goals.length}`}>
          {goals.map((goal) => (
            <GoalRowItem key={goal.id} goal={goal} />
          ))}
        </ul>
      )}
    </section>
  );
}
