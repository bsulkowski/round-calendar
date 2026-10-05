// Example settings, one per language: the ones shown on bsulkowski.pl and drawn in examples/.
// They show every kind of line at once. People and trips are made up — no real family's dates.

export const EXAMPLE = {
  en: `# Round Calendar: a whole year on one A4 sheet.
# Lines with a colon are settings; lines starting with a date are your own days.

year: 2027
first day: mon
rings: year, seasons, months
holidays: days off, church, observances
timezone: +1
colors: birthday=#c0504d, holidays=#6c8ebf, trip=#82b366

# A single day is circled, a range is shaded. Without a year they repeat every year.
14.03 Birthday – Ada
2.09 Birthday – Leo
30.11 Birthday – Grandpa Tom
1.02-14.02 Holidays (winter)
26.06-31.08 Holidays (summer)
2027-05-20 Trip to the seaside

signature: The Smiths’ year
`,
  pl: `# Okrągły kalendarz: cały rok na jednej kartce A4.
# Linie z dwukropkiem to ustawienia, linie zaczynające się od daty to Twoje dni.

rok: 2027
pierwszy dzień: pn
pierścienie: rok, pory roku, miesiące
święta: wolne, kościelne, okolicznościowe
strefa: +1
kolory: urodziny=#c0504d, ferie=#6c8ebf, wakacje=#6c8ebf, wyjazd=#82b366

# Pojedynczy dzień dostaje kółko, zakres się zaciemnia. Daty bez roku powtarzają się co roku.
14.03 Urodziny Ady
2.09 Urodziny Leona
30.11 Urodziny dziadka Tomka
1.02-14.02 Ferie zimowe
26.06-31.08 Wakacje
2027-05-20 Wyjazd nad morze

podpis: Rok Nowaków
`,
};
