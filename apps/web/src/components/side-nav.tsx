'use client';

import { usePathname } from 'next/navigation';
import type { CSSProperties } from 'react';

/** MVP nav destinations (EXPERIENCE.md IA): Today / Interrupts / Inbox / Commitments. */
const NAV_ITEMS = [
  { href: '/today', label: 'Today', glyph: '◔' },
  { href: '/interrupts', label: 'Interrupts', glyph: '◇' },
  { href: '/inbox', label: 'Inbox', glyph: '▤' },
  { href: '/commitments', label: 'Commitments', glyph: '◈' },
] as const;

/**
 * Footer nav (Story 1.4): Settings lives in the rail footer, separate from the
 * primary 4-tab set so the MVP IA is unchanged. Reaches the connections screen.
 */
const FOOTER_ITEMS = [
  { href: '/settings/connections', label: 'Settings', glyph: '⚙' },
] as const;

const railStyle: CSSProperties = {
  width: 80,
  flex: '0 0 80px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  gap: 4,
  paddingTop: 16,
  backgroundColor: 'var(--light-surface)',
  borderRight: '1px solid var(--light-outline-variant)',
};

function itemStyle(active: boolean): CSSProperties {
  return {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: '12px 4px',
    textDecoration: 'none',
    // Active item: surface-container fill + 2px primary right border.
    backgroundColor: active ? 'var(--light-surface-container)' : 'transparent',
    borderRight: active
      ? '2px solid var(--light-primary)'
      : '2px solid transparent',
    color: active ? 'var(--light-primary)' : 'var(--light-secondary)',
  };
}

const glyphStyle: CSSProperties = {
  fontSize: 22,
  lineHeight: 1,
};

export function SideNav() {
  const pathname = usePathname();

  const renderItem = (item: { href: string; label: string; glyph: string }) => {
    const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
    return (
      <a
        key={item.href}
        href={item.href}
        aria-current={active ? 'page' : undefined}
        style={itemStyle(active)}
      >
        <span aria-hidden="true" style={glyphStyle}>
          {item.glyph}
        </span>
        <span className="label-caps">{item.label}</span>
      </a>
    );
  };

  return (
    <nav aria-label="Primary" style={railStyle}>
      {NAV_ITEMS.map(renderItem)}
      {/* Push the footer group (Settings) to the bottom of the rail. */}
      <div style={{ marginTop: 'auto' }}>{FOOTER_ITEMS.map(renderItem)}</div>
    </nav>
  );
}
