import WfsQueryModel from "./query/source/wfs";
import GeoJsonQueryModel from "./query/source/geojson";
import Tool from "../../core/modelList/tool/model";
import "./RadioBridge.js";
import {updateQueryStringParam} from "../../../src/utils/parametricUrl/ParametricUrlBridge";
import store from "../../../src/app-store";

const FilterModel = Tool.extend({
    defaults: Object.assign({}, Tool.prototype.defaults, {
        initialized: false,
        isGeneric: false,
        isInitOpen: false,
        isVisible: false,
        isVisibleInMenu: true,
        id: "filter",
        queryCollection: {},
        isActive: false,
        allowMultipleQueriesPerLayer: false,
        liveZoomToFeatures: true,
        sendToRemote: false,
        renderToSidebar: true,
        renderToWindow: false,
        glyphicon: "glyphicon-filter",
        uiStyle: "DEFAULT",
        saveToUrl: true
    }),
    initialize: function () {
        const channel = Radio.channel("Filter");

        this.superInitialize();
        this.listenTo(channel, {
            "resetFilter": this.resetFilter
        });
        this.listenTo(Radio.channel("i18next"), {
            "languageChanged": this.changeLang
        });
        this.changeLang();

        channel.reply({
            "getIsInitialLoad": function () {
                return this.get("isInitialLoad");
            },
            "getFilterName": function (layerId) {
                const predefinedQuery = this.get("predefinedQueries").filter(function (query) {
                    return query.layerId === layerId;
                });

                return predefinedQuery[0]?.name;
            },
            "getFilters": function () {
                const predefinedQueries = this.get("predefinedQueries");

                return predefinedQueries;
            }
        }, this);

        this.set("uiStyle", Radio.request("Util", "getUiStyle"));
        this.set("queryCollection", new Backbone.Collection());
        this.listenTo(this.get("queryCollection"), {
            "deactivateAllModels": function (model) {
                this.deactivateOtherModels(model);
            },
            "deselectAllModels": this.deselectAllModels,
            "featureIdsChanged": function (featureIds, layerId) {
                this.updateMap();
                if (!this.get("queryCollection").models[0].get("isAutoRefreshing")) {
                    this.updateGFI(featureIds, layerId);
                }
                this.updateFilterObject();
            },
            "closeFilter": function () {
                this.setIsActive(false);
            }
        }, this);

        this.listenTo(Radio.channel("VectorLayer"), {
            "featuresLoaded": function (layerId) {
                const predefinedQueries = this.get("predefinedQueries"),
                    queryCollection = this.get("queryCollection");
                let filterModels;

                if (!this.isModelInQueryCollection(layerId, queryCollection) && this.get("isActive")) {
                    filterModels = predefinedQueries.filter(function (query) {
                        return query.layerId === layerId;
                    });

                    filterModels.forEach(filterModel => {
                        const layer = Radio.request("ModelList", "getModelByAttributes", {id: layerId});

                        this.createQuery(filterModel, layer);
                    });
                }
            }
        }, this);
    },
    /**
     * change language - sets default values for the language
     * @param {String} lng - new language to be set
     * @returns {Void} -
     */
    changeLang: function (lng) {
        this.set({
            "currentLng": lng
        });
    },
    resetFilter: function (feature) {
        if (feature && feature.getStyleFunction() === null) {
            this.deselectAllModels();
            this.deactivateAllModels();
            this.resetAllQueries();
            this.activateDefaultQuery();
        }
    },
    activateDefaultQuery: function () {
        const defaultQuery = this.get("queryCollection").findWhere({isDefault: true});

        if (defaultQuery !== undefined) {
            defaultQuery.setIsActive(true);
            defaultQuery.setIsSelected(true);
        }
        defaultQuery.runFilter();
    },
    resetAllQueries: function () {
        this.get("queryCollection").models.forEach(model => {
            model.deselectAllValueModels();
        });
    },
    deselectAllModels: function () {
        this.get("queryCollection").models.forEach(model => {
            model.setIsSelected(false);
        });
    },
    deactivateAllModels: function () {
        this.get("queryCollection").models.forEach(model => {
            model.setIsActive(false);
        });
    },

    deactivateOtherModels: function (selectedModel) {
        if (!this.get("allowMultipleQueriesPerLayer")) {
            this.get("queryCollection").models.forEach(model => {
                if (model !== undefined &&
                    selectedModel.cid !== model.cid &&
                    selectedModel.get("layerId") === model.get("layerId")) {
                    model.setIsActive(false);
                }
            });
        }
    },
    /**
     * Updates the Features shown on the Map.
     * If at least one query is selected zoomToFilteredFeatures, otherwise showAllFeatures.
     * @return {void}
     */
    updateMap: function () {
        let allFeatureIds;

        if (this.get("queryCollection").pluck("isSelected").includes(true)) {
            allFeatureIds = this.groupFeatureIdsByLayer(this.get("queryCollection"));

            allFeatureIds.forEach(layerFeatures => {
                Radio.trigger("ModelList", "showFeaturesById", layerFeatures.layer, layerFeatures.ids);
            });
        }
        else {
            Object.entries(this.get("queryCollection").groupBy("layerId")).forEach((group) => {
                Radio.trigger("ModelList", "showAllFeatures", group[0]);
            });
        }
    },

    updateGFI: function (featureIds, layerId) {
        const getVisibleTheme = Radio.request("GFI", "getVisibleTheme");
        let featureId;

        if (getVisibleTheme && getVisibleTheme.get("id") === layerId) {
            featureId = getVisibleTheme.get("feature").getId();

            if (!featureIds.includes(featureId)) {
                Radio.trigger("GFI", "setIsVisible", false);
            }
        }
    },

    /**
     * builds an array of object that reflects the current filter
     * @return {void}
     */
    updateFilterObject: function () {
        const filterObjects = [];
        let snippetValuesWithoutType;

        this.get("queryCollection").forEach(function (query) {
            const ruleList = [];

            query.get("snippetCollection").forEach(function (snippet) {
                // searchInMapExtent is ignored
                if (snippet.getSelectedValues().values.length > 0 && snippet.get("type") !== "searchInMapExtent") {
                    snippetValuesWithoutType = Object.fromEntries(
                        Object.entries(snippet.getSelectedValues())
                            .filter(([key]) => !["type", "keys"].includes(key))
                    );
                    ruleList.push(snippetValuesWithoutType);
                }
            });
            filterObjects.push({name: query.get("name"), isSelected: query.get("isSelected"), rules: ruleList});
        });
        if (this.get("saveToUrl")) {
            updateQueryStringParam("filter", JSON.stringify(filterObjects));
        }
    },

    /**
     * collects the ids from of all features that match the filter, maps them to the layerids
     * @param  {Object[]} queries query objects
     * @return {Object} Map object mapping layers to featuresids
     */
    groupFeatureIdsByLayer: function (queries) {
        const allFeatureIds = [];
        let featureIds;

        if (queries !== undefined) {
            Object.entries(queries.groupBy("layerId")).forEach((group) => {
                const isEveryQueryActive = group[1].every(model => {
                    return !model.get("isActive");
                });

                featureIds = this.collectFilteredIds(group[1]);

                if (isEveryQueryActive) {
                    Radio.trigger("ModelList", "showAllFeatures", group[0]);
                }
                else {
                    allFeatureIds.push({
                        layer: group[0],
                        ids: featureIds
                    });
                }
            });
        }

        return allFeatureIds;
    },

    /**
     * collects all featureIds of a group of queries into a list of uniqueIds
     * @param  {Object[]} [queryGroup=[]] group of queries
     * @return {String[]} unique list of all feature ids
     */
    collectFilteredIds: function (queryGroup = []) {
        const featureIdList = [];

        queryGroup.forEach(query => {
            if (query.get("isActive") === true) {
                query.get("featureIds").forEach(featureId => {
                    featureIdList.push(featureId);
                });
            }
        });

        return [...new Set(featureIdList)];
    },

    /**
     * Creates queries for filter.
     * @param {object[]} queries - Contains the layer.
     * @returns {void}
     */
    createQueries: function (queries) {
        const urlParams = store.state.urlParams && store.state.urlParams.filter ? store.state.urlParams.filter : "[]",
            queryObjects = JSON.parse(urlParams);
        let queryObject,
            oneQuery;

        queries.forEach(query => {
            oneQuery = query;

            if (queryObjects !== undefined) {
                queryObject = queryObjects.find(element => element.name === oneQuery.name);

                oneQuery = Object.assign(oneQuery, queryObject);
            }
            if (!this.isModelInQueryCollection(oneQuery.layerId, this.get("queryCollection"))) {
                this.createQuery(oneQuery, Radio.request("ModelList", "getModelByAttributes", {id: oneQuery.layerId}));
            }
        });
    },

    /**
     * Creates a query for a layer.
     * This can also be a group layer
     * @param {object} model - layer for which a query is created.
     * @param {Backbone.Model} layer - BackboneModel for check the layerTyp.
     * @returns {void}
     */
    createQuery: function (model, layer) {
        let query;

        if (typeof layer !== "undefined" && layer.has("layer") && layer.get("layerSource")) {
            query = this.getQueryByTyp(layer.get("typ"), model);
            if (query !== null) {
                if (this.get("allowMultipleQueriesPerLayer") !== undefined) {
                    Object.assign(query.set("activateOnSelection", !this.get("allowMultipleQueriesPerLayer")));
                }

                if (this.get("liveZoomToFeatures") !== undefined) {
                    query.set("liveZoomToFeatures", this.get("liveZoomToFeatures"));
                }

                if (this.get("sendToRemote") !== undefined) {
                    query.set("sendToRemote", this.get("sendToRemote"));
                }
                if (this.get("minScale") !== undefined) {
                    query.set("minScale", this.get("minScale"));
                }

                if (query.get("isSelected")) {
                    query.setIsDefault(true);
                    query.setIsActive(true);
                }

                this.get("queryCollection").add(query);
            }
        }
    },

    getQueryByTyp: function (layerTyp, model) {
        let query = null;

        if (layerTyp === "WFS" || layerTyp === "GROUP") {
            query = new WfsQueryModel(model);
        }
        else if (layerTyp === "GeoJSON") {
            query = new GeoJsonQueryModel(model);
        }
        return query;
    },
    setIsActive: function (value) {
        this.set("isActive", value);
    },
    closeGFI: function () {
        Radio.trigger("GFI", "setIsVisible", false);
        store.dispatch("MapMarker/removePointMarker");
    },
    collapseOpenSnippet: function () {
        const selectedQuery = this.get("queryCollection").findWhere({isSelected: true});
        let snippetCollection,
            openSnippet;

        if (selectedQuery !== undefined) {
            snippetCollection = selectedQuery.get("snippetCollection");

            openSnippet = snippetCollection.findWhere({isOpen: true});
            if (openSnippet !== undefined) {
                openSnippet.setIsOpen(false);
            }
        }
    },

    isModelInQueryCollection: function (layerId, queryCollection) {
        const searchQuery = queryCollection.findWhere({layerId: layerId.toString()});

        return searchQuery !== undefined;
    },

    /**
     * Sets the parameters isActive and isSelected for each model to the configured values.
     * @param {Object} queryCollectionModel - configured model in filter
     * @param {Object[]} predefinedQueriesModels - configured values
     * @returns {Object} queryCollectionModel with default values
     */
    regulateInitialActivating: function (queryCollectionModel, predefinedQueriesModels) {
        const predefinedQueriesModel = predefinedQueriesModels.find(function (element) {
            return element.layerId === queryCollectionModel.attributes.layerId && element.name === queryCollectionModel.attributes.name;
        });

        queryCollectionModel.attributes.isActive = predefinedQueriesModel.isActive;
        queryCollectionModel.attributes.isSelected = predefinedQueriesModel.isSelected;

        return queryCollectionModel;
    },

    /**
     * Sets the attributes isActive and isVisible to true for the first model of the passed array.
     * @param {Object[]} queryCollectionModels - configured models in filter
     * @returns {void}
     */
    activateLayer: function (queryCollectionModels) {
        if (queryCollectionModels.length) {
            queryCollectionModels[0].attributes.isActive = true;
            queryCollectionModels[0].attributes.isSelected = true;
        }
    },

    // setter for isInitOpen
    setIsInitOpen: function (value) {
        this.set("isInitOpen", value);
    },

    // setter for deatailview
    setDetailView: function (value) {
        this.set("detailView", value);
    }
});

export default FilterModel;
