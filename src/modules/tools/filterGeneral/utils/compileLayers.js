import isObject from "../../../../utils/isObject";
import FilterApi from "../interfaces/filter.api.js";

/**
 * Clones, checks and modifies the given original layers to match the needs of FilterGeneral.
 * @param {Object[]|String[]} originalLayers the configured layers
 * @returns {Object[]} resulting layers to use in FilterGeneral
 */
function compileLayers (originalLayers) {
    const layers = removeInvalidLayers(JSON.parse(JSON.stringify(originalLayers)));

    convertStringLayersIntoObjects(layers);
    addFilterIds(layers);
    addSnippetArrayIfMissing(layers);
    addApi(layers);

    return layers;
}

/**
 * Removes all non object and non string layers from the given array and all its category layers. Returns the result.
 * @param {*[]} layers a list of layers with a potential object string mix
 * @returns {Object[]|String[]} a list of layers with a object and string mix
 */
function removeInvalidLayers (layers) {
    if (!Array.isArray(layers)) {
        return [];
    }
    const result = [];

    layers.forEach(layer => {
        if (!isObject(layer) && typeof layer !== "string") {
            return;
        }
        if (typeof layer?.category === "string") {
            layer.layers = removeInvalidLayers(layer.layers);
        }
        result.push(layer);
    });

    return result;
}

/**
 * Converts all string representations of layers into objects.
 * @param {Object[]|String[]} layers a list of layers a with potential object string mix
 * @returns {void}
 */
function convertStringLayersIntoObjects (layers) {
    layers.forEach((layer, idx) => {
        if (typeof layer === "string") {
            layers[idx] = {
                layerId: layer
            };
        }
        else if (typeof layer.category === "string") {
            convertStringLayersIntoObjects(layer.layers);
        }
    });
}

/**
 * Adds a unique filterId to each given layer.
 * @param {Object[]} layers the list of layers
 * @param {Object} [nextFilterId={}] getter, increment and instance for next filter id reference
 * @returns {void}
 */
function addFilterIds (layers, nextFilterId = {}) {
    if (typeof nextFilterId.id !== "number") {
        nextFilterId.id = 0;
        nextFilterId.inc = () => {
            nextFilterId.id++;
        };
        nextFilterId.get = () => {
            return nextFilterId.id;
        };
    }

    layers.forEach(layer => {
        layer.filterId = nextFilterId.get();
        nextFilterId.inc();
        if (typeof layer.category === "string") {
            addFilterIds(layer.layers, nextFilterId);
        }
    });
}

/**
 * Adds a snippet array for the layer if missing.
 * @param {Object[]} layers the list of layers
 * @returns {void}
 */
function addSnippetArrayIfMissing (layers) {
    layers.forEach(layer => {
        if (typeof layer.category === "string") {
            addSnippetArrayIfMissing(layer.layers);
        }
        else if (!Array.isArray(layer.snippets)) {
            layer.snippets = [];
        }
    });
}

/**
 * Initializes a filter api for every layer.
 * @param {Object[]} layers the list of layers
 * @returns {void}
 */
function addApi (layers) {
    layers.forEach(layer => {
        if (typeof layer.category === "string") {
            addApi(layer.layers);
        }
        else {
            layer.api = new FilterApi(layer.filterId);
        }
    });
}

/**
 * Setter for layerConfigsAssoc - use getter to grap layer by filterId.
 * @param {Object[]} layers the layers to build the assoc from
 * @param {Object} assoc the object with filterId as key and the layer as value for recursion
 * @returns {Object} an object with filterId as key and the layer as value
 */
function createLayerConfigsAssoc (layers, assoc = {}) {
    layers.forEach(layer => {
        assoc[layer.filterId] = layer;
        if (typeof layer.category === "string") {
            createLayerConfigsAssoc(layer.layers, assoc);
        }
    });
    return assoc;
}

export {
    compileLayers,
    removeInvalidLayers,
    convertStringLayersIntoObjects,
    addFilterIds,
    addSnippetArrayIfMissing,
    createLayerConfigsAssoc
};
