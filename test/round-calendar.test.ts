// Checks for the round calendar: the computed dates against published ones, the settings syntax
// in both languages, and that every year in range draws.
//
// Run: npm test.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  easter, seasonMoment, parseCalendar, renderCalendar, holidays, dayOfYear, weekday, withFormatLine,
  MIN_YEAR, MAX_YEAR,
} from '../src/round-calendar.ts';
import { EXAMPLE } from '../src/examples.ts';

test('Easter matches published dates', () => {
  const known: Record<number, [number, number]> = {
    1818: [3, 22], 1943: [4, 25], 2000: [4, 23], 2018: [4, 1], 2019: [4, 21], 2024: [3, 31],
    2025: [4, 20], 2026: [4, 5], 2027: [3, 28], 2038: [4, 25], 2285: [3, 22],
  };
  for (const [y, md] of Object.entries(known)) assert.deepEqual(easter(+y), md, `Easter ${y}`);
});

test('equinoxes and solstices are within a few minutes of published times (UTC)', () => {
  const known: [number, number, string][] = [
    [2025, 0, '2025-03-20T09:01'], [2025, 1, '2025-06-21T02:42'], [2025, 2, '2025-09-22T18:19'], [2025, 3, '2025-12-21T15:03'],
    [2026, 0, '2026-03-20T14:46'], [2026, 1, '2026-06-21T08:24'], [2026, 2, '2026-09-23T00:05'], [2026, 3, '2026-12-21T20:50'],
    [2027, 0, '2027-03-20T20:24'], [2027, 1, '2027-06-21T14:10'], [2027, 2, '2027-09-23T06:01'], [2027, 3, '2027-12-22T02:42'],
  ];
  for (const [y, i, iso] of known) {
    const diff = Math.abs(seasonMoment(y, i) - Date.parse(iso + 'Z')) / 60000;
    assert.ok(diff < 3, `${iso}: off by ${diff.toFixed(1)} min`);
  }
});

test('weekdays and days of the year', () => {
  assert.equal(weekday(2027, 0), 4); // Friday
  assert.equal(weekday(2026, 0), 3); // Thursday
  assert.equal(dayOfYear(2028, 3, 1), 60); // after 29 February
  assert.equal(dayOfYear(2027, 3, 1), 59);
});

test('Polish holidays follow the law of the given year', () => {
  const names = (y: number) => holidays(y, ['off'], 'pl').map((h) => h.name);
  assert.ok(!names(2010).includes('Trzech Króli'));
  assert.ok(names(2011).includes('Trzech Króli'));
  assert.ok(!names(2024).includes('Wigilia'));
  assert.ok(names(2025).includes('Wigilia'));
  assert.equal(holidays(2027, ['off'], 'pl').find((h) => h.name === 'Boże Ciało')?.day, dayOfYear(2027, 5, 27));
});

test('both examples read without issues', () => {
  for (const lang of ['en', 'pl'] as const) {
    const cal = parseCalendar(EXAMPLE[lang], lang, 2026);
    assert.deepEqual(cal.issues, [], lang);
    assert.equal(cal.year, 2027);
    assert.equal(cal.marks.length, 6);
  }
});

test('a file reads the same on either page', () => {
  for (const text of [EXAMPLE.en, EXAMPLE.pl]) {
    const en = parseCalendar(text, 'en', 2026), pl = parseCalendar(text, 'pl', 2026);
    assert.deepEqual({ ...en, issues: en.issues.map((i) => i.line) }, { ...pl, issues: pl.issues.map((i) => i.line) });
  }
});

test('settings', () => {
  const cal = parseCalendar(
    'year: 2028\nfirst day: sun\nrings: zodiac, months\nholidays: pl\ntimezone: -5:30\nlist: no\ncolors: weekend=#eee, trip=#123456',
    'en', 2026);
  assert.deepEqual(cal.issues, []);
  assert.equal(cal.year, 2028);
  assert.equal(cal.firstDay, 6);
  assert.deepEqual(cal.rings, ['zodiac', 'months']);
  assert.deepEqual(cal.sets, ['off', 'church', 'observance']);
  assert.equal(cal.tz, -330);
  assert.equal(cal.list, false);
  assert.deepEqual(cal.colors, { weekend: '#eee', trip: '#123456' });
});

test('own dates', () => {
  const cal = parseCalendar([
    'rok: 2027',
    'kolory: urodziny=#c0504d',
    '14.03 Urodziny Ady', // yearly, coloured by the first word
    '29.02 Przestępny', // no 29 February in 2027: skipped
    '2026-05-01 Zeszły rok', // another year: skipped
    '20.12-6.01 Ferie', // across New Year: both ends
    '2026-12-28..2027-01-03 Wyjazd', // with years: the part in 2027
    '7.04', // circled, not named
    '31.04 Nie ma', // no such date
    '2027-03-10 - 2027-03-01 Wstecz', // end before start
  ].join('\n'), 'pl', 2026);
  assert.deepEqual(cal.issues.map((i) => i.line), [9, 10]);
  const marks = cal.marks.map(({ start, end, label, color, range }) => [start, end, label, color, range]);
  assert.deepEqual(marks, [
    [72, 72, 'Urodziny Ady', '#c0504d', false],
    [353, 364, 'Ferie', '#8b5e3c', true],
    [0, 5, 'Ferie', '#8b5e3c', true],
    [0, 2, 'Wyjazd', '#8b5e3c', true],
    [96, 96, '', '#8b5e3c', false],
  ]);
});

test('unknown lines are reported, the rest still reads', () => {
  const cal = parseCalendar('rok: 2027\nkolor: x\nnic tu nie ma\n14.03 A\nrok: 1200', 'pl', 2026);
  assert.deepEqual(cal.issues.map((i) => i.line), [2, 3, 5]);
  assert.equal(cal.year, 2027);
  assert.equal(cal.marks.length, 1);
});

test('the format line is added once, after leading comments', () => {
  assert.equal(withFormatLine('# a\nrok: 2027\n'), '# a\nformat: 1\nrok: 2027\n');
  assert.equal(withFormatLine('format: 1\nrok: 2027'), 'format: 1\nrok: 2027');
});

test('every kind of year draws', () => {
  const years = [MIN_YEAR, 1900, 2000, 2023, 2024, 2026, 2027, 2028, 2100, MAX_YEAR];
  for (const y of years) for (let d = 0; d < 7; d++) {
    const cal = parseCalendar(`rok: ${y}\npierwszy dzień: ${['pn', 'wt', 'śr', 'cz', 'pt', 'sb', 'nd'][d]}\npierścienie: rok, pory roku, zodiak, miesiące\nświęta: pl`, 'pl', 2026);
    const svg = renderCalendar(cal, 'pl');
    assert.ok(svg.startsWith('<svg') && svg.endsWith('</svg>'), `${y}/${d}`);
    assert.ok(!svg.includes('NaN'), `${y}/${d} has NaN`);
  }
});
