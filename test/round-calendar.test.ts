// Checks: equinoxes and solstices against published times, the settings in both languages,
// the range of days and what ends up at the top, and that every kind of year draws.
//
// Run: npm test.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  seasonMoment, seasonDay, parseCalendar, renderCalendar, calendarRange, layoutCalendar, counterSegments, counterStart, dateOf, epochDay, weekday,
  withFormatLine, formatCalendar, bandSegments, MIN_YEAR, MAX_YEAR,
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
  // How far the top lies from where column 0 begins, along the time direction.
  return { L, cal, top: (((L.turn * (270 - L.base)) % 360) + 360) % 360 };
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
  // The same apart from the counter's name, which is the reader's own text.
  const unnamed = (c: typeof en) => ({ ...c, counters: c.counters.map((x) => ({ ...x, name: '' })) });
  assert.deepEqual(unnamed(en), unnamed(pl));
});

test('the range: a calendar year by default, otherwise from the given day for a year', () => {
  assert.deepEqual(range('rok: 2027'), { from: '2027-01-01', to: '2027-12-31', days: 365, issues: [] });
  assert.deepEqual(range('rok: 2026\nod: 1.09'), { from: '2026-09-01', to: '2027-08-31', days: 365, issues: [] });
  assert.deepEqual(range('od: 1.09\nrok: 2027'), { from: '2027-09-01', to: '2028-08-31', days: 366, issues: [] }); // order does not matter
  assert.deepEqual(range('od: 2027-03-01'), { from: '2027-03-01', to: '2028-02-29', days: 366, issues: [] }); // a full date sets the year
  assert.deepEqual(range('rok: 2028\nod: 29.02'), { from: '2028-02-29', to: '2029-02-28', days: 366, issues: [] });
  assert.deepEqual(range('rok: 2027\nod: 29.02'), { from: '2027-01-01', to: '2027-12-31', days: 365, issues: [2] });
});

test('the range from an equinox or solstice runs to the day before it comes again', () => {
  // The March equinox 2027 falls on 20 March in Poland; in 2028 on 20 March.
  assert.deepEqual(range('rok: 2027\nod: równonoc marcowa\nstrefa: +1'), { from: '2027-03-20', to: '2028-03-19', days: 366, issues: [] });
  // The December solstice 2026 falls on 21 December, in 2027 on 22 December.
  assert.deepEqual(range('rok: 2026\nod: przesilenie grudniowe\nstrefa: +1'), { from: '2026-12-21', to: '2027-12-21', days: 366, issues: [] });
  // The time zone moves a moment near midnight: the 2027 December solstice is at 02:42 UTC.
  assert.equal(range('rok: 2027\nod: przesilenie grudniowe\nstrefa: -5').from, '2027-12-21');
  assert.equal(range('year: 2027\nfrom: December solstice\ntimezone: +1').from, '2027-12-22');
  // Seasons are not named: which one starts depends on the hemisphere.
  assert.deepEqual(range('rok: 2027\nod: wiosna').issues, [2]);
});

test('directions: clockwise and outwards by default, either can be turned', () => {
  const d = (text: string, lang: 'en' | 'pl' = 'pl') => {
    const c = parseCalendar(text, lang, 2026);
    return [c.clockwise, c.outwards, c.issues.length];
  };
  assert.deepEqual(d(''), [true, true, 0]);
  assert.deepEqual(d('kierunek: przeciwnie do zegara\ndni tygodnia: do środka'), [false, false, 0]);
  assert.deepEqual(d('direction: anticlockwise\nweekdays: inwards', 'en'), [false, false, 0]);
  assert.deepEqual(d('kierunek: zgodnie z zegarem\ndni tygodnia: od środka'), [true, true, 0]);
  assert.deepEqual(d('kierunek: w bok\ndni tygodnia: w poprzek'), [true, true, 2]);
});

test('the year and the months are always there; the other bands are chosen', () => {
  const rings = (text: string) => { const c = parseCalendar(text, 'pl', 2026); return [c.rings, c.issues.length]; };
  assert.deepEqual(rings(''), [[], 0]);
  assert.deepEqual(rings('pierścienie: rok, liczniki, zodiak, miesiące'), [['counters', 'zodiac'], 0]);
  assert.deepEqual(rings('pierścienie: pory roku'), [[], 1]);
  assert.deepEqual(rings('pierścienie: brak'), [[], 0]);
  assert.deepEqual(rings('pierścienie: tygodnie'), [[], 1]);
});

test('anticlockwise, the chosen thing is still at the top', () => {
  for (const text of ['kierunek: przeciwnie\nrok: 2027', 'kierunek: przeciwnie\nrok: 2027\ngóra: 1.09', 'kierunek: przeciwnie\nrok: 2026\nod: 1.09\ngóra: przesilenie grudniowe', 'kierunek: przeciwnie\nrok: 2026\nod: 1.09\ngóra: luty']) {
    const cw = atTop(text.replace('kierunek: przeciwnie\n', '')), ccw = atTop(text);
    assert.equal(ccw.L.turn, -1);
    assert.ok(Math.abs(ccw.top - cw.top) < 1e-9, text);
  }
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

test('an equinox or solstice at the top: its week column is centred on top', () => {
  for (const [text, which] of [['rok: 2027\ngóra: przesilenie grudniowe', 3], ['rok: 2026\nod: 1.09\ngóra: przesilenie czerwcowe', 1]] as const) {
    const { L, top } = atTop(text);
    const [y0] = dateOf(L.range.start);
    let i = seasonDay(y0, which, 0) - L.range.start;
    if (i < 0) i = seasonDay(y0 + 1, which, 0) - L.range.start;
    const col = 1 + Math.floor((L.offset + i) / 7);
    assert.ok(Math.abs(top - (col + 0.5) * L.step) < 1e-9, text);
  }
});

test('a month at the top: the middle of its stretch is on top', () => {
  for (const [text, band, key] of [
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

test('bands: one stretch per month and sign, covering the whole range', () => {
  for (const text of ['rok: 2027', 'rok: 2026\nod: 1.09', 'rok: 2027\nod: równonoc marcowa', 'rok: 2027\nod: 15.03']) {
    const { L } = atTop(text);
    for (const [band, n] of [['months', 12], ['zodiac', 12]] as const) {
      const segs = L.segments[band]!;
      assert.equal(segs.length, n, `${text}: ${band}`);
      const covered = segs.reduce((s, x) => s + x.to - x.from, 0);
      assert.equal(covered, L.range.days, `${text}: ${band}`);
    }
  }
});

const counter = (text: string, i = 0) => {
  const cal = parseCalendar(text, 'pl', 2026);
  assert.deepEqual(cal.issues, [], text);
  return counterSegments(cal.counters[i], calendarRange(cal)).map((s) => [s.from, s.to, s.label]);
};

test('a counter of weeks from 1 January numbers the weeks of the year, on exact days', () => {
  const segs = counter('rok: 2027\nlicznik: tygodnie od 1.01');
  assert.equal(segs.length, 53);
  assert.deepEqual(segs[0], [0, 7, '1']);
  assert.deepEqual(segs[52], [364, 365, '53']);
});

test('a day without a year repeats: the count starts again from 1 each year', () => {
  // A school year 2026/27 with weeks of the calendar year: 1.09.2026 falls in week 35 of 2026.
  const segs = counter('rok: 2026\nod: 1.09\nlicznik: tygodnie od 1.01');
  assert.deepEqual(segs[0], [0, 2, '35']);
  const ny = epochDay(2027, 1, 1) - epochDay(2026, 9, 1);
  assert.deepEqual(segs.find((s) => s[0] === ny), [ny, ny + 7, '1']);
  assert.deepEqual(segs.find((s) => s[1] === ny), [ny - 1, ny, '53']); // 31.12.2026 alone
  // Weeks of the school year in the same calendar: from 1 at the start to 53 (one day) at the end.
  const school = counter('rok: 2026\nod: 1.09\nlicznik: tygodnie od 1.09');
  assert.deepEqual([school[0], school.at(-1)], [[0, 7, '1'], [364, 365, '53']]);
});

test('a day with a year counts on, and nothing before it', () => {
  const months = counter('rok: 2027\nlicznik: miesiące od 31.01.2027');
  const day = (m: number, d: number) => epochDay(2027, m, d) - epochDay(2027, 1, 1);
  assert.deepEqual(months.slice(0, 3), [[day(1, 31), day(2, 28), '1'], [day(2, 28), day(3, 31), '2'], [day(3, 31), day(4, 30), '3']]);
  const longAgo = counter('rok: 2027\nlicznik: miesiące od 2024-06-15');
  assert.deepEqual(longAgo[0], [0, day(1, 15), '31']);
  assert.deepEqual(counter('rok: 2027\nlicznik: miesiące od 2030-01-01'), []);
});

test('a counter may end on a day (the last one counted) or after a number', () => {
  const day = (y: number, m: number, d: number) => epochDay(y, m, d) - epochDay(2026, 9, 1);
  // Weeks of a school year to the end of classes: the last week is cut after 25.06.
  const school = counter('rok: 2026\nod: 1.09\nlicznik: tygodnie od 1.09 do 25.06');
  assert.deepEqual(school.at(-1), [day(2027, 6, 22), day(2027, 6, 26), '43']);
  // A day without a year repeats with its start: in a calendar year the count from last
  // September runs to 25 June, and the next one starts on 1 September.
  const y27 = counter('rok: 2027\nlicznik: tygodnie od 1.09 do 25.06');
  const d27 = (m: number, d: number) => epochDay(2027, m, d) - epochDay(2027, 1, 1);
  assert.deepEqual(y27[0], [0, d27(1, 5), '18']);
  assert.deepEqual(y27.find((s) => s[2] === '43'), [d27(6, 22), d27(6, 26), '43']);
  assert.deepEqual(y27.find((s) => s[0] > d27(6, 26)), [d27(9, 1), d27(9, 8), '1']);
  // After a number: twelve weeks.
  const course = counter('rok: 2027\nlicznik: tygodnie od 7.06.2027 do 12 kurs');
  assert.equal(course.length, 12);
  assert.deepEqual(course.at(-1), [d27(8, 23), d27(8, 30), '12']);
});

test('where a counter starts: its name stands just before', () => {
  const start = (text: string) => { const cal = parseCalendar(text, 'pl', 2026); return counterStart(cal.counters[0], calendarRange(cal)); };
  assert.equal(start('rok: 2026\nod: 1.09\nlicznik: tygodnie od 1.09'), 0);
  assert.equal(start('rok: 2027\nlicznik: tygodnie od 1.09'), epochDay(2027, 9, 1) - epochDay(2027, 1, 1));
  assert.equal(start('rok: 2027\nlicznik: tygodnie od 7.06.2027 do 12'), epochDay(2027, 6, 7) - epochDay(2027, 1, 1));
  assert.equal(start('rok: 2027\nlicznik: miesiące od 15.05.2020'), undefined);
});

test('counters read in both languages, with or without a name', () => {
  const pl = parseCalendar([
    'licznik: tygodnie od 1.09 Rok szkolny', 'licznik: miesiące 15.03.2027',
    'licznik: tygodnie od 1.09 do 25.06 szkoła', 'licznik: tygodnie od 1.05.2027 do 40', 'licznik: tygodnie od 1.09 do wakacji',
  ].join('\n'), 'pl', 2026);
  const en = parseCalendar([
    'counter: weeks from 1.09 Rok szkolny', 'counter: months 15.03.2027',
    'counter: weeks from 1.09 to 25.06 szkoła', 'counter: weeks from 1.05.2027 until 40', 'counter: weeks from 1.09 do wakacji',
  ].join('\n'), 'en', 2026);
  assert.deepEqual(pl.counters, en.counters);
  assert.deepEqual(pl.counters, [
    { unit: 'weeks', from: { m: 9, d: 1 }, name: 'Rok szkolny' },
    { unit: 'months', from: { y: 2027, m: 3, d: 15 }, name: '' },
    { unit: 'weeks', from: { m: 9, d: 1 }, until: { kind: 'date', m: 6, d: 25 }, name: 'szkoła' },
    { unit: 'weeks', from: { y: 2027, m: 5, d: 1 }, until: { kind: 'count', n: 40 }, name: '' },
    { unit: 'weeks', from: { m: 9, d: 1 }, name: 'do wakacji' }, // not a date or a number: part of the name
  ]);
  const bad = parseCalendar([
    'licznik: dni od 1.01', 'licznik: tygodnie', 'licznik: tygodnie od 31.02', 'licznik: lata od 1.01.2020',
    'licznik: tygodnie od 1.09 do 31.06', 'licznik: tygodnie od 1.09.2027 do 1.08.2027',
  ].join('\n'), 'pl', 2026);
  assert.deepEqual(bad.issues.map((i) => i.line), [1, 2, 3, 4, 5, 6]);
  assert.deepEqual(bad.counters, []);
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
  const starts = ['1.01', '1.09', '29.02', '15.03', 'równonoc marcowa', 'przesilenie grudniowe'];
  const tops = ['łączenie', 'przesilenie grudniowe', 'równonoc wrześniowa', 'styczeń', 'sierpień', '1.06'];
  for (const y of [MIN_YEAR, 1900, 2000, 2023, 2024, 2026, 2027, 2028, 2100, MAX_YEAR]) {
    for (let d = 0; d < 7; d++) {
      const start = starts[(y + d) % starts.length], top = tops[(y * 3 + d) % tops.length];
      const counters = d % 2 ? '\nlicznik: tygodnie od 1.01 Tydzień\nlicznik: miesiące od 15.05' : `\nlicznik: tygodnie od 1.07.${y} do 40\nlicznik: miesiące od 1.09 do 30.06 Szkoła`;
      const dirs = `\nkierunek: ${(y + d) % 2 ? 'zgodnie' : 'przeciwnie'}\ndni tygodnia: ${d % 3 ? 'od środka' : 'do środka'}`;
      const text = `rok: ${y}\nod: ${start}\ngóra: ${top}\npierwszy dzień: ${days[d]}\npierścienie: zodiak${counters}${dirs}`;
      const cal = parseCalendar(text, 'pl', 2026);
      const svg = renderCalendar(cal, 'pl');
      assert.ok(svg.startsWith('<svg') && svg.endsWith('</svg>'), text);
      assert.ok(!svg.includes('NaN'), `${text}: NaN`);
    }
  }
});

test('settings written as text read back the same, in either language', () => {
  const texts = [
    EXAMPLE.en, EXAMPLE.pl, '',
    'rok: 2027\nod: równonoc marcowa\ngóra: przesilenie czerwcowe\npierwszy dzień: śr\nkierunek: przeciwnie\ndni tygodnia: do środka\npierścienie: brak',
    'year: 2028\ntop: january\nrings: counters, zodiac\ncounter: months from 31.01.2028 to 12\ncounter: weeks from 4.01.2027 week\ntimezone: -5:30',
    'rok: 2026\nod: 1.09.2027\ngóra: 15.03.2028\nkolory: weekend=#eee, linie=#123456\ntytuł: A.D. 2027\npodpis: jeden\npodpis: dwa',
    'rok: 2026\ntytuł: Rok\ntytuł: szkolny\nwnętrze: 4',
    'rok: 2026\nmiesiące: rzymskie\nzodiak: znaki\npierścienie: zodiak',
    'year: 2026\nmonths: short',
    'year: 2026\ntitle: none\ninside: 1',
  ];
  for (const text of texts) {
    const cal = parseCalendar(text, 'pl', 2026);
    for (const lang of ['pl', 'en'] as const) {
      const again = parseCalendar(formatCalendar(cal, lang), lang === 'pl' ? 'en' : 'pl', 2026);
      assert.deepEqual(again, cal, `${lang}: ${text}`);
    }
  }
  assert.equal(formatCalendar(parseCalendar('', 'pl', 2026), 'pl'), 'rok: 2026\n');
});

test('the centre: rows of text, no text; the size of the inside', () => {
  const cal = (text: string) => parseCalendar(text, 'pl', 2026);
  assert.deepEqual(cal('').title, []);
  assert.equal(cal('').inside, 3);
  assert.deepEqual(cal('tytuł: Rok\ntytuł: szkolny').title, ['Rok', 'szkolny']);
  assert.equal(cal('tytuł: Rok\ntytuł: brak').title, null);
  assert.deepEqual(cal('tytuł: brak\ntytuł: 2026').title, ['2026']);
  assert.equal(cal('wnętrze: 2').inside, 2);
  assert.equal(cal('inside: 5').inside, 5);
  // Any other size reads as the nearest step.
  assert.equal(cal('wnętrze: 2,6').inside, 3);
  assert.equal(cal('wnętrze: 0.3').inside, 1);
  assert.equal(cal('wnętrze: 9').inside, 5);
  for (const bad of ['wnętrze: 0', 'wnętrze: duże', 'wnętrze: -1', 'wnętrze: 40%']) {
    assert.equal(cal(bad).issues.length, 1, bad);
    assert.equal(cal(bad).inside, 3, bad);
  }
  assert.equal(formatCalendar(cal('wnętrze: 5'), 'pl'), 'rok: 2026\nwnętrze: 5\n');
  assert.equal(formatCalendar(cal('wnętrze: 5'), 'en'), 'year: 2026\ninside: 5\n');
  const rows = (text: string) => (renderCalendar(cal(text), 'pl').match(/<g class="centre">(.*?)<\/g>/)?.[1].match(/<text/g) ?? []).length;
  assert.equal(rows(''), 1);
  assert.equal(rows('tytuł: a\ntytuł: b\ntytuł: c'), 3);
  assert.equal(rows('tytuł: brak'), 0);
    for (const text of ['wnętrze: 5\ntytuł: x\ntytuł: y', 'wnętrze: 1\npierścienie: zodiak\nlicznik: tygodnie od 1.09 x\nlicznik: miesiące od 1.01 y']) {
    assert.ok(!renderCalendar(cal(text), 'pl').includes('NaN'), text);
  }
  // With the same inside, the months and the days stay in place whatever bands are chosen.
  const months = (text: string) => renderCalendar(cal(text), 'pl').match(/<circle [^>]*>/g)!.slice(-1)[0];
  const first = months('pierścienie: zodiak');
  for (const text of ['', 'pierścienie: zodiak', 'pierścienie: liczniki, zodiak\nlicznik: tygodnie od 1.09 x\nlicznik: miesiące od 1.01 y']) {
    assert.equal(months(text), first, text);
  }
});

test('names of the months and of the zodiac', () => {
  const cal = (text: string) => parseCalendar(text, 'pl', 2026);
  assert.equal(cal('').monthNames, 'full');
  assert.equal(cal('').zodiacNames, 'full');
  assert.equal(cal('miesiące: skrócone').monthNames, 'short');
  assert.equal(cal('months: roman').monthNames, 'roman');
  assert.equal(cal('zodiak: znaki').zodiacNames, 'signs');
  assert.equal(cal('miesiące: małe').issues.length, 1);
  assert.equal(cal('zodiak: skrócone').issues.length, 1);
  const labels = (text: string, band: 'months' | 'zodiac', lang: 'pl' | 'en' = 'pl') => {
    const c = cal(text);
    return bandSegments(c, calendarRange(c), band, lang).map((s) => s.label);
  };
  assert.deepEqual(labels('miesiące: skrócone', 'months').slice(0, 3), ['sty', 'lut', 'mar']);
  assert.deepEqual(labels('miesiące: skrócone', 'months', 'en').slice(0, 2), ['Jan', 'Feb']);
  assert.deepEqual(labels('miesiące: rzymskie', 'months').slice(0, 4), ['I', 'II', 'III', 'IV']);
  assert.ok(labels('zodiak: znaki', 'zodiac').every((s) => /^[\u2648-\u2653]\uFE0E$/.test(s)));
  assert.ok(renderCalendar(cal('zodiak: znaki\npierścienie: zodiak'), 'pl').includes('♑\uFE0E'));
});
