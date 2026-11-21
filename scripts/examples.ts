// Writes example sheets to examples/: the settings as a .txt file and the sheet drawn from it as an .svg.
// Run: npm run examples

import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { parseCalendar, renderCalendar, withFormatLine, type Lang } from '../src/round-calendar.ts';
import { EXAMPLE } from '../src/examples.ts';

const sheets: [string, Lang, string][] = [
  ['school-year-2026-en', 'en', EXAMPLE.en],
  ['rok-szkolny-2026-pl', 'pl', EXAMPLE.pl],
  ['rok-2027-pl', 'pl', `# Rok kalendarzowy z łączeniem na górze, wszystkie pierścienie i tygodnie roku od pierwszego poniedziałku.
rok: 2027
pierścienie: zodiak
licznik: tygodnie od 4.01.2027 tydzień roku
`],
  ['od-marca-2027-pl', 'pl', `# Od 20 marca, 21 czerwca na górze, weekend w środku tygodnia.
rok: 2027
od: 20.03
góra: 21.06
pierwszy dzień: śr
licznik: tygodnie od 7.06.2027 do 12 kurs pływania
`],
  ['sunday-first-2028-en', 'en', `# Weeks from Sunday, anticlockwise and inwards, a leap year, mid-January at the top, a larger inside, two rows in the centre.
year: 2028
first day: sun
direction: anticlockwise
weekdays: inwards
top: 15.01
title: A.D.
title: 2028
inside: 4
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
