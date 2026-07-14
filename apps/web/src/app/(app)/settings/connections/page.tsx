import type { CSSProperties } from 'react';
import { loadConfig, isGoogleOAuthConfigured } from '@life-focus/config';
import type { SourceRecord } from '@life-focus/db';
import { getStores } from '../../../../lib/stores.js';
import { syncDisclosure } from '../../../../lib/sync-disclosure.js';
import { startGoogleConnect } from './actions.js';

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

const connectButtonStyle: CSSProperties = {
  padding: '10px 18px',
  borderRadius: 8,
  border: 'none',
  backgroundColor: 'var(--light-primary)',
  color: 'var(--light-on-primary)',
  cursor: 'pointer',
};

const disabledButtonStyle: CSSProperties = {
  ...connectButtonStyle,
  backgroundColor: 'var(--light-surface-container-high)',
  color: 'var(--light-on-surface-variant)',
  cursor: 'not-allowed',
};

/**
 * Map the OAuth callback's redirect params to an in-app disclosure. The callback
 * returns `?connected=<context>` on success or `?error=<code>` on failure; without
 * this the connect outcome would be silent (AC: "error → redirect with message").
 * Degraded voice per EXPERIENCE.md — never "Error"/"Failed".
 */
function outcomeBanner(
  params: Record<string, string | string[] | undefined>,
): { tone: 'status' | 'alert'; text: string } | null {
  const connected = typeof params.connected === 'string' ? params.connected : null;
  if (connected === 'work' || connected === 'personal') {
    return { tone: 'status', text: `Your ${connected} calendar is connected. It will sync shortly.` };
  }
  const error = typeof params.error === 'string' ? params.error : null;
  if (!error) return null;
  const messages: Record<string, string> = {
    not_configured: 'Google Calendar sign-in is not set up on this server yet.',
    declined: "Connection canceled — calendar access wasn't granted. Try again when you're ready.",
    missing_params: 'That connection did not complete. Please start connecting again.',
    bad_state: 'That connection link expired before it finished. Please start connecting again.',
    nonce_mismatch: 'That connection link expired before it finished. Please start connecting again.',
    connect_failed: "We couldn't finish connecting that calendar. Please try again.",
  };
  return { tone: 'alert', text: messages[error] ?? 'That connection did not complete. Please try again.' };
}

export default async function ConnectionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const config = loadConfig();
  const configured = isGoogleOAuthConfigured(config);
  const banner = outcomeBanner(await searchParams);

  let sources: readonly SourceRecord[] = [];
  if (configured) {
    sources = await getStores().mirror.listSources();
  }

  const connectWork = startGoogleConnect.bind(null, 'work');
  const connectPersonal = startGoogleConnect.bind(null, 'personal');

  return (
    <section aria-labelledby="connections-heading">
      <h1 id="connections-heading" className="display-lg" style={{ margin: 0 }}>
        Connections
      </h1>
      <p className="body-lg" style={{ color: 'var(--light-on-surface-variant)' }}>
        Connect your Google Calendars. Choose work or personal before connecting — the context is
        fixed for that connection.
      </p>

      {banner && (
        <p
          className="body-md"
          role={banner.tone === 'alert' ? 'alert' : 'status'}
          style={{
            marginTop: 16,
            padding: '12px 16px',
            backgroundColor: 'var(--light-surface-container-high)',
            color: 'var(--light-on-surface-variant)',
            borderRadius: 8,
          }}
        >
          <span aria-hidden="true" style={{ marginRight: 8 }}>
            {banner.tone === 'alert' ? '⚠' : '✓'}
          </span>
          {banner.text}
        </p>
      )}

      {!configured && (
        <p
          className="body-md"
          role="note"
          style={{
            marginTop: 16,
            padding: '12px 16px',
            backgroundColor: 'var(--light-surface-container-high)',
            color: 'var(--light-on-surface-variant)',
            borderRadius: 8,
          }}
        >
          Google Calendar sign-in isn&apos;t set up on this server yet. Ask your administrator to add
          the Google OAuth credentials, then reload this page to connect a calendar.
        </p>
      )}

      <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
        <form action={connectWork}>
          <button
            type="submit"
            className="label-md"
            style={configured ? connectButtonStyle : disabledButtonStyle}
            disabled={!configured}
            aria-disabled={!configured}
          >
            Connect work calendar
          </button>
        </form>
        <form action={connectPersonal}>
          <button
            type="submit"
            className="label-md"
            style={configured ? connectButtonStyle : disabledButtonStyle}
            disabled={!configured}
            aria-disabled={!configured}
          >
            Connect personal calendar
          </button>
        </form>
      </div>

      {sources.length > 0 && (
        <ul style={listStyle} aria-label="Connected calendars">
          {sources.map((source) => {
            const disclosure = syncDisclosure(source);
            return (
              <li key={source.id} style={rowStyle}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span className="body-md" style={{ color: 'var(--light-on-surface)' }}>
                    {source.account}
                  </span>
                  <span
                    className="body-md"
                    style={{ color: 'var(--light-on-surface-variant)' }}
                  >
                    {/* Status = icon + text (never color alone). */}
                    <span aria-hidden="true" style={{ marginRight: 8 }}>
                      {disclosure.icon}
                    </span>
                    <span aria-label={disclosure.label}>{disclosure.text}</span>
                  </span>
                </div>
                <span className="label-caps" style={tagStyle}>
                  {source.context}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
