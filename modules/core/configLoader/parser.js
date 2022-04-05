import Backbone from "backbone";
import ModelList from "../modelList/list";
import {getLayerList} from "masterportalapi/src/rawLayerList";
import store from "../../../src/app-store/index";

const Parser = Backbone.Model.extend(/** @lends Parser.prototype */{
    defaults: {
        itemList: [],
        overlayer: [],
        baselayer: [],
        portalConfig: {},
        treeType: "",
        categories: ["Opendata", "Inspire", "Behörde"],
        category: "Opendata",
        selectionIDX: -1,
        onlyDesktopTools: [
            "measure",
            "print",
            "kmlimport",
            "fileImport",
            "draw",
            "featureLister",
            "addWMS",
            "shadow"
        ],
        extendedLayerIdAssoc: {}
    },

    /**
     * @class Parser
     * @description Parse the configured models from config datas
     * Models can be of type folder, layer, staticlink, tool, viewpoint, ...
     * @extends Backbone.Model
     * @memberof Core.ConfigLoader
     * @constructs
     * @property {Array} itemList=[] lightModels
     * @property {Array} overlayer=[] Themenconfig.Fachdaten
     * @property {Array} baselayer=[] Themenconfig.Hintergrundkarten
     * @property {Object} portalConfig={} Portalconfig
     * @property {String} treeType="" the attribute Baumtyp
     * @property {String[]} categories=["Opendata", "Inspire", "Behörde"] categories for Fachdaten in DefaultTree
     * @property {String} category="Opendata" selected category for Fachdaten in DefaultTree
     * @property {Number} selectionIDX=-1 Index of the last inserted layers. Required for sorting/moving (only for the treeType lightTree)
     * @property {String[]} onlyDesktopTools=["measure", "print", "kmlimport" or "fileImport", "draw", "featureLister", "addWMS"]
     * @listens Core.ConfigLoader#RadioRequestParserGetItemByAttributes
     * @listens Core.ConfigLoader#RadioRequestParserGetItemsByAttributes
     * @listens Core.ConfigLoader#RadioRequestParserGetTreeType
     * @listens Core.ConfigLoader#RadioRequestParserGetCategory
     * @listens Core.ConfigLoader#RadioRequestParserGetCategories
     * @listens Core.ConfigLoader#RadioRequestParserGetPortalConfig
     * @listens Core.ConfigLoader#RadioRequestParserGetItemsByMetaID
     * @listens Core.ConfigLoader#RadioRequestParserGetSnippetInfos
     * @listens Core.ConfigLoader#RadioRequestParserGetInitVisibBaselayer
     * @listens Core.ConfigLoader#RadioTriggerParsersetCategory
     * @listens Core.ConfigLoader#RadioTriggerParserAddItem
     * @listens Core.ConfigLoader#RadioTriggerParserAddItemAtTop
     * @listens Core.ConfigLoader#RadioTriggerParserAddItems
     * @listens Core.ConfigLoader#RadioTriggerParserAddFolder
     * @listens Core.ConfigLoader#RadioTriggerParserAddLayer
     * @listens Core.ConfigLoader#RadioTriggerParserAddGDILayer
     * @listens Core.ConfigLoader#RadioTriggerParserAddGeoJSONLayer
     * @listens Core.ConfigLoader#RadioTriggerParserRemoveItem
     * @listens Core.ConfigLoader#ChangeCategory
     * @listens Core#RadioTriggerUtilIsViewMobileChanged
     * @fires Core.ModelList#RadioTriggerModelListRemoveModelsByParentId
     * @fires Core.ModelList#RadioTriggerModelListRenderTree
     * @fires Core.ModelList#RadioTriggerModelListSetModelAttributesById
     * @fires Core.ModelList#RadioTriggerModelListRemoveModelsById
     * @fires Core.ModelList#RadioTriggerModelListAddModelsByAttributes
     * @fires Core.ModelList#RadioTriggerModelListShowModelInTree
     * @fires Core.ModelList#RadioTriggerModelListRefreshLightTree
     */
    initialize: function () {
        const channel = Radio.channel("Parser");

        channel.reply({
            "getItemByAttributes": this.getItemByAttributes,
            "getItemsByAttributes": this.getItemsByAttributes,
            "getTreeType": function () {
                return this.get("treeType");
            },
            "getCategory": function () {
                return this.get("category");
            },
            "getCategories": function () {
                return this.get("categories");
            },
            "getPortalConfig": function () {
                return this.get("portalConfig");
            },
            "getItemsByMetaID": this.getItemsByMetaID,
            "getSnippetInfos": function () {
                return this.get("snippetInfos");
            },
            "getInitVisibBaselayer": this.getInitVisibBaselayer,
            "getOriginId": function (layerId) {
                if (Object.prototype.hasOwnProperty.call(this.get("extendedLayerIdAssoc"), layerId)) {
                    return this.get("extendedLayerIdAssoc")[layerId];
                }
                return layerId;
            }
        }, this);

        channel.on({
            "setCategory": this.setCategory,
            "addItem": this.addItem,
            "addItemAtTop": this.addItemAtTop,
            "addItems": this.addItems,
            "addFolder": this.addFolder,
            "addLayer": this.addLayer,
            "addGdiLayer": this.addGdiLayer,
            "addGeoJSONLayer": this.addGeoJSONLayer,
            "addVectorLayer": this.addVectorLayer,
            "removeItem": this.removeItem
        }, this);

        this.listenTo(this, {
            "change:category": function () {
                this.setItemList([]);
                this.addTreeMenuItems();
                this.parseTree(getLayerList());
                Radio.trigger("ModelList", "removeModelsByParentId", "tree");
                Radio.trigger("ModelList", "renderTree");
                Radio.trigger("ModelList", "setModelAttributesById", "Overlayer", {isExpanded: true});
            }
        });

        this.listenTo(Radio.channel("Util"), {
            "isViewMobileChanged": () => {
                this.addOrRemoveFolder("3d_daten", "common:tree.subjectData3D", this.get("overlayer_3d"));
                this.addOrRemoveFolder("TimeLayer", "common:tree.subjectDataTime", this.get("overlayer_time"));
            }
        });

        this.parseMenu("root", this.get("portalConfig").menu);
        this.parseControls(this.get("portalConfig").controls);
        this.parseSearchBar(this.get("portalConfig").searchBar);

        this.addItem({
            type: "featureViaURL",
            attr: this.get("portalConfig").featureViaURL
        });

        if (this.get("treeType") === "light") {
            this.parseTree(this.get("overlayer"), "tree", 0);
            this.parseTree(this.get("overlayer_time"), "tree", 0);
            this.parseTree(this.get("baselayer"), "tree", 0);
        }
        else if (this.get("treeType") === "custom") {
            this.addTreeMenuItems();
            this.parseTree(this.get("baselayer"), "Baselayer", 0);
            this.parseTree(this.get("overlayer"), "Overlayer", 0);
            this.parseTree(this.get("overlayer_3d"), "3d_daten", 0);
            this.parseTree(this.get("overlayer_time"), "TimeLayer", 0);
        }
        else {
            this.addTreeMenuItems();
            this.parseTree(getLayerList(), this.get("overlayer_3d"), this.get("overlayer_time"));
        }
        this.createModelList();
    },

    /**
     * Parsed the menu entries (everything except the contents of the tree)
     * @param {String} parentId indicates to whom the items will be added
     * @param {Object} [items={}] Single levels of the menu bar, e.g. contact, legend, tools and tree
     * @return {void}
     */
    parseMenu: function (parentId, items = {}) {
        Object.entries(items).forEach(itemX => {
            const value = itemX[1],
                key = itemX[0];
            let item,
                toolitem,
                ansicht,
                downloadItem;

            if (value?.children || key === "tree") {
                item = {
                    type: "folder",
                    parentId: parentId,
                    id: key,
                    treeType: this.get("treeType"),
                    quickHelp: store.getters["QuickHelp/isSet"]
                };

                // Attribute aus der config.json werden von item geerbt
                Object.assign(item, value);
                this.addItem(item);
                this.parseMenu(key, value.children);
            }
            else if (key.search("staticlinks") !== -1) {
                value.forEach(staticlink => {
                    toolitem = Object.assign(staticlink, {type: "staticlink", parentId: parentId, id: Radio.request("Util", "uniqueId", key + "_")});

                    this.addItem(toolitem);
                });
            }
            else if (value?.type && value.type === "viewpoint") {
                ansicht = Object.assign(value, {parentId: parentId, id: Radio.request("Util", "uniqueId", key + "_")});
                this.addItem(ansicht);
            }
            else {
                toolitem = Object.assign(value, {type: "tool", parentId: parentId, id: key});

                // wenn tool noch kein "onlyDesktop" aus der Config bekommen hat
                if (!toolitem?.onlyDesktop) {
                    // wenn tool in onlyDesktopTools enthalten ist, setze onlyDesktop auf true
                    if (this.get("onlyDesktopTools").indexOf(toolitem.id) !== -1) {
                        toolitem = Object.assign(toolitem, {onlyDesktop: true});
                    }
                }

                // special case because the download tool is only used in Drawtool
                if (toolitem.id === "draw") {
                    downloadItem = {
                        parentId: parentId,
                        type: "tool",
                        id: "download",
                        isVisibleInMenu: false
                    };

                    this.addItem(downloadItem);
                }
                /**
                 * @deprecated Due to refactorment, legend is no longer considered a tool.
                 * Item for legend MUST be added to replace it in LegendMenue.vue for respecting order of menu-entries in config.json
                 */
                this.addItem(toolitem);
            }
        }, this);
    },

    /**
     * todo
     * @param  {Object} searchbarConfig - todo
     * @return {void}
     */
    parseSearchBar: function (searchbarConfig) {
        this.addItem({
            type: "searchBar",
            attr: searchbarConfig
        });
    },

    /**
     * todo
     * @param  {object} [items={}] - todo
     * @return {void}
     */
    parseControls: function (items = {}) {
        Object.entries(items).forEach(item => {
            const value = item[1],
                key = item[0];

            this.addItem({
                type: "control",
                id: key,
                attr: value
            });
        });
    },

    /**
     * Adds an item(layer, folder, ...) to the end of the attribute "itemList".
     * @param {Object} obj - Item
     * @return {void}
     */
    addItem: function (obj) {
        if (obj.visibility !== undefined) {
            obj.isSelected = obj.visibility;
            obj.isVisibleInMap = obj.visibility;
            delete obj.visibility;
        }
        this.get("itemList").push(obj);
    },

    /**
     * Adds an item(layer, folder, ...) to the attribute "itemList" at the specified position.
     * @param {Object} obj - Item
     * @param {Number} position - position in ItemList
     * @return {void}
     */
    addItemByPosition: function (obj, position) {
        if (obj.visibility !== undefined) {
            obj.isSelected = obj.visibility;
            obj.isVisibleInMap = obj.visibility;
            delete obj.visibility;
        }
        this.get("itemList").splice(position, 0, obj);
    },

    /**
     *  Allows to create an array of objects that all have attr in common
     *  @param {array} objs Array of related objects, e.g. categories in Themenbaum
     *  @param {object} attr Layerobject
     *  @return {void}
     */
    addItems: function (objs, attr) {
        objs.forEach(obj => {
            this.addItem(Object.assign(obj, attr));
        });
    },

    /**
     * Creates a new folder and adds it.
     * @param {String} name - name of the folder
     * @param {String} id - id of the layer
     * @param {String} parentId - id of the parent
     * @param {Number} level - level of the folder
     * @param {Boolean} isExpanded - if true, folder will be expanded
     * @param {String} i18nKey - key for the name to translate
     * @param {Boolean} [invertLayerOrder=false] inverts the order the layers when added to the map on folder click
     * @param {Boolean} [isFolderSelectable=false] flag if folder is selectable or not
     * @returns {void}
     */
    addFolder: function (name, id, parentId, level, isExpanded, i18nKey, invertLayerOrder = false, isFolderSelectable = false) {
        const folder = {
            type: "folder",
            name: i18nKey ? i18next.t(i18nKey) : name,
            i18nextTranslate: i18nKey ? function (setter) {
                if (typeof setter === "function" && i18next.exists(i18nKey)) {
                    setter("name", i18next.t(i18nKey));
                }
            } : null,
            glyphicon: "glyphicon-plus-sign",
            id: id,
            parentId: parentId,
            isExpanded: isExpanded ? isExpanded : false,
            level: level,
            quickHelp: store.getters["QuickHelp/isSet"],
            invertLayerOrder,
            isFolderSelectable
        };

        this.addItem(folder);
    },

    /**
     * todo
     * @param {*} name - todo
     * @param {*} id - todo
     * @param {*} parentId - todo
     * @param {*} level - todo
     * @param {*} layers - todo
     * @param {*} url - todo
     * @param {*} version - todo
     * @param {boolean} [transparent = true] Whether the given layer is transparent.
     * @param {boolean} [isSelected = false] Whether the given layer is selected .
     * @param {(boolean/object)} [time = false] If set to `true` or and Object, the configured Layer is expected to be a WMS-T.
     * @returns {void}
     */
    addLayer: function (name, id, parentId, level, layers, url, version, {transparent = true, isSelected = false, time = false, styles = ""}) {
        const layer = {
            id,
            name,
            parentId,
            level,
            layers,
            url,
            version,
            transparent,
            isSelected,
            time,
            styles,
            cache: false,
            datasets: [],
            featureCount: 3,
            format: "image/png",
            gfiAttributes: "showAll",
            gutter: "0",
            isBaseLayer: false,
            layerAttribution: "nicht vorhanden",
            legendURL: "",
            maxScale: "2500000",
            minScale: "0",
            singleTile: false,
            supported: ["2D", "3D"],
            tilesize: "512",
            typ: "WMS",
            type: "layer",
            urlIsVisible: true
        };

        this.addItem(layer);
    },

    /**
     * Creates the Masterportal Configuration for a GeoJSON Layer.
     * Adds the configuration to be parsed into the Portal.
     *
     * @param {String} name Name of the layer.
     * @param {String} id Unique identifier for the layer.
     * @param {(String | Object)} geojson GeoJSON for the layer containing the features.
     * @param {String} [styleId] Id for the styling of the features; should correspond to a style from the style.json.
     * @param {String} [parentId] Id for the correct position of the layer in the layertree.
     * @param {(String | Object)} [gfiAttributes="showAll"] Attributes to be shown when clicking on the feature using the GFI tool.
     * @returns {void}
     */
    addGeoJSONLayer: function (name, id, geojson, styleId, parentId, gfiAttributes = "showAll") {
        const layer = {
            type: "layer",
            name: name,
            id: id,
            typ: "GeoJSON",
            geojson: geojson,
            transparent: true,
            minScale: "0",
            maxScale: "350000",
            gfiAttributes: gfiAttributes,
            layerAttribution: "nicht vorhanden",
            legendURL: "",
            isBaseLayer: false,
            isSelected: true,
            isVisibleInTree: true,
            cache: false,
            datasets: [],
            urlIsVisible: true
        };

        if (styleId !== undefined) {
            layer.styleId = styleId;
        }
        if (parentId !== undefined) {
            layer.parentId = parentId;
        }

        this.addItem(layer);
    },

    /**
     * Creates the Masterportal Configuration for a Vector Layer.
     * Adds the configuration to be parsed into the Portal.
     *
     * @param {String} name Name of the layer.
     * @param {String} id Unique identifier for the layer.
     * @param {ol.Feature[]} features - all features generated from the imported file
     * @param {String} [parentId] Id for the correct position of the layer in the layertree.
     * @param {String} [styleId] Id for the styling of the features; should correspond to a style from the style.json.
     * @param {(String | Object)} [gfiAttributes="ignore"] Attributes to be shown when clicking on the feature using the GFI tool.
     * @param {Object} [opts] additional options to append to the model on initialization
     * @returns {void}
     */
    addVectorLayer: function (name, id, features, parentId, styleId, gfiAttributes = "ignore", opts = {}) {
        const layer = {
            type: "layer",
            name: name,
            id: id,
            typ: "VectorBase",
            features: features,
            transparent: true,
            minScale: "0",
            maxScale: "350000",
            gfiAttributes: gfiAttributes,
            layerAttribution: "nicht vorhanden",
            legendURL: "",
            isBaseLayer: false,
            isVisibleInTree: true,
            isSelected: true,
            cache: false,
            datasets: [],
            urlIsVisible: false,
            ...opts
        };

        if (styleId !== undefined) {
            layer.styleId = styleId;
        }
        if (parentId !== undefined) {
            layer.parentId = parentId;
        }

        this.addItem(layer);
        Radio.trigger("ModelList", "addModelsByAttributes", layer);
    },

    /**
     * Adds found layer to layer tree
     * @param {Object} hit layer to be added
     * @fires Core.ModelList#RadioTriggerModelListRenderTree
     * @fires Core.ModelList#RadioTriggerModelListAddModelsByAttributes
     * @fires Core.ModelList#RadioTriggerModelListShowModelInTree
     * @fires Core.ModelList#RadioTriggerModelListRefreshLightTree
     * @returns {void}
     */
    addGdiLayer: function (hit) {
        if (hit?.source) {
            const treeType = this.get("treeType");
            let level = 0,
                parentId = "tree",
                gdiLayer = Object.assign({
                    cache: false,
                    featureCount: "3",
                    format: "image/png",
                    gfiAttributes: "showAll",
                    gfiTheme: "default",
                    gutter: "0",
                    isChildLayer: false,
                    isSelected: true,
                    isVisibleInTree: true,
                    layerAttribution: "nicht vorhanden",
                    legendURL: "",
                    maxScale: "2500000",
                    minScale: "0",
                    singleTile: false,
                    tilesize: "512",
                    transparency: 0,
                    transparent: true,
                    typ: "WMS",
                    type: "layer",
                    urlIsVsible: true
                }, hit.source);

            if (!this.getItemByAttributes({id: hit.source.id})) {
                if (treeType === "custom") {
                    // create folder and add it as "Externe Fachdaten"
                    parentId = "extthema";
                    level = 2;
                    if (!this.getItemByAttributes({id: "ExternalLayer"})) {
                        this.addFolder("Externe Fachdaten", "ExternalLayer", "tree", 0, false, "common:tree.externalTechnicalData");
                        Radio.trigger("ModelList", "renderTree");
                        $("#Overlayer").parent().after($("#ExternalLayer").parent());
                    }
                    if (!this.getItemByAttributes({id: parentId})) {
                        this.addFolder("Fachthema", parentId, "ExternalLayer", 1, false, "common:tree.subjectData");
                    }
                }
                if (treeType === "default") {
                    let category,
                        parent = null;

                    if (this.get("category") === "Opendata") {
                        category = hit.source.datasets[0].kategorie_opendata[0];
                    }
                    else if (this.get("category") === "Inspire") {
                        category = hit.source.datasets[0].kategorie_inspire[0];
                    }
                    else if (this.get("category") === "Behörde") {
                        category = hit.source.datasets[0].kategorie_organisation;
                    }
                    parent = this.getItemByAttributes({name: category});
                    if (parent) {
                        parentId = parent.id;
                    }
                    level = 1;
                }

                gdiLayer = Object.assign(gdiLayer, {
                    parentId: parentId,
                    level: level,
                    isJustAdded: true
                });

                this.addItemAtTop(gdiLayer);
                Radio.trigger("ModelList", "addModelsByAttributes", {id: hit.source.id});
            }

            Radio.trigger("ModelList", "showModelInTree", hit.source.id);
            if (treeType === "light") {
                Radio.trigger("ModelList", "refreshLightTree");
            }
        }
        else {
            console.error("No entry could be found for layer " + hit.source.id + " in ElasticSearch.");
        }
    },

    /**
     * Adds an item(layer, folder, ...) at the beginning to the attribute "itemList
     * @param {Object} obj - Item
     * @return {void}
     */
    addItemAtTop: function (obj) {
        if (obj.visibility !== undefined) {
            obj.isSelected = obj.visibility;
            obj.isVisibleInMap = obj.visibility;
            delete obj.visibility;
        }
        this.get("itemList").unshift(obj);
    },

    /**
     * get an item from itemList by a given value
     * @param  {Object} value - todo
     * @return {Object} item
     */
    getItemByAttributes: function (value) {
        return this.get("itemList").find(item => Object.keys(value).every(key => item[key] === value[key]));
    },

    /**
     * get one ore more item from itemList by a given value
     * @param  {Object} value - t odo
     * @return {Array} Items
     */
    getItemsByAttributes: function (value) {
        return this.get("itemList").filter(item => Object.keys(value).every(key => item[key] === value[key]));
    },

    /**
     * removes an item from itemList by a given id
     * @param {String} id - id from item that be removed
     * @returns {void}
     */
    removeItem: function (id) {
        const itemList = this.get("itemList").filter(function (item) {
            return item.id !== id;
        });

        this.setItemList(itemList);
    },

    /**
     * todo
     * @return {ModelList} todo
     */
    createModelList: function () {
        const itemList = this.get("itemList");

        this.logWarnings(itemList);
        new ModelList(itemList.filter(model => {
            return model.parentId === "root" ||
                model.parentId === "tools" ||
                model.parentId === "info" ||
                model.parentId === "bezirke" ||
                model.parentId === "3d_daten" ||
                model.parentId === "simulation" ||
                model.parentId === "utilities" ||
                model.parentId === "ansichten";
        }));
    },

    /**
     * Logged warnings only once for all items.
     * @param {Object[]} itemList - The itemList.
     * @returns {void}
     */
    logWarnings: function (itemList) {
        const itemWithLegendURL = itemList.find(item => item?.legendURL);

        if (itemWithLegendURL) {
            console.warn("legendURL ist deprecated in 3.0.0. Please use attribute \"legend\" als Boolean or String with path to legend image or pdf");
        }
    },

    /**
     * regulates the folder structure of the theme tree taking into account the map mode
     * @returns {void}
     */
    addTreeMenuItems: function () {
        const menu = this.get("portalConfig")?.menu ? this.get("portalConfig").menu : undefined,
            tree = menu !== undefined && menu?.tree ? menu.tree : undefined,
            isAlwaysExpandedList = tree !== undefined && tree?.isAlwaysExpanded ? tree.isAlwaysExpanded : [],
            baseLayers = this.get("baselayer"),
            overLayers = this.get("overlayer"),
            baseLayersName = baseLayers?.name ? baseLayers.name : null,
            overLayersName = overLayers?.name ? overLayers.name : null,
            isQuickHelpSet = store.getters["QuickHelp/isSet"],
            baseLayersDefaultKey = "common:tree.backgroundMaps",
            overLayersDefaultKey = "common:tree.subjectData";
        let baseLayerI18nextTranslate = null,
            overLayerI18nextTranslate = null;

        if (!baseLayersName && !baseLayers.i18nextTranslate) {
            // no name and no translation-function found: provide translation of default key
            baseLayerI18nextTranslate = function (setter) {
                if (typeof setter === "function" && i18next.exists(baseLayersDefaultKey)) {
                    setter("name", i18next.t(baseLayersDefaultKey));
                }
            };
        }
        if (!overLayersName && !overLayers.i18nextTranslate) {
            // no name and no translation-function found: provide translation of default key
            overLayerI18nextTranslate = function (setter) {
                if (typeof setter === "function" && i18next.exists(overLayersDefaultKey)) {
                    setter("name", i18next.t(overLayersDefaultKey));
                }
            };
        }
        this.addItem({
            type: "folder",
            name: baseLayersName ? baseLayersName : i18next.t(baseLayersDefaultKey),
            i18nextTranslate: baseLayers.i18nextTranslate ? baseLayers.i18nextTranslate : baseLayerI18nextTranslate,
            glyphicon: "glyphicon-plus-sign",
            id: "Baselayer",
            parentId: "tree",
            isInThemen: true,
            isInitiallyExpanded: false,
            isAlwaysExpanded: isAlwaysExpandedList.includes("Baselayer"),
            level: 0,
            quickHelp: isQuickHelpSet
        });

        this.addItem({
            type: "folder",
            name: overLayersName ? overLayersName : i18next.t(overLayersDefaultKey),
            i18nextTranslate: overLayers.i18nextTranslate ? overLayers.i18nextTranslate : overLayerI18nextTranslate,
            glyphicon: "glyphicon-plus-sign",
            id: "Overlayer",
            parentId: "tree",
            isInThemen: true,
            isInitiallyExpanded: false,
            isAlwaysExpanded: isAlwaysExpandedList.includes("Overlayer"),
            level: 0,
            quickHelp: isQuickHelpSet
        });

        this.addOrRemoveFolder("3d_daten", "common:tree.subjectData3D", this.get("overlayer_3d"));
        this.addOrRemoveFolder("TimeLayer", "common:tree.subjectDataTime", this.get("overlayer_time"));

        this.addItem({
            type: "folder",
            name: i18next.t("common:tree.selectedTopics"),
            i18nextTranslate: function (setter) {
                if (typeof setter === "function" && i18next.exists("common:tree.selectedTopics")) {
                    setter("name", i18next.t("common:tree.selectedTopics"));
                }
            },
            glyphicon: "glyphicon-plus-sign",
            id: "SelectedLayer",
            parentId: "tree",
            isInThemen: true,
            isInitiallyExpanded: true,
            isAlwaysExpanded: isAlwaysExpandedList.includes("SelectedLayer"),
            level: 0,
            quickHelp: isQuickHelpSet
        });
    },

    /**
     * Adds or removes a folder for 3d data or WMS-T for the topic tree considering the type of the tree.
     *
     * @param {String} id Id of the folder which should be added or removed.
     * @param {String} defaultTranslationKey Default translation key for the given folder.
     * @param {Object} overLayer Contains the layers for either the 3D Mode or WMS-T.
     * @fires Core.ModelList#RadioTriggerModelListRemoveModelsById
     * @fires Core#RadioRequestUtilIsViewMobile
     * @returns {void}
     */
    addOrRemoveFolder: function (id, defaultTranslationKey, overLayer) {
        // The folder for the 3D data is disabled on mobile whereas the other folders (e.g. TimeLayers) are enabled
        const enabled = id === "3d_daten" ? !Radio.request("Util", "isViewMobile") : true;

        if (enabled && overLayer !== undefined) {
            const name = overLayer?.name ? overLayer.name : null;

            this.addItemByPosition({
                type: "folder",
                name: name ? name : i18next.t(defaultTranslationKey),
                i18nextTranslate: (setter) => {
                    if (typeof setter === "function") {
                        if (name) {
                            setter("name", i18next.exists(name) ? i18next.t(name) : name);
                        }
                        else if (i18next.exists(defaultTranslationKey)) {
                            setter("name", i18next.t(defaultTranslationKey));
                        }
                    }
                },
                id,
                parentId: "tree",
                isInThemen: true,
                isInitiallyExpanded: false,
                level: 0,
                quickHelp: store.getters["QuickHelp/isSet"]
            }, this.postionForFolder(this.getPreviousFolderName(id)));
        }
        else {
            this.removeItem(id);
            Radio.trigger("ModelList", "removeModelsById", id);
        }
    },

    /**
     * Receive the position where a folder has to be inserted in the itemList.
     *
     * @param {String} previousFolderName Name of the previous folder in the tree
     * @returns {Number} Position for the folder after the folder with the given name.
     */
    postionForFolder: function (previousFolderName) {
        const itemList = this.get("itemList"),
            index = itemList.findIndex(item => item.name === previousFolderName);

        return index > -1 ? index + 1 : itemList.length + 1;
    },
    /**
     * Returns the folder that should be before the folder with the id.
     *
     * @param {String} id Id of the folder that should be added.
     * @returns {String} Name of the previous folder in the tree.
     */
    getPreviousFolderName (id) {
        switch (id) {
            case "3d_daten":
                return "Hintergrundkarten";
            case "TimeLayer":
                return "Fachdaten";
            default:
                return "Fachdaten";
        }
    },

    /**
     * Groups objects from the layerlist that match the IDs in the passed list.
     * @param  {string[]} [ids=[]] - Array of ids whose objects are grouped together
     * @param  {Object[]} [layerlist=[]] - Objects from the services.json
     * @return {Object[]} layerlist - Objects from the services.json
     */
    mergeObjectsByIds: function (ids = [], layerlist = []) {
        const objectsByIds = [],
            maxScales = [],
            minScales = [];
        let newObject = {};

        // Objekte die gruppiert werden
        ids.forEach(id => {
            const lay = layerlist.find(layer => layer.id === id);

            if (lay) {
                objectsByIds.push(lay);
            }
        });

        // Wenn nicht alle LayerIDs des Arrays gefunden werden
        if (objectsByIds.length !== ids.length) {
            return null;
        }
        // Das erste Objekt wird kopiert
        newObject = {...objectsByIds[0]};
        // Das Attribut layers wird gruppiert und am kopierten Objekt gesetzt
        newObject.layers = objectsByIds.map(value => value.layers).toString();
        // Das Attribut maxScale wird gruppiert
        // Am kopierten Objekt wird der höchste Wert gesetzt
        objectsByIds.forEach(object => maxScales.push(parseInt(object.maxScale, 10)));
        newObject.maxScale = Math.max(...maxScales);

        // Das Attribut minScale wird gruppiert
        // Am kopierten Objekt wird der niedrigste Wert gesetzt
        objectsByIds.forEach(object => minScales.push(parseInt(object.minScale, 10)));
        newObject.minScale = Math.min(...minScales);

        return newObject;
    },

    /**
     * Generates a Uniq ID with prefix
     * Before that, all spaces are removed from the prefix.
     * @param  {String} value - Prefix for Uniq-Id
     * @return {String} value - Uniq-Id
     */
    createUniqId: function (value) {
        const trimmedValue = value.replace(/[^a-zA-Z0-9]/g, "");

        return Radio.request("Util", "uniqueId", trimmedValue);
    },

    /**
     * todo
     * @param {*} metaID - todo
     * @returns {*} todo
     */
    getItemsByMetaID: function (metaID) {
        const layers = this.get("itemList").filter(function (item) {
            if (item.type === "layer") {
                if (item.datasets && item.datasets.length > 0) {
                    return item.datasets[0].md_id === metaID;
                }
            }
            return false;
        }, this);

        return layers;
    },

    /**
     * Returns the initial visible baselayer from config.json.
     * for array several id only the first one is passed
     * @return {String} layer initial visible baselayer
     */
    getInitVisibBaselayer: function () {
        const layer = this.get("baselayer").Layer.find(singleLayer => singleLayer.visibility === true);

        if (layer === undefined) {
            return undefined;
        }

        if (Array.isArray(layer.id)) {
            layer.id = layer.id[0];
        }
        return layer;
    },

    /**
     * Setter for attribute "itemList"
     * @param {*} value - todo
     * @returns {void}
     */
    setItemList: function (value) {
        this.set("itemList", value);
    },

    /**
     * Setter for attribute "itemList"
     * @param {*} value - todo
     * @returns {void}
     */
    setBaselayer: function (value) {
        this.set("baselayer", value);
    },

    /**
     * Setter for attribute "overlayer"
     * @param {*} value - todo
     * @returns {void}
     */
    setOverlayer: function (value) {
        this.set("overlayer", value);
    },

    /**
     * Setter for attribute "treeType"
     * @param {*} value - todo
     * @returns {void}
     */
    setTreeType: function (value) {
        this.set("treeType", value);
    },

    /**
     * Setter for attribute "category"
     * @param {*} value - todo
     * @returns {void}
     */
    setCategory: function (value) {
        this.set("category", value);
    }
});

export default Parser;
