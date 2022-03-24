import Feature from "ol/Feature.js";
import {WFS} from "ol/format.js";
import Point from "ol/geom/Point.js";
import {Icon, Style} from "ol/style.js";
import {Vector as VectorLayer} from "ol/layer.js";
import VectorSource from "ol/source/Vector.js";
import {getLayerWhere} from "masterportalapi/src/rawLayerList";
import getProxyUrl from "../../src/utils/getProxyUrl";
import store from "../../src/app-store";
import mapCollection from "../../src/core/dataStorage/mapCollection";
import calculateExtent from "../../src/utils/calculateExtent";

const ZoomToFeature = Backbone.Model.extend({
    defaults: {
        ids: [],
        attribute: "flaechenid",
        imgLink: "https://geodienste.hamburg.de/lgv-config/img/location_eventlotse.svg",
        wfsId: "4560",
        featureCenterList: [],
        format: new WFS(),
        features: [],
        anchor: {
            anchorX: 0.5,
            anchorY: 24,
            anchorXUnits: "fraction",
            anchorYUnits: "pixels"
        }, // @deprecated in version 3.0.0
        imageScale: 2, // @deprecated in version 3.0.0,
        useProxy: false
    },
    initialize: function () {
        Radio.once("ParametricURL", "ready", this.init, this);
    },

    init: function () {

        let ids = "";

        this.setStyleListModel(Radio.request("StyleList", "returnModelById", this.get("styleId")));
        if (store.state.urlParams && store.state.urlParams["Map/zoomToFeatureId"]) {
            ids = store.state.urlParams["Map/zoomToFeatureId"];
            this.setIds(Array.isArray(ids) ? ids : [ids]);
            this.getFeaturesFromWFS();
            this.createFeatureCenterList();
            this.putIconsForFeatureIds(this.get("featureCenterList"),
                this.get("imgLink"), // @deprecated in version 3.0.0
                this.get("anchor"), // @deprecated in version 3.0.0
                this.get("imageScale"), // @deprecated in version 3.0.0
                this.get("styleListModel"));
            this.zoomToFeatures();
        }
    },


    /**
     * sets icons for the passed feature list
     * @param {array} featureCenterList - contains centercoordinates from features
     * @param {string} imgLink - path to icon as image //@deprecated in version 3.0.0
     * @param {object} anchor - Position for the icon  //@deprecated in version 3.0.0
     * @param {number} imageScale - factor scale the icon  //@deprecated in version 3.0.0
     * @param {object} styleListModel - contains the configured style
     * @returns {void}
     */
    putIconsForFeatureIds: function (featureCenterList, imgLink, anchor, imageScale, styleListModel) {
        const iconFeatures = [];

        featureCenterList.forEach(function (featureCenter, index) {
            const featureName = "featureIcon" + index,
                iconFeature = this.createIconFeature(featureCenter, featureName);
            let iconStyle;

            if (this.get("styleId") !== undefined) {
                iconStyle = this.createIconStyle(iconFeature, styleListModel);
            }
            else {
                // @deprecated in version 3.0.0 - this.createIconStyle() verwenden
                iconStyle = this.createIconStyleOld(imgLink, anchor, imageScale);
            }

            iconFeature.setStyle(iconStyle);
            iconFeatures.push(iconFeature);
        }, this);

        Radio.trigger("Map", "addLayerOnTop", this.createIconVectorLayer(iconFeatures));
    },

    /**
     * creates a feature from the passed center point
     * @param {array} featureCenter - contains centercoordinates from features
     * @param {string} featureName - unique name for the feature
     * @returns {ol/feature} iconFeature
     */
    createIconFeature: function (featureCenter, featureName) {
        return new Feature({
            geometry: new Point(featureCenter),
            name: featureName
        });
    },

    /**
     * creates an Style over model from StyleList
     * @param {ol/Feature} iconFeature feature to be style
     * @param {object} styleListModel - contains the configured style
     * @returns {ol/style} featureStyle
     */
    createIconStyle: function (iconFeature, styleListModel) {
        let featureStyle = new Style();

        if (styleListModel !== undefined) {
            featureStyle = styleListModel.createStyle(iconFeature, false);
        }

        return featureStyle;
    },

    /**
     * creates the style from the image for the feature
     * @param {string} imgLink - path to icon as image
     * @param {object} anchor - Position for the icon
     * @param {number} imageScale - factor scale the icon
     * @return {ol/style} iconStyle
     * @deprecated in version 3.0.0 - this.createIconStyle() verwenden
     */
    createIconStyleOld: function (imgLink, anchor, imageScale) {
        return new Style({
            image: new Icon({
                anchor: [anchor.anchorX, anchor.anchorY],
                anchorXUnits: anchor.anchorXUnits,
                anchorYUnits: anchor.anchorYUnits,
                src: imgLink,
                scale: imageScale
            })
        });
    },

    /**
     * creates a VectorLayer with a VectorSource from the features
     * @param {array} iconFeatures - contains the features to draw
     * @returns {ol/vectorlayer} iconVectorLayer
     */
    createIconVectorLayer: function (iconFeatures) {
        return new VectorLayer({
            id: "zoom_to_feature_layer",
            source: new VectorSource({
                features: iconFeatures
            }),
            alwaysOnTop: true
        });
    },

    getFeaturesFromWFS: function () {
        if (this.get("ids") !== undefined) {
            this.requestFeaturesFromWFS(this.get("wfsId"));
        }
    },

    // holt sich "zoomtofeature" aus der Config, prüft ob ID vorhanden ist
    createFeatureCenterList: function () {
        const ids = this.get("ids") || null,
            attribute = this.get("attribute") || null,
            features = this.get("features");

        if (ids !== null) {
            ids.forEach(function (id) {
                const feature = features.filter(function (feat) {
                        if (feat.get(attribute) === String(id)) {
                            return 1;
                        }
                        return 0;
                    }),
                    extent = feature.length === 0 ? [] : feature[0].getGeometry().getExtent(),
                    deltaX = extent[2] - extent[0],
                    deltaY = extent[3] - extent[1],
                    center = [extent[0] + (deltaX / 2), extent[1] + (deltaY / 2)];

                this.get("featureCenterList").push(center);
            }, this);
        }
    },

    // baut sich aus den Config-prefs die URL zusammen
    requestFeaturesFromWFS: function (wfsId) {
        const LayerPrefs = getLayerWhere({id: wfsId}),
            url = LayerPrefs && LayerPrefs?.url ? LayerPrefs.url : "",
            version = LayerPrefs && LayerPrefs?.version ? LayerPrefs.version : "",
            typename = LayerPrefs && LayerPrefs?.featureType ? LayerPrefs.featureType : "",
            data = "service=WFS&version=" + version + "&request=GetFeature&TypeName=" + typename;

        this.sendRequest(url, data);
    },

    // fires the AJAX request
    sendRequest: function (url, data) {
        /**
         * @deprecated in the next major-release!
         * useProxy
         * getProxyUrl()
         */
        const requestUrl = this.get("useProxy") ? getProxyUrl(url) : url;

        $.ajax({
            url: requestUrl,
            data: encodeURI(data),
            context: this,
            async: false,
            type: "GET",
            success: this.parseFeatures,
            timeout: 6000,
            error: function () {
                const msg = "URL: " + requestUrl + " nicht erreichbar.";

                Radio.trigger("Alert", "alert", msg);
            }
        });
    },

    // holt sich aus der AJAX response die Daten und speichert sie als ol.Features
    parseFeatures: function (data) {
        const format = this.get("format"),
            features = format.readFeatures(data);

        this.setFeatures(features);
    },

    // holt sich das "bboxes"-array, berechnet aus allen bboxes die finale bbox und sendet diese an die map
    zoomToFeatures: function () {
        const ids = this.get("ids"),
            attribute = this.get("attribute") || null,
            features = this.get("features");
        let filteredFeatures = [];

        if (ids && ids.length > 0) {
            ids.forEach(id => {
                const feature = features.filter(feat => feat.get(attribute) === String(id));

                filteredFeatures = filteredFeatures.concat(feature);
            });

            mapCollection.getMapView("ol", "2D").setBBox(calculateExtent(filteredFeatures));
        }
    },

    // setter for ids
    setIds: function (value) {
        this.set("ids", value);
    },

    // setter for features
    setFeatures: function (value) {
        this.set("features", value);
    },

    // setter for format
    setFormat: function (value) {
        this.set("format", value);
    },

    // setter for featureCenterList
    setFeatureCenterList: function (value) {
        this.set("featureCenterList", value);
    },

    // setter for styleListModel
    setStyleListModel: function (value) {
        this.set("styleListModel", value);
    }
});

export default ZoomToFeature;
