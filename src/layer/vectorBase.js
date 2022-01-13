
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";

/**
 * Triggered by Layer to create a layerSource respectively a clusterLayerSource
 * @returns {void}
 */
export function createLayerSource () {
    return new VectorSource();
}

/**
 * Forces an update by giving a layer a new sessionID.
 * @param {module:ol/layer/Base~BaseLayer} layer The vector base layer that is to be updated.
 * @param {module:ol/Feature~Feature[]} features The ol features.
 * @returns {void}
 */
export function updateSource (layer, features) {
    layer.getSource().clear(true);
    layer.getSource().addFeatures(features);
}

/**
 * Triggered by Layer to create an ol/layer/Vector
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
