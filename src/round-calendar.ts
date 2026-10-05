// Round calendar: a whole year on one disc. Weeks go round the edge, the seven weekdays are
// rings, and seasons, the zodiac and months sit inside as bands. Holidays and the reader's own
// dates are marked on it, and the named ones are listed under the disc.
//
// Pure functions with no DOM access: the same code draws the sheet in the browser
// (bsulkowski.pl/round-calendar), at build time and in Node.
//
// Descends from an older generator in this repository (Groovy, 2018), which had the year,
// Easter and the seasons typed in by hand. Here they are computed for any year.

export type Lang = 'en' | 'pl';

// Two separate numbers (see README, Compatibility):
// TOOL_VERSION changes with every release of the generator (shown on the page);
// FORMAT_VERSION changes only if an old settings file could no longer be read the same way.
export const TOOL_VERSION = '1.0';
export const FORMAT_VERSION = 1;

export const MIN_YEAR = 1583; // first full year of the Gregorian calendar
export const MAX_YEAR = 2999; // the season formulas below hold up to 3000

/* ---------- dates ---------- */

export const isLeap = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;

export function monthLengths(y: number): number[] {
  return [31, isLeap(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
}

export const daysInYear = (y: number) => (isLeap(y) ? 366 : 365);

/** 0-based day of the year; month 1–12. */
export function dayOfYear(y: number, month: number, day: number): number {
  const ml = monthLengths(y);
  let d = day - 1;
  for (let m = 0; m < month - 1; m++) d += ml[m];
  return d;
}

/** Days since 1970-01-01 of a date, for comparing dates across years. */
const epochDay = (y: number, month: number, day: number) => {
  const t = new Date(0);
  t.setUTCFullYear(y, month - 1, day); // setUTCFullYear keeps years below 100 as written
  return Math.round(t.getTime() / 86400000);
};

/** Weekday of a 0-based day of the year: 0 = Monday … 6 = Sunday. */
export function weekday(y: number, doy: number): number {
  const w = new Date(epochDay(y, 1, 1 + doy) * 86400000).getUTCDay();
  return (w + 6) % 7;
}

/** Easter Sunday in the Gregorian calendar (the anonymous algorithm, Meeus ch. 8). */
export function easter(y: number): [number, number] {
  const a = y % 19, b = Math.floor(y / 100), c = y % 100;
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const n = h + l - 7 * m + 114;
  return [Math.floor(n / 31), (n % 31) + 1];
}

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
 * which: 0 = March equinox, 1 = June solstice, 2 = September equinox, 3 = December solstice.
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

/** Day of the year (0-based) of a season start, in a time zone given in minutes east of UTC. */
export function seasonStart(y: number, which: number, tz: number): number {
  const t = new Date(seasonMoment(y, which) + tz * 60000);
  return dayOfYear(y, t.getUTCMonth() + 1, t.getUTCDate());
}

/* ---------- names ---------- */

const MONTHS: Record<Lang, string[]> = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  pl: ['styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec', 'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień'],
};
const MONTHS_SHORT: Record<Lang, string[]> = {
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  pl: [],
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

/* ---------- holidays (the Polish calendar) ---------- */

type HolidaySet = 'off' | 'church' | 'observance';
type Origin = 'church' | 'secular';

interface HolidayDef {
  set: HolidaySet;
  origin: Origin;
  when: [number, number] | number; // [month, day], or days from Easter Sunday
  name: Record<Lang, string>;
  from?: number; // first year it applies
  until?: number; // last year it applies
}

const HOLIDAYS: HolidayDef[] = [
  // Public holidays: days off work in Poland.
  { set: 'off', origin: 'secular', when: [1, 1], name: { pl: 'Nowy Rok', en: 'New Year’s Day' } },
  { set: 'off', origin: 'church', when: [1, 6], name: { pl: 'Trzech Króli', en: 'Epiphany' }, from: 2011 },
  { set: 'off', origin: 'church', when: 0, name: { pl: 'Wielkanoc', en: 'Easter Sunday' } },
  { set: 'off', origin: 'church', when: 1, name: { pl: 'Poniedziałek Wielkanocny', en: 'Easter Monday' } },
  { set: 'off', origin: 'secular', when: [5, 1], name: { pl: 'Święto Pracy', en: 'Labour Day' } },
  { set: 'off', origin: 'secular', when: [5, 3], name: { pl: 'Święto Konstytucji 3 Maja', en: 'Constitution Day' } },
  { set: 'off', origin: 'church', when: 49, name: { pl: 'Zesłanie Ducha Świętego', en: 'Pentecost' } },
  { set: 'off', origin: 'church', when: 60, name: { pl: 'Boże Ciało', en: 'Corpus Christi' } },
  { set: 'off', origin: 'church', when: [8, 15], name: { pl: 'Wniebowzięcie NMP', en: 'Assumption Day' } },
  { set: 'off', origin: 'church', when: [11, 1], name: { pl: 'Wszystkich Świętych', en: 'All Saints’ Day' } },
  { set: 'off', origin: 'secular', when: [11, 11], name: { pl: 'Święto Niepodległości', en: 'Independence Day' } },
  { set: 'off', origin: 'church', when: [12, 24], name: { pl: 'Wigilia', en: 'Christmas Eve' }, from: 2025 },
  { set: 'off', origin: 'church', when: [12, 25], name: { pl: 'Boże Narodzenie', en: 'Christmas Day' } },
  { set: 'off', origin: 'church', when: [12, 26], name: { pl: 'Boże Narodzenie (drugi dzień)', en: 'Second day of Christmas' } },
  // Church days that are not days off.
  { set: 'church', origin: 'church', when: -46, name: { pl: 'Środa Popielcowa', en: 'Ash Wednesday' } },
  { set: 'church', origin: 'church', when: -3, name: { pl: 'Wielki Czwartek', en: 'Maundy Thursday' } },
  { set: 'church', origin: 'church', when: -2, name: { pl: 'Wielki Piątek', en: 'Good Friday' } },
  { set: 'church', origin: 'church', when: -1, name: { pl: 'Wielka Sobota', en: 'Holy Saturday' } },
  { set: 'church', origin: 'church', when: [12, 24], name: { pl: 'Wigilia', en: 'Christmas Eve' }, until: 2024 },
  // Observances: family and everyday days.
  { set: 'observance', origin: 'secular', when: [1, 21], name: { pl: 'Dzień Babci', en: 'Grandmother’s Day' } },
  { set: 'observance', origin: 'secular', when: [1, 22], name: { pl: 'Dzień Dziadka', en: 'Grandfather’s Day' } },
  { set: 'observance', origin: 'secular', when: [2, 14], name: { pl: 'Walentynki', en: 'Valentine’s Day' } },
  { set: 'observance', origin: 'secular', when: [3, 8], name: { pl: 'Dzień Kobiet', en: 'Women’s Day' } },
  { set: 'observance', origin: 'secular', when: [5, 26], name: { pl: 'Dzień Matki', en: 'Mother’s Day' } },
  { set: 'observance', origin: 'secular', when: [6, 1], name: { pl: 'Dzień Dziecka', en: 'Children’s Day' } },
  { set: 'observance', origin: 'secular', when: [6, 23], name: { pl: 'Dzień Ojca', en: 'Father’s Day' } },
  { set: 'observance', origin: 'secular', when: [12, 6], name: { pl: 'Mikołajki', en: 'St Nicholas Day' } },
];

export interface Holiday { day: number; set: HolidaySet; origin: Origin; name: string }

export function holidays(y: number, sets: HolidaySet[], lang: Lang): Holiday[] {
  const [em, ed] = easter(y);
  const e = dayOfYear(y, em, ed);
  return HOLIDAYS
    .filter((h) => sets.includes(h.set) && (h.from ?? -Infinity) <= y && y <= (h.until ?? Infinity))
    .map((h) => ({
      day: typeof h.when === 'number' ? e + h.when : dayOfYear(y, h.when[0], h.when[1]),
      set: h.set, origin: h.origin, name: h.name[lang],
    }))
    .sort((a, b) => a.day - b.day);
}

/* ---------- settings ---------- */

export type Ring = 'year' | 'seasons' | 'zodiac' | 'months';

/** A date of the reader's own: one day (circled) or a range (shaded). Days of the year, inclusive. */
export interface Mark { start: number; end: number; label: string; color: string; range: boolean; line: number }

export interface Issue { line: number; message: string }

export interface Calendar {
  format: number;
  year: number;
  firstDay: number; // 0 = Monday … 6 = Sunday
  rings: Ring[]; // from the centre outwards; the weekday rings always come last
  sets: HolidaySet[];
  tz: number; // minutes east of UTC, for the dates of equinoxes and solstices
  colors: Record<string, string>; // lower-case keys
  title: string;
  signature: string[];
  list: boolean;
  marks: Mark[];
  issues: Issue[];
}

const KEYS: Record<string, string> = {
  rok: 'year', year: 'year',
  'pierwszy dzień': 'firstDay', 'pierwszy dzien': 'firstDay', 'początek tygodnia': 'firstDay',
  'poczatek tygodnia': 'firstDay', 'first day': 'firstDay', 'week starts': 'firstDay', 'week start': 'firstDay',
  pierścienie: 'rings', pierscienie: 'rings', rings: 'rings',
  święta: 'sets', swieta: 'sets', holidays: 'sets',
  strefa: 'tz', 'strefa czasowa': 'tz', timezone: 'tz', 'time zone': 'tz',
  kolory: 'colors', colors: 'colors', colours: 'colors',
  tytuł: 'title', tytul: 'title', title: 'title',
  podpis: 'signature', signature: 'signature',
  lista: 'list', list: 'list',
  format: 'format',
};

const DAY_ALIAS: Record<string, number> = {};
['pn pon poniedziałek poniedzialek mon monday', 'wt wto wtorek tue tues tuesday',
  'śr sr śro sro środa sroda wed wednesday', 'cz czw czwartek thu thur thurs thursday',
  'pt pią pia piątek piatek fri friday', 'sb sob sobota sat saturday', 'nd nie ndz niedziela sun sunday',
].forEach((names, i) => names.split(' ').forEach((n) => { DAY_ALIAS[n] = i; }));

const RING_ALIAS: Record<string, Ring> = {
  rok: 'year', year: 'year',
  'pory roku': 'seasons', pory: 'seasons', seasons: 'seasons',
  zodiak: 'zodiac', zodiac: 'zodiac',
  miesiące: 'months', miesiace: 'months', months: 'months',
};

const SET_ALIAS: Record<string, HolidaySet[]> = {
  wolne: ['off'], 'dni wolne': ['off'], off: ['off'], 'days off': ['off'], public: ['off'],
  kościelne: ['church'], koscielne: ['church'], church: ['church'],
  okolicznościowe: ['observance'], okolicznosciowe: ['observance'], observances: ['observance'], observance: ['observance'],
  pl: ['off', 'church', 'observance'], wszystkie: ['off', 'church', 'observance'], all: ['off', 'church', 'observance'],
};

// Colour keys of the drawing itself; any other key colours the reader's dates by the first
// word of their label, like the weekly plan.
const COLOR_ALIAS: Record<string, string> = {
  weekend: 'weekend',
  wolne: 'off', 'dni wolne': 'off', off: 'off', 'days off': 'off',
  kościelne: 'church', koscielne: 'church', church: 'church',
  świeckie: 'secular', swieckie: 'secular', secular: 'secular',
  własne: 'own', wlasne: 'own', own: 'own',
  linie: 'lines', lines: 'lines',
};

export const DEFAULT_COLORS: Record<string, string> = {
  weekend: '#eaeaea',
  off: '#d5d5d5',
  church: '#0080ff',
  secular: '#ff4040',
  own: '#8b5e3c',
  lines: '#c0c0c0',
};

const NONE = new Set(['brak', 'none', '-']);
const YES = new Set(['tak', 'yes', 'on', 'true', '1']);
const NO = new Set(['nie', 'no', 'off', 'false', '0']);

const MSG: Record<Lang, Record<string, string>> = {
  en: {
    key: 'unknown setting “{0}”',
    line: 'a line should be a setting (name: value) or a date (14.03 Birthday)',
    year: 'write a year between ' + MIN_YEAR + ' and ' + MAX_YEAR,
    day: 'unknown day “{0}”',
    ring: 'unknown ring “{0}” (year, seasons, zodiac, months)',
    set: 'unknown holiday set “{0}” (days off, church, observances)',
    tz: 'write a time zone as +1 or -5:30',
    color: 'write a colour as name=#hex',
    list: 'write yes or no',
    date: 'there is no such date: {0}',
    order: 'the end is before the start',
    format: 'this plan was saved in format {0}, newer than this page knows (1); it may not show as intended',
  },
  pl: {
    key: 'nieznane ustawienie „{0}”',
    line: 'linia powinna być ustawieniem (nazwa: wartość) albo datą (14.03 Urodziny)',
    year: 'wpisz rok od ' + MIN_YEAR + ' do ' + MAX_YEAR,
    day: 'nieznany dzień „{0}”',
    ring: 'nieznany pierścień „{0}” (rok, pory roku, zodiak, miesiące)',
    set: 'nieznany zestaw świąt „{0}” (wolne, kościelne, okolicznościowe)',
    tz: 'wpisz strefę jako +1 albo -5:30',
    color: 'wpisz kolor jako nazwa=#hex',
    list: 'wpisz tak albo nie',
    date: 'nie ma takiej daty: {0}',
    order: 'koniec jest przed początkiem',
    format: 'ustawienia zapisano w formacie {0}, nowszym niż zna ta strona (1); mogą wyglądać inaczej, niż zamierzono',
  },
};

const RE_KEY = /^([\p{L}][\p{L} ]*?)\s*:\s*(.*)$/u;
// 2027-03-14 or 14.03 or 14.03.2027 (a trailing dot is allowed: 14.03.)
const DATE = '(?:(\\d{4})-(\\d{1,2})-(\\d{1,2})|(\\d{1,2})\\.(\\d{1,2})(?:\\.(\\d{4}))?\\.?)';
const RE_DATE = new RegExp(`^${DATE}(?:\\s*(?:\\.\\.|[-–—])\\s*${DATE})?(?:\\s+(.*))?$`);

interface RawDate { y?: number; m: number; d: number }
interface RawMark { from: RawDate; to?: RawDate; label: string; line: number }

const toDate = (g: (string | undefined)[]): RawDate =>
  g[0] ? { y: +g[0], m: +g[1]!, d: +g[2]! } : { y: g[5] ? +g[5] : undefined, m: +g[4]!, d: +g[3]! };

const validDate = ({ y, m, d }: RawDate) =>
  m >= 1 && m <= 12 && d >= 1 && d <= (y === undefined ? monthLengths(2000) : monthLengths(y))[m - 1];

const showDate = ({ y, m, d }: RawDate) => `${d}.${String(m).padStart(2, '0')}${y === undefined ? '' : '.' + y}`;

const list = (v: string) => v.split(',').map((s) => s.trim().replace(/\s+/g, ' ')).filter(Boolean);

export function parseCalendar(text: string, lang: Lang, defaultYear: number): Calendar {
  const msg = MSG[lang];
  const say = (key: string, arg: string | number = '') => msg[key].replace('{0}', String(arg));
  const issues: Issue[] = [];
  const cal: Calendar = {
    format: 1,
    year: Math.min(MAX_YEAR, Math.max(MIN_YEAR, defaultYear)),
    firstDay: 0,
    rings: ['year', 'seasons', 'months'],
    sets: [],
    tz: 0,
    colors: {},
    title: '',
    signature: [],
    list: true,
    marks: [],
    issues,
  };
  const raw: RawMark[] = [];

  // NFC first: text copied on macOS can carry "ś" as "s" + combining accent.
  text.normalize('NFC').split(/\r?\n/).forEach((full, i) => {
    const n = i + 1;
    // "#" starts a comment at the start of a line or after a space, so colours like #c0504d survive.
    const line = full.trim().startsWith('#') ? '' : full.replace(/\s#\s.*$/, '').trim();
    if (!line) return;

    if (/^\d/.test(line)) {
      const m = line.match(RE_DATE);
      if (!m) { issues.push({ line: n, message: say('line') }); return; }
      const from = toDate(m.slice(1, 7));
      const to = m[7] || m[10] ? toDate(m.slice(7, 13)) : undefined;
      const bad = [from, to].find((d) => d && !validDate(d));
      if (bad) { issues.push({ line: n, message: say('date', showDate(bad)) }); return; }
      if (to && (from.y === undefined) !== (to.y === undefined)) {
        // 1.07-31.08.2027: the year on one end applies to both.
        if (from.y === undefined) from.y = to.y; else to.y = from.y;
      }
      raw.push({ from, to, label: (m[13] ?? '').trim(), line: n });
      return;
    }

    const kv = line.match(RE_KEY);
    const key = kv ? KEYS[kv[1].toLowerCase().replace(/\s+/g, ' ')] : undefined;
    if (!kv) { issues.push({ line: n, message: say('line') }); return; }
    if (!key) { issues.push({ line: n, message: say('key', kv[1]) }); return; }
    const value = kv[2].trim();
    const low = value.toLowerCase();

    if (key === 'year') {
      const y = Number(value);
      if (Number.isInteger(y) && y >= MIN_YEAR && y <= MAX_YEAR) cal.year = y;
      else issues.push({ line: n, message: say('year') });
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
    } else if (key === 'sets') {
      cal.sets = [];
      for (const s of list(low)) {
        if (NONE.has(s)) continue;
        const sets = SET_ALIAS[s.replace(/^pl[- ]/, '')];
        if (!sets) issues.push({ line: n, message: say('set', s) });
        else sets.forEach((x) => { if (!cal.sets.includes(x)) cal.sets.push(x); });
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
        if (!c) { issues.push({ line: n, message: say('color') }); continue; }
        const name = c[1].toLowerCase().replace(/\s+/g, ' ');
        cal.colors[COLOR_ALIAS[name] ?? name] = c[2];
      }
    } else if (key === 'title') {
      cal.title = value;
    } else if (key === 'signature') {
      cal.signature.push(value);
    } else if (key === 'list') {
      if (YES.has(low)) cal.list = true;
      else if (NO.has(low)) cal.list = false;
      else issues.push({ line: n, message: say('list') });
    } else if (key === 'format') {
      const f = Number(value);
      if (Number.isInteger(f) && f >= 1) {
        cal.format = f;
        if (f > FORMAT_VERSION) issues.push({ line: n, message: say('format', f) });
      }
    }
  });

  // Dates are placed once the year is known: the `rok:` line may come after them.
  const y = cal.year;
  const N = daysInYear(y);
  const y0 = epochDay(y, 1, 1);
  const colorOf = (label: string) => {
    const first = (label.split(/\s+/)[0] ?? '').toLowerCase().replace(/[^\p{L}\p{N}]+$/u, '');
    return cal.colors[first] ?? cal.colors[label.toLowerCase()] ?? cal.colors.own ?? DEFAULT_COLORS.own;
  };
  for (const r of raw) {
    const color = colorOf(r.label);
    const add = (start: number, end: number) => {
      const s = Math.max(0, start), e = Math.min(N - 1, end);
      if (s <= e) cal.marks.push({ start: s, end: e, label: r.label, color, range: !!r.to, line: r.line });
    };
    if (!r.to) {
      if (r.from.y !== undefined && r.from.y !== y) continue; // another year's date
      if (r.from.m === 2 && r.from.d === 29 && !isLeap(y)) continue; // a 29 February birthday
      const d = dayOfYear(y, r.from.m, r.from.d);
      add(d, d);
    } else if (r.from.y !== undefined) {
      // A range with years: the part that falls in this year.
      const a = epochDay(r.from.y, r.from.m, r.from.d) - y0, b = epochDay(r.to.y!, r.to.m, r.to.d) - y0;
      if (b < a) { issues.push({ line: r.line, message: say('order') }); continue; }
      add(a, b);
    } else {
      // A yearly range; one that crosses New Year (20.12-6.01) shows at both ends of the year.
      const a = epochDay(y, r.from.m, Math.min(r.from.d, monthLengths(y)[r.from.m - 1])) - y0;
      const b = epochDay(y, r.to.m, Math.min(r.to.d, monthLengths(y)[r.to.m - 1])) - y0;
      if (b >= a) add(a, b); else { add(a, N - 1); add(0, b); }
    }
  }

  issues.sort((a, b) => a.line - b.line);
  return cal;
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

/* ---------- drawing ---------- */

// The sheet is A4 portrait at 96 dpi; the margin leaves room for printers that cannot print to the edge.
export const SHEET = { width: 794, height: 1123 };
const M = 26;
const FONT = 'Inter, Arial, Helvetica, sans-serif';

// Text width estimate (in ems) for a sans-serif face, so layout does not depend on the DOM.
function textWidth(s: string, size: number): number {
  let w = 0;
  for (const ch of s) {
    if (' .,:;\'|!'.includes(ch)) w += 0.28;
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

function truncate(s: string, size: number, maxW: number): string {
  if (textWidth(s, size) <= maxW) return s;
  let t = s;
  while (t.length > 1 && textWidth(t + '…', size) > maxW) t = t.slice(0, -1);
  return t.trimEnd() + '…';
}

const BELT_SIZE: Record<Ring, number> = { year: 0.5, seasons: 0.5, zodiac: 0.5, months: 0.5 };
const BELT_FONT: Record<Ring, number> = { year: 0, seasons: 16, zodiac: 11, months: 13 };
const BELT_INK: Record<Ring, string> = { year: '#959595', seasons: '#959595', zodiac: '#959595', months: '#6b6b6b' };

export function formatDay(y: number, doy: number, lang: Lang): string {
  const t = new Date((epochDay(y, 1, 1) + doy) * 86400000);
  const m = t.getUTCMonth(), d = t.getUTCDate();
  return lang === 'pl' ? `${d}.${String(m + 1).padStart(2, '0')}` : `${d} ${MONTHS_SHORT.en[m]}`;
}

interface Entry { start: number; end: number; name: string; kind: 'off' | 'church' | 'secular' | 'circle' | 'range'; color: string }

export function renderCalendar(cal: Calendar, lang: Lang): string {
  const { year: y, firstDay, rings } = cal;
  const color = (k: string) => cal.colors[k] ?? DEFAULT_COLORS[k];
  const { width: W, height: H } = SHEET;
  const N = daysInYear(y);
  const offset = (weekday(y, 0) - firstDay + 7) % 7;
  const weeks = Math.ceil((offset + N) / 7);
  const C = weeks + 1; // one more column for the weekday names, centred at the top
  const step = 360 / C;
  const base = 270 - step / 2;
  const colStart = (c: number) => base + c * step;
  const dayAngle = (d: number) => base + step * (1 + (offset + d) / 7);
  const cellOf = (d: number) => ({ col: 1 + Math.floor((offset + d) / 7), ring: (offset + d) % 7 });

  // Rings of equal area, as in the original: the outer weekday rings are thinner but longer.
  const hasYear = rings.includes('year');
  const belts = rings.filter((r) => r !== 'year');
  const centre = hasYear ? BELT_SIZE.year : 0.2;
  const total = centre + belts.reduce((s, r) => s + BELT_SIZE[r], 0) + 7;
  const R = W / 2 - M;
  const cx = W / 2;
  const cy = cal.list ? M + R : H / 2;
  const rAt = (part: number) => Math.sqrt(part / total) * R;
  const beltR: Record<string, [number, number]> = {};
  let acc = centre;
  for (const b of belts) { beltR[b] = [rAt(acc), rAt(acc + BELT_SIZE[b])]; acc += BELT_SIZE[b]; }
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

  // Text set along the circle at its centre point, turned so it never stands upside down.
  const tangentText = (a: number, r: number, s: string, size: number, fill: string, weight = 700) => {
    const lower = Math.sin(rad(a)) > 0;
    const rot = lower ? a - 90 : a + 90;
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

  const hol = holidays(y, cal.sets, lang);
  const offDays = new Set(hol.filter((h) => h.set === 'off').map((h) => h.day));
  const ink = new Map<number, string>();
  for (const h of hol) if (!ink.has(h.day) || h.set === 'off') ink.set(h.day, color(h.origin));

  const o: string[] = [];
  o.push(`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="210mm" height="297mm" viewBox="0 0 ${W} ${H}" font-family="${esc(FONT)}" role="img">`);
  o.push(`<rect width="${W}" height="${H}" fill="#ffffff"/>`);

  // Shading: weekends, days off, then the reader's ranges on top.
  const weekendPath: string[] = [], offPath: string[] = [];
  for (let d = 0; d < N; d++) {
    const wd = (cellOf(d).ring + firstDay) % 7;
    if (offDays.has(d)) offPath.push(cell(d));
    else if (wd >= 5) weekendPath.push(cell(d));
  }
  if (weekendPath.length) o.push(`<path d="${weekendPath.join(' ')}" fill="${esc(color('weekend'))}"/>`);
  if (offPath.length) o.push(`<path d="${offPath.join(' ')}" fill="${esc(color('off'))}"/>`);
  for (const m of cal.marks.filter((x) => x.range)) {
    const parts: string[] = [];
    for (let d = m.start; d <= m.end; d++) parts.push(cell(d));
    o.push(`<path d="${parts.join(' ')}" fill="${esc(m.color)}" fill-opacity="0.3"/>`);
  }

  // Lines: circles between the bands, steps between months, ticks inside the bands.
  const line = color('lines');
  o.push(`<g fill="none" stroke="${esc(line)}" stroke-linejoin="round">`);
  for (const r of [rAt(centre), ...belts.map((b) => beltR[b][1])]) {
    o.push(`<circle cx="${r2(cx)}" cy="${r2(cy)}" r="${r2(r)}" stroke-width="1.2"/>`);
  }

  const monthStarts = Array.from({ length: 13 }, (_, i) => (i < 12 ? dayOfYear(y, i + 1, 1) : N));
  const monthsOuter = belts[belts.length - 1] === 'months';
  const stepPath = (d: number) => {
    const { col, ring } = cellOf(d);
    const a0 = colStart(col), a1 = colStart(col + 1), aM = dayAngle(d);
    const into = monthsOuter ? ` L ${P(aM, beltR.months[0])}` : '';
    if (ring === 0) return `M ${P(a0, R)} L ${P(a0, monthsOuter ? beltR.months[0] : r0)}`;
    const rk = dayR(ring)[0];
    return `M ${P(a0, R)} L ${P(a0, rk)} ${arcTo(a0, a1, rk)} L ${P(a1, r0)} ${arcTo(a1, aM, r0)}${into}`;
  };
  o.push(`<path d="${monthStarts.map(stepPath).join(' ')}" stroke-width="2"/>`);
  // The outer edge runs from the first day of the year to the last.
  const first = cellOf(0), last = cellOf(N);
  o.push(`<path d="M ${P(colStart(first.col), R)} ${arcTo(colStart(first.col), colStart(last.col), R)}" stroke-width="2"/>`);
  o.push(`<path d="M ${P(base + step, r0)} ${arcTo(base + step, base + 360 - 0.001, r0)}" stroke-width="1.2"/>`);

  const beltSegments = (b: Ring): { start: number; end: number; label: string }[] => {
    const names = b === 'seasons' ? SEASONS[lang] : b === 'zodiac' ? ZODIAC[lang] : MONTHS[lang];
    let starts: number[];
    if (b === 'seasons') starts = [0, 1, 2, 3].map((i) => seasonStart(y, i, cal.tz));
    else if (b === 'zodiac') starts = ZODIAC_STARTS.map(([m, d]) => dayOfYear(y, m, d));
    else starts = monthStarts.slice(0, 12);
    const segs = starts.map((s, i) => ({ start: s, label: names[i] }));
    segs.sort((a, b2) => a.start - b2.start);
    return segs.map((s, i) => ({
      start: dayAngle(s.start),
      end: b === 'months' ? dayAngle(monthStarts[monthStarts.indexOf(s.start) + 1])
        : i + 1 < segs.length ? dayAngle(segs[i + 1].start) : dayAngle(segs[0].start) + 360,
      label: s.label,
    }));
  };
  const segs: Record<string, { start: number; end: number; label: string }[]> = {};
  for (const b of belts) {
    segs[b] = beltSegments(b);
    const [ri, ro] = beltR[b];
    const ticks = segs[b].map((s) => s.start);
    if (b === 'months') ticks.push(dayAngle(N));
    o.push(`<path d="${ticks.map((a) => `M ${P(a, ri)} L ${P(a, ro)}`).join(' ')}" stroke-width="${b === 'months' ? 2 : 1.2}"/>`);
  }
  o.push('</g>');

  // Texts.
  const ringArc = (k: number) => rad(step) * rMid(dayR(k));
  const outerThick = R - dayR(6)[0];
  const fDay = Math.min(11.5, outerThick * 0.55, ringArc(0) * 0.62);
  o.push('<g>');
  for (let d = 0; d < N; d++) {
    const { col, ring } = cellOf(d);
    const a = colStart(col) + step / 2;
    const t = new Date((epochDay(y, 1, 1) + d) * 86400000).getUTCDate();
    o.push(tangentText(a, rMid(dayR(ring)), String(t), fDay, ink.get(d) ?? '#404040'));
  }
  for (let k = 0; k < 7; k++) {
    const name = WEEKDAYS[lang][(k + firstDay) % 7];
    const f = Math.min(fDay, fitSize(name, fDay, ringArc(k) * 0.85));
    o.push(tangentText(base + step / 2, rMid(dayR(k)), name, f, '#6b6b6b'));
  }
  for (const b of belts) {
    const [ri, ro] = beltR[b];
    const r = (ri + ro) / 2;
    for (const s of segs[b]) {
      const len = rad(s.end - s.start) * r;
      const f = Math.min(BELT_FONT[b], (ro - ri) * 0.62, fitSize(s.label, BELT_FONT[b], len * 0.88));
      if (f >= 4) o.push(arcText(s.start, s.end, r, s.label, f, BELT_INK[b]));
    }
  }
  if (hasYear) {
    const title = cal.title || String(y);
    const rc = rAt(centre);
    const f = Math.min(rc * 0.5, fitSize(title, rc * 0.5, rc * 1.6));
    o.push(`<text x="${r2(cx)}" y="${r2(cy + f * 0.35)}" font-size="${r2(f)}" font-weight="700" text-anchor="middle" fill="${BELT_INK.year}">${esc(title)}</text>`);
  }
  o.push('</g>');

  // The reader's single days: a ring round the number, as if circled with a pen.
  const circles = cal.marks.filter((m) => !m.range);
  if (circles.length) {
    o.push('<g fill="none" stroke-width="1.4">');
    for (const m of circles) {
      const { col, ring } = cellOf(m.start);
      const [x, yy] = P(colStart(col) + step / 2, rMid(dayR(ring))).split(' ');
      o.push(`<circle cx="${x}" cy="${yy}" r="${r2(fDay * 0.95)}" stroke="${esc(m.color)}"/>`);
    }
    o.push('</g>');
  }

  // The list of named days under the disc.
  const sigH = cal.signature.length ? cal.signature.length * 12 + 6 : 0;
  if (cal.list) {
    const entries: Entry[] = [
      ...hol.map((h): Entry => ({
        start: h.day, end: h.day, name: h.name,
        kind: h.set === 'off' ? 'off' : h.origin, color: color(h.origin),
      })),
      ...cal.marks.filter((m) => m.label).map((m): Entry => ({
        start: m.start, end: m.end, name: m.label, kind: m.range ? 'range' : 'circle', color: m.color,
      })),
    ].sort((a, b) => a.start - b.start || a.end - b.end);
    // A day off that is also a church day (Christmas Eve) is listed once.
    const seen = new Set<string>();
    const uniq = entries.filter((e) => { const k = `${e.start}|${e.name}`; if (seen.has(k)) return false; seen.add(k); return true; });

    if (uniq.length) {
      const top = cy + R + 26, bottom = H - M - sigH;
      const cols = 3;
      const colW = (W - 2 * M) / cols;
      const rows = Math.max(1, Math.ceil(uniq.length / cols));
      const lh = Math.min(16, (bottom - top) / rows);
      const fs = Math.min(10.5, lh * 0.72);
      const dateOf = (e: Entry) => formatDay(y, e.start, lang) + (e.end > e.start ? '–' + formatDay(y, e.end, lang) : '');
      const dateW = Math.max(...uniq.map((e) => textWidth(dateOf(e), fs))) * 1.08; // bold runs wider
      o.push(`<g font-size="${r2(fs)}">`);
      uniq.forEach((e, i) => {
        const x = M + Math.floor(i / rows) * colW;
        const yy = top + (i % rows) * lh + lh / 2;
        const sq = fs * 0.85;
        if (e.kind === 'off') o.push(`<rect x="${r2(x)}" y="${r2(yy - sq / 2)}" width="${r2(sq)}" height="${r2(sq)}" fill="${esc(color('off'))}"/>`);
        if (e.kind === 'range') o.push(`<rect x="${r2(x)}" y="${r2(yy - sq / 2)}" width="${r2(sq)}" height="${r2(sq)}" fill="${esc(e.color)}" fill-opacity="0.3"/>`);
        if (e.kind === 'circle') o.push(`<circle cx="${r2(x + sq / 2)}" cy="${r2(yy)}" r="${r2(sq / 2)}" fill="none" stroke="${esc(e.color)}" stroke-width="1.2"/>`);
        const dateInk = e.kind === 'off' || e.kind === 'church' || e.kind === 'secular' ? e.color : '#404040';
        const tx = x + sq + 6;
        o.push(`<text x="${r2(tx)}" y="${r2(yy + fs * 0.35)}" font-weight="700" fill="${esc(dateInk)}" style="font-variant-numeric: tabular-nums">${esc(dateOf(e))}</text>`);
        const nx = tx + dateW + 7;
        o.push(`<text x="${r2(nx)}" y="${r2(yy + fs * 0.35)}" fill="#333333">${esc(truncate(e.name, fs, x + colW - 8 - nx))}</text>`);
      });
      o.push('</g>');
    }
  }

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
