import {getMapProjection} from "masterportalapi/src/crs";
import {toLonLat, transform} from "ol/proj";

const earthRadius = 6378137;

/**
 * Helper Function to coordinate the calculation of a circle.
 * @param {(Event | Object)} event Event sent when drawing a feature on the map or a simple object.
 * @param {module:ol/coordinate~Coordinate} circleCenter The center of the circle to be calculated.
 * @param {Number} circleRadius The radius of the circle to be calculated.
 * @param {module:ol/Map} map Map object.
 * @returns {void}
 */
function calculateCircle (event, circleCenter, circleRadius, map) {
    const diameter = parseInt(circleRadius, 10) * 2,
        resultCoordinates = [
            getCircleExtentByDistanceLat(circleCenter, diameter, map),
            getCircleExtentByDistanceLat(circleCenter, -1 * diameter, map),
            getCircleExtentByDistanceLon(circleCenter, diameter, map),
            getCircleExtentByDistanceLon(circleCenter, -1 * diameter, map)
        ];

    // The northernmost point of the circle is described by the longitude (northing) of that point (0).
    // The southernmost point is described by the longitude (northing) of that point (1).
    // The easternmost point is described by the latitude (easting) of that point (2).
    // The westernmost point is described by the latitude (easting) of that point (3).
    // They must be added to the array in the following order: [3, 1, 2, 0]
    event.feature.getGeometry().extent_ = [
        resultCoordinates[3][0],
        resultCoordinates[1][1],
        resultCoordinates[2][0],
        resultCoordinates[0][1]
    ];
    event.feature.getGeometry().flatCoordinates = [
        circleCenter[0],
        circleCenter[1],
        resultCoordinates[3][0],
        resultCoordinates[3][1]
    ];
}

/**
 * Calculates new flat and extent latitude coordinates for the (circle-) feature.
 * These coordiantes are calculated on the basis of the circle diameter specified by the user.
 *
 * @param {module:ol/coordinate~Coordinate} circleCenter The center of the circle to be calculated.
 * @param {Number} circleDiameter The diameter of the circle to be calculated.
 * @param {module:ol/Map} map Map object.
 * @returns {module:ol/coordinate~Coordinate} New and transformed extent / flat coordinates of the circle.
 */
function getCircleExtentByDistanceLat (circleCenter, circleDiameter, map) {
    const offsetLat = circleDiameter / 2,
        circleCenterWGS = toLonLat(circleCenter, getMapProjection(map)),
        deltaLat = offsetLat / earthRadius,
        newPositionLat = circleCenterWGS[1] + deltaLat * 180 / Math.PI;

    return transform([circleCenterWGS[0], newPositionLat], "EPSG:4326", getMapProjection(map));
}

/**
 * Calculates new flat and extent longitude coordinates for the (circle-) feature.
 * These coordiantes are calculated on the basis of the circle diameter specified by the user.
 *
 * @param {module:ol/coordinate~Coordinate} circleCenter The center of the circle to be calculated.
 * @param {Number} circleDiameter The diameter of the circle to be calculated.
 * @param {module:ol/Map} map Map object.
 * @returns {module:ol/coordinate~Coordinate} New and transformed extent / flat coordinates of the circle.
 */
function getCircleExtentByDistanceLon (circleCenter, circleDiameter, map) {
    const offsetLon = circleDiameter / 2,
        circleCenterWGS = toLonLat(circleCenter, getMapProjection(map)),
        deltaLon = offsetLon / (earthRadius * Math.cos(Math.PI * circleCenterWGS[1] / 180)),
        newPositionLon = circleCenterWGS[0] + deltaLon * 180 / Math.PI;

    return transform([newPositionLon, circleCenterWGS[1]], "EPSG:4326", getMapProjection(map));
}

export {
    calculateCircle,
    getCircleExtentByDistanceLat,
    getCircleExtentByDistanceLon
};
