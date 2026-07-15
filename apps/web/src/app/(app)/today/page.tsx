import type { CSSProperties } from 'react';
import { loadConfig } from '@life-focus/config';
import { getStores } from '../../../lib/stores.js';
import { loadAgenda, type LoadedAgenda } from '../../../lib/agenda-data.js';
import { agendaEmptyNotice } from '../../../lib/agenda.js';
import { syncDisclosure } from '../../../lib/sync-disclosure.js';

// Read-only agenda: reads live mirror state per request. Never cached.
export const dynamic = 'force-dynamic';

const listStyle: CSSProperties = {
  listStyle: 'none',
  margin: '24px 0 0',
  padding: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
};

const rowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 16,
  padding: '16px 20px',
  backgroundColor: 'var(--light-surface-container-low)',
  border: '1px solid var(--light-outline-variant)',
  borderRadius: 8,
};

const tagStyle: CSSProperties = {
  padding: '2px 10px',
  borderRadius: 999,
  backgroundColor: 'var(--light-secondary-container)',
  color: 'var(--light-on-secondary-container)',
};

const timeStyle: CSSProperties = {
  minWidth: 96,
  color: 'var(--light-on-surface-variant)',
};

const noticeStyle: CSSProperties = {
  marginTop: 16,
  padding: '12px 16px',
  backgroundColor: 'var(--light-surface-container-high)',
  color: 'var(--light-on-surface-variant)',
  borderRadius: 8,
};

const sourceListStyle: CSSProperties = {
  listStyle: 'none',
  margin: '12px 0 0',
  padding: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
};

export default async function TodayPage() {
  const config = loadConfig();
  const { mirror, ledger } = getStores();

  let agenda: LoadedAgenda;
  let loadFailed = false;
  try {
    agenda = await loadAgenda(
      { mirror, ledger },
      { now: new Date(), timeZone: config.APP_TIMEZONE },
    );
  } catch {
    // Degraded, not error framing (EXPERIENCE.md voice). Crucially we DON'T fall
    // through to the "no calendars connected" copy — a transient read failure is
    // not the same as having no connections, and saying so would be actively
    // false. `loadFailed` routes to an honest degraded notice instead.
    loadFailed = true;
    agenda = { items: [], sources: [] };
  }

  const { items, sources } = agenda;
  const hasSources = sources.length > 0;

  return (
    <section aria-labelledby="today-heading">
      <h1 id="today-heading" className="display-lg" style={{ margin: 0 }}>
        Today
      </h1>
      <p className="body-lg" style={{ color: 'var(--light-on-surface-variant)' }}>
        What matters now.
      </p>

      {items.length > 0 ? (
        <ul style={listStyle} aria-label="Today's agenda">
          {items.map((item) => (
            <li key={`${item.context}:${item.externalId}`} style={rowStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span className="label-md" style={timeStyle}>
                  {item.timeLabel}
                </span>
                <span className="body-md" style={{ color: 'var(--light-on-surface)' }}>
                  {item.title}
                </span>
              </div>
              <span className="label-caps" style={tagStyle}>
                {item.context}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="body-md" role="note" style={noticeStyle}>
          {agendaEmptyNotice({ loadFailed, hasSources })}
        </p>
      )}

      {/* Sync-health region: polite live status, never color-alone (icon + text). */}
      <section aria-labelledby="today-sync-heading" style={{ marginTop: 32 }}>
        <h2 id="today-sync-heading" className="label-caps" style={{ margin: 0, color: 'var(--light-on-surface-variant)' }}>
          Calendar sync
        </h2>
        <div role="status" aria-live="polite">
          {hasSources ? (
            <ul style={sourceListStyle} aria-label="Connected calendars">
              {sources.map((source) => {
                const disclosure = syncDisclosure(source);
                return (
                  <li key={source.id} style={{ display: 'flex', gap: 12, alignItems: 'baseline' }}>
                    <span className="label-caps" style={tagStyle}>
                      {source.context}
                    </span>
                    <span className="body-md" style={{ color: 'var(--light-on-surface-variant)' }}>
                      {/* Status = icon + text (never color alone). */}
                      <span aria-hidden="true" style={{ marginRight: 8 }}>
                        {disclosure.icon}
                      </span>
                      <span aria-label={disclosure.label}>{disclosure.text}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="body-md" style={{ marginTop: 12, color: 'var(--light-on-surface-variant)' }}>
              {loadFailed
                ? 'Sync status is unavailable right now. Please try again shortly.'
                : 'No calendars connected yet.'}
            </p>
          )}
        </div>
      </section>
    </section>
  );
}
