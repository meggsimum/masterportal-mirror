import {geojson} from "masterportalAPI";
import {GeoJSON} from "ol/format.js";
import getProxyUrl from "../../utils/getProxyUrl";
import Layer from "./layer";
import * as bridge from "./RadioBridge.js";
import store from "../../app-store";
import mapCollection from "../dataStorage/mapCollection";
import LoaderOverlay from "../../utils/loaderOverlay";

/**
 * Creates a layer of type GeoJSON.
 * @param {Object} attrs  attributes of the layer
 * @returns {void}
 */
export default function GeoJSONLayer (attrs) {
    const defaults = {
        supported: ["2D", "3D"],
        isClustered: false,
        altitudeMode: "clampToGround",
        useProxy: false
    };

    this.createLayer(Object.assign(defaults, attrs));
    this.setStyle(this.getStyleFunction(attrs));

    if (!attrs.isChildLayer) {
        // call the super-layer
        Layer.call(this, Object.assign(defaults, attrs), this.layer, !attrs.isChildLayer);
        this.checkForScale({scale: store.getters["Map/scale"]});
    }

    if (attrs.clusterDistance) {
        this.set("isClustered", true);
    }

    this.createLegend(attrs);
}

// Link prototypes and add prototype methods, means GeoJSONLayer uses all methods and properties of Layer
GeoJSONLayer.prototype = Object.create(Layer.prototype);

/**
 * Triggert by Layer to create a ol/layer/Vector
 * @param {Object} attrs  attributes of the layer
 * @fires MapView#RadioRequestGetProjection
 * @returns {void}
 */
GeoJSONLayer.prototype.createLayer = function (attrs) {
    const rawLayerAttributes = {
            id: attrs.id,
            url: attrs.url,
            clusterDistance: attrs.clusterDistance
        },
        layerParams = {
            name: attrs.name,
            typ: attrs.typ,
            subTyp: attrs.subTyp,
            gfiAttributes: attrs.gfiAttributes,
            gfiTheme: attrs.gfiTheme,
            altitudeMode: attrs.altitudeMode,
            hitTolerance: attrs.hitTolerance
        },
        styleFn = this.getStyleFunction(attrs),
        options = {
            layerStyle: styleFn,
            map: mapCollection.getMap("ol", "2D"),
            clusterGeometryFunction: (feature) => {
                // do not cluster invisible features; can't rely on style since it will be null initially
                if (feature.get("hideInClustering") === true) {
                    return null;
                }
                return feature.getGeometry();
            },
            featuresFilter: this.getFeaturesFilterFunction(attrs),
            // If an Object contains a property which holds a Function, the property is called a method.
            // This method, when called, will always have it's this variable set to the Object it is associated with.
            // This is true for both strict and non-strict modes.
            // therefore use [fn].bind(this)
            beforeLoading: function () {
                if (this.get("isSelected") || attrs.isSelected) {
                    LoaderOverlay.show();
                }
            }.bind(this),
            afterLoading: function (features) {
                this.featuresLoaded(attrs.id, features);
                if (this.get("isSelected") || attrs.isSelected) {
                    LoaderOverlay.hide();
                }
            }.bind(this),
            onLoadingError: (error) => {
                console.error("masterportal wfs loading error:", error);
            }
        };

    if (styleFn) {
        styleFn.bind(this);
    }
    options.layerStyle = styleFn;
    this.layer = geojson.createLayer(rawLayerAttributes, {layerParams, options});
};

/**
 * Sets Style for layer.
 * @param {Object} attrs  params of the raw layer
 * @returns {void}
 */
GeoJSONLayer.prototype.getStyleFunction = function (attrs) {
    const styleId = attrs.styleId,
        styleModel = bridge.getStyleModelById(styleId);
    let isClusterFeature = false,
        style = null;

    if (styleModel !== undefined) {
        style = function (feature) {
            const feat = feature !== undefined ? feature : this;

            isClusterFeature = typeof feat.get("features") === "function" || typeof feat.get("features") === "object" && Boolean(feat.get("features"));
            return styleModel.createStyle(feat, isClusterFeature);
        };
    }
    else {
        console.error(i18next.t("common:modules.core.modelList.layer.wrongStyleId", {styleId}));
    }

    return style;
};

/**
 * Returns a function to filter features with.
 * @param {Object} attrs  params of the raw layer
 * @returns {Function} to filter features with
 */
GeoJSONLayer.prototype.getFeaturesFilterFunction = function (attrs) {
    return function (features) {
        // only use features with a geometry
        let filteredFeatures = features.filter(feature => feature.getGeometry() !== undefined);

        if (attrs.bboxGeometry) {
            filteredFeatures = filteredFeatures.filter((feature) => attrs.bboxGeometry.intersectsExtent(feature.getGeometry().getExtent()));
        }
        return filteredFeatures;
    };
};

/**
 * returns the features that intersect the given geometries
 * @param {ol.geom.Geometry[]} geometries - GeometryCollection with one or more geometry
 * @param {ol.Feature[]} features - all features in the geometry extent
 * @returns {ol.Feature[]} filtered features
 */
GeoJSONLayer.prototype.getFeaturesIntersectsGeometry = function (geometries, features) {
    if (geometries) {
        return features.filter(function (feature) {
            // test if the geometry and the passed extent intersect
            return geometries.intersectsExtent(feature.getGeometry().getExtent());
        });
    }

    return features;
};

/**
 * Tries to parse data string to ol.format.GeoJson
 * @param   {string} data string to parse
 * @param   {ol/proj/Projection} mapProjection target projection to parse features into
 * @param   {string} jsonProjection projection of the json
 * @throws Will throw an error if the argument cannot be parsed.
 * @returns {object} ol/format/GeoJSON/features
 */
GeoJSONLayer.prototype.parseDataToFeatures = function (data, mapProjection, jsonProjection) {
    const geojsonReader = new GeoJSON({
        featureProjection: mapProjection,
        dataProjection: jsonProjection
    });
    let jsonObjects;

    try {
        jsonObjects = geojsonReader.readFeatures(data);

        // Use only Features that have a geometry.
        jsonObjects = jsonObjects.filter(function (feature) {
            return feature.getGeometry() !== undefined;
        });
    }
    catch (err) {
        console.error("GeoJSON cannot be parsed.");
    }
    return jsonObjects;
};

/**
 * Requests the latest sensorValues from OpenSenseMap.
 * @param {String} subTyp SubTyp of layer.
 * @returns {void}
 */
GeoJSONLayer.prototype.expandFeaturesBySubTyp = function (subTyp) {
    const expandedFeatures = this.get("layerSource").getFeatures();

    if (subTyp === "OpenSenseMap") {
        expandedFeatures.forEach(feature => {
            const sensors = feature.get("sensors");

            sensors.forEach(sensor => {
                const sensorId = sensor._id,
                    name = sensor.title.toLowerCase() || "unnamedSensor",
                    unit = sensor.unit || "",
                    type = sensor.sensorType || "unnamedSensorType";

                this.getValueFromOpenSenseMapSensor(feature, sensorId, name, unit, type);
            });
        });
    }
    else if (subTyp !== undefined) {
        console.error("Subtype " + subTyp + " is not yet supported for GeoJSON-Layer.");
    }
};

/**
 * Sends async request to get the newest measurement of each sensor per feature.
 * Async so that the user can already navigate in the map without waiting for all sensorvalues for all features.
 * @param {Feature} feature The current Feature.
 * @param {String} sensorId Id of sensor.
 * @param {String} name Name of sensor.
 * @param {String} unit Unit of sensor.
 * @param {String} type Type of sensor.
 * @returns {void}
 */
GeoJSONLayer.prototype.getValueFromOpenSenseMapSensor = function (feature, sensorId, name, unit, type) {
    const xhr = new XMLHttpRequest(),
        async = true,
        that = this,
        boxId = feature.get("_id");
    let url = "https://api.opensensemap.org/boxes/" + boxId + "/data/" + sensorId;

    /**
     * @deprecated in the next major-release!
     * useProxy
     * getProxyUrl()
     */
    url = this.get("useProxy") ? getProxyUrl(url) : url;
    xhr.open("GET", url, async);
    xhr.onload = function (event) {
        let response = JSON.parse(event.currentTarget.responseText);

        response = response.length > 0 ? response[0] : undefined;
        that.setOpenSenseMapSensorValues(feature, response, name, unit, type);
    };
    xhr.send();
};

/**
 * Sets the latest measurements of the opensensemap sensors at the feature.
 * @param {Feature} feature The feature.
 * @param {JSON} response The parsed response as JSON.
 * @param {String} name Name of sensor.
 * @param {String} unit Unit of sensor.
 * @param {String} type Type of sensor.
 * @returns {void}
 */
GeoJSONLayer.prototype.setOpenSenseMapSensorValues = function (feature, response, name, unit, type) {
    if (response) {
        feature.set(name, response.value + " " + unit);
        feature.set(name + "_createdAt", response.createdAt);
        feature.set(name + "_sensorType", type);
    }
};

/**
 * Creates the legend
* @param {Object} attrs  attributes of the layer
 * @returns {void}
 */
GeoJSONLayer.prototype.createLegend = function (attrs) {
    const styleId = attrs.styleId,
        styleModel = bridge.getStyleModelById(styleId);
    let legend = this.get("legend");

    /**
     * @deprecated in 3.0.0
     */
    if (this.get("legendURL")) {
        if (this.get("legendURL") === "") {
            legend = true;
        }
        else if (this.get("legendURL") === "ignore") {
            legend = false;
        }
        else {
            legend = this.get("legendURL");
        }
    }

    if (Array.isArray(legend)) {
        this.setLegend(legend);
    }
    else if (styleModel && legend === true) {
        this.setLegend(styleModel.getLegendInfos());
    }
    else if (typeof legend === "string") {
        this.setLegend([legend]);
    }
};

/**
 * Filters the visibility of features by ids.
 * @param  {String[]} featureIdList Feature ids to be shown.
 * @fires Layer#RadioTriggerVectorLayerResetFeatures
 * @return {void}
 */
GeoJSONLayer.prototype.showFeaturesByIds = function (featureIdList) {
    const layerSource = this.get("layerSource"),
        // featuresToShow is a subset of allLayerFeatures
        allLayerFeatures = layerSource.getFeatures(),
        featuresToShow = featureIdList.map(id => layerSource.getFeatureById(id));

    this.hideAllFeatures();

    // optimization - clear and re-add to prevent cluster updates on each change
    layerSource.clear();

    featuresToShow.forEach(feature => {
        const style = this.getStyleAsFunction(this.get("style"));

        feature.set("hideInClustering", false);
        feature.setStyle(style(feature));
    }, this);

    layerSource.addFeatures(allLayerFeatures);
    Radio.trigger("VectorLayer", "resetFeatures", this.get("id"), allLayerFeatures);
};

/**
 * Returns the style as a function.
 * @param {Function|Object} style ol style object or style function.
 * @returns {function} - style as function.
 */
GeoJSONLayer.prototype.getStyleAsFunction = function (style) {
    if (typeof style === "function") {
        return style;
    }

    return function () {
        return style;
    };
};

/**
 * Hides all features by setting style= null for all features.
 * @returns {void}
 */
GeoJSONLayer.prototype.hideAllFeatures = function () {
    const layerSource = this.get("layerSource"),
        features = layerSource.getFeatures();

    // optimization - clear and re-add to prevent cluster updates on each change
    layerSource.clear();

    features.forEach(function (feature) {
        feature.set("hideInClustering", true);
        feature.setStyle(function () {
            return null;
        });
    }, this);

    layerSource.addFeatures(features);
};

/**
 * sets undefined style for all features so the layer style will be used
 * @returns {void}
 */
GeoJSONLayer.prototype.showAllFeatures = function () {
    const collection = this.get("layerSource").getFeatures();

    collection.forEach(function (feature) {
        feature.setStyle(undefined);
    }, this);
};

// setter for style
GeoJSONLayer.prototype.setStyle = function (value) {
    this.layer.setStyle(value);
};

// setter for legendURL
GeoJSONLayer.prototype.setLegendURL = function (value) {
    this.set("legendURL", value);
};

GeoJSONLayer.prototype.isUseProxy = function () {
    return Object.prototype.hasOwnProperty.call(this, "isUseProxy") && this.get("isUseProxy") === true;
};


