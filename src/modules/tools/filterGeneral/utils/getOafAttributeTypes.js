import axios from "axios";
import isObject from "../../../../utils/isObject";
import {getValueFromObjectByPath} from "../../../../utils/getValueFromObjectByPath.js";

/**
 * Requests the attribute types for the given url and collection from oaf api.
 * @param {String} url the configured url to call (without api)
 * @param {String} collection the configured collection to use
 * @param {Function} onsuccess a function(attrTypes) to call on success
 * @param {Function} onerror a function(Error) to call on error
 * @param {String} [jsonAcceptHeader="application/vnd.oai.openapi+json"] the accept header to use for non feature requests, default see https://docs.opengeospatial.org/is/17-069r3/17-069r3.html#mediatypes
 * @param {Object} [axiosMock=false] the axios object if anything other than axios from the library should be used
 * @returns {Object} an object {attrTypes, data} with attrTypes a key-value list and data the original response from the server
 */
function getOafAttributeTypes (url, collection, onsuccess, onerror, jsonAcceptHeader = "application/vnd.oai.openapi+json", axiosMock = false) {
    if (typeof url !== "string") {
        onerror(new Error("getOafAttributeTypes: url is needed as string, no url given"));
        return;
    }
    else if (typeof collection !== "string") {
        onerror(new Error("getOafAttributeTypes: collection is needed as string, no collection given"));
        return;
    }
    const axiosObject = axiosMock ? axiosMock : axios;

    axiosObject({
        method: "get",
        url: url + "/api",
        headers: {
            accept: jsonAcceptHeader
        }
    }).then(response => {
        if (typeof onsuccess === "function") {
            onsuccess(getAttrTypesFromOafResponse(collection, response.data, onerror));
        }
    }).catch(error => {
        if (typeof onerror === "function") {
            onerror(error);
        }
    });
}

/**
 * Returns the attrTypes as key value list.
 * @param {String} collection the name of the oaf collection
 * @param {Object} responseData the response from the network call
 * @param {Function} onerror a function(Error) to call on error
 * @returns {Object} the key value list to use
 */
function getAttrTypesFromOafResponse (collection, responseData, onerror) {
    const propertiesKey = "paths./collections/" + collection + "/items.get.parameters",
        properties = getValueFromObjectByPath(responseData, propertiesKey, false);

    if (!Array.isArray(properties)) {
        onerror(new Error("getOafAttributeTypes: properties not found under " + propertiesKey));
        return {};
    }
    return getAttrTypesFromProperties(properties, responseData);
}

/**
 * Returns the attrTypes as key value list - entry point are the properties.
 * @param {Object} properties the properties with the expected schema or cross reference into data
 * @param {Object} data the data to use for cross referencing
 * @returns {Object} the key value list to use
 */
function getAttrTypesFromProperties (properties, data) {
    const result = {};

    if (Array.isArray(properties)) {
        properties.forEach(elem => {
            if (Object.prototype.hasOwnProperty.call(elem, "$ref")) {
                Object.assign(result, getAttrTypeFromRef(data, elem.$ref));
            }
            else {
                Object.assign(result, getAttrTypeFromSchema(elem));
            }
        });
    }
    return result;
}

/**
 * Returns the properties to add, found under path in data.
 * @param {Object} data the data to follow path into
 * @param {String} path the oaf cross reference as #/ prefixed string
 * @returns {Object} the key value list to add
 */
function getAttrTypeFromRef (data, path) {
    const elem = getValueFromObjectByPath(data, path, "#/", "/");

    return getAttrTypeFromSchema(elem);
}

/**
 * Returns the given element as key value pair if it is following the expected schema.
 * @param {Object} elem the element to add
 * @returns {Object} the key value list to add
 */
function getAttrTypeFromSchema (elem) {
    const result = {};

    if (
        isObject(elem)
        && Object.prototype.hasOwnProperty.call(elem, "name")
        && isObject(elem?.schema)
        && Object.prototype.hasOwnProperty.call(elem.schema, "type")
        && !isSpecifiedOafKey(elem.name)
    ) {
        result[elem.name] = elem.schema.type;
    }
    return result;
}

/**
 * Returns true if the given key is a magic key of ogc api features.
 * @param {String} key the key to check
 * @returns {Boolean} true if the key is used by ogc api feature functions, false if not
 */
function isSpecifiedOafKey (key) {
    return key === "limit"
        || key === "offset"
        || key === "bbox"
        || key === "bbox-crs"
        || key === "datetime"
        || key === "crs"
        || key === "f";
}

export {
    getOafAttributeTypes,
    getAttrTypesFromOafResponse,
    getAttrTypesFromProperties,
    getAttrTypeFromSchema,
    getAttrTypeFromRef,
    isSpecifiedOafKey
};
