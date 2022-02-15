import isObject from "../../../../utils/isObject";
/**
 * Convert deprecated configs to new config format.
 * @param {Object} oldConfig the config object which should be converted into an new format
 * @returns {Object} returns an empty object if convertion failed, otherwise returns a new config object
 */
function convertToNewConfig (oldConfig) {
    if (!isObject(oldConfig)) {
        return {};
    }

    const clonedConfig = cloneObject(oldConfig?.filter),
        newConfig = {
            filterGeneral: clonedConfig
        },
        clonedPredefinedQueries = cloneObject(newConfig.filterGeneral?.predefinedQueries);

    if (!newConfig.filterGeneral) {
        return {};
    }

    delete newConfig.filterGeneral.predefinedQueries;
    delete newConfig.filterGeneral.isGeneric;
    if (oldConfig?.saveToUrl) {
        newConfig.filterGeneral.saveTo = oldConfig.saveToUrl ? "url" : "void";
    }
    delete newConfig.filterGeneral.saveToUrl;
    delete newConfig.filterGeneral.allowMultipleQueriesPerLayer;

    if (clonedPredefinedQueries.filter(query => query?.snippetType === "checkbox-classic").length > 0) {
        newConfig.filterGeneral.layerSelectorVisible = false;
        newConfig.filterGeneral.renderFilterInto = "tableMenu";
    }
    newConfig.filterGeneral.layers = convertPredefinedQueryToLayer(clonedPredefinedQueries, oldConfig.deactivateGfi);
    return newConfig;
}

/**
 * Convert predefinedQuery to new layers.
 * @param {Object[]} predefinedQuery the attribute predefinedQuery which will be converted to new layer attribute
 * @param {Boolean} deactivateGfi set true to disable GFI for the given layer
 * @returns {Object[]} an Array of snippet objects or an empty array if something went wrong
 */
function convertPredefinedQueryToLayer (predefinedQuery, deactivateGfi) {
    if (!Array.isArray(predefinedQuery)) {
        return [];
    }
    const layers = [];

    predefinedQuery.forEach(oldQuery => {
        const snippetsList = getSnippetsByQueries(oldQuery?.predefinedRules, oldQuery?.attributeWhiteList, oldQuery?.snippetType),
            layer = {
                name: oldQuery?.name,
                layerId: oldQuery.layerId,
                active: oldQuery?.isActive || oldQuery?.isSelected,
                searchInMapExtent: oldQuery?.searchInMapExtent,
                info: oldQuery?.info,
                deactivateGFI: typeof deactivateGfi === "boolean" ? deactivateGfi : false,
                snippets: snippetsList
            };

        if (oldQuery?.snippetType === "checkbox-classic") {
            layer.strategy = "active";
            layer.active = true;
        }

        layers.push(layer);
    });

    return layers;
}
/**
 * Get a list of snippet objects.
 * @param {Object[]} predefinedRules array of objects which should be converted to new snippets
 * @param {Object[]} attributeWhiteList array of objects which should be converted to new snippets
 * @param {String} snippetType the type of the snippets
 * @returns {Object[]} returns an array of snippets if succeed or returns empty array
 */
function getSnippetsByQueries (predefinedRules, attributeWhiteList, snippetType = null) {
    const snippets = [];

    if (Array.isArray(predefinedRules)) {
        predefinedRules.forEach(predefinedRule => {
            const snippet = convertPredefRuleToSnippet(predefinedRule);

            if (snippet !== {}) {
                snippets.push(snippet);
            }
        });
    }

    if (Array.isArray(attributeWhiteList)) {
        attributeWhiteList.forEach(attribute => {
            const snippet = convertWhiteListAttributeToSnippet(attribute, snippetType);

            if (snippet !== {}) {
                snippets.push(snippet);
            }
        });
    }
    return snippets;
}

/**
 * Convert predefinedRule to new snippet.
 * @param {Object} predefinedRule an predefinedRule object
 * @return {Object} snippet object if correct param is given or empty object if param could not be converted
 */
function convertPredefRuleToSnippet (predefinedRule) {
    const clonedObject = cloneObject(predefinedRule);

    if (!isObject(clonedObject)) {
        return {};
    }
    return {
        attrName: clonedObject.attrName,
        preChecked: clonedObject.values,
        visible: false,
        type: "dropdown",
        matchingMode: "OR",
        operator: "EQ",
        multiselect: true
    };
}

/**
 * Convert attribute from whitelist to a new snippet.
 * @param {Object|String} attribute object will be converted to new snippet, string will be returned
 * @param {String} snippetsType the type of the snippet
 * @returns {Object} snippet object, emtpy when attribute couldn't be converted
 */
function convertWhiteListAttributeToSnippet (attribute, snippetsType) {
    if (typeof attribute === "string") {
        if (snippetsType !== "checkbox-classic") {
            return attribute;
        }
        return {
            attrName: attribute,
            type: "dropdown",
            display: "list",
            renderIcons: "fromLegend",
            operator: "EQ",
            prechecked: "all",
            multiselect: true
        };
    }
    else if (!isObject(attribute)) {
        return {};
    }
    const clonedObject = cloneObject(attribute);

    return {
        attrName: clonedObject?.attrNameUntil ? [clonedObject.name, clonedObject.attrNameUntil] : clonedObject.name,
        label: clonedObject?.displayName,
        matchingMode: clonedObject?.matchingMode,
        operator: "EQ",
        format: clonedObject?.format,
        type: clonedObject?.type
    };
}


/**
 * Clones the given object and returns the clone or false on error.
 * @param {Object} obj the object to be cloned
 * @returns {Object|Boolean} the cloned object or false if anything went wrong
 */
function cloneObject (obj) {
    if (typeof obj !== "object") {
        return false;
    }
    try {
        return JSON.parse(JSON.stringify(obj));
    }
    catch (e) {
        return false;
    }
}

export {
    convertToNewConfig,
    getSnippetsByQueries,
    convertPredefinedQueryToLayer,
    convertPredefRuleToSnippet,
    convertWhiteListAttributeToSnippet
};
