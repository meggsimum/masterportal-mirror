/**
 * Parses stramed coordinates to pairs of coordinates.
 * @param {(string[]|number[])} coordinates - flat coordinates where two following belong together
 * @returns {Array.<number[]>} array of coordinate pairs
 */
export default function coordsToPairs (coordinates) {
    const floatCoords = coordinates.map(parseFloat),
        result = [];

    while (floatCoords.length) {
        result.push(floatCoords.splice(0, 2));
    }

    return result;
}
