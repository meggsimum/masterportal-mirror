import isObject from "../../../../utils/isObject.js";
import moment from "moment";

/**
 * Returns a list of attrNames of the given snippets.
 * @param {Object[]} snippets the snippets to parse through
 * @returns {String[]} the list of their attrNames without doublings
 */
function getListOfRelevantAttrNames (snippets) {
    if (!Array.isArray(snippets)) {
        return [];
    }
    const result = {};

    snippets.forEach(snippet => {
        if (!isObject(snippet)) {
            return;
        }
        if (typeof snippet.attrName === "string") {
            result[snippet.attrName] = true;
        }
        else if (Array.isArray(snippet.attrName)) {
            snippet.attrName.forEach(attrName => {
                if (typeof attrName === "string") {
                    result[attrName] = true;
                }
            });
        }
    });

    return Object.keys(result);
}

/**
 * Returns an object of all attrNames as keys and their appearences as list of unique values.
 * @param {Object[]} items a list of items to analyse
 * @param {String[]} relevantAttrNames a simple list of attrNames to consider
 * @returns {Object} an object with attrNames as keys and apperences as list of unique values
 */
function getAttrValuesOfItemsGroupedByAttrNames (items, relevantAttrNames) {
    if (!Array.isArray(items) || !Array.isArray(relevantAttrNames)) {
        return {};
    }
    const result = {},
        assoc = {};

    items.forEach(item => {
        if (!isObject(item) || typeof item.get !== "function") {
            return;
        }
        relevantAttrNames.forEach(attrName => {
            if (typeof attrName !== "string") {
                return;
            }
            else if (!isObject(assoc[attrName])) {
                assoc[attrName] = {};
            }
            assoc[attrName][item.get(attrName)] = true;
        });
    });

    Object.entries(assoc).forEach(([attrName, obj]) => {
        result[attrName] = [];
        Object.keys(obj).forEach(value => {
            result[attrName].push(value);
        });
    });
    return result;
}

/**
 * The compare function for values relevant for snippet type date and dateRange.
 * @param {String} a the first element
 * @param {String} b the second element
 * @param {String} format the format a and b are in
 * @returns {Number} 1 to move first element down, -1 to move first element up
 */
function snippetDateCompareFunction (a, b, format) {
    const momentA = moment(a, format),
        momentB = moment(b, format);

    if (!momentA.isValid()) {
        return 1;
    }
    else if (!momentB.isValid()) {
        return -1;
    }
    else if (momentA.isSameOrBefore(momentB)) {
        return -1;
    }
    return 1;
}

/**
 * Analysis of the filter answer to adjust snippets with.
 * @param {Object[]} snippets the list of snippets to build the adjustment for
 * @param {Object[]} items the items of the filter answer
 * @param {Number} page the page of the paging object
 * @param {Number} total the last page to expect
 * @returns {Object|Boolean} an object with snippetIds as keys and expected adjustments as values or false if anything unexpected happend
 */
function getSnippetAdjustments (snippets, items, page, total) {
    if (
        !Array.isArray(snippets)
        || !Array.isArray(items)
        || typeof page !== "number"
    ) {
        return false;
    }
    const relevantAttrNames = getListOfRelevantAttrNames(snippets),
        valueByAttrName = getAttrValuesOfItemsGroupedByAttrNames(items, relevantAttrNames),
        result = {
            start: page === 1,
            finish: page >= total
        };

    snippets.forEach(snippet => {
        if (
            typeof snippet.snippetId !== "number"
            || typeof snippet.type !== "string"
            || typeof snippet.attrName === "string" && !Array.isArray(valueByAttrName[snippet.attrName])
            || Array.isArray(snippet.attrName) && !snippet.attrName.every(value => Array.isArray(valueByAttrName[value]))
        ) {
            return;
        }
        if (snippet.type === "dropdown") {
            result[snippet.snippetId] = {
                value: valueByAttrName[snippet.attrName]
            };
        }
        else if (snippet.type === "slider" || snippet.type === "sliderRange") {
            const mergedValue = typeof snippet.attrName === "string" ? valueByAttrName[snippet.attrName] : valueByAttrName[snippet.attrName[0]].concat(valueByAttrName[snippet.attrName[1]]),
                len = mergedValue.length;
            let min = false,
                max = false,
                val = 0;

            for (let i = 0; i < len; i++) {
                val = parseFloat(mergedValue[i]);
                if (isNaN(val)) {
                    continue;
                }
                if (min === false || min > val) {
                    min = val;
                }
                if (max === false || max < val) {
                    max = val;
                }
            }
            result[snippet.snippetId] = {
                min,
                max
            };
        }
        else if (snippet.type === "date" || snippet.type === "dateRange") {
            const format = typeof snippet.format === "string" ? snippet.format : "YYYY-MM-DD",
                sortedValue = typeof snippet.attrName === "string" ? valueByAttrName[snippet.attrName].sort((a, b) => {
                    return snippetDateCompareFunction(a, b, format);
                }) : valueByAttrName[snippet.attrName[0]].concat(valueByAttrName[snippet.attrName[1]]).sort((a, b) => {
                    return snippetDateCompareFunction(a, b, format);
                });

            result[snippet.snippetId] = {
                min: sortedValue[0],
                max: sortedValue[sortedValue.length - 1]
            };
        }
    });

    return result;
}

export {
    getListOfRelevantAttrNames,
    getAttrValuesOfItemsGroupedByAttrNames,
    snippetDateCompareFunction,
    getSnippetAdjustments
};
