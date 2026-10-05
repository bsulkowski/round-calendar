// Writes example sheets to examples/: the settings as a .txt file (it opens on the website
// with "Open text file") and the sheet drawn from it as an .svg.
// Run: npm run examples

import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { parseCalendar, renderCalendar, withFormatLine, type Lang } from '../src/round-calendar.ts';
import { EXAMPLE } from '../src/examples.ts';

const sheets: [string, Lang, string][] = [
  ['example-2027-en', 'en', EXAMPLE.en],
  ['example-2027-pl', 'pl', EXAMPLE.pl],
  ['plain-2027-pl', 'pl', `# Sam kalendarz: wszystkie pierścienie i święta, bez własnych dat i bez listy.
rok: 2027
pierścienie: rok, pory roku, zodiak, miesiące
święta: pl
strefa: +1
lista: nie
`],
  ['sunday-first-2028-en', 'en', `# Weeks from Sunday, a leap year, no holidays.
year: 2028
first day: sun
rings: year, seasons, months
title: A.D. 2028
`],
];

const dir = new URL('../examples/', import.meta.url);
mkdirSync(dir, { recursive: true });
for (const f of readdirSync(dir)) if (/\.(svg|txt)$/.test(f)) rmSync(new URL(f, dir));
for (const [name, lang, text] of sheets) {
  const cal = parseCalendar(text, lang, new Date().getFullYear());
  if (cal.issues.length) throw new Error(`${name}: ${JSON.stringify(cal.issues)}`);
  writeFileSync(new URL(`${name}.txt`, dir), withFormatLine(text));
  writeFileSync(new URL(`${name}.svg`, dir), `<?xml version="1.0" encoding="UTF-8"?>\n${renderCalendar(cal, lang)}\n`);
  console.log(name);
}
