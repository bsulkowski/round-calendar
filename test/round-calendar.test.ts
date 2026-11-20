// Checks: equinoxes and solstices against published times, the settings in both languages,
// the range of days and what ends up at the top, and that every kind of year draws.
//
// Run: npm test.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  seasonMoment, parseCalendar, renderCalendar, calendarRange, layoutCalendar, dateOf, epochDay, weekday,
  withFormatLine, MIN_YEAR, MAX_YEAR,
} from '../src/round-calendar.ts';
import { EXAMPLE } from '../src/examples.ts';

const iso = (e: number) => dateOf(e).map((v, i) => String(v).padStart(i ? 2 : 4, '0')).join('-');
const range = (text: string) => {
  const cal = parseCalendar(text, 'pl', 2026);
  const r = calendarRange(cal);
  return { from: iso(r.start), to: iso(r.start + r.days - 1), days: r.days, issues: cal.issues.map((i) => i.line) };
};
/** The angle of the top of the disc, measured from where column 0 begins, in the turned layout. */
const atTop = (text: string, lang: 'en' | 'pl' = 'pl') => {
  const cal = parseCalendar(text, lang, 2026);
  const L = layoutCalendar(cal, lang);
  return { L, cal, top: (((270 - L.base) % 360) + 360) % 360 };
};

test('equinoxes and solstices are within a few minutes of published times (UTC)', () => {
  const known: [number, number, string][] = [
    [2025, 0, '2025-03-20T09:01'], [2025, 1, '2025-06-21T02:42'], [2025, 2, '2025-09-22T18:19'], [2025, 3, '2025-12-21T15:03'],
    [2026, 0, '2026-03-20T14:46'], [2026, 1, '2026-06-21T08:24'], [2026, 2, '2026-09-23T00:05'], [2026, 3, '2026-12-21T20:50'],
    [2027, 0, '2027-03-20T20:24'], [2027, 1, '2027-06-21T14:10'], [2027, 2, '2027-09-23T06:01'], [2027, 3, '2027-12-22T02:42'],
  ];
  for (const [y, i, t] of known) {
    const diff = Math.abs(seasonMoment(y, i) - Date.parse(t + 'Z')) / 60000;
    assert.ok(diff < 3, `${t}: off by ${diff.toFixed(1)} min`);
  }
});

test('weekdays', () => {
  assert.equal(weekday(epochDay(2027, 1, 1)), 4); // Friday
  assert.equal(weekday(epochDay(2026, 9, 1)), 1); // Tuesday
});

test('both examples read without issues and mean the same', () => {
  const en = parseCalendar(EXAMPLE.en, 'en', 2026), pl = parseCalendar(EXAMPLE.pl, 'pl', 2026);
  assert.deepEqual(en.issues, []);
  assert.deepEqual(pl.issues, []);
  assert.deepEqual(en, pl);
});

test('the range: a calendar year by default, otherwise from the given day for a year', () => {
  assert.deepEqual(range('rok: 2027'), { from: '2027-01-01', to: '2027-12-31', days: 365, issues: [] });
  assert.deepEqual(range('rok: 2026\nod: 1.09'), { from: '2026-09-01', to: '2027-08-31', days: 365, issues: [] });
  assert.deepEqual(range('od: 1.09\nrok: 2027'), { from: '2027-09-01', to: '2028-08-31', days: 366, issues: [] }); // order does not matter
  assert.deepEqual(range('od: 2027-03-01'), { from: '2027-03-01', to: '2028-02-29', days: 366, issues: [] }); // a full date sets the year
  assert.deepEqual(range('rok: 2028\nod: 29.02'), { from: '2028-02-29', to: '2029-02-28', days: 366, issues: [] });
  assert.deepEqual(range('rok: 2027\nod: 29.02'), { from: '2027-01-01', to: '2027-12-31', days: 365, issues: [2] });
});

test('the range from a season runs to the day before it starts again', () => {
  // Spring 2027 starts on 20 March in Poland; spring 2028 on 20 March.
  assert.deepEqual(range('rok: 2027\nod: wiosna\nstrefa: +1'), { from: '2027-03-20', to: '2028-03-19', days: 366, issues: [] });
  // Winter 2026 starts on 21 December, winter 2027 on 22 December.
  assert.deepEqual(range('rok: 2026\nod: zima\nstrefa: +1'), { from: '2026-12-21', to: '2027-12-21', days: 366, issues: [] });
  // The time zone moves a moment near midnight: the 2027 December solstice is at 02:42 UTC.
  assert.equal(range('rok: 2027\nod: zima\nstrefa: -5').from, '2027-12-21');
  assert.equal(range('rok: 2027\nod: zima\nstrefa: +1').from, '2027-12-22');
});

test('the seam is at the top by default', () => {
  const { L, top } = atTop('rok: 2027');
  assert.ok(Math.abs(top - L.step / 2) < 1e-9);
});

test('a date at the top: its week column is centred on top', () => {
  for (const text of ['rok: 2027\ngóra: 1.09', 'rok: 2026\nod: 1.09\ngóra: 15.01', 'year: 2027\ntop: 2027-06-30']) {
    const { L, cal, top } = atTop(text);
    assert.deepEqual(cal.issues, []);
    const t = cal.top as { m: number; d: number };
    const [y0] = dateOf(L.range.start);
    let i = epochDay(y0, t.m, t.d) - L.range.start;
    if (i < 0) i = epochDay(y0 + 1, t.m, t.d) - L.range.start;
    const col = 1 + Math.floor((L.offset + i) / 7);
    assert.ok(Math.abs(top - (col + 0.5) * L.step) < 1e-9, text);
  }
});

test('a season or a month at the top: the middle of its stretch is on top', () => {
  for (const [text, band, key] of [
    ['rok: 2027\ngóra: zima', 'seasons', 3], // winter runs across the seam
    ['rok: 2026\nod: 1.09\ngóra: lato', 'seasons', 1],
    ['year: 2027\ntop: march', 'months', 2],
    ['rok: 2027\nod: 15.03\ngóra: marzec', 'months', 2], // March in two pieces, joined across the seam
  ] as const) {
    const { L, top } = atTop(text);
    const N = L.range.days;
    const rel = (x: number) => L.step * (1 + (L.offset + x) / 7);
    const s = L.segments[band]!.find((x) => x.key === key)!;
    const mid = (rel(s.from) + (s.to <= N ? rel(s.to) : rel(s.to - N) + 360)) / 2;
    assert.ok(Math.abs(top - (mid % 360)) < 1e-9, text);
  }
});

test('bands: one stretch per season and month, covering the whole range', () => {
  for (const text of ['rok: 2027', 'rok: 2026\nod: 1.09', 'rok: 2027\nod: wiosna', 'rok: 2027\nod: 15.03']) {
    const { L } = atTop(text);
    for (const [band, n] of [['seasons', 4], ['months', 12], ['zodiac', 12]] as const) {
      const segs = L.segments[band]!;
      assert.equal(segs.length, n, `${text}: ${band}`);
      const covered = segs.reduce((s, x) => s + x.to - x.from, 0);
      assert.equal(covered, L.range.days, `${text}: ${band}`);
    }
  }
});

test('unknown lines and values are reported, the rest still reads', () => {
  const cal = parseCalendar([
    'rok: 2027', 'od: 31.04', 'góra: przedwiośnie', 'święta: pl', '14.03 Urodziny', 'kolory: weekend=#eee, sobota=#f00',
    'od: 1.10',
  ].join('\n'), 'pl', 2026);
  assert.deepEqual(cal.issues.map((i) => i.line), [2, 3, 4, 5, 6]);
  assert.deepEqual(calendarRange(cal).start, epochDay(2027, 10, 1));
  assert.deepEqual(cal.colors, { weekend: '#eee' });
});

test('a date at the top must fall in the calendar', () => {
  const cal = parseCalendar('rok: 2027\ngóra: 29.02', 'pl', 2026);
  assert.deepEqual(cal.issues.map((i) => i.line), [2]);
  assert.deepEqual(cal.top, { kind: 'seam' });
  assert.deepEqual(parseCalendar('rok: 2027\nod: 1.09\ngóra: 29.02', 'pl', 2026).issues, []); // 29.02.2028
});

test('the format line is added once, after leading comments', () => {
  assert.equal(withFormatLine('# a\nrok: 2027\n'), '# a\nformat: 1\nrok: 2027\n');
  assert.equal(withFormatLine('format: 1\nrok: 2027'), 'format: 1\nrok: 2027');
});

test('every kind of year draws', () => {
  const days = ['pn', 'wt', 'śr', 'cz', 'pt', 'sb', 'nd'];
  const starts = ['1.01', '1.09', '29.02', '15.03', 'wiosna', 'zima'];
  const tops = ['łączenie', 'zima', 'lato', 'styczeń', 'sierpień', '1.06'];
  for (const y of [MIN_YEAR, 1900, 2000, 2023, 2024, 2026, 2027, 2028, 2100, MAX_YEAR]) {
    for (let d = 0; d < 7; d++) {
      const start = starts[(y + d) % starts.length], top = tops[(y * 3 + d) % tops.length];
      const text = `rok: ${y}\nod: ${start}\ngóra: ${top}\npierwszy dzień: ${days[d]}\npierścienie: rok, pory roku, zodiak, miesiące`;
      const cal = parseCalendar(text, 'pl', 2026);
      const svg = renderCalendar(cal, 'pl');
      assert.ok(svg.startsWith('<svg') && svg.endsWith('</svg>'), text);
      assert.ok(!svg.includes('NaN'), `${text}: NaN`);
    }
  }
});
