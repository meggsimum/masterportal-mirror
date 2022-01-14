
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";

/**
 * Triggered by Layer to create a layerSource
 * @returns {void}
 */
export function createLayerSource () {
    return new VectorSource();
}

/**
 * updates the source
 * @param {module:ol/layer/Base~BaseLayer} layer The vector base layer that is to be updated.
 * @param {module:ol/Feature~Feature[]} features The ol features.
 * @returns {void}
 */
export function updateSource (layer, features) {
    layer.getSource().clear(true);
    layer.getSource().addFeatures(features);
}

/**
 * creates an vector Base
 * @param {Object} attrs  attributes of the layer
 * @returns {Object} layer
 */
export function createLayer (attrs) {
    const source = this.createLayerSource();

    return new VectorLayer({
        source: source,
        name: attrs.name,
        typ: attrs.typ,
        gfiAttributes: attrs.gfiAttributes,
        id: attrs.id
    });
}
