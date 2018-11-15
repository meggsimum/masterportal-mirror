import defaults from "./defaults";
import findWhere from "./lib/findWhere";

/** layerList that contains all known services.
 * @type{Array}
 * @ignore
 */
let layerList = [];

/**
 * Initializes the layer list with either an object or an URL. May be used again to override the layer list.
 * createMap will call this for you, but won't notify you of when it's done. Use this function manually with a
 * callback to know when layers can be added programmatically.
 * @param {(string|object)} [layerConf="http://geoportal-hamburg.de/lgv-config/services-internet.json"] - either the URL to fetch the services from, or the object containing the services
 * @param {function} [callback] - called with services after loaded; called with false and error on error
 * @returns {undefined} nothing, add callback to receive layerList
 */
export function initializeLayerList (layerConf = defaults.layerConf, callback) {
    if (Array.isArray(layerConf)) {
        // case: parameter was services.json contents
        layerList = layerConf;
        if (typeof callback === "function") {
            callback(layerList);
            return;
        }
        return;
    }

    // case: parameter is URL
    const Http = new XMLHttpRequest();

    Http.open("GET", layerConf);
    Http.send();
    Http.onload = function () {
        layerList = JSON.parse(Http.responseText);
        if (typeof callback === "function") {
            return callback(layerList);
        }
        return true;
    };
    Http.onerror = function (e) {
        console.error("An error occured when trying to fetch services from '" + layerConf + "':", e);
        callback(false, e);
    };
}

/**
 * Returns the first entry in layerList matching the given searchAttributes.
 * @param {object} searchAttributes - key/value-pairs to be searched for, e.g. { typ: "WMS" } to get the first WMS
 * @returns {?object} first layer matching the searchAttributes or null if none was found
 */
export function getLayerWhere (searchAttributes) {
    const keys = Object.keys(searchAttributes);

    return findWhere(layerList, entry => keys.every(key => entry[key] === searchAttributes[key]));
}

/** @returns {object[]} complete layerList as initialized */
export function getLayerList () {
    return layerList;
}

/**
 * Returns display names map for a layer.
 * @param {string} layerId - if of layer to fetch display names for
 * @returns {?object} - map of originalName->displayName, or null if layer not found
 */
export function getDisplayNamesOfFeatureAttributes (layerId) {
    const attributes = getLayerWhere({id: layerId});

    return attributes ? attributes.gfiAttributes : null;
}
