/**
 * Important-people presentation catalog (host layer, AD-1). The canonical
 * importance id SET lives in `@life-focus/ledger` (`PERSON_IMPORTANCE`); the
 * plain-language label, the meaning shown at the moment of selection, and the
 * non-color glyph live here in the host. Copy obeys EXPERIENCE.md calm voice —
 * no guilt, cheerleading, gamification, scoring language, or forbidden words.
 *
 * FR-12 / P5: `importance` is a user-asserted closeness label, NOT a score.
 * Each glyph is a monochrome, `aria-hidden` marker; the VISIBLE text label
 * carries the semantic, so status is NEVER conveyed by color alone.
 */
import {
  PERSON_IMPORTANCE,
  WEEKDAYS,
  type PersonImportance,
  type Weekday,
} from '@life-focus/ledger';

/** The presentation content for one closeness circle. */
export interface PersonImportanceContent {
  readonly id: PersonImportance;
  /** The short, plain-language name (the semantic carrier). */
  readonly label: string;
  /** The plain-language meaning shown at the moment of selection (calm voice). */
  readonly meaning: string;
  /** A monochrome, aria-hidden glyph paired with the label — never color-alone. */
  readonly icon: string;
}

/** Content lookup keyed by importance id. */
export const PERSON_IMPORTANCE_CONTENT: Record<PersonImportance, PersonImportanceContent> = {
  'inner-circle': {
    id: 'inner-circle',
    label: 'Inner circle',
    meaning: 'The few people you most want to stay close to.',
    // concentric — closest
    icon: '◉',
  },
  close: {
    id: 'close',
    label: 'Close',
    meaning: 'People you care about and like to keep regular time for.',
    // filled ring
    icon: '◐',
  },
  'wider-circle': {
    id: 'wider-circle',
    label: 'Wider circle',
    meaning: 'People you want to keep in view, without a fixed rhythm.',
    // open ring
    icon: '○',
  },
};

/**
 * The closeness circles in canonical order, keyed off `PERSON_IMPORTANCE` so the
 * order here can never drift from the core set.
 */
export const PERSON_IMPORTANCE_OPTIONS: readonly PersonImportanceContent[] =
  PERSON_IMPORTANCE.map((id) => PERSON_IMPORTANCE_CONTENT[id]);

/** The presentation content for an importance id. */
export function personImportanceContent(id: PersonImportance): PersonImportanceContent {
  return PERSON_IMPORTANCE_CONTENT[id];
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

/** Month abbreviations for user-asserted important-date formatting (Jan-first). */
export const MONTH_LABEL = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
] as const;

/**
 * A calm summary of a weekly communication rhythm. An empty weekday set is the
 * flexible "sometime each week" window; a set lists the days in canonical order.
 * e.g. "Communication rhythm: weekly" or "Communication rhythm: weekly (Sun)".
 */
export function rhythmSummary(daysOfWeek: readonly Weekday[]): string {
  const labels = WEEKDAYS.filter((d) => daysOfWeek.includes(d)).map((d) => WEEKDAY_LABEL[d]);
  return labels.length === 0
    ? 'Communication rhythm: weekly'
    : `Communication rhythm: weekly (${labels.join(', ')})`;
}

/**
 * Format a user-asserted important date (`MM-DD` or `YYYY-MM-DD`) as a calm,
 * plain-language string, e.g. "Mar 14". Returns the raw value verbatim if it is
 * not a recognizable month/day (never inferred, never dropped).
 */
export function formatImportantDate(date: string): string {
  const match = /^(?:(\d{4})-)?(\d{2})-(\d{2})$/.exec(date);
  if (!match) return date;
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return date;
  return `${MONTH_LABEL[month - 1]} ${day}`;
}
