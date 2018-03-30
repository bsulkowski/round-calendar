package roundcalendar

/**
 * @author Bartosz Sułkowski
 */
class BeltShape {
    double radiusMin, radiusMax

    public BeltShape(double radiusMin, double radiusMax) {
        this.radiusMin = radiusMin
        this.radiusMax = radiusMax
    }

    BeltSegmentShape segment(double angleMin, double angleMax, int angleDirection) {
        new BeltSegmentShape(radiusMin, radiusMax, angleMin, angleMax, angleDirection)
    }
}
