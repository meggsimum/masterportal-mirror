import isObject from "../../../../utils/isObject.js";
import InterfaceWfsExtern from "./interface.wfs.extern.js";
import {
    between,
    betweenForArray,
    endswith,
    endswithForArray,
    equals,
    equalsForArray,
    ge,
    gt,
    inForArray,
    inForString,
    intersectsForArray,
    le,
    lt,
    ne,
    startswith,
    startswithForArray
} from "../utils/ruleValidation.js";

/**
 * InterfaceWfsIntern is the filter interface for Wfs filtered by OpenLayers
 * @class
 */
export default class InterfaceWfsIntern {
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
        this.interfaceWfsExtern = new InterfaceWfsExtern(intervalRegister);
    }

    /**
     * Returns an object {attrName: Type} with all attributes and their types.
     * @param {Object} service the service to call, identical to filterQuestion.service
     * @param {Function} onsuccess a function({attrName: Type}[])
     * @param {Function} onerror a function(errorMsg)
     * @returns {void}
     */
    getAttrTypes (service, onsuccess, onerror) {
        return this.interfaceWfsExtern.getAttrTypes(service, onsuccess, onerror);
    }

    /**
     * Returns the min and max value of the given service and attrName.
     * @param {Object} service the service to call, identical to filterQuestion.service
     * @param {String} attrName the attribute to receive the min and max value from
     * @param {Function} onsuccess a function({min, max}) with the received value
     * @param {Function} onerror a function(errorMsg)
     * @param {Boolean} [minOnly=false] if only min is of interest
     * @param {Boolean} [maxOnly=false] if only max is of interest
     * @param {Boolean} [isDate=false] if only from date type or dateRange type
     * @param {Object} filterQuestion an object of with keys rules, filterId and format (only for date)
     * @param {Object[]} filterQuestion.rules the rules
     * @param {Number} filterQuestion.filterId the filterId
     * @param {String} filterQuestion.format the date format - only needed if isDate is true
     * @returns {void}
     */
    getMinMax (service, attrName, onsuccess, onerror, minOnly, maxOnly, isDate, filterQuestion) {
        return this.interfaceWfsExtern.getMinMax(service, attrName, onsuccess, onerror, minOnly, maxOnly, isDate, filterQuestion);
    }

    /**
     * Returns a list of unique value (unsorted) of the given service and attrName.
     * @param {Object} service the service to call, identical to filterQuestion.service
     * @param {String} attrName the attribute to receive unique value from
     * @param {Function} onsuccess a function([]) with the received unique value as Array of value
     * @param {Function} onerror a function(errorMsg)
     * @param {Object} filterQuestion an object of with keys rules and filterId
     * @param {Object[]} filterQuestion.rules the rules
     * @param {Number} filterQuestion.filterId the filterId
     * @returns {void}
     */
    getUniqueValues (service, attrName, onsuccess, onerror, filterQuestion) {
        return this.interfaceWfsExtern.getUniqueValues(service, attrName, onsuccess, onerror, filterQuestion);
    }

    /**
     * Cancels the current filtering.
     * @param {Number} filterId the id of the filter that should stop
     * @param {Function} onsuccess a function to call when finished
     * @param {Function} onerror a function to call on error
     * @returns {void}
     */
    stop (filterId, onsuccess, onerror) {
        if (typeof this.intervalRegister?.stopPagingInterval !== "function") {
            if (typeof onerror === "function") {
                onerror(new Error("InterfaceWfsIntern.stop: invalid intervalRegister"));
            }
            return;
        }

        this.intervalRegister.stopPagingInterval(filterId);
        if (typeof onsuccess === "function") {
            onsuccess();
        }
    }

    /**
     * Filters the given filterQuestion and returns the resulting filterAnswer.
     * @param {Object} filterQuestion an object with filterId, service and rules
     * @param {Function} onsuccess a function(filterAnswer)
     * @param {Function} onerror a function(errorMsg)
     * @returns {void}
     */
    filter (filterQuestion, onsuccess, onerror) {
        if (typeof this.intervalRegister?.startPagingInterval !== "function" || typeof this.intervalRegister?.stopPagingInterval !== "function") {
            if (typeof onerror === "function") {
                onerror(new Error("InterfaceWfsIntern.filter: invalid intervalRegister"));
            }
            return;
        }
        else if (typeof this.getFeaturesByLayerId !== "function") {
            if (typeof onerror === "function") {
                onerror(new Error("InterfaceWfsIntern.filter: getFeaturesByLayerId must be a function"));
            }
            return;
        }
        else if (typeof this.isFeatureInMapExtent !== "function") {
            if (typeof onerror === "function") {
                onerror(new Error("InterfaceWfsIntern.filter: isFeatureInMapExtent must be a function"));
            }
            return;
        }
        else if (typeof this.isFeatureInGeometry !== "function") {
            if (typeof onerror === "function") {
                onerror(new Error("InterfaceWfsIntern.filter: isFeatureInGeometry must be a function"));
            }
            return;
        }
        else if (!isObject(filterQuestion)) {
            if (typeof onerror === "function") {
                onerror(new Error("InterfaceWfsIntern.filter: filterQuestion must be an object"));
            }
            return;
        }
        const clonedQuestion = JSON.parse(JSON.stringify(filterQuestion)),
            service = clonedQuestion?.service,
            filterId = clonedQuestion?.filterId,
            snippetId = clonedQuestion?.snippetId,
            commands = clonedQuestion?.commands,
            rules = clonedQuestion?.rules,
            filterGeometry = filterQuestion?.commands?.filterGeometry,
            searchInMapExtent = commands?.searchInMapExtent,
            paging = commands?.paging > 0 ? commands.paging : 1000,
            features = this.getFeaturesByLayerId(service?.layerId),
            len = Array.isArray(features) ? features.length : 0;
        let idx = 0;

        this.intervalRegister.startPagingInterval(filterId, () => {
            const items = [];

            for (let n = 0; n < paging; n++) {
                if (
                    (!searchInMapExtent || this.isFeatureInMapExtent(features[idx]))
                    && (!isObject(filterGeometry) || this.isFeatureInGeometry(features[idx], filterGeometry))
                    && this.checkRules(features[idx], rules)
                ) {
                    items.push(features[idx]);
                }
                idx++;
                if (idx >= len) {
                    break;
                }
            }
            if (idx >= len) {
                this.intervalRegister.stopPagingInterval(filterId);
            }

            if (typeof onsuccess === "function") {
                onsuccess({
                    service,
                    filterId,
                    snippetId,
                    paging: {
                        page: Math.ceil(idx / paging),
                        total: Math.ceil(len / paging)
                    },
                    items
                });
            }
        }, 1);
    }

    /* private */
    /**
     * Checks if the given feature matches with the given rules.
     * @param {ol/Feature} feature the feature to check
     * @param {Object} rules the rules from the filter question
     * @returns {Boolean} true if the feature matches, false if not
     */
    checkRules (feature, rules) {
        if (typeof feature?.get !== "function" || !Array.isArray(rules)) {
            return false;
        }
        const len = rules.length;

        for (let i = 0; i < len; i++) {
            if (!isObject(rules[i])) {
                continue;
            }
            else if (
                !this.checkRule(
                    rules[i],
                    Array.isArray(rules[i]?.attrName) ? feature.get(rules[i].attrName[0]) : feature.get(rules[i].attrName),
                    Array.isArray(rules[i]?.attrName) ? feature.get(rules[i].attrName[1]) : undefined
                )
            ) {
                return false;
            }
        }
        return true;
    }

    /**
     * Checks if the given feature value match with the given rule.
     * @param {Object} rule the rule object
     * @param {String} rule.operator the operator to use
     * @param {*} [rule.value] a single value
     * @param {*} featureValue the value of the feature to check
     * @param {*} [featureValue2] the second value to check for ranges with
     * @returns {Boolean} true if the rule matches the given feature value, false if not
     */
    checkRule (rule, featureValue, featureValue2) {
        if (
            !isObject(rule)
            || !Object.prototype.hasOwnProperty.call(rule, "operator")
            || !Object.prototype.hasOwnProperty.call(rule, "value")
        ) {
            return false;
        }
        let ruleValueA = Array.isArray(rule.value) ? rule.value[0] : rule.value,
            ruleValueB = Array.isArray(rule.value) ? rule.value[1] : undefined,
            featValueA = featureValue,
            featValueB = typeof featureValue2 !== "undefined" ? featureValue2 : featureValue;

        if (typeof ruleValueA === "string") {
            ruleValueA = ruleValueA.toLowerCase();
        }
        if (typeof ruleValueB === "string") {
            ruleValueB = ruleValueB.toLowerCase();
        }
        featValueA = this.changeValueToMatchReference(featValueA, ruleValueA);
        featValueB = this.changeValueToMatchReference(featValueB, ruleValueB);

        return Array.isArray(rule.value) && (
            rule.operator === "INTERSECTS" && intersectsForArray(featValueA, featValueB, ruleValueA, ruleValueB, rule.format)
            || rule.operator === "BETWEEN" && betweenForArray(featValueA, featValueB, ruleValueA, ruleValueB, rule.format)
            || rule.operator === "EQ" && equalsForArray(featValueA, rule.value, rule.format)
            || rule.operator === "IN" && inForArray(featValueA, rule.value)
            || rule.operator === "STARTSWITH" && startswithForArray(featValueA, rule.value)
            || rule.operator === "ENDSWITH" && endswithForArray(featValueA, rule.value)
        )
        || !Array.isArray(rule.value) && typeof ruleValueA !== "undefined" && (
            rule.operator === "BETWEEN" && between(featValueA, featValueB, ruleValueA, rule.format)
            || rule.operator === "EQ" && equals(featValueA, ruleValueA, rule.format)
            || rule.operator === "NE" && ne(featValueA, ruleValueA, rule.format)
            || rule.operator === "GT" && gt(featValueA, ruleValueA, rule.format)
            || rule.operator === "GE" && ge(featValueA, ruleValueA, rule.format)
            || rule.operator === "LT" && lt(featValueA, ruleValueA, rule.format)
            || rule.operator === "LE" && le(featValueA, ruleValueA, rule.format)
            || rule.operator === "IN" && inForString(featValueA, ruleValueA)
            || rule.operator === "STARTSWITH" && startswith(featValueA, ruleValueA)
            || rule.operator === "ENDSWITH" && endswith(featValueA, ruleValueA)
        );
    }

    /**
     * Checks a reference and returns the given value as type of the reference.
     * @info will also convert the value of a given array in depth
     * @param {*} value the value of the rule to match featValue to
     * @param {*} reference the reference to match value for
     * @param {Number} [depth=0] the depth of the recursion to avoid infinit loop
     * @returns {*} featValue with changed type
     */
    changeValueToMatchReference (value, reference, depth = 0) {
        if (depth >= 10) {
            return value;
        }
        else if (Array.isArray(value)) {
            const result = [];

            value.forEach(v => {
                result.push(this.changeValueToMatchReference(v, reference, depth + 1));
            });
            return result;
        }
        else if (typeof value === "string") {
            if (typeof reference === "string") {
                return String(value).toLowerCase();
            }
            else if (typeof reference === "number") {
                return isNaN(parseInt(value, 10)) ? 0 : parseInt(value, 10);
            }
            else if (typeof reference === "boolean") {
                return Boolean(value);
            }
        }
        else if (typeof value === "number") {
            if (typeof reference === "string") {
                return String(value);
            }
            else if (typeof reference === "boolean") {
                return Boolean(value);
            }
        }
        return value;
    }
}
