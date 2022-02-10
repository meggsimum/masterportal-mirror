import isObject from "../../../../utils/isObject.js";
import Feature from "ol/Feature";

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

        this.knownLayers = {};
        this.currentlyFilteredItems = {};

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
    }

    /**
     * Visualizes the features of the given filterAnswer.
     * @param {Object} filterAnswer the object to use for handling features/items
     * @param {Function} onerror a function(error) with error of type Error
     * @returns {void}
     */
    visualize (filterAnswer, onerror) {
        if (!isObject(filterAnswer)) {
            if (typeof onerror === "function") {
                onerror(new Error("Filter MapHandler.visualize: The given filterAnswer must be an object"));
            }
            return;
        }
        const service = isObject(filterAnswer.service) ? filterAnswer.service : false,
            filterId = typeof filterAnswer?.filterId === "number" ? filterAnswer.filterId : false,
            page = typeof filterAnswer?.paging?.page === "number" ? filterAnswer.paging.page : false,
            items = Array.isArray(filterAnswer.items) ? filterAnswer.items : false;

        if (service === false) {
            if (typeof onerror === "function") {
                onerror(new Error("Filter MapHandler.visualize: A service object is required to identify layers."));
            }
            return;
        }
        else if (filterId === false) {
            if (typeof onerror === "function") {
                onerror(new Error("Filter MapHandler.visualize: A filterId to identify the source must exist at the given filterAnswer."));
            }
            return;
        }
        else if (page === false) {
            if (typeof onerror === "function") {
                onerror(new Error("Filter MapHandler.visualize: The paging must contain a page parameter to identify the state of the filterAnswer."));
            }
            return;
        }
        else if (items === false) {
            return;
        }

        if (service?.layerId) {
            const layer = this.getLayerOfTreeSource(filterId, service.layerId);

            this.visualizeTreeSource(filterId, items, layer, page);
        }
        else {
            const layer = this.getLayerOfExternalSource(filterId);

            this.visualizeExternalSource(items, layer, page);
        }
    }

    /**
     * Visualizes the items for a layer rooted in the tree.
     * @param {Number} filterId the internal filter ID to identify the source of the filter answer
     * @param {ol/Feature[]} items a list of features, new in the filterAnswer
     * @param {ol/Layer} layer the layer to handle
     * @param {Number} page the number of the page within the paging
     * @returns {void}
     */
    visualizeTreeSource (filterId, items, layer, page) {
        const ids = [];

        if (page === 1 || !Object.prototype.hasOwnProperty.call(this.currentlyFilteredItems, filterId)) {
            this.currentlyFilteredItems[filterId] = [];
        }

        this.currentlyFilteredItems[filterId].forEach(item => {
            if (item instanceof Feature) {
                ids.push(item.getId());
            }
        });
        items.forEach(item => {
            if (item instanceof Feature) {
                this.currentlyFilteredItems[filterId].push(item);
                ids.push(item.getId());
            }
        });

        this.handlers.showFeaturesByIds(layer, ids);
    }

    /**
     * Returns the layer by given id or the recycled layer from the internal known layers.
     * @param {Number} filterId the internal filter ID to identify the source of the filter answer
     * @param {Number} layerId the configured layer ID of the already (!) loaded layer
     * @returns {Object} the layer to work with
     */
    getLayerOfTreeSource (filterId, layerId) {
        if (Object.prototype.hasOwnProperty.call(this.knownLayers, filterId)) {
            return this.knownLayers[filterId];
        }
        this.knownLayers[filterId] = this.handlers.getLayerByLayerId(layerId);
        return this.knownLayers[filterId];
    }

    /**
     * Visualizes the items for an external layer.
     * @param {ol/Feature[]} items a list of features, new in the filterAnswer
     * @param {ol/Layer} layer the layer to handle
     * @param {Number} page the number of the page within the paging
     * @param {Function} onerror a function(error) with error of type Error
     * @returns {void}
     */
    visualizeExternalSource (items, layer, page, onerror) {
        if (typeof layer?.getSource !== "function") {
            if (typeof onerror === "function") {
                onerror(new Error("Filter MapHandler.visualizeExternalSource: The layer must be a valid ol layer."));
            }
            return;
        }
        else if (page === 1) {
            layer.getSource().clear();
        }

        items.forEach(item => {
            if (item instanceof Feature) {
                layer.getSource().addFeature(item);
            }
        });
    }

    /**
     * Returns the layer by given id or the recycled layer from the internal known layers.
     * @param {Number} filterId the internal filter ID to identify the source of the filter answer
     * @returns {Object} the layer to work with
     */
    getLayerOfExternalSource (filterId) {
        if (Object.prototype.hasOwnProperty.call(this.knownLayers, filterId)) {
            return this.knownLayers[filterId];
        }
        this.knownLayers[filterId] = this.handlers.createLayerIfNotExists("filterGeneral-" + filterId);
        return this.knownLayers[filterId];
    }

    /**
     * Showing only the features with the id by triggering the function in openlayerFunction file
     * @param {ol/Layer} layer the layer to handle
     * @param {String[]} ids a list of feature ids
     * @returns {void}
     */
    showFeaturesByIds (layer, ids) {
        this.handlers.showFeaturesByIds(layer, ids);
    }

    /**
     * Zoom to filtered features
     * @param {Number} minScale the minimum scale
     * @param {String[]} filteredFeatureIds the filtered feature Ids
     * @param {String} layerId the layer Id
     * @param {Function} onerror a function(error) with error of type Error
     * @returns {void}
     */
    zoomToFilteredFeature (minScale, filteredFeatureIds, layerId, onerror) {
        if (typeof minScale !== "number") {
            if (typeof onerror === "function") {
                onerror(new Error("Filter MapHandler.zoomToFilteredFeature: The format of minScale is not right"));
            }
            return;
        }
        else if (!filteredFeatureIds.length) {
            if (typeof onerror === "function") {
                onerror(new Error("Filter MapHandler.zoomToFilteredFeature: There are no filtered features"));
            }
            return;
        }
        else if (typeof layerId === "undefined") {
            if (typeof onerror === "function") {
                onerror(new Error("Filter MapHandler.zoomToFilteredFeature: There are no valid layer Id"));
            }
            return;
        }

        this.handlers.liveZoom(minScale, filteredFeatureIds, layerId);
    }
}
