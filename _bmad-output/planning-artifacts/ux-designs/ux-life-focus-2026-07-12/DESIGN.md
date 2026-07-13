---
name: Life Focus Intelligence
description: Calm, whole-life planning intelligence for a single founding user. Editorial minimalism, not a productivity dashboard.
status: final
created: 2026-07-12
updated: 2026-07-12
sources:
  - imports/life_focus_intelligence/DESIGN.md
  # imports/life_focus_intelligence/DESIGN.md — Stitch identity artifact; referenced for visual lineage only; this DESIGN.md supersedes it.
  - imports/morning_whole_life_plan/code.html
  - imports/interrupt_decision_tradeoffs/code.html
  - ../../prds/prd-life-focus-2026-07-10/prd.md
  - ../../prds/prd-life-focus-2026-07-10/addendum.md
  - ../../../planning-artifacts/architecture/architecture-life-focus-2026-07-12/ARCHITECTURE-SPINE.md
colors:
  # ── Light mode ───────────────────────────────────────────────────────────────
  # Surface scale — warm stone, not clinical white
  light-surface: '#fcf9f3'
  light-surface-dim: '#dcdad4'
  light-surface-bright: '#fcf9f3'
  light-surface-container-lowest: '#ffffff'
  light-surface-container-low: '#f6f3ed'
  light-surface-container: '#f1ede7'
  light-surface-container-high: '#ebe8e2'
  light-surface-container-highest: '#e5e2dc'
  # On-surface text
  light-on-surface: '#1c1c18'
  light-on-surface-variant: '#424848'
  light-inverse-surface: '#31302d'
  light-inverse-on-surface: '#f3f0ea'
  # Outline / dividers — barely-there, not UI walls
  light-outline: '#727879'
  light-outline-variant: '#c2c7c8'
  # Primary — deep teal-sage; all primary actions, active nav state, protected indicators
  light-primary: '#17282a'
  light-on-primary: '#ffffff'
  light-primary-container: '#2d3e40'
  light-on-primary-container: '#96a9ab'
  light-inverse-primary: '#b7cacc'
  light-surface-tint: '#506164'
  # Primary fixed — tinted accents, pip backgrounds, selection highlights
  light-primary-fixed: '#d3e6e8'
  light-primary-fixed-dim: '#b7cacc'
  light-on-primary-fixed: '#0d1e20'
  light-on-primary-fixed-variant: '#394a4c'
  # Secondary — mid-warm gray; supporting text, labels, inactive icons
  light-secondary: '#5e5e5c'
  light-on-secondary: '#ffffff'
  light-secondary-container: '#e1dfdc'
  light-on-secondary-container: '#636360'
  light-secondary-fixed: '#e4e2df'
  light-secondary-fixed-dim: '#c8c6c4'
  light-on-secondary-fixed: '#1b1c1a'
  light-on-secondary-fixed-variant: '#474745'
  # Tertiary — near-black; for emphasis when additional contrast is needed
  light-tertiary: '#252525'
  light-on-tertiary: '#ffffff'
  light-tertiary-container: '#3b3b3b'
  light-on-tertiary-container: '#a7a5a5'
  light-tertiary-fixed: '#e4e2e1'
  light-tertiary-fixed-dim: '#c8c6c6'
  light-on-tertiary-fixed: '#1b1c1c'
  light-on-tertiary-fixed-variant: '#474747'
  # Feedback — suppressed; visible only at decision-critical moments
  light-error: '#ba1a1a'
  light-on-error: '#ffffff'
  light-error-container: '#ffdad6'
  light-on-error-container: '#93000a'
  # Background (alias of surface in this system)
  light-background: '#fcf9f3'
  light-on-background: '#1c1c18'
  light-surface-variant: '#e5e2dc'
  # Warning / attention tier — severity escalation alerts and capacity-at-risk only
  # Desaturated amber family; calm, not alarm. Never used for generic urgency.
  # Contrast notes (WCAG 2.1):
  #   light-on-warning-container (#92400e) on light-warning-container (#fef3c7): 6.37:1 ✓ AA body+icon
  #   light-warning-icon (#92400e) on light-warning-container (#fef3c7): 6.37:1 ✓ AA graphical (≥3:1)
  #   light-warning (#b45309) on light-surface (#fcf9f3): 4.58:1 ✓ AA body
  light-warning: '#b45309'
  light-warning-container: '#fef3c7'
  light-on-warning-container: '#92400e'
  light-warning-icon: '#92400e'
  # Success indicator — consequence-preserved icon in decision scenario cards
  # light-success-indicator (#2d6a4f) on light-surface (#fcf9f3): 5.53:1 ✓ AA body+icon
  light-success-indicator: '#2d6a4f'

  # ── Dark mode ─────────────────────────────────────────────────────────────────
  # Same warm-neutral + teal-sage hue family; warm charcoal surfaces, not pure black.
  # All dark tokens target WCAG AA contrast against their on-* counterpart.
  # Surface scale — dark warm charcoal with stone undertone
  dark-surface: '#1a1c1b'
  dark-surface-dim: '#131513'
  dark-surface-bright: '#383b39'
  dark-surface-container-lowest: '#0e1010'
  dark-surface-container-low: '#1c1f1e'
  dark-surface-container: '#202323'
  dark-surface-container-high: '#2b2e2d'
  dark-surface-container-highest: '#363938'
  # On-surface text — warm off-white, not blue-white
  dark-on-surface: '#e3e5e3'
  dark-on-surface-variant: '#c2c8c7'
  dark-inverse-surface: '#e3e5e3'
  dark-inverse-on-surface: '#2c2f2e'
  # Outline — visible but quiet
  dark-outline: '#8c9292'
  dark-outline-variant: '#3d4444'
  # Primary — teal-sage lifted for dark contrast; stays sage, stays warm
  dark-primary: '#b7cacc'
  dark-on-primary: '#0d1e20'
  dark-primary-container: '#394a4c'
  dark-on-primary-container: '#d3e6e8'
  dark-inverse-primary: '#17282a'
  dark-surface-tint: '#b7cacc'
  # Primary fixed
  dark-primary-fixed: '#d3e6e8'
  dark-primary-fixed-dim: '#b7cacc'
  dark-on-primary-fixed: '#0d1e20'
  dark-on-primary-fixed-variant: '#394a4c'
  # Secondary — mid-warm gray, readable on dark charcoal
  dark-secondary: '#c8c6c4'
  dark-on-secondary: '#303030'
  dark-secondary-container: '#474745'
  dark-on-secondary-container: '#e4e2df'
  dark-secondary-fixed: '#e4e2df'
  dark-secondary-fixed-dim: '#c8c6c4'
  dark-on-secondary-fixed: '#1b1c1a'
  dark-on-secondary-fixed-variant: '#474745'
  # Tertiary — light warm neutral for emphasis
  dark-tertiary: '#c8c6c6'
  dark-on-tertiary: '#313131'
  dark-tertiary-container: '#474747'
  dark-on-tertiary-container: '#e4e2e1'
  dark-tertiary-fixed: '#e4e2e1'
  dark-tertiary-fixed-dim: '#c8c6c6'
  dark-on-tertiary-fixed: '#1b1c1c'
  dark-on-tertiary-fixed-variant: '#474747'
  # Feedback — red family adjusted for dark background
  dark-error: '#ffb4ab'
  dark-on-error: '#690005'
  dark-error-container: '#93000a'
  dark-on-error-container: '#ffdad6'
  # Background
  dark-background: '#1a1c1b'
  dark-on-background: '#e3e5e3'
  dark-surface-variant: '#3d4444'
  # Warning / attention tier — dark mode
  # Contrast notes (WCAG 2.1):
  #   dark-on-warning-container (#fde68a) on dark-warning-container (#78350f): 9.43:1 ✓ AA
  #   dark-warning-icon (#fde68a) on dark-warning-container (#78350f): 9.43:1 ✓ AA graphical
  #   dark-warning (#fcd34d) on dark-surface (#1a1c1b): 10.22:1 ✓ AA
  dark-warning: '#fcd34d'
  dark-warning-container: '#78350f'
  dark-on-warning-container: '#fde68a'
  dark-warning-icon: '#fde68a'
  # Success indicator — dark mode
  # dark-success-indicator (#4ade80) on dark-surface (#1a1c1b): 10.88:1 ✓ AA
  dark-success-indicator: '#4ade80'

typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '500'
    lineHeight: '1.3'
  headline-md:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.4'
  headline-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 28px
    fontWeight: '500'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Public Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Public Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Public Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  label-caps:
    fontFamily: Public Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.08em

rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px

spacing:
  unit: 8px
  container-max: 1200px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
  section-gap: 64px

components:
  # ── Navigation ───────────────────────────────────────────────────────────────
  side-nav:
    width: 80px
    background-light: '{colors.light-surface}'
    background-dark: '{colors.dark-surface}'
    border-right-light: '1px solid {colors.light-outline-variant}'
    border-right-dark: '1px solid {colors.dark-outline-variant}'
    item-active-background-light: '{colors.light-surface-container}'
    item-active-background-dark: '{colors.dark-surface-container}'
    item-active-indicator: '2px solid right border — {colors.light-primary} light, {colors.dark-primary} dark'
    item-inactive-color-light: '{colors.light-secondary}'
    item-inactive-color-dark: '{colors.dark-secondary}'
    item-radius: '{rounded.xl}'
    label-style: '{typography.label-caps}'
    # Mobile bottom strip: center FAB for capture quick-add
    mobile-fab-radius: '{rounded.full}'
    mobile-fab-background-light: '{colors.light-primary}'
    mobile-fab-background-dark: '{colors.dark-primary}'
    mobile-fab-icon-color-light: '{colors.light-on-primary}'
    mobile-fab-icon-color-dark: '{colors.dark-on-primary}'
    mobile-fab-shadow: '0px 4px 20px rgba(0,0,0,0.08)'
    mobile-fab-note: 'Center FAB sits above the tab strip z-plane. Four surrounding tabs are standard icon tabs at strip level.'

  # ── Capacity chips ────────────────────────────────────────────────────────────
  # Five summary chips at top of Morning Plan: Work / Personal / Flexibility / Confidence / Unscheduled
  capacity-chip:
    background-light: '{colors.light-surface-container-highest}'
    background-dark: '{colors.dark-surface-container-highest}'
    border-light: '1px solid {colors.light-outline-variant} at 30% opacity'
    radius: '{rounded.xl}'
    padding: 16px
    label-style: '{typography.label-md}'
    label-color-light: '{colors.light-secondary}'
    label-color-dark: '{colors.dark-secondary}'
    value-style: '{typography.headline-md}'
    value-color-light: '{colors.light-on-background}'
    value-color-dark: '{colors.dark-on-background}'
    # Confidence chip: value color uses primary to signal trust level
    confidence-value-color-light: '{colors.light-primary}'
    confidence-value-color-dark: '{colors.dark-primary}'
    # Risk state: subline uses error token + warning icon shape (never color alone)
    risk-subline-color-light: '{colors.light-error}'
    risk-subline-color-dark: '{colors.dark-error}'
    risk-icon: warning (Material Symbols Outlined)
    risk-icon-color-light: '{colors.light-error}'
    risk-icon-color-dark: '{colors.dark-error}'
    hover-shadow: '0px 4px 20px rgba(0,0,0,0.04)'

  # ── Timeline ──────────────────────────────────────────────────────────────────
  timeline-rail:
    line-width: 1px
    line-color-light: '{colors.light-outline-variant}'
    line-color-dark: '{colors.dark-outline-variant}'
    left-offset: 15px
    top-offset: 24px

  domain-pip:
    size: 12px
    radius: '{rounded.full}'
    # Open pip — standard event
    border: '2px solid {colors.light-primary-container}'
    background-light: '{colors.light-surface}'
    background-dark: '{colors.dark-surface}'
    # Protected pip — hard commitment or protected priority; shape (filled) + aria-label
    protected-background-light: '{colors.light-primary-container}'
    protected-background-dark: '{colors.dark-primary-container}'
    protected-ring: '4px ring — {colors.light-primary-fixed} at 20% opacity'
    # Accessibility rule: shape (open/filled) and aria-label carry the protection signal; color is supplemental

  timeline-block:
    radius: '{rounded.xl}'
    padding: 20px
    # Standard block
    background-light: '{colors.light-surface}'
    background-dark: '{colors.dark-surface}'
    border-light: '1px solid {colors.light-outline-variant} at 50% opacity'
    hover-shadow: '0px 4px 20px rgba(0,0,0,0.04)'
    hover-lift: '-0.5px translate-y'
    # Priority / committed block
    background-committed-light: '{colors.light-surface-container-high}'
    background-committed-dark: '{colors.dark-surface-container}'
    # Hard-commitment block
    border-left-protected: '4px solid {colors.light-primary-container}'
    protection-badge-icon: lock
    protection-badge-style: '{typography.label-md}'
    protection-badge-color-light: '{colors.light-on-surface-variant}'
    # Inset "Why:" block inside priority blocks
    why-inset-background-light: '{colors.light-surface}'
    why-inset-background-dark: '{colors.dark-surface-container-low}'
    why-inset-border-light: '1px solid {colors.light-outline-variant} at 30% opacity'
    why-inset-radius: '{rounded.md}'
    why-inset-padding: 12px

  # ── Plan Intelligence aside ───────────────────────────────────────────────────
  glass-panel:
    background-light: 'rgba(252,249,243,0.7)'
    background-dark: 'rgba(26,28,27,0.75)'
    backdrop-filter: blur(12px)
    border-light: '1px solid rgba(229,226,220,0.5)'
    border-dark: '1px solid rgba(61,68,68,0.5)'
    radius: '{rounded.xl}'
    padding: 20px
    # Attention variant — hard risk; error left border
    attention-border-left: '4px solid {colors.light-error}'
    attention-label-color: '{colors.light-error}'
    # Warning variant — severity escalation (SEV tier change); amber left border
    warning-ribbon-color: '{colors.light-warning}'
    warning-ribbon-color-dark: '{colors.dark-warning}'
    warning-ribbon-background-light: '{colors.light-warning-container}'
    warning-ribbon-background-dark: '{colors.dark-warning-container}'
    # Usage context: glass-panel is used in BOTH Morning Plan (pre-approval) and Today
    # (post-approval) right-aside panel. The four-card structure persists in live day
    # view with updated real-time state. Not restricted to pre-approval only.

  plan-intelligence-panel:
    layout: sticky right aside; top offset 96px
    card-gap: 24px
    header-style: '{typography.headline-md}'
    section-label-style: '{typography.label-caps} uppercase'
    # Four cards in priority order:
    card-protects-icon: shield
    card-attention-icon: error
    card-risks-icon: warning
    card-not-scheduled-icon: snooze
    card-not-scheduled-opacity: '0.8'
    # "Intentionally not scheduled" items: struck-through text, not failure.
    # Strikethrough is a visual deprioritization signal only (not failure).
    # Screen reader rule: SR text must carry the full semantic label
    # "Intentionally not scheduled" since text-decoration is not announced by AT.
    not-scheduled-text-decoration: line-through
    not-scheduled-sr-label: 'Intentionally not scheduled —'
    # Risk bar: communicates % risk of overrun — never a "plan score"
    risk-bar-track-light: '{colors.light-surface-dim}'
    risk-bar-fill-light: '{colors.light-outline}'

  # ── Sticky action area ────────────────────────────────────────────────────────
  sticky-action-area:
    position: fixed bottom
    left-offset-desktop: 80px
    background-light: '{colors.light-surface} at 90% opacity'
    background-dark: '{colors.dark-surface} at 90% opacity'
    backdrop-filter: blur(12px)
    border-top-light: '1px solid {colors.light-outline-variant} at 30% opacity'
    shadow: '0 -4px 20px rgba(0,0,0,0.05)'
    padding: 16px
    button-approve:
      label: "Approve today's plan"
      background-light: '{colors.light-primary-container}'
      background-dark: '{colors.dark-primary-container}'
      text-light: '{colors.light-on-primary}'
      text-dark: '{colors.dark-on-primary-container}'
      # dark-on-primary-container (#d3e6e8) on dark-primary-container (#394a4c) = 7.20:1 ✓ AA
      radius: '{rounded.full}'
      padding: '10px 24px'
      style: '{typography.label-md}'
    button-modify:
      label: "Modify Plan"
      background: transparent
      border-light: '1px solid {colors.light-outline}'
      text-light: '{colors.light-on-background}'
      text-dark: '{colors.dark-on-background}'
      radius: '{rounded.full}'
      padding: '10px 24px'
      style: '{typography.label-md}'

  # ── Decision scenario cards ────────────────────────────────────────────────────
  # Interrupt Decision surface; cards embody P11 six-item consequence checklist
  decision-scenario-card:
    radius: '{rounded.xl}'
    padding: 24px
    background-standard-light: '{colors.light-surface-container-lowest}'
    background-standard-dark: '{colors.dark-surface-container-lowest}'
    border-standard-light: '1px solid {colors.light-outline-variant}'
    # Recommended variant
    background-recommended-light: '{colors.light-surface}'
    background-recommended-dark: '{colors.dark-surface}'
    border-recommended: '2px solid {colors.light-primary}'
    badge-recommended-background: '{colors.light-primary}'
    badge-recommended-text: '{colors.light-on-primary}'
    badge-recommended-style: '{typography.label-caps}'
    badge-recommended-position: top-right, rounded-bl corner
    # Error variant header
    header-error-color: '{colors.light-error}'
    # P11 consequence checklist items — shape + color (never color alone)
    consequence-preserved-icon: check_circle
    consequence-preserved-icon-color: '{colors.light-success-indicator}'
    consequence-preserved-icon-color-dark: '{colors.dark-success-indicator}'
    consequence-violated-icon: cancel
    consequence-violated-icon-color: '{colors.light-error}'
    consequence-neutral-icon: schedule or info (contextual)
    consequence-neutral-icon-color: '{colors.light-secondary}'
    consequence-text-style: '{typography.body-md}'
    consequence-text-color-light: '{colors.light-on-surface-variant}'
    hover-lift: '-1px translate-y'
    hover-shadow: '0px 4px 20px rgba(0,0,0,0.04)'
    select-button-label: "Select Option"
    select-button-radius: '{rounded.md}'
    select-button-border-light: '1px solid {colors.light-outline}'

  # ── Hard-conflict callout ─────────────────────────────────────────────────────
  hard-conflict-callout:
    background-light: '{colors.light-error-container} at 10% opacity'
    border-light: '1px solid {colors.light-error} at 20% opacity'
    radius: '{rounded.xl}'
    label-icon: block
    label-color: '{colors.light-error}'
    # Inner recommendation inset
    inset-background-light: '{colors.light-surface-container}'
    inset-background-dark: '{colors.dark-surface-container}'
    inset-border-left: '4px solid {colors.light-primary}'
    inset-label: '"Based on current information"'
    # FORBIDDEN: "Execute Recommendation" as button label — use "Choose this option" or "Accept recommendation"

  # ── Evidence drawer ────────────────────────────────────────────────────────────
  evidence-drawer:
    trigger: expandable row with chevron; collapsed by default
    animation-contract: 'Collapse/expand via CSS grid: grid-template-rows 0fr→1fr, transition 0.3s ease. Inner content wrapper uses overflow:hidden. Respects prefers-reduced-motion — transition-duration becomes 0ms when motion is reduced.'
    trigger-style: '{typography.label-md}'
    trigger-color-light: '{colors.light-secondary}'
    expanded-background-light: '{colors.light-surface-container-low}'
    expanded-background-dark: '{colors.dark-surface-container-low}'
    expanded-border-light: '1px solid {colors.light-outline-variant}'
    expanded-radius: '{rounded.lg}'
    expanded-padding: 16px
    # Contents per addendum §8
    source-badge-background-light: '{colors.light-surface-container-highest}'
    source-badge-radius: '{rounded.full}'
    source-badge-style: '{typography.label-md}'
    # Source-type icon taxonomy (Material Symbols Outlined):
    # issue-tracker: bug_report | document: description | article: article
    # compliance/security: security | calendar: event | email: mail
    source-badge-icon-taxonomy: 'bug_report (issue), description (doc), article (article), security (compliance), event (calendar), mail (email)'
    confidence-label: '"Based on current information (NN%)"'
    last-verified-style: '{typography.body-md}'
    last-verified-color-light: '{colors.light-secondary}'
    conflict-label-color: '{colors.light-error}'
    correction-label: user-override, underlined text

  # ── Domain chips (life domain classification tags) ────────────────────────────
  domain-chip:
    radius: '{rounded.full}'
    padding: '4px 8px'
    style: '{typography.label-md} text-xs'
    background-light: '{colors.light-surface-dim}'
    background-dark: '{colors.dark-surface-dim}'
    text-light: '{colors.light-on-surface}'
    text-dark: '{colors.dark-on-surface}'
    border-light: '1px solid {colors.light-outline-variant} at 50% opacity'
    # Protected-priority variant
    protected-background-light: '{colors.light-primary-container}'
    protected-text-light: '{colors.light-on-primary}'
    protected-icon: lock

  # ── Capture quick-add ─────────────────────────────────────────────────────────
  capture-quick-add:
    max-interactions: 2
    style: '{typography.body-md}'
    border-bottom-light: '1px solid {colors.light-outline-variant}'
    focus-border-bottom-light: '2px solid {colors.light-primary}'
    placeholder-color-light: '{colors.light-secondary}'
    submit-icon: send
    submit-color-light: '{colors.light-primary}'
    radius: '{rounded.md}'

  # ── Privacy scope badge ────────────────────────────────────────────────────────
  # Appears top-right corner of commitment cards sourced from private channels.
  # Signals trust scope without exposing content. (SEC-1, AC-14)
  privacy-scope-badge:
    position: top-right corner of parent card
    icon: lock
    label: 'Private Scope'
    style: '{typography.label-md}'
    background-light: '{colors.light-surface-container-highest}'
    background-dark: '{colors.dark-surface-container-highest}'
    text-light: '{colors.light-on-surface-variant}'
    text-dark: '{colors.dark-on-surface-variant}'
    radius: '{rounded.md}'
    padding: '4px 8px'

  # ── Source attribution header ─────────────────────────────────────────────────
  # Used in commitment ingestion cards (personal_commitment_school_notice pattern).
  source-attribution-header:
    icon: verified_user
    icon-color-light: '{colors.light-primary}'
    icon-color-dark: '{colors.dark-primary}'
    source-name-style: '{typography.label-md}'
    confidence-inline-style: '{typography.label-md}'
    confidence-inline-color-light: '{colors.light-secondary}'
    confidence-inline-color-dark: '{colors.dark-secondary}'
    confidence-format: '(NN% confidence)'

  # ── Recommendation panel (commitment ingestion) ───────────────────────────────
  # Distinct from plan-intelligence-panel. Used inside commitment detail cards.
  recommendation-panel:
    header-icon: lightbulb
    header-style: '{typography.label-md}'
    header-color-light: '{colors.light-on-surface}'
    header-color-dark: '{colors.dark-on-surface}'
    border-left: '4px solid {colors.light-primary}'
    border-left-dark: '4px solid {colors.dark-primary}'
    background-light: '{colors.light-surface-container-low}'
    background-dark: '{colors.dark-surface-container-low}'
    radius: '{rounded.xl}'
    padding: 16px
    action-item-prefix-icon: arrow_right
    action-item-style: '{typography.body-md}'

  # ── Trusted baseline badge ─────────────────────────────────────────────────────
  # Inline text pill in Context Review surface. Distinct from domain-chip:
  # no lock icon, no color, text-only pill. Marks verified source baselines.
  trusted-baseline-badge:
    radius: '{rounded.full}'
    padding: '2px 8px'
    style: '{typography.label-caps}'
    background-light: '{colors.light-surface-container-highest}'
    background-dark: '{colors.dark-surface-container-highest}'
    text-light: '{colors.light-on-surface-variant}'
    text-dark: '{colors.dark-on-surface-variant}'
    border: none
    icon: none

  # ── Person detail component anatomy ──────────────────────────────────────────
  # Surface #9 (People, v1.0). Layout idioms codified from person_detail_anna_fixed mock.
  person-detail:
    # Profile header
    avatar-size: 80px
    avatar-radius: '{rounded.full}'
    avatar-ring-light: '2px solid {colors.light-surface-variant}'
    avatar-ring-dark: '2px solid {colors.dark-surface-variant}'
    # Intention card — personal intent. border-l uses primary-container (NOT primary).
    # Distinguishes intent from system-protected commitments (which use primary border).
    intention-card-border-left: '4px solid {colors.light-primary-container}'
    intention-card-border-left-dark: '4px solid {colors.dark-primary-container}'
    intention-card-background-light: '{colors.light-surface-container-low}'
    intention-card-background-dark: '{colors.dark-surface-container-low}'
    intention-card-header-icon: favorite
    # Action vs. observation two-card pattern (side-by-side)
    action-card-background-light: '{colors.light-surface-container-high}'
    action-card-background-dark: '{colors.dark-surface-container-high}'
    action-card-hover-shadow: '0px 4px 20px rgba(0,0,0,0.04)'
    observation-card-background-light: '{colors.light-surface-container}'
    observation-card-background-dark: '{colors.dark-surface-container}'
    # Rhythms section: icon + text + frequency row
    rhythm-row-icon-color-light: '{colors.light-secondary}'
    rhythm-row-icon-color-dark: '{colors.dark-secondary}'
    rhythm-row-style: '{typography.body-md}'
    # Horizon/milestone items
    horizon-border-left: '4px solid {colors.light-primary-container}'
    horizon-border-left-dark: '4px solid {colors.dark-primary-container}'
    horizon-background-light: '{colors.light-surface-container-low}'
    horizon-background-dark: '{colors.dark-surface-container-low}'
    horizon-time-badge-radius: '{rounded.full}'
    # Open commitments list
    open-commitment-row-icon: radio_button_unchecked
    open-commitment-hover-reveal-action: true
    # Accessibility rule: intention-card uses primary-container left border (not primary)
    # to distinguish personal intent from system-protected hard commitments.

  # ── Interrupt context panel ────────────────────────────────────────────────────
  # Incident/interrupt metadata grid above decision scenario cards.
  # Fluid grid of label+value pairs. Labels in label-caps; values in body-md.
  interrupt-context-panel:
    layout: 'fluid grid, 2–5 columns depending on viewport'
    background-light: '{colors.light-surface-container-low}'
    background-dark: '{colors.dark-surface-container-low}'
    radius: '{rounded.xl}'
    padding: 16px
    label-style: '{typography.label-caps}'
    label-color-light: '{colors.light-secondary}'
    label-color-dark: '{colors.dark-secondary}'
    value-style: '{typography.body-md}'
    value-color-light: '{colors.light-on-surface}'
    value-color-dark: '{colors.dark-on-surface}'

  # ── Evidence layer footer ─────────────────────────────────────────────────────
  # Non-expandable footer summary bar below decision scenario cards.
  # Different from the expandable evidence-drawer — this is always visible.
  evidence-layer-footer:
    icon: verified_user
    icon-color-light: '{colors.light-secondary}'
    icon-color-dark: '{colors.dark-secondary}'
    text-style: '{typography.body-md}'
    text-color-light: '{colors.light-secondary}'
    text-color-dark: '{colors.dark-secondary}'
    confidence-format: 'Based on current information (NN%)'
    position: 'below scenario card grid, above sticky action area'

  # ── Severity badge ────────────────────────────────────────────────────────────
  # Inline dot + label for SEV tier display in interrupt/alert contexts.
  severity-badge:
    dot-size: 8px
    dot-radius: '{rounded.full}'
    label-style: '{typography.label-md}'
    # SEV-1 (critical): error color dot
    sev1-dot-color-light: '{colors.light-error}'
    sev1-dot-color-dark: '{colors.dark-error}'
    # SEV-2 (warning): warning color dot
    sev2-dot-color-light: '{colors.light-warning}'
    sev2-dot-color-dark: '{colors.dark-warning}'
    aria-rule: 'severity-badge requires aria-label with full severity text (e.g., aria-label="Severity 2")'

  # ── Focus ring ────────────────────────────────────────────────────────────────
  # Global focus-visible ring. Applied to ALL interactive elements. Never removed.
  # WCAG 2.4.13-compatible: ≥2px, ≥3:1 contrast against adjacent colors.
  # light-primary (#17282a) on light-surface (#fcf9f3): 16.26:1 — far exceeds 3:1 ✓
  # dark-primary (#b7cacc) on dark-surface (#1a1c1b): 8.67:1 ✓
  focus-ring:
    width: 2px
    offset: 2px
    color-light: '{colors.light-primary}'
    color-dark: '{colors.dark-primary}'
    style: 'outline: 2px solid; outline-offset: 2px'
    rule: 'Applied via :focus-visible selector only — never :focus — on all interactive elements. Not clipped by overflow:hidden or border-radius on the parent. On dark-surface sidebars, color-dark applies automatically via theme class.'

  # ── State chips (commitment/request status vocabulary) ────────────────────────
  # The status/state-chip vocabulary for Commitment Ledger, Capture Inbox, and
  # at-risk contexts. Icon + text label MANDATORY — color is supplemental, never sole.
  # All pairs WCAG AA verified in both themes.
  state-chip:
    radius: '{rounded.full}'
    padding: '3px 8px'
    style: '{typography.label-caps}'
    icon-required: true
    icon-position: leading
    # Accepted — calm teal-adjacent
    # light: #0369a1 on #e0f2fe = 5.17:1 ✓ AA | dark: #bae6fd on #0c4a6e = 9.11:1 ✓
    accepted-bg-light: '#e0f2fe'
    accepted-text-light: '#0369a1'
    accepted-icon-light: 'check_circle'
    accepted-bg-dark: '#0c4a6e'
    accepted-text-dark: '#bae6fd'
    accepted-icon-dark: 'check_circle'
    # In progress — muted green
    # light: #065f46 on #d1fae5 = 6.78:1 ✓ | dark: #a7f3d0 on #064e3b = 9.67:1 ✓
    in-progress-bg-light: '#d1fae5'
    in-progress-text-light: '#065f46'
    in-progress-icon-light: 'pending'
    in-progress-bg-dark: '#064e3b'
    in-progress-text-dark: '#a7f3d0'
    in-progress-icon-dark: 'pending'
    # Waiting (on others)
    # light: #5b21b6 on #ede9fe = 7.57:1 ✓ | dark: #ddd6fe on #3b0764 = 10.54:1 ✓
    waiting-bg-light: '#ede9fe'
    waiting-text-light: '#5b21b6'
    waiting-icon-light: 'hourglass_empty'
    waiting-bg-dark: '#3b0764'
    waiting-text-dark: '#ddd6fe'
    waiting-icon-dark: 'hourglass_empty'
    # Waiting on you (action required)
    # light: #c2410c on #fff7ed = 4.88:1 ✓ | dark: #fed7aa on #7c2d12 = 8.83:1 ✓
    waiting-on-you-bg-light: '#fff7ed'
    waiting-on-you-text-light: '#c2410c'
    waiting-on-you-icon-light: 'priority_high'
    waiting-on-you-bg-dark: '#7c2d12'
    waiting-on-you-text-dark: '#fed7aa'
    waiting-on-you-icon-dark: 'priority_high'
    # At risk — amber warning tier (uses warning tokens)
    # light: light-on-warning-container (#92400e) on light-warning-container (#fef3c7) = 6.37:1 ✓
    # dark: dark-on-warning-container (#fde68a) on dark-warning-container (#78350f) = 9.43:1 ✓
    at-risk-bg-light: '{colors.light-warning-container}'
    at-risk-text-light: '{colors.light-on-warning-container}'
    at-risk-icon-light: 'warning'
    at-risk-bg-dark: '{colors.dark-warning-container}'
    at-risk-text-dark: '{colors.dark-on-warning-container}'
    at-risk-icon-dark: 'warning'
    # Fulfilled — muted, NOT dimmed by opacity (see a11y M-4 fix: no opacity dimming)
    # Uses on-surface-variant at full opacity. light: #424848 on #e5e2dc = 7.21:1 ✓
    # dark: #c2c8c7 on #363938 = 6.88:1 ✓
    fulfilled-bg-light: '{colors.light-surface-container-highest}'
    fulfilled-text-light: '{colors.light-on-surface-variant}'
    fulfilled-icon-light: 'check'
    fulfilled-bg-dark: '{colors.dark-surface-container-highest}'
    fulfilled-text-dark: '{colors.dark-on-surface-variant}'
    fulfilled-icon-dark: 'check'
    # Accessibility rules:
    # - Each chip requires aria-label with full state name (e.g. aria-label="Status: At risk")
    # - aria-pressed or aria-selected when chip is interactive/selectable
    # - Non-color companion (icon) is mandatory — chip MUST NOT rely on color alone
    # Muted / archived state rule (replaces opacity idiom — a11y M-4):
    # Fulfilled/archived commitments use fulfilled-* tokens at FULL opacity. Do NOT apply
    # opacity < 1 to the entire card — this fails WCAG AA for meta and secondary text sizes.
---

## Brand & Style

Life Focus Intelligence is not a productivity tool. It is a calm, intelligent steward of Sean's attention — the first interface opened in the morning, the place consulted when circumstances change, the bridge between long-term intentions and daily action. The visual language must carry that weight without adding to it.

The aesthetic is **Editorial Minimalism with a Deliberate Living philosophy**: warm stone surfaces that recede behind the content; a single deep teal-sage brand color that signals action without demanding it; Playfair Display headlines that carry the quiet authority of a thoughtful briefing; Public Sans body text that is legible, neutral, and present without competing. Every surface should feel like a well-composed page, not a dashboard.

The emotional register is quiet confidence. The UI never competes with the plan it is presenting. It informs, surfaces tradeoffs, and then waits for Sean to decide. The product should feel: calm, intelligent, warm, human, disciplined, trustworthy, premium, focused, reassuring, decisive without being controlling.

What this product is not, visually: a crowded CRM, a colorful habit-tracker, a gamified score card, a chatbot interface, an autonomous agent console, or a corporate admin panel. If a surface produces any of those feelings, it is wrong.

## Colors

The palette is organized into two complete mode sets — light and dark — derived from the same warm-neutral + teal-sage hue family. Tokens are named with `light-*` and `dark-*` prefixes; components reference the appropriate mode prefix based on the active theme class.

**Light mode anchor colors:**

The **warm stone surface scale** (`light-surface: #fcf9f3` through `light-surface-container-highest: #e5e2dc`) is the primary canvas. Slightly warm to reduce clinical harshness; the five-step container scale creates tonal layering without heavy borders or drop shadows.

The **deep teal-sage primary** (`light-primary: #17282a` / container `#2d3e40`) is the brand color. Used exclusively for primary actions, active navigation state, protected commitment indicators, and recommendation callouts. Never used decoratively. It communicates agency and trust — it should only appear where Sean is being asked to act or where the system is signaling something protected.

The **mid-warm gray secondary** (`light-secondary: #5e5e5c`) carries supporting text, labels, inactive icons, and sublines. Warm rather than blue-gray to stay within the stone palette.

**Feedback colors** are suppressed. `light-error: #ba1a1a` appears only when a hard boundary is at risk or a hard conflict is detected. It is never used for decorative emphasis or urgency signaling.

**Dark mode derivation:** dark surfaces use warm charcoal (`dark-surface: #1a1c1b` family) — the stone-family warmth applied to darkness; never pure black. Teal-sage inverts: deep teal in light lifts to sage-pale (`dark-primary: #b7cacc`) in dark for readable contrast. Secondary grays warm slightly. Error becomes `dark-error: #ffb4ab` for dark-background legibility. All dark tokens verified at WCAG AA against their on-* counterpart.

**What colors are not for:** domain indicators (life domains) use desaturated chip backgrounds and domain-pip shapes — not a loud chromatic palette. Status is never conveyed by color alone: domain pips use open/filled shape distinction; consequence checklist items use icon shape (check_circle vs. cancel) in addition to color.

## Typography

Two fonts, two clear roles, no drift between them.

**Playfair Display** is the editorial voice — the voice of the morning plan heading, the interrupt decision title, major section dividers that deserve weight. It appears in `display-lg` (48px, the daily greeting), `headline-lg` (32px, major sections), `headline-md` (24px, subsections), and `headline-lg-mobile` (28px, phone breakpoints). It is never used for body copy, labels, or navigation elements. Its authority depends on rarity.

**Public Sans** is everything else. Institutional, neutral, legible at every size. It carries `body-lg` (18px lead text), `body-md` (16px body copy), `label-md` (14px / 600 weight / 0.05em tracking for chips, buttons, and nav labels), and `label-caps` (12px / 600 / 0.08em / uppercase for Plan Intelligence section headers).

Line height is 1.6x on all body sizes. Planning content is dense; generous leading prevents it from reading as a spreadsheet.

Letter spacing: negative on `display-lg` (-0.02em) for optical tightening at large sizes; positive on `label-md` (0.05em) and `label-caps` (0.08em) for legibility at small sizes.

## Layout & Spacing

**Desktop:** Fixed-center grid, 1200px max-width, 12 columns. The most common division is 8+4 (67/33 split): timeline on the left, Plan Intelligence panel on the right. The aside is `sticky top-24` so intelligence context remains visible while the timeline scrolls.

**Spacing scale:** 8px base unit. Named tokens: `unit` (8px), `gutter` (24px, between grid columns and cards), `section-gap` (64px, between major content sections), `margin-mobile` (16px), `margin-desktop` (40px). The 64px section gap is intentionally generous — breathing room is the plan's first communication that today is manageable.

**Breakpoints:** At `lg` (1024px+) the 8+4 split and side navigation are both visible. Below `lg`, the timeline goes full-width and the Plan Intelligence panel stacks below. Below `md` (768px), the side navigation becomes a bottom tab strip; main content uses `margin-mobile` gutters throughout.

No horizontal scroll on any surface. No fixed-height scroll containers that clip content. A surface that feels crowded should get more vertical space before any other solution is tried.

## Elevation & Depth

Depth is achieved through **tonal surface layering**, not shadow stacking.

The five-step `surface-container` scale separates content levels without visible borders. A capacity chip lives on `surface-container-highest`. A standard timeline block lives on `surface` (base). Plan Intelligence cards use glassmorphism (`rgba` fill + `blur(12px)`) — the only use of blur in the system, reserved for sticky context overlays.

Shadow language is deliberately quiet: `0px 4px 20px rgba(0,0,0,0.04)` on hover states only. Nothing is elevated by default. Timeline blocks and scenario cards lift `-0.5–1px` translate-y on hover to signal interactivity without animation noise.

Hard commitment blocks and recommended scenario cards receive a 4px solid left border in `primary-container` — not a drop shadow, but a structural emphasis line. This is the strongest depth signal in the system and is reserved for those two contexts only.

## Shapes

The corner radius language is **soft-but-structured**:

- `rounded.sm` (0.125rem / 2px) — micro elements, subtle dividers
- `rounded.DEFAULT` (0.25rem / 4px) — inline insets (the "Why:" block inside a timeline card)
- `rounded.md` (0.375rem / 6px) — capture quick-add input, secondary small UI elements, scenario card select buttons
- `rounded.lg` (0.5rem / 8px) — evidence drawer expanded state
- `rounded.xl` (0.75rem / 12px) — timeline blocks, capacity chips, glass panels, scenario cards, bento cards — the default card radius
- `rounded.full` (9999px) — domain chips, status badges, avatars, conflict-detected badge, primary action button ("Approve today's plan")

The pill/full-circle shape signals classification or single-action affordance. The `rounded.xl` card shape signals content container. The distinction is deliberate: a card should never look like a pill.

## Components

See frontmatter `components` object for all token-level specifications. Narrative intent for each:

**Side nav** — 80px wide icon rail, icon + `label-caps` label below each item. Active item: `surface-container` fill + 2px primary right border (light) or 2px `dark-primary` right border (dark). No hamburger menu on desktop. On mobile, replaced by a 4-tab bottom strip. Tab set per EXPERIENCE.md information architecture.

**Capacity chips** — five across the top of Morning Plan: Work, Personal, Flexibility, Confidence, Unscheduled. Value in `headline-md`. Confidence chip uses `primary` color for the value only — it signals the plan's trust level. Risk state uses error-color subline + warning icon shape. The chips communicate available capacity before Sean reads a single timeline block.

**Timeline with domain pips** — a 1px `outline-variant` vertical rail; 12px pips at each block. Open pip (teal border, warm fill) = standard event. Filled pip (solid teal) = hard commitment or protected priority. The distinction is shape (fill state) + aria-label, never color alone. Protected blocks also receive a 4px primary-container left border + lock icon badge for additional confirmation. The "Why:" inset inside priority blocks shows the planning rationale inline — not behind a tooltip, always visible.

**Plan Intelligence panel** — four glass-panel cards in a sticky right aside: "What this plan protects" (shield icon), "Needs attention" (error left border, error icon), "Plan risks" (confidence bar — % risk of overrun, not a score), "Intentionally not scheduled" (snooze icon, struck-through items, 0.8 opacity). SEV-tier escalations add the amber `warning-ribbon` glass-panel variant — distinct from the error-bordered "Needs attention" card, which is reserved for hard-boundary risk. Section labels use `label-caps` uppercase. This panel is the system's editorial voice and must stay measured, specific, and grounded.

**Sticky action area** — fixed bottom, offset by 80px nav rail on desktop. Two buttons only: "Modify Plan" (outlined ghost, `rounded.full`) and "Approve today's plan" (primary fill, `rounded.full`, checkmark icon). Approval is always an explicit affirmative. No auto-approve. No "Done." No "Execute."

**Decision scenario cards** — grid of up to 4 options on the Interrupt Decision surface. Recommended card: 2px `primary` ring + "RECOMMENDED" `label-caps` badge (top-right corner, rounded-bl). Each card body implements the P11 six-item consequence checklist: preserved → `check_circle` icon (green tint), violated → `cancel` icon (error color), neutral → contextual icon (secondary). The "Select Option" button is a decision prompt; the user remains in control.

**Hard-conflict callout** — the bento card that surfaces a hard-boundary violation. `error-container` tinted fill, `error`-color label with `block` icon. The inner recommendation inset uses a `primary` left border. Inset label copy: "Based on current information." Button label: "Choose this option" or "Accept recommendation" — never "Execute Recommendation."

**Evidence drawer** — collapsed by default below every major recommendation. Chevron trigger in `label-md` / `secondary` color. Expanded state: `surface-container-low` background, source badges, confidence phrase, last-verified timestamp, expandable evidence list, assumptions, conflicts, user corrections. Every assertion carries its source — no unexplained number appears without provenance.

**Domain chips** — desaturated `rounded.full` classification tags. Standard: `surface-dim` fill, standard text. Protected priority: `primary-container` fill + lock icon + `on-primary` text. Domain affiliation is orientation only, not a ranked hierarchy.

**Capture quick-add** — maximum 2 interactions: one tap to focus, one Enter/tap to submit. Minimal underline border, no card chrome, `body-md` input text.

## Do's and Don'ts

| Do | Don't |
|---|---|
| Prefix confidence statements with "Based on current information" | Use "AI knows," "the system has determined," or "objective priority" |
| Use decision language: "Choose this option," "Accept recommendation," "Approve today's plan" | Use machine language: "Execute Recommendation," "Optimize," "Auto-schedule" |
| Display confidence as a descriptive phrase + sourced percentage: "Based on current information (81%)" | Surface an unexplained numeric score, a "productivity score," or a "utility score" |
| Frame goal-neglect neutrally: "Your health goal hasn't received scheduled time for 12 days" | Use guilt mechanics, streaks, or language that implies moral failure |
| Convey status through shape + icon + label (domain pips: open = standard, filled = protected) | Convey status through color alone — colorblind users must receive the same information |
| Use `{colors.light-primary}` / `{colors.dark-primary}` only for primary actions, active state, and protected indicators | Use teal-sage decoratively on backgrounds, dividers, or non-interactive chrome |
| Use `{colors.light-error}` only for hard-boundary violations and hard conflicts | Use red for urgency, emphasis, or decorative alerts |
| Label unscheduled items as "Intentionally not scheduled" | Label them "skipped," "failed," or use strikethrough as an implicit failure signal |
| Use `rounded.full` (pill) for classification labels, badges, and single primary action | Apply pill radius to content cards — it reads as a label, not a container |
| Use `0px 4px 20px rgba(0,0,0,0.04)` shadow on hover only | Add drop shadows to cards by default; tonal layering alone creates the depth hierarchy |
| Hard stop copy is always 4:30 PM | Use 5:20 PM as Sean's work-end time (the Stitch mock copy was wrong; PRD §8 wins) |
| Delegate option label is "Delegate" — surface it only at v1.0 when the delegation model ships | Show "Delegate" in MVP scenario cards (MVP interrupt loop defers delegation per §7.2) |
| Surface relationship impact by naming the affected person and what they must do | Claim to know another person's internal state or compute a "relationship health" score |
| Keep both light and dark token sets complete; every component specifies both | Leave any component without a specified dark-mode token |
| Respect `prefers-color-scheme` on first load; no theme flash | Flash the wrong theme on initial paint |
| Use "knowledge graph" only as an internal implementation term | Surface "knowledge-graph score" to the user |
| Show "Needs a decision," "Waiting on you," "Intentionally not scheduled," "Repeatedly displaced," "Best remaining opening," "Work ends at," "Based on current information" | Use "optimized life," "AI knows," "relationship health," "productivity score" |
