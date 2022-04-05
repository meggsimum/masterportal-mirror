import {getProjection, getProjections, transformToMapProjection, transformFromMapProjection, transform} from "masterportalapi/src/crs";
import {getLayerWhere, getLayerList, getDisplayNamesOfFeatureAttributes} from "masterportalapi/src/rawLayerList";

const RadioMasterportalAPI = Backbone.Model.extend(/** @lends RadioMasterportalAPI */{
    defaults: {},

    /**
     * @class RadioMasterportalAPI
     * @description This model contains listeners for the radio.events of the channels CRS and RawLayerList
     * to guarantee backward compatibility via the remote interface.
     * @extends Backbone.Model
     * @memberOf RemoteInterface
     * @constructs
     * @listens RemoteInterface#RadioRequestCRSGetProjection
     * @listens RemoteInterface#RadioRequestCRSGetProjections
     * @listens RemoteInterface#RadioRequestCRSTransformToMapProjection
     * @listens RemoteInterface#RadioRequestCRSTransformFromMapProjection
     * @listens RemoteInterface#RadioRequestCRSTransform
     * @listens RemoteInterface#RadioRequestRawLayerListGetLayerWhere
     * @listens RemoteInterface#RadioRequestRawLayerListGetLayerAttributesWhere
     * @listens RemoteInterface#RadioRequestRawLayerListGetLayerListWhere
     * @listens RemoteInterface#RadioRequestRawLayerListGetLayerList
     * @listens RemoteInterface#RadioRequestRawLayerListGetDisplayNamesOfFeatureAttributes
     */
    initialize: function () {
        Radio.channel("CRS").reply({
            "getProjection": this.getProjection,
            "getProjections": this.getProjections,
            "transformToMapProjection": this.transformToMapProjection,
            "transformFromMapProjection": this.transformFromMapProjection,
            "transform": this.transform
        }, this);

        Radio.channel("RawLayerList").reply({
            "getLayerWhere": this.getLayerWhere,
            "getLayerAttributesWhere": this.getLayerAttributesWhere,
            "getLayerListWhere": this.getLayerListWhere,
            "getLayerAttributesList": this.getLayerList,
            "getDisplayNamesOfFeatureAttributes": this.getDisplayNamesOfFeatureAttributes
        }, this);
    },

    /**
     * Returns the proj4 projection definition for a registered name.
     * @param {string} name - projection name as written in [0] position of namedProjections
     * @returns {(object|undefined)} proj4 projection object or undefined
     */
    getProjection: function (name) {
        return getProjection(name);
    },

    /**
     * Returns all known projections.
     * @returns {object[]} array of projection objects with their name added
     */
    getProjections: function () {
        return getProjections();
    },

    /**
     * Projects a point to the given map.
     * @param {ol.Map} map - map to project to
     * @param {(string|object)} sourceProjection - projection name or projection of point
     * @param {number[]} point - point to project
     * @returns {number[]|undefined} new point or undefined
     */
    transformToMapProjection: function (map, sourceProjection, point) {
        return transformToMapProjection(map, sourceProjection, point);
    },

    /**
     * Projects a point from the given map.
     * @param {ol.Map} map - map to project from, and point must be in map's projection
     * @param {(string|object)} targetProjection - projection name or projection to project to
     * @param {number[]} point - point to project
     * @returns {(number[]|undefined)} new point or undefined
     */
    transformFromMapProjection: function (map, targetProjection, point) {
        return transformFromMapProjection(map, targetProjection, point);
    },

    /**
     * Transforms a given point from a source to a target projection.
     * @param {(string|object)} sourceProjection - projection name or projection of point
     * @param {(string|object)} targetProjection - projection name or projection to project point to
     * @param {number[]} point - point to project
     * @returns {number[]|undefined} transformed point
     */
    transform: function (sourceProjection, targetProjection, point) {
        return transform(sourceProjection, targetProjection, point);
    },

    /**
     * Returns the first entry in layerList matching the given searchAttributes.
     * @param {object} searchAttributes - key/value-pairs to be searched for, e.g. { typ: "WMS" } to get the first WMS
     * @returns {?object} first layer matching the searchAttributes or null if none was found
     */
    getLayerWhere: function (searchAttributes) {
        return getLayerWhere(searchAttributes);
    },

    /**
     * Returns the first entry in layerList matching the given searchAttributes.
     * @param {object} searchAttributes - key/value-pairs to be searched for, e.g. { typ: "WMS" } to get the first WMS
     * @returns {?object} first layer matching the searchAttributes or null if none was found
     */
    getLayerAttributesWhere: function (searchAttributes) {
        return getLayerWhere(searchAttributes) ? getLayerWhere(searchAttributes).toJSON() : null;
    },

    /**
     * Returns an array of all models that match the given attributes.
     * @param  {Object} searchAttributes key/value-pairs to be searched for, e.g. { typ: "WMS" } to get the first WMS
     * @return {Backbone.Model[]} - List of the models
     */
    getLayerListWhere: function (searchAttributes) {
        return getLayerList().where(searchAttributes);
    },

    /** @returns {object[]} complete layerList as initialized */
    getLayerList: function () {
        return getLayerList();
    },

    /**
     * Returns display names map for a layer, or display name for a specific attribute.
     * @param {string} layerId - if of layer to fetch display names for
     * @param {string} [featureAttribute] - if given, only one entry of map is returned
     * @returns {?(object|string)} - map of originalName->displayName or name of featureAttribute if specified; if layer or featureAttribute not found, null
     */
    getDisplayNamesOfFeatureAttributes: function (layerId, featureAttribute = "gfiAttributes") {
        return getDisplayNamesOfFeatureAttributes(layerId, featureAttribute);
    }
});

export default RadioMasterportalAPI;
