import Tool from "../../core/modelList/tool/model";
import {extractEventCoordinates} from "../../../src/utils/extractEventCoordinates";
import store from "../../../src/app-store";

const FeatureListerModel = Tool.extend(/** @lends FeatureListerModel.prototype */{
    defaults: Object.assign({}, Tool.prototype.defaults, {
        maxFeatures: 20, // über Config konfigurierbare Max-Anzahl an pro Layer geladenen Features
        isActive: false,
        layerlist: [], // Array aus {id, name, features}
        layerid: "", // ID des visibleLayer, der angezeigt werden soll.
        layer: {}, // Layer aus Layerlist mit gesuchter layerid
        headers: [], // Liste der Überschriften in Liste
        featureid: "", // ID des Features, das angezeigt werden soll.
        featureProps: {}, // Properties des Features mit gesuchter featureid
        highlightedFeature: null,
        highlightedFeatureStyle: null,
        glyphicon: "glyphicon-menu-hamburger",
        highlightVectorRulesPolygon: { // default style for highlighting polygons
            "fill": {
                "color": [255, 0, 255, 0.9]
            },
            "stroke": {
                "width": 4,
                "color": [0, 0, 204, 0.9]
            }
        },
        highlightVectorRulesPointLine: { // default style for highlighting lines and points
            "stroke": {
                "width": 8,
                "color": [255, 0, 255, 0.9]
            },
            "image": {
                "scale": 2
            }
        },
        // translations
        visibleVectorLayers: "",
        chooseTheme: "",
        list: "",
        details: "",
        more: "",
        detailsOfSelected: ""
    }),
    /**
     * @class FeatureListerModel
     * @extends Core.ModelList.Tool
     * @memberof FeatureLister
     * @constructs
     * @property {Number} maxFeatures=20 maximally loaded features per layer, can be configured
     * @property {Boolean} isActive=false Flag if the model is active
     * @property {Array} layerlist Array of {id, name, features}
     * @property {String} layerid="" id of visible Layer which shall be shown
     * @property {Core.ModelList.Layer} layer={} Layer of the layerlist with requested layerid
     * @property {Array} headers Array table headers in the list
     * @property {String} featureid="" id of the feature to be shown
     * @property {Object} featureProps={} Properties of the feature with requested featureid
     * @property {Object} highlightedFeature=null Feature that is currently highlighted
     * @property {Object} highlightedFeatureStyle=null Feature style of the currently highlighted feature
     * @property {String} glyphicon="glyphicon-menu-hamburger" id of the glyphicon to use in the template
     * @fires FeatureLister#changeLayerId
     * @fires FeatureLister#changeFeatureId
     * @fires FeatureLister#changeIsActive
     * @fires FeatureLister#changeLayerList
     * @fires FeatureLister#changeLayer
     * @fires FeatureLister#changeFeatureProps
     * @listens ModelList#RadioTriggerModelListUpdateVisibleInMapList
     * @listens Map#RadioTriggerMapSetGFIParams
     * @listens FeatureLister#changeLayerId
     * @listens FeatureLister#changeFeatureId
     * @listens i18next#RadioTriggerLanguageChanged
     */
    initialize: function () {
        this.superInitialize();

        if (this.has("lister") === true) {
            this.set("maxFeatures", this.get("lister"));
        }
        this.listenTo(Radio.channel("i18next"), {
            "languageChanged": this.changeLang
        });
        this.changeLang();

        Radio.on("VectorLayer", "featuresLoaded", this.checkVisibleLayer, this);
        Radio.on("Map", "setGFIParams", this.highlightMouseFeature, this); // wird beim Öffnen eines GFI getriggert
        this.listenTo(this, {"change:layerid": this.getLayerWithLayerId});
        this.listenTo(this, {"change:featureid": this.getFeatureWithFeatureId});

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
            "visibleVectorLayers": i18next.t("common:modules.tools.featureLister.visibleVectorLayers"),
            "chooseTheme": i18next.t("common:modules.tools.featureLister.chooseTheme"),
            "list": i18next.t("common:modules.tools.featureLister.list"),
            "details": i18next.t("common:modules.tools.featureLister.details"),
            "more": i18next.t("common:modules.tools.featureLister.more"),
            "detailsOfSelected": i18next.t("common:modules.tools.featureLister.detailsOfSelected"),
            "currentLng": lng
        });
    },

    /**
     * When a gfi opens, this function trys to find the corresponding feature in the list and select it
     * @param {Event} evt Event, which feature shall be highlighted
     * @fires FeatureLister#RadioTriggerGfiHit
     * @fires FeatureLister#RadioTriggerGfiClose
     * @return {void}
     */
    highlightMouseFeature: function (evt) {
        const features = this.get("layer").features,
            mapFeatures = evt[0],
            layername = this.get("layer").name;

        this.trigger("gfiClose"); // entfernt evtl. Highlights
        features.forEach(feature => {
            mapFeatures.forEach(mapFeature => {
                if (mapFeature.typ === "WFS" && mapFeature.name === layername) {
                    if (Radio.request("Util", "isEqual", feature.geometry, mapFeature.feature.getGeometry().getExtent())) {
                        this.trigger("gfiHit", feature);
                    }
                }
            }, this);
        }, this);
    },
    /**
     * Takes the selected feature, checks the properties and zooms to it
     * @fires Alerting#RadioTriggerAlertAlert
     * @return {void}
     */
    getFeatureWithFeatureId: function () {
        const featureid = this.get("featureid"),
            features = this.get("layer").features,
            feature = features.find(feat => {
                return feat.id.toString() === featureid;
            });
        let geometry,
            properties;

        if (feature) {
            geometry = feature.geometry;
            properties = feature.properties;

            // Zoom auf Extent
            if (geometry) {
                Radio.trigger("Map", "zoomToExtent", extractEventCoordinates(geometry));
            }
            else {
                Radio.trigger("Alert", "alert", {
                    text: i18next.t("common:modules.tools.featureLister.alert"),
                    kategorie: "alert-warning"
                });
            }
            // Zeigen der Details
            this.set("featureProps", properties);
        }
        else {
            this.set("featureProps", {});
        }
    },
    /**
     * Sets the style for highlighting of the selected feature depending on the geometryType.
     * @param {String} featureId id of the feature to highlight
     * @return {void}
     */
    highlightFeature: function (featureId) {
        const layer = this.get("layer"),
            featureWrapper = layer.features.find(feat => {
                return feat.id.toString() === featureId;
            }),
            styleObj = layer.geometryType.toLowerCase().indexOf("polygon") > -1 ? this.get("highlightVectorRulesPolygon") : this.get("highlightVectorRulesPointLine"),
            highlightObject = {
                type: layer.geometryType === "Point" || layer.geometryType === "MultiPoint" ? "increase" : "highlightPolygon",
                id: featureId,
                layer: layer,
                feature: featureWrapper.feature,
                scale: styleObj.image?.scale
            };

        if (highlightObject.type === "highlightPolygon") {
            highlightObject.highlightStyle = {
                fill: styleObj.fill,
                stroke: styleObj.stroke,
                image: styleObj.image
            };
        }

        store.dispatch("Map/highlightFeature", highlightObject);
    },
    /**
     * Scales the style of the deselected feature back to previous value
     * @return {void}
     */
    downlightFeature: function () {
        store.dispatch("Map/removeHighlightFeature", "decrease");
    },
    /**
     * Keeps the selected layer in mind
     * @return {void}
     */
    getLayerWithLayerId: function () {
        const layers = this.get("layerlist"),
            layer = Radio.request("Util", "findWhereJs", layers, {id: this.get("layerid")});


        // wenn Layer wechselt, kann auch kein Feature mehr aktiv sein.
        this.set("featureid", "");
        // Layer wegen Tab-switch-Reihenfolge erst hinterher setten.
        if (layer) {
            this.getFeatureList(this.get("layerid"));
            this.set("layer", layer);
        }
        else {
            this.set("layer", {});
        }
    },
    /**
     * Checks the layer list and adds new layers
     * @fires ModelList#RadioRequestModelListGetModelsByAttributes
     * @return {void}
     */
    checkVisibleLayer: function () {
        const layerlist = this.get("layerlist"),
            modelList = Radio.request("ModelList", "getModelsByAttributes", {isSelected: true, typ: "WFS"}),
            activeLayerId = this.get("layerid");

        // entferne nicht mehr sichtbare Layer
        layerlist.forEach(layer => {
            const tester = modelList.filter(function (lay) {
                return lay.id === layer.id;
            });

            if (tester.length === 0) {
                // layer ist nun nicht sichtbar...
                if (activeLayerId && activeLayerId === layer.id) {
                    // entfernter Layer wird in Tabelle angezeigt. Diese muss nun gelöscht werden.
                    this.set("layerid", "");
                }
                // ... und muss aus Liste entfernt werden
                this.removeLayerFromList(layer);
            }
        });
        // füge neue Layer hinzu
        modelList.forEach(layer => {
            const tester = layerlist.filter(function (lay) {
                return lay.id === layer.id;
            });

            if (tester.length === 0) {
                this.addLayerToList(layer);
            }
        });
    },
    /**
     * Removes no longer visible layers from the list
     * @param {Object} layer layer to remove from the list
     * @return {void}
     */
    removeLayerFromList: function (layer) {
        const layerlist = this.get("layerlist"),
            remainLayer = layerlist.filter(function (lay) {
                return lay.id !== layer.id;
            });

        this.unset("layerlist", {silent: true});
        this.set("layerlist", remainLayer);
    },
    /**
     * Gets the features from a layer when the layer is selected
     * @param {String} layerId id of the layer to read the features
     * @fires ModelList#RadioRequestModelListGetModelsByAttributes
     * @return {void}
     */
    getFeatureList: function (layerId) {
        const layerModel = Radio.request("ModelList", "getModelByAttributes", {id: layerId}),
            gfiAttributes = layerModel.get("gfiAttributes"),
            layerFromList = Radio.request("Util", "findWhereJs", this.get("layerlist"), {id: layerId}),
            features = layerModel.get("layer").getSource().getFeatures(),
            ll = [];

        // Es muss sichergetellt werden, dass auch Features ohne Geometrie verarbeitet werden können. Z.B. KitaEinrichtunen
        features.forEach((feature, index) => {
            let props, geom;

            if (feature.get("features")) {
                feature.get("features").forEach(feat => {
                    props = this.translateGFI([feat.getProperties()], gfiAttributes)[0];
                    geom = feat.getGeometry() ? feat.getGeometry().getExtent() : null;

                    ll.push({
                        id: index,
                        properties: props,
                        geometry: geom,
                        feature: feat
                    });
                });
            }
            else {
                props = this.translateGFI([feature.getProperties()], gfiAttributes)[0];
                geom = feature.getGeometry() ? feature.getGeometry().getExtent() : null;

                ll.push({
                    id: index,
                    properties: props,
                    geometry: geom,
                    feature: feature
                });
            }
        }, this);

        layerFromList.features = ll;
    },

    /**
     * identifies and extracts the features of the given layer.
     * @param {Array} gfiList - todo
     * @param {Object} gfiAttributes - todo
     * @param {string} typ - type of the layer/service
     * @return {string} - desc
     */
    translateGFI: function (gfiList, gfiAttributes) {
        const pgfi = [];

        gfiList.forEach(element => {
            const preGfi = {},
                gfi = {};
            let ignoredKeys = "";

            // get rid of invalid keys and keys with invalid values; trim values
            for (const [key, value] of Object.entries(element)) {
                ignoredKeys = Config.ignoredKeys ? Config.ignoredKeys : Radio.request("Util", "getIgnoredKeys");
                if (this.isValidKey(key, ignoredKeys) && this.isValidValue(value)) {
                    preGfi[key] = value.trim();
                }
            }
            if (gfiAttributes === "showAll") {
                for (const [key, value] of Object.entries(preGfi)) {
                    gfi[this.beautifyString(key)] = value;
                }
            }
            else {
                for (const [key, value] of Object.entries(gfiAttributes)) {
                    if (preGfi[key]) {
                        gfi[value] = preGfi[key];
                    }
                }
            }
            if (Object.keys(gfi).length !== 0) {
                pgfi.push(gfi);
            }
        });

        return pgfi;
    },

    /**
     * helper function: first letter becomes an upperCase, _ becomes a blank space
     * @param {string} str parameter
     * @returns {string} desc
     */
    beautifyString: function (str = "") {
        return str.substring(0, 1).toUpperCase() + str.substring(1).replace("_", " ");
    },

    /**
     * helper function: check, if key has a valid value
     * @param {string} key parameter
     * @param {string} ignoredKeys keys to ignore
     * @returns {boolean} desc
     */
    isValidKey: function (key, ignoredKeys) {
        if (ignoredKeys.indexOf(key.toUpperCase()) !== -1) {
            return false;
        }
        return true;
    },

    /**
     * helper function: check, if str has a valid value
     * @param {string} str parameter
     * @returns {boolean} desc
     */
    isValidValue: function (str) {
        if (str && typeof str.valueOf() === "string" && str !== "" && str.toUpperCase() !== "NULL") {
            return true;
        }
        return false;
    },

    /**
     * Adds layers to the list
     * @param {Object} layer layer to add to the list
     * @return {void}
     */
    addLayerToList: function (layer) {
        if (!layer) {
            return;
        }
        const layerlist = this.get("layerlist"),
            features = layer.get("layer").getSource().getFeatures();
        let geometryType = "none";

        if (features.length > 0) {
            geometryType = features[0].getGeometry().getType();
        }

        layerlist.push({
            id: layer.id,
            styleId: layer.get("styleId"),
            name: layer.get("name"),
            style: layer.get("style"),
            geometryType: geometryType
        });
        this.unset("layerlist", {silent: true});
        this.set("layerlist", layerlist);
        this.trigger("switchTabToTheme"); // bei zusätzlichen Layern soll sich gleich der Tab öffnen.
    },
    /**
     * setter for highlightedFeature
     * @param {Object} value feature to set as highlightedFeature
     * @return {void}
     */
    setHighlightedFeature: function (value) {
        this.set("highlightedFeature", value);
    },
    /**
     * setter for highlightedFeatureStyle
     * @param {Object} value style to set as highlightedFeatureStyle
     * @return {void}
     */
    setHighlightedFeatureStyle: function (value) {
        this.set("highlightedFeatureStyle", value);
    }
});

export default FeatureListerModel;
