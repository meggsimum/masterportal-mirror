import Item from ".././item";
import store from "../../../../src/app-store";

const Layer = Item.extend(/** @lends Layer.prototype */{
    defaults: {
        channel: Radio.channel("Layer"),
        hitTolerance: 0,
        isNeverVisibleInTree: false,
        isRemovable: false,
        isSelected: false,
        isSettingVisible: false,
        isVisibleInMap: false,
        layerInfoClicked: false,
        singleBaselayer: false,
        legend: true,
        maxScale: "1000000000",
        minScale: "0",
        selectionIDX: 0,
        showSettings: true,
        styleable: false,
        supported: ["2D"],
        transparency: 0,
        isOutOfRange: undefined,
        currentLng: "",
        selectedTopicsText: "",
        infosAndLegendText: "",
        removeTopicText: "",
        showTopicText: "",
        securedTopicText: "",
        changeClassDivisionText: "",
        settingsText: "",
        transparencyText: "",
        increaseTransparencyText: "",
        reduceTransparencyText: "",
        removeLayerText: "",
        levelUpText: "",
        levelDownText: "",
        isSecured: false
    },
    /**
     * @class Layer
     * @abstract
     * @description Module to represent any layer
     * @extends Item
     * @memberof Core.ModelList.Layer
     * @constructs
     * @property {Radio.channel} channel=Radio.channel("Layer") Radio channel of layer
     * @property {Boolean} isVisibleInMap=false Flag if layer is visible in map
     * @property {Boolean} isSelected=false Flag if model is selected in layer tree
     * @property {Boolean} isSettingVisible=false Flag if settings (transparency,...) are visible in tree
     * @property {Number} transparency=0 Transparency in percent
     * @property {Number} selectionIDX=0 Index of rendering order in layer selection
     * @property {Boolean} layerInfoClicked=false Flag if layerInfo was clicked
     * @property {Boolean} singleBaselayer=false - Flag if only a single baselayer should be selectable at once
     * @property {String} minScale="0" Minimum scale for layer to be displayed
     * @property {String} maxScale="1000000" Maximum scale for layer to be displayed
     * @property {String} legend=true Legend for layer
     * @property {String[]} supported=["2D"] Array of Strings to show supported modes "2D" and "3D"
     * @property {Boolean} showSettings=true Flag if layer settings have to be shown
     * @property {Number} hitTolerance=0 Hit tolerance used by layer for map interaction
     * @property {Boolean} styleable=false Flag if wms layer can be styleable via stylewms tool
     * @property {Boolean} isNeverVisibleInTree=false Flag if layer is never visible in layertree
     * @property {String} currentLng="" contains the current language
     * @property {String} isOutOfRange="" will be translated
     * @property {String} selectedTopicsText="" will be translated
     * @property {String} infosAndLegendText="" will be translated
     * @property {String} removeTopicText="" will be translated
     * @property {String} showTopicText="" will be translated
     * @property {String} securedTopicText="" will be translated
     * @property {String} changeClassDivisionText="" will be translated
     * @property {String} settingsText="" will be translated
     * @property {String} transparencyText="" will be translated
     * @property {String} increaseTransparencyText="" will be translated
     * @property {String} reduceTransparencyText="" will be translated
     * @property {String} removeLayerText="" will be translated
     * @property {String} levelUpText="" will be translated
     * @property {String} levelDownText="" will be translated
     * @property {Boolean} isSecured=false flag if the layer is secured
     * @fires Map#RadioTriggerMapAddLayerToIndex
     * @fires Layer#RadioTriggerVectorLayerFeaturesLoaded
     * @fires Layer#RadioTriggerVectorLayerFeatureUpdated
     * @fires Core#RadioRequestMapViewGetResolutionByScale
     * @fires Alerting#RadioTriggerAlertAlert
     * @fires LegendComponent:RadioTriggerLegendComponentUpdateLegend
     * @listens Layer#changeIsSelected
     * @listens Layer#changeIsVisibleInMap
     * @listens Layer#changeTransparency
     * @listens Layer#RadioTriggerLayerUpdateLayerInfo
     * @listens Layer#RadioTriggerLayerSetLayerInfoChecked
     * @listens Core#RadioTriggerMapChange
     * @listens Core#RadioTriggerMapViewChangedOptions
     * @listens i18next#RadioTriggerLanguageChanged
     */
    initialize: function () {
        const portalConfig = Radio.request("Parser", "getPortalConfig");

        this.get("channel").on({
            "prepareLayerObject": function (layer) {
                if (layer) {
                    layer.prepareLayerObject();
                }
            }
        });

        // prevents the use of the isSecured parameter for layers other than WMS and WFS
        if (this.get("typ") !== "WMS" && this.get("typ") !== "WFS" && this.get("isSecured") === true) {
            this.setIsSecured(false);
        }

        if (portalConfig && portalConfig.singleBaselayer !== undefined) {
            this.setSingleBaselayer(portalConfig.singleBaselayer);
        }

        this.registerInteractionTreeListeners(this.get("channel"));
        this.registerInteractionMapViewListeners();

        //  add layer, when it should be initially visible
        if (this.get("isSelected") === true || Radio.request("Parser", "getTreeType") === "light") {

            this.prepareLayerObject();

            this.setIsVisibleInMap(this.get("isSelected"));
            this.setIsRemovable(Radio.request("Parser", "getPortalConfig").layersRemovable);
            this.toggleWindowsInterval();
        }
        this.listenTo(Radio.channel("i18next"), {
            "languageChanged": this.changeLang
        });

        this.changeLang();
    },

    /**
     * change language - sets default values for the language
     * @param {String} lng the language changed to
     * @returns {Void} -
     */
    changeLang: function (lng) {
        /* eslint-disable consistent-this */
        const model = this;

        this.set({
            selectedTopicsText: i18next.t("common:tree.removeSelection"),
            infosAndLegendText: i18next.t("common:tree.infosAndLegend"),
            removeTopicText: i18next.t("common:tree.removeTopic"),
            showTopicText: i18next.t("common:tree.showTopic"),
            securedTopicText: i18next.t("common:tree.securedTopic"),
            changeClassDivisionText: i18next.t("common:tree.changeClassDivision"),
            settingsText: i18next.t("common:tree.settings"),
            increaseTransparencyText: i18next.t("common:tree.increaseTransparency"),
            reduceTransparencyText: i18next.t("common:tree.reduceTransparency"),
            removeLayerText: i18next.t("common:tree.removeLayer"),
            levelUpText: i18next.t("common:tree.levelUp"),
            levelDownText: i18next.t("common:tree.levelDown"),
            transparencyText: i18next.t("common:tree.transparency"),
            currentLng: lng
        });
        // translate name, key is defined in config.json
        if (this.has("i18nextTranslate") && typeof this.get("i18nextTranslate") === "function") {
            this.get("i18nextTranslate")(function (key, value) {
                if (!model.has(key) || typeof value !== "string") {
                    return;
                }
                model.set(key, value);
            });
        }
    },

    /**
     * Checks if dataLayerId matches the given layer id.
     * @param {String} dataLayerId Id of dataLayer whose features are requested.
     * @param {String} layerId Id of current layer.
     * @returns {Boolean} - flag if dataLayerId matches given layer id.
     */
    checkIfDataLayer: function (dataLayerId, layerId) {
        let isDataLayer = false;

        if (dataLayerId === layerId) {
            isDataLayer = true;
        }
        return isDataLayer;
    },
    /**
     * Prüft anhand der Scale ob der Layer sichtbar ist oder nicht
     * @param {object} options -
     * @returns {void}
     **/
    checkForScale: function (options) {
        if (options && parseFloat(options.scale, 10) <= parseInt(this.get("maxScale"), 10) && parseFloat(options.scale, 10) >= parseInt(this.get("minScale"), 10)) {
            this.setIsOutOfRange(false);
        }
        else {
            this.setIsOutOfRange(true);
        }
    },

    /**
     * Triggers event if vector features are loaded
     * @param {ol.Feature[]} features Loaded vector features
     * @fires Layer#RadioTriggerVectorLayerFeaturesLoaded
     * @return {void}
     */
    featuresLoaded: function (features) {
        Radio.trigger("VectorLayer", "featuresLoaded", this.get("id"), features);
    },

    /**
     * Prepares the given features and sets or/and overwrites the coordinates based on the configuration of "altitude" and "altitudeOffset".
     * @param {ol/Feature[]} features The olFeatures.
     * @returns {void}
     */
    prepareFeaturesFor3D: function (features) {
        const altitude = this.get("altitude"),
            altitudeOffset = this.get("altitudeOffset");

        features.forEach(feature => {
            let geometry = feature.getGeometry();

            if (altitude || altitudeOffset) {
                geometry = this.setAltitudeOnGeometry(geometry, altitude, altitudeOffset);
            }
            feature.setGeometry(geometry);
        });
    },

    /**
     * Sets the altitude and AltitudeOffset as z coordinate.
     * @param {ol/geom} geometry Geometry of feature.
     * @param {Number} altitude Altitude. Overwrites the given z coord if available.
     * @param {Number} altitudeOffset Altitude offset.
     * @returns {ol/geom} - The geometry with newly set coordinates.
     */
    setAltitudeOnGeometry: function (geometry, altitude, altitudeOffset) {
        const type = geometry.getType(),
            coords = geometry.getCoordinates();

        let overwrittenCoords = [];

        if (type === "Point") {
            overwrittenCoords = this.setAltitudeOnPoint(coords, altitude, altitudeOffset);
        }
        else if (type === "MultiPoint") {
            overwrittenCoords = this.setAltitudeOnMultiPoint(coords, altitude, altitudeOffset);
        }
        else {
            console.error("Type: " + type + " is not supported yet for function \"setAltitudeOnGeometry\"!");
        }

        geometry.setCoordinates(overwrittenCoords);

        return geometry;
    },

    /**
     * Sets the altitude on multipoint coordinates.
     * @param {Number[]} coords Coordinates.
     * @param {Number} altitude Altitude. Overwrites the given z coord if available.
     * @param {Number} altitudeOffset Altitude offset.
     * @returns {Number[]} - newly set cooordinates.
     */
    setAltitudeOnMultiPoint: function (coords, altitude, altitudeOffset) {
        const overwrittenCoords = [];

        coords.forEach(coord => {
            overwrittenCoords.push(this.setAltitudeOnPoint(coord, altitude, altitudeOffset));
        });

        return overwrittenCoords;
    },

    /**
     * Sets the altitude on point coordinates.
     * @param {Number[]} coords Coordinates.
     * @param {Number} altitude Altitude. Overwrites the given z coord if available.
     * @param {Number} altitudeOffset Altitude offset.
     * @returns {Number[]} - newly set cooordinates.
     */
    setAltitudeOnPoint: function (coords, altitude, altitudeOffset) {
        const overwrittenCoords = coords,
            altitudeAsFloat = parseFloat(altitude),
            altitudeOffsetAsFloat = parseFloat(altitudeOffset);

        if (!isNaN(altitudeAsFloat)) {
            if (overwrittenCoords.length === 2) {
                overwrittenCoords.push(altitudeAsFloat);
            }
            else if (overwrittenCoords.length === 3) {
                overwrittenCoords[2] = altitudeAsFloat;
            }
        }
        if (!isNaN(altitudeOffsetAsFloat)) {
            if (overwrittenCoords.length === 2) {
                overwrittenCoords.push(altitudeOffsetAsFloat);
            }
            else if (overwrittenCoords.length === 3) {
                overwrittenCoords[2] = overwrittenCoords[2] + altitudeOffsetAsFloat;
            }
        }
        return overwrittenCoords;
    },

    /**
     * Triggers event if vector feature is loaded
     * @param {ol.Feature} feature Updated vector feature
     * @fires Layer#RadioTriggerVectorLayerFeatureUpdated
     * @return {void}
     */
    featureUpdated: function (feature) {
        Radio.trigger("VectorLayer", "featureUpdated", this.get("id"), feature);
    },

    /**
     * Process function. Calls smaller function to prepare and create layer object
     * @returns {void}
     */
    prepareLayerObject: function () {
        this.createLayerSource();
        this.createLayer();
        this.updateLayerTransparency();
        this.getResolutions();
        this.checkForScale(Radio.request("MapView", "getOptions"));
    },

    /**
     * Register interaction with layer tree.<br>
     * @listens Layer#event:changeIsSelected
     * @listens Layer#event:changeIsVisibleInMap
     * @listens Layer#event:changeTransparency
     * @listens Layer#event:RadioTriggerLayerUpdateLayerInfo
     * @listens Layer#event:RadioTriggerLayerSetLayerInfoChecked
     * @listens Core#RadioTriggerMapChange
     * @fires LegendComponent:RadioTriggerLegendComponentUpdateLegend
     * @param {Radio.channel} channel Radio channel of this module
     * @return {void}
     */
    registerInteractionTreeListeners: function (channel) {
        // on treetype: "light" all layers are loaded initially
        if (Radio.request("Parser", "getTreeType") !== "light") {
            this.listenToOnce(this, {
                // LayerSource is created on first select
                "change:isSelected": function () {
                    if (!this.isLayerSourceValid()) {
                        this.prepareLayerObject();
                    }
                }
            });
        }
        else if (
            (this.get("typ") === "WFS" || this.get("typ") === "GeoJSON")
            && Radio.request("Parser", "getTreeType") === "light"
        ) {
            this.listenToOnce(this, {
                // data will be loaded at first selection
                "change:isSelected": function () {
                    this.updateSource(true);
                }
            });
        }

        this.listenTo(channel, {
            "setLayerInfoChecked": function (layerInfoChecked) {
                this.setLayerInfoChecked(layerInfoChecked);
            },
            "toggleIsSelected": function () {
                this.toggleIsSelected();
            }
        });
        this.listenTo(Radio.channel("Map"), {
            "change": function (mode) {
                if (this.get("supported").indexOf(mode) >= 0) {
                    if (this.get("isVisibleInMap")) {
                        this.setVisible(true);
                    }
                }
                else if (this.isLayerValid()) {
                    this.setVisible(false);
                }
            }
        });
        this.listenTo(this, {
            "change:isVisibleInMap": function () {
                // triggert das Ein- und Ausschalten von Layern
                Radio.trigger("Layer", "layerVisibleChanged", this.get("id"), this.get("isVisibleInMap"), this);
                this.toggleWindowsInterval();
                this.toggleAttributionsInterval();
            },
            "change:isSelected": function () {
                this.toggleLayerOnMap();
            },
            "change:transparency": this.updateLayerTransparency,
            "change:legend": function () {
                Radio.trigger("LegendComponent", "updateLegend");
            }
        });
    },

    /**
     * Register interaction with map view.
     * @listens Core#RadioTriggerMapViewChangedOptions
     * @returns {void}
     */
    registerInteractionMapViewListeners: function () {
        // Dieser Listener um eine Veränderung des angezeigten Maßstabs
        this.listenTo(Radio.channel("MapView"), {
            "changedOptions": function (options) {
                this.checkForScale(options);
            }
        });
    },

    /**
     * Setter of window interval. Binds this to func.
     * @param {function} func Function, to be executed in this
     * @param {integer} autorefreshInterval Intervall in ms
     * @returns {void}
     */
    setWindowsInterval: function (func, autorefreshInterval) {
        this.set("windowsInterval", setInterval(func.bind(this), autorefreshInterval));
    },

    /**
     * Callback for layer interval
     * @returns {void}
     */
    intervalHandler: function () {
        this.updateSource();
    },


    /**
     * Sets visible min and max resolution on layer.
     * @fires Core#RadioRequestMapViewGetResolutionByScale
     * @returns {void}
     */
    getResolutions: function () {
        const resoByMaxScale = Radio.request("MapView", "getResolutionByScale", this.get("maxScale"), "max"),
            resoByMinScale = Radio.request("MapView", "getResolutionByScale", this.get("minScale"), "min");

        this.setMaxResolution(resoByMaxScale + (resoByMaxScale / 100));
        this.setMinResolution(resoByMinScale);
    },

    /**
     * Increases layer transparency by 10 percent
     * @return {void}
     */
    incTransparency: function () {
        const transparency = parseInt(this.get("transparency"), 10);

        if (transparency <= 90) {
            this.setTransparency(transparency + 10);
        }
    },

    /**
     * Decreases layer transparency by 10 percent
     * @return {void}
     */
    decTransparency: function () {
        const transparency = parseInt(this.get("transparency"), 10);

        if (transparency >= 10) {
            this.setTransparency(transparency - 10);
        }
    },

    /**
     * Toggles the attribute isSelected.
     * If configured and the layer is a baseLayer, the other selected baseLayers are deselected.
     *
     * @returns {void}
     */
    toggleIsSelected: function () {
        const id = this.get("id"),
            layerGroup = Radio.request("ModelList", "getModelsByAttributes", {parentId: this.get("parentId")}),
            singleBaselayer = this.get("singleBaselayer") && this.get("parentId") === "Baselayer";

        this.setIsSelected(!this.get("isSelected"));

        if (this.get("isSelected")) {
            // This only works for treeType 'custom', otherwise the parentId is not set on the layer
            if (singleBaselayer) {
                layerGroup.forEach(layer => {
                    // folders parentId is baselayer too, but they have not a function checkForScale
                    if (layer.get("id") !== id && typeof layer.checkForScale === "function") {
                        layer.setIsSelected(false);
                        // This makes sure that the Oblique Layer, if present in the layerList, is not selectable if switching between baseLayers
                        layer.checkForScale(Radio.request("MapView", "getOptions"));
                    }
                });
            }
        }
    },

    /**
     * Toggles the attribute isVisibleInMap
     * @return {void}
     */
    toggleIsVisibleInMap: function () {
        if (this.get("isVisibleInMap") === true) {
            this.setIsVisibleInMap(false);
        }
        else {
            this.setIsSelected(true);
            this.setIsVisibleInMap(true);
        }
    },

    /**
     * Toggles the layer interval based on attribute isVisibleInMap
     * The autoRefresh interval has to be >500 , because of performance issues
     * @returns {void}
     */
    toggleWindowsInterval: function () {
        const isVisible = this.get("isVisibleInMap"),
            autoRefresh = this.get("autoRefresh");

        if (isVisible === true) {
            if (autoRefresh > 500) {
                this.setWindowsInterval(this.intervalHandler, autoRefresh);
            }
        }
        else if (typeof this.get("windowsInterval") === "object") {
            clearInterval(this.get("windowsInterval"));
        }
    },
    /**
     * Toggles the attribute isSettingVisible
     * @return {void}
     */
    toggleIsSettingVisible: function () {
        if (this.get("isSettingVisible") === true) {
            this.setIsSettingVisible(false);
        }
        else {
            // setzt vorher alle Models auf false, damit immer nur eins angezeigt wird
            this.collection.setIsSettingVisible(false);
            this.setIsSettingVisible(true);
        }
    },
    /**
     * Adds or removes layer from map, depending on attribute isSelected
     * @returns {void}
     */
    toggleLayerOnMap: function () {
        if (Radio.request("Parser", "getTreeType") !== "light") {
            if (this.get("isSelected") === true) {
                Radio.trigger("Map", "addLayerToIndex", [this.get("layer"), this.get("selectionIDX")]);
            }
            else {
                // model.collection besser?!
                Radio.trigger("Map", "removeLayer", this.get("layer"));
            }
        }
    },

    /**
     * If attribution is defined as an object, then the attribution are requested in given intervals, as long as "isVisibleInMap" is true
     * Is used for Verkehrslage auf den Autobahnen
     * @returns {void}
     */
    toggleAttributionsInterval: function () {
        let channelName, eventName, timeout;

        if (this.has("layerAttribution") && typeof this.get("layerAttribution") === "object") {
            channelName = this.get("layerAttribution").channel;
            eventName = this.get("layerAttribution").eventname;
            timeout = this.get("layerAttribution").timeout;

            if (this.get("isVisibleInMap") === true) {

                Radio.trigger(channelName, eventName, this);
                this.get("layerAttribution").interval = setInterval(function (model) {
                    Radio.trigger(channelName, eventName, model);
                }, timeout, this);
            }
            else {
                clearInterval(this.get("layerAttribution").interval);
            }
        }
    },

    /**
     * Transforms transparency into opacity and sets opacity on layer
     * @return {void}
     */
    updateLayerTransparency: function () {
        const opacity = (100 - this.get("transparency")) / 100;

        // Auch wenn die Layer im simple Tree noch nicht selected wurde können
        // die Settings angezeigt werden. Das Layer objekt wurden dann jedoch noch nicht erzeugt und ist undefined
        if (typeof this.get("layer") === "object") {
            this.get("layer").setOpacity(opacity);
        }
    },
    /**
     * Initiates the presentation of layer information.
     * @returns {void}
     */
    showLayerInformation: function () {
        let cswUrl = null,
            showDocUrl = null,
            layerMetaId = null;

        if (this.get("datasets") && Array.isArray(this.get("datasets")) && this.get("datasets")[0] !== null && typeof this.get("datasets")[0] === "object") {
            cswUrl = this.get("datasets")[0]?.csw_url ? this.get("datasets")[0].csw_url : null;
            showDocUrl = this.get("datasets")[0]?.show_doc_url ? this.get("datasets")[0].show_doc_url : null;
            layerMetaId = this.get("datasets")[0]?.md_id ? this.get("datasets")[0].md_id : null;
        }
        const metaID = [],
            name = this.get("name");

        metaID.push(layerMetaId);

        store.dispatch("LayerInformation/layerInfo", {
            "id": this.get("id"),
            "metaID": layerMetaId,
            "metaIdArray": metaID,
            "layername": name,
            "url": this.get("url"),
            "typ": this.get("typ"),
            "cswUrl": cswUrl,
            "showDocUrl": showDocUrl,
            "urlIsVisible": this.get("urlIsVisible")
        });

        store.dispatch("LayerInformation/activate", true);
        store.dispatch("LayerInformation/additionalSingleLayerInfo");
        store.dispatch("LayerInformation/setMetadataURL", layerMetaId);
        store.dispatch("Legend/setLayerIdForLayerInfo", this.get("id"));
        store.dispatch("Legend/setLayerCounterIdForLayerInfo", Date.now());

        if (this.createLegend && typeof this.createLegend === "function") {
            this.createLegend();
        }
        this.setLayerInfoChecked(true);
    },

    /**
     * Checks if the layer has been setup and a layer object exist
     * @returns {Boolean} -
     */
    isLayerValid: function () {
        return this.get("layer") !== undefined;
    },

    /**
     * Checks if the layerSource has been setup and a layersource object exist
     * @returns {Boolean} -
     */
    isLayerSourceValid: function () {
        return typeof this.get("layerSource") === "object";
    },

    /**
     * Calls Collection function moveModelDown
     * @return {void}
     */
    moveDown: function () {
        this.collection.moveModelInTree(this, -1);
    },

    /**
     * Calls Collection function moveModelUp
     * @return {void}
     */
    moveUp: function () {
        this.collection.moveModelInTree(this, 1);
    },

    /**
     * Setter for selectionIDX
     * @param {String} value SelectionIDX
     * @returns {void}
     */
    setSelectionIDX: function (value) {
        this.set("selectionIDX", value);
    },

    /**
     * Setter for isSecured
     * @param {Boolean} value Flag if layer is secured
     * @returns {void}
     */
    setIsSecured: function (value) {
        this.set("isSecured", value);
    },

    /**
     * Resets selectionIDX property; 0 is defined as initial value and the layer will be acknowledged as
     * newly added for the sake of initial positioning
     * @returns {void}
     */
    resetSelectionIDX: function () {
        this.set("selectionIDX", 0);
    },

    /**
     * Setter for layerInfoChecked
     * @param {Boolean} value Flag if layerInfo was checked
     * @returns {void}
     */
    setLayerInfoChecked: function (value) {
        this.set("layerInfoChecked", value);
    },

    /**
     * Setter for layerSource
     * @param {ol/source} value LayerSource
     * @returns {void}
     */
    setLayerSource: function (value) {
        this.set("layerSource", value);
    },

    /**
     * Setter for layer
     * @param {ol/layer} value Layer
     * @returns {void}
     */
    setLayer: function (value) {
        this.set("layer", value);
    },

    /**
     * Setter for isVisibleInMap and setter for layer.setVisible
     * @param {Boolean} value Flag if layer is visible in map
     * @returns {void}
     */
    setIsVisibleInMap: function (value) {
        this.set("isVisibleInMap", value);
        this.setVisible(value);
    },

    /**
     * Setter for isSelected
     * @param {Boolean} value Flag if layer is selected
     * @returns {void}
     */
    setIsSelected: function (value) {
        this.set("isSelected", value);
    },

    /**
     * Setter for isSettingVisible
     * @param {Boolean} value Flag if layer settings are visible
     * @returns {void}
     */
    setIsSettingVisible: function (value) {
        this.set("isSettingVisible", value);
    },

    /**
     * Setter for transparency
     * @param {Number} value Tranparency in percent
     * @returns {void}
     */
    setTransparency: function (value) {
        this.set("transparency", value);
    },

    /**
     * Setter for isOutOfRange
     * @param {Boolean} value Flag if map Scale is out of defined layer minScale and maxScale
     * @returns {void}
     */
    setIsOutOfRange: function (value) {
        this.set("isOutOfRange", value);
    },

    /**
     * Setter for ol/layer.setMaxResolution
     * @param {Number} value Maximum resolution of layer
     * @returns {void}
     */
    setMaxResolution: function (value) {
        this.get("layer").setMaxResolution(value);
    },

    /**
     * Setter for ol/layer.setMinResolution
     * @param {Number} value Minimum resolution of layer
     * @returns {void}
     */
    setMinResolution: function (value) {
        this.get("layer").setMinResolution(value);
    },

    /**
     * Setter for name
     * @param {String} value Name of layer
     * @returns {void}
     */
    setName: function (value) {
        this.set("name", value);
    },

    /**
     * Setter for legend, commits the legend to vue store using "Legend/setLegendOnChanged"
     * @param {String} value legend
     * @returns {void}
     */
    setLegend: function (value) {
        this.set("legend", value);
        store.dispatch("Legend/setLegendOnChanged", value);
    },

    /**
     * Setter for isVisibleInTree
     * @param {Boolean} value Flag if layer is visible in tree
     * @returns {void}
     */
    setIsVisibleInTree: function (value) {
        this.set("isVisibleInTree", value);
    },

    /**
     * Setter for the singleBaselayer
     *
     * @param {Boolean} value - Flag if only a single baselayer should be selectable at once
     * @returns {void}
     */
    setSingleBaselayer: function (value) {
        this.set("singleBaselayer", value);
    },

    /**
     * Setter for isRemovable
     * @param {Boolean} value Flag if layer is removable from the tree
     * @returns {void}
     */
    setIsRemovable: function (value) {
        if (value !== undefined && value !== null && value !== "string") {
            this.set("isRemovable", value);
        }
    },

    /**
     * Setter for isJustAdded (currently only used in uiStyle = table)
     * @param {Boolean} value Flag if layer has just been added to the tree
     * @returns {void}
     */
    setIsJustAdded: function (value) {
        this.set("isJustAdded", value);
    },

    /**
     * Removes the layer from the map and the collection
     * @returns {void}
     */
    removeLayer: function () {
        const layerId = this.get("id");

        this.setIsVisibleInMap(false);
        this.collection.removeLayerById(layerId);
    },

    /**
     * Setter for the layer visibility
     * @param {Boolean} value new visibility value
     * @returns {void} -
     */
    setVisible: function (value) {
        this.get("layer").setVisible(value);
    },

    /**
     * refresh layerSource when updated
     * e.g. needed because wmts source is created asynchronously
     * @returns {void}
     */
    updateLayerSource: function () {
        const layer = Radio.request("Map", "getLayerByName", this.get("name"));

        if (this.get("layerSource") !== null) {
            layer.setSource(this.get("layerSource"));
            layer.getSource().refresh();
        }
    }

});

export default Layer;
