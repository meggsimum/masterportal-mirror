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
    return intersects(getCurrentExtent(), feature.getGeometry().getExtent());
}

/**
 * Returns the current extent of the browser.
 * @returns {Object} the mapExtent
 */
function getCurrentExtent () {
    return Radio.request("MapView", "getCurrentExtent");
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
 * @param {String} layerId the id of the layer
 * @param {String[]} ids a list of feature ids
 * @returns {void}
 */
function showFeaturesByIds (layerId, ids) {
    Radio.trigger("ModelList", "showFeaturesById", layerId, ids);
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
 * @param {Function} callback the callback to call when zoom has finished
 * @returns {void}
 */
function liveZoom (minScale, featureIds, layerId, callback) {
    const minResolution = Radio.request("MapView", "getResolutionByScale", minScale);

    Radio.trigger("Map", "zoomToFilteredFeatures", featureIds, layerId, {
        minResolution,
        callback
    });
}

/**
 * Adds a layer model by the given layerId.
 * @param {String} layerId the layer Id
 * @returns {void}
 */
function addLayerByLayerId (layerId) {
    Radio.trigger("ModelList", "addModelsByAttributes", {"id": layerId});
}

/**
 * Returns all current layers.
 * @returns {ol/Layer[]} a list of layers
 */
function getLayers () {
    return Radio.request("Map", "getLayers");
}

/**
 * Check if current ui style is table
 * @returns {Boolean} true/false if current ui style of portal is table
 */
function isUiStyleTable () {
    return Radio.request("Util", "getUiStyle") === "TABLE";
}

/**
 * Setting the filter in table Menu
 * @param {Object} element the html element in Object
 * @returns {void}
 */
function setFilterInTableMenu (element) {
    Radio.trigger("TableMenu", "appendFilter", element);
}

export {
    createLayerIfNotExists,
    getFeaturesByLayerId,
    getLayerByLayerId,
    isFeatureInMapExtent,
    getCurrentExtent,
    liveZoom,
    showFeaturesByIds,
    addLayerByLayerId,
    getLayers,
    isUiStyleTable,
    setFilterInTableMenu
};
