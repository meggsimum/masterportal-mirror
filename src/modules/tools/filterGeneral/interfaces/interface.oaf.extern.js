import isObject from "../../../../utils/isObject.js";
import {getOafAttributeTypes} from "../utils/getOafAttributeTypes.js";
import {fetchAllOafProperties, getUniqueValuesFromFetchedFeatures, getMinMaxFromFetchedFeatures} from "../utils/fetchAllOafProperties.js";

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
        this.allFetchedProperties = false;
        this.waitingListForFeatures = [];
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

        getOafAttributeTypes(service.url, service.collection, onsuccess, onerror, service.jsonAcceptHeader);
    }

    /**
     * Returns the min and max values of the given service and attrName.
     * @param {Object} service the service to call, identical to filterQuestion.service
     * @param {String} attrName the attribute to receive the min and max value from
     * @param {Function} onsuccess a function({min, max}) with the received values
     * @param {Function} onerror a function(errorMsg)
     * @param {Boolean} [minOnly=false] if only min is of interest
     * @param {Boolean} [maxOnly=false] if only max is of interest
     * @returns {void}
     */
    getMinMax (service, attrName, onsuccess, onerror, minOnly = false, maxOnly = false) {
        if (Array.isArray(this.allFetchedProperties)) {
            if (typeof onsuccess === "function") {
                onsuccess(getMinMaxFromFetchedFeatures(this.allFetchedProperties, attrName, minOnly, maxOnly));
            }
            return;
        }

        if (!this.allFetchedProperties) {
            this.allFetchedProperties = true;
            fetchAllOafProperties(service.url, service.collection, service.limit, allProperties => {
                this.allFetchedProperties = allProperties;
                while (this.waitingListForFeatures.length) {
                    this.waitingListForFeatures.shift()();
                }
            }, onerror);
        }

        this.waitingListForFeatures.push(() => {
            if (typeof onsuccess === "function") {
                onsuccess(getMinMaxFromFetchedFeatures(this.allFetchedProperties, attrName, minOnly, maxOnly));
            }
        });
    }

    /**
     * Returns a list of unique values (unsorted) of the given service and attrName.
     * @param {Object} service the service to call, identical to filterQuestion.service
     * @param {String} attrName the attribute to receive unique values from
     * @param {Function} onsuccess a function([]) with the received unique values as Array of values
     * @param {Function} onerror a function(errorMsg)
     * @returns {void}
     */
    getUniqueValues (service, attrName, onsuccess, onerror) {
        if (Array.isArray(this.allFetchedProperties)) {
            if (typeof onsuccess === "function") {
                const uniqueValue = getUniqueValuesFromFetchedFeatures(this.allFetchedProperties, attrName);

                onsuccess(Array.isArray(uniqueValue) ? uniqueValue : []);
            }
            return;
        }

        if (this.allFetchedProperties === false) {
            this.allFetchedProperties = true;
            fetchAllOafProperties(service.url, service.collection, service.limit, allProperties => {
                this.allFetchedProperties = allProperties;
                while (this.waitingListForFeatures.length) {
                    this.waitingListForFeatures.shift()();
                }
            }, onerror);
        }

        this.waitingListForFeatures.push(() => {
            if (typeof onsuccess === "function") {
                const uniqueValue = getUniqueValuesFromFetchedFeatures(this.allFetchedProperties, attrName);

                onsuccess(Array.isArray(uniqueValue) ? uniqueValue : []);
            }
        });
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
