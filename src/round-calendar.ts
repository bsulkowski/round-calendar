// Round calendar: a whole year on one disc. Weeks go round the edge, the seven weekdays are
// rings, and seasons, the zodiac and months sit inside as bands. The year can start on any day
// and the disc can be turned so that any part of it is at the top.
//
// Pure functions with no DOM access: the same code draws the sheet in the browser,
// at build time and in Node.
//
// Descends from an older generator in this repository (Groovy, 2018), which had the year
// and the seasons typed in by hand. Here they are computed for any year.

export type Lang = 'en' | 'pl';

// Two separate numbers (see README, Compatibility):
// TOOL_VERSION changes with every release of the generator;
// FORMAT_VERSION changes only if an old settings file could no longer be read the same way.
export const TOOL_VERSION = '1.0';
export const FORMAT_VERSION = 1;

export const MIN_YEAR = 1583; // first full year of the Gregorian calendar
export const MAX_YEAR = 2998; // the season formulas below hold up to 3000; a year may run into the next

/* ---------- dates ---------- */

export const isLeap = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;

export function monthLengths(y: number): number[] {
  return [31, isLeap(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
}

/** Days since 1970-01-01. A day past the end of the month rolls over (29.02.2027 → 1.03.2027). */
export function epochDay(y: number, month: number, day: number): number {
  const t = new Date(0);
  t.setUTCFullYear(y, month - 1, day); // setUTCFullYear keeps years below 100 as written
  return Math.round(t.getTime() / 86400000);
}

/** [year, month 1–12, day] of an epoch day. */
export function dateOf(e: number): [number, number, number] {
  const t = new Date(e * 86400000);
  return [t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate()];
}

/** Weekday of an epoch day: 0 = Monday … 6 = Sunday. */
export const weekday = (e: number) => (new Date(e * 86400000).getUTCDay() + 6) % 7;

// Equinoxes and solstices: Meeus, Astronomical Algorithms, ch. 27 (years 1000–3000).
// Accurate to about a minute, which only matters when the moment falls close to midnight.
const SEASON_JDE0 = [
  [2451623.80984, 365242.37404, 0.05169, -0.00411, -0.00057],
  [2451716.56767, 365241.62603, 0.00325, 0.00888, -0.0003],
  [2451810.21715, 365242.01767, -0.11575, 0.00337, 0.00078],
  [2451900.05952, 365242.74049, -0.06223, -0.00823, 0.00032],
];
const SEASON_TERMS = [
  [485, 324.96, 1934.136], [203, 337.23, 32964.467], [199, 342.08, 20.186], [182, 27.85, 445267.112],
  [156, 73.14, 45036.886], [136, 171.52, 22518.443], [77, 222.54, 65928.934], [74, 296.72, 3034.906],
  [70, 243.58, 9037.513], [58, 119.81, 33718.147], [52, 297.17, 150.678], [50, 21.02, 2281.226],
  [45, 247.54, 29929.562], [44, 325.15, 31555.956], [29, 60.93, 4443.417], [18, 155.12, 67555.328],
  [17, 288.79, 4562.452], [16, 198.04, 62894.029], [14, 199.76, 31436.921], [12, 95.39, 14577.848],
  [12, 287.11, 31931.756], [12, 320.81, 34777.259], [9, 227.73, 1222.114], [8, 15.45, 16859.074],
];
const rad = (deg: number) => (deg * Math.PI) / 180;

/**
 * Moment of an equinox or solstice as a UTC timestamp (ms).
 * which: 0 = March equinox, 1 = June solstice, 2 = September equinox, 3 = December solstice —
 * the starts of spring, summer, autumn and winter.
 */
export function seasonMoment(y: number, which: number): number {
  const Y = (y - 2000) / 1000;
  const c = SEASON_JDE0[which];
  const jde0 = c[0] + c[1] * Y + c[2] * Y ** 2 + c[3] * Y ** 3 + c[4] * Y ** 4;
  const T = (jde0 - 2451545.0) / 36525;
  const W = rad(35999.373 * T - 2.47);
  const dl = 1 + 0.0334 * Math.cos(W) + 0.0007 * Math.cos(2 * W);
  const S = SEASON_TERMS.reduce((s, [A, B, C]) => s + A * Math.cos(rad(B + C * T)), 0);
  const jde = jde0 + (0.00001 * S) / dl;
  // Terrestrial time runs about a minute ahead of UTC today; close enough for a date.
  return (jde - 2440587.5) * 86400000 - 69000;
}

/** Epoch day on which a season starts, in a time zone given in minutes east of UTC. */
export const seasonDay = (y: number, which: number, tz: number) =>
  Math.floor((seasonMoment(y, which) + tz * 60000) / 86400000);

/* ---------- names ---------- */

const MONTHS: Record<Lang, string[]> = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  pl: ['styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec', 'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień'],
};
const WEEKDAYS: Record<Lang, string[]> = {
  en: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
  pl: ['pn', 'wt', 'śr', 'cz', 'pt', 'sb', 'nd'],
};
const SEASONS: Record<Lang, string[]> = {
  en: ['spring', 'summer', 'autumn', 'winter'],
  pl: ['wiosna', 'lato', 'jesień', 'zima'],
};
const ZODIAC: Record<Lang, string[]> = {
  en: ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'],
  pl: ['baran', 'byk', 'bliźnięta', 'rak', 'lew', 'panna', 'waga', 'skorpion', 'strzelec', 'koziorożec', 'wodnik', 'ryby'],
};
// Conventional sign boundaries, as printed in calendars; they drift by a day between years.
const ZODIAC_STARTS: [number, number][] = [
  [3, 21], [4, 20], [5, 21], [6, 21], [7, 23], [8, 23], [9, 23], [10, 23], [11, 23], [12, 22], [1, 20], [2, 19],
];

/* ---------- settings ---------- */

export type Ring = 'year' | 'seasons' | 'zodiac' | 'counters' | 'months';

/** A counter: weeks, months or years numbered from a day (1, 2, 3…), each number standing over
 * the days it holds. A day without a year repeats every year and the count starts again from 1
 * (weeks of a school year); with a year it is one day and the count runs on (age). */
export type Unit = 'weeks' | 'months' | 'years';
export interface Counter { unit: Unit; from: DayDate; name: string }

/** A day of the year without its year (14.03), or with one (14.03.2027). */
export interface DayDate { m: number; d: number; y?: number }

/** Where the calendar starts: a date, or the start of a season (its equinox or solstice). */
export type Start = ({ kind: 'date' } & DayDate) | { kind: 'season'; which: number };

/** What is at the top of the disc: the seam between the end and the start of the year (the column
 * with the weekday names), the middle of a season or a month, or a day. */
export type Top =
  | { kind: 'seam' }
  | { kind: 'season'; which: number }
  | { kind: 'month'; m: number }
  | ({ kind: 'date' } & DayDate);

export interface Issue { line: number; message: string }

export interface Calendar {
  format: number;
  year: number; // the year in which the calendar starts
  start: Start;
  top: Top;
  firstDay: number; // weekday of the innermost ring: 0 = Monday … 6 = Sunday
  rings: Ring[]; // from the centre outwards; the weekday rings always come last
  counters: Counter[]; // each its own thin band, where 'counters' stands in the rings
  tz: number; // minutes east of UTC, for the dates of equinoxes and solstices
  colors: Record<string, string>; // 'weekend', 'lines'
  title: string;
  signature: string[];
  issues: Issue[];
}

const KEYS: Record<string, string> = {
  rok: 'year', year: 'year',
  od: 'start', początek: 'start', poczatek: 'start', from: 'start', start: 'start',
  góra: 'top', gora: 'top', 'na górze': 'top', 'na gorze': 'top', top: 'top',
  'pierwszy dzień': 'firstDay', 'pierwszy dzien': 'firstDay', 'początek tygodnia': 'firstDay',
  'poczatek tygodnia': 'firstDay', 'first day': 'firstDay', 'week starts': 'firstDay', 'week start': 'firstDay',
  pierścienie: 'rings', pierscienie: 'rings', rings: 'rings',
  strefa: 'tz', 'strefa czasowa': 'tz', timezone: 'tz', 'time zone': 'tz',
  kolory: 'colors', colors: 'colors', colours: 'colors',
  tytuł: 'title', tytul: 'title', title: 'title',
  podpis: 'signature', signature: 'signature',
  licznik: 'counter', counter: 'counter',
  format: 'format',
};

const aliases = (groups: string[]) => {
  const map: Record<string, number> = {};
  groups.forEach((names, i) => names.split(' ').forEach((n) => { map[n.replace(/_/g, ' ')] = i; }));
  return map;
};

const DAY_ALIAS = aliases([
  'pn pon poniedziałek poniedzialek mon monday', 'wt wto wtorek tue tues tuesday',
  'śr sr śro sro środa sroda wed wednesday', 'cz czw czwartek thu thur thurs thursday',
  'pt pią pia piątek piatek fri friday', 'sb sob sobota sat saturday', 'nd nie ndz niedziela sun sunday',
]);
const SEASON_ALIAS = aliases(['wiosna spring', 'lato summer', 'jesień jesien autumn fall', 'zima winter']);
const MONTH_ALIAS = aliases([
  'styczeń styczen sty january jan', 'luty lut february feb', 'marzec mar march',
  'kwiecień kwiecien kwi april apr', 'maj may', 'czerwiec cze june jun', 'lipiec lip july jul',
  'sierpień sierpien sie august aug', 'wrzesień wrzesien wrz september sep sept',
  'październik pazdziernik paź paz october oct', 'listopad lis november nov', 'grudzień grudzien gru december dec',
]);
const SEAM = new Set(['łączenie', 'laczenie', 'szew', 'seam', 'join']);

const RING_ALIAS: Record<string, Ring> = {
  rok: 'year', year: 'year',
  'pory roku': 'seasons', pory: 'seasons', seasons: 'seasons',
  zodiak: 'zodiac', zodiac: 'zodiac',
  miesiące: 'months', miesiace: 'months', months: 'months',
  liczniki: 'counters', licznik: 'counters', counters: 'counters', counter: 'counters',
};

const UNIT_ALIAS: Record<string, Unit> = {
  tygodnie: 'weeks', tydzień: 'weeks', tydzien: 'weeks', tyg: 'weeks', weeks: 'weeks', week: 'weeks',
  miesiące: 'months', miesiace: 'months', miesiąc: 'months', miesiac: 'months', mies: 'months', months: 'months', month: 'months',
  lata: 'years', rok: 'years', lat: 'years', years: 'years', year: 'years',
};

const COLOR_ALIAS: Record<string, string> = { weekend: 'weekend', linie: 'lines', lines: 'lines' };

export const DEFAULT_COLORS: Record<string, string> = { weekend: '#eaeaea', lines: '#c0c0c0' };

const NONE = new Set(['brak', 'none', '-']);

const MSG: Record<Lang, Record<string, string>> = {
  en: {
    key: 'unknown setting “{0}”',
    line: 'a line should be a setting: name, colon, value (year: 2027)',
    year: 'write a year between ' + MIN_YEAR + ' and ' + MAX_YEAR,
    start: 'write a date (1.09, 1.09.2026) or a season (spring)',
    top: 'write seam, a season (winter), a month (january) or a date (1.09)',
    day: 'unknown day “{0}”',
    ring: 'unknown ring “{0}” (year, seasons, zodiac, counters, months)',
    counter: 'write a counter as: weeks from 1.09 (a name if you like); weeks, months or years',
    tz: 'write a time zone as +1 or -5:30',
    color: 'write a colour as weekend=#hex or lines=#hex',
    date: 'there is no such date: {0}',
    outside: '{0} is not in this calendar ({1}–{2})',
    format: 'these settings were saved in format {0}, newer than this page knows (1); they may not show as intended',
  },
  pl: {
    key: 'nieznane ustawienie „{0}”',
    line: 'linia powinna być ustawieniem: nazwa, dwukropek, wartość (rok: 2027)',
    year: 'wpisz rok od ' + MIN_YEAR + ' do ' + MAX_YEAR,
    start: 'wpisz datę (1.09, 1.09.2026) albo porę roku (wiosna)',
    top: 'wpisz łączenie, porę roku (zima), miesiąc (styczeń) albo datę (1.09)',
    day: 'nieznany dzień „{0}”',
    ring: 'nieznany pierścień „{0}” (rok, pory roku, zodiak, liczniki, miesiące)',
    counter: 'wpisz licznik jako: tygodnie od 1.09 (i ewentualnie nazwę); tygodnie, miesiące albo lata',
    tz: 'wpisz strefę jako +1 albo -5:30',
    color: 'wpisz kolor jako weekend=#hex albo linie=#hex',
    date: 'nie ma takiej daty: {0}',
    outside: '{0} nie wypada w tym kalendarzu ({1}–{2})',
    format: 'ustawienia zapisano w formacie {0}, nowszym niż zna ta strona (1); mogą wyglądać inaczej, niż zamierzono',
  },
};

const RE_KEY = /^([\p{L}][\p{L} ]*?)\s*:\s*(.*)$/u;
// 2027-03-14, 14.03 or 14.03.2027 (a trailing dot is allowed: 14.03.)
const RE_DATE = /^(?:(\d{4})-(\d{1,2})-(\d{1,2})|(\d{1,2})\.(\d{1,2})(?:\.(\d{4}))?\.?)$/;

function parseDate(v: string): DayDate | undefined {
  const g = v.match(RE_DATE);
  if (!g) return undefined;
  return g[1] ? { y: +g[1], m: +g[2], d: +g[3] } : { y: g[6] ? +g[6] : undefined, m: +g[5], d: +g[4] };
}

/** Whether the date exists; without a year, 29.02 counts as existing. */
const validDate = ({ y, m, d }: DayDate) =>
  m >= 1 && m <= 12 && d >= 1 && d <= monthLengths(y ?? 2000)[m - 1];

const showDate = ({ y, m, d }: DayDate) => `${d}.${String(m).padStart(2, '0')}${y === undefined ? '' : '.' + y}`;

const list = (v: string) => v.split(',').map((s) => s.trim().replace(/\s+/g, ' ')).filter(Boolean);

export function parseCalendar(text: string, lang: Lang, defaultYear: number): Calendar {
  const msg = MSG[lang];
  const say = (key: string, ...args: (string | number)[]) =>
    args.reduce<string>((s, a, i) => s.replace(`{${i}}`, String(a)), msg[key]);
  const issues: Issue[] = [];
  const cal: Calendar = {
    format: 1,
    year: Math.min(MAX_YEAR, Math.max(MIN_YEAR, defaultYear)),
    start: { kind: 'date', m: 1, d: 1 },
    top: { kind: 'seam' },
    firstDay: 0,
    rings: ['year', 'seasons', 'months'],
    counters: [],
    tz: 0,
    colors: {},
    title: '',
    signature: [],
    issues,
  };
  let startLine = 0, topLine = 0;

  // NFC first: text copied on macOS can carry "ś" as "s" + combining accent.
  text.normalize('NFC').split(/\r?\n/).forEach((full, i) => {
    const n = i + 1;
    // "#" starts a comment at the start of a line or after a space, so colours like #c0504d survive.
    const line = full.trim().startsWith('#') ? '' : full.replace(/\s#\s.*$/, '').trim();
    if (!line) return;

    const kv = line.match(RE_KEY);
    if (!kv) { issues.push({ line: n, message: say('line') }); return; }
    const key = KEYS[kv[1].toLowerCase().replace(/\s+/g, ' ')];
    if (!key) { issues.push({ line: n, message: say('key', kv[1]) }); return; }
    const value = kv[2].trim();
    const low = value.toLowerCase().replace(/\s+/g, ' ');

    if (key === 'year') {
      const y = Number(value);
      if (Number.isInteger(y) && y >= MIN_YEAR && y <= MAX_YEAR) cal.year = y;
      else issues.push({ line: n, message: say('year') });
    } else if (key === 'start') {
      const date = parseDate(low);
      if (date && !validDate(date)) issues.push({ line: n, message: say('date', showDate(date)) });
      else if (date) { cal.start = { kind: 'date', ...date }; startLine = n; }
      else if (SEASON_ALIAS[low] !== undefined) { cal.start = { kind: 'season', which: SEASON_ALIAS[low] }; startLine = n; }
      else issues.push({ line: n, message: say('start') });
    } else if (key === 'top') {
      const date = parseDate(low);
      if (date && !validDate(date)) issues.push({ line: n, message: say('date', showDate(date)) });
      else if (date) { cal.top = { kind: 'date', ...date }; topLine = n; }
      else if (SEAM.has(low)) cal.top = { kind: 'seam' };
      else if (SEASON_ALIAS[low] !== undefined) cal.top = { kind: 'season', which: SEASON_ALIAS[low] };
      else if (MONTH_ALIAS[low] !== undefined) cal.top = { kind: 'month', m: MONTH_ALIAS[low] + 1 };
      else issues.push({ line: n, message: say('top') });
    } else if (key === 'firstDay') {
      const d = DAY_ALIAS[low];
      if (d === undefined) issues.push({ line: n, message: say('day', value) }); else cal.firstDay = d;
    } else if (key === 'rings') {
      cal.rings = [];
      for (const r of list(low)) {
        if (NONE.has(r)) continue;
        const ring = RING_ALIAS[r];
        if (!ring) issues.push({ line: n, message: say('ring', r) });
        else if (!cal.rings.includes(ring)) cal.rings.push(ring);
      }
    } else if (key === 'tz') {
      const t = low.replace(/\s+/g, '').match(/^(?:utc|gmt)?(?:([+-]?)(\d{1,2})(?::?(\d{2}))?)?$/);
      if (!t || (!t[2] && !/^(utc|gmt)$/.test(low)) || +(t[2] ?? 0) > 14 || +(t[3] ?? 0) > 59) {
        issues.push({ line: n, message: say('tz') });
      } else {
        cal.tz = (t[1] === '-' ? -1 : 1) * ((+(t[2] ?? 0)) * 60 + +(t[3] ?? 0));
      }
    } else if (key === 'colors') {
      for (const pair of value.split(',').map((s) => s.trim()).filter(Boolean)) {
        const c = pair.match(/^(.+?)\s*=\s*(#[0-9a-f]{3}(?:[0-9a-f]{3})?)$/i);
        const name = c ? COLOR_ALIAS[c[1].toLowerCase()] : undefined;
        if (!c || !name) issues.push({ line: n, message: say('color') });
        else cal.colors[name] = c[2];
      }
    } else if (key === 'counter') {
      // weeks from 1.09 Name — "from" may be left out
      const c = value.match(/^(\p{L}+)\s+(?:(?:od|from)\s+)?(\S+)(?:\s+(.*))?$/u);
      const unit = c ? UNIT_ALIAS[c[1].toLowerCase()] : undefined;
      const from = c ? parseDate(c[2]) : undefined;
      if (!c || !unit || !from) issues.push({ line: n, message: say('counter') });
      else if (!validDate(from)) issues.push({ line: n, message: say('date', showDate(from)) });
      else if (from.y !== undefined && (from.y < MIN_YEAR || from.y > MAX_YEAR)) issues.push({ line: n, message: say('year') });
      else cal.counters.push({ unit, from, name: (c[3] ?? '').trim() });
    } else if (key === 'title') {
      cal.title = value;
    } else if (key === 'signature') {
      cal.signature.push(value);
    } else if (key === 'format') {
      const f = Number(value);
      if (Number.isInteger(f) && f >= 1) {
        cal.format = f;
        if (f > FORMAT_VERSION) issues.push({ line: n, message: say('format', f) });
      }
    }
  });

  // Checked once everything is read: `rok:` may come after `od:`.
  const s = cal.start;
  if (s.kind === 'date' && s.y !== undefined) {
    if (s.y < MIN_YEAR || s.y > MAX_YEAR) { issues.push({ line: startLine, message: say('year') }); cal.start = { kind: 'date', m: s.m, d: s.d }; }
    else cal.year = s.y; // a full date sets the year
  }
  if (s.kind === 'date' && !validDate({ ...s, y: cal.year })) {
    issues.push({ line: startLine, message: say('date', showDate({ ...s, y: cal.year })) });
    cal.start = { kind: 'date', m: 1, d: 1 };
  }
  const t = cal.top;
  if (t.kind === 'date' && occurrence(calendarRange(cal), t) === undefined) {
    const r = calendarRange(cal);
    const fmt = (e: number) => { const [y, m, d] = dateOf(e); return showDate({ y, m, d }); };
    issues.push({ line: topLine, message: say('outside', showDate(t), fmt(r.start), fmt(r.start + r.days - 1)) });
    cal.top = { kind: 'seam' };
  }

  issues.sort((a, b) => a.line - b.line);
  return cal;
}

/** The days on the disc: the first one (epoch day) and how many. One year: up to the day before
 * the same date a year later, or before the same season starts again. */
export interface Range { start: number; days: number }

export function calendarRange(cal: Calendar): Range {
  const y = cal.year, s = cal.start;
  if (s.kind === 'season') {
    const a = seasonDay(y, s.which, cal.tz);
    return { start: a, days: seasonDay(y + 1, s.which, cal.tz) - a };
  }
  const a = epochDay(s.y ?? y, s.m, s.d);
  return { start: a, days: epochDay((s.y ?? y) + 1, s.m, s.d) - a }; // 29.02 → up to 28.02
}

/** Index (0-based) of a day in the range, or undefined if it is not there. */
export function occurrence(r: Range, { m, d, y }: DayDate): number | undefined {
  const [y0] = dateOf(r.start);
  for (const yy of y === undefined ? [y0, y0 + 1] : [y]) {
    const e = epochDay(yy, m, d);
    const [, mm] = dateOf(e);
    if (mm === m && e >= r.start && e < r.start + r.days) return e - r.start;
  }
  return undefined;
}

// Saved files carry their format, so a later page can tell old files from new ones.
// The line goes after the leading comments; a file that already has one is left alone.
export function withFormatLine(text: string): string {
  const lines = text.split('\n');
  if (lines.some((l) => /^\s*format\s*:/i.test(l))) return text;
  const at = lines.findIndex((l) => l.trim() !== '' && !l.trim().startsWith('#'));
  const line = `format: ${FORMAT_VERSION}`;
  if (at === -1) return text.replace(/\n*$/, '') + (text.trim() ? '\n' : '') + line + '\n';
  lines.splice(at, 0, line);
  return lines.join('\n');
}

/* ---------- layout ---------- */

/** A stretch of a band, in days of the range; `to` may pass `days` when the stretch runs on
 * across the seam into the start of the range. */
export interface Segment { from: number; to: number; label: string; key: number }

type Band = 'seasons' | 'zodiac' | 'months';

/** Stretches of a band. The band is a cycle: the stretch around the seam is one, even though
 * its two ends belong to different years (summer of 2027 joins summer of 2026). */
export function bandSegments(cal: Calendar, r: Range, band: Band, lang: Lang): Segment[] {
  const [y0] = dateOf(r.start);
  const marks: { at: number; key: number }[] = [];
  for (const yy of [y0 - 1, y0, y0 + 1]) {
    if (band === 'seasons') for (let k = 0; k < 4; k++) marks.push({ at: seasonDay(yy, k, cal.tz) - r.start, key: k });
    if (band === 'months') for (let m = 1; m <= 12; m++) marks.push({ at: epochDay(yy, m, 1) - r.start, key: m - 1 });
    if (band === 'zodiac') ZODIAC_STARTS.forEach(([m, d], k) => marks.push({ at: epochDay(yy, m, d) - r.start, key: k }));
  }
  // Each boundary once: a range of a year can catch a season's start twice, a day apart.
  const seen = new Set<number>();
  const inRange = marks.filter((x) => x.at >= 0 && x.at < r.days).sort((a, b) => a.at - b.at)
    .filter((x) => (seen.has(x.key) ? false : (seen.add(x.key), true)));
  const names = band === 'seasons' ? SEASONS[lang] : band === 'zodiac' ? ZODIAC[lang] : MONTHS[lang];
  return inRange.map((x, i) => ({
    from: x.at,
    to: i + 1 < inRange.length ? inRange[i + 1].at : inRange[0].at + r.days,
    label: names[x.key],
    key: x.key,
  }));
}

/** The k-th boundary of a counter after its day (k = 0 is the day itself). A day missing from
 * a shorter month or year falls back to the month's last day (31.01 → 28.02, 29.02 → 28.02). */
function counterStep(unit: Unit, { y, m, d }: Required<DayDate>, k: number): number {
  if (unit === 'weeks') return epochDay(y, m, d) + 7 * k;
  const total = m - 1 + (unit === 'months' ? k : 12 * k);
  const yy = y + Math.floor(total / 12), mm = (total % 12) + 1;
  return epochDay(yy, mm, Math.min(d, monthLengths(yy)[mm - 1]));
}

/** Stretches of a counter, numbered from 1 and cut at the ends of the range: unlike the other
 * bands a counter is not a cycle — its numbers at the end and at the start differ. */
export function counterSegments(c: Counter, r: Range): Segment[] {
  const end = r.start + r.days;
  const [y0] = dateOf(r.start);
  // Days the count starts from: one, or the same day in each year around the range.
  const starts = c.from.y !== undefined ? [c.from.y] : [y0 - 1, y0, y0 + 1];
  const marks: { at: number; value: number }[] = [];
  for (const y of starts) {
    const day = { y, m: c.from.m, d: c.from.d };
    const until = c.from.y !== undefined ? end : Math.min(end, counterStep('years', day, 1));
    // Jump close to the range instead of counting up from a day long ago.
    const per = c.unit === 'weeks' ? 7 : c.unit === 'months' ? 31 : 366;
    let k = Math.max(0, Math.floor((r.start - counterStep(c.unit, day, 0)) / per) - 1);
    for (let b = counterStep(c.unit, day, k); b < until; b = counterStep(c.unit, day, ++k)) marks.push({ at: b, value: k + 1 });
  }
  marks.sort((a, b) => a.at - b.at);
  const out: Segment[] = [];
  marks.forEach((x, i) => {
    const from = Math.max(x.at, r.start), to = Math.min(i + 1 < marks.length ? marks[i + 1].at : end, end);
    if (to > from) out.push({ from: from - r.start, to: to - r.start, label: String(x.value), key: x.value });
  });
  return out;
}

export interface Layout {
  range: Range;
  offset: number; // empty cells before the first day in its week column
  columns: number; // week columns plus the seam column (column 0)
  step: number; // degrees per column
  base: number; // angle where column 0 begins (0° = right, clockwise)
  segments: Partial<Record<Band, Segment[]>>;
  counters: Segment[][]; // in the order of cal.counters
}

export function layoutCalendar(cal: Calendar, lang: Lang): Layout {
  const range = calendarRange(cal);
  const N = range.days;
  const offset = (weekday(range.start) - cal.firstDay + 7) % 7;
  const columns = Math.ceil((offset + N) / 7) + 1;
  const step = 360 / columns;
  const segments: Partial<Record<Band, Segment[]>> = {};
  for (const b of ['seasons', 'zodiac', 'months'] as Band[]) segments[b] = bandSegments(cal, range, b, lang);

  // Angles before turning; the turn puts the chosen thing at the top (270°).
  const rel = (x: number) => step * (1 + (offset + x) / 7);
  const segEnd = (s: Segment) => (s.to <= N ? rel(s.to) : rel(s.to - N) + 360);
  let anchor = step / 2; // the seam column
  const t = cal.top;
  if (t.kind === 'date') {
    const i = occurrence(range, t) ?? 0;
    anchor = step * (1 + Math.floor((offset + i) / 7) + 0.5);
  } else if (t.kind === 'season' || t.kind === 'month') {
    const key = t.kind === 'season' ? t.which : t.m - 1;
    const s = segments[t.kind === 'season' ? 'seasons' : 'months']!.find((x) => x.key === key);
    if (s) anchor = (rel(s.from) + segEnd(s)) / 2;
  }
  const counters = cal.counters.map((c) => counterSegments(c, range));
  return { range, offset, columns, step, base: 270 - anchor, segments, counters };
}

/* ---------- drawing ---------- */

// The sheet is A4 portrait at 96 dpi; the margin leaves room for printers that cannot print to the edge.
export const SHEET = { width: 794, height: 1123 };
const M = 26;
const FONT = 'Inter, Arial, Helvetica, sans-serif';

// Text width estimate (in ems) for a sans-serif face, so layout does not depend on the DOM.
function textWidth(s: string, size: number): number {
  let w = 0;
  for (const ch of s) {
    if (' .,:;\'|!/'.includes(ch)) w += 0.28;
    else if ('ijlI'.includes(ch)) w += 0.27;
    else if ('ftr()[]-–'.includes(ch)) w += 0.37;
    else if ('mwMW'.includes(ch)) w += 0.88;
    else if (/\d/.test(ch)) w += 0.6;
    else if (/\p{Lu}/u.test(ch)) w += 0.7;
    else w += 0.56;
  }
  return w * size;
}
const fitSize = (s: string, size: number, maxW: number) => {
  const w = textWidth(s, size);
  return w <= maxW ? size : (size * maxW) / w;
};
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const r2 = (v: number) => Math.round(v * 100) / 100;

// Sizes are shares of the disc's area; a counter is a thin band, one per counter.
const BELT_SIZE: Record<Ring, number> = { year: 0.5, seasons: 0.5, zodiac: 0.5, counters: 0.3, months: 0.5 };
const BELT_FONT: Record<Ring, number> = { year: 0, seasons: 16, zodiac: 11, counters: 9, months: 13 };
const BELT_INK: Record<Ring, string> = { year: '#959595', seasons: '#959595', zodiac: '#959595', counters: '#7a7a7a', months: '#6b6b6b' };

export function renderCalendar(cal: Calendar, lang: Lang): string {
  const { firstDay, rings } = cal;
  const color = (k: string) => cal.colors[k] ?? DEFAULT_COLORS[k];
  const { width: W, height: H } = SHEET;
  const L = layoutCalendar(cal, lang);
  const { offset, step, base } = L;
  const N = L.range.days;
  const colStart = (c: number) => base + c * step;
  const dayAngle = (x: number) => base + step * (1 + (offset + x) / 7);
  const cellOf = (d: number) => ({ col: 1 + Math.floor((offset + d) / 7), ring: (offset + d) % 7 });

  // Rings of equal area, as in the original: the outer weekday rings are thinner but longer.
  const hasYear = rings.includes('year');
  // The bands between the year and the weekday rings, from the centre outwards. Counters stand
  // where 'counters' is in the rings, or else just inside the months.
  interface BandEntry { kind: Band | 'counter'; segs: Segment[]; size: number; font: number; ink: string; name: string }
  const order: Ring[] = rings.filter((r) => r !== 'year');
  if (L.counters.length && !order.includes('counters')) {
    const i = order.indexOf('months');
    order.splice(i < 0 ? order.length : i, 0, 'counters');
  }
  const bands: BandEntry[] = order.flatMap((r): BandEntry[] => (r === 'counters'
    ? L.counters.map((segs, i) => ({
      kind: 'counter', segs, size: BELT_SIZE.counters, font: BELT_FONT.counters, ink: BELT_INK.counters, name: cal.counters[i].name,
    }))
    : [{ kind: r as Band, segs: L.segments[r as Band]!, size: BELT_SIZE[r], font: BELT_FONT[r], ink: BELT_INK[r], name: '' }]));
  const centre = hasYear ? BELT_SIZE.year : 0.2;
  const total = centre + bands.reduce((s, b) => s + b.size, 0) + 7;
  const R = W / 2 - M;
  const cx = W / 2;
  const cy = H / 2;
  const rAt = (part: number) => Math.sqrt(part / total) * R;
  const bandR: [number, number][] = [];
  let acc = centre;
  for (const b of bands) { bandR.push([rAt(acc), rAt(acc + b.size)]); acc += b.size; }
  const dayR = (k: number): [number, number] => [rAt(acc + k), rAt(acc + k + 1)];
  const r0 = rAt(acc);
  const rMid = ([a, b]: [number, number]) => Math.sqrt((a * a + b * b) / 2);

  const P = (a: number, r: number) => `${r2(cx + r * Math.cos(rad(a)))} ${r2(cy + r * Math.sin(rad(a)))}`;
  const arcTo = (a0: number, a1: number, r: number) =>
    `A ${r2(r)} ${r2(r)} 0 ${Math.abs(a1 - a0) > 180 ? 1 : 0} ${a1 > a0 ? 1 : 0} ${P(a1, r)}`;
  const sector = (a0: number, a1: number, [ri, ro]: [number, number]) =>
    `M ${P(a0, ro)} ${arcTo(a0, a1, ro)} L ${P(a1, ri)} ${arcTo(a1, a0, ri)} Z`;
  const cell = (d: number) => {
    const { col, ring } = cellOf(d);
    return sector(colStart(col), colStart(col + 1), dayR(ring));
  };

  // Text in a cell, centred on it and turned in steps of 90° against the cell: along the circle
  // at the top and bottom of the disc, across it at the sides. The text is never more than 45°
  // off horizontal, so the sheet reads without turning it.
  const cellText = (a: number, r: number, s: string, size: number, fill: string, weight = 700) => {
    const rot = ((((a + 90 + 45) % 90) + 90) % 90) - 45;
    return `<text transform="translate(${P(a, r)}) rotate(${r2(rot)})" y="${r2(size * 0.35)}" font-size="${r2(size)}" font-weight="${weight}" text-anchor="middle" fill="${esc(fill)}">${esc(s)}</text>`;
  };
  let pathId = 0;
  const arcText = (a0: number, a1: number, r: number, s: string, size: number, fill: string) => {
    const id = `rc-arc-${++pathId}`;
    const lower = Math.sin(rad((a0 + a1) / 2)) > 0;
    const d = lower ? `M ${P(a1, r)} ${arcTo(a1, a0, r)}` : `M ${P(a0, r)} ${arcTo(a0, a1, r)}`;
    return `<path id="${id}" d="${d}" fill="none"/>` +
      `<text font-size="${r2(size)}" font-weight="700" fill="${esc(fill)}" dy="${r2(size * 0.35)}">` +
      `<textPath href="#${id}" xlink:href="#${id}" startOffset="50%" text-anchor="middle">${esc(s)}</textPath></text>`;
  };

  const o: string[] = [];
  o.push(`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="210mm" height="297mm" viewBox="0 0 ${W} ${H}" font-family="${esc(FONT)}" role="img">`);
  o.push(`<rect width="${W}" height="${H}" fill="#ffffff"/>`);

  // Weekends.
  const weekendPath: string[] = [];
  for (let d = 0; d < N; d++) if ((cellOf(d).ring + firstDay) % 7 >= 5) weekendPath.push(cell(d));
  if (weekendPath.length) o.push(`<path d="${weekendPath.join(' ')}" fill="${esc(color('weekend'))}"/>`);

  // Lines: circles between the bands, steps between months, ticks in the months band.
  const line = color('lines');
  // Where the months band lies right inside the weekday rings, the steps run on across it and
  // no circle parts it from the days: a month's name stands in the same field as its days.
  const monthsIn = bands.length && bands[bands.length - 1].kind === 'months' ? bandR[bands.length - 1][0] : undefined;
  o.push(`<g fill="none" stroke="${esc(line)}" stroke-linejoin="round">`);
  for (const r of [rAt(centre), ...bandR.map(([, ro]) => ro)].filter((x) => monthsIn === undefined || Math.abs(x - r0) > 1e-9)) {
    o.push(`<circle cx="${r2(cx)}" cy="${r2(cy)}" r="${r2(r)}" stroke-width="1.2"/>`);
  }

  // Steps run between months and along both sides of the seam.
  const monthStarts = new Set(L.segments.months!.map((s) => s.from));
  const stepPath = (d: number) => {
    const { col, ring } = cellOf(d);
    const a0 = colStart(col), a1 = colStart(col + 1), aM = dayAngle(d);
    const intoMonths = monthsIn !== undefined && monthStarts.has(d % N);
    const into = intoMonths ? ` L ${P(aM, monthsIn)}` : '';
    if (ring === 0) return `M ${P(a0, R)} L ${P(a0, intoMonths ? monthsIn : r0)}`;
    const rk = dayR(ring)[0];
    return `M ${P(a0, R)} L ${P(a0, rk)} ${arcTo(a0, a1, rk)} L ${P(a1, r0)} ${arcTo(a1, aM, r0)}${into}`;
  };
  const steps = [...new Set([0, ...monthStarts, N])].sort((a, b) => a - b);
  o.push(`<path d="${steps.map(stepPath).join(' ')}" stroke-width="2"/>`);
  // The outer edge runs from the first day to the last. The inner one leaves out the seam column,
  // or with the months band right inside, closes only the seam column.
  const first = cellOf(0), last = cellOf(N);
  o.push(`<path d="M ${P(colStart(first.col), R)} ${arcTo(colStart(first.col), colStart(last.col), R)}" stroke-width="2"/>`);
  o.push(monthsIn === undefined
    ? `<path d="M ${P(base + step, r0)} ${arcTo(base + step, base + 360 - 0.001, r0)}" stroke-width="1.2"/>`
    : `<path d="M ${P(base, r0)} ${arcTo(base, base + step, r0)}" stroke-width="1.2"/>`);

  // A stretch that ends at the seam leaves the seam column empty; one that runs across it fills it.
  const segAngles = (s: Segment): [number, number] =>
    [dayAngle(s.from), s.to <= N ? dayAngle(s.to) : dayAngle(s.to - N) + 360];
  // Only the months band has ticks: they divide days. Elsewhere a tick would only point roughly,
  // which the place of the label already does.
  bands.forEach((b, i) => {
    if (b.kind !== 'months') return;
    const [ri, ro] = bandR[i];
    const ticks = b.segs.flatMap((s) => (s.to === N ? [dayAngle(s.from), dayAngle(N)] : [dayAngle(s.from)]));
    o.push(`<path d="${ticks.map((a) => `M ${P(a, ri)} L ${P(a, ro)}`).join(' ')}" stroke-width="2"/>`);
  });
  o.push('</g>');

  // Texts.
  const ringArc = (k: number) => rad(step) * rMid(dayR(k));
  const outerThick = R - dayR(6)[0];
  const fDay = Math.min(11.5, outerThick * 0.55, ringArc(0) * 0.62);
  o.push('<g>');
  for (let d = 0; d < N; d++) {
    const { col, ring } = cellOf(d);
    const a = colStart(col) + step / 2;
    o.push(cellText(a, rMid(dayR(ring)), String(dateOf(L.range.start + d)[2]), fDay, '#404040'));
  }
  for (let k = 0; k < 7; k++) {
    const name = WEEKDAYS[lang][(k + firstDay) % 7];
    const f = Math.min(fDay, fitSize(name, fDay, ringArc(k) * 0.85));
    o.push(cellText(base + step / 2, rMid(dayR(k)), name, f, '#6b6b6b'));
  }
  const angDist = (a: number, b: number) => { const x = (((a - b) % 360) + 360) % 360; return Math.min(x, 360 - x); };
  bands.forEach((b, i) => {
    const [ri, ro] = bandR[i];
    const r = (ri + ro) / 2;
    if (b.kind !== 'counter') {
      for (const s of b.segs) {
        const [a0, a1] = segAngles(s);
        const len = rad(a1 - a0) * r;
        const f = Math.min(b.font, (ro - ri) * 0.62, fitSize(s.label, b.font, len * 0.88));
        if (f >= 4) o.push(arcText(a0, a1, r, s.label, f, b.ink));
      }
      return;
    }
    // A counter: numbers of one size, each over its stretch, left out where they do not fit.
    // The name, if any, stands on the seam and takes the place of the numbers it covers.
    const f = Math.min(b.font, (ro - ri) * 0.62);
    const deg = (len: number) => (len / r) * (180 / Math.PI);
    const seam = base + step / 2;
    const nameHalf = b.name ? deg(textWidth(b.name, f) / 2 + f * 0.6) : 0;
    if (b.name) o.push(arcText(seam - nameHalf, seam + nameHalf, r, b.name, f, b.ink));
    for (const s of b.segs) {
      const [a0, a1] = segAngles(s);
      const w = textWidth(s.label, f);
      if (w > rad(a1 - a0) * r * 0.9) continue;
      if (b.name && angDist((a0 + a1) / 2, seam) < nameHalf + deg(w / 2 + f * 0.4)) continue;
      o.push(arcText(a0, a1, r, s.label, f, b.ink));
    }
  });
  if (hasYear) {
    const y0 = dateOf(L.range.start)[0], y1 = dateOf(L.range.start + N - 1)[0];
    const title = cal.title || (y0 === y1 ? String(y0) : `${y0}/${y1}`);
    const rc = rAt(centre);
    const f = Math.min(rc * 0.5, fitSize(title, rc * 0.5, rc * 1.6));
    o.push(`<text x="${r2(cx)}" y="${r2(cy + f * 0.35)}" font-size="${r2(f)}" font-weight="700" text-anchor="middle" fill="${BELT_INK.year}">${esc(title)}</text>`);
  }
  o.push('</g>');

  if (cal.signature.length) {
    o.push('<g font-size="9.5" fill="#555555" text-anchor="end">');
    cal.signature.forEach((s, i) => {
      o.push(`<text x="${W - M}" y="${r2(H - M - (cal.signature.length - 1 - i) * 12)}">${esc(s)}</text>`);
    });
    o.push('</g>');
  }

  o.push('</svg>');
  return o.join('');
}
