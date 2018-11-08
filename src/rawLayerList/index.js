import _ from "underscore";
import loadLayerList from "./loadLayerList.js";

/** @type{Array} layerList that contains all known services. */
let layerList = [];

/**
 * TODO rewrite async so that IE11 works (waiting on decision how to handle asynchronous flow here)
 * Initializes the layer list with either an object or an URL. May be used again to override the layer list.
 * @param {string|object} parameter - either the URL to fetch the services from, or the object containing the services
 * @returns {object} the layerList in use by this module now
 */
export async function initializeLayerList (parameter) {
    layerList = _.isArray(parameter)
        ? parameter
        : await loadLayerList(parameter);

    return layerList;
}

/**
 * Returns the first entry in layerList matching the given searchAttributes.
 * @param {object} searchAttributes - key/value-pairs to be searched for, e.g. { typ: "WMS" } to get the first WMS
 * @returns {object|null} first layer matching the searchAttributes or null if none was found
 */
export function getLayerWhere (searchAttributes) {
    return _.findWhere(layerList, searchAttributes) || null;
}

/** @returns {object[]} complete layerList as initialized */
export function getLayerList () {
    return layerList;
}

/**
 * Returns display names map for a layer.
 * @param {string} layerId - if of layer to fetch display names for
 * @returns {object|null} - map of originalName->displayName, or null if layer not found
 */
export function getDisplayNamesOfFeatureAttributes (layerId) {
    var attributes = getLayerWhere({id: layerId});

    return attributes ? attributes.gfiAttributes : null;
}
