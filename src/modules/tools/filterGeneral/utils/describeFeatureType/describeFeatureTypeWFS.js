import axios from "axios";
import {convertAttrTypeXML} from "../convertAttrType.js";

/**
 * Calls DescribeFeatureType on the given url for the given typename.
 * @param {String} url the url/service to call
 * @param {String} typename the typename to receive the attribute types for
 * @param {Function} onsuccess a function({attrName: Type}[])
 * @param {Function} onerror a function(error) with error as object of type Error
 * @param {Function|Boolean} [axiosMock=false] false to use axios, an object with get function(url, {params}) if mock is neaded
 * @returns {void}
 */
export default function describeFeatureTypeWFS (url, typename, onsuccess, onerror, axiosMock = false) {
    const params = {
            service: "WFS",
            version: "1.1.0",
            request: "DescribeFeatureType"
        },
        axiosObject = typeof axiosMock === "object" && axiosMock !== null ? axiosMock : axios;

    axiosObject.get(url, {params})
        .then(response => {
            return parseResponse(response, typename, onsuccess, onerror);
        })
        .catch(error => {
            if (typeof onerror === "function") {
                onerror(error);
            }
        });
}

/**
 * Parses the response object from axios.
 * @param {Object} response the response to parse
 * @param {String} typename the typename to receive the attribute types for
 * @param {Function} onsuccess a function({attrName: Type}[])
 * @param {Function} onerror a function(error) with error as object of type Error
 * @returns {void}
 */
function parseResponse (response, typename, onsuccess, onerror) {
    if (typeof response?.request?.responseXML !== "object" || response?.request?.responseXML === null) {
        if (typeof onerror === "function") {
            onerror(new Error("The response from the server is invalid."));
        }
        return;
    }
    parseResponseXML(response?.request?.responseXML, typename, onsuccess, onerror);
}

/**
 * Parses the xml response of axios.
 * @param {Object} responseXML the root element of the xml document
 * @param {String} typename the typename to receive the attribute types for
 * @param {Function} onsuccess a function({attrName: Type}[])
 * @param {Function} onerror a function(error) with error as object of type Error
 * @returns {void}
 */
function parseResponseXML (responseXML, typename, onsuccess, onerror) {
    if (!responseXML?.childElementCount) {
        if (typeof onerror === "function") {
            onerror(new Error("The response from the server is empty."));
        }
        return;
    }
    parseSchemaXML(responseXML.children[0], typename, onsuccess, onerror);
}

/**
 * Analyses the given schemaXML object - this is the first child of responseXML.
 * @param {Object} schemaXML the scheme xml object
 * @param {String} typename the typename to receive the attribute types for
 * @param {Function} onsuccess a function({attrName: Type}[])
 * @param {Function} onerror a function(error) with error as object of type Error
 * @returns {void}
 */
function parseSchemaXML (schemaXML, typename, onsuccess, onerror) {
    if (typeof schemaXML !== "object" || schemaXML === null) {
        if (typeof onerror === "function") {
            onerror(new Error("The response from the server has an invalid schema."));
        }
        return;
    }
    parseUnknownSchemaChildren(schemaXML.children, typename, onsuccess, onerror);
}

/**
 * Checks if the given scheme children are valid or a wfs exception.
 * @param {Object[]} unknownSchemaChildren unknown scheme.children
 * @param {String} typename the typename to receive the attribute types for
 * @param {Function} onsuccess a function({attrName: Type}[])
 * @param {Function} onerror a function(error) with error as object of type Error
 * @returns {void}
 */
function parseUnknownSchemaChildren (unknownSchemaChildren, typename, onsuccess, onerror) {
    if (typeof unknownSchemaChildren !== "object" || unknownSchemaChildren === null || !unknownSchemaChildren?.length) {
        if (typeof onerror === "function") {
            onerror(new Error("The response from the server has an empty schema."));
        }
        return;
    }
    else if (unknownSchemaChildren[0].getAttribute("exceptionCode")) {
        if (typeof onerror === "function") {
            onerror(new Error(unknownSchemaChildren[0].children[0].textContent));
        }
        return;
    }
    parseSchemaChildren(unknownSchemaChildren, typename, onsuccess, onerror);
}

/**
 * Parses scheme.children.
 * @param {Object[]} schemaChildren an array of elements to parse
 * @param {String} typename the typename to receive the attribute types for
 * @param {Function} onsuccess a function({attrName: Type}[])
 * @param {Function} onerror a function(error) with error as object of type Error
 * @returns {void}
 */
function parseSchemaChildren (schemaChildren, typename, onsuccess, onerror) {
    const result = {};
    let typenameFound = false;

    schemaChildren.forEach(element => {
        if (element.getAttribute("name") === typename) {
            const attributes = element.getElementsByTagName("element");

            if (typeof attributes !== "object" || attributes === null) {
                return;
            }
            attributes.forEach(attribute => {
                if (typeof attribute !== "object" || attribute === null) {
                    return;
                }
                const attrName = attribute.getAttribute("name"),
                    attrType = attribute.getAttribute("type");

                result[attrName] = convertAttrTypeXML(attrType);
            });
            typenameFound = true;
        }
    });
    if (!typenameFound) {
        if (typeof onerror === "function") {
            onerror(new Error("The typename '" + typename + "' is unknown for this service."));
        }
        return;
    }
    if (typeof onsuccess === "function") {
        onsuccess(result);
    }
}
