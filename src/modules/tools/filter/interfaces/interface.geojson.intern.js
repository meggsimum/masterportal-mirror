import InterfaceGeojsonExtern from "./interface.geojson.extern.js";
import InterfaceWfsIntern from "./interface.wfs.intern.js";

/**
 * InterfaceGeojsonIntern is the filter interface for Geojson filtered by OpenLayers
 * @class
 */
export default class InterfaceGeojsonIntern {
    /**
     * @constructor
     * @param {IntervalRegister} intervalRegister the object to register and unregister intervals with
     * @param {Function} handlers.getFeaturesByLayerId a function(layerId) to receive the features from ol with - only used for filter function
     * @param {Function} handlers.isFeatureInMapExtent a function(feature) to check if the feature is in the current map extent
     * @param {Function} handlers.isFeatureInGeometry a function(feature, geometry) to check if the feature intersects with the given geometry
     */
    constructor (intervalRegister, {getFeaturesByLayerId, isFeatureInMapExtent, isFeatureInGeometry}) {
        this.intervalRegister = intervalRegister;
        this.getFeaturesByLayerId = getFeaturesByLayerId;
        this.isFeatureInMapExtent = isFeatureInMapExtent;
        this.isFeatureInGeometry = isFeatureInGeometry;
        this.interfaceGeojsonExtern = new InterfaceGeojsonExtern(intervalRegister);
        this.interfaceWfsIntern = new InterfaceWfsIntern(intervalRegister, {getFeaturesByLayerId, isFeatureInMapExtent, isFeatureInGeometry});
    }

    /**
     * Returns an object {attrName: Type} with all attributes and their types.
     * @param {Object} service the service to call, identical to filterQuestion.service
     * @param {Function} onsuccess a function({attrName: Type}[])
     * @param {Function} onerror a function(errorMsg)
     * @returns {void}
     */
    getAttrTypes (service, onsuccess, onerror) {
        return this.interfaceGeojsonExtern.getAttrTypes(service, onsuccess, onerror);
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
    getMinMax (service, attrName, onsuccess, onerror, minOnly, maxOnly) {
        return this.interfaceGeojsonExtern.getMinMax(service, attrName, onsuccess, onerror, minOnly, maxOnly);
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
        return this.interfaceGeojsonExtern.getUniqueValues(service, attrName, onsuccess, onerror);
    }

    /**
     * Cancels the current filtering.
     * @param {Number} filterId the id of the filter that should stop
     * @param {Function} onsuccess a function to call when finished
     * @param {Function} onerror a function to call on error
     * @returns {void}
     */
    stop (filterId, onsuccess, onerror) {
        return this.interfaceWfsIntern.stop(filterId, onsuccess, onerror);
    }

    /**
     * Filters the given filterQuestion and returns the resulting filterAnswer.
     * @param {Object} filterQuestion an object with filterId, service and rules
     * @param {Function} onsuccess a function(filterAnswer)
     * @param {Function} onerror a function(errorMsg)
     * @returns {void}
     */
    filter (filterQuestion, onsuccess, onerror) {
        return this.interfaceWfsIntern.filter(filterQuestion, onsuccess, onerror);
    }
}
