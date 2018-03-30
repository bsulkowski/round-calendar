package roundcalendar

/**
 * @author Bartosz Sułkowski
 */
class RoundCalendarLayout {
    Calendar calendar = new Calendar()

    List beltNames = [
        "year",
        "seasons",
//        "zodiac",
        "months",
    ]
    List beltSizes = [
        0.5,
        0.5,
//        0.25,
//        0.25,
        0.5,
    ]
    Map segmentFontSizes = [
        year:20,
        seasons:16,
        zodiac:10,
        months:12,
    ]

    int daysOffset = calendar.firstDayOfWeek - 1
    int calendarWeeksNumber = calendarWeek(calendar.lastDayOfYear) + 1
    int calendarDaysNumber = calendarWeeksNumber * 7
    double areaPartsSize = 7 + beltSizes.sum()
    double angleStart = 285
    int angleDirection = 1

    Map segmentStarts = [:]
    Map segmentNames = [:]

    int calendarWeek(int dayOfYear) {
        (dayOfYear + daysOffset - 1) / 7 + 1
    }

    int radius
    Map belts = [:]
    Map segments = [:]
    BeltShape[] daysBelts
    BeltSegmentShape[][] daySegments

    double areaRadius(double areaPart) {
        Math.sqrt(areaPart / areaPartsSize) * radius
    }
    double calendarWeekAngle(int calendarWeek) {
        angleStart + angleDirection * (calendarWeek - 1) / calendarWeeksNumber * 360
    }
    double dayOfYearAngle(int dayOfYear) {
        angleStart + angleDirection * (daysOffset + dayOfYear - 1) / calendarDaysNumber * 360
    }

    public RoundCalendarLayout(double radius) {
        this.radius = radius

        double otherSize = beltSizes.sum()

        daysBelts = new BeltShape[7]
        (0..6).each{
            daysBelts[it] = new BeltShape(areaRadius(otherSize + it), areaRadius(otherSize + it + 1))
        }

        daySegments = new BeltSegmentShape[calendarWeeksNumber]
        (1 .. calendarWeeksNumber).each{ week ->
            daySegments[week - 1] = new BeltSegmentShape[7]
            (1..7).each{ dayOfWeek ->
                daySegments[week - 1][dayOfWeek - 1] = daysBelts[dayOfWeek - 1].segment(
                    calendarWeekAngle(week),
                    calendarWeekAngle(week + 1),
                    angleDirection,
                )
            }
        }

        (0 ..< beltNames.size()).each{
            belts[beltNames[it]] = new BeltShape(
                areaRadius(beltSizes[0..<it].sum() ?: 0),
                areaRadius(beltSizes[0..it].sum()),
            )
        }

        segmentStarts = [
            inner:[],
            year:[calendar.dayOfYear(1, 1), calendar.dayOfYear(13, 1)],
            seasons:calendar.seasonStarts,
//            zodiac:calendar.zodiacStarts,
            months:(1..13).collect{ calendar.dayOfYear(it, 1) },
        ]

        segmentNames = [
            inner:[],
            year:["A.D. " + calendar.year],
            seasons:calendar.seasonNames,
//            zodiac:calendar.zodiacNames,
            months:calendar.monthNames,
        ]

        beltNames.each{ belt ->
            segments[belt] = []
            (0 ..< segmentStarts[belt].size()).each{
                segments[belt] << belts[belt].segment(
                    dayOfYearAngle(segmentStarts[belt][it]),
                    it == segmentStarts[belt].size() - 1 ?
                    dayOfYearAngle(segmentStarts[belt][0]) :
                    dayOfYearAngle(segmentStarts[belt][it + 1]),
                    angleDirection,
                )
            }
        }
    }
}
