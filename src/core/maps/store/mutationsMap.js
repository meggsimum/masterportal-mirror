import {generateSimpleMutations} from "../../../app-store/utils/generators";
import initialState from "./stateMap";
import getters from "./gettersMap";
import BaseLayer from "ol/layer/Base";
import mapCollection from "../../../core/dataStorage/mapCollection.js";
import findWhereJs from "../../../utils/findWhereJs";

const mutations = {
    ...generateSimpleMutations(initialState),
    /**
     * Set the center of the current view.
     * @param {Object} state - the map state
     * @param {Number[]} coord - an array of numbers representing an xy coordinate
     * @returns {void}
     */
    setCenter (state, coord) {
        if (Array.isArray(coord) && coord.length === 2 && typeof coord[0] === "number" && typeof coord[1] === "number") {
            state.center = coord;
        }
        else {
            console.warn("Center was not set. Probably there is a data type error. The format of the coordinate must be an array with two numbers.");
        }
    },
    /**
     * Sets the visibility of a layer.
     * @param {Object} state state object
     * @param {Object} payload parameter object
     * @param {String} payload.layerId id of layer to set visibility of
     * @param {Boolean} payload.visibility isVisible
     * @returns {void}
     */
    setLayerVisibility (state, {layerId, visibility}) {
        getters.layers(state)[layerId].visibility = visibility;
    },
    /**
     * Sets the opacity of a layer.
     * @param {Object} state state object
     * @param {Object} payload parameter object
     * @param {String} payload.layerId id of layer to change opacity of
     * @param {Number} payload.opacity opacity value in range (0, 1)
     * @returns {void}
     */
    setLayerOpacity (state, {layerId, opacity}) {
        getters.layers(state)[layerId].opacity = opacity;
    },
    /**
     * Sets the scales for the map.
     * @param {Object} state state object
     * @param {String} scales list of scales
     * @returns {void}
     */
    setScales (state, scales) {
        state.scales = scales;
    },

    /**
     * Adds the given layer to the top of this map.
     * @param {Object} state - The map state.
     * @param {module:ol/layer/Base} layer - The given layer.
     * @returns {void}
     */
    addLayerToMap (state, layer) {
        if (layer instanceof BaseLayer) {
            mapCollection.getMap("ol", "2D").addLayer(layer);
        }
    },

    /**
     * Removes the given layer from the map.
     * @param {Object} state - The map state.
     * @param {module:ol/layer/Base} layer - The given layer.
     * @returns {void}
     */
    removeLayerFromMap (state, layer) {
        if (mapCollection.getMap("ol", "2D") && layer instanceof BaseLayer) {
            mapCollection.getMap("ol", "2D").removeLayer(layer);
        }
    },
    /**
     * Adds a layerId to the array of all complete loaded layers.
     * @param {Object} state The state object.
     * @param {String} layerId The ID of the layer that is loaded completely
     * @returns {void}
     */
    addLoadedLayerId (state, layerId) {
        state.layerIds.push(layerId);
    },
    /**
     * Sets the bounding box for the map view.
     * @param {Object} state The state object.
     * @param {Number[]} bbox The Boundingbox to fit the map.
     * @param {Object} [map] The parameter to get the map from the map collection
     * @param {String} [map.mapId="ol"] The map id.
     * @param {String} [map.mapMode="2D"] The map mode.
     * @returns {void}
     */
    setBBox (state, {bbox, map = {mapId: "ol", mapMode: "2D"}}) {
        if (bbox) {
            getters.getView().fit(bbox, mapCollection.getMap(map.mapId, map.mapMode).getSize());
        }
    },
    /**
     * finds the right resolution for the scale and sets it for this view
     * @param {Object} state The state object.
     * @param {Number} scale - map view scale
     * @returns {void}
     */
    setResolutionByScale (state, scale) {
        const params = findWhereJs(getters.getView().get("options"), {scale: scale});

        if (getters.getView() !== undefined) {
            getters.getView().setResolution(params.resolution);
        }
    }
};

export default mutations;
