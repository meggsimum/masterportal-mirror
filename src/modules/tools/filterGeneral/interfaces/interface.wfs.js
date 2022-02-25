import axios from "axios";
import isObject from "../../../../utils/isObject.js";
import describeFeatureTypeWFS from "../utils/describeFeatureType/describeFeatureTypeWFS.js";

/**
 * InterfaceWFS is the filter interface for WFS services
 * @class
 */
export default class InterfaceWFS {
    /**
     * @constructor
     * @param {IntervalRegister} intervalRegister the object to register and unregister intervals with
     */
    constructor (intervalRegister) {
        this.intervalRegister = intervalRegister;
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
                onerror(new Error("InterfaceWFS.getAttrTypes: missing service object"));
            }
            return;
        }

        describeFeatureTypeWFS(service?.url, service?.typename, onsuccess, onerror);
    }

    /**
     * Returns the min and max values of the given service and attrName.
     * @param {Object} service the service to call, identical to filterQuestion.service
     * @param {String} attrName the attribute to receive the min and max value from
     * @param {Function} onsuccess a function({min, max}) with the received values
     * @param {Function} onerror a function(errorMsg)
     * @param {Boolean} [minOnly=false] if only min is of interest
     * @param {Boolean} [maxOnly=false] if only max is of interest
     * @param {Function|Boolean} [axiosMock=false] false to use axios, an object with get function(url, {params}) if mock is neaded
     * @returns {void}
     */
    getMinMax (service, attrName, onsuccess, onerror, minOnly = false, maxOnly = false, axiosMock = false) {
        const url = service?.url,
            params = {
                service: "WFS",
                version: "1.1.0",
                request: "GetFeature",
                typename: service?.typename,
                propertyName: attrName
            },
            axiosObject = typeof axiosMock === "object" && axiosMock !== null ? axiosMock : axios,
            result = {};

        if (!maxOnly) {
            axiosObject.get(url, {
                params: Object.assign({}, params, {maxfeatures: 1, sortby: attrName + " A"})
            })
                .then(response => {
                    this.parseResponseMinMax(service?.typename, attrName, response?.request?.responseXML, min => {
                        result.min = min;
                        if ((minOnly || result.max !== undefined) && typeof onsuccess === "function") {
                            onsuccess(result);
                        }
                    }, onerror);
                })
                .catch(error => {
                    if (typeof onerror === "function") {
                        onerror(error);
                    }
                });
        }
        if (!minOnly) {
            axiosObject.get(url, {
                params: Object.assign({}, params, {sortby: attrName + " D"})
            })
                .then(response => {
                    this.parseResponseMinMax(service?.typename, attrName, response?.request?.responseXML, max => {
                        result.max = max;
                        if ((maxOnly || result.min !== undefined) && typeof onsuccess === "function") {
                            onsuccess(result);
                        }
                    }, onerror);
                })
                .catch(error => {
                    if (typeof onerror === "function") {
                        onerror(error);
                    }
                });
        }
    }

    /**
     * Returns a list of unique values (unsorted) of the given service and attrName.
     * @param {Object} service the service to call, identical to filterQuestion.service
     * @param {String} attrName the attribute to receive unique values from
     * @param {Function} onsuccess a function([]) with the received unique values as Array of values
     * @param {Function} onerror a function(errorMsg)
     * @param {Function|Boolean} [axiosMock=false] false to use axios, an object with get function(url, {params}) if mock is neaded
     * @returns {void}
     */
    getUniqueValues (service, attrName, onsuccess, onerror, axiosMock = false) {
        const url = service?.url,
            params = {
                service: "WFS",
                version: "1.1.0",
                request: "GetFeature",
                typename: service?.typename,
                propertyname: attrName
            },
            axiosObject = typeof axiosMock === "object" && axiosMock !== null ? axiosMock : axios;

        axiosObject.get(url, {params})
            .then(response => {
                Backbone.responseXML = response?.request?.responseXML;
                this.parseResponseUniqueValues(service?.typename, attrName, response?.request?.responseXML, list => {
                    if (typeof onsuccess === "function") {
                        onsuccess(list);
                    }
                }, onerror);
            })
            .catch(error => {
                if (typeof onerror === "function") {
                    onerror(error);
                }
            });
    }

    /**
     * Filters the given filterQuestion and returns the resulting filterAnswer.
     * @param {Object} filterQuestion an object with filterId, service and rules
     * @param {Function} onsuccess a function(filterAnswer)
     * @param {Function} onerror a function(errorMsg)
     * @returns {void}
     */
    filter (filterQuestion, onsuccess, onerror) {
        if (typeof onsuccess === "function") {
            onsuccess(null);
        }
        else if (typeof onerror === "function") {
            onerror(null);
        }
    }

    /* private */
    /**
     * Finds the node of the given node with the given tagname.
     * @param {Object} responseXML the node
     * @param {String} tagname the tagname to find
     * @returns {Object} the node with the given tagname
     */
    getNodeByTagname (responseXML, tagname) {
        let node = responseXML;

        while (node) {
            if (node?.tagName?.split(":")[1] !== tagname) {
                node = node.firstElementChild;
                continue;
            }
            break;
        }

        if (node !== null && !node.hasChildNodes()) {
            for (const childNode of responseXML.getElementsByTagName(node.tagName)) {
                if (childNode.hasChildNodes()) {
                    node = childNode;
                    break;
                }
            }
        }

        return node;
    }
    /**
     * Finds the content of the given typename and attrName in responseXML.
     * @param {String} typename the feature type of the service
     * @param {String} attrName the attribute to lookup
     * @param {Object} responseXML the node
     * @param {Function} onsuccess a function(value)
     * @param {Function} onerror a function(Error) called on error
     * @returns {void}
     */
    parseResponseMinMax (typename, attrName, responseXML, onsuccess, onerror) {
        let node = this.getNodeByTagname(responseXML, typename);

        if (!node) {
            if (typeof onerror === "function") {
                onerror(new Error("InterfaceWFS.parseResponseMinMax: The requested typename '" + typename + "' wasn't found."));
            }
            return;
        }

        node = node.getElementsByTagNameNS(node.namespaceURI, attrName)[0];
        if (node && typeof onsuccess === "function") {
            onsuccess(node.textContent);
        }
        else if (typeof onerror === "function") {
            onerror(new Error("InterfaceWFS.parseResponseMinMax: The requested attrName '" + attrName + "' wasn't found."));
        }
    }
    /**
     * Lists the content of the given attrName at typename in responseXML.
     * @param {String} typename the feature type of the service
     * @param {String} attrName the attribute to lookup
     * @param {Object} responseXML the node
     * @param {Function} onsuccess a function(list) a list of values
     * @param {Function} onerror a function(Error) called on error
     * @returns {void}
     */
    parseResponseUniqueValues (typename, attrName, responseXML, onsuccess, onerror) {
        if (!responseXML?.firstElementChild?.childElementCount) {
            if (typeof onsuccess === "function") {
                onsuccess([]);
            }
            return;
        }
        const result = {};

        responseXML.firstElementChild.children.forEach(element => {
            let node = this.getNodeByTagname(element, typename);

            if (!node) {
                if (typeof onerror === "function") {
                    onerror(new Error("InterfaceWFS.parseResponseUniqueValues: The requested typename '" + typename + "' wasn't found."));
                }
                return;
            }
            node = node.getElementsByTagNameNS(node.namespaceURI, attrName)[0];

            if (node) {
                result[node.textContent] = true;
            }
        });
        if (typeof onsuccess === "function") {
            onsuccess(Object.keys(result));
        }
    }
}
