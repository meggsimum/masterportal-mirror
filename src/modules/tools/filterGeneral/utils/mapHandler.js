import isObject from "../../../../utils/isObject.js";
import LayerGroup from "ol/layer/Group";

/**
 * The MapHandler has control over OL and the Map.
 * Using Filter-Answer the MapHandler activates/deactivates features/items and resets layers to their former state.
 * @class
 */
export default class MapHandler {
    /**
     * @constructor
     * @param {Object} handlers the functions to call external triggers with
     * @param {Function} onerror a function(error) with error of type Error
     */
    constructor (handlers, onerror) {
        this.handlers = handlers;

        this.layers = {};
        this.filteredIds = {};
        this.isZooming = false;

        if (typeof this.handlers?.getLayerByLayerId !== "function") {
            if (typeof onerror === "function") {
                onerror(new Error("Filter MapHandler.constructor: The given handler needs a function 'getLayerByLayerId'"));
            }
        }
        if (typeof this.handlers?.showFeaturesByIds !== "function") {
            if (typeof onerror === "function") {
                onerror(new Error("Filter MapHandler.constructor: The given handler needs a function 'showFeaturesByIds'"));
            }
        }
        if (typeof this.handlers?.createLayerIfNotExists !== "function") {
            if (typeof onerror === "function") {
                onerror(new Error("Filter MapHandler.constructor: The given handler needs a function 'createLayerIfNotExists'"));
            }
        }
        if (typeof this.handlers?.liveZoom !== "function") {
            if (typeof onerror === "function") {
                onerror(new Error("Filter MapHandler.constructor: The given handler needs a function 'liveZoom'"));
            }
        }
        if (typeof this.handlers?.addLayerByLayerId !== "function") {
            if (typeof onerror === "function") {
                onerror(new Error("Filter MapHandler.constructor: The given handler needs a function 'addLayerByLayerId'"));
            }
        }
        if (typeof this.handlers?.getLayers !== "function") {
            if (typeof onerror === "function") {
                onerror(new Error("Filter MapHandler.constructor: The given handler needs a function 'getLayers'"));
            }
        }
        if (typeof this.handlers?.setParserAttributeByLayerId !== "function") {
            if (typeof onerror === "function") {
                onerror(new Error("Filter MapHandler.constructor: The given handler needs a function 'setParserAttributeByLayerId'"));
            }
        }
    }

    /**
     * Initializes a layer for the given layerId. This layer must be configured via config.json.
     * @param {Number} filterId the filter id for reference
     * @param {String} layerId the layer id
     * @param {Boolean} extern true if external filtering will take place
     * @param {Function} onerror a function(error) if an error occurs
     * @returns {void}
     */
    initializeLayer (filterId, layerId, extern, onerror) {
        const layers = this.handlers.getLayers(),
            visibleLayer = typeof layers?.getArray !== "function" ? [] : layers.getArray().filter(layer => {
                return layer.getVisible() === true && layer.get("id") === layerId;
            });
        let layerModel = null;

        if (extern) {
            this.handlers.setParserAttributeByLayerId(layerId, "doNotLoadInitially", true);
        }
        if (Array.isArray(visibleLayer) && !visibleLayer.length) {
            this.handlers.addLayerByLayerId(layerId);
        }
        layerModel = this.handlers.getLayerByLayerId(layerId);

        if (layerModel?.layer instanceof LayerGroup) {
            const layerSource = layerModel.get("layerSource"),
                isVisibleInMap = layerModel.get("isVisibleInMap");

            layerSource.forEach(layer => {
                if (layer.id === layerId) {
                    layerModel = layer;
                }
            });

            layerModel.set("isVisibleInMap", isVisibleInMap);
        }

        if (!layerModel) {
            onerror(new Error("mapHandler - initializeLayer: Please check your filter configuration. The given layerId does not exist in your config.json. Configure an extra service object for your filter configuration or add the layer to your config.json."));
            return;
        }

        this.layers[filterId] = layerModel;
        this.filteredIds[filterId] = [];
    }

    /**
     * Getter for the layer model of the given filter id.
     * @param {Number} filterId the filter id
     * @returns {ol/Layer} the layer model
     */
    getLayerModelByFilterId (filterId) {
        return this.layers[filterId];
    }

    /**
     * Returns a list of filtered ids.
     * @param {Number} filterId the filter id
     * @returns {String[]} a list of layer ids
     */
    getFilteredIdsByFilterId (filterId) {
        return this.filteredIds[filterId];
    }

    /**
     * Returns the number of up to this point filtered items.
     * @param {Number} filterId the filter id
     * @returns {Number} the amount of items/features
     */
    getAmountOfFilteredItemsByFilterId (filterId) {
        const ids = this.getFilteredIdsByFilterId(filterId);

        if (Array.isArray(ids)) {
            return ids.length;
        }
        return 0;
    }

    /**
     * Checks if the layer for the given filterId exists and is visible in general (may not be visible on map).
     * @param {Number} filterId the filter id
     * @returns {Boolean} true if the layer is ready to use
     */
    isLayerActivated (filterId) {
        const layerModel = this.getLayerModelByFilterId(filterId);

        if (isObject(layerModel)) {
            return layerModel.get("isSelected") ? layerModel.get("isSelected") : false;
        }
        return false;
    }

    /**
     * Checks if the layer for the given filterId is visible on the map.
     * @param {Number} filterId the filter id
     * @returns {Boolean} true if the layer is visible on the map
     */
    isLayerVisibleInMap (filterId) {
        const layerModel = this.getLayerModelByFilterId(filterId);

        if (isObject(layerModel)) {
            return layerModel.get("isVisibleInMap");
        }
        return false;
    }

    /**
     * Activates the layer based on the state of the layer recognized by filterId.
     * @param {Number} filterId the filter id
     * @param {Function} onActivated a function to call when the layer is activated and ready to use
     * @returns {void}
     */
    activateLayer (filterId, onActivated) {
        const layerModel = this.getLayerModelByFilterId(filterId);

        if (!isObject(layerModel)) {
            return;
        }

        if (!this.isLayerActivated(filterId)) {
            layerModel.layer.getSource().once("featuresloadend", () => {
                if (typeof onActivated === "function") {
                    onActivated();
                }
            });
            layerModel.set("isSelected", true);
        }
        else if (!this.isLayerVisibleInMap(filterId)) {
            layerModel.set("isSelected", true);
            if (typeof onActivated === "function") {
                onActivated();
            }
        }
        else if (typeof onActivated === "function") {
            onActivated();
        }
    }

    /**
     * Deactivates the layer of the given filterId by setting isSelected and isVisible to false.
     * @param {Number} filterId the filter id
     * @returns {void}
     */
    deactivateLayer (filterId) {
        const layerModel = this.getLayerModelByFilterId(filterId);

        if (isObject(layerModel)) {
            layerModel.set("isSelected", false);
        }
    }

    /**
     * Empties the currently filteredIds and removes all features from the map.
     * @info do not use layer.getSource().clear() here, as this would destroy all features and thereby any map handling
     * @param {Number} filterId the filter id
     * @param {Boolean} extern true if filtering is external
     * @returns {void}
     */
    clearLayer (filterId, extern) {
        const layerModel = this.getLayerModelByFilterId(filterId);

        this.filteredIds[filterId] = [];
        if (!isObject(layerModel) || typeof layerModel.get !== "function") {
            return;
        }

        if (extern) {
            layerModel.get("layerSource").clear();
        }
        else {
            this.handlers.showFeaturesByIds(layerModel.get("id"), []);
        }
    }

    /**
     * Adds the given items to the layer of the given filterId.
     * @info Already added items shall not be part of items. Items are only new items.
     * @param {Number} filterId the filter id
     * @param {ol/Feature} items the items/features to add
     * @param {Boolean} extern true if filtering is external
     * @returns {void}
     */
    addItemsToLayer (filterId, items, extern) {
        if (!Array.isArray(this.filteredIds[filterId]) || !Array.isArray(items)) {
            return;
        }
        const layerModel = this.getLayerModelByFilterId(filterId);

        if (!isObject(layerModel) || typeof layerModel.get !== "function") {
            return;
        }

        items.forEach(item => {
            if (isObject(item) && typeof item.getId === "function") {
                this.filteredIds[filterId].push(item.getId());
            }
        });

        if (extern) {
            layerModel.get("layerSource").addFeatures(items);
        }
        else {
            this.handlers.showFeaturesByIds(layerModel.get("id"), this.filteredIds[filterId]);
        }
    }

    /**
     * Zoom to filtered features
     * @param {Number} filterId the filter id for reference
     * @param {Number} minScale the minimum scale
     * @param {Function} onerror a function(error) with error of type Error
     * @returns {void}
     */
    zoomToFilteredFeature (filterId, minScale, onerror) {
        if (this.isZooming) {
            return;
        }
        else if (typeof minScale !== "number") {
            if (typeof onerror === "function") {
                onerror(new Error("Filter MapHandler.zoomToFilteredFeature: The format of minScale is not right"));
            }
            return;
        }
        const layerModel = this.getLayerModelByFilterId(filterId),
            filteredFeatureIds = this.getFilteredIdsByFilterId(filterId);

        if (isObject(layerModel) && Array.isArray(filteredFeatureIds) && filteredFeatureIds.length) {
            this.isZooming = true;
            this.handlers.liveZoom(minScale, filteredFeatureIds, layerModel.get("id"), () => {
                this.isZooming = false;
            });
        }
    }
}
