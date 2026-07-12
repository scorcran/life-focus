---
name: Life Focus Intelligence
colors:
  surface: '#fcf9f3'
  surface-dim: '#dcdad4'
  surface-bright: '#fcf9f3'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3ed'
  surface-container: '#f1ede7'
  surface-container-high: '#ebe8e2'
  surface-container-highest: '#e5e2dc'
  on-surface: '#1c1c18'
  on-surface-variant: '#424848'
  inverse-surface: '#31302d'
  inverse-on-surface: '#f3f0ea'
  outline: '#727879'
  outline-variant: '#c2c7c8'
  surface-tint: '#506164'
  primary: '#17282a'
  on-primary: '#ffffff'
  primary-container: '#2d3e40'
  on-primary-container: '#96a9ab'
  inverse-primary: '#b7cacc'
  secondary: '#5e5e5c'
  on-secondary: '#ffffff'
  secondary-container: '#e1dfdc'
  on-secondary-container: '#636360'
  tertiary: '#252525'
  on-tertiary: '#ffffff'
  tertiary-container: '#3b3b3b'
  on-tertiary-container: '#a7a5a5'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d3e6e8'
  primary-fixed-dim: '#b7cacc'
  on-primary-fixed: '#0d1e20'
  on-primary-fixed-variant: '#394a4c'
  secondary-fixed: '#e4e2df'
  secondary-fixed-dim: '#c8c6c4'
  on-secondary-fixed: '#1b1c1a'
  on-secondary-fixed-variant: '#474745'
  tertiary-fixed: '#e4e2e1'
  tertiary-fixed-dim: '#c8c6c6'
  on-tertiary-fixed: '#1b1c1c'
  on-tertiary-fixed-variant: '#474747'
  background: '#fcf9f3'
  on-background: '#1c1c18'
  surface-variant: '#e5e2dc'
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
  headline-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 28px
    fontWeight: '500'
    lineHeight: '1.3'
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
---

## Brand & Style
The design system is rooted in a philosophy of **Deliberate Living**. It prioritizes a premium, calm, and intelligent atmosphere for users navigating the complexities of whole-life planning. The aesthetic is "Sophisticated Minimalist," blending the intellectual depth of editorial design with the functional clarity of modern productivity tools. 

The emotional response should be one of "quiet confidence." By utilizing generous whitespace and a restrained color palette, the UI recedes to allow the user’s life goals and plans to take center stage. Every interaction is intentional, avoiding the frantic density of traditional project management tools in favor of a reflective, human-centric experience.

## Colors
The palette is built on a foundation of **Warm Neutrals**. The primary background uses a soft stone/beige (`#F7F5F2`) to reduce eye strain and feel more organic than a stark white. 

- **Primary Accent:** A deep, muted Teal/Sage (`#2D3E40`) used for primary actions and brand presence.
- **Typography:** Charcoal (`#2D2D2D`) provides high legibility while maintaining a softer contrast than pure black.
- **Domain Indicators:** These are desaturated and used as small visual cues (pips or thin borders) to categorize life areas without overwhelming the calm aesthetic.
- **Feedback:** Colors are suppressed. Red/Amber/Green appear only when a user's "Capacity" is at risk or a hard conflict occurs in their schedule.

## Typography
The typography system uses a high-contrast pairing to evoke intelligence and clarity. 

- **Headlines:** `Playfair Display` provides an authoritative, editorial feel. Use it for page titles, major section headers, and significant life milestones.
- **Body & UI:** `Public Sans` was selected for its institutional clarity and neutral stance. It ensures that complex data remains readable and accessible.
- **Rhythm:** Use ample line height (1.6x) for body text to maintain the "airy" and calm feel of the system.

## Layout & Spacing
The layout follows a **Fixed Center Grid** for desktop to prevent content from becoming overly dispersed on wide monitors, maintaining a focused "workspace" feel.

- **Desktop:** 12-column grid with a 1200px max-width.
- **Tablet:** 8-column grid with fluid margins.
- **Mobile:** 4-column grid with 16px margins.

The spacing rhythm is generous. Avoid cramming information; if a view feels "busy," increase the vertical section gap. The "Life Timeline" component should use a fluid horizontal axis to represent time, while all other content cards adhere to the grid.

## Elevation & Depth
Depth in this design system is achieved through **Subtle Layering** rather than heavy shadows. 

1.  **Base Layer:** The soft stone background (`#F7F5F2`).
2.  **Card Layer:** Off-white surfaces with a very fine 1px border (`#EBE8E2`).
3.  **Active/Hover State:** A soft, diffused shadow (0px 4px 20px rgba(0,0,0,0.04)) to indicate interactivity.

Avoid "stacked" cards more than two levels deep. Use backdrop blurs (Glassmorphism) only for sticky navigation bars to maintain context of the content scrolling beneath.

## Shapes
The shape language is **Soft but Structured**. Using a `0.25rem` (4px) base radius for inputs and small elements, and `0.5rem` (8px) for cards, ensures the UI feels approachable without becoming overly "bubbly" or juvenile. This maintains the professional, intelligent tone required for a life-planning system.

## Components
- **Primary Buttons:** Solid Teal/Sage (`#2D3E40`) with white text. High contrast, distinct from the background.
- **Secondary Buttons:** Ghost style with a fine charcoal border.
- **Scenario Comparison Cards:** Two or more containers side-by-side with a subtle vertical divider. Use these to show "Plan A" vs "Plan B" life paths.
- **Timeline:** A thin charcoal line with "Domain Pips" (small colored circles) to indicate events. The line weight should be 1px.
- **Sticky Action Area:** Usually at the bottom of the viewport on mobile or right-aligned on desktop, these areas use a soft blur background to remain prominent without blocking content.
- **Input Fields:** Minimalist. Underlined or very subtle borders. Focus states should use the primary teal color for the cursor and a slightly thickened bottom border.
- **Chips:** Small, pill-shaped labels for domains using the desaturated domain palette with dark text.