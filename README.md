# Round Calendar

*Also available in Polish: [README](README_PL.md)*

A whole year on one A4 sheet, drawn as a disc.

![A school year 2026/27 with winter at the top](examples/school-year-2026-en.svg)

## The idea

Weeks go round the edge like the hours on a clock, and each weekday is a ring, so all the
Mondays lie on one circle and the weekends make a band. The rings have equal areas: the outer
ones are thinner but longer. Inside are bands for the seasons (starting on the real equinoxes and
solstices), the zodiac and the months, and the year in the middle.

The year can start on any day — on 1 January, at the start of a school year, on the first day
of spring — and runs for a year from there. Where its end meets its start there is a seam: one
column with the weekday names. The disc can be turned so that the seam, a season, a month or
a chosen day is at the top.

## Settings

A calendar is described by a few lines of plain text, one setting per line (`name: value`).
Blank lines and lines starting with `#` are ignored; every setting can be left out. Settings can
be written in English or in Polish — only the names on the sheet follow the language it is drawn in.

| Line | What it does |
|---|---|
| `year: 2026` | The year in which the calendar starts. Without it, the current year. |
| `from: 1.09` | The first day. The calendar runs to the day before the same date a year later. A full date (`1.09.2026`, `2026-09-01`) also sets the year. By default 1 January. |
| `from: spring` | The first day of a season (`spring`, `summer`, `autumn`, `winter`): the day of its equinox or solstice. The calendar runs to the day before that season starts again. |
| `top: seam` | What is at the top of the disc: the seam (the default), the middle of a season (`winter`) or of a month (`january`), or the week of a day (`1.09`). |
| `first day: sun` | The weekday of the innermost ring; the others follow outwards. Monday by default. `wed` puts the weekend in the middle. |
| `rings: year, seasons, zodiac, months` | The bands inside the weekday rings, from the centre outwards. `year` is the disc in the middle. By default year, seasons and months. |
| `timezone: +1` | The time zone for the dates of equinoxes and solstices. UTC by default. |
| `colors: weekend=#eaeaea, lines=#c0c0c0` | Colours of the weekend cells and of the lines. |
| `title: A.D. 2027` | The text in the middle of the disc instead of the year (or of `2026/2027` for a year that crosses New Year). |
| `signature: The Smiths’ year` | A line in the bottom-right corner; several lines give several rows. |
| `format: 1` | The version of the file format. Saving a file adds it; a file without it is format 1. |

Polish keywords: `rok`, `od`, `góra`, `pierwszy dzień`, `pierścienie`, `strefa`, `kolory`, `tytuł`, `podpis`.

The week runs outwards along the radius and on into the next column, so its order on the radius
is always the seven days in sequence; `first day` chooses where the sequence starts.

The bands are cycles too. A season or a month cut by the seam is one stretch across it: in a school
year, the summer at the end (2027) runs on into the summer at the start (2026).

Ready-made settings and the sheets drawn from them are in [`examples/`](examples).

## What is computed

- **Equinoxes and solstices** by Meeus, *Astronomical Algorithms*, ch. 27 — within about a minute,
  for years 1583–2998. The date is taken in the time zone from `timezone:`.
- **Weekdays and leap years** for any Gregorian year.
- **Zodiac signs** use the fixed dates printed in calendars.

## Using the code

One TypeScript module, [`src/round-calendar.ts`](src/round-calendar.ts), with no dependencies and
no DOM access. It runs in the browser and in Node ≥ 22.12 (with `--experimental-strip-types`).

```ts
import { parseCalendar, renderCalendar, calendarRange, withFormatLine } from 'round-calendar';
import { EXAMPLE } from 'round-calendar/examples';

const cal = parseCalendar(EXAMPLE.en, 'en', new Date().getFullYear()); // settings, cal.issues
calendarRange(cal);                     // { start, days }: the first day (days since 1970-01-01) and how many
const svg = renderCalendar(cal, 'en');  // <svg …> 210 × 297 mm
withFormatLine(text);                   // the text with a `format: 1` line, as saved to a file
```

`parseCalendar` never throws: lines it cannot read are listed in `cal.issues` with their line
numbers, and the rest is read as usual.

Install from GitHub: `npm install github:bsulkowski/round-calendar`, or with `#<commit>` at the end
to pin a version. The package ships the TypeScript source, so a bundler has to compile it (Vite
does; in an Astro or Vite SSR build, add `round-calendar` to `ssr.noExternal`).

### Compatibility

People keep their settings in text files and in their browsers, so a saved file has to read
the same way later. New features come as new keywords or new values that used to be errors,
never as a new meaning of existing text. The drawing itself may still improve.

Two numbers follow that: `FORMAT_VERSION` changes only if an old file could no longer be read
the same way, and a file from a newer format gets a warning; `TOOL_VERSION` changes with every
release — a new option → 1.1, a fix in the drawing → 1.0.1.

## Tests

```sh
npm test            # equinoxes against published times, the settings, the range and the top, every year draws
npm run examples    # redraw examples/
```

## History

The repository began in 2018 as a Groovy script that drew a single year with everything typed
in by hand. The layout — equal-area rings, stepped month borders, colours — comes from there;
it is in the git history, as is a later version with Polish holidays and your own dates marked
on the disc.

## Licence

[MIT](LICENSE) — Bartosz Sułkowski.
