
import "../model";
import {Icon} from "ol/style.js";

const VisibleVectorModel = Backbone.Model.extend(/** @lends VisibleVectorModel.prototype */{
    defaults: {
        inUse: false,
        minChars: 3,
        layerTypes: ["WFS"],
        gfiOnClick: false
    },
    /**
     * @class VisibleVectorModel
     * @description Initialisierung der visibleVector Suche
     * @extends Backbone.Model
     * @memberof Searchbar.VisibleVector
     * @constructs
     * @property {Boolean} inUse=false todo
     * @property {Number} minChars=3 todo
     * @property {String[]} layerTypes=["WFS"] todo
     * @property {Boolean} gfiOnClick=false todo
     * @param {Object} config - Config JSON for Searchbar in visible vector layers
     * @param {integer} [config.minChars=3] - minimum character count to initialize a seach
     * @listens Searchbar#RadioTriggerSearchbarSearch
     * @fires Core.ModelList#RadioRequestModelListGetModelsByAttributes
     * @fires Searchbar#RadioTriggerSearchbarPushHits
     * @fires Searchbar#RadioTriggerSearchbarCreateRecommendedList
     * @returns {void}
     */
    initialize: function (config) {
        if (config.minChars) {
            this.setMinChars(config.minChars);
        }
        if (config.layerTypes) {
            this.setLayerTypes(config.layerTypes);
        }
        if (config.gfiOnClick) {
            this.setGfiOnClick(config.gfiOnClick);
        }
        this.listenTo(Radio.channel("Searchbar"), {
            "search": this.prepSearch
        });
    },

    /**
     * description
     * @param {string} searchString String to search for in properties of all model's features
     * @fires Core.ModelList#RadioRequestModelListGetModelsByAttributes
     * @fires Searchbar#RadioTriggerSearchbarPushHits
     * @fires Searchbar#RadioTriggerSearchbarCreateRecommendedList
     * @returns {void}
     */
    prepSearch: function (searchString) {
        const visibleGroupLayers = Radio.request("ModelList", "getModelsByAttributes", {isVisibleInMap: true, typ: "GROUP"}),
            layerTypes = this.get("layerTypes");

        if (this.get("inUse") === false && searchString.length >= this.get("minChars")) {
            let vectorLayerModels = [],
                foundMatchingFeatures = [],
                filteredModels = [],
                concatedfoundMatchingFeatures = [];

            this.setInUse(true);

            layerTypes.forEach(layerType => {
                vectorLayerModels = vectorLayerModels.concat(Radio.request("ModelList", "getModelsByAttributes", {isVisibleInMap: true, typ: layerType}));
            });

            vectorLayerModels = vectorLayerModels.concat(this.filterVisibleGroupLayer(visibleGroupLayers, layerTypes));

            filteredModels = vectorLayerModels.filter(model => {
                return model.has("searchField") === true && model.get("searchField") !== "";
            });

            foundMatchingFeatures = this.findMatchingFeatures(filteredModels, searchString);
            concatedfoundMatchingFeatures = [].concat(...foundMatchingFeatures);

            if (concatedfoundMatchingFeatures.length > 0) {
                Radio.trigger("Searchbar", "pushHits", "hitList", concatedfoundMatchingFeatures);
                Radio.trigger("Searchbar", "createRecommendedList", "visibleVector");
            }
            this.setInUse(false);
        }
    },

    /**
     * Filters the allowed layers from the visible group layers.
     * @param {Array} visibleGroupLayers visible group layers freom modelList
     * @param {String[]} layerTypes possible layer types
     * @returns {Array} filterd layers
     */
    filterVisibleGroupLayer: function (visibleGroupLayers, layerTypes) {
        const vectorLayerModels = [];

        visibleGroupLayers.forEach(groupLayer => {
            const vectorLayerFromGroup = groupLayer.get("layerSource").filter(childLayer => {
                return layerTypes.includes(childLayer.get("typ"));
            });

            vectorLayerModels.push(vectorLayerFromGroup);
        });

        return Array.isArray(vectorLayerModels) ? vectorLayerModels.reduce((acc, val) => acc.concat(val), []) : vectorLayerModels;
    },

    /**
     * Checks if given feature is actually a clustered feature with content
     * @param {object} oFeature Feature to test as cluster
     * @returns {boolean} Flag if feature is a cluster
     */
    isClusteredFeature: function (oFeature) {
        return Array.isArray(oFeature.get("features")) && oFeature.get("features").length > 0;
    },

    /**
     * Same as Feature.get() but if Feature is actually a cluster, it returns the value of the
     * first child feature found.
     * @param {object} oFeature The feature object to read the value from
     * @param {string} sProperty Property Key
     * @returns {mixed} Requested feature property value
     */
    getWithClusterFallback: function (oFeature, sProperty) {
        if (!this.isClusteredFeature(oFeature)) {
            return oFeature.get(sProperty);
        }
        return oFeature.get("features")[0].get(sProperty);
    },

    /**
     * Filters (clustered) features according to given search string.
     * @param {array} features Array of features to filter
     * @param {string} searchField Feature field key to look for value
     * @param {string} searchString Given string to search inside features
     * @returns {array} Array of features containing searched string
     */
    filterFeaturesArrayRec: function (features, searchField, searchString) {
        let filteredFeatures = [];

        filteredFeatures = features.filter(feature => {
            let filteredSubFeatures = [],
                testFieldValue = "";

            // if feature is clustered
            if (this.isClusteredFeature(feature)) {
                // enter recursion
                filteredSubFeatures = this.filterFeaturesArrayRec(feature.get("features"), searchField, searchString);

                // set sub features for this cluster
                if (filteredSubFeatures.length > 0) {
                    feature.set("features", filteredSubFeatures);
                    return true;
                }
                // filter this feature when no sub feature is left
                return false;
            }

            // if this key is not set, filter
            if (feature.get(searchField) === undefined) {
                return false;
            }

            testFieldValue = feature.get(searchField).toString().toUpperCase();

            // test if property value contains searched string as substring
            return testFieldValue.indexOf(searchString.toUpperCase()) !== -1;
        });

        return filteredFeatures;
    },

    /**
     * Filters features of all models according to given search string. Searched Fields are
     * defined in config.
     * @param {array} models Array of models to pick features from
     * @param {string} searchString Given string to search inside features
     * @returns {array} Array of features containing searched string
     */
    findMatchingFeatures: function (models, searchString) {
        const resultFeatures = [];

        models.forEach(model => {
            const features = model.get("layer").getSource().getFeatures();

            let filteredFeatures,
                searchFields = model.get("searchField");

            if (Array.isArray(searchFields) === false) {
                searchFields = [searchFields];
            }

            searchFields.forEach(searchField => {
                filteredFeatures = this.filterFeaturesArrayRec(features, searchField, searchString, []);
                resultFeatures.push(this.getFeatureObject(searchField, filteredFeatures, model));
            });
        });

        return resultFeatures;
    },

    /**
     * Gets a new feature object.
     * @param  {string} searchField Attribute feature has to be searche through
     * @param  {ol.Feature} filteredFeatures openlayers feature
     * @param  {Backbone.Model} model model of visibleVector
     * @return {array} array with feature objects
     */
    getFeatureObject: function (searchField, filteredFeatures, model) {
        const featureArray = [];

        filteredFeatures.forEach(feature => {
            const featureObject = {
                // "bezeichnung" hard coded? Or use searchField?
                name: this.getWithClusterFallback(feature, searchField),
                type: model.get("name"),
                coordinate: this.getCentroidPoint(feature.getGeometry()),
                imageSrc: this.getImageSource(feature, model),
                id: Radio.request("Util", "uniqueId", model.get("name")),
                layer_id: model.get("id"),
                additionalInfo: this.getAdditionalInfo(model, feature),
                feature: feature,
                gfiAttributes: model.get("gfiAttributes")
            };

            if (this.getGfiOnClick() === true) {
                featureObject.triggerEvent = {
                    channel: "VisibleVector",
                    event: "gfiOnClick"
                };
            }

            featureArray.push(featureObject);
        });
        return featureArray;
    },

    /**
     * Gets centroid point for a openlayers geometry.
     * @param  {ol.geom.Geometry} geometry geometry to get centroid from
     * @return {ol.Coordinate} centroid coordinate
     */
    getCentroidPoint: function (geometry) {
        let coordinates;

        if (geometry.getType() === "Point") {
            coordinates = geometry.getCoordinates().slice(0, 2);
        }
        else {
            coordinates = this.getCenterFromExtent(geometry.getExtent());
        }

        return coordinates;
    },

    /**
     * Creates the center coordinate from a given extent.
     * @param {Number[]} extent - extent
     * @returns {Number[]} center coordinate
     */
    getCenterFromExtent: function (extent) {
        const deltaY = extent[2] - extent[0],
            deltaX = extent[3] - extent[1],
            centerY = extent[0] + deltaY / 2,
            centerX = extent[1] + deltaX / 2;

        return [centerY, centerX];
    },

    /**
     * Returns an image source of a feature style.
     * @param  {ol.Feature} feature openlayers feature
     * @param  {Backbone.Model} model model to get layer to get style from
     * @return {String|undefined} imagesource
     */
    getImageSource: function (feature, model) {
        let layerStyle,
            imageSource;

        if (feature.getGeometry().getType() === "Point" || feature.getGeometry().getType() === "MultiPoint") {
            layerStyle = model.get("layer").getStyle(feature);

            if (typeof layerStyle === "function") {
                layerStyle = layerStyle(feature);
            }

            if (Array.isArray(layerStyle)) {
                imageSource = this.getImageSourceFromStyle(layerStyle[0]);
            }
            else {
                imageSource = this.getImageSourceFromStyle(layerStyle);
            }
        }

        return imageSource;
    },

    /**
     * Checks if style is an image and then returns its image source.
     * @param {Style} layerStyle Style of layer.
     * @returns {undefined|String} - Image source of image style.
     */
    getImageSourceFromStyle: function (layerStyle) {
        let imageSource;

        if (layerStyle.getImage() instanceof Icon) {
            imageSource = layerStyle.getImage().getSrc();
        }
        else {
            console.warn("Point Style is not an image. returning undefined.");
        }
        return imageSource;
    },

    /**
     * Get additional feature info.
     * @param {object} model model to get feature from
     * @param {object} feature feature to get info from
     * @returns {mixed} found additional info
     */
    getAdditionalInfo: function (model, feature) {
        let additionalInfo;

        if (model.get("additionalInfoField") !== undefined) {
            additionalInfo = this.getWithClusterFallback(feature, model.get("additionalInfoField"));
        }

        return additionalInfo;
    },

    /**
     * Setter for minChars property
     * @param {mixed} value todo
     * @returns {void}
     */
    setMinChars: function (value) {
        this.set("minChars", value);
    },

    /**
     * Setter for layerTypes property
     * @param {mixed} value todo
     * @returns {void}
     */
    setLayerTypes: function (value) {
        this.set("layerTypes", value);
    },

    /**
     * Getter for layerTypes property
     * @returns {mixed} todo
     */
    getLayerTypes: function () {
        return this.get("layerTypes");
    },

    /**
     * Setter for gfiOnClick property
     * @param {boolean} value todo
     * @returns {void}
     */
    setGfiOnClick: function (value) {
        this.set("gfiOnClick", value);
    },

    /**
     * Getter for gfiOnClick property
     * @returns {boolean} todo
     */
    getGfiOnClick: function () {
        return this.get("gfiOnClick");
    },

    /**
     * Setter for inUse property
     * @param {boolean} value todo
     * @returns {void}
     */
    setInUse: function (value) {
        this.set("inUse", value);
    }
});

export default VisibleVectorModel;
