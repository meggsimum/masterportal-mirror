/* ******************* Layer ******************* */
/**
 * Fires if property isVisibleInMap changes.
 * Can be done directly or is no longer needed, if all layers are handeled by store and modellList is refactored.
 * @param {Object} layerModel the layer
 * @param {boolean} value value of isVisibleInMap
 * @returns {void}
 */
export function layerVisibilityChanged (layerModel, value) {
    Radio.trigger("Layer", "layerVisibleChanged", layerModel.get("id"), value, layerModel);
    Radio.trigger("ModelList", "selectedChanged", layerModel, value);
    Radio.trigger("ModelList", "updatedSelectedLayerList", getLayerModelsByAttributes({isSelected: true, type: "layer"}));
}
/* ******************* Legend ******************* */
/**
 * Set layer to rebuild legend
 * Can be done directly or is no longer needed, if all layers are handeled by store and modellList is refactored.
 * @param {Object} layerModel the layer
 * @param {boolean} value value of isVisibleInMap
 * @returns {void}
 */
export function setLegendLayerList () {
    Radio.trigger("Legend", "setLayerList");
}
/**
 * Listens to changes of attribute SLDBody.
 * Can be done directly or is no longer needed, if tool styleWMS  and treefilter are refactored.
 * @param {Object} layerModel the layer
 * @returns {void}
 */
export function listenToChangeSLDBody (layerModel) {
    Radio.channel("Layer").on({
        "change:SLDBody": layerModel.updateSourceSLDBody
    });
}
/* ******************* Map ******************* */
/**
 * Returns the corresponding resolution for the scale.
 * @param  {String|number} scale - scale to compare
 * @param  {String} scaleType - min or max
 * @return {number} the resolution
 */
export function getResolutionByScale (scale, scaleType) {
    return Radio.request("MapView", "getResolutionByScale", scale, scaleType);
}
/**
 * Triggers adding layer at given index in modelList.
 * Can be done directly or is no longer needed, if modelList is refactored.
 * @param {ol.Layer} layer the layer of the layerModel
 * @param {number} selectionIDX index to insert into list
 * @returns {void}
 */
export function addLayerToIndex (layer, selectionIDX) {
    Radio.trigger("Map", "addLayerToIndex", [layer, selectionIDX]);
}
/* ******************* MapView ******************* */
/**
 * Request options from Mapview
 * Can be done directly or is no longer needed, if modelList is refactored.
 * @param {ol.Layer} layer the layer of the layerModel
 * @param {number} selectionIDX index to insert into list
 * @returns {void}
 */
export function getOptionsFromMapView () {
    Radio.request("MapView", "getOptions");
}
/* ******************* Menu ******************* */
/**
 * Fires if property isOutOfRange changes.
 * Can be done directly or is no longer needed, if menu is refactored.
 * @param {Object} layerModel the layer
 * @param {boolean} value value of outOfRange
 * @returns {void}
 */
export function outOfRangeChanged (layerModel, value) {
    Radio.trigger("Menu", "change:isOutOfRange", layerModel, value);
}
/**
 * Fires if property isVisibleInTree changes.
 * Can be done directly or is no longer needed, if menu is refactored.
 * @param {Object} layerModel the layer
 * @returns {void}
 */
export function isVisibleInTreeChanged (layerModel) {
    Radio.trigger("Menu", "change:isVisibleInTree", layerModel);
}
/**
 * Fires if menu must be rendered.
 * Can be done directly or is no longer needed, if menu is refactored.
 * @returns {void}
 */
export function renderMenu () {
    Radio.trigger("Menu", "rerender");
}
/**
 * Fires if menu selection must be rendered.
 * Can be done directly or is no longer needed, if menu is refactored.
 * @returns {void}
 */
export function renderMenuSelection () {
    Radio.trigger("MenuSelection", "rerender");
}
/**
 * Fires if settings in menu must be rendered.
 * Can be done directly or is no longer needed, if menu is refactored.
 * @param {String} layerId The layer id.
 * @returns {void}
 */
export function renderMenuSettings (layerId) {
    Radio.trigger("Menu", "renderSetting", layerId);
    Radio.trigger("MenuSelection", "renderSetting", layerId);
}
/* ******************* ModelList ******************* */

/**
 * Removes the layer with the given id from the modelList.
 * Can be done directly or is no longer needed, if modelList is refactored.
 * @param {String} id of the layer to remove
 * @returns {void}
 */
export function removeLayerByIdFromModelList (id) {
    Radio.trigger("ModelList", "removeLayerById", id);
}
/**
 * Updates the layer view in tree and updates selection in tree.
 * Can be done directly or is no longer needed, if menu is refactored.
 * @param {Object} layerModel the layer
 * @returns {void}
 */
export function updateLayerView (layerModel) {
    Radio.trigger("ModelList", "updateLayerView");
    Radio.trigger("ModelList", "updateSelection", layerModel);
}
/**
 * Returns all layers.
 * Can be done directly or is no longer needed, if modelList is refactored.
 * @returns {void}
 */
export function getAllLayers () {
    return Radio.request("ModelList", "getCollection");
}
/**
 * Returns the layerModel with the given attributes.
 * Can be done directly or is no longer needed, if modelList is refactored.
 * @param {Object} attributes of the model to search for
 * @returns {void}
 */
export function getLayerModelsByAttributes (attributes) {
    return Radio.request("ModelList", "getModelsByAttributes", attributes);
}
/**
 * Moves the layer in tree.
 * Can be done directly or is no longer needed, if modelList is refactored.
 * @param {Object} layerModel the layer
 * @param {Number} value -1 moves down and 1 moves up
 * @returns {void}
 */
export function moveModelInTree (layerModel, value) {
    Radio.trigger("ModelList", "moveModelInTree", layerModel, value);
    Radio.trigger("Layer", "layerVisibleChanged", layerModel.get("id"), layerModel.get("isVisibleInMap"), layerModel);
}
/**
 * Removes layer from project completely.
 * Can be done directly or is no longer needed, if modelList is refactored.
 * @param {String} id id of the layer
 * @returns {void}
 */
export function removeItem (id) {
    Radio.trigger("Parser", "removeItem", id);
}
/**
 * Refresh layer tree.
 * Can be done directly or is no longer needed, if modelList is refactored.
 * @returns {void}
 */
export function refreshLayerTree () {
    Radio.trigger("Util", "refreshTree");
}
/**
 * Triggers resetFeatures on VectorLayer.
 * @param {String} layerId id of the layer
 * @param {Array.<module:ol/Feature~Feature.<Geometry>>} allLayerFeatures all features of the layer
 * @returns {void}
 */
export function resetVectorLayerFeatures (layerId, allLayerFeatures) {
    Radio.trigger("VectorLayer", "resetFeatures", layerId, allLayerFeatures);
}
/**
 * Triggers featuresLoaded on VectorLayer.
 * @param {String} layerId id of the layer
 * @param {Array.<module:ol/Feature~Feature.<Geometry>>} features all features of the layer
 * @returns {void}
 */
export function featuresLoaded (layerId, features) {
    Radio.trigger("VectorLayer", "featuresLoaded", layerId, features);
}
/**
 * Returns the style model to the given id.
 * @param {String} styleId id of the style model
 * @returns {Object} the style model
 */
export function getStyleModelById (styleId) {
    return Radio.request("StyleList", "returnModelById", styleId);
}
/**
 * Listens to channel i18next and changes the translations of the layer, if language changes.
 * @param {boolean} layer the layer to call the function 'changeLang' at.
 * @returns {void}
 */
export function onLanguageChanged (layer) {
    const channel = Radio.channel("i18next");

    channel.on({
        "languageChanged": function () {
            if (typeof layer.changeLang === "function") {
                layer.changeLang();
            }
            else {
                console.warn("Layer ", layer, "must impelement the function changeLang to translate its textes.");
            }
        }
    }, this);
}

