import axios from "axios";
import isObject from "../../../../utils/isObject.js";
import describeFeatureTypeWFS from "../utils/describeFeatureType/describeFeatureTypeWFS.js";
import {WFS, GeoJSON} from "ol/format";
import {
    bbox as bboxFilter,
    and as andFilter,
    between as betweenFilter,
    during as duringFilter,
    equalTo as equalToFilter,
    greaterThan as greaterThanFilter,
    greaterThanOrEqualTo as greaterThanOrEqualToFilter,
    lessThan as lessThanFilter,
    lessThanOrEqualTo as lessThanOrEqualToFilter,
    like as likeFilter,
    notEqualTo as notEqualToFilter,
    or as orFilter
} from "ol/format/filter";

/**
 * InterfaceWFS is the filter interface for WFS services
 * @class
 */
export default class InterfaceWFS {
    /**
     * @constructor
     * @param {IntervalRegister} intervalRegister the object to register and unregister intervals with
     * @param {Function} [handlers.getCurrentExtent=false] a function() to get the current browser extent from or false
     */
    constructor (intervalRegister, {getCurrentExtent}) {
        this.intervalRegister = intervalRegister;
        this.getCurrentExtent = getCurrentExtent;
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
     * @param {Boolean} [refreshed=false] internal parameter to flag filter by refresh
     * @param {Function|Boolean} [axiosMock=false] false to use axios, an object with get function(url, {params}) if mock is neaded
     * @returns {void}
     */
    filter (filterQuestion, onsuccess, onerror, refreshed = false, axiosMock = false) {
        const service = filterQuestion.service,
            filterId = filterQuestion.filterId,
            snippetId = filterQuestion.snippetId,
            geometryName = filterQuestion?.commands?.searchInMapExtent ? service?.geometryName : false,
            axiosObject = typeof axiosMock === "object" && axiosMock !== null ? axiosMock : axios,
            filter = this.getFilter(filterQuestion.rules, geometryName, this.getCurrentExtent),
            featureRequest = new WFS().writeGetFeature({
                srsName: service.srsName ? service.srsName : "EPSG:3857",
                featureNS: service.namespace ? service.namespace : "http://openstreemap.org",
                featurePrefix: service.featurePrefix ? service.featurePrefix : "osm",
                featureTypes: [service.typename],
                outputFormat: service.geojsonFormat ? service.geojsonFormat : "application/geo+json",
                filter
            }),
            payload = new XMLSerializer().serializeToString(featureRequest);

        axiosObject.post(service.url, payload, {
            headers: {
                "Content-Type": "text/xml"
            }
        })
            .then(response => {
                if (isObject(response) && isObject(response.data) && response.data.type === "FeatureCollection" && typeof onsuccess === "function") {
                    const items = new GeoJSON().readFeatures(response.data);

                    onsuccess({
                        service,
                        filterId,
                        snippetId,
                        paging: {
                            page: 1,
                            total: 1
                        },
                        items,
                        refreshed
                    });
                }
            })
            .catch(error => onerror(error));
    }

    /* private */
    /**
     * Returns an ol filter object to use for the given rules.
     * @param {Object[]} rules the rules to parse through
     * @param {String} [geometryName=false] the attrName of the geometry
     * @param {Function} [getCurrentExtent=false] a function to get the current browser extent with
     * @returns {Object} an ol filter object to use with writeGetFeature method
     */
    getFilter (rules, geometryName = false, getCurrentExtent = false) {
        const args = [];

        if (rules.length === 1) {
            return this.getRuleFilter(
                rules[0]?.attrName,
                rules[0]?.operator,
                rules[0]?.value,
                this.getLogicalHandlerByOperator(rules[0]?.operator, this.isIso8601(rules[0]?.format))
            );
        }
        rules.forEach(rule => {
            args.push(this.getRuleFilter(
                rule?.attrName,
                rule?.operator,
                rule?.value,
                this.getLogicalHandlerByOperator(rule?.operator, this.isIso8601(rule?.format))
            ));
        });

        if (typeof geometryName === "string" && typeof getCurrentExtent === "function") {
            args.push(bboxFilter(geometryName, getCurrentExtent()));
        }
        return andFilter(...args);
    }
    /**
     * Returns an ol filter object for a single rule.
     * @param {String} attrName the attribute name
     * @param {String} operator the operator of the rule
     * @param {*} value the value to use
     * @param {Function} logicalHandler a function to convert the rule into an ol filter object
     * @returns {Object} an ol filter object to use with writeGetFeature method
     */
    getRuleFilter (attrName, operator, value, logicalHandler) {
        if (Array.isArray(value)) {
            if (this.isRangeOperator(operator)) {
                return logicalHandler(attrName, value[0], value[1]);
            }
            return this.getOrFilter(attrName, value, logicalHandler);
        }
        return logicalHandler(attrName, value);
    }
    /**
     * Returns an ol filter object for a single rule.
     * This is the logical OR function, used for no-range operators like e.g. dropdown.
     * @param {String} attrName the attribute name
     * @param {String[]} arr the value to connect with OR as array of strings
     * @param {Function} logicalHandler a function to convert the rule into an ol filter object
     * @returns {Object} an ol filter object to use with writeGetFeature method
     */
    getOrFilter (attrName, arr, logicalHandler) {
        const args = [];

        if (arr.length === 1) {
            return logicalHandler(attrName, arr[0]);
        }
        arr.forEach(value => {
            args.push(logicalHandler(attrName, value));
        });
        return orFilter(...args);
    }
    /**
     * Returns true if the given format follows the simple iso8601 date standard.
     * @param {String} format the format to check
     * @returns {Boolean} true if the format follows iso8601 or false if not
     */
    isIso8601 (format) {
        return format === "YYYY-MM-DD";
    }
    /**
     * Retruns true if the given operator is used only for range operations (e.g. slider).
     * @param {String} operator the operator to check
     * @returns {Boolean} true it the given operator is used only for range operations, false if not
     */
    isRangeOperator (operator) {
        return operator === "BETWEEN";
    }
    /**
     * Returns a function to get the ol filter functions for the given operator.
     * @link https://openlayers.org/en/latest/apidoc/module-ol_format_filter.html
     * @param {String} operator the operator to mimic
     * @param {Boolean} isTemporalOperator true if temporal ol filter functions should be used if available
     * @returns {Function} the logical ol function to use for the given operator
     */
    getLogicalHandlerByOperator (operator, isTemporalOperator = false) {
        switch (operator) {
            case "BETWEEN":
                return !isTemporalOperator ? betweenFilter : duringFilter;
            case "EQ":
                return equalToFilter;
            case "NE":
                return notEqualToFilter;
            case "GT":
                return greaterThanFilter;
            case "GE":
                return greaterThanOrEqualToFilter;
            case "LT":
                return lessThanFilter;
            case "LE":
                return lessThanOrEqualToFilter;
            case "IN":
                return likeFilter;
            default:
                return () => "";
        }
    }

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

        if (!node.hasChildNodes()) {
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
