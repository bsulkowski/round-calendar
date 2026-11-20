# Okrągły kalendarz

*Dostępne także po angielsku: [README](README.md)*

Cały rok na jednej kartce A4, narysowany jako koło.

![Rok szkolny 2026/27 z zimą na górze](examples/rok-szkolny-2026-pl.svg)

## Pomysł

Tygodnie idą po obwodzie jak godziny na tarczy zegara, a każdy dzień tygodnia to pierścień:
wszystkie poniedziałki leżą na jednym okręgu, a weekendy tworzą pas. Pierścienie mają równe
pola — zewnętrzne są cieńsze, ale dłuższe. Pośrodku jest rok, a wokół niego, tuż wewnątrz dni,
miesiące. Między nimi mogą stać pasy pór roku (od prawdziwych równonocy i przesileń) i zodiaku
oraz liczniki — tygodnie roku szkolnego, miesiące od danego dnia — jako własne cienkie pasy.

Rok może zaczynać się dowolnego dnia — 1 stycznia, na początku roku szkolnego, w pierwszy dzień
wiosny — i trwa od niego rok. Tam, gdzie jego koniec spotyka się z początkiem, jest łączenie:
jedna kolumna z nazwami dni tygodnia. Koło można obrócić tak, żeby na górze było łączenie, pora
roku, miesiąc albo wybrany dzień. Domyślnie czas biegnie zgodnie z ruchem wskazówek zegara, a każdy
tydzień od środka na zewnątrz; oba kierunki można odwrócić.

## Ustawienia

Kalendarz opisuje kilka linijek zwykłego tekstu, jedno ustawienie w linii (`nazwa: wartość`).
Puste linie i linie zaczynające się od `#` są pomijane; każde ustawienie można pominąć.
Ustawienia można pisać po polsku albo po angielsku — od języka rysunku zależą tylko nazwy
na kartce.

| Linia | Co robi |
|---|---|
| `rok: 2026` | Rok, w którym kalendarz się zaczyna. Bez tej linii — bieżący. |
| `od: 1.09` | Pierwszy dzień. Kalendarz trwa do dnia przed tą samą datą rok później. Pełna data (`1.09.2026`, `2026-09-01`) ustawia też rok. Domyślnie 1 stycznia. |
| `od: wiosna` | Pierwszy dzień pory roku (`wiosna`, `lato`, `jesień`, `zima`): dzień jej równonocy albo przesilenia. Kalendarz trwa do dnia przed jej następnym początkiem. |
| `góra: łączenie` | Co jest na górze koła: łączenie (domyślnie), środek pory roku (`zima`) albo miesiąca (`styczeń`), albo tydzień danego dnia (`1.09`). |
| `pierwszy dzień: nd` | Dzień, od którego zaczyna się tydzień na promieniu: na najbardziej wewnętrznym pierścieniu, a przy `dni tygodnia: do środka` na zewnętrznym. Domyślnie poniedziałek. `śr` daje weekend w środku. |
| `kierunek: przeciwnie do zegara` | W którą stronę idą tygodnie: `zgodnie z zegarem` (domyślnie) albo `przeciwnie do zegara`. |
| `dni tygodnia: do środka` | W którą stronę biegnie tydzień wzdłuż promienia: `od środka` (domyślnie) albo `do środka`, od krawędzi. |
| `pierścienie: pory roku, zodiak, liczniki` | Pasy między rokiem pośrodku a miesiącami, które są zawsze, od środka na zewnątrz. `liczniki` ustawia miejsce liczników (bez tego stoją na końcu, tuż wewnątrz miesięcy). Domyślnie pory roku; `pierścienie: brak` zostawia sam rok i miesiące. |
| `licznik: tygodnie od 1.09 do 25.06 tygodnie szkolne` | Pas z tygodniami albo miesiącami liczonymi od danego dnia: 1, 2, 3…, każdy numer nad dniami, które obejmuje, zmiana w dokładne dni. Dzień bez roku się powtarza: co roku liczy się od nowa od 1. Z rokiem (`od 2027-05-03`) liczy dalej, a przed tym dniem nic nie pokazuje. `do` kończy licznik w dany dzień, ostatni liczony (`do 25.06`), albo po danym numerze (`do 40`); bez tego liczy do następnego początku albo do końca kalendarza. Tygodnie roku kalendarzowego zaczyna się od pierwszego poniedziałku (`od 4.01.2027`). Nazwa nie jest konieczna; stoi tuż przed początkiem licznika (numerem 1) — przed łączeniem, jeśli licznik zaczyna się razem z kalendarzem albo wcześniej — w miejscu numerów, które zakrywa. Kilka linii `licznik` to kilka pasów. |
| `strefa: +1` | Strefa czasowa dla dat równonocy i przesileń. Domyślnie UTC. |
| `kolory: weekend=#eaeaea, linie=#c0c0c0` | Kolory pól weekendu i linii. |
| `tytuł: A.D. 2027` | Napis w środku koła zamiast roku (albo `2026/2027` dla roku przechodzącego przez Nowy Rok). Kilka linii `tytuł` to kilka wierszy; `tytuł: brak` zostawia środek pusty. Wielkość liter dopasowuje się do miejsca. |
| `środek: 35%` | Wielkość środka: jego promień jako część promienia koła, od `0` (bez środka, pasy sięgają samego środka) do `80%`. Domyślnie 25%. |
| `podpis: Rok Nowaków` | Linijka w prawym dolnym rogu; kilka takich linii to kilka wierszy. |
| `format: 1` | Wersja formatu pliku. Zapis do pliku ją dodaje; plik bez niej to format 1. |

Angielskie słowa kluczowe: `year`, `from`, `top`, `first day`, `direction` (`clockwise`, `anticlockwise`),
`weekdays` (`outwards`, `inwards`), `rings`, `counter`, `timezone`, `colors`, `title`, `centre`, `signature`;
jednostki `weeks`, `months`; `to` albo `until` zamiast `do`.

Tydzień biegnie wzdłuż promienia i dalej do następnej kolumny, więc jego kolejność na promieniu
to zawsze siedem dni po kolei; `pierwszy dzień` wybiera, od którego się zaczyna, `dni tygodnia` —
w którą stronę biegnie.

Pasy też są cyklami. Pora roku albo miesiąc przecięte łączeniem to jeden odcinek przez nie:
w roku szkolnym lato z końca (2027) przechodzi w lato z początku (2026). Liczniki nie: ich numery
na końcu i na początku są różne, więc kończą się na łączeniu.

Linie stoją tylko tam, gdzie dzielą dni: schodkowe granice miesięcy, które przechodzą przez pas
miesięcy tuż wewnątrz pierścieni dni. Pozostałe pasy nie mają kresek; ich podpisy
stoją na środku swoich odcinków.

Gotowe ustawienia i narysowane z nich arkusze są w [`examples/`](examples).

## Co jest liczone

- **Równonoce i przesilenia** według Meeusa, *Astronomical Algorithms*, rozdz. 27 — z dokładnością
  do około minuty, dla lat 1583–2998. Datę bierze się w strefie z `strefa:`.
- **Dni tygodnia i lata przestępne** dla dowolnego roku kalendarza gregoriańskiego.
- **Znaki zodiaku** mają stałe daty, jak w drukowanych kalendarzach.

## Użycie kodu

Jeden moduł TypeScript, [`src/round-calendar.ts`](src/round-calendar.ts), bez zależności i bez
dostępu do DOM. Działa w przeglądarce i w Node ≥ 22.12 (z `--experimental-strip-types`).

```ts
import { parseCalendar, renderCalendar, calendarRange, formatCalendar, withFormatLine } from 'round-calendar';
import { EXAMPLE } from 'round-calendar/examples';

const cal = parseCalendar(EXAMPLE.pl, 'pl', new Date().getFullYear()); // ustawienia, cal.issues
calendarRange(cal);                     // { start, days }: pierwszy dzień (dni od 1970-01-01) i ile dni
const svg = renderCalendar(cal, 'pl');  // <svg …> 210 × 297 mm
formatCalendar(cal, 'pl');              // ustawienia znów jako tekst: rok, potem to, co różni się od domyślnych
withFormatLine(text);                   // tekst z linią `format: 1`, tak jak przy zapisie do pliku
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
npm test            # równonoce vs. opublikowane, ustawienia, zakres, góra i liczniki, rysowanie każdego roku
npm run examples    # przerysowanie examples/
```

## Historia

Repozytorium powstało w 2018 roku jako skrypt w Groovym, który rysował jeden rok z wszystkim
wpisanym ręcznie. Stamtąd pochodzi układ — pierścienie o równych polach, schodkowe granice
miesięcy, kolory; stary kod jest w historii gita, tak jak późniejsza wersja z zaznaczonymi
na kole polskimi świętami i własnymi datami.

## Licencja

[MIT](LICENSE) — Bartosz Sułkowski.
