import stateMeasure from "./stateMeasure";
import {calculateLineLengths, calculatePolygonAreas} from "../utils/measureCalculation";

import {generateSimpleGetters} from "../../../../app-store/utils/generators";

const getters = {
    ...generateSimpleGetters(stateMeasure),
    /**
     * @param {object} state measure store state
     * @param {object} _ measure store getters
     * @param {object} __ root state
     * @param {object} rootGetters root getters
     * @returns {String[]} options for geometry selection
     */
    geometryValues ({geometryValues3d, geometryValues}, _, __, rootGetters) {
        return rootGetters["Maps/is3D"]
            ? geometryValues3d
            : geometryValues;
    },
    /**
     * @param {object} state measure store state
     * @param {object} _ measure store getters
     * @param {object} __ root state
     * @param {object} rootGetters root getters
     * @returns {String} selected geometry selection option
     */
    selectedGeometry ({geometryValues3d, selectedGeometry}, _, __, rootGetters) {
        return rootGetters["Maps/is3D"]
            ? geometryValues3d[0] // 3D mode only has one option
            : selectedGeometry;
    },
    /**
     * @param {object} state measure store state
     * @param {object} _ measure store getters
     * @param {object} __ root state
     * @param {object} rootGetters root getters
     * @returns {String[]} options for measurement units
     */
    currentUnits ({selectedGeometry, lineStringUnits, polygonUnits}, _, __, rootGetters) {
        return rootGetters["Maps/is3D"] || selectedGeometry === "LineString"
            ? lineStringUnits
            : polygonUnits;
    },
    /**
     * Calculates the length of lines.
     * @param {object} state measure store state
     * @param {object} _ measure store getters
     * @param {object} __ root state
     * @param {object} rootGetters root getters
     * @return {String[]} calculated display values
     */
    lineLengths ({lines, earthRadius, measurementAccuracy, selectedUnit}, _, __, rootGetters) {
        return calculateLineLengths(
            rootGetters["Map/projection"].getCode(),
            lines,
            earthRadius,
            measurementAccuracy,
            selectedUnit
        );
    },
    /**
     * Calculates the area of a polygon.
     * @param {object} state measure store state
     * @param {object} _ measure store getters
     * @param {object} __ root state
     * @param {object} rootGetters root getters
     * @return {String[]} calculated display values
     */
    polygonAreas ({polygons, earthRadius, measurementAccuracy, selectedUnit}, _, __, rootGetters) {
        return calculatePolygonAreas(
            rootGetters["Map/projection"].getCode(),
            polygons,
            earthRadius,
            measurementAccuracy,
            selectedUnit
        );
    }
};

export default getters;
