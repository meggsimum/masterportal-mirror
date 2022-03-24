import Layer from "./layer";
import {vectorBase} from "masterportalapi/src";
import * as bridge from "./RadioBridge.js";
import Cluster from "ol/source/Cluster";

/**
 * Creates a layer of type vectorBase.
 * @param {Object} attrs  attributes of the layer
 * @returns {void}
 */
export default function VectorBaseLayer (attrs) {
    const defaults = {
        supported: ["2D", "3D"],
        isClustered: false,
        altitudeMode: "clampToGround",
        useProxy: false
    };

    this.createLayer(Object.assign(defaults, attrs));
    // call the super-layer
    Layer.call(this, Object.assign(defaults, attrs), this.layer, !attrs.isChildLayer);
    this.createLegend();
}
// Link prototypes and add prototype methods, means VectorBaseLayer uses all methods and properties of Layer
VectorBaseLayer.prototype = Object.create(Layer.prototype);

/**
 * creates the layer
 * @param {Object} attr the attributes for the layer
 * @returns {void}
 */
VectorBaseLayer.prototype.createLayer = function (attr) {
    this.layer = vectorBase.createLayer(attr);

    if (attr.isSelected) {
        this.updateSource(this.layer, attr.features);
    }
};

/**
 * Updates the layers source
 * @param {module:ol/layer/Base~BaseLayer} layer The vector base layer.
 * @param {module:ol/Feature~Feature[]} features The ol features.
 * @returns {void}
 */
VectorBaseLayer.prototype.updateSource = function (layer, features) {
    vectorBase.updateSource(layer, features);
};

/**
 * Creates the legend
 * @returns {void}
 */
VectorBaseLayer.prototype.createLegend = function () {
    const styleModel = Radio.request("StyleList", "returnModelById", this.get("styleId"));
    let legend = this.get("legend");

    /**
     * @deprecated in 3.0.0
     */
    if (this.get("legendURL")) {
        if (this.get("legendURL") === "" || this.get("legendURL") === "ignore") {
            legend = false;
        }
        else {
            legend = this.get("legendURL");
        }
    }

    if (styleModel && legend === true) {
        styleModel.getGeometryTypeFromWFS(this.get("url"), this.get("version"), this.get("featureType"), this.get("styleGeometryType"));
        this.setLegend(styleModel.getLegendInfos());
    }
    else if (typeof legend === "string") {
        this.setLegend([legend]);
    }
};

/**
 * Only shows features that match the given ids.
 * @param {String[]} featureIdList List of feature ids.
 * @returns {void}
 */
VectorBaseLayer.prototype.showFeaturesByIds = function (featureIdList) {
    const layerSource = this.get("layerSource") instanceof Cluster ? this.get("layerSource").getSource() : this.get("layerSource"),
        allLayerFeatures = layerSource.getFeatures(),
        featuresToShow = featureIdList.map(id => layerSource.getFeatureById(id));

    this.hideAllFeatures();
    featuresToShow.forEach(feature => {
        const style = this.getStyleAsFunction(this.get("style"));

        if (feature && feature !== null) {
            feature.set("hideInClustering", false);
            feature.setStyle(style(feature));
        }
    });

    layerSource.addFeatures(allLayerFeatures);
    bridge.resetVectorLayerFeatures(this.get("id"), allLayerFeatures);
};

/**
 * Hides all features by setting style= null for all features.
 * @returns {void}
 */
VectorBaseLayer.prototype.hideAllFeatures = function () {
    const layerSource = this.get("layerSource") instanceof Cluster ? this.get("layerSource").getSource() : this.get("layerSource"),
        features = layerSource.getFeatures();

    // optimization - clear and re-add to prevent cluster updates on each change
    layerSource.clear();

    features.forEach((feature) => {
        feature.set("hideInClustering", true);
        feature.setStyle(() => null);
    });

    layerSource.addFeatures(features);
};

/**
 * Shows all features by setting their style.
 * @returns {void}
 */
VectorBaseLayer.prototype.showAllFeatures = function () {
    const collection = this.get("layerSource").getFeatures();

    collection.forEach((feature) => {
        feature.setStyle(undefined);
    });
};

/**
 * Returns the style as a function.
 * @param {Function|Object} style ol style object or style function.
 * @returns {Function} - style as function.
 */
VectorBaseLayer.prototype.getStyleAsFunction = function (style) {
    if (typeof style === "function") {
        return style;
    }

    return function () {
        return style;
    };
};

/**
 * Sets Style for layer.
 * @returns {void}
 */
VectorBaseLayer.prototype.styling = function () {
    this.layer.setStyle(this.getStyleAsFunction(this.get("style")));
};

