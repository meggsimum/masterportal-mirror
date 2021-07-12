import {fetchFirstModuleConfig} from "../../../utils/fetchFirstModuleConfig";
import Point from "ol/geom/Point.js";
import Feature from "ol/Feature.js";
import {MapMode} from "../../map/store/enums";
import {transform, getMapProjection} from "masterportalAPI/src/crs";
import api from "masterportalAPI/abstraction/api";

/**
 * @const {String} configPaths an array of possible config locations. First one found will be used
 * @const {Object} actions vue actions
 */
const configPaths = [
    "configJs.mapMarker"
];

export default {
    /**
     * Sets the config-params of this mapMarker into state.
     * @param {Object} context The context Vue instance.
     * @returns {Boolean} false, if config does not contain the mapMarker.
     */
    initialize: context => {
        return fetchFirstModuleConfig(context, configPaths, "MapMarker", false);
    },

    /**
     * Checks if the MapMarker should be set initially by the url param "marker".
     * The coordinates are projected if the parameter "projection" was specified.
     * @returns {void}
     */
    activateByUrlParam: ({rootState, dispatch}) => {
        const queryParams = rootState.queryParams;

        if (queryParams instanceof Object && queryParams?.marker) {
            let coordinates = queryParams.marker.split(",").map(coordinate => parseFloat(coordinate, 10));

            if (queryParams?.projection) {
                coordinates = transform(queryParams.projection, getMapProjection(rootState?.Map?.map), coordinates);
            }

            dispatch("placingPointMarker", coordinates);
        }
    },

    /**
     * With this function the coordinate, which has to be marked by the mapMarker, is written to the MapMarker state.
     * @param {String[]} value The array with the markable coordinate pair.
     * @returns {void}
     */
    placingPointMarker ({getters, rootState, commit, dispatch}, value) {
        const styleListModel = Radio.request("StyleList", "returnModelById", getters.pointStyleId);
        let coordValues = [];

        dispatch("removePointMarker");

        if (styleListModel) {
            if (rootState.Map.mapMode === MapMode.MODE_3D) {
                // else an error is thrown in proj4/lib/checkSanity: coordinates must be finite numbers
                value.forEach(val => {
                    coordValues.push(Math.round(val));
                });
            }
            else {
                coordValues = value;
            }
            const iconfeature = new Feature({
                    geometry: new Point(coordValues)
                }),
                featureStyle = styleListModel.createStyle(iconfeature, false);

            iconfeature.setStyle(featureStyle);
            commit("addFeatureToMarker", {feature: iconfeature, marker: "markerPoint"});
            commit("setVisibilityMarker", {visibility: true, marker: "markerPoint"});
            api.map.get2DMap().addLayer(getters.markerPoint);
        }
        else {
            dispatch("Alerting/addSingleAlert", i18next.t("common:modules.mapMarker.noStyleModel", {styleId: getters.pointStyleId}), {root: true});
        }
    },

    /**
     * This function has the task to remove the coordinate from the mapMarker state.
     * This is necessary / triggered if the MapMarker should be removed.
     * @returns {void}
     */
    removePointMarker ({getters, commit}) {
        api.map.get2DMap().removeLayer(getters.markerPoint);
        commit("clearMarker", "markerPoint");
        commit("setVisibilityMarker", {visbility: false, marker: "markerPoint"});
    },

    /**
     * Converts polygon to the wkt format and add this to the map.
     * @param {ol/Feature} feature The ol feature that is added to the map.
     * @returns {void}
     */
    placingPolygonMarker ({getters, commit, dispatch}, feature) {
        const styleListModel = Radio.request("StyleList", "returnModelById", getters.polygonStyleId);

        dispatch("removePolygonMarker");

        if (styleListModel) {
            const featureStyle = styleListModel.createStyle(feature, false);

            feature.setStyle(featureStyle);
            commit("addFeatureToMarker", {feature: feature, marker: "markerPolygon"});
            commit("setVisibilityMarker", {visibility: true, marker: "markerPolygon"});
            api.map.get2DMap().addLayer(getters.markerPolygon);
        }
        else {
            dispatch("Alerting/addSingleAlert", i18next.t("common:modules.mapMarker.noStyleModel", {styleId: getters.polygonStyleId}), {root: true});
        }
    },

    /**
     * Creates a feature from the given geometry and adds it to the map.
     * @param {Object} store.getters - The Map Marker getters.
     * @param {Function} store.commit - Function to commit a mutation.
     * @param {Function} store.dispatch Function to dispatch an action.
     * @param {module:ol/geom/SimpleGeometry} geometry - The given geometry.
     * @returns {void}
     */
    placingPolygonMarkerByGeom ({getters, commit, dispatch}, geometry) {
        const styleListModel = Radio.request("StyleList", "returnModelById", getters.polygonStyleId);

        dispatch("removePolygonMarker");

        if (styleListModel && geometry) {
            const feature = new Feature({
                    geometry: geometry
                }),
                featureStyle = styleListModel.createStyle(feature, false);

            feature.setStyle(featureStyle);
            commit("addFeatureToMarker", {feature: feature, marker: "markerPolygon"});
            commit("setVisibilityMarker", {visibility: true, marker: "markerPolygon"});
            api.map.get2DMap().addLayer(getters.markerPolygon);
        }
        else {
            dispatch("Alerting/addSingleAlert", i18next.t("common:modules.mapMarker.noStyleModel", {styleId: getters.polygonStyleId}), {root: true});
        }
    },

    /**
     * Removes the polygon map marker from the map.
     * @returns {void}
     */
    removePolygonMarker: function ({getters, commit}) {
        api.map.get2DMap().removeLayer(getters.markerPolygon);
        commit("clearMarker", "markerPolygon");
        commit("setVisibilityMarker", {visbility: false, marker: "markerPolygon"});
    }
};
