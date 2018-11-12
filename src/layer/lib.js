import _ from "lodash";

/**
 * @param {ol/Layer} layer - layer to check
 * @param {number} params - parameter object
 * @param {number} [params.resolution] - resolution to check; if not given, map is required
 * @param {object} [params.map] - map to check; if not given, resolution is required
 * @returns {boolean} whether layer is visible in given resolution
 */
export function isLayerVisibleInResolution (layer, params) {
    var resolution = _.isUndefined(params.resolution)
        ? params.map.getView().getResolution()
        : params.resolution;

    return layer.getMaxResolution() >= resolution && resolution >= layer.getMinResolution();
}

/**
 * Generates an array of URLs that are supposed to hold legend graphics.
 * @param {*} rawLayer - layer specification as in services.json
 * @returns {string[]} URLs of legend graphics for the rawLayer.
 */
export function getLegendURLs (rawLayer) {
    if (rawLayer.legendURL) {
        return rawLayer.legendURL === "ignore" ? [] : [rawLayer.legendURL];
    }
    return rawLayer.layers
        .split(",")
        .filter(_.identity /* filters empty string since it's falsy */)
        .map(function (layerName) {
            return (
                rawLayer.url +
                "&SERVICE=" + rawLayer.typ +
                "&REQUEST=GetLegendGraphic" +
                "&FORMAT=" + rawLayer.format || "image/png" +
                "?VERSION=" + rawLayer.version +
                "&LAYER=" + layerName
            );
        });
}
