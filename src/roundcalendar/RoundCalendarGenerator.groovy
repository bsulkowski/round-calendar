package roundcalendar

import groovy.xml.DOMBuilder
import groovy.xml.XmlUtil
import groovy.xml.dom.DOMCategory

svgTemplate = '''\
<?xml version="1.0" encoding="UTF-8"?>
<svg version="1.1"
 xmlns="http://www.w3.org/2000/svg"
 xmlns:xlink="http://www.w3.org/1999/xlink"
 width="744" height="744"
/>
'''
svg = DOMBuilder.parse(new StringReader(svgTemplate)).documentElement

layout = new RoundCalendarLayout(350)

double deg2rad(double angle) {
    angle * Math.PI / 180
}

double cos(double angle) {
    Math.cos(deg2rad(angle))
}
double sin(double angle) {
    Math.sin(deg2rad(angle))
}

double normalizeAngle(double angle) {
    while (angle < 0)
        angle += 360
    return angle % 360
}

String arcPath(double angleStart, double angleEnd, double radius, boolean clockwise) {
    bigFlag = normalizeAngle((angleEnd - angleStart) * (clockwise ? 1 : -1)) < 180 ? 0 : 1
    swapFlag = clockwise ? 1 : 0
    return "A $radius $radius 0 $bigFlag $swapFlag ${cos(angleEnd) * radius} ${sin(angleEnd) * radius}"
}

String radiusCoords(double angle, double radius) {
    return "${cos(angle) * radius} ${sin(angle) * radius}"
}

def textOnSegment(BeltSegmentShape segment, String text, String id, pathGroup, textGroup, int fontSize) {
    big = (segment.angleWidth() > 180) ? 1 : 0
    swap = (segment.angleMid() < 180) ? 0 : 1
    dir = layout.angleDirection == 1 ? 0 : 1

    a0 = ((dir ^ swap) ? segment.angleMin : segment.angleMax) * Math.PI / 180
    a1 = ((dir ^ swap) ? segment.angleMax : segment.angleMin) * Math.PI / 180
    r = segment.radiusMid()

    pathGroup.appendNode('path', [
        id:id,
        d:"M ${Math.cos(a0) * r} ${Math.sin(a0) * r} A $r $r 0 $big $swap ${Math.cos(a1) * r} ${Math.sin(a1) * r}",
    ])
    textNode = textGroup.appendNode('text')
    textNode.appendNode('textPath', [
        'xlink:href':"#$id",
        method:"stretch",
        startOffset:"50%",
        'text-anchor':"middle",
        'font-family':"Arial",
        'font-weight':"bold",
        'font-size':fontSize,
        dy:fontSize * 0.25,
    ], text)

    return textNode
}

def circleDay(int week, int dayOfWeek, circleGroup) {
    segment = layout.daySegments[week - 1][dayOfWeek - 1]
    a = segment.angleMid() * Math.PI / 180
    r = segment.radiusMid()
    circleGroup.appendNode('circle', [
        cx:r * Math.cos(a),
        cy:r * Math.sin(a),
        r:12,
    ])
}

def circleDayOfYear(int dayOfYear, circleGroup) {
    circleDay(layout.calendarWeek(dayOfYear), layout.calendar.dayOfWeek(dayOfYear), circleGroup)
}

clockwise = (layout.angleDirection == 1)

use(DOMCategory){
    group = [:]
    group.main = svg.appendNode('g', [
            transform:"translate(372, 372)",
            fill:"none",
            stroke:"none",
    ])
    group.weekend = group.main.appendNode('g', [
        id:"weekend",
        fill:"rgb(234, 234, 234)",
    ])
    group.holidays = group.main.appendNode('g', [
        id:"holidays",
        fill:"rgb(213, 213, 213)",
    ])
    group.months = group.main.appendNode('g', [
        id:"months",
        stroke:"rgb(192, 192, 192)",
        'stroke-width':2.0,
    ])
    group.titlePaths = group.main.appendNode('defs', [
        id:"titlePaths",
    ])
    group.dayTitles = group.main.appendNode('g', [
        id:"dayTitles",
        fill:"rgb(64, 64, 64)",
    ])
    group.dayOfWeekTitles = group.main.appendNode('g', [
        id:"dayOfWeekTitles",
        fill:"rgb(107, 107, 107)",
    ])
    layout.beltNames.each{ beltName ->
        group["${beltName}Titles"] = group.main.appendNode('g', [
            id:"${beltName}Titles",
        ])
    }
    group.yearTitles['@fill'] = "rgb(149, 149, 149)"
    group.seasonsTitles['@fill'] = "rgb(149, 149, 149)"
    group.monthsTitles['@fill'] = "rgb(107, 107, 107)"
    group.credits = group.main.appendNode('g', [
        id:"credits",
        fill:"black",
    ])

    a0 = layout.calendarWeekAngle(1)
    a1 = layout.calendarWeekAngle(layout.calendarWeeksNumber - 1)
    r0 = layout.daysBelts[5].radiusMin
    r1 = layout.daysBelts[6].radiusMax
    group.weekend.appendNode('path', [
        d:[
            "M", radiusCoords(a0, r1),
            arcPath(a0, a1, r1, clockwise),
            "L", radiusCoords(a1, r0),
            arcPath(a1, a0, r0, !clockwise),
            "Z",
        ].join(" "),
    ])


    daysText = [:]
    (1..12).each{ month -> (1..layout.calendar.monthSizes[month - 1]).each{ dayOfMonth ->
        dayOfYear = layout.calendar.dayOfYear(month, dayOfMonth)
        week = layout.calendarWeek(dayOfYear)
        dayOfWeek = layout.calendar.dayOfWeek(dayOfYear)

        segment = layout.daySegments[week - 1][dayOfWeek - 1]
        title = dayOfMonth.toString()
        fontSize = 12

        daysText[dayOfYear] = textOnSegment(segment, title, "days_$dayOfYear", group.titlePaths, group.dayTitles, fontSize)
    } }

    (1..7).each{ dayOfWeek ->
        segment = layout.daySegments[layout.calendarWeeksNumber - 1][dayOfWeek - 1]
        title = layout.calendar.dayOfWeekNames[dayOfWeek - 1]
        fontSize = 12

        textOnSegment(segment, title, "daysOfWeek_$dayOfWeek", group.titlePaths, group.dayOfWeekTitles, fontSize)
    }

    layout.beltNames.each{ beltName -> (0 ..< layout.segmentNames[beltName].size()).each{
        segment = layout.segments[beltName][it]
        title = layout.segmentNames[beltName][it]
        fontSize = layout.segmentFontSizes[beltName]

        textOnSegment(segment, title, "${beltName}_$it", group.titlePaths, group["${beltName}Titles"], fontSize)
    } }

    (1..13).each{ month ->
        dayOfYear = layout.calendar.dayOfYear(month, 1)
        week = layout.calendarWeek(dayOfYear)
        dayOfWeek = layout.calendar.dayOfWeek(dayOfYear)
        segment = layout.daySegments[week - 1][dayOfWeek - 1]
        monthSegment = layout.segments.months[month - 1]
        
        r = segment.radiusMin
        a0 = segment.angleMin
        a1 = segment.angleMax
        r0 = layout.daysBelts[0].radiusMin
        r1 = layout.daysBelts[6].radiusMax
        aM = monthSegment.angleMin
        rM = monthSegment.radiusMin

        if (dayOfWeek == 1) {
            group.months.appendNode('path', [
                d:[
                    "M", radiusCoords(a0, r1),
                    "L", radiusCoords(a0, rM),
                ].join(" "),
            ])
        } else {
            group.months.appendNode('path', [
                d:[
                    "M", radiusCoords(a0, r1),
                    "L", radiusCoords(a0, r),
                    arcPath(a0, a1, r, clockwise),
                    "L", radiusCoords(a1, r0),
                    arcPath(a1, aM, r0, !clockwise),
                    "L", radiusCoords(aM, rM),
                ].join(" "),
            ])
        }
    }

    a0 = layout.segments.months[0].angleMin
    a1 = layout.segments.months[12].angleMin
    r = layout.segments.months[0].radiusMin
    group.months.appendNode('path', [
        d:[
            "M", radiusCoords(a0, r),
            arcPath(a0, a1, r, clockwise),
        ].join(" "),
    ])
    a0 = layout.calendarWeekAngle(1)
    a1 = layout.calendarWeekAngle(layout.calendarWeeksNumber - 1)
    r = layout.radius
    group.months.appendNode('path', [
        d:[
            "M", radiusCoords(a0, r),
            arcPath(a0, a1, r, clockwise),
        ].join(" "),
    ])

    group.months.appendNode('circle', [
        cx:"0",
        cy:"0",
        r:layout.segments.year[0].radiusMax,
    ])
    
    
    credits = group.credits.appendNode('text', [
        'font-size':10,
        'font-family':"Consolas",
        'text-align':"end",
        'text-anchor':"end",
        y:350 - 2 * 12.5,
    ])
    """\
Bartosz Sułkowski
www.bsulkowski.pl
""".split('\n').each{
        credits.appendNode('tspan', [
            x:350,
            dy:12.5,
        ], it)
    }

    (layout.calendar.churchMajorHolidays + 
     layout.calendar.otherMajorHolidays).each{
        week = layout.calendarWeek(it[0])
        dayOfWeek = layout.calendar.dayOfWeek(it[0])
        segment = layout.daySegments[week - 1][dayOfWeek - 1]

        r0 = segment.radiusMin
        r1 = segment.radiusMax
        a0 = segment.angleMin
        a1 = segment.angleMax

        group.holidays.appendNode('path', [
            d:[
                "M", radiusCoords(a0, r0),
                arcPath(a0, a1, r0, clockwise),
                "L", radiusCoords(a1, r1),
                arcPath(a1, a0, r1, !clockwise),
                "Z",
            ].join(" "),
        ])
    }

    (layout.calendar.churchMajorHolidays + 
     layout.calendar.churchHolidays +
     layout.calendar.churchFasts).each{
        daysText[it[0]].textPath[0]['@fill'] = "rgb(0, 128, 255)"
    }
    (layout.calendar.otherMajorHolidays + 
     layout.calendar.otherHolidays).each{
        daysText[it[0]].textPath[0]['@fill'] = "rgb(255, 64, 64)"
    }
}

new File("calendar-test.svg").withWriter{ it << XmlUtil.serialize(svg) }
