import SnippetDropdownModel from "../../../snippets/dropdown/model";
import SnippetSliderModel from "../../../snippets/slider/model";
import SnippetCheckboxModel from "../../../snippets/checkbox/model";
import SnippetMultiCheckboxModel from "../../../snippets/multiCheckbox/model";
import {getDisplayNamesOfFeatureAttributes} from "masterportalAPI/src/rawLayerList";
import moment from "moment";

const QueryModel = Backbone.Model.extend(/** @lends QueryModel.prototype */{

    defaults: {
        featureIds: [],
        isLayerVisible: false,
        activateOnSelection: false,
        searchInMapExtent: true,
        liveZoomToFeatures: false,
        // translations
        result: "",
        results: "",
        filter: "",
        yourSelection: "",
        noFilterOptionSelected: "",
        deleteAll: ""
    },

    /**
     * @class QueryModel
     * @description todo
     * @extends Backbone.Model
     * @memberOf Tools.Filter.Query
     * @constructs
     * @property {Array} featureIds=[] todo
     * @property {boolean} isLayerVisible=false todo
     * @property {boolean} activateOnSelection=false todo
     * @property {boolean} searchInMapExtent=true Flag for the search in the current map extent.
     * @property {boolean} liveZoomToFeatures=false todo
     * @property {String} result: "" contains the translated text
     * @property {String} results: "" contains the translated text
     * @property {String} filter: "" contains the translated text
     * @property {String} yourSelection: "" contains the translated text
     * @property {String} noFilterOptionSelected: "" contains the translated text
     * @property {String} deleteAll: "" contains the translated text
     * @listens i18next#RadioTriggerLanguageChanged
     * @returns {void}
     */
    superInitialize: function () {
        this.setSnippetCollection(new Backbone.Collection());
        this.addIsActiveCheckbox();
        this.listenTo(this.get("snippetCollection"), {
            "valuesChanged": function () {
                this.setIsActive(true);
                this.get("btnIsActive").setIsSelected(true);
                this.runFilter();
                if (this.get("liveZoomToFeatures")) {
                    this.liveZoom();
                }
            }
        }, this);
        this.checkLayerVisibility();
        this.listenTo(Radio.channel("Layer"), {
            "layerVisibleChanged": function (layerId, visible) {
                const layer = Radio.request("ModelList", "getModelByAttributes", {id: layerId});

                if (
                    typeof layer === "object" && layer !== null && typeof layer.get === "function"
                    && Array.isArray(layer.get("children")) && layer.get("children").length
                ) {
                    layer.get("children").forEach(child => {
                        if (typeof child === "object" && child !== null && child.id === this.get("layerId")) {
                            this.setIsLayerVisible(visible);
                        }
                    });
                }
                if (layerId === this.get("layerId")) {
                    this.setIsLayerVisible(visible);
                }
            }
        }, this);
        this.listenTo(Radio.channel("i18next"), {
            "languageChanged": this.changeLang
        });
        this.changeLang();
    },

    /**
     * change language - sets default values for the language
     * @param {String} lng - new language to be set
     * @returns {Void} -
     */
    changeLang: function (lng) {
        this.set({
            "result": i18next.t("common:modules.tools.filter.result"),
            "results": i18next.t("common:modules.tools.filter.results"),
            "filter": i18next.t("common:modules.tools.filter.filter"),
            "yourSelection": i18next.t("common:modules.tools.filter.yourSelection"),
            "noFilterOptionSelected": i18next.t("common:modules.tools.filter.noFilterOptionSelected"),
            "deleteAll": i18next.t("common:modules.tools.filter.deleteAll"),
            "currentLng": lng
        });
    },

    /**
     * Zooms to an extent of a feature considering the min scale.
     * @returns {void}
     */
    liveZoom: function () {
        const minResolution = Radio.request("MapView", "getResolutionByScale", this.get("minScale"));

        Radio.trigger("Map", "zoomToFilteredFeatures", this.get("featureIds"), this.get("layerId"), {minResolution});
    },

    isSearchInMapExtentActive: function () {
        const model = this.get("snippetCollection").findWhere({type: "searchInMapExtent"});

        if (model !== undefined && model.getIsSelected() === true) {
            this.runFilter();
        }
    },

    checkLayerVisibility: function () {
        const model = Radio.request("ModelList", "getModelByAttributes", {id: this.get("layerId")});

        if (model !== undefined) {
            this.setIsLayerVisible(model.get("isVisibleInMap"));
        }
    },

    addIsActiveCheckbox: function () {
        if (!this.get("activateOnSelection")) {
            this.setBtnIsActive(new SnippetCheckboxModel({
                isSelected: this.get("isActive")
            }));

            this.listenTo(this.get("btnIsActive"), {
                "valuesChanged": function () {
                    const checkboxModel = this.get("btnIsActive"),
                        isActive = this.get("btnIsActive").getIsSelected();

                    checkboxModel.renderView();
                    this.setIsActive(isActive);
                }
            }, this);
        }
    },

    /**
     * adds the snipptes
     * @param  {Object[]} featureAttributesMap Mapping array for feature attributes
     * @return {void}
     */
    addSnippets: function (featureAttributesMap) {
        featureAttributesMap.forEach(featureAttribute => {
            this.addSnippet(featureAttribute);
        });
    },

    /**
     * adds a snippet based on featureAttribute
     * @param {Object} featureAttribute attributes to config the snippet
     * @returns {void}
     */
    addSnippet: function (featureAttribute) {
        let snippetAttribute = featureAttribute,
            isSelected = false;

        snippetAttribute.values = Radio.request("Util", "sort", "", snippetAttribute.values);

        if (snippetAttribute.type === "string" || snippetAttribute.type === "text") {
            snippetAttribute = Object.assign(snippetAttribute, {"snippetType": "dropdown"});
            this.get("snippetCollection").add(new SnippetDropdownModel(snippetAttribute));
        }
        else if (snippetAttribute.type === "boolean") {
            if (snippetAttribute?.preselectedValues) {
                isSelected = snippetAttribute.preselectedValues[0];
            }
            snippetAttribute = Object.assign(snippetAttribute, {"snippetType": "checkbox", "label": snippetAttribute.displayName, "isSelected": isSelected});
            this.get("snippetCollection").add(new SnippetCheckboxModel(snippetAttribute));
        }
        else if (snippetAttribute.type === "integer" || snippetAttribute.type === "decimal") {
            snippetAttribute = Object.assign(snippetAttribute, {"snippetType": "slider"});
            this.get("snippetCollection").add(new SnippetSliderModel(snippetAttribute));
        }
        else if (snippetAttribute.type === "checkbox-classic") {
            snippetAttribute = Object.assign(snippetAttribute, {"snippetType": snippetAttribute.type});
            snippetAttribute.type = "string";
            snippetAttribute.layerId = this.get("layerId");
            snippetAttribute.isInitialLoad = this.get("isInitialLoad");
            this.get("snippetCollection").add(new SnippetMultiCheckboxModel(snippetAttribute));
        }
        else if (snippetAttribute.type === "date") {
            snippetAttribute = Object.assign(snippetAttribute, {
                snippetType: snippetAttribute.type,
                displayName: snippetAttribute.displayName
            });

            snippetAttribute.editableValueBox = false;
            snippetAttribute.precision = 1;
            snippetAttribute.step = 86400000;
            snippetAttribute.selection = "none";

            snippetAttribute.values = this.getTimestampValues(snippetAttribute.values, snippetAttribute.format);
            if (Array.isArray(snippetAttribute.values) && snippetAttribute.values.length > 0) {
                snippetAttribute.preselectedValues = [snippetAttribute.values[0], snippetAttribute.values[snippetAttribute.values.length - 1]];
            }

            this.get("snippetCollection").add(new SnippetSliderModel(snippetAttribute));
        }
    },

    /**
     * returns given values of sorted values as timestamp
     * @param {String[]} values the array of the dates as string
     * @param {String} format the format to use for moment
     * @return {Number[]} sorted array of timestamps
     */
    getTimestampValues: function (values, format) {
        if (!Array.isArray(values) || typeof format !== "string") {
            return [];
        }
        const result = [];

        values.forEach(value => {
            result.push(moment(value, format).toDate().valueOf());
        });

        return result.sort();
    },

    /**
     * adds a snippet for the map extent search
     * @return {void}
     */
    addSearchInMapExtentSnippet: function () {
        this.get("snippetCollection").add(new SnippetCheckboxModel({
            type: "searchInMapExtent",
            isSelected: false,
            label: "Suche im aktuellen Kartenausschnitt"
        }));
    },

    /**
     * Creates one or more Snippets, where Snippets like DropDowns or Sliders
     * @param  {Object[]} featureAttributes feature attributes
     * @return {void}
     */
    createSnippets: function (featureAttributes) {
        let featureAttributesMap = this.trimAttributes(featureAttributes);

        featureAttributesMap = this.mapDisplayNames(featureAttributesMap);
        featureAttributesMap = this.collectSelectableOptions(this.get("features"), [], featureAttributesMap);
        featureAttributesMap = this.mapRules(featureAttributesMap, this.get("rules"));

        this.setFeatureAttributesMap(featureAttributesMap);

        this.addSnippets(featureAttributesMap);
        if (this.get("isSelected") === true) {
            this.runFilter();
            if (this.get("liveZoomToFeatures")) {
                this.liveZoom();
            }
            this.trigger("renderDetailView");
        }
    },

    /**
     * Removes all attributes that are not in the whitelist
     * @param  {Object} featureAttributesMap - Mapobject
     * @return {Object} featureAttributesMap - filtered and adapted Mapobject
     */
    trimAttributes: function (featureAttributesMap) {
        const trimmedFeatureAttributesMap = [],
            whiteList = this.get("attributeWhiteList"),
            whiteListAttributes = Array.isArray(whiteList) ? whiteList : Object.keys(whiteList);
        let featureAttribute;

        whiteListAttributes.forEach(attr => {
            const attrObj = this.createAttrObject(attr);

            featureAttribute = Radio.request("Util", "findWhereJs", featureAttributesMap, {name: attrObj.name});
            if (featureAttribute !== undefined) {
                featureAttribute.matchingMode = attrObj.matchingMode;

                if (attrObj.format) {
                    featureAttribute.format = attrObj.format;
                }
                if (attrObj.type) {
                    featureAttribute.type = attrObj.type;
                }
                if (attrObj.attrNameUntil) {
                    featureAttribute.attrNameUntil = attrObj.attrNameUntil;
                }
                if (attrObj.displayName) {
                    featureAttribute.displayName = attrObj.displayName;
                }

                trimmedFeatureAttributesMap.push(featureAttribute);
            }
        });

        return trimmedFeatureAttributesMap;
    },

    /**
     * creates an object of the given attributes, checks for name and matchingMode, creates object with name and matchingMode if a string is given
     * @param {Object|String} attr the attribute as string of object
     * @returns {Object} an object with name and matchingMode or an empty object if something went wrong
     */
    createAttrObject: function (attr) {
        let attrObj = {};

        if (typeof attr === "string") {
            attrObj.name = attr;
            attrObj.matchingMode = "OR";
        }
        else if (attr?.name && attr?.matchingMode) {
            attrObj = attr;
        }
        return attrObj;
    },

    /**
     * maps the label text as attribute displayName to the feature attributes of the given feature attribute map
     * @param  {Object} featureAttributesMap the map object to parse
     * @return {Object} changed map object
     */
    mapDisplayNames: function (featureAttributesMap) {
        const attributeNames = getDisplayNamesOfFeatureAttributes(this.get("layerId")),
            whiteList = this.get("attributeWhiteList"),
            displayNames = Array.isArray(whiteList) ? attributeNames : whiteList;

        featureAttributesMap.forEach(featureAttribute => {
            if (featureAttribute.displayName) {
                return;
            }
            if (displayNames instanceof Object && Object.prototype.hasOwnProperty.call(displayNames, featureAttribute.name) === true) {
                featureAttribute.displayName = displayNames[featureAttribute.name];
            }
            else {
                featureAttribute.displayName = featureAttribute.name;
            }
        });

        return featureAttributesMap;
    },

    /**
     * adds values that should be initially selected (rules) to the map object
     * @param  {Object[]} [featureAttributesMap={}] - Mapobject
     * @param  {Object[]} [rules=[]] - contains values to be added
     * @return {Object} featureAttributesMap
     */
    mapRules: function (featureAttributesMap = [], rules = []) {
        let attrMap;

        rules.forEach(rule => {
            attrMap = Radio.request("Util", "findWhereJs", featureAttributesMap, {name: rule.attrName});

            if (attrMap) {
                attrMap.preselectedValues = rule.values;
            }
        });

        return featureAttributesMap;
    },

    /**
     * iterates over the snippet collection and
     * calls in the snippet deselectValueModels
     * @return {void}
     */
    deselectAllValueModels: function () {
        const snippetCollection = this.get("snippetCollection");

        snippetCollection.forEach(snippet => {
            snippet.deselectValueModels();
        });
    },

    setFeatureAttributesMap: function (value) {
        this.set("featureAttributesMap", value);
    },

    // setter for isDefault
    setIsDefault: function (value) {
        this.set("isDefault", value);
    },
    selectThis: function () {
        if (!this.get("isSelected")) {
            // the query collection listens to this trigger in the filter model
            this.collection.trigger("deselectAllModels", this);
            this.collection.trigger("deactivateAllModels", this);
            this.setIsSelected(true);
            if (this.get("isActive")) {
                this.runFilter();
                if (this.get("liveZoomToFeatures")) {
                    this.liveZoom();
                }
            }
        }
        else {
            this.setIsSelected(false);
            if (this.get("activateOnSelection")) {
                this.runFilter();
            }
        }
    },

    setIsSelected: function (value) {
        if (this.get("activateOnSelection")) {
            this.setIsActive(value);
        }
        this.set("isSelected", value);
    },

    setIsActive: function (value) {
        this.set("isActive", value);
    },

    setFeatureIds: function (value) {
        this.set("featureIds", value);
    },
    setIsNoValueSelected: function (value) {
        this.set("isNoValueSelected", value);
    },
    setIsLayerVisible: function (value) {
        this.set("isLayerVisible", value);
    },

    setActivateOnSelection: function (value) {
        this.set("activateOnSelection", value);
    },

    // setter for snippetCollection
    setSnippetCollection: function (value) {
        this.set("snippetCollection", value);
    },

    // setter for btnIsActive
    setBtnIsActive: function (value) {
        this.set("btnIsActive", value);
    },

    // setter for liveZoomToFeatures
    setLiveZoomToFeatures: function (value) {
        this.set("liveZoomToFeatures", value);
    },

    // setter for layerId
    setLayerId: function (value) {
        this.set("layerId", value);
    },

    // setter for features
    setFeatures: function (value) {
        this.set("features", value);
    },

    // setter for rules
    setRules: function (value) {
        this.set("rules", value);
    },

    // setter for attributeWhiteList
    setAttributeWhiteList: function (value) {
        this.set("attributeWhiteList", value);
    },

    // setter for isInitialLoad
    setIsInitialLoad: function (value) {
        this.set("isInitialLoad", value);
    }
});

export default QueryModel;
