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

[Public holidays in Poland]   # a group of days: its days get its colours; those with names are listed under the disc
background: #eaeaea    # the cells' background; without it they stay as they are
1.01 New Year’s Day
6.01 Epiphany
easter Easter Sunday   # a day counted from Easter Sunday
easter+1 Easter Monday
1.05 Labour Day
3.05 Constitution Day
easter+49 Pentecost
easter+60 Corpus Christi
15.08 Armed Forces Day
1.11 All Saints’ Day
11.11 Independence Day
24.12 Christmas Eve
25.12 Christmas Day
26.12 Second Day of Christmas

[Observances in Poland]   # known days, not days off
text: #1f3a7a
21.01 Grandmother’s Day
22.01 Grandfather’s Day
easter-52 Fat Thursday
14.02 Valentine’s Day
8.03 Women’s Day
1.04 April Fools’ Day
26.05 Mother’s Day
1.06 Children’s Day
23.06 Father’s Day
30.09 Boys’ Day
14.10 National Education Day
29.11 St Andrew’s Eve
6.12 St Nicholas Day

[Birthdays]
text: #c0392b          # the colour of the day numbers
14.03 Ann
2.07 Tom
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

[Święta państwowe w Polsce]   # grupa dni: jej dni dostają jej kolory; te z nazwami są wypisane pod tarczą
tło: #eaeaea        # tło pól; bez niego zostają takie jak są
1.01 Nowy Rok
6.01 Trzech Króli
wielkanoc Wielkanoc # dzień liczony od Niedzieli Wielkanocnej
wielkanoc+1 Poniedziałek Wielkanocny
1.05 Święto Pracy
3.05 Święto Konstytucji 3 Maja
wielkanoc+49 Zielone Świątki
wielkanoc+60 Boże Ciało
15.08 Święto Wojska Polskiego
1.11 Wszystkich Świętych
11.11 Święto Niepodległości
24.12 Wigilia
25.12 Boże Narodzenie
26.12 Drugi dzień Bożego Narodzenia

[Dni okolicznościowe]   # znane dni, które nie są wolne
tekst: #1f3a7a
21.01 Dzień Babci
22.01 Dzień Dziadka
wielkanoc-52 Tłusty czwartek
14.02 Walentynki
8.03 Dzień Kobiet
1.04 Prima aprilis
26.05 Dzień Matki
1.06 Dzień Dziecka
23.06 Dzień Ojca
30.09 Dzień Chłopaka
14.10 Dzień Edukacji Narodowej
29.11 Andrzejki
6.12 Mikołajki

[Urodziny]
tekst: #c0392b      # kolor numerów dni
14.03 Ala
2.07 Tomek
`,
};
