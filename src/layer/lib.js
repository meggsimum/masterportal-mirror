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
