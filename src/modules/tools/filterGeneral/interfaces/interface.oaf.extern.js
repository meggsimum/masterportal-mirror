import isObject from "../../../../utils/isObject.js";
import describeFeatureTypeOAF from "../utils/describeFeatureType/describeFeatureTypeOAF.js";

/**
 * InterfaceOafExtern is the filter interface for Oaf services
 * @class
 */
export default class InterfaceOafExtern {
    /**
     * @constructor
     */
    constructor () {
        this.axiosCancelTokenSources = {};
    }

    /**
     * Returns an object {attrName: Type} with all attributes and their types.
     * @param {Object} service the service to call, identical to filterQuestion.service
     * @param {Function} onsuccess a function({attrName: Type}[])
     * @param {Function} onerror a function(errorMsg)
     * @returns {void}
     */
    getAttrTypes (service, onsuccess, onerror) {
        if (!isObject(service)) {
            if (typeof onerror === "function") {
                onerror(new Error("InterfaceOafExtern.getAttrTypes: missing service object"));
            }
            return;
        }
        describeFeatureTypeOAF(service?.url, service?.typename, onsuccess, onerror);
    }

    /**
     * Returns the min and max values of the given service and attrName.
     * @param {Object} service the service to call, identical to filterQuestion.service
     * @param {String} attrName the attribute to receive the min and max value from
     * @param {Function} onsuccess a function({min, max}) with the received values
     * @param {Function} onerror a function(errorMsg)
     * @param {Boolean} [minOnly=false] if only min is of interest
     * @param {Boolean} [maxOnly=false] if only max is of interest
     * @param {Function|Boolean} [axiosMock=false] false to use axios, an object with get function(url, {params}) if mock is needed
     * @returns {void}
     */
    getMinMax (service, attrName, onsuccess, onerror, minOnly = false, maxOnly = false, axiosMock = false) {
        if (axiosMock) {
            onerror(new Error("tbd: InterfaceOafExtern getMinMax not implemented yet for testing"));
        }
        else if (minOnly) {
            onerror(new Error("tbd: InterfaceOafExtern getMinMax not implemented yet for minOnly"));
        }
        else if (maxOnly) {
            onerror(new Error("tbd: InterfaceOafExtern getMinMax not implemented yet for maxOnly"));
        }
        else {
            onerror(new Error("tbd: InterfaceOafExtern getMinMax not implemented yet"));
        }
    }

    /**
     * Returns a list of unique values (unsorted) of the given service and attrName.
     * @param {Object} service the service to call, identical to filterQuestion.service
     * @param {String} attrName the attribute to receive unique values from
     * @param {Function} onsuccess a function([]) with the received unique values as Array of values
     * @param {Function} onerror a function(errorMsg)
     * @param {Function|Boolean} [axiosMock=false] false to use axios, an object with get function(url, {params}) if mock is needed
     * @returns {void}
     */
    getUniqueValues (service, attrName, onsuccess, onerror, axiosMock = false) {
        if (axiosMock) {
            onerror(new Error("tbd: InterfaceOafExtern getUniqueValues not implemented yet for testing"));
        }
        else {
            onerror(new Error("tbd: InterfaceOafExtern getUniqueValues not implemented yet"));
        }
    }

    /**
     * Cancels the current request.
     * @pre a request is send to the server and the data is still loading
     * @post the request is terminated and the server response is aborted
     * @param {Number} filterId the id of the filter that should stop
     * @param {Function} onsuccess a function to call when finished
     * @param {Function} onerror a function to call on error
     * @returns {void}
     */
    stop (filterId, onsuccess, onerror) {
        onerror(new Error("tbd: InterfaceOafExtern stop not implemented yet"));
    }

    /**
     * Filters the given filterQuestion and returns the resulting filterAnswer.
     * @param {Object} filterQuestion an object with filterId, service and rules
     * @param {Function} onsuccess a function(filterAnswer)
     * @param {Function} onerror a function(errorMsg)
     * @param {Function|Boolean} [axiosMock=false] false to use axios, an object with get function(url, {params}) if mock is needed
     * @returns {void}
     */
    filter (filterQuestion, onsuccess, onerror, axiosMock = false) {
        if (axiosMock) {
            onerror(new Error("tbd: InterfaceOafExtern filter not implemented yet for testing"));
        }
        else {
            onerror(new Error("tbd: InterfaceOafExtern filter not implemented yet"));
        }
    }
}
