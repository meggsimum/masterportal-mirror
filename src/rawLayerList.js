import defaults from "./defaults";

/** layerList that contains all known services.
 * @type{Array}
 * @ignore
 */
let layerList = [];

/**
 * Initializes the layer list with either an object or an URL. May be used again to override the layer list.
 * createMap will call this for you, but won't notify you of when it's done. Use this function manually with a
 * callback to know when layers can be added programmatically.
 * @param {(string|object)} [layerConf="https://geoportal-hamburg.de/lgv-config/services-internet.json"] - either the URL to fetch the services from, or the object containing the services
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
    Http.timeout = 10000;
    Http.send();
    Http.onload = function () {
        try{
            layerList = JSON.parse(Http.responseText);
        }
        catch(error){
            console.error("An error occured when parsing the response after loading '" + layerConf + "':", error);
            callback(false, error);
        }
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

    return layerList.find(entry => keys.every(key => entry[key] === searchAttributes[key])) || null;
}

/** @returns {object[]} complete layerList as initialized */
export function getLayerList () {
    return layerList;
}

/**
 * Returns display names map for a layer, or display name for a specific attribute.
 * @param {string} layerId - if of layer to fetch display names for
 * @param {string} [featureAttribute] - if given, only one entry of map is returned
 * @returns {?(object|string)} - map of originalName->displayName or name of featureAttribute if specified; if layer or featureAttribute not found, null
 */
export function getDisplayNamesOfFeatureAttributes (layerId, featureAttribute) {
    const attributes = getLayerWhere({id: layerId});

    if (attributes && typeof featureAttribute === "string") {
        const displayName = attributes.gfiAttributes && attributes.gfiAttributes[featureAttribute];

        return typeof displayName === "string" ? displayName : null;
    }
    else if (attributes) {
        return attributes.gfiAttributes || null;
    }

    return null;
}
