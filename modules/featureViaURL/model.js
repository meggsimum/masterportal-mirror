import addGeoJSON from "../../src/utils/addGeoJSON.js";
import store from "../../src/app-store";

const FeatureViaURL = Backbone.Model.extend(/** @lends FeatureViaURL.prototype*/{
    defaults: {
        layerIds: [],
        // Translations
        coordLabel: "",
        featureLabel: "",
        folderName: "",
        typeLabel: ""
    },
    /**
     * @class FeatureViaURL
     * @description Creates a new GeoJSON layer on the basis of the given features by the user via the URL.
     * @extends Backbone.Model
     * @memberof FeatureViaURL
     * @param {object} config The configuration of the module from the config.js.
     * @constructs
     * @property {String[]} [layerIds=[]] The unique IDs of the GeoJSON layers which are added to the map.
     * @property {String} [coordLabel="Koordinaten"] The label for the coordinates of the features.
     * @property {String} [featureLabel="Beschriftung"] The label for the features.
     * @property {String} [folderName=""] The name of the folder in which the GeoJSON-Layers reside in the layertree.
     * @property {String} [typeLabel="Geometrietyp"] The label for the type of the features.
     * @fires Alerting#RadioTriggerAlertAlert
     * @fires Core#RadioRequestMapGetLayers
     * @fires Core#RadioRequestParametricURLGetFeatureViaURL
     * @fires Core.ConfigLoader#RadioRequestParserGetTreeType
     * @fires Core.ConfigLoader#RadioTriggerParserAddFolder
     * @listens i18next#RadioTriggerLanguageChanged
     */
    initialize: function (config) {
        if (!config || !Array.isArray(config.layers) || config.layers.length === 0) {
            Radio.trigger("Alert", "alert", i18next.t("common:modules.featureViaURL.messages.noLayers"));
            return;
        }
        this.listenTo(Radio.channel("i18next"), {
            "languageChanged": this.translate
        });

        /**
         * Calls the function createLayers.
         * @returns {void}
         */
        const callback = () => {
            this.createLayers(config);
        };

        Radio.once("ParametricURL", "ready", callback, this);
    },
    /**
     * Creates a basic GeoJSON structure and adds the features given by the user from the URL to it.
     *
     * @param {Object[]} features The features given by the user to be added to the map.
     * @param {String} geometryType Geometry type of the given features.
     * @param {Number} [epsg=4326] The EPSG-Code in which the features are coded.
     * @returns {Object} GeoJSON containing the features.
     */
    createGeoJSON: function (features, geometryType, epsg = 4326) {
        const geoJSON = {
            "type": "FeatureCollection",
            "crs": {
                "type": "link",
                "properties": {
                    "href": "http://spatialreference.org/ref/epsg/" + epsg + "/proj4/",
                    "type": "proj4"
                }
            },
            "features": []
        };
        let coordinates,
            featureJSON,
            flag = false;

        features.forEach(feature => {
            coordinates = feature.coordinates;
            if (!coordinates || !Array.isArray(coordinates) || coordinates.length === 0 || !feature.label) {
                flag = true;
                return;
            }

            featureJSON = {
                "type": "Feature",
                "geometry": {
                    "type": geometryType,
                    "coordinates": coordinates
                },
                "properties": {
                    "featureLabel": feature.label,
                    "coordLabel": coordinates,
                    "typeLabel": geometryType
                }
            };
            geoJSON.features.push(featureJSON);
        });

        if (flag) {
            console.warn(i18next.t("common:modules.featureViaURL.messages.featureParsing"));
        }

        return geoJSON;
    },
    /**
     * Creates the GeoJSON layers depending on the configuration and the URL-Parameters.
     *
     * @param {Object} config The configuration of this module from the config.js.
     * @param {Object[]} config.layers The layer configurations for the feature layers.
     * @param {Number} config.epsg The EPSG-Code in which the features are coded.
     * @param {String} config.zoomTo The Id of the layer on which features the extent is set on if not undefined.
     * @returns {void}
     */
    createLayers: function ({layers, epsg, zoomTo}) {
        const gfiAttributes = {
                featureLabel: this.get("featureLabel"),
                coordLabel: this.get("coordLabel"),
                typeLabel: this.get("typeLabel")
            },
            urlLayers = store.state.urlParams?.featureViaURL ? JSON.parse(store.state.urlParams?.featureViaURL) : [],
            treeType = Radio.request("Parser", "getTreeType");
        let features,
            geoJSON,
            geometryType,
            layerId,
            parentId = "tree",
            pos;

        if (treeType === "custom") {
            Radio.trigger("Parser", "addFolder", this.get("folderName"), "featureViaURLFolder", "Overlayer", 0, true, "modules.featureViaURL.folderName");
            parentId = "featureViaURLFolder";
        }

        urlLayers.forEach(layer => {
            layerId = layer.layerId;
            features = layer.features;
            pos = layers.findIndex(element => element.id === layerId);
            if (pos === -1) {
                console.error(i18next.t("common:modules.featureViaURL.messages.layerNotFound", {layerId}));
                return;
            }
            if (!layers[pos].name) {
                console.error(i18next.t("common:modules.featureViaURL.messages.noNameDefined", {layerId}));
                return;
            }
            geometryType = layer.type !== undefined ? layer.type : layers[pos].geometryType;
            if (geometryType !== "LineString" && geometryType !== "Point" && geometryType !== "Polygon" && geometryType !== "MultiPoint" && geometryType !== "MultiLineString" && geometryType !== "MultiPolygon") {
                console.error(i18next.t("common:modules.featureViaURL.messages.geometryNotSupported"), {layerId, geometryType});
                return;
            }
            if (!features || !Array.isArray(features) || features.length === 0) {
                Radio.trigger("Alert", "alert", i18next.t("common:modules.featureViaURL.messages.featureParsingAll"));
                return;
            }
            geoJSON = this.createGeoJSON(features, geometryType, epsg);
            if (geoJSON.features.length === 0) {
                Radio.trigger("Alert", "alert", i18next.t("common:modules.featureViaURL.messages.featureParsingNoneAdded"));
            }
            this.get("layerIds").push(layerId);
            addGeoJSON(layers[pos].name, layers[pos].id, geoJSON, layers[pos].styleId, parentId, gfiAttributes);
            if (typeof zoomTo !== "undefined" && (zoomTo === layerId || zoomTo.indexOf(layerId) !== -1)) {
                Radio.trigger("Map", "zoomToFilteredFeatures", this.getFeatureIds(layerId), layerId);
            }
        });
    },
    /**
     * Gets the layer for the given layerId and extracts the Ids of the features.
     *
     * @param {String} layerId Unique Id of the layer in which the features reside.
     * @returns {String[]} Array of FeatureIds.
     */
    getFeatureIds: function (layerId) {
        const featureArray = [],
            layer = Radio.request("Map", "getLayers").getArray().find(l => l.get("id") === layerId);

        if (typeof layer === "undefined") {
            console.warn(i18next.t("common:modules.featureViaURL.messages.layerNotFound"));
            return featureArray;
        }
        layer.getSource().getFeatures().forEach(feature => {
            featureArray.push(feature.getId());
        });
        return featureArray;
    },
    /**
     * Translates the values of this module, namely "coordLabel", "featureLabel", "folderName" and "typeLabel"
     * and updates the gfiAttributes on the added layers.
     *
     * @returns {void}
     */
    translate: function () {
        this.set("coordLabel", i18next.t("common:modules.featureViaURL.coordLabel"));
        this.set("featureLabel", i18next.t("common:modules.featureViaURL.featureLabel"));
        this.set("folderName", i18next.t("common:modules.featureViaURL.coordLabel"));
        this.set("typeLabel", i18next.t("common:modules.featureViaURL.typeLabel"));
        this.updateLayers();
    },
    /**
     * Updates the labels for the features for all layers.
     * NOTE: When the gfi-window is still open, the values are not yet translated.
     * It needs to be reopened so that the changes take effect.
     *
     * @returns {void}
     */
    updateLayers: function () {
        let layer;

        this.get("layerIds").forEach(id => {
            layer = Radio.request("Map", "getLayers").getArray().find(l => l.get("id") === id);
            if (typeof layer !== "undefined") {
                layer.get("gfiAttributes").featureLabel = this.get("featureLabel");
                layer.get("gfiAttributes").coordLabel = this.get("coordLabel");
                layer.get("gfiAttributes").typeLabel = this.get("typeLabel");
            }
        });
    }
});

export default FeatureViaURL;
