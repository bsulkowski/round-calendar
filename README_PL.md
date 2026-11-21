# Okrągły kalendarz

*Dostępne także po angielsku: [README](README.md)*

Cały rok na jednej kartce A4, narysowany jako koło.

![Rok szkolny 2026/27 z Nowym Rokiem na górze](examples/rok-szkolny-2026-pl.svg)

## Pomysł

Tygodnie idą po obwodzie jak godziny na tarczy zegara, a każdy dzień tygodnia to pierścień:
wszystkie poniedziałki leżą na jednym okręgu, a weekendy tworzą pas. Pierścienie mają równe
pola — zewnętrzne są cieńsze, ale dłuższe. Pośrodku jest rok, a wokół niego, tuż wewnątrz dni,
miesiące. Między nimi może stać pas zodiaku oraz liczniki — tygodnie roku szkolnego, miesiące
od danego dnia — jako własne cienkie pasy. Święta i własne dni dostają kolory swojej grupy —
cieniowane tło, kolorowe numery — a te z nazwami są wypisane pod tarczą.

Rok zaczyna się od miesiąca — stycznia albo, dla roku szkolnego, września — i trwa dwanaście
miesięcy. Tam, gdzie jego koniec spotyka się z początkiem, jest łączenie: jedna kolumna z nazwami
dni tygodnia. Na górze jest początek wybranego miesiąca; domyślnie pierwszego, czyli łączenie. Domyślnie czas biegnie zgodnie z ruchem wskazówek zegara, a każdy
tydzień od środka na zewnątrz; oba kierunki można odwrócić.

## Ustawienia

Kalendarz opisuje kilka linijek zwykłego tekstu, jedno ustawienie w linii (`nazwa: wartość`).
Puste linie i linie zaczynające się od `#` są pomijane; każde ustawienie można pominąć.
Ustawienia można pisać po polsku albo po angielsku — od języka rysunku zależą tylko nazwy
na kartce.

| Linia | Co robi |
|---|---|
| `rok: 2026` | Rok, w którym kalendarz się zaczyna. Bez tej linii — bieżący. |
| `od: wrzesień` | Pierwszy miesiąc; kalendarz trwa dwanaście miesięcy od jego pierwszego dnia. Nazwa, numer (`9`) albo data w tym miesiącu (`1.09`); pełna data (`1.09.2026`) ustawia też rok. Domyślnie styczeń. |
| `góra: styczeń` | Miesiąc, którego pierwszy dzień jest na górze koła. Domyślnie pierwszy miesiąc: na górze jest łączenie. |
| `pierwszy dzień: nd` | Dzień, od którego zaczyna się tydzień na promieniu: na najbardziej wewnętrznym pierścieniu, a przy `dni tygodnia: do środka` na zewnętrznym. Domyślnie poniedziałek. `śr` daje weekend w środku. |
| `kierunek: przeciwnie do zegara` | W którą stronę idą tygodnie: `zgodnie z zegarem` (domyślnie) albo `przeciwnie do zegara`. |
| `dni tygodnia: do środka` | W którą stronę biegnie tydzień wzdłuż promienia: `od środka` (domyślnie) albo `do środka`, od krawędzi. |
| `miesiące: skrócone` | Jak nazwane są miesiące: `pełne` (domyślnie), `skrócone` do trzech liter (`sty`, `lut`…) albo `rzymskie` (`I`, `II`…). Pełne nazwy przy małym wnętrzu zmniejszają się, żeby się zmieścić. |
| `zodiak: znaki` | Jak nazwany jest zodiak: `pełne` (domyślnie) albo `znaki` (♈ ♉ …). |
| `księżyc: pełnia i nów` | Fazy Księżyca: `pełnia` obwodzi kółkiem dni pełni, `pełnia i nów` dodatkowo wypełnia dni nowiu (numer na biało); domyślnie `brak`. Faza to chwila, więc jej dzień zależy od strefy czasowej: tej, w której działa kod (w przeglądarce — czytelnika), albo podanej w `renderCalendar`. |
| `pierścienie: zodiak, liczniki` | Pasy między rokiem pośrodku a miesiącami, które są zawsze, od środka na zewnątrz. `liczniki` ustawia miejsce liczników (bez tego stoją na końcu, tuż wewnątrz miesięcy). Domyślnie żadnych. |
| `licznik: tygodnie od 1.09 do 25.06 tygodnie szkolne` | Pas z tygodniami albo miesiącami liczonymi od danego dnia: 1, 2, 3…, każdy numer nad dniami, które obejmuje, zmiana w dokładne dni. Dzień bez roku się powtarza: co roku liczy się od nowa od 1. Z rokiem (`od 2027-05-03`) liczy dalej, a przed tym dniem nic nie pokazuje. `do` kończy licznik w dany dzień, ostatni liczony (`do 25.06`), albo po danym numerze (`do 40`); bez tego liczy do następnego początku albo do końca kalendarza. Tygodnie roku kalendarzowego zaczyna się od pierwszego poniedziałku (`od 4.01.2027`). Nazwa nie jest konieczna; stoi tuż przed początkiem licznika (numerem 1) — przed łączeniem, jeśli licznik zaczyna się razem z kalendarzem albo wcześniej — w miejscu numerów, które zakrywa. Kilka linii `licznik` to kilka pasów. |
| `kolory: weekend=#eaeaea, linie=#c0c0c0` | Kolory pól weekendu i linii. |
| `tytuł: A.D. 2027` | Napis w środku koła zamiast roku (albo `2026/2027` dla roku przechodzącego przez Nowy Rok). Kilka linii `tytuł` to kilka wierszy; `tytuł: brak` zostawia środek pusty. Wielkość liter dopasowuje się do miejsca. |
| `wnętrze: 4` | Wielkość wszystkiego wewnątrz miesięcy — roku i pasów — liczona w pasach miesięcy: od `1` do `5`, domyślnie `3`; inna liczba czyta się jako najbliższa z nich. Rok zajmuje tyle co jeden pas miesięcy, domyślnie tak samo zodiak; pasy dzielą się wnętrzem, więc miesiące i dni stoją w miejscu, gdy przybywa albo ubywa pasów. `1` to ćwierć promienia, `5` — połowa. |
| `podpis: Rok Nowaków` | Linijka w prawym dolnym rogu; kilka takich linii to kilka wierszy. |
| `format: 1` | Wersja formatu pliku. Zapis do pliku ją dodaje; plik bez niej to format 1. |

Angielskie słowa kluczowe: `year`, `from`, `top`, `first day`, `direction` (`clockwise`, `anticlockwise`),
`weekdays` (`outwards`, `inwards`), `months` (`full`, `short`, `roman`), `zodiac` (`full`, `signs`), `moon` (`full`, `full and new`, `none`), `rings`, `counter`, `colors`, `title`, `inside`, `signature`;
jednostki `weeks`, `months`; `to` albo `until` zamiast `do`; w grupach `background` zamiast `tło`, `text` zamiast `tekst`, `easter` zamiast `wielkanoc`.

### Własne dni

Dni do wyróżnienia — święta, urodziny, koniec semestru — są zebrane w grupy. Linia w nawiasie
otwiera grupę i ją nazywa; linie pod nią to jej kolory i dni, każdy z datą i, jeśli trzeba, nazwą:

```
[Urodziny]
tekst: #c0392b
14.03 Ala
2.07          # dziadek — bez nazwy na kartce
1.10.2027 Ślub
wielkanoc+1 Poniedziałek Wielkanocny
```

| Linia | Co robi |
|---|---|
| `[Święta]` | Otwiera grupę. Nazwa jest nagłówkiem grupy na liście pod tarczą; `[]` ją pomija. |
| `tło: #eaeaea` | Tło dni grupy. Bez niego (albo z `tło: brak`) ich pola zostają takie jak są: białe, a w weekend szare. |
| `tekst: #c0392b` | Kolor numerów dni grupy, na tarczy i na liście. |
| `14.03 Ala` | Dzień co roku. |
| `1.10.2027 Ślub` | Dzień raz, w tym roku (także `2027-10-01`). |
| `wielkanoc+60 Boże Ciało` | Dzień liczony od Niedzieli Wielkanocnej: `wielkanoc`, `wielkanoc+1`, `wielkanoc-2`. |

Kolory późniejszej grupy przykrywają kolory wcześniejszej. Dzień z nazwą trafia na listę pod
tarczą, w kolejności dat; dzień bez nazwy jest tylko pokolorowany, a co to za dzień, może
powiedzieć komentarz po `#`. Tarcza stoi pośrodku, dopóki lista mieści się pod nią; dłuższa lista
przesuwa ją w górę.

Przykłady mają święta w Polsce jako grupę — dni wolne od pracy, z Wigilią, która jest nim od 2025
roku — i drugą grupę ze znanymi dniami, które nie są wolne.

Tydzień biegnie wzdłuż promienia i dalej do następnej kolumny, więc jego kolejność na promieniu
to zawsze siedem dni po kolei; `pierwszy dzień` wybiera, od którego się zaczyna, `dni tygodnia` —
w którą stronę biegnie.

Pasy też są cyklami. Znak zodiaku przecięty łączeniem to jeden odcinek przez nie: w kalendarzu
od stycznia koziorożec z końca przechodzi w koziorożca z początku. Liczniki nie: ich numery
na końcu i na początku są różne, więc kończą się na łączeniu.

Linie stoją tylko tam, gdzie dzielą dni: schodkowe granice miesięcy, które przechodzą przez pas
miesięcy tuż wewnątrz pierścieni dni. Pozostałe pasy nie mają kresek; ich podpisy
stoją na środku swoich odcinków.

Gotowe ustawienia i narysowane z nich arkusze są w [`examples/`](examples).

## Co jest liczone

- **Dni tygodnia i lata przestępne** dla dowolnego roku kalendarza gregoriańskiego (1583–2998).
- **Znaki zodiaku** mają stałe daty, jak w drukowanych kalendarzach.
- **Fazy Księżyca** według Meeusa, rozdz. 49 — z dokładnością do minuty, co ma znaczenie tylko
  wtedy, gdy faza wypada tuż przy północy.
- **Niedziela Wielkanocna** dla dowolnego roku kalendarza gregoriańskiego (algorytm anonimowy,
  Meeus rozdz. 8) i dni od niej liczone.

## Użycie kodu

Jeden moduł TypeScript, [`src/round-calendar.ts`](src/round-calendar.ts), bez zależności i bez
dostępu do DOM. Działa w przeglądarce i w Node ≥ 22.12 (z `--experimental-strip-types`).

```ts
import { parseCalendar, renderCalendar, calendarRange, formatCalendar, withFormatLine } from 'round-calendar';
import { EXAMPLE } from 'round-calendar/examples';

const cal = parseCalendar(EXAMPLE.pl, 'pl', new Date().getFullYear()); // ustawienia, cal.issues
calendarRange(cal);                     // { start, days }: pierwszy dzień (dni od 1970-01-01) i ile dni
const svg = renderCalendar(cal, 'pl');  // <svg …> 210 × 297 mm; { timeZone: 'Europe/Warsaw' } dla dni faz Księżyca
formatCalendar(cal, 'pl');              // ustawienia znów jako tekst: rok, potem to, co różni się od domyślnych
withFormatLine(text);                   // tekst z linią `format: 1`, tak jak przy zapisie do pliku
parseGroupLines(text, 'pl');            // dni jednej grupy z samych jej linii, z błędami
```

`parseCalendar` nie rzuca wyjątków: linie, których nie umie przeczytać, trafiają do `cal.issues`
z numerami, a reszta czyta się normalnie.

Instalacja z GitHuba: `npm install github:bsulkowski/round-calendar`, albo z `#<commit>` na końcu,
żeby przypiąć wersję. Paczka zawiera źródło TypeScript, więc musi je skompilować bundler (Vite
to robi; w buildzie SSR Astro albo Vite dodaj `round-calendar` do `ssr.noExternal`).

### Zgodność

Ustawienia trzyma się w plikach tekstowych i w przeglądarkach, więc zapisany plik musi później
czytać się tak samo. Nowe funkcje przychodzą jako nowe słowa kluczowe albo nowe wartości, które
dotąd dawały błąd — nigdy jako nowe znaczenie istniejącego tekstu. Sam rysunek może się poprawiać.

Pilnują tego dwa numery: `FORMAT_VERSION` rośnie tylko wtedy, gdy stary plik przestałby się
czytać tak samo, a plik w nowszym formacie dostaje ostrzeżenie; `TOOL_VERSION` zmienia się
z każdym wydaniem — nowa opcja → 1.1, poprawka rysunku → 1.0.1.

## Testy

```sh
npm test            # ustawienia, zakres, góra, liczniki i grupy, Wielkanoc, rysowanie każdego roku
npm run examples    # przerysowanie examples/
```

## Historia

Repozytorium powstało w 2018 roku jako skrypt w Groovym, który rysował jeden rok z wszystkim
wpisanym ręcznie. Stamtąd pochodzi układ — pierścienie o równych polach, schodkowe granice
miesięcy, kolory; stary kod jest w historii gita, tak jak późniejsza wersja z zaznaczonymi
na kole polskimi świętami i własnymi datami, które wróciły w 1.1 jako grupy.

## Licencja

[MIT](LICENSE) — Bartosz Sułkowski.
