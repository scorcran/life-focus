/**
 * Protection-level presentation catalog (host layer, AD-1). The canonical level
 * id SET lives in `@life-focus/ledger` (`PROTECTION_LEVELS`); the plain-language
 * label, meaning shown at the moment of selection, and the non-color glyph live
 * here in the host. Copy obeys EXPERIENCE.md calm voice — no guilt, cheerleading,
 * gamification, or forbidden words.
 *
 * Each level's glyph is a monochrome, `aria-hidden` marker (conceptually
 * lock / shield / tune / spark). The VISIBLE text label carries the semantic;
 * protection status is NEVER conveyed by color alone.
 */
import { PROTECTION_LEVELS, WEEKDAYS, type ProtectionLevel, type Weekday } from '@life-focus/ledger';

/** The presentation content for one protection level. */
export interface ProtectionLevelContent {
  readonly id: ProtectionLevel;
  /** The short, plain-language level name (the semantic carrier). */
  readonly label: string;
  /** The plain-language meaning shown at the moment of selection (calm voice). */
  readonly meaning: string;
  /** A monochrome, aria-hidden glyph paired with the label — never color-alone. */
  readonly icon: string;
}

/** Content lookup keyed by level id. */
export const PROTECTION_LEVEL_CONTENT: Record<ProtectionLevel, ProtectionLevelContent> = {
  'hard-commitment': {
    id: 'hard-commitment',
    label: 'Hard commitment',
    meaning: 'Should not move except for a genuine emergency.',
    // lock
    icon: '▮',
  },
  'protected-priority': {
    id: 'protected-priority',
    label: 'Protected priority',
    meaning: 'Held firmly, and moved only after a deliberate decision from you.',
    // shield
    icon: '◈',
  },
  'flexible-intention': {
    id: 'flexible-intention',
    label: 'Flexible intention',
    meaning: 'Something you mean to do — it can shift when the day needs it to.',
    // tune
    icon: '◐',
  },
  'optional-opportunity': {
    id: 'optional-opportunity',
    label: 'Optional opportunity',
    meaning: 'Nice to reach if there is room; the first to give way when there is not.',
    // spark
    icon: '✦',
  },
};

/**
 * The four protection levels in canonical order, keyed off `PROTECTION_LEVELS`
 * so the order here can never drift from the core set.
 */
export const PROTECTION_LEVEL_OPTIONS: readonly ProtectionLevelContent[] = PROTECTION_LEVELS.map(
  (id) => PROTECTION_LEVEL_CONTENT[id],
);

/** The presentation content for a level id. */
export function protectionLevelContent(id: ProtectionLevel): ProtectionLevelContent {
  return PROTECTION_LEVEL_CONTENT[id];
}

/** Plain-language weekday labels, keyed off the canonical `WEEKDAYS` order. */
export const WEEKDAY_LABEL: Record<Weekday, string> = {
  mon: 'Mon',
  tue: 'Tue',
  wed: 'Wed',
  thu: 'Thu',
  fri: 'Fri',
  sat: 'Sat',
  sun: 'Sun',
};

/** The seven weekdays as `{ id, label }`, in canonical Monday-first order. */
export const WEEKDAY_OPTIONS: readonly { readonly id: Weekday; readonly label: string }[] =
  WEEKDAYS.map((id) => ({ id, label: WEEKDAY_LABEL[id] }));

/** A calm summary of a weekly recurrence, e.g. "Repeats weekly: Thu, Fri". */
export function recurrenceSummary(daysOfWeek: readonly Weekday[]): string {
  const labels = WEEKDAYS.filter((d) => daysOfWeek.includes(d)).map((d) => WEEKDAY_LABEL[d]);
  return `Repeats weekly: ${labels.join(', ')}`;
}
