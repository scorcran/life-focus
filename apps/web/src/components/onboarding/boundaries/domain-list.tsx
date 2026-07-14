import type { CSSProperties } from 'react';
import type { DomainRow } from '@life-focus/ledger';
import {
  renameDomain,
  setDomainEnabled,
  addDomain,
} from '../../../app/(app)/onboarding/boundaries-actions.js';

/**
 * Life-domain review (Story 2.2). Each of the 11 defaults (plus any custom
 * domains) renders a row with a rename form and an enable/disable toggle, all
 * native `<form>`s posting one append. An add-custom form appends a new enabled
 * domain. A disabled domain stays listed and is conveyed by TEXT + SHAPE (a
 * "○ Off" marker and an "(off)" suffix), never by color alone. Keyboard-operable
 * throughout with the global focus ring. Light tokens only.
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
  alignItems: 'center',
  flexWrap: 'wrap',
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

const inputStyle: CSSProperties = {
  padding: '8px 10px',
  borderRadius: 6,
  border: '1px solid var(--light-outline)',
  background: 'var(--light-surface)',
  color: 'var(--light-on-surface)',
  fontFamily: 'var(--font-body)',
  fontSize: 16,
  minWidth: 180,
};

const smallButtonStyle: CSSProperties = {
  padding: '8px 14px',
  borderRadius: 8,
  border: '1px solid var(--light-outline)',
  backgroundColor: 'transparent',
  color: 'var(--light-on-surface-variant)',
  cursor: 'pointer',
};

const addInputStyle: CSSProperties = { ...inputStyle, minWidth: 220 };

const addButtonStyle: CSSProperties = {
  padding: '10px 18px',
  borderRadius: 8,
  border: 'none',
  backgroundColor: 'var(--light-primary)',
  color: 'var(--light-on-primary)',
  cursor: 'pointer',
};

function DomainRowItem({ domain }: { domain: DomainRow }) {
  const marker = domain.enabled ? '●' : '○';
  const stateWord = domain.enabled ? 'On' : 'Off';
  const nextEnabled = domain.enabled ? 'false' : 'true';
  const toggleLabel = domain.enabled
    ? `Turn off ${domain.name}`
    : `Turn on ${domain.name}`;

  return (
    <li style={rowStyle}>
      {/* Status = shape + text, never color alone. */}
      <span aria-hidden="true" style={markerStyle}>
        {marker}
      </span>
      <span className="label-caps" style={{ color: 'var(--light-on-surface-variant)', minWidth: 40 }}>
        {stateWord}
      </span>

      <form action={renameDomain} style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <input type="hidden" name="domainId" value={domain.id} />
        <input
          id={`domain-name-${domain.id}`}
          name="name"
          type="text"
          defaultValue={domain.name}
          required
          aria-label={`Rename ${domain.name}${domain.enabled ? '' : ' (off)'}`}
          style={inputStyle}
        />
        <button type="submit" className="label-md" style={smallButtonStyle}>
          Rename
        </button>
      </form>

      <form action={setDomainEnabled}>
        <input type="hidden" name="domainId" value={domain.id} />
        <input type="hidden" name="enabled" value={nextEnabled} />
        <button type="submit" className="label-md" style={smallButtonStyle} aria-label={toggleLabel}>
          {domain.enabled ? 'Turn off' : 'Turn on'}
        </button>
      </form>
    </li>
  );
}

export function DomainList({ domains }: { domains: readonly DomainRow[] }) {
  const enabledCount = domains.filter((d) => d.enabled).length;
  return (
    <section aria-labelledby="domains-heading" style={sectionStyle}>
      <h2 id="domains-heading" className="headline-md" style={{ margin: 0, color: 'var(--light-on-surface)' }}>
        Your life domains
      </h2>
      <p className="body-md" style={{ margin: '8px 0 0', color: 'var(--light-on-surface-variant)' }}>
        Rename any of these, turn off the ones that do not apply, or add your own. A domain that is
        off stays in the list — it just will not be planned around.
      </p>

      <ul style={listStyle} aria-label={`Life domains — ${enabledCount} of ${domains.length} on`}>
        {domains.map((domain) => (
          <DomainRowItem key={domain.id} domain={domain} />
        ))}
      </ul>

      <form
        action={addDomain}
        style={{ display: 'flex', gap: 8, alignItems: 'flex-end', marginTop: 16, flexWrap: 'wrap' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label htmlFor="add-domain-name" className="label-md">
            Add a domain
          </label>
          <input
            id="add-domain-name"
            name="name"
            type="text"
            required
            placeholder="e.g. Volunteering"
            style={addInputStyle}
          />
        </div>
        <button type="submit" className="label-md" style={addButtonStyle}>
          Add domain
        </button>
      </form>
    </section>
  );
}
