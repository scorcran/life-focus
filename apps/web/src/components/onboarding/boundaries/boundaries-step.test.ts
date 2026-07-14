import { describe, it, expect, vi } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { DomainRow, PolicyTemplateState } from '@life-focus/ledger';

// The components import the `'use server'` actions module, which transitively
// pulls in auth/db. Mock it so the accessible-rendering tests stay pure — the
// action wiring is exercised at the projection/action level, not here.
vi.mock('../../../app/(app)/onboarding/boundaries-actions.js', () => ({
  saveBoundaries: vi.fn(),
  renameDomain: vi.fn(),
  setDomainEnabled: vi.fn(),
  addDomain: vi.fn(),
  acceptPolicyTemplate: vi.fn(),
  declinePolicyTemplate: vi.fn(),
}));

const { BoundariesForm } = await import('./boundaries-form.js');
const { DomainList } = await import('./domain-list.js');
const { PolicyTemplates } = await import('./policy-templates.js');

const DEFAULT_ROWS: DomainRow[] = [
  { id: 'work', name: 'Work', enabled: true, custom: false },
  { id: 'recreation', name: 'Recreation', enabled: false, custom: false },
  { id: 'custom-x', name: 'Volunteering', enabled: true, custom: true },
];

const PENDING_POLICIES: PolicyTemplateState[] = [
  { templateId: 'non-negotiables', status: 'pending', content: null },
  { templateId: 'work-boundaries', status: 'pending', content: null },
];

describe('BoundariesForm', () => {
  it('renders a labelled section with all four time inputs, hard stop marked as the firm line', () => {
    const html = renderToStaticMarkup(createElement(BoundariesForm, { boundaries: null }));
    expect(html).toContain('aria-labelledby="boundaries-form-heading"');
    for (const id of ['workdayStart', 'hardStop', 'sleepStart', 'sleepEnd']) {
      expect(html).toContain(`name="${id}"`);
      expect(html).toContain(`for="${id}"`);
    }
    expect(html).toContain('type="time"');
    // The hard stop is described as the firm line.
    expect(html).toContain('The firm line');
    expect(html).toContain('aria-describedby="hardStop-hint"');
  });

  it('pre-fills saved values on return (nothing lost)', () => {
    const html = renderToStaticMarkup(
      createElement(BoundariesForm, {
        boundaries: {
          workdayStart: '09:00',
          hardStop: '16:30',
          sleepStart: '22:30',
          sleepEnd: '06:30',
          updatedAt: 't1',
        },
      }),
    );
    expect(html).toContain('value="09:00"');
    expect(html).toContain('value="16:30"');
  });
});

describe('DomainList', () => {
  const html = renderToStaticMarkup(createElement(DomainList, { domains: DEFAULT_ROWS }));

  it('renders a labelled section and lists every domain', () => {
    expect(html).toContain('aria-labelledby="domains-heading"');
    expect(html).toContain('Work');
    expect(html).toContain('Recreation');
    expect(html).toContain('Volunteering');
  });

  it('conveys a disabled domain by text + shape, not color alone', () => {
    // The "Off" word and the ○ shape both appear for the disabled domain.
    expect(html).toContain('Off');
    expect(html).toContain('○');
    // And an accessible toggle label naming the action.
    expect(html).toContain('aria-label="Turn on Recreation"');
    expect(html).toContain('aria-label="Turn off Work"');
  });

  it('offers an add-custom-domain form (keyboard reachable native controls)', () => {
    expect(html).toContain('for="add-domain-name"');
    expect(html).toContain('Add domain');
  });
});

describe('PolicyTemplates', () => {
  it('renders both templates with plain-language explanations and editable content', () => {
    const html = renderToStaticMarkup(
      createElement(PolicyTemplates, { policies: PENDING_POLICIES }),
    );
    expect(html).toContain('Non-negotiables');
    expect(html).toContain('The lines your day will not cross.');
    expect(html).toContain('Work boundaries');
    expect(html).toContain('<textarea');
    // Both an Accept and a decline ("Not now") path are offered while pending.
    expect(html).toContain('Accept');
    expect(html).toContain('Not now');
  });

  it('shows an accepted template with its saved content and no decline prompt', () => {
    const html = renderToStaticMarkup(
      createElement(PolicyTemplates, {
        policies: [
          { templateId: 'non-negotiables', status: 'accepted', content: 'My edited rule.' },
          { templateId: 'work-boundaries', status: 'pending', content: null },
        ],
      }),
    );
    expect(html).toContain('✓');
    expect(html).toContain('Accepted');
    expect(html).toContain('My edited rule.');
  });

  it('shows a declined template calmly with no re-prompt (no editor)', () => {
    const html = renderToStaticMarkup(
      createElement(PolicyTemplates, {
        policies: [
          { templateId: 'non-negotiables', status: 'pending', content: null },
          { templateId: 'work-boundaries', status: 'declined', content: null },
        ],
      }),
    );
    expect(html).toContain('Not added');
    expect(html).toContain('You can add this later');
    // The declined card must not re-present its editor: only the still-pending
    // non-negotiables template renders a textarea.
    expect((html.match(/<textarea/g) ?? []).length).toBe(1);
  });
});
