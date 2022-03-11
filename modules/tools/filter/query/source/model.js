import QueryModel from "../model";
import {intersects} from "ol/extent.js";
import {getLayerWhere} from "masterportalAPI/src/rawLayerList";
import moment from "moment";
import store from "../../../../../src/app-store";

const SourceModel = QueryModel.extend({
    defaults: {
        isAutoRefreshing: false,
        isInitialLoad: true
    },

    /**
     * the function to initialize the SourceModel
     * @returns {void}
     */
    initializeFunction: function () {
        const modelList = Radio.request("ModelList", "getModelByAttributes", {id: this.get("layerId")});

        this.superInitialize();
        this.prepareQuery();
        if (this.get("searchInMapExtent") === true) {
            Radio.trigger("Map", "registerListener", "moveend", this.isSearchInMapExtentActive.bind(this), this);
        }
        if (modelList && modelList.get("autoRefresh")) {
            this.set("isAutoRefreshing", true);
            this.listenToFeaturesLoaded();
        }
    },

    /**
     * gathers Information for this Query including the features and metadata
     * @returns {ol.Feature[]} openlayers Features
     */
    prepareQuery: function () {
        const layerId = this.get("layerId"),
            features = this.getFeaturesByLayerId(layerId);

        if (features.length > 0) {
            this.processFeatures(features);
            this.setIsInitialLoad(false);
        }
        else {
            this.listenToFeaturesLoaded();
        }
        return features;
    },

    /**
     * build the query data structure from the given features
     * @param {ol.Feature[]} features the given features
     * @returns {void}
     */
    processFeatures: function (features) {
        this.setFeatures(features);
        this.setFeatureIds(this.collectAllFeatureIds(features));
        this.buildQueryDatastructure();
    },

    /**
     * returns the ids from the given features
     * @param {ol.Feature[]} features the given features
     * @returns {Number[]} the array of feature ids
     */
    collectAllFeatureIds: function (features) {
        const featureIds = [];

        features.forEach(feature => {
            featureIds.push(feature.getId());
        });
        return featureIds;
    },

    /**
     * Waits for the Layer to load its features and proceeds requests the metadata
     * @returns {void}
     */
    listenToFeaturesLoaded: function () {
        this.listenTo(Radio.channel("VectorLayer"), {
            "featuresLoaded": function (layerId, features) {
                const filters = store.state.urlParam?.filter;
                let urlFilterRules = [];

                if (layerId === this.get("layerId")) {
                    if (this.get("snippetCollection").length > 0 && this.get("isAutoRefreshing") && !this.get("isInitialLoad") && filters) {
                        urlFilterRules = filters.filter(function (urlFilters) {
                            const name = Radio.request("Filter", "getFilterName", layerId);

                            return urlFilters.name === name;
                        }, this);
                        this.createQueryFromUrlFilterRules(urlFilterRules[0]);
                        this.get("snippetCollection").reset(null);
                        this.processFeatures(features);
                    }
                    else if (this.get("isInitialLoad")) {
                        this.processFeatures(features);
                        this.setIsInitialLoad(false);

                        if (!this.get("isAutoRefreshing")) {
                            this.stopListening(Radio.channel("VectorLayer"), "featuresLoaded");
                        }
                    }
                }
            }
        });
    },

    /**
     * request the features for layer with its ID
     * @param {String} layerId ID of Layer
     * @returns {Object} - olFeatures
     */
    getFeaturesByLayerId: function (layerId) {
        const model = Radio.request("ModelList", "getModelByAttributes", {id: layerId});
        let layerSource,
            features = [];

        if (model !== undefined) {
            layerSource = model.get("layerSource");
            layerSource = this.retrieveLayerSource(layerSource, layerId);
            features = layerSource.getFeatures();
        }
        return features;
    },

    /**
     * delivers the layerSource from an layer,
     * by grouplayer delivers the layerSource from child by layerid
     * @param {Object} layerSource from layer
     * @param {Number} layerId id from layer
     * @returns {Object} layerSource
     */
    retrieveLayerSource: function (layerSource, layerId) {
        let layer,
            groupLayerSource = layerSource;

        if (Array.isArray(layerSource)) {
            layer = layerSource.find(child => child.get("id") === layerId);
            groupLayerSource = layer.get("layerSource");
        }

        return groupLayerSource;
    },

    /**
     * adapt the query data structure
     * @returns {void}
     */
    buildQueryDatastructure: function () {
        const layerObject = getLayerWhere({id: this.get("layerId")});

        if (this.get("searchInMapExtent") === true) {
            this.addSearchInMapExtentSnippet();
        }
        if (layerObject !== undefined) {
            this.buildQueryDatastructureByType(layerObject);
        }
    },

    /**
     * Extract Attribute names and types from DescribeFeatureType-Response
     * @param  {XML} response response xml from ajax call
     * @returns {object} - Mapobject containing names and types
     */
    parseResponse: function (response) {
        const elements = $("element", response),
            featureAttributesMap = [];

        elements.forEach(element => {
            featureAttributesMap.push({name: $(element).attr("name"), type: $(element).attr("type")});
        });
        this.createSnippets(featureAttributesMap);
    },

    /**
     * [getValuesFromFeature description]
     * @param  {ol.feature} feature olfeature
     * @param  {string} attrName [description]
     * @returns {string[]} [description]
     */
    getValuesFromFeature: function (feature, attrName) {
        const values = this.parseValuesFromString(feature, attrName);

        return [...new Set(values)];
    },

    /**
     * parses attribute values with pipe-sign ("|") and returnes array with single values
     * @param  {ol.feature} feature olfeature
     * @param  {string} attributeName - key name of a feature attribute
     * @returns {string[]} array of string[] || number[]
     */
    parseValuesFromString: function (feature, attributeName) {
        const values = [],
            attributeValue = feature.get(attributeName);
        let attributeValues = [];

        if (attributeValue !== undefined) {
            if (typeof attributeValue === "string" && attributeValue.indexOf("|") !== -1) {
                attributeValues = attributeValue.split("|");

                attributeValues.forEach(value => {
                    if (this.isValid(value)) {
                        values.push(this.trimValue(value));
                    }
                });
            }
            else if (Array.isArray(attributeValue)) {
                attributeValue.forEach(value => {
                    if (this.isValid(value)) {
                        values.push(this.trimValue(value));
                    }
                });
            }
            else if (this.isValid(attributeValue)) {
                values.push(this.trimValue(attributeValue));
            }
        }
        return [...new Set(values)];
    },

    /**
     * checks if the given value is not null and not undefined
     * @param {*} value the value to check
     * @returns {Boolean} false if value is invalid
     */
    isValid: function (value) {
        return value !== null && value !== undefined;
    },

    /**
     * trims the given value if it is a string, checks for string (save call)
     * @param {*} value the value to trim
     * @returns {*} the given value as trimmed string or the given value if value is not a string
     */
    trimValue: function (value) {
        return typeof value === "string" ? value.trim() : value;
    },

    /**
     * Collect the feature Ids that match the predefined rules
     * and trigger them to the ModelList
     * @returns {ol.feature[]} features that passed the predefined rules
     */
    runPredefinedRules: function () {
        const features = this.get("features"),
            newFeatures = [];

        if (this.get("predefinedRules") !== undefined && this.get("predefinedRules").length > 0) {
            features.forEach(feature => {
                this.get("predefinedRules").forEach(rule => {
                    if (rule.values.includes(feature.get(rule.attrName))) {
                        newFeatures.push(feature);
                    }
                });
            });
        }
        else {
            return features;
        }

        return newFeatures;
    },

    /**
     * runs predefined rules,
     * determines selected values from snippets,
     * derives featureIds from matching Features and triggers "featureIdsChanged" to filterModel
     * @returns {void}
     */
    runFilter: function () {
        const features = this.runPredefinedRules(),
            selectedAttributes = [],
            featureIds = [];

        this.get("snippetCollection").forEach(function (snippet) {
            if (snippet.hasSelectedValues() === true) {
                selectedAttributes.push(snippet.getSelectedValues());
            }
        });

        if (selectedAttributes.length > 0) {
            features.forEach(feature => {
                const isMatch = this.isFilterMatch(feature, selectedAttributes);

                if (isMatch) {
                    featureIds.push(feature.getId());
                }
            });
        }
        else {
            features.forEach(feature => {
                featureIds.push(feature.getId());
            });
        }

        this.updateSnippets(features, selectedAttributes);
        this.setFeatureIds(featureIds);
        this.trigger("featureIdsChanged", featureIds, this.get("layerId"));
    },

    sendFeaturesToRemote: function () {
        const model = Radio.request("ModelList", "getModelByAttributes", {id: this.get("layerId")}),
            features = [];
        let feature;

        this.get("featureIds").forEach(id => {
            feature = model.get("layerSource").getFeatureById(id);
            feature.set("extent", feature.getGeometry().getExtent());
            features.push(Radio.request("Util", "omit", feature.getProperties(), ["geometry", "geometry_EPSG_25832", "geometry_EPSG_4326"]));
        });

        Radio.trigger("RemoteInterface", "postMessage", {"features": JSON.stringify(features), "layerId": model.get("id"), "layerName": model.get("name")});
    },
    /**
     * determines the attributes and their values that are still selectable
     * @param  {ol.Feature[]} features olfeatures
     * @param  {Object[]} selectedAttributes attribute object
     * @param  {Object[]} [allAttributes=[]]      array of all attributes and their values
     * @return {Object[]}                    array of attributes and their values that are still selectable
     */
    collectSelectableOptions: function (features, selectedAttributes, allAttributes = []) {
        const selectableOptions = [];
        let selectableValues = [];

        allAttributes.forEach(attribute => {
            selectableValues = {
                name: attribute.name,
                displayName: attribute.displayName,
                type: attribute.type,
                values: [],
                matchingMode: attribute.matchingMode,
                format: attribute.format,
                attrNameUntil: attribute.attrNameUntil
            };

            features.forEach(feature => {
                const isMatch = this.isFilterMatch(feature, selectedAttributes.filter(function (attr) {
                    return attr.attrName !== attribute.name;
                }));

                if (isMatch) {
                    selectableValues.values.push(this.parseValuesFromString(feature, attribute.name));
                    if (selectableValues.attrNameUntil) {
                        selectableValues.values.push(this.parseValuesFromString(feature, attribute.attrNameUntil));
                    }
                }
            });

            // the values are an array of small arrays (because of piped strings in feature attributes, see parseValuesFromString)
            // therefore we must go through the array and concat every subarray to one big flat array, using concat on subarrays
            selectableValues.values = [...new Set(Array.isArray(selectableValues.values) ? selectableValues.values.reduce((acc, val) => acc.concat(val), []) : selectableValues.values)];
            selectableOptions.push(selectableValues);
        });

        return selectableOptions;
    },

    /**
     * after every filtering the snippets get updated with selectable values
     * @param  {ol.Feature[]} features features
     * @param  {Object[]}     selectedAttributes [description]
     * @returns {void}
     */
    updateSnippets: function (features, selectedAttributes) {
        const snippets = this.get("snippetCollection"),
            selectableOptions = this.collectSelectableOptions(features, selectedAttributes, this.get("featureAttributesMap"));

        snippets.where({"snippetType": "dropdown"}).forEach(snippet => {
            let attribute = {};

            snippet.resetValues();
            attribute = selectableOptions.find(option => option.name === snippet.get("name"));

            snippet.updateSelectableValues(attribute.values);
        });
    },

    /**
     * checks if feature hat attribute that contains value
     * @param  {ol.Feature}  feature olfeature
     * @param  {Object}      attribute attributeObject
     * @returns {Boolean}               true if feature has attribute that contains value
     */
    isValueMatch: function (feature, attribute) {
        const featureMap = this.get("featureAttributesMap").find(featureAttribute => featureAttribute.name === attribute.attrName);

        attribute.matchingMode = featureMap.matchingMode;
        return attribute.matchingMode === "OR" ? this.isORMatch(feature, attribute) : this.isANDMatch(feature, attribute);
    },

    /**
     * checks if one of the values of the given attribute can be found in the attribute name of the given feature
     * @param {ol.Feature} feature the feature to check
     * @param {String[]} attribute the attributes to search for as array of strings
     * @returns {Boolean} true if it is an OR match, false if not
     */
    isORMatch: function (feature, attribute) {
        const isMatch = attribute.values.find(value => {
            return this.containsValue(feature, attribute?.attrName, value);
        });

        return isMatch !== undefined;
    },

    /**
     * checks if every value of the given attribute can be found in any attribute name of the given feature
     * @param {ol.Feature} feature the feature to check
     * @param {String[]} attribute the attributes to search for as array of strings
     * @returns {Boolean} true if it is an AND match, false if not
     */
    isANDMatch: function (feature, attribute) {
        return attribute.values.every(value => this.containsValue(feature, attribute?.attrName, value));
    },

    /**
     * checks if the attribute of the feature contains the given value (no exact match)
     * @param {ol.Feature} feature the feature to check
     * @param {String} attrName the attribute name as string
     * @param {String} value the value to search for
     * @returns {Boolean} true if value is part of attrName of the given feature, false if not
     */
    containsValue: function (feature, attrName, value) {
        if (feature.get(attrName) !== undefined) {
            return String(feature.get(attrName)).indexOf(value) !== -1;
        }
        return false;
    },

    /**
     * checks if a value is within a range of values
     * @param  {ol.Feature} feature olfeature
     * @param  {String} attributeName name of attribute
     * @param  {Number[]} values array of values
     * @returns {Boolean} flag if value is in range
     */
    isNumberInRange: function (feature, attributeName, values) {
        const featureValue = feature.get(attributeName),
            valueList = Object.assign([], values);

        valueList.push(featureValue);
        valueList.sort((valueA, valueB) => valueA - valueB);

        return valueList[1] === featureValue;
    },

    /**
     * checks if the date is in range, uses attr Name and attrNameUntil from feature to compare with the give values
     * @param {ol.Feature} feature the given feature
     * @param {String} attrName the given attr Name
     * @param {String} attrNameUntil the given attr name until
     * @param {Number[]} values the given array of timestamps
     * @param {String} format the given format for moment
     * @return {Boolean} if date is in range
     */
    isDateInRange (feature, attrName, attrNameUntil, values, format) {
        if (
            typeof feature !== "object" || feature === null || typeof feature.get !== "function"
            || typeof attrName !== "string"
            || !Array.isArray(values) || values.length !== 2
            || typeof format !== "string"
        ) {
            return false;
        }
        const featureUnixFrom = moment(feature.get(attrName), format).valueOf(),
            featureUnixUntil = attrNameUntil ? moment(feature.get(attrNameUntil), format).valueOf() : false,
            sliderUnixFrom = values[0],
            sliderUnixUntil = values[1];

        if (featureUnixUntil) {
            return featureUnixFrom <= sliderUnixUntil && featureUnixUntil >= sliderUnixFrom;
        }
        return featureUnixFrom <= sliderUnixUntil && featureUnixFrom >= sliderUnixFrom;
    },

    /**
     * checks if the given feature intersects with the current browser extent
     * @param {ol.Feature} feature the feature to check
     * @returns {Boolean} true if the feature intersects with the current browser extent
     */
    isFeatureInExtent: function (feature) {
        const mapExtent = Radio.request("MapView", "getCurrentExtent");

        return intersects(mapExtent, feature.getGeometry().getExtent());
    },

    /**
     * checks if feature matches the filter
     * @param  {ol.Feature} feature to check
     * @param  {Object[]} filterAttr array of attributes and their values to filter
     * @return {Boolean} true if it is a match
     */
    isFilterMatch: function (feature, filterAttr) {
        let isMatch = false;

        isMatch = filterAttr.every(attribute => {
            if (feature.get(attribute.attrName) === null) {
                return false;
            }
            else if (attribute.type === "integer" || attribute.type === "decimal") {
                return this.isNumberInRange(feature, attribute.attrName, attribute.values);
            }
            else if (attribute.type === "searchInMapExtent") {
                return this.isFeatureInExtent(feature);
            }
            else if (attribute.type === "date") {
                return this.isDateInRange(feature, attribute.attrName, attribute.attrNameUntil, attribute.values, attribute.format);
            }

            return this.isValueMatch(feature, attribute);
        });

        return isMatch;
    },

    /**
     * sets the feature
     * @param {ol.Feature} value the feature to set
     * @returns {void}
     */
    setFeatures: function (value) {
        this.set("features", value);
    },

    /**
     * creates Query from Url-Filterobject
     * @param  {Object[]} obj array of attributes and their values to filter
     * @returns {void}
     */
    createQueryFromUrlFilterRules: function (obj) {
        Object.keys(obj).forEach(function (key) {
            this.set(key, obj[key]);
        }, this);
    }
});

export default SourceModel;
