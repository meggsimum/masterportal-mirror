/**
 * @param {ol/Layer} layer - layer to check
 * @param {number} resolution - resolution to check
 * @returns {boolean} whether layer is visible in given resolution
 */
export function isLayerVisibleInResolution (layer, resolution) {
    // TODO make resolution optional, alternatively user may throw in map, function resolves current resolution then
    return layer.getMaxResolution() >= resolution && resolution >= layer.getMinResolution();
}
