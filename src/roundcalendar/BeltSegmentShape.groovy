package roundcalendar

/**
 * @author Bartosz Sułkowski
 */
class BeltSegmentShape {
    double radiusMin, radiusMax
    double angleMin, angleMax
    int angleDirection

    public BeltSegmentShape(double radiusMin, double radiusMax, double angleMin, double angleMax, int angleDirection) {
        this.radiusMin = radiusMin
        this.radiusMax = radiusMax
        this.angleMin = angleMin
        this.angleMax = angleMax
        this.angleDirection = angleDirection
    }

    double angleWidth() {
        double width = (angleMax - angleMin) * angleDirection
        while (width < 0)
            width += 360
        width %= 360
        return width
    }
    double angleMid() {
        double mid = angleMin + (angleWidth() / 2) * angleDirection
        while (mid < 0)
            mid += 360
        mid %= 360
        return mid
    }

    double radiusMid() {
        Math.sqrt((radiusMin * radiusMin + radiusMax * radiusMax) / 2)
    }
}
