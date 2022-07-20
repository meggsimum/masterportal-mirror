import Layer from "./model";
import VectorSource from "ol/source/Vector.js";
import {Heatmap} from "ol/layer.js";

const HeatmapLayer = Layer.extend(/** @lends HeatmapLayer.prototype */{

    defaults: Object.assign({}, Layer.prototype.defaults, {
        attribute: "",
        value: "",
        radius: 10,
        blur: 15,
        gradient: [
            "#00f", "#0ff", "#0f0", "#ff0", "#f00"
        ]
    }),
    /**
     * @class HeatmapLayer
     * @description Module to represent HeatmapLayer
     * @extends Layer
     * @constructs
     * @memberof Core.ModelList.Layer
     * @property {String} attribute=[""] Attribute to filter by.
     * @property {String} value=[""] Value to filter by.
     * @property {Number} radius=10 Radius to calculate the heatmap.
     * @property {Number} blur=15 Blur for heatmap.
     * @property {String[]} gradient=["#00f","#0ff","#0f0","#ff0","#f00"] Gradient of colors for heatmap.
     * @listens Layer#RadioTriggerVectorLayerFeaturesLoaded
     * @listens Layer#RadioTriggerVectorLayerFeatureUpdated
     * @listens Layer#RadioTriggerVectorLayerResetFeatures
     * @fires Alerting#RadioTriggerAlertAlert
     * @fires Alerting#RadioTriggerAlertAlertRemove
     * @fires Core.ModelList#RadioRequestModelListGetModelByAttributes
     * @description This layer is used to generate a heatmap. It uses the features of a already configured vector layer such as WFS or Sensor.
     */
    initialize: function () {
        this.checkForScale(Radio.request("MapView", "getOptions"));

        if (!this.get("isChildLayer")) {
            Layer.prototype.initialize.apply(this);
        }
        this.listenTo(Radio.channel("VectorLayer"), {
            "featuresLoaded": this.loadInitialData,
            "featureUpdated": this.updateFeature,
            "resetFeatures": this.resetFeatures
        }, this);
    },

    resetFeatures: function (layerId, features) {
        const featureClones = [];

        if (this.checkDataLayerId(layerId)) {
            features.forEach(feature => {
                const clone = feature.clone();

                clone.setStyle(null);
                featureClones.push(clone);
            });
            this.get("layerSource").clear();
            this.initializeHeatmap(featureClones);
        }
    },

    /**
     * Loads the initial heatmap features.
     * @param {String} layerId Id of layer whose data has to be loaded.
     * @param {ol/Feature[]} features Features that have to be used for heatmap layer.
     * @fires Alerting#RadioTriggerAlertAlert
     * @fires Alerting#RadioTriggerAlertAlertRemove
     * @fires Core.ModelList#RadioRequestModelListGetModelByAttributes
     * @returns {void}
     */
    loadInitialData: function (layerId, features) {
        if (!layerId) {
            const dataLayer = Radio.request("ModelList", "getModelByAttributes", {id: this.get("dataLayerId")}),
                dataLayerNameOrId = dataLayer ? dataLayer.get("name") : this.get("dataLayerId"),
                dataLayerSource = dataLayer ? dataLayer.get("layerSource") : undefined,
                dataLayerFeatures = dataLayerSource ? dataLayerSource.getFeatures() : [];

            if (dataLayerFeatures.length > 0) {
                this.initializeHeatmap(dataLayerFeatures);
            }
            else {
                Radio.trigger("Alert", "alert", {
                    text: "<strong>Bitte aktivieren Sie den Layer \"" + dataLayerNameOrId + "\"</strong><br>" +
                    "Dieser liefert die Daten für den Heatmap-Layer :<br>" +
                    "\"" + this.get("name") + "\".",
                    kategorie: "alert-info",
                    id: "heatmap_" + this.get("id") + "_dataLayerId_" + this.get("dataLayerId")
                });
            }
        }
        if (this.checkDataLayerId(layerId)) {
            this.initializeHeatmap(features);
            Radio.trigger("Alert", "alert:remove", "heatmap_" + this.get("id") + "_dataLayerId_" + layerId);
        }
    },

    /**
     * Loads or updates the feature in the heatmap.
     * @param {String} layerId Id of layer whose data data has to be loaded
     * @param {ol/feature} feature  Feature that was updated.
     * @returns {void}
     */
    updateFeature: function (layerId, feature) {
        if (this.checkDataLayerId(layerId)) {
            this.updateHeatmap(feature);
        }
    },

    /**
     * Creates an empty vectorSource as the layer source.
     * @returns {void}
     */
    createLayerSource: function () {
        this.setLayerSource(new VectorSource());
        this.loadInitialData();
    },

    /**
     * Creates the heatmap layer.
     * @returns {void}
     */
    createLayer: function () {
        this.setLayer(new Heatmap({
            source: this.get("layerSource"),
            name: this.get("name"),
            typ: this.get("typ"),
            id: this.get("id"),
            weight: function (feature) {
                if (feature.get("calculatedWeight") !== undefined) {
                    return feature.get("calculatedWeight");
                }
                return feature.get("normalizeWeightForHeatmap");
            },
            gfiAttributes: this.get("gfiAttributes"),
            blur: this.get("blur"),
            radius: this.get("radius"),
            gradient: this.get("gradient")
        }));
    },

    /**
     * Checks if triggered layer id equals the id of current heatmap-layer.
     * @param  {String} layerId - id from layer
     * @returns {Boolean} - Flag if layerId matches the dataLayerId
     */
    checkDataLayerId: function (layerId) {
        return this.get("dataLayerId") === layerId;
    },

    /**
     * Draws the heatmap with initialize features
     * @param  {ol/Feature[]} features All features from associated sensorLayer
     * @returns {void}
     */
    initializeHeatmap: function (features) {
        const attribute = this.get("attribute"),
            value = this.get("value"),
            weightAttribute = this.get("weightAttribute"),
            weightAttributeMax = this.get("weightAttributeMax"),
            cloneFeatures = [];

        let layerSource = this.get("layerSource");

        features.forEach(function (feature) {
            const cloneFeature = feature.clone();
            let count;

            if (attribute !== "" && value !== "") {
                count = this.countStates(feature, attribute, value);
                cloneFeature.set("weightForHeatmap", count);
            }

            if ((weightAttribute && weightAttributeMax) !== undefined) {
                cloneFeature.set("calculatedWeight", feature.get(weightAttribute) / weightAttributeMax);
            }

            cloneFeature.setId(feature.getId());
            cloneFeatures.push(cloneFeature);
        }, this);

        if (layerSource === undefined) {
            this.prepareLayerObject();
            layerSource = this.get("layerSource");
        }
        layerSource.addFeatures(cloneFeatures);

        // normalize weighting
        if (attribute !== "" && value !== "") {
            this.normalizeWeight(layerSource.getFeatures());
        }
    },
    /**
     * overwrites createlegendURL from class Layer. Is not yet implemented in heatmap layer.
     * @returns {void}
     */
    createLegendURL: function () {
        // console.info("legendURL for heatmap not yet implemented");
    },

    /**
     * Updates the heatmap with given feature.
     * @param  {ol/Feature} feature Feature to be updated.
     * @returns {void}
     */
    updateHeatmap: function (feature) {
        const attribute = this.get("attribute"),
            value = this.get("value"),
            layerSource = this.get("layerSource"),
            featureId = feature.getId(),
            cloneFeature = feature.clone();

        let heatmapFeature,
            count;

        cloneFeature.setId(featureId);

        // check is feature exist
        layerSource.getFeatures().forEach(function (feat) {
            if (feat.getId() === featureId) {
                heatmapFeature = feat;
            }
        });

        // insert weighting
        if (attribute !== "" && value !== "") {
            count = this.countStates(feature, attribute, value);

            cloneFeature.set("weightForHeatmap", count);
        }

        // if the feature is new, then pushes otherwise change it
        if (heatmapFeature !== undefined) {
            layerSource.addFeature(cloneFeature);
        }
        else {
            layerSource.removeFeature(layerSource.getFeatureById(cloneFeature.getId()));
            layerSource.addFeature(cloneFeature);
        }

        // normalize weighting
        if (attribute !== "" && value !== "") {
            this.normalizeWeight(layerSource.getFeatures());
        }
    },

    /**
     * Normalizes the values to a scale from 0 to 1.
     * @param  {ol/Feature[]} featuresWithValue Features that have a value.
     * @returns {void}
     */
    normalizeWeight: function (featuresWithValue) {
        const maxScales = [];
        let max = 0;

        featuresWithValue.forEach(feature => maxScales.push(parseInt(feature.get("weightForHeatmap"), 10)));
        max = Math.max(...maxScales);

        featuresWithValue.forEach(function (feature) {
            feature.set("weightForHeatmap", feature.get("weightForHeatmap") / max);
        });
    },

    /**
     * Counts the given states of a feature.
     * @param  {ol/Feature} feature Feature.
     * @param  {string} heatmapAttribute Attribute that contains the value.
     * @param  {string} heatmapValue Value.
     * @return {String[]}  - count.
     */
    countStates: function (feature, heatmapAttribute, heatmapValue) {
        const state = String(feature.get(heatmapAttribute));
        let states,
            count = 0;

        // split features with multiple values
        if (state.indexOf("|") !== -1) {
            states = state.split(" | ");
        }
        else {
            states = [state];
        }

        count = $.grep(states, function (oneState) {
            return oneState === heatmapValue;
        }).length;

        return count;
    },

    /**
     * Setter for attribute "layer".
     * @param {ol/Layer} value HeatmapLayer.
     * @returns {void}
     */
    setLayer: function (value) {
        this.set("layer", value);
    },

    /**
     * Setter for attribute "layerSource"
     * @param {ol/Source} value HeatmapLayerSource.
     * @returns {void}
     */
    setLayerSource: function (value) {
        this.set("layerSource", value);
    }
});

export default HeatmapLayer;
