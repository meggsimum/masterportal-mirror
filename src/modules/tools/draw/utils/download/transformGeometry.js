import proj4 from "proj4";

/**
 * Transforms the given line or polygon coordinates from a given source projection to EPSG:4326.
 *
 * @param {string} sourceProjectionCode source projection.
 * @param {(Array<number>|Array<Array<number>>|Array<Array<Array<number>>>)} coords Coordinates.
 * @param {Boolean} isPolygon Determines whether the given coordinates are a polygon or a line.
 * @returns {(Array<number>|Array<Array<number>>|Array<Array<Array<number>>>)} Transformed coordinates.
 */
function transform (sourceProjectionCode, coords, isPolygon) {
    const transCoords = [];

    // NOTE(roehlipa): The polygon parts look like they would not work as intended. Simply copied from the old version.
    for (const value of coords) {
        if (isPolygon) {
            value.forEach(point => {
                transCoords.push(transformPoint(sourceProjectionCode, point));
            });
            continue;
        }
        transCoords.push(transformPoint(sourceProjectionCode, value));
    }

    return isPolygon ? [transCoords] : transCoords;
}

/**
 * Transforms the given point coordinates from a given source projection to EPSG:4326.
 *
 * @param {string} sourceProjectionCode source projection.
 * @param {number[]} coords Coordinates.
 * @returns {number[]} Transformed coordinates.
 */
function transformPoint (sourceProjectionCode, coords) {
    return proj4(proj4(sourceProjectionCode), proj4("EPSG:4326"), coords);
}

/**
 * Transforms the given geometry from a given source projection to EPSG:4326.
 *
 * @param {string} sourceProjectionCode source projection.
 * @param {Geometry} geometry Geometry.
 * @returns {Geometry} The given geometry.
 */
function transformGeometry (sourceProjectionCode, geometry) {
    return geometry.transform(sourceProjectionCode, "EPSG:4326");
}

export {
    transform,
    transformPoint,
    transformGeometry
};
