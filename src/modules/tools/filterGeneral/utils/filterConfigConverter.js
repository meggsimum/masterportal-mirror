import isObject from "../../../../utils/isObject";

/**
 * The FilterConfigConverter converts old configs to new configs.
 * @class
 */
export default class FilterConfigConverter {
    /**
     * @constructor
     * @param {Object} config the config object to work with
     */
    constructor (config) {
        try {
            this.config = JSON.parse(JSON.stringify(config));
        }
        catch (e) {
            this.config = {};
        }
    }

    /**
     * Getter for the config variable.
     * @returns {Object} the current config
     */
    getConfig () {
        return this.config;
    }

    /**
     * Setter for the config variable.
     * @param {Object} config the config to override the internal config with
     * @returns {void}
     */
    setConfig (config) {
        this.config = config;
    }

    /**
     * Checks if the current config is old.
     * @returns {Boolean} true if this config is an old one
     */
    isOldConfig () {
        return isObject(this.config) && (
            Object.prototype.hasOwnProperty.call(this.config, "attributeWhiteList")
            || Object.prototype.hasOwnProperty.call(this.config, "predefinedQueries")
            || Object.prototype.hasOwnProperty.call(this.config, "allowMultipleQueriesPerLayer")
        );
    }

    /**
     * Returns the saveTo value.
     * @returns {String} the saveTo value to use according to the old saveToUrl
     */
    getSaveTo () {
        return this.config?.saveToUrl ? "url" : "void";
    }

    /**
     * Returns the layerSelectorVisible value.
     * @returns {Boolean} false if checkbox classic is detected or only one filter is configured, true if otherwise
     */
    getLayerSelectorVisible () {
        if (this.checkboxClassicExists()) {
            return false;
        }
        else if (!isObject(this.config) || !Array.isArray(this.config.predefinedQueries) || this.config.predefinedQueries.length <= 1) {
            return false;
        }
        return true;
    }

    /**
     * Returns the list of layers.
     * @returns {Object[]} a list of layer configurations based on the old predefinedQueries.
     */
    getLayers () {
        if (!isObject(this.config) || !Array.isArray(this.config.predefinedQueries)) {
            return [];
        }
        return this.convertPredefinedQueriesToLayer(this.config.predefinedQueries, this.getDeactivateGfi());
    }

    /**
     * Returns the deactivateGfi status.
     * @returns {Boolean} the deactivateGfi status
     */
    getDeactivateGfi () {
        if (!isObject(this.config)) {
            return false;
        }
        return this.config.deactivateGfi ? this.config.deactivateGfi : false;
    }

    /**
     * Checks if checkbox classic exists in any configured predefinedQuery.
     * @returns {Boolean} true if checkbox classic is configured, false if not
     */
    checkboxClassicExists () {
        if (!isObject(this.config) || !Array.isArray(this.config.predefinedQueries)) {
            return false;
        }
        const len = this.config.predefinedQueries.length;

        for (let i = 0; i < len; i++) {
            if (!isObject(this.config.predefinedQueries[i])) {
                continue;
            }
            else if (this.isCheckboxClassic(this.config.predefinedQueries[i].snippetType)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Converts predefined queries to filter layers.
     * @param {Object[]} predefinedQueries an array of predefined queries to be converted into filter layers
     * @param {Boolean} deactivateGfi pass through of deactivateGfi, will be set to the layer
     * @returns {Object[]|Boolean} an array of layer objects or false if something went wrong
     */
    convertPredefinedQueriesToLayer (predefinedQueries, deactivateGfi) {
        if (!Array.isArray(predefinedQueries)) {
            return false;
        }
        const result = [];

        predefinedQueries.forEach(predefinedQuery => {
            result.push({
                active: predefinedQuery.isActive || predefinedQuery.isSelected,
                title: predefinedQuery?.name,
                layerId: predefinedQuery.layerId,
                searchInMapExtent: predefinedQuery?.searchInMapExtent,
                info: predefinedQuery?.info,
                deactivateGFI: typeof deactivateGfi === "boolean" ? deactivateGfi : false,
                strategy: "active",
                snippets: this.getSnippetsByPredefinedQuery(predefinedQuery),
                showHits: !this.isCheckboxClassic(predefinedQuery.snippetType),
                snippetTags: !this.isCheckboxClassic(predefinedQuery.snippetType)
            });
        });

        return result;
    }

    /**
     * Checks if the given snippet type is of checkbox classic.
     * @param {String} snippetType the snippet type to check
     * @returns {Boolean} true if it is checkbox classic, false if not
     */
    isCheckboxClassic (snippetType) {
        return snippetType === "checkbox-classic";
    }

    /**
     * Returns a list of snippets translated from the given predefined query.
     * @param {Object} predefinedQuery the predefined query to parse through
     * @returns {Object[]} an array of snippets
     */
    getSnippetsByPredefinedQuery (predefinedQuery) {
        return this.getSnippetsByPredefinedRules(predefinedQuery?.predefinedRules).concat(
            this.getSnippetsByAttributeWhitelist(predefinedQuery?.attributeWhiteList, this.isCheckboxClassic(predefinedQuery?.snippetType))
        );
    }

    /**
     * Returns a list of snippets by the given predefined rule.
     * @param {Object} predefinedRules the predefined rules
     * @returns {Object[]} an array of snippets
     */
    getSnippetsByPredefinedRules (predefinedRules) {
        if (!Array.isArray(predefinedRules)) {
            return [];
        }
        const result = [];

        predefinedRules.forEach(predefinedRule => {
            const snippet = this.createSnippetHidden(predefinedRule?.attrName, predefinedRule?.values);

            if (isObject(snippet)) {
                result.push(snippet);
            }
        });
        return result;
    }

    /**
     * Returns a list of snippets by attribute whitelist and snippet type.
     * @param {Object|Object[]|String[]} attributeWhitelist the predefined rules
     * @param {Boolean} isCheckboxClassic true if this is checkbox classic
     * @returns {Object[]} an array of snippets
     */
    getSnippetsByAttributeWhitelist (attributeWhitelist, isCheckboxClassic) {
        const result = [];

        if (Array.isArray(attributeWhitelist)) {
            attributeWhitelist.forEach(attribute => {
                const snippet = this.createSnippetByAttribute(attribute, isCheckboxClassic);

                if (isObject(snippet) || typeof snippet === "string") {
                    result.push(snippet);
                }
            });
        }
        else if (isObject(attributeWhitelist)) {
            Object.entries(attributeWhitelist).forEach(([key, value]) => {
                result.push(this.createSnippetStandard(key, value, undefined, undefined, "dropdown"));
            });
        }

        return result;
    }

    /**
     * Create Snippet by given attribute
     * @param {String|Object} attribute the attribute
     * @param {Boolean} isCheckboxClassic flag to check if snippet is checkbox-classic
     * @returns {Object|String|Boolean} the snippet - false if attribute is not a string or an object
     */
    createSnippetByAttribute (attribute, isCheckboxClassic) {
        if (typeof attribute === "string") {
            if (isCheckboxClassic) {
                return this.createSnippetCheckboxClassic(attribute);
            }
            return attribute;
        }
        else if (!isObject(attribute)) {
            return false;
        }
        else if (typeof attribute.attrNameUntil === "string") {
            return this.createSnippetRange(
                attribute.name,
                attribute.attrNameUntil,
                attribute.displayName,
                attribute.matchingMode,
                attribute.format,
                attribute.type
            );
        }
        return this.createSnippetStandard(
            attribute.name,
            attribute.attrNameUntil,
            attribute.displayName,
            attribute.matchingMode,
            attribute.format,
            attribute.type
        );
    }

    /**
     * Create standard snippet.
     * @param {String} name the attrName
     * @param {String} displayName the displayName
     * @param {String} matchingMode the matchingMode
     * @param {String} format the format
     * @param {String} type the type
     * @returns {Object} the snippet
     */
    createSnippetStandard (name, displayName, matchingMode, format, type) {
        return {
            attrName: name,
            title: displayName,
            matchingMode,
            operator: "EQ",
            format,
            type
        };
    }

    /**
     * Create the range Snippet.
     * @param {String} name the attrName
     * @param {String} attrNameUntil the attrNameUntil
     * @param {String} displayName the displayName
     * @param {String} matchingMode the matchingMode
     * @param {String} format the format
     * @param {String} type the type
     * @returns {Object} the snippet
     */
    createSnippetRange (name, attrNameUntil, displayName, matchingMode, format, type) {
        return {
            attrName: [name, attrNameUntil],
            title: displayName,
            matchingMode,
            operator: "EQ",
            format,
            type: type + "Range"
        };
    }

    /**
     * Create snippet for checkbox-classic.
     * @param {String} name the attrName
     * @returns {Object} the snippet
     */
    createSnippetCheckboxClassic (name) {
        return {
            attrName: name,
            title: false,
            type: "dropdown",
            display: "list",
            renderIcons: "fromLegend",
            operator: "EQ",
            prechecked: [],
            multiselect: true
        };
    }

    /**
     * Creates a hidden snippet with attrName and prechecked value.
     * @param {String} attrName the attrName to use
     * @param {String[]} values the values to be used as prechecked value
     * @return {Object|Boolean} the hidden snippet to use or false if anything went wrong
     */
    createSnippetHidden (attrName, values) {
        if (typeof attrName !== "string" || !Array.isArray(values)) {
            return false;
        }
        return {
            attrName,
            prechecked: values,
            visible: false,
            type: "dropdown",
            matchingMode: "OR",
            operator: "EQ",
            multiselect: true
        };
    }
}
