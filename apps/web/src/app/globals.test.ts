import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

// The "byte-identical" gate: globals.css must carry the EXACT DESIGN.md light
// tokens and type specs. Rather than spot-check a curated handful, we parse the
// design contract (DESIGN.md) itself and assert every `light-*` color token is
// present verbatim as a CSS custom property — so any drift, typo, or omission
// fails this test in lockstep with the source of truth.
const here = dirname(fileURLToPath(import.meta.url));
const css = readFileSync(resolve(here, 'globals.css'), 'utf8');
const designMd = readFileSync(
  resolve(
    here,
    '../../../../_bmad-output/planning-artifacts/ux-designs/ux-life-focus-2026-07-12/DESIGN.md',
  ),
  'utf8',
);

// Extract `light-name: '#hex'` pairs from the DESIGN.md `colors:` frontmatter.
const designLightTokens: Array<[string, string]> = [
  ...designMd.matchAll(/^\s+(light-[a-z0-9-]+):\s*'(#[0-9a-fA-F]{6})'/gm),
].map((m) => [m[1], m[2]] as [string, string]);

/** Return the body between `selector {` and the next `}` in globals.css. */
function ruleBody(selector: string): string {
  const start = css.indexOf(`${selector} {`);
  if (start === -1) return '';
  const open = css.indexOf('{', start);
  const close = css.indexOf('}', open);
  return css.slice(open + 1, close);
}

describe('globals.css design tokens (byte-identical to DESIGN.md)', () => {
  it('parsed a full light-token set from DESIGN.md', () => {
    // Guard: the DESIGN.md frontmatter defines exactly 52 light-* color tokens.
    // If this drops, the regex broke and the byte-identical gate below is hollow.
    expect(designLightTokens.length).toBe(52);
  });

  it.each(designLightTokens)(
    'defines --%s: %s exactly (byte-identical to DESIGN.md)',
    (name, hex) => {
      expect(css).toContain(`--${name}: ${hex};`);
    },
  );

  it('carries the display-lg type spec (Playfair 48px/600/-0.02em) in its own rule', () => {
    const body = ruleBody('.display-lg');
    expect(body).toContain('font-size: 48px;');
    expect(body).toContain('font-weight: 600;');
    expect(body).toContain('letter-spacing: -0.02em;');
  });

  it('carries the label-caps type spec (12px/600/0.08em/uppercase) in its own rule', () => {
    const body = ruleBody('.label-caps');
    expect(body).toContain('font-size: 12px;');
    expect(body).toContain('font-weight: 600;');
    expect(body).toContain('letter-spacing: 0.08em;');
    expect(body).toContain('text-transform: uppercase;');
  });

  it('applies the focus ring via :focus-visible only (never :focus)', () => {
    expect(css).toContain(':focus-visible {');
    expect(css).toContain('outline: 2px solid var(--light-primary);');
    expect(css).toContain('outline-offset: 2px;');
    // Guard against a bare `:focus {` rule sneaking in.
    expect(css).not.toMatch(/[^-]:focus\s*\{/);
  });

  it('ships LIGHT tokens only for Story 1.2 (no dark-* tokens yet)', () => {
    expect(css).not.toContain('--dark-');
  });
});
