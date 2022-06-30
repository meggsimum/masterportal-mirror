import axios from "axios";
import {handleAxiosError} from "../utils/handleAxiosError";
import getWfsError from "../utils/getWfsError";
import {WFS} from "ol/format.js";
import isObject from "../../utils/isObject";

/**
 * Handles the WFS GetFeature request by GET.
 * @throws Throws an error if an error occures and no onerror callback is given.
 * @param {String} url - URL that will be used for the request.
 * @param {Object} payload - The URL parameters(KVP) to be sent with the request.
 * @param {String} payload.version - The version of the WFS.
 * @param {String|String[]} payload.featureType - Name(s) of the feature type(s).
 * @param {String} [payload.propertyNames] - A comma separated list of feature properties to restrict the request.
 * @param {String} [payload.bbox] - A extent to restrict the request.
 * @param {Function} onerror - A function(error) with error of type Error called in case of an error - if set no console output is triggert.
 * @returns {Promise<Object|String|undefined>} Promise object represents the GetFeature request.
 */
function getFeatureGET (url, payload, onerror) {
    let error = null;

    if (typeof url !== "string") {
        error = new Error(`api/wfs/getFeatureGET: Url is ${url}. Url has to be defined and a string.`);
    }
    else if (!isObject(payload)) {
        error = new Error(`api/wfs/getFeatureGET: Payload is ${payload}. Payload has to be defined and an object (not null).`);
    }
    else if (typeof payload.version !== "string") {
        error = new Error(`api/wfs/getFeatureGET: Version is ${payload.version}. Payload has to have the version attribute and it has to be a string.`);
    }
    else if (typeof payload.featureType !== "string" && !Array.isArray(payload.featureType)) {
        error = new Error(`api/wfs/getFeatureGET: FeatureType is ${payload.featureType}. Payload has to have the featureType attribute and it has to be defined and a string or an array.`);
    }

    if (error instanceof Error) {
        if (typeof onerror === "function") {
            onerror(error);
            return undefined;
        }
        throw error;
    }

    const {featureType, version, propertyNames, bbox} = payload,
        options = {
            url,
            method: "GET",
            params: {
                // mandatory parameters
                service: "WFS",
                request: "GetFeature",
                version,
                typeName: Array.isArray(featureType) ? featureType.join(",") : featureType, // WFS 1.x.x
                typeNames: Array.isArray(featureType) ? featureType.join(",") : featureType, // WFS 2.x.x
                // optional parameters
                propertyName: propertyNames, // WFS 1.x.x
                propertyNames, // WFS 2.x.x
                bbox
            }
        };

    return axios(options)
        .then(response => handleWfsResponse(response, onerror))
        .catch(axiosError => handleAxiosError(axiosError, "api/wfs/getFeatureGET", onerror));
}

/**
 * Handles the WFS GetFeature request by POST.
 * @throws Throws an error if an error occures and no onerror callback is given.
 * @param {String} url - URL that will be used for the request.
 * @param {Object} payload - The URL parameters(KVP) to be sent with the request.
 * @param {String[]|module:ol/format/WFS~FeatureType[]} payload.featureTypes - The feature type names or FeatureType objects.
 * @param {Function} onerror - A function(error) with error of type Error called in case of an error - if set no console output is triggert.
 * @see {@link https://openlayers.org/en/latest/apidoc/module-ol_format_WFS-WFS.html#writeGetFeature} For further information.
 * @returns {Promise<Object|String|undefined>} Promise object represents the GetFeature request.
 */
function getFeaturePOST (url, payload, onerror) {
    let error = null;

    if (typeof url !== "string") {
        error = new Error(`api/wfs/getFeaturePOST: Url is ${url}. Url has to be defined and a string.`);
    }
    else if (!isObject(payload)) {
        error = new Error(`api/wfs/getFeaturePOST: Payload is ${payload}. Payload has to be defined and an object (not null).`);
    }
    else if (!Array.isArray(payload.featureTypes)) {
        error = new Error(`api/wfs/getFeaturePOST: FeatureTypes is ${payload.featureTypes}. FeatureTypes has to be defined and an array.`);
    }

    if (error instanceof Error) {
        if (typeof onerror === "function") {
            onerror(error);
            return undefined;
        }
        throw error;
    }

    // For now only implemented for version 1.1.0. WFS format by default, supports WFS version 1.1.0 (ol v6.10.0).
    const {featureTypes, srsName, featureNS, propertyNames, geometryName, bbox, filter} = payload,
        requestBody = new WFS().writeGetFeature({
            srsName,
            featureNS,
            featureTypes,
            propertyNames,
            geometryName,
            bbox,
            filter
        }),
        options = {
            method: "POST",
            // axios content-type default is 'application/x-www-form-urlencoded'
            headers: {"content-type": "text/xml"},
            data: new XMLSerializer().serializeToString(requestBody),
            url
        };

    return axios(options)
        .then(response => handleWfsResponse(response, onerror))
        .catch(axiosError => handleAxiosError(axiosError, "api/wfs/getFeaturePOST", onerror));
}

/**
 * Handles the axios response for wfs get and post.
 * @throws Throws an error if a xml error from wfs service is detected.
 * @param {Object} response The response object from a successfull axios call.
 * @param {Function} onerror - A function(error) with error of type Error called in case of an wfs error - if set no console output is triggert.
 * @returns {Object} The response.data of axios.
 */
function handleWfsResponse (response, onerror) {
    const wfsError = getWfsError(response?.request?.responseXML);

    if (wfsError instanceof Error) {
        if (typeof onerror === "function") {
            onerror(wfsError);
            return undefined;
        }
        throw wfsError;
    }
    return response.data;
}

export {
    getFeatureGET,
    getFeaturePOST
};
