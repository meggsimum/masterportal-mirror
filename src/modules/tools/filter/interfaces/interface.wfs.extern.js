import axios from "axios";
import isObject from "../../../../utils/isObject.js";
import {describeFeatureTypeWFS} from "../utils/describeFeatureTypeWFS.js";
import {WFS} from "ol/format";
import {
    bbox as bboxFilter,
    intersects as intersectsFilter,
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
import moment from "moment";

/**
 * InterfaceWfsExtern is the filter interface for WFS services
 * @class
 */
export default class InterfaceWfsExtern {
    /**
     * @constructor
     * @param {Function} handlers.getCurrentExtent a function to receive the current browser extent
     */
    constructor ({getCurrentExtent}) {
        this.axiosCancelTokenSources = {};
        this.allFetchedItems = [];
        this.waitingListForRequests = [];
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
                onerror(new Error("InterfaceWfsExtern.getAttrTypes: missing service object"));
            }
            return;
        }

        describeFeatureTypeWFS(service?.url, service?.typename, onsuccess, onerror);
    }

    /**
     * Returns the min and max value of the given service and attrName.
     * @param {Object} service the service to call, identical to filterQuestion.service
     * @param {String} attrName the attribute to receive the min and max value from
     * @param {Function} onsuccess a function({min, max}) with the received value
     * @param {Function} onerror a function(errorMsg)
     * @param {Boolean} [minOnly=false] if only min is of interest
     * @param {Boolean} [maxOnly=false] if only max is of interest
     * @param {Boolean} [isDate=false] if only from date or dateRange
     * @param {Object} filterQuestion an object of with keys rules, filterId and format (only for date)
     * @param {Object[]} filterQuestion.rules the rules
     * @param {Number} filterQuestion.filterId the filterId
     * @param {String} filterQuestion.format the date format - only needed if isDate is true
     * @param {Function|Boolean} [axiosMock=false] false to use axios, an object with get function(url, {params}) if mock is needed
     * @returns {void}
     */
    getMinMax (service, attrName, onsuccess, onerror, minOnly = false, maxOnly = false, isDate = false, filterQuestion = false, axiosMock = false) {
        if (Array.isArray(filterQuestion?.rules) && filterQuestion.rules.length) {
            this.getMinMaxPOST(service, attrName, onsuccess, onerror, minOnly, maxOnly, isDate, filterQuestion);
        }
        else {
            this.getMinMaxGET(service, attrName, onsuccess, onerror, minOnly, maxOnly, isDate, axiosMock);
        }
    }

    /**
     * Returns the min and max value of the given service and attrName by a POST request.
     * @param {Object} service the service to call, identical to filterQuestion.service
     * @param {String} attrName the attribute to receive the min and max value from
     * @param {Function} onsuccess a function({min, max}) with the received value
     * @param {Function} onerror a function(errorMsg)
     * @param {Boolean} [minOnly=false] if only min is of interest
     * @param {Boolean} [maxOnly=false] if only max is of interest
     * @param {Boolean} [isDate=false] if only from date or dateRange
     * @param {Object} filterQuestion an object of with keys rules, filterId and format (only for date)
     * @param {Object[]} filterQuestion.rules the rules
     * @param {Number} filterQuestion.filterId the filterId
     * @param {String} filterQuestion.format the date format - only needed if isDate is true
     * @returns {void}
     */
    getMinMaxPOST (service, attrName, onsuccess, onerror, minOnly, maxOnly, isDate, {rules, filterId, format}) {
        const filterQuestion = {
            filterId,
            service,
            rules
        };

        if (!Array.isArray(this.waitingListForRequests[filterId])) {
            this.waitingListForRequests[filterId] = [];
        }
        if (Array.isArray(this.allFetchedItems[filterId])) {
            onsuccess(this.getMinMaxFromFeaturesByAttrName(this.allFetchedItems[filterId], attrName, isDate, format, minOnly, maxOnly));
            return;
        }

        if (!this.allFetchedItems[filterId]) {
            this.allFetchedItems[filterId] = true;
            const allItems = [];

            this.filter(filterQuestion, filterAnswer => {
                filterAnswer.items.forEach(item => allItems.push(item));
                if (filterAnswer.paging.page === filterAnswer.paging.total) {
                    this.allFetchedItems[filterId] = allItems;
                    while (this.waitingListForRequests[filterId].length) {
                        this.waitingListForRequests[filterId].shift()();
                    }
                }
            }, onerror);
        }
        this.waitingListForRequests[filterId].push(() => {
            onsuccess(this.getMinMaxFromFeaturesByAttrName(this.allFetchedItems[filterId], attrName, isDate, format, minOnly, maxOnly));
        });
    }
    /**
     * Gets the min and/or max value for given features.
     * @param {Object[]} features an array of features
     * @param {String} attrName the attrName to fetch min max value for
     * @param {Boolean} isDate true if min max should be dates
     * @param {String} format the format to parse the dates from the features
     * @param {Boolean} [minOnly=false] if only min is of interest
     * @param {Boolean} [maxOnly=false] if only max is of interest
     * @returns {Object} an object either only with max or min / or an object with max and min
     */
    getMinMaxFromFeaturesByAttrName (features, attrName, isDate, format, minOnly, maxOnly) {
        if (!Array.isArray(features)) {
            return {};
        }
        const resultObject = {};
        let min = false,
            max = false;

        features.forEach(feature => {
            if (typeof feature?.get !== "function") {
                return;
            }
            let attrValue = feature.get(attrName);

            if (!isDate) {
                try {
                    attrValue = Number(attrValue);
                }
                catch (error) {
                    onerror(error);
                    return;
                }

                if (min === false || attrValue < min) {
                    min = attrValue;
                }
                if (max === false || attrValue > max) {
                    max = attrValue;
                }
            }
            else {
                try {
                    attrValue = moment(attrValue, format);
                }
                catch (error) {
                    onerror(error);
                    return;
                }

                if (min === false || attrValue.isBefore(min)) {
                    min = moment(attrValue, format);
                }
                if (max === false || attrValue.isAfter(max)) {
                    max = moment(attrValue, format);
                }
            }
        });
        if (minOnly) {
            resultObject.min = min;
        }
        if (maxOnly) {
            resultObject.max = max;
        }
        if (!minOnly && !maxOnly) {
            resultObject.min = min;
            resultObject.max = max;
        }
        return resultObject;
    }
    /**
     * Returns the min and max value of the given service and attrName by a GET request.
     * @param {Object} service the service to call, identical to filterQuestion.service
     * @param {String} attrName the attribute to receive the min and max value from
     * @param {Function} onsuccess a function({min, max}) with the received value
     * @param {Function} onerror a function(errorMsg)
     * @param {Boolean} [minOnly=false] if only min is of interest
     * @param {Boolean} [maxOnly=false] if only max is of interest
     * @param {Boolean} [isDate=false] if only from date or dateRange
     * @param {Function|Boolean} [axiosMock=false] false to use axios, an object with get function(url, {params}) if mock is needed
     * @returns {void}
     */
    getMinMaxGET (service, attrName, onsuccess, onerror, minOnly = false, maxOnly = false, isDate = false, axiosMock = false) {
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
            const minParams = !isDate ? Object.assign({}, params, {maxfeatures: 1, sortby: attrName + " A"}) : params;

            axiosObject.get(url, {
                params: minParams
            })
                .then(response => {
                    this.parseResponseMinMax(service?.typename, attrName, response?.request?.responseXML, isDate ? "min" : undefined, min => {
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
            const maxParams = !isDate ? Object.assign({}, params, {sortby: attrName + " D"}) : params;

            axiosObject.get(url, {
                params: maxParams
            })
                .then(response => {
                    this.parseResponseMinMax(service?.typename, attrName, response?.request?.responseXML, isDate ? "max" : "", max => {
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
     * Returns a list of unique value (unsorted) of the given service and attrName.
     * @param {Object} service the service to call, identical to filterQuestion.service
     * @param {String} attrName the attribute to receive unique value from
     * @param {Function} onsuccess a function([]) with the received unique value as Array of value
     * @param {Function} onerror a function(errorMsg)
     * @param {Object} filterQuestion an object of with keys: rules and filterId
     * @param {Object[]} filterQuestion.rules the rules
     * @param {Number} filterQuestion.filterId the filterId
     * @param {Function|Boolean} [axiosMock=false] false to use axios, an object with get function(url, {params}) if mock is needed
     * @returns {void}
     */
    getUniqueValues (service, attrName, onsuccess, onerror, filterQuestion, axiosMock = false) {
        if (Array.isArray(filterQuestion?.rules) && filterQuestion.rules.length > 0) {
            this.getUniqueValueByPOST(service, attrName, onsuccess, onerror, filterQuestion);
        }
        else {
            this.getUniqueValueByGET(service, attrName, onsuccess, onerror, axiosMock);
        }
    }
    /**
     * Returns a list of unique value (unsorted) of the given service and attrName by a POST request restricted by given rules.
     * @param {Object} service the service to call, identical to filterQuestion.service
     * @param {String} attrName the attribute to receive unique value from
     * @param {Function} onsuccess a function([]) with the received unique value as Array of value
     * @param {Function} onerror a function(errorMsg)
     * @param {Object} filterQuestion an object of with keys: rules and filterId
     * @param {Object[]} filterQuestion.rules the rules
     * @param {Number} filterQuestion.filterId the filterId
     * @returns {void}
     */
    getUniqueValueByPOST (service, attrName, onsuccess, onerror, {rules, filterId}) {
        const filterQuestion = {
            filterId,
            service,
            rules
        };

        if (typeof attrName !== "string"
            || typeof onsuccess !== "function"
            || !Array.isArray(rules)) {
            return;
        }
        if (!Array.isArray(this.waitingListForRequests[filterId])) {
            this.waitingListForRequests[filterId] = [];
        }
        if (Array.isArray(this.allFetchedItems[filterId])) {
            onsuccess(this.allFetchedItems[filterId]);
            return;
        }

        if (!this.allFetchedItems[filterId]) {
            this.allFetchedItems[filterId] = true;
            const allItems = [];

            this.filter(filterQuestion, filterAnswer => {
                filterAnswer.items.forEach(item => allItems.push(item));
                if (filterAnswer.paging.page === filterAnswer.paging.total) {
                    this.allFetchedItems[filterId] = allItems;
                    while (this.waitingListForRequests[filterId].length) {
                        this.waitingListForRequests[filterId].shift()();
                    }
                }
            }, onerror);
        }

        this.waitingListForRequests[filterId].push(() => {
            const uniqueObject = {};

            this.allFetchedItems[filterId].forEach(feature => {
                if (typeof feature?.get !== "function") {
                    return;
                }
                const attrValue = feature.get(attrName);

                uniqueObject[attrValue] = true;

            });
            onsuccess(Object.keys(uniqueObject));
        });
    }
    /**
     * Returns a list of unique value (unsorted) of the given service and attrName by a GET request.
     * @param {Object} service the service to call, identical to filterQuestion.service
     * @param {String} attrName the attribute to receive unique value from
     * @param {Function} onsuccess a function([]) with the received unique value as Array of value
     * @param {Function} onerror a function(errorMsg)
     * @param {Function|Boolean} [axiosMock=false] false to use axios, an object with get function(url, {params}) if mock is needed
     * @returns {void}
     */
    getUniqueValueByGET (service, attrName, onsuccess, onerror, axiosMock) {
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
                });
            })
            .catch(error => {
                if (typeof onerror === "function") {
                    onerror(error);
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
        if (this.axiosCancelTokenSources[filterId] && typeof this.axiosCancelTokenSources[filterId].cancel === "function") {
            this.axiosCancelTokenSources[filterId].cancel();
            if (typeof onsuccess === "function") {
                onsuccess();
            }
        }
        else if (typeof onerror === "function") {
            onerror(new Error("InterfaceWfsExtern.stop: The request can't be stopped because it does not exist or has already finished."));
        }
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
        const filter = Array.isArray(filterQuestion.rules) && filterQuestion.rules.length ? this.getFilter(filterQuestion.rules, filterQuestion.commands?.searchInMapExtent, filterQuestion.commands?.geometryName, filterQuestion.commands?.filterGeometry) : undefined,
            featureRequest = new WFS().writeGetFeature({
                srsName: filterQuestion?.service?.srsName,
                featureNS: filterQuestion?.service?.featureNS,
                featurePrefix: filterQuestion?.service?.featurePrefix,
                featureTypes: filterQuestion?.service?.featureTypes,
                filter
            }),
            payload = new XMLSerializer().serializeToString(featureRequest),
            axiosObject = typeof axiosMock === "object" && axiosMock !== null ? axiosMock : axios;
        let progress = 1;

        this.callEmptySuccess(onsuccess, filterQuestion, progress);

        this.axiosCancelTokenSources[filterQuestion.filterId] = axiosObject.CancelToken.source();
        axiosObject.post(filterQuestion?.service?.url, payload, {
            headers: {
                "Content-Type": "text/xml"
            },
            cancelToken: this.axiosCancelTokenSources[filterQuestion.filterId].token,
            onDownloadProgress: progressEvent => {
                if (typeof progressEvent.total !== "number" || progressEvent.total === 0) {
                    progress = (progress + 1) % 98 + 2;
                }
                else {
                    progress = Math.max(2, Math.min(99, Math.round(100 / progressEvent.total * progressEvent.loaded)));
                }

                this.callEmptySuccess(onsuccess, filterQuestion, progress);
            }
        })
            .then(response => {
                if (isObject(response) && typeof response.data === "string" && typeof onsuccess === "function") {
                    this.callEmptySuccess(onsuccess, filterQuestion, 99);
                    setTimeout(() => {
                        const items = new WFS().readFeatures(response.data);

                        onsuccess({
                            service: filterQuestion.service,
                            filterId: filterQuestion.filterId,
                            snippetId: filterQuestion.snippetId,
                            paging: {
                                page: 100,
                                total: 100
                            },
                            items
                        });
                    }, 100);
                }
                else {
                    this.callEmptySuccess(onsuccess, filterQuestion, 100);
                }
            })
            .catch(error => onerror(error));
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
     * Parsing the minimum and maximum value of date
     * @param {Object} responseXML the node
     * @param {String} attrName the attribute name
     * @param {String} dateParam the date parameter min or max
     * @returns {Object} the node with the given tagname
     */
    parseMinMaxDate (responseXML, attrName, dateParam) {
        let node = responseXML,
            nodeName,
            nodeValues = [];

        while (node) {
            if (node?.tagName?.split(":")[1] !== attrName) {
                node = node.firstElementChild;
                continue;
            }
            nodeName = node.tagName;
            break;
        }

        Array.prototype.slice.call(responseXML.getElementsByTagName(nodeName)).forEach(value => {
            nodeValues.push(value.textContent);
        });

        if (!nodeValues.length) {
            return undefined;
        }

        nodeValues = this.getSortedDate(nodeValues);

        if (dateParam === "min") {
            return nodeValues[0];
        }
        else if (dateParam === "max") {
            return nodeValues.slice(-1)[0];
        }

        return undefined;
    }
    /**
     * Getting the sorted ascending date in an array format
     * @param {String[]} dateValue the date value in an array
     * @returns {String[]} sortedDateValue the sorted date value
     */
    getSortedDate (dateValue) {
        if (!Array.isArray(dateValue) || !dateValue.length) {
            return dateValue;
        }

        return dateValue.sort((a, b) => {
            let dateA = new Date(a),
                dateB = new Date(b);

            if (a.indexOf(".") !== -1) {
                const [day, month, year] = a.split(".");

                dateA = new Date(Number(year), month - 1, Number(day));
            }

            if (b.indexOf(".") !== -1) {
                const [day, month, year] = b.split(".");

                dateB = new Date(Number(year), month - 1, Number(day));
            }

            return dateA > dateB ? 1 : -1;
        });
    }
    /**
     * Finds the content of the given typename and attrName in responseXML.
     * @param {String} typename the feature type of the service
     * @param {String} attrName the attribute to lookup
     * @param {Object} responseXML the node
     * @param {String} dateParam the date parameter min or max
     * @param {Function} onsuccess a function(value)
     * @param {Function} onerror a function(Error) called on error
     * @returns {void}
     */
    parseResponseMinMax (typename, attrName, responseXML, dateParam, onsuccess, onerror) {
        let node = this.getNodeByTagname(responseXML, typename);

        if (!node) {
            if (typeof onerror === "function") {
                onerror(new Error("InterfaceWfsExtern.parseResponseMinMax: The requested typename '" + typename + "' wasn't found."));
            }
            return;
        }

        node = node.getElementsByTagNameNS(node.namespaceURI, attrName)[0];
        if (dateParam) {
            onsuccess(this.parseMinMaxDate(responseXML, attrName, dateParam));
        }
        else if (node && typeof onsuccess === "function") {
            onsuccess(node.textContent);
        }
        else if (typeof onerror === "function") {
            onerror(new Error("InterfaceWfsExtern.parseResponseMinMax: The requested attrName '" + attrName + "' wasn't found."));
        }
    }
    /**
     * Lists the content of the given attrName at typename in responseXML.
     * @param {String} typename the feature type of the service
     * @param {String} attrName the attribute to lookup
     * @param {Object} responseXML the node
     * @param {Function} onsuccess a function(list) a list of values
     * @returns {void}
     */
    parseResponseUniqueValues (typename, attrName, responseXML, onsuccess) {
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
    /**
     * Returns an ol filter object to use for the given rules.
     * @param {Object[]} rules the rules to parse through
     * @param {Boolean} searchInMapExtent a flag if the filter should apply only in current browser extent
     * @param {String} geometryName the attrName of the geometry
     * @param {Function} filterGeometry a geometry in which to filter
     * @returns {Object} an ol filter object to use with writeGetFeature method
     */
    getFilter (rules, searchInMapExtent, geometryName, filterGeometry) {
        const args = [];

        rules.forEach(rule => {
            args.push(this.getRuleFilter(
                rule?.attrName,
                rule?.operator,
                rule?.value,
                this.getLogicalHandlerByOperator(rule?.operator, this.isIso8601(rule?.format))
            ));
        });

        if (typeof geometryName === "string" && isObject(filterGeometry)) {
            args.push(intersectsFilter(geometryName, filterGeometry));
        }
        else if (searchInMapExtent && typeof geometryName === "string" && typeof this.getCurrentExtent === "function") {
            args.push(bboxFilter(geometryName, this.getCurrentExtent()));
        }

        if (args.length === 1) {
            return args[0];
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
     * Calls the given onsuccess function with an empty list of items to trigger progress.
     * @param {Function} onsuccess a function(filterAnswer)
     * @param {Object} filterQuestion an object with filterId, service and rules
     * @param {Number} percentage the page to set - be reminded: 1 might clear the layer, 100 might call stop events
     * @returns {void}
     */
    callEmptySuccess (onsuccess, filterQuestion, percentage) {
        if (typeof onsuccess !== "function") {
            return;
        }
        onsuccess({
            service: filterQuestion?.service,
            filterId: filterQuestion?.filterId,
            snippetId: filterQuestion?.snippetId,
            paging: {
                page: percentage,
                total: 100
            },
            items: []
        });
    }
}
