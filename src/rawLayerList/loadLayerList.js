import _ from "underscore";
// TODO i probably overestimated what IE can do - rewrite async/await/Promise (Waiting on how to handle this in JIRA)

// TODO move to defaults file
var defaultLayerConf = "http://geoportal-hamburg.de/lgv-config/services-internet.json";

async function getJSON (url, type = "GET") {
    // TODO code convention demands undefined is determined via _.isUndefined, but that breaks browsers in this case, what to do?
    return typeof fetch !== "undefined"
        ? (await fetch(url)).json()
        : new Promise(function (resolve, reject) {
            var Http = new XMLHttpRequest();

            Http.open(type, url);
            Http.send();
            Http.onload = () => resolve(JSON.parse(Http.responseText));
            Http.onerror = e => reject(e);
        });
}

/**
 * Will
 * @param {string} layerListURL - treated as source for layerList; if object, used as layerList
 * @returns {object} either the given layerList, or the layerlist behind the url
 */
export default async function (layerListURL) {
    var url = layerListURL || defaultLayerConf,
        result;

    try {
        result = await getJSON(url);
    }
    catch (error) {
        console.error(error);
    }

    return result;
}
