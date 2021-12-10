
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
 * @param {ol.Layer} layer - the layer that is to be updated
 * @returns {void}
 */
export function updateSource (layer) {
    layer.getSource().clear(true);
    layer.getSource().addFeatures(layer.getFeatures());
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
