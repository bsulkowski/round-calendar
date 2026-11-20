// Example settings, one per language, drawn in examples/. They show every setting at once.

export const EXAMPLE = {
  en: `# Round Calendar: a whole year on one A4 sheet.
# Each line is a setting: a name, a colon and a value. Any of them can be left out.

year: 2026
from: 1.09          # a school year; a season works too: from: spring
top: winter         # what is at the top: seam, a season, a month or a date
first day: mon      # the weekday nearest the centre; wed puts the weekend in the middle
rings: year, seasons, months
timezone: +1
counter: weeks from 1.09 to 25.06 school weeks   # numbered from 1; ends on a day or a number (to 40); the name is optional
`,
  pl: `# Okrągły kalendarz: cały rok na jednej kartce A4.
# Każda linia to ustawienie: nazwa, dwukropek i wartość. Każde można pominąć.

rok: 2026
od: 1.09            # rok szkolny; zamiast daty może być pora roku: od: wiosna
góra: zima          # co jest na górze: łączenie, pora roku, miesiąc albo data
pierwszy dzień: pn  # dzień tygodnia najbliżej środka; śr daje weekend w środku
pierścienie: rok, pory roku, miesiące
strefa: +1
licznik: tygodnie od 1.09 do 25.06 tygodnie szkolne   # numery od 1; koniec to dzień albo liczba (do 40); nazwa nie jest konieczna
`,
};
