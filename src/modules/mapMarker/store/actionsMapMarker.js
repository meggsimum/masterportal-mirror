import {fetchFirstModuleConfig} from "../../../utils/fetchFirstModuleConfig";
import Point from "ol/geom/Point.js";
import Feature from "ol/Feature.js";

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
     * With this function the coordinate, which has to be marked by the mapMarker, is written to the MapMarker state.
     * @param {String[]} value The array with the markable coordinate pair.
     * @returns {void}
     */
    placingPointMarker ({state, rootState, rootGetters, commit, dispatch}, value) {
        const styleListModel = Radio.request("StyleList", "returnModelById", state.pointStyleId);
        let coordValues = [];

        dispatch("removePointMarker");

        if (styleListModel) {
            if (rootState.Map.mapMode === "3D") {
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
            rootGetters["Map/ol2DMap"].addLayerOnTop(state.markerPoint);
        }
        else {
            dispatch("Alerting/addSingleAlert", i18next.t("common:modules.mapMarker.noStyleModel", {styleId: state.pointStyleId}), {root: true});
        }
    },

    /**
     * This function has the task to remove the coordinate from the mapMarker state.
     * This is necessary / triggered if the MapMarker should be removed.
     * @returns {void}
     */
    removePointMarker ({state, rootGetters, commit}) {
        rootGetters["Map/ol2DMap"].removeLayer(state.markerPoint);
        commit("clearMarker", "markerPoint");
        commit("setVisibilityMarker", {visbility: false, marker: "markerPoint"});
    },
    /**
     * Rotates the point marker.
     * @param {Object} param.commit the commit
     * @param {Object} param.getters the getters
     * @param {Number} angle angle to rotate
     * @returns {void}
     */
    rotatePointMarker ({commit, getters}, angle) {
        const features = getters.markerPoint?.getSource().getFeatures();

        if (features && features.length > 0) {
            const feature = features[0],
                icon = feature.getStyle().getImage().clone();

            icon.setRotation(angle * Math.PI / 180);
            feature.getStyle().setImage(icon);
            commit("clearMarker", "markerPoint");
            commit("addFeatureToMarker", {feature: feature, marker: "markerPoint"});
        }
    },

    /**
     * Converts polygon to the wkt format and add this to the map.
     * @param {ol/Feature} feature The ol feature that is added to the map.
     * @returns {void}
     */
    placingPolygonMarker ({state, rootGetters, commit, dispatch}, feature) {
        const styleListModel = Radio.request("StyleList", "returnModelById", state.polygonStyleId);

        dispatch("removePolygonMarker");

        if (styleListModel) {
            const featureStyle = styleListModel.createStyle(feature, false);

            feature.setStyle(featureStyle);
            commit("addFeatureToMarker", {feature: feature, marker: "markerPolygon"});
            commit("setVisibilityMarker", {visibility: true, marker: "markerPolygon"});
            rootGetters["Map/ol2DMap"].addLayerOnTop(state.markerPolygon);
        }
        else {
            dispatch("Alerting/addSingleAlert", i18next.t("common:modules.mapMarker.noStyleModel", {styleId: state.polygonStyleId}), {root: true});
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
    placingPolygonMarkerByGeom ({state, rootGetters, commit, dispatch}, geometry) {
        const styleListModel = Radio.request("StyleList", "returnModelById", state.polygonStyleId);

        dispatch("removePolygonMarker");

        if (styleListModel && geometry) {
            const feature = new Feature({
                    geometry: geometry
                }),
                featureStyle = styleListModel.createStyle(feature, false);

            feature.setStyle(featureStyle);
            commit("addFeatureToMarker", {feature: feature, marker: "markerPolygon"});
            commit("setVisibilityMarker", {visibility: true, marker: "markerPolygon"});
            rootGetters["Map/ol2DMap"].addLayerOnTop(state.markerPolygon);
        }
        else {
            dispatch("Alerting/addSingleAlert", i18next.t("common:modules.mapMarker.noStyleModel", {styleId: state.polygonStyleId}), {root: true});
        }
    },

    /**
     * Removes the polygon map marker from the map.
     * @returns {void}
     */
    removePolygonMarker: function ({state, rootGetters, commit}) {
        rootGetters["Map/ol2DMap"].removeLayer(state.markerPolygon);
        commit("clearMarker", "markerPolygon");
        commit("setVisibilityMarker", {visbility: false, marker: "markerPolygon"});
    }
};
