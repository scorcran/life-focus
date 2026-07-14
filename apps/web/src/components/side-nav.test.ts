import { describe, it, expect, vi } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// usePathname needs a Next runtime; mock it to place us on /today.
vi.mock('next/navigation', () => ({
  usePathname: () => '/today',
}));

const { SideNav } = await import('./side-nav.js');

describe('shell side navigation', () => {
  const html = renderToStaticMarkup(createElement(SideNav));

  it('renders a <nav> landmark labelled Primary', () => {
    expect(html).toContain('<nav');
    expect(html).toContain('aria-label="Primary"');
  });

  it('renders all four MVP destinations as native <a> links (keyboard-reachable)', () => {
    for (const [href, label] of [
      ['/today', 'Today'],
      ['/interrupts', 'Interrupts'],
      ['/inbox', 'Inbox'],
      ['/commitments', 'Commitments'],
    ] as const) {
      expect(html).toContain(`href="${href}"`);
      expect(html).toContain(label);
    }
    // Native anchors only — no div click-handlers (jsx-a11y contract).
    // 4 primary destinations + Setup + Settings footer entries.
    const anchorCount = (html.match(/<a /g) ?? []).length;
    expect(anchorCount).toBe(6);
  });

  it('renders a Settings footer entry reaching the connections screen (Story 1.4)', () => {
    expect(html).toContain('href="/settings/connections"');
    expect(html).toContain('Settings');
  });

  it('renders a Setup footer entry reaching the onboarding flow (Story 2.1)', () => {
    expect(html).toContain('href="/onboarding"');
    expect(html).toContain('Setup');
  });

  it('marks the active item with aria-current and the primary right border', () => {
    // Exactly one item is current (the /today route we mocked).
    expect((html.match(/aria-current="page"/g) ?? []).length).toBe(1);
    // Active fill = surface-container; active indicator = 2px primary right border.
    expect(html).toContain('var(--light-surface-container)');
    expect(html).toContain('2px solid var(--light-primary)');
  });

  it('labels each item with the label-caps class (Public Sans nav text)', () => {
    // 4 primary + Setup + Settings footer entries.
    expect((html.match(/label-caps/g) ?? []).length).toBe(6);
  });
});
