import defaults from "../defaults";

// Holds URL of gazetteer to use in search function
let gazetteerUrl = defaults.gazetteerUrl;

/**
 * Sets the gazetteerUrl to be used by the search function.
 * If parameter is falsy, url from defaults.js is kept.
 * @param {String} url url to use for searchAddress
 * @returns {void}
 */
export function setGazetteerUrl (url) {
    url ? gazetteerUrl = url : null;
}

/**
 * Retrieves active gazetteer URL.
 * @returns {string} currently set gazetteer URL
 */
export function getGazetteerUrl () {
    return gazetteerUrl;
}
