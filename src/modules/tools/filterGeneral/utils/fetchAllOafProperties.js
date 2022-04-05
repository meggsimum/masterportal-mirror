import isObject from "../../../../utils/isObject.js";
import axios from "axios";

/**
 * Calls the oaf url and collects all properties of the features.
 * @param {String} url the url to the oaf service
 * @param {String} collection the name of the collection to use
 * @param {Number} limit the limit configured for this layer
 * @param {Function} onsuccess a function(Object[]) to call on success
 * @param {Function} onerror a function(Error) to call on error
 * @param {Function|Boolean} [axiosMock=false] false to use axios, a function that is called with the axios configuration if mock is needed
 * @returns {void}
 */
function fetchAllOafProperties (url, collection, limit, onsuccess, onerror, axiosMock = false) {
    if (typeof url !== "string") {
        if (typeof onerror === "function") {
            onerror(new Error("fetchAllOafProperties: the url parameter has to be a string"));
        }
        return;
    }
    if (typeof collection !== "string") {
        if (typeof onerror === "function") {
            onerror(new Error("fetchAllOafProperties: the collection parameter has to be a string"));
        }
        return;
    }
    const limitParam = typeof limit === "number" ? limit : 10,
        axiosObject = typeof axiosMock === "function" ? axiosMock : axios,
        axiosUrl = url + "/collections/" + collection + "/items?limit=" + limitParam,
        result = [];

    fetchAllOafPropertiesRecursionHelper(result, axiosUrl, onsuccess, onerror, axiosObject);
}

/**
 * Helper function for the recursion of fetchAllOafProperties.
 * @param {Object[]} result the collected result
 * @param {String} url the url to the oaf service
 * @param {Function} onsuccess a function(Object[]) to call on success
 * @param {Function} onerror a function(Error) to call on error
 * @param {Function} axiosObject an object to use for the axios request
 * @returns {void}
 */
function fetchAllOafPropertiesRecursionHelper (result, url, onsuccess, onerror, axiosObject) {
    axiosObject({
        method: "get",
        url,
        headers: {
            accept: "application/geo+json"
        }
    }).then(response => {
        if (!isObject(response) || !isObject(response.data)) {
            if (typeof onerror === "function") {
                onerror(new Error("fetchAllOafProperties: the response data does not exist"));
            }
            return;
        }
        const nextLink = getNextLinkFromFeatureCollection(response.data);

        if (Array.isArray(response.data.features)) {
            response.data.features.forEach(feature => {
                result.push(feature?.properties);
            });
        }
        if (typeof nextLink === "string") {
            fetchAllOafPropertiesRecursionHelper(result, nextLink, onsuccess, onerror, axiosObject);
        }
        else if (typeof onsuccess === "function") {
            onsuccess(result);
        }
    }).catch(error => {
        if (typeof onerror === "function") {
            onerror(error);
        }
    });
}

/**
 * Parses the given feature collection for the next nextLink.
 * @param {Object} featureCollection the feature collection
 * @returns {String|Boolean} the next link or false if no next link exists
 */
function getNextLinkFromFeatureCollection (featureCollection) {
    if (!isObject(featureCollection) || !Array.isArray(featureCollection.links)) {
        return false;
    }
    const len = featureCollection.links.length;

    for (let i = 0; i < len; i++) {
        if (
            isObject(featureCollection.links[i])
            && typeof featureCollection.links[i].href === "string"
            && featureCollection.links[i].title === "next page"
        ) {
            return featureCollection.links[i].href;
        }
    }
    return false;
}

/**
 * Returns a unique value list of attrName from the given properties list.
 * @param {Object[]} allFetchedProperties the list of all properties
 * @param {String} attrName the attribute name to get the unique value list for
 * @returns {String[]|Boolean} a list of unique value or false if an error occured
 */
function getUniqueValuesFromFetchedFeatures (allFetchedProperties, attrName) {
    if (!Array.isArray(allFetchedProperties)) {
        return false;
    }
    const result = {};

    allFetchedProperties.forEach(properties => {
        if (!isObject(properties) || !Object.prototype.hasOwnProperty.call(properties, attrName)) {
            return;
        }
        result[properties[attrName]] = true;
    });
    return Object.keys(result);
}

/**
 * Returns an Object(min, max) with min and max value extracted from the given properties.
 * @param {Object[]} allFetchedProperties the properties to parse through
 * @param {String} attrName the attribute to receive the min and max value from
 * @param {Boolean} minOnly if only min is of interest
 * @param {Boolean} maxOnly if only max is of interest
 * @returns {Object|Boolean} an object with keys min and max or false on error
 */
function getMinMaxFromFetchedFeatures (allFetchedProperties, attrName, minOnly, maxOnly) {
    if (!Array.isArray(allFetchedProperties)) {
        return false;
    }
    let min = false,
        max = false;

    allFetchedProperties.forEach(properties => {
        if (
            !isObject(properties)
            || !Object.prototype.hasOwnProperty.call(properties, attrName)
            || properties[attrName] === null
            || typeof properties[attrName] === "undefined"
        ) {
            return;
        }
        if (min === false || properties[attrName] < min) {
            min = properties[attrName];
        }
        if (max === false || properties[attrName] > max) {
            max = properties[attrName];
        }
    });

    if (minOnly && !maxOnly) {
        return {min};
    }
    else if (!minOnly && maxOnly) {
        return {max};
    }
    return {min, max};
}

export {
    fetchAllOafProperties,
    fetchAllOafPropertiesRecursionHelper,
    getNextLinkFromFeatureCollection,
    getUniqueValuesFromFetchedFeatures,
    getMinMaxFromFetchedFeatures
};
