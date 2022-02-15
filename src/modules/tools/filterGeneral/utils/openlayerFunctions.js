import {intersects} from "ol/extent.js";

/**
 * Returns all features of a layer specified with the given layerId.
 * @param {String} layerId the id of the layer
 * @returns {ol/Feature[]} the features
 */
function getFeaturesByLayerId (layerId) {
    const layer = Radio.request("ModelList", "getModelByAttributes", {id: layerId});

    if (!layer || !layer?.has("layer")) {
        return [];
    }

    if (layer.get("isClustered")) {
        return layer.get("layer").getSource().getSource().getFeatures();
    }

    return layer.get("layer").getSource().getFeatures();
}

/**
 * Checks if the given feature is in the current map extent of the browser.
 * @param {ol/Feature} feature the feature to check
 * @returns {Boolean} true if the feature is in the current map extent of the browser
 */
function isFeatureInMapExtent (feature) {
    const mapExtent = Radio.request("MapView", "getCurrentExtent");

    return intersects(mapExtent, feature.getGeometry().getExtent());
}

/**
 * Returns the layer for the given layerId.
 * @param {String} layerId the id of the layer
 * @returns {ol/Layer} the layer
 */
function getLayerByLayerId (layerId) {
    return Radio.request("ModelList", "getModelByAttributes", {id: layerId});
}

/**
 * Shows the features with the given ids on the given layer
 * @param {ol/Layer} layer the layer to show the features on
 * @param {String[]} ids a list of feature ids
 * @returns {void}
 */
function showFeaturesByIds (layer, ids) {
    Radio.trigger("ModelList", "showFeaturesById", layer, ids);
}

/**
 * Creates a new layer or returns the existing one for a specific layer name.
 * @param {String} layername the id of the new layer
 * @returns {ol/Layer} the layer
 */
function createLayerIfNotExists (layername) {
    return Radio.request("Map", "createLayerIfNotExists", layername);
}

/**
 * Zooms to an extent of a feature considering the min scale.
 * @param {Number} minScale the minimum scale
 * @param {String[]} featureIds the filtered feature Ids
 * @param {String} layerId the layer Id
 * @returns {void}
 */
function liveZoom (minScale, featureIds, layerId) {
    const minResolution = Radio.request("MapView", "getResolutionByScale", minScale);

    Radio.trigger("Map", "zoomToFilteredFeatures", featureIds, layerId, {minResolution});
}

export {
    createLayerIfNotExists,
    getFeaturesByLayerId,
    getLayerByLayerId,
    isFeatureInMapExtent,
    liveZoom,
    showFeaturesByIds
};
