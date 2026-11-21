// Example settings, one per language, drawn in examples/. They show every setting at once.

export const EXAMPLE = {
  en: `# Round Calendar: a whole year on one A4 sheet.
# Each line is a setting: a name, a colon and a value. Any of them can be left out.

year: 2026
from: september     # the first month; a school year
top: january        # the month that starts at the top; without it, the first
first day: mon      # the weekday the week starts with on the radius; wed puts the weekend in the middle
direction: clockwise  # or anticlockwise
weekdays: outwards  # or inwards: the week runs from the rim to the centre
rings: counters     # bands between the year and the months: zodiac, counters
counter: weeks from 1.09 to 25.06 school weeks   # numbered from 1; ends on a day or a number (to 40); the name is optional

[Birthdays]         # a group of days, shaded in one colour; those with names are listed under the disc
colour: #cfe8cf
14.03 Ann
2.07 Tom
easter-2            # a day counted from Easter Sunday; without a name it is only shaded
`,
  pl: `# Okrągły kalendarz: cały rok na jednej kartce A4.
# Każda linia to ustawienie: nazwa, dwukropek i wartość. Każde można pominąć.

rok: 2026
od: wrzesień        # pierwszy miesiąc; rok szkolny
góra: styczeń       # miesiąc, który zaczyna się na górze; bez tego pierwszy
pierwszy dzień: pn  # dzień, od którego zaczyna się tydzień na promieniu; śr daje weekend w środku
kierunek: zgodnie z zegarem  # albo przeciwnie do zegara
dni tygodnia: od środka      # albo do środka: tydzień biegnie od krawędzi do środka
pierścienie: liczniki        # pasy między rokiem a miesiącami: zodiak, liczniki
licznik: tygodnie od 1.09 do 25.06 tygodnie szkolne   # numery od 1; koniec to dzień albo liczba (do 40); nazwa nie jest konieczna

[Święta]            # grupa dni cieniowanych jednym kolorem; te z nazwami są wypisane pod tarczą
1.01 Nowy Rok
6.01 Trzech Króli
wielkanoc Wielkanoc # dzień liczony od Niedzieli Wielkanocnej
wielkanoc+1 Poniedziałek Wielkanocny
1.05 Święto Pracy
3.05 Święto Konstytucji 3 Maja
wielkanoc+49 Zielone Świątki
wielkanoc+60 Boże Ciało
15.08 Wniebowzięcie NMP
1.11 Wszystkich Świętych
11.11 Święto Niepodległości
24.12 Wigilia
25.12 Boże Narodzenie
26.12 Drugi dzień Bożego Narodzenia

[Urodziny]
kolor: #cfe8cf
14.03 Ala
2.07 Tomek
`,
};
