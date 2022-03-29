import hash from "object-hash";
import isObject from "../../../../utils/isObject";
import {
    getMapProjection,
    getFeaturesByLayerId,
    isFeatureInMapExtent
} from "../utils/openlayerFunctions.js";
import IntervalRegister from "../utils/intervalRegister.js";
import InterfaceWfsIntern from "./interface.wfs.intern.js";
import InterfaceWfsExtern from "./interface.wfs.extern.js";
import InterfaceOafIntern from "./interface.oaf.intern.js";
import InterfaceOafExtern from "./interface.oaf.extern.js";

/**
 * FilterApi is the api to use in vue environment. It encapsulates the filter interfaces.
 * @class
 */
export default class FilterApi {
    /**
     * @constructor
     * @param {Number} filterId the id of the VueFilter/Layer
     */
    constructor (filterId) {
        this.filterId = filterId;
        this.service = null;

        if (!(FilterApi.intervalRegister instanceof IntervalRegister)) {
            FilterApi.intervalRegister = new IntervalRegister();
            FilterApi.cache = {};
            FilterApi.interfaces = {
                wfsIntern: new InterfaceWfsIntern(FilterApi.intervalRegister, {getFeaturesByLayerId, isFeatureInMapExtent}),
                wfsExtern: new InterfaceWfsExtern(),
                oafIntern: new InterfaceOafIntern(FilterApi.intervalRegister, {getFeaturesByLayerId, isFeatureInMapExtent}),
                oafExtern: new InterfaceOafExtern()
            };
        }
    }
    /**
     * Setter for the default service by layerId and layerModel.
     * @param {String} layerId the layer id
     * @param {ol/Layer} layerModel the layer model
     * @param {Boolean} extern if true, the type given by layerModel is used, otherwise "tree" is used
     * @param {Function} onerror a function(Error)
     * @returns {void}
     */
    setServiceByLayerModel (layerId, layerModel, extern, onerror) {
        if (!layerModel) {
            return;
        }
        const type = layerModel.get("typ").toLowerCase(),
            featureNS = layerModel.get("featureNS");

        if (type === "wfs") {
            if (!extern) {
                this.service = {
                    type,
                    extern,
                    layerId,
                    url: layerModel.get("url"),
                    typename: layerModel.get("featureType"),
                    namespace: featureNS
                };
            }
            else {
                this.service = {
                    type,
                    extern,
                    layerId,
                    url: layerModel.get("url"),
                    typename: layerModel.get("featureType"),
                    namespace: featureNS,
                    srsName: getMapProjection(),
                    featureNS: featureNS.substr(0, featureNS.lastIndexOf("/")),
                    featurePrefix: featureNS.substr(featureNS.lastIndexOf("/") + 1),
                    featureTypes: [layerModel.get("featureType")]
                };
            }
        }
        else if (type === "oaf") {
            if (!extern) {
                this.service = {
                    type,
                    extern,
                    layerId,
                    url: layerModel.get("url"),
                    collection: layerModel.get("collection"),
                    jsonAcceptHeader: layerModel.get("jsonAcceptHeader"),
                    namespace: featureNS
                };
            }
            else {
                onerror(new Error("FilterApi.setServiceByLayerModel: Filtering oaf extern is not supported yet."));
            }
        }
        else if (typeof onerror === "function") {
            onerror(new Error("FilterApi.setServiceByLayerModel: Unknown layer type " + type));
        }
    }
    /**
     * Returns an object {attrName: Type} with all attributes and their types.
     * @param {Function} onsuccess a function({attrName: Type}[])
     * @param {Function} onerror a function(Error)
     * @returns {void}
     */
    getAttrTypes (onsuccess, onerror) {
        if (!isObject(this.service)) {
            if (typeof onerror === "function") {
                onerror(new Error("FilterApi.getAttrTypes: You have to set a default service first before using this function."));
            }
            return;
        }
        const connector = this.getInterfaceByService(this.service, onerror),
            cacheKey = hash.sha1(["getAttrTypes", JSON.stringify(this.service)].join("."));

        if (Object.prototype.hasOwnProperty.call(FilterApi.cache, cacheKey) && typeof onsuccess === "function") {
            onsuccess(FilterApi.cache[cacheKey]);
        }
        else if (isObject(connector) && typeof connector.getAttrTypes === "function") {
            connector.getAttrTypes(this.service, result => {
                FilterApi.cache[cacheKey] = result;
                if (typeof onsuccess === "function") {
                    onsuccess(result);
                }
            }, onerror);
        }
    }
    /**
     * Returns the min and max values of the given service and attrName.
     * @param {String} attrName the attribute to receive the min and max value from
     * @param {Function} onsuccess a function({min, max}) with the received values
     * @param {Function} onerror a function(Error)
     * @param {Boolean} [minOnly=false] if only min is of interest
     * @param {Boolean} [maxOnly=false] if only max is of interest
     * @returns {void}
     */
    getMinMax (attrName, onsuccess, onerror, minOnly, maxOnly) {
        if (!isObject(this.service)) {
            if (typeof onerror === "function") {
                onerror(new Error("FilterApi.getMinMax: You have to set a default service first before using this function."));
            }
            return;
        }
        const connector = this.getInterfaceByService(this.service, onerror),
            cacheKey = hash.sha1(["getMinMax", JSON.stringify(this.service), attrName, minOnly, maxOnly].join("."));

        if (Object.prototype.hasOwnProperty.call(FilterApi.cache, cacheKey) && typeof onsuccess === "function") {
            onsuccess(FilterApi.cache[cacheKey]);
        }
        else if (isObject(connector) && typeof connector.getMinMax === "function") {
            connector.getMinMax(this.service, attrName, result => {
                FilterApi.cache[cacheKey] = result;
                if (typeof onsuccess === "function") {
                    onsuccess(result);
                }
            }, onerror, minOnly, maxOnly);
        }
    }
    /**
     * Returns a list of sorted unique values of the given service and attrName.
     * @param {String} attrName the attribute to receive unique values from
     * @param {Function} onsuccess a function([]) with the received unique values as Array of values
     * @param {Function} onerror a function(Error)
     * @returns {void}
     */
    getUniqueValues (attrName, onsuccess, onerror) {
        if (!isObject(this.service)) {
            if (typeof onerror === "function") {
                onerror(new Error("FilterApi.getUniqueValues: You have to set a default service first before using this function."));
            }
            return;
        }
        const connector = this.getInterfaceByService(this.service, onerror),
            cacheKey = hash.sha1(["getUniqueValues", JSON.stringify(this.service), attrName].join("."));

        if (Object.prototype.hasOwnProperty.call(FilterApi.cache, cacheKey) && typeof onsuccess === "function") {
            onsuccess(FilterApi.cache[cacheKey]);
        }
        else if (isObject(connector) && typeof connector.getUniqueValues === "function") {
            connector.getUniqueValues(this.service, attrName, result => {
                if (Array.isArray(result)) {
                    result.sort((a, b) => {
                        return String(a).toLowerCase() > String(b).toLowerCase() ? 1 : -1;
                    });
                }
                FilterApi.cache[cacheKey] = result;
                if (typeof onsuccess === "function") {
                    onsuccess(result);
                }
            }, onerror);
        }
    }
    /**
     * Filters the given filterQuestion and returns the resulting filterAnswer.
     * @param {Object} filterQuestion an object with filterId, service and rules
     * @param {Function} onsuccess a function(filterAnswer)
     * @param {Function} onerror a function(Error)
     * @returns {void}
     */
    filter (filterQuestion, onsuccess, onerror) {
        if (!isObject(this.service)) {
            if (typeof onerror === "function") {
                onerror(new Error("FilterApi.filter: You have to set a default service first before using this function."));
            }
            return;
        }
        const connector = this.getInterfaceByService(this.service, onerror);

        if (isObject(connector) && typeof connector.filter === "function") {
            connector.filter(Object.assign(filterQuestion, {service: this.service}), onsuccess, onerror);
        }
    }
    /**
     * Stops the current filter.
     * @param {Function} onsuccess a function()
     * @param {Function} onerror a function(Error)
     * @returns {void}
     */
    stop (onsuccess, onerror) {
        if (!isObject(this.service)) {
            if (typeof onerror === "function") {
                onerror(new Error("FilterApi.stop: You have to set a default service first before using this function."));
            }
            return;
        }
        const connector = this.getInterfaceByService(this.service, onerror);

        if (typeof connector.stop === "function") {
            connector.stop(this.filterId, onsuccess, onerror);
        }
    }


    /* private */

    /**
     * Returns the interface for the given service.
     * @param {Object} service the service to recognize the interface with
     * @param {Function} onerror a function(Error)
     * @returns {Object|Boolean} an object to use as interface or false if an error occured
     */
    getInterfaceByService (service, onerror) {
        const type = isObject(service) && typeof service.type === "string" ? service.type.toLowerCase() : false;

        if (type === "wfs" && !service.extern) {
            return FilterApi.interfaces.wfsIntern;
        }
        else if (type === "wfs" && service.extern) {
            return FilterApi.interfaces.wfsExtern;
        }
        else if (type === "oaf" && !service.extern) {
            return FilterApi.interfaces.oafIntern;
        }
        else if (type === "oaf" && service.extern) {
            return FilterApi.interfaces.oafExtern;
        }
        else if (typeof onerror === "function") {
            onerror(new Error("FilterApi.getInterfaceByService: Unknown service type " + type));
        }
        return false;
    }
}
