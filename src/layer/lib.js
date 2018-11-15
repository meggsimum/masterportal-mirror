/**
 * @param {ol/Layer} layer - layer to check
 * @param {number} params - parameter object
 * @param {number} [params.resolution] - resolution to check; if not given, map is required
 * @param {object} [params.map] - map to check; if not given, resolution is required
 * @returns {boolean} whether layer is visible in given resolution
 */
export function isLayerVisibleInResolution (layer, {resolution, map}) {
    const r = typeof resolution === "undefined"
        ? map.getView().getResolution()
        : resolution;

    return layer.getMaxResolution() >= r && r >= layer.getMinResolution();
}

/**
 * Generates an array of URLs that are supposed to hold legend graphics.
 *
 * @param {*} rawLayer - layer specification as in services.json
 * @param {string} [rawLayer.layers=""] - comma separated list of service layers
 * @returns {string[]} URLs of legend graphics for the rawLayer.
 */
export function getLegendURLs ({legendURL, layers = "", url, typ, format, version}) {
    if (legendURL) {
        return legendURL === "ignore" ? [] : [legendURL];
    }

    return layers
        .split(",")
        .filter(x => x /* filters empty string since it's falsy */)
        .map(layerName => `${url}&SERVICE=${typ}&REQUEST=GetLegendGraphic&FORMAT=${format || "image/png"}?VERSION=${version}&LAYER=${layerName}`);
}
