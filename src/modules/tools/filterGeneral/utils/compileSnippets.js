import isObject from "../../../../utils/isObject";
import FilterApi from "../interfaces/filter.api.js";

/**
 * Clones, checks and modifies the given original snippets to match the needs for LayerFilterSnippet.
 * @param {Object[]|String[]} originalSnippets the configured snippets
 * @param {Object} api the api to use for auto recognition of snippet types
 * @param {Number} numberFirstLevelSnippet the number of first level snippet
 * @param {Number} parentSnippetId the snippetId of parent snippet
 * @param {Function} onfinish a callback function(snippets) with snippets, resulting snippets to use in LayerFilterSnippet, to be called when ready
 * @param {Function} onerror a callback function(error) with error type of Error to be called on error
 * @returns {void}
 */
function compileSnippets (originalSnippets, api, numberFirstLevelSnippet, parentSnippetId, onfinish, onerror) {
    if (!Array.isArray(originalSnippets)) {
        if (typeof onfinish === "function") {
            onfinish([]);
        }
        return;
    }

    const snippets = removeInvalidSnippets(JSON.parse(JSON.stringify(originalSnippets)));

    convertStringSnippetsIntoObjects(snippets);

    createSnippetsIfNoSnippetsAreGiven(snippets, api, () => {
        addSnippetIds(snippets, numberFirstLevelSnippet);
        addSnippetAdjustment(snippets);
        addSnippetApi(snippets, () => new FilterApi());
        addSnippetMultiselect(snippets);

        if (numberFirstLevelSnippet > 0) {
            addEmptyChildSnippetValue(snippets);
            addSnippetParentId(snippets, parentSnippetId);
        }

        if (typeof api?.getAttrTypes === "function" && !checkSnippetTypeConsistency(snippets)) {
            api.getAttrTypes(attrTypes => {
                addSnippetTypes(snippets, attrTypes);
                addSnippetOperator(snippets);
                if (typeof onfinish === "function") {
                    onfinish(snippets);
                }
            }, onerror);
        }
        else {
            addSnippetOperator(snippets);
            if (typeof onfinish === "function") {
                onfinish(snippets);
            }
        }
    }, onerror);
}

/**
 * Creates new snippets and adds them to the given array using attrTypes as blueprint if snippets are not given or are empty.
 * @param {Object[]} snippets an array list of snippet objects
 * @param {Object} api the api to use for auto recognition of snippet types
 * @param {Function} onsuccess a callback function() to be called when ready
 * @param {Function} onerror a callback function(error) with error type of Error to be called on error
 * @returns {void}
 */
function createSnippetsIfNoSnippetsAreGiven (snippets, api, onsuccess, onerror) {
    if (!snippets.length) {
        if (typeof api?.getAttrTypes === "function") {
            api.getAttrTypes(attrTypes => {
                if (!isObject(attrTypes)) {
                    if (typeof onsuccess === "function") {
                        onsuccess();
                    }
                    return;
                }
                Object.entries(attrTypes).forEach(([attrName, type]) => {
                    snippets.push({
                        attrName,
                        type: getDefaultSnippetTypeByDataType(type),
                        title: true
                    });
                });
                if (typeof onsuccess === "function") {
                    onsuccess();
                }
            }, onerror);
        }
        else if (typeof onerror === "function") {
            onerror(new Error("createSnippetsIfNoSnippetsAreGiven: the given api has no function getAttrTypes."));
        }
    }
    else if (typeof onsuccess === "function") {
        onsuccess();
    }
}

/**
 * Removes all non object and non string snippets from the given array. Returns the result.
 * @param {*[]} snippets a list of snippets with a potential object string mix
 * @returns {Object[]|String[]} a list of snippets with a object and string mix
 */
function removeInvalidSnippets (snippets) {
    if (!Array.isArray(snippets)) {
        return [];
    }
    const result = [];

    snippets.forEach(snippet => {
        if (!isObject(snippet) && typeof snippet !== "string") {
            return;
        }
        result.push(snippet);
    });
    return result;
}

/**
 * Converts all string representations of snippets into objects.
 * @param {Object[]|String[]} snippets a list of snippets a with potential object string mix
 * @returns {void}
 */
function convertStringSnippetsIntoObjects (snippets) {
    snippets.forEach((snippet, idx) => {
        if (typeof snippet === "string") {
            snippets[idx] = {
                attrName: snippet
            };
        }
    });
}

/**
 * Adds a unique snippetId to each given snippet.
 * @param {Object[]} snippets the list of snippets
 * @param {Number} numberFirstLevelSnippet the number of first level snippet
 * @returns {void}
 */
function addSnippetIds (snippets, numberFirstLevelSnippet) {
    snippets.forEach((snippet, snippetId) => {
        snippet.snippetId = snippetId + numberFirstLevelSnippet;
    });
}

/**
 * Adds adjustment objects to each given snippet.
 * @param {Object[]} snippets the list of snippets
 * @returns {void}
 */
function addSnippetAdjustment (snippets) {
    snippets.forEach(snippet => {
        snippet.adjustment = {};
    });
}

/**
 * Initializes and adds a snippet api to every snippet if the snippet has its own service.
 * @param {Object[]} snippets - An array of snippet objects.
 * @param {Function} createNewFilterAPI - Factory method for creating a new filter api.
 * @returns {void}
 */
function addSnippetApi (snippets, createNewFilterAPI) {
    snippets.forEach(snippet => {
        if (isObject(snippet) && isObject(snippet.service) && typeof createNewFilterAPI === "function") {
            snippet.api = createNewFilterAPI();
            snippet.api.setService(snippet.service);
        }
    });
}

/**
 * Adds multiselect to each snippet.
 * @param {Object[]} snippets the list of snippets
 * @returns {void}
 */
function addSnippetMultiselect (snippets) {
    snippets.forEach(snippet => {
        if (!Object.prototype.hasOwnProperty.call(snippet, "multiselect")) {
            if (snippet?.matchingMode === "AND") {
                snippet.multiselect = false;
                delete snippet.matchingMode;
            }
            else {
                snippet.multiselect = true;
                delete snippet.matchingMode;
            }
        }
    });
}

/**
 * Adds empty value to each child snippet.
 * @param {Object[]} snippets the list of snippets
 * @returns {void}
 */
function addEmptyChildSnippetValue (snippets) {
    snippets.forEach(snippet => {
        snippet.value = [];
    });
}

/**
 * Adds value to each snippet.
 * @param {Object[]} snippets the list of snippets
 * @param {Number} parentSnippetId the snippetId of parent snippet
 * @returns {void}
 */
function addSnippetParentId (snippets, parentSnippetId) {
    snippets.forEach(snippet => {
        snippet.parentSnippetId = parentSnippetId;
    });
}

/**
 * Adds operators to each given snippet without operator.
 * @param {Object[]} snippets the list of snippets
 * @returns {void}
 */
function addSnippetOperator (snippets) {
    snippets.forEach(snippet => {
        if (!Object.prototype.hasOwnProperty.call(snippet, "operator")) {
            snippet.operator = getDefaultOperatorBySnippetType(snippet.type, snippet.delimitor);
        }
    });
}

/**
 * Calls the api to get the attrTypes and dataTypes and creates new or alters present snippets.
 * @param {Object[]} snippets an array list of snippet objects
 * @param {Object} attrTypes an object with key value pairs representing the attrName type combination
 * @returns {void}
 */
function addSnippetTypes (snippets, attrTypes) {
    if (!isObject(attrTypes)) {
        return;
    }
    snippets.forEach(snippet => {
        if (!snippet.type) {
            snippet.type = getDefaultSnippetTypeByDataType(attrTypes[snippet.attrName]);
        }
    });
}

/**
 * Checks if all snippets have defined types.
 * @param {Object[]} snippets an array of snippet
 * @returns {Boolean} true if all types are set, false if any snippet is missing a type
 */
function checkSnippetTypeConsistency (snippets) {
    const len = snippets.length;

    for (let i = 0; i < len; i++) {
        if (!snippets[i].type) {
            return false;
        }
    }
    return true;
}

/**
 * Returns the default snippet type for the given data type.
 * @param {String} dataType the data type e.g. string, number or boolean
 * @returns {String} the type of the snippet to use for the given dataType
 */
function getDefaultSnippetTypeByDataType (dataType) {
    switch (dataType) {
        case "boolean":
            return "checkbox";
        case "string":
            return "dropdown";
        case "number":
            return "sliderRange";
        case "dateTime":
            return "dateRange";
        default:
            return "text";
    }
}

/**
 * Returns the default operator for the given data type.
 * @param {String} snippetType the snippet type
 * @param {Boolean} [hasDelimitorSet=false] true if a delimitor is set in config, false if not
 * @returns {String} the operator to use as default for the given dataType
 */
function getDefaultOperatorBySnippetType (snippetType, hasDelimitorSet = false) {
    switch (snippetType) {
        case "checkbox":
            return "EQ";
        case "date":
            return "EQ";
        case "dateRange":
            return "INTERSECTS";
        case "dropdown":
            return hasDelimitorSet ? "IN" : "EQ";
        case "text":
            return "IN";
        case "slider":
            return "EQ";
        case "sliderRange":
            return "BETWEEN";
        default:
            return "EQ";
    }
}

export {
    compileSnippets,
    removeInvalidSnippets,
    convertStringSnippetsIntoObjects,
    addSnippetIds,
    addEmptyChildSnippetValue,
    addSnippetParentId,
    addSnippetAdjustment,
    addSnippetApi,
    addSnippetMultiselect,
    addSnippetOperator,
    addSnippetTypes,
    checkSnippetTypeConsistency,
    getDefaultSnippetTypeByDataType,
    getDefaultOperatorBySnippetType
};
