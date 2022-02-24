import isObject from "../../../../utils/isObject.js";

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
    }

    /**
     * Initializes an internal layer for the given layerId. This layer shall be configured via config.json and is accessible in the theme tree.
     * @param {Number} filterId the filter id for reference
     * @param {String} layerId the layer id
     * @param {Function} onerror a function(error) if an error occurs
     * @returns {void}
     */
    initializeLayerFromTree (filterId, layerId, onerror) {
        const layers = this.handlers.getLayers(),
            visibleLayer = typeof layers?.getArray !== "function" ? [] : layers.getArray().filter(layer => {
                return layer.getVisible() === true && layer.get("id") === layerId;
            });
        let layerModel = null;

        if (Array.isArray(visibleLayer) && !visibleLayer.length) {
            this.handlers.addLayerByLayerId(layerId);
        }
        layerModel = this.handlers.getLayerByLayerId(layerId);

        if (!layerModel) {
            onerror(new Error("mapHandler - initializeInternalLayer: Please check your filter configuration. The given layerId does not exist in your config.json. Configure an extra service object for your filter configuration or add the layer to your config.json."));
            return;
        }

        this.layers[filterId] = layerModel;
        this.filteredIds[filterId] = [];
    }

    /**
     * Initializes an external layer with the given layerId.
     * @param {Number} filterId the filter id for reference
     * @param {String} layerId the layer id to use for the layer
     * @returns {void}
     */
    initializeLayerFromExtern (filterId, layerId) {
        this.layers[filterId] = Radio.request("Map", "createLayerIfNotExists", layerId);
        this.filteredIds[filterId] = [];
    }

    /**
     * Checks if the layerModel of the given filterId is a layer from extern.
     * @param {Number} filterId the id of the filter
     * @returns {Boolean} true if this is a layer from extern
     */
    isLayerExtern (filterId) {
        const layerModel = this.getLayerModelByFilterId(filterId);

        return !isObject(layerModel.layer) || typeof layerModel.layer.getSource !== "function";
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
            return layerModel.get("isVisible") ? layerModel.get("isVisible") : false;
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

        if (!this.isLayerActivated(filterId) && !this.isLayerExtern(filterId)) {
            layerModel.layer.getSource().once("featuresloadend", () => {
                if (typeof onActivated === "function") {
                    onActivated();
                }
            });
            layerModel.set("isSelected", true);
            layerModel.set("isVisible", true);
        }
        else if (!this.isLayerVisibleInMap(filterId)) {
            layerModel.set("isSelected", true);
            layerModel.set("isVisible", true);
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
            layerModel.set("isVisible", false);
        }
    }

    /**
     * Empties the currently filteredIds and removes all features from the map.
     * @info do not use layer.getSource().clear() here, as this would destroy all features and thereby any map handling
     * @param {Number} filterId the filter id
     * @returns {void}
     */
    clearLayer (filterId) {
        const layerModel = this.getLayerModelByFilterId(filterId);

        this.filteredIds[filterId] = [];
        if (isObject(layerModel) && typeof layerModel.get === "function") {
            if (!this.isLayerExtern(filterId)) {
                this.handlers.showFeaturesByIds(layerModel.get("id"), []);
            }
            else {
                layerModel.getSource().clear();
            }
        }
    }

    /**
     * Refreshes the layer with the up to this point filtered items.
     * @param {Number} filterId the filter id
     * @returns {void}
     */
    refreshLayer (filterId) {
        const layerModel = this.getLayerModelByFilterId(filterId);

        if (isObject(layerModel) && typeof layerModel.get === "function") {
            this.handlers.showFeaturesByIds(layerModel.get("id"), this.filteredIds[filterId]);
        }
    }

    /**
     * Adds the given items to the layer of the given filterId.
     * @info Already added items shall not be part of items. Items are only new items.
     * @param {Number} filterId the filter id
     * @param {ol/Feature} items the items/features to add
     * @returns {void}
     */
    addItemsToLayer (filterId, items) {
        const layerModel = this.getLayerModelByFilterId(filterId);

        if (!isObject(layerModel) || typeof layerModel.get !== "function" || !Array.isArray(items)) {
            return;
        }

        if (this.isLayerExtern(filterId)) {
            layerModel.getSource().addFeatures(items);
        }
        else {
            items.forEach(item => {
                if (isObject(item) && typeof item.getId === "function") {
                    this.filteredIds[filterId].push(item.getId());
                }
            });
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

        this.isZooming = true;
        if (isObject(layerModel) && Array.isArray(filteredFeatureIds)) {
            this.handlers.liveZoom(minScale, filteredFeatureIds, layerModel.get("id"), () => {
                this.isZooming = false;
            });
        }
    }
}
