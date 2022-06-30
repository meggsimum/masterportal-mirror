import axios from "axios";
import xml2json from "../utils/xml2json";
import {handleAxiosError} from "../utils/handleAxiosError";

/**
 * Handles the WFS DescribeFeatureType request and returns the response.
 * To return a list of feature types, the GET request would be as follows. This request will return the list of feature types, sorted by namespace:
 * @param {String} url - The url of the WFS.
 * @param {String} [version="1.1.0"] - The version of the WFS.
 * @param {String[]} [featureTypes=undefined] - A comma-separated list of feature types. If no value is specified, that is interpreted as all feature types.
 * @returns {Promise<Object|undefined>} Promise object represents the DescribeFeatureType request.
 */
export function describeFeatureType (url, version = "1.1.0", featureTypes = undefined) {
    if (typeof url !== "string") {
        console.error(`api/wfs/describeFeatureType: Url is ${url}. Url has to be defined and a string.`);
        return undefined;
    }

    if (typeof version !== "string") {
        console.error(`api/wfs/describeFeatureType: Version is ${version}. Version has to be a string. Default is 1.1.0.`);
        return undefined;
    }

    const options = {
        params: {
            // mandatory parameters
            service: "WFS",
            request: "DescribeFeatureType",
            version,
            // optional parameters
            typeName: Array.isArray(featureTypes) ? featureTypes.join(",") : featureTypes, // WFS 1.x.x
            typeNames: Array.isArray(featureTypes) ? featureTypes.join(",") : featureTypes // WFS 2.x.x
        }
    };

    return axios.get(url, options)
        .then(response => xml2json(response.request.responseXML))
        .catch(error => handleAxiosError(error, "api/wfs/describeFeatureType"));
}

/**
 * Returns a description of feature.
 * This means a list of the existing attributes of the feature.
 * @param {Object} json - The response of the describe feature request as a json.
 * @param {String} featureTypeName - Is actually the same as the name of a layer.
 * @returns {Object[]|undefined} A list of feature attributes with name and type.
 */
export function getFeatureDescription (json, featureTypeName) {
    if (typeof json !== "object" || json === null || typeof featureTypeName !== "string") {
        console.error(`getFeatureDescription: ${json} has to be defined and an object (not null). ${featureTypeName} has to be defined and a string`);
        return undefined;
    }
    const description = [],
        // path to the featureTypes
        featureType = Array.isArray(json?.schema?.element)
            ? json?.schema?.element?.find(element => element.attributes?.name === featureTypeName)
            : json?.schema?.element;

    if (typeof featureType === "undefined") {
        console.error(`getFeatureDescription: FeatureType "${featureType}" was not found`);
        return undefined;
    }

    // path to the feature attributes
    if (!Array.isArray(featureType.complexType?.complexContent?.extension?.sequence?.element)) {
        console.error(`getFeatureDescription: No attributes were found for the FeatureType "${featureType}"`);
        return undefined;
    }

    featureType.complexType.complexContent.extension.sequence.element.forEach(attribute => {
        description.push(attribute.getAttributes());
    });

    return description;
}
