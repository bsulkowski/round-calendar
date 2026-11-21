// Example settings, one per language, drawn in examples/. They show every setting at once.

export const EXAMPLE = {
  en: `# Round Calendar: a whole year on one A4 sheet.
# Each line is a setting: a name, a colon and a value. Any of them can be left out.

year: 2026
from: 1.09          # a school year; an equinox or solstice works too: from: March equinox
top: December solstice  # what is at the top: seam, an equinox or solstice, a month or a date
first day: mon      # the weekday the week starts with on the radius; wed puts the weekend in the middle
direction: clockwise  # or anticlockwise
weekdays: outwards  # or inwards: the week runs from the rim to the centre
rings: counters     # bands between the year and the months: zodiac, counters
timezone: +1
counter: weeks from 1.09 to 25.06 school weeks   # numbered from 1; ends on a day or a number (to 40); the name is optional
`,
  pl: `# Okrągły kalendarz: cały rok na jednej kartce A4.
# Każda linia to ustawienie: nazwa, dwukropek i wartość. Każde można pominąć.

rok: 2026
od: 1.09            # rok szkolny; zamiast daty może być równonoc albo przesilenie: od: równonoc marcowa
góra: przesilenie grudniowe  # co jest na górze: łączenie, równonoc albo przesilenie, miesiąc albo data
pierwszy dzień: pn  # dzień, od którego zaczyna się tydzień na promieniu; śr daje weekend w środku
kierunek: zgodnie z zegarem  # albo przeciwnie do zegara
dni tygodnia: od środka      # albo do środka: tydzień biegnie od krawędzi do środka
pierścienie: liczniki        # pasy między rokiem a miesiącami: zodiak, liczniki
strefa: +1
licznik: tygodnie od 1.09 do 25.06 tygodnie szkolne   # numery od 1; koniec to dzień albo liczba (do 40); nazwa nie jest konieczna
`,
};
