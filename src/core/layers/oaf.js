import {oaf} from "masterportalAPI";
import LoaderOverlay from "../../utils/loaderOverlay";
import Layer from "./layer";
import * as bridge from "./RadioBridge.js";
import Cluster from "ol/source/Cluster";
import {bbox, all} from "ol/loadingstrategy.js";
import store from "../../app-store";
import axios from "axios";
import isObject from "../../utils/isObject";


/**
 * Creates a layer of type OAF.
 * @param {Object} attrs  attributes of the layer
 * @returns {void}
 */
export default function OAFLayer (attrs) {
    const defaults = {
        supported: ["2D", "3D"],
        showSettings: true,
        isSecured: false,
        isClustered: false,
        altitudeMode: "clampToGround",
        useProxy: false,
        sourceUpdated: false,
        datasets: [{}]
    };

    this.createLayer(Object.assign(defaults, attrs));

    // call the super-layer
    Layer.call(this, Object.assign(defaults, attrs), this.layer, !attrs.isChildLayer);
    this.set("style", this.getStyleFunction(attrs));
    this.prepareFeaturesFor3D(this.layer.getSource().getFeatures());
    if (attrs.clusterDistance) {
        this.set("isClustered", true);
    }

    this.createLegend();
}
// Link prototypes and add prototype methods, means OAFLayer uses all methods and properties of Layer
OAFLayer.prototype = Object.create(Layer.prototype);

/**
 * Creates a layer of type OAF by using oaf-layer of the masterportalapi.
 * Sets all needed attributes at the layer and the layer source.
 * @param {Object} attrs  params of the raw layer
 * @returns {void}
 */
OAFLayer.prototype.createLayer = function (attrs) {
    const crs = attrs.crs ? attrs.crs : "EPSG:25832",
        rawLayerAttributes = {
            id: attrs.id,
            url: attrs.url,
            clusterDistance: attrs.clusterDistance,
            featureNS: attrs.featureNS,
            featureType: attrs.featureType,
            version: attrs.version,
            outputFormat: attrs.outputFormat,
            limit: attrs.limit,
            offset: attrs.offset,
            bulk: attrs.bulk,
            bbox: attrs.bbox,
            datetime: attrs.datetime,
            crs,
            bboxCrs: attrs.bboxCrs,
            cswUrl: attrs.cswUrl,
            params: attrs.params
        },
        layerParams = {
            name: attrs.name,
            typ: attrs.typ,
            gfiAttributes: attrs.gfiAttributes,
            gfiTheme: attrs.gfiTheme,
            hitTolerance: attrs.hitTolerance,
            altitudeMode: attrs.altitudeMode,
            alwaysOnTop: attrs.alwaysOnTop,
            layerSequence: attrs.layerSequence
        },
        styleFn = this.getStyleFunction(attrs),
        options = {
            clusterGeometryFunction: (feature) => {
                // do not cluster invisible features; can't rely on style since it will be null initially
                if (feature.get("hideInClustering") === true) {
                    return null;
                }
                return feature.getGeometry();
            },
            featuresFilter: this.getFeaturesFilterFunction(attrs),
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
                console.error("masterportal oaf loading error:", error);
            },
            loadingParams: {
                xhrParameters: attrs.isSecured ? {credentials: "include"} : null,
                propertyname: this.getPropertyname(attrs),
                // only used if loading strategy is all
                bbox: attrs.bboxGeometry ? attrs.bboxGeometry.getExtent().toString() : undefined
            },
            loadingStrategy: attrs.loadingStrategy === "all" ? all : bbox
        };

    if (styleFn) {
        styleFn.bind(this);
    }
    options.style = styleFn;

    this.layer = oaf.createLayer(rawLayerAttributes, {layerParams, options});
};

/**
 * Returns a function to filter features with.
 * @param {Object} attrs  params of the raw layer
 * @returns {Function} to filter features with
 */
OAFLayer.prototype.getFeaturesFilterFunction = function (attrs) {
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
 * Returns the propertynames as comma separated string.
 * @param {Object} attrs  params of the raw layer
 * @returns {string} the propertynames as string
 */
OAFLayer.prototype.getPropertyname = function (attrs) {
    let propertyname = "";

    if (Array.isArray(attrs.propertyNames)) {
        propertyname = attrs.propertyNames.join(",");
    }
    return propertyname;
};
/**
 * Get style function for layer.
 * @param {Object} attrs  params of the raw layer
 * @returns {Function} the style function
 */
OAFLayer.prototype.getStyleFunction = function (attrs) {
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
 * Updates the layers source by calling refresh at source. Depending on attribute 'sourceUpdated'.
 * @returns {void}
 */
OAFLayer.prototype.updateSource = function () {
    if (this.get("sourceUpdated") === false) {
        this.set("sourceUpdated", true);
        this.layer.getSource().refresh();
    }
};
/**
 * Creates the legend
 * @returns {void}
 */
OAFLayer.prototype.createLegend = function () {
    const styleModel = bridge.getStyleModelById(this.get("styleId")),
        legend = this.get("legend");

    if (Array.isArray(legend)) {
        this.setLegend(legend);
    }
    else if (styleModel && legend === true) {
        styleModel.getGeometryTypeFromOAF(this.get("url"), this.get("featureType"), this.get("styleGeometryType"), this.get("useProxy"));
        this.setLegend(styleModel.getLegendInfos());
    }
    else if (typeof legend === "string") {
        this.setLegend([legend]);
    }
};
/**
 * Hides all features by setting style=null for all features.
 * @returns {void}
 */
OAFLayer.prototype.hideAllFeatures = function () {
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
OAFLayer.prototype.showAllFeatures = function () {
    const collection = this.get("layerSource").getFeatures();

    collection.forEach((feature) => {
        const style = this.getStyleAsFunction(this.get("style"));

        feature.setStyle(style(feature));
    });
};
/**
 * Only shows features that match the given ids.
 * @param {String[]} featureIdList List of feature ids.
 * @returns {void}
 */
OAFLayer.prototype.showFeaturesByIds = function (featureIdList) {
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
 * Returns the style as a function.
 * @param {Function|Object} style ol style object or style function.
 * @returns {Function} - style as function.
 */
OAFLayer.prototype.getStyleAsFunction = function (style) {
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
OAFLayer.prototype.styling = function () {
    this.layer.setStyle(this.getStyleAsFunction(this.get("style")));
};

/**
 * Initiates the presentation of layer information.
 * @returns {void}
 */
OAFLayer.prototype.showLayerInformation = function () {
    let cswUrl = null,
        showDocUrl = null,
        layerMetaId = null;

    const metaID = [],
        name = this.get("name");

    if (Array.isArray(this.get("datasets")) && this.get("datasets")[0] !== null && typeof this.get("datasets")[0] === "object") {
        cswUrl = this.get("datasets")[0]?.csw_url ? this.get("datasets")[0].csw_url : null;
        showDocUrl = this.get("datasets")[0]?.show_doc_url ? this.get("datasets")[0].show_doc_url : null;
        layerMetaId = this.get("datasets")[0]?.md_id ? this.get("datasets")[0].md_id : null;
    }
    if (!cswUrl && !layerMetaId) {
        const baseUrl = this.get("url") + "?f=json";

        axios({
            method: "GET",
            url: baseUrl
        }).then((response) => {
            const links = response.data.links,
                metaLink = links.filter(link => link.rel === "describedBy" && link.type === "application/xml")[0];

            layerMetaId = isObject(metaLink) && Object.prototype.hasOwnProperty.call(metaLink, "href") ? new URLSearchParams(metaLink.href).get("id") : undefined;
            if (layerMetaId) {
                this.setLayerinfoActive(this.get("cswUrl"), layerMetaId, metaID, name, showDocUrl);
            }
            else {
                console.warn("OAF Layerinfo: layerMetaId is not set");
            }
        });
    }

    metaID.push(layerMetaId);
    this.setLayerinfoActive(cswUrl, layerMetaId, metaID, name, showDocUrl);
};

/**
 * Sets the layer info attributes and activate it.
 * @param {String} cswUrl the csw url
 * @param {String} layerMetaId the layer metadata id
 * @param {String[]} metaID the metadata id array
 * @param {String} name the name of the layer
 * @param {String} showDocUrl the document url
 * @returns {void}
 */
OAFLayer.prototype.setLayerinfoActive = function (cswUrl, layerMetaId, metaID, name, showDocUrl) {
    store.dispatch("LayerInformation/layerInfo", {
        "id": this.get("id"),
        "metaID": layerMetaId,
        "metaIdArray": metaID,
        "layername": name,
        "url": this.get("url"),
        "legendURL": this.get("legendURL"),
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
    if (typeof this.createLegend === "function") {
        this.createLegend();
    }
    this.setLayerInfoChecked(true);
};
