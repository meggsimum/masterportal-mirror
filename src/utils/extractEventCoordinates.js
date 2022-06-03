/**
 * A function that reliably returns coordinates as an array.
 * @param {String[]|String} eventCoordinates An array or a string containing the coordinates.
 * @returns {String[]} An array of coordinates.
 */
function extractEventCoordinates (eventCoordinates) {
    if (Array.isArray(eventCoordinates)) {
        return eventCoordinates;
    }
    else if (typeof eventCoordinates === "string") {
        return eventCoordinates.split(" ");
    }
    return undefined;
}

export {extractEventCoordinates};
