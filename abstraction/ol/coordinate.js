import {toStringHDMS, toStringXY} from "ol/coordinate.js";

export default {
    /**
     * Converts a xy-coordinate to a string.
     * @param {Number[]} coordinate The xy-coordinate to convert.
     * @param {Number} [fractionalDigit=0] The number of fractional digits.
     * @returns {String} The xy-coordinates as string.
     */
    toStringXY: function (coordinate, fractionalDigit = 0) {
        return toStringXY(coordinate, fractionalDigit);
    },

    /**
     * Format a geographic coordinate with the hemisphere, degrees, minutes, and seconds.
     * @param {Number[]} coordinate The geographic coordinate to format.
     * @param {Number} [fractionalDigit=0] The number of fractional digits.
     * @returns {String} The fromatted geographic coordinate.
     */
    toStringHDMS: function (coordinate, fractionalDigit = 0) {
        return toStringHDMS(coordinate, fractionalDigit);
    }
};
