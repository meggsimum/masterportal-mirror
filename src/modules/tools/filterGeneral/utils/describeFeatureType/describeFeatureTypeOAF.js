import axios from "axios";
import isObject from "../../../../../utils/isObject";
import {parseResponse} from "./describeFeatureTypeWFS.js";

/**
 * Calls AppSchema on the given oaf service.
 * @param {String} url the url/service to call
 * @param {String} typename the typename to receive the attribute types for
 * @param {Function} onsuccess a function({attrName: Type}[])
 * @param {Function} onerror a function(error) with error as object of type Error
 * @param {Function|Boolean} [axiosMock=false] false to use axios, an object with get function(url, {params}) if mock is neaded
 * @returns {void}
 */
export default function describeFeatureTypeOAF (url, typename, onsuccess, onerror, axiosMock = false) {
    const axiosObject = isObject(axiosMock) ? axiosMock : axios,
        axiosUrl = url + "/collections/" + typename + "/appschema";

    axiosObject.get(axiosUrl)
        .then(response => {
            return parseResponse(response, typename, onsuccess, onerror);
        })
        .catch(error => {
            if (typeof onerror === "function") {
                onerror(error);
            }
        });
}
