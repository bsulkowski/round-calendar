package roundcalendar

/**
 *
 * @author Bartosz Sułkowski
 */
class Calendar {
    int year = 2018
    int firstDayOfWeek = 1 // niedziela

    List dayOfWeekNames = [
        "pn",
        "wt",
        "śr",
        "cz",
        "pt",
        "sb",
        "nd",
    ]
//    List dayOfWeekNames = [
//        "Mon",
//        "Tue",
//        "Wed",
//        "Thu",
//        "Fri",
//        "Sat",
//        "Sun",
//    ]

    List monthSizes = [
        31, 28, 31, 30, 31, 30,
        31, 31, 30, 31, 30, 31,
    ] // rok nieprzestępny

    List monthNames = [
        "styczeń",
        "luty",
        "marzec",
        "kwiecień",
        "maj",
        "czerwiec",
        "lipiec",
        "sierpień",
        "wrzesień",
        "październik",
        "listopad",
        "grudzień",
    ]
//    List monthNames = [
//        "January",
//        "February",
//        "March",
//        "April",
//        "May",
//        "June",
//        "July",
//        "August",
//        "September",
//        "October",
//        "November",
//        "December",
//    ]
    int lastDayOfYear = monthSizes.sum()

    List seasonStarts = [
        dayOfYear(3, 21),
        dayOfYear(6, 22),
        dayOfYear(9, 23),
        dayOfYear(12, 22),
    ]
    List seasonNames = [
        "wiosna",
        "lato",
        "jesień",
        "zima",
    ]
//    List seasonNames = [
//        "Spring",
//        "Summer",
//        "Autumn",
//        "Winter",
//    ]

    int easterDay = dayOfYear(4, 1) // 2018

    List zodiacStarts = [
        dayOfYear(3, 21),
        dayOfYear(4, 20),
        dayOfYear(5, 21),
        dayOfYear(6, 21),
        dayOfYear(7, 23),
        dayOfYear(8, 23),
        dayOfYear(9, 23),
        dayOfYear(10, 23),
        dayOfYear(11, 23),
        dayOfYear(12, 22),
        dayOfYear(1, 20),
        dayOfYear(2, 19),
    ]
    List zodiacNames = [
        "baran",
        "byk",
        "bliźnięta",
        "rak",
        "lew",
        "panna",
        "waga",
        "skorpion",
        "strzelec",
        "koziorożec",
        "wodnik",
        "ryby",
    ]
//    List zodiacNames = [ // łacińskie
//        "Aries",
//        "Taurus",
//        "Gemini",
//        "Cancer",
//        "Leo",
//        "Virgo",
//        "Libra",
//        "Scorpio",
//        "Sagittarius",
//        "Capricorn",
//        "Aquarius",
//        "Pisces",
//    ]

    List churchMajorHolidays = [
        [dayOfYear(1, 1), "Świętej Bożej Rodzicielki"],
        [dayOfYear(1, 6), "Objawienie Pańskie"],
        [easterDay, "Wielkanoc"],
        [easterDay + 1, "Poniedziałek Wielkanocny"],
        [easterDay + 49, "Zesłanie Ducha Świętego"],
        [easterDay + 60, "Boże Ciało"],
        [dayOfYear(8, 15), "Wniebowzięcie NMP"],
        [dayOfYear(11, 1), "Wszystkich Świętych"],
        [dayOfYear(12, 25), "Boże Narodzenie"],
        [dayOfYear(12, 26), "Boże Narodzenie II dzień"],
    ]
    List churchHolidays = [
        [easterDay - 3, "Wielki Czwartek"],
        [easterDay - 1, "Wielka Sobota"],
        [dayOfYear(12, 24), "Wigilia Bożego Narodzenia"],
    ]
    List churchFasts = [
        [easterDay - 46, "Środa Popielcowa"],
        [easterDay - 2, "Wielki Piątek"],
    ]
    List otherMajorHolidays = [
//        [dayOfYear(1, 1), "Nowy Rok"],
        [dayOfYear(5, 1), "Święto Pracy"],
        [dayOfYear(5, 3), "Święto Konstytucji"],
        [dayOfYear(11, 11), "Święto Niepodległości"],
    ]
    List otherHolidays = [
        [dayOfYear(1, 21), "Dzień Babci"],
        [dayOfYear(1, 22), "Dzień Dziadka"],
        [dayOfYear(2, 14), "Dzień Zakochanych"],
        [dayOfYear(3, 8), "Dzień Kobiet"],
        [dayOfYear(5, 26), "Dzień Matki"],
        [dayOfYear(6, 1), "Dzień Dziecka"],
        [dayOfYear(6, 23), "Dzień Ojca"],
        [dayOfYear(12, 6), "Św. Mikołaja"],
    ]

    int dayOfWeek(int dayOfYear) {
        (dayOfYear + 700 - 1 + firstDayOfWeek + 6) % 7 + 1
    }
    int dayOfYear(int month, int dayOfMonth) {
        month == 1 ? dayOfMonth : monthSizes[0..(month - 2)].sum() + dayOfMonth
    }
}
