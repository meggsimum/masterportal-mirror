import {generateSimpleMutations} from "../../../app-store/utils/generators";
import initialState from "./stateMap";
import getters from "./gettersMap";
import BaseLayer from "ol/layer/Base";
import findWhereJs from "../../../utils/findWhereJs";

const mutations = {
    ...generateSimpleMutations(initialState),

    /**
     * Adds the given layer to the top of this map.
     * @param {Object} state the state.
     * @param {module:ol/layer/Base} layer - The given layer.
     * @returns {void}
     */
    addLayerToMap (state, layer) {
        if (layer instanceof BaseLayer) {
            mapCollection.getMap("2D").addLayer(layer);
        }
    },

    /**
     * Adds a layerId to the array of all complete loaded layers.
     * @param {Object} state the state.
     * @param {String} layerId The ID of the layer that is loaded completely
     * @returns {void}
     */
    addLoadedLayerId (state, layerId) {
        state.loadedLayers.push(layerId);
    },

    /**
     * Removes the given layer from the map.
     * @param {Object} state the state.
     * @param {module:ol/layer/Base} layer - The given layer.
     * @returns {void}
     */
    removeLayerFromMap (state, layer) {
        if (mapCollection.getMap("2D") && layer instanceof BaseLayer) {
            mapCollection.getMap("2D").removeLayer(layer);
        }
    },

    /**
     * Sets the bounding box for the map view.
     * @param {Object} state the state.
     * @param {Number[]} bbox The Boundingbox to fit the map.
     * @returns {void}
     */
    setBBox (state, {bbox}) {
        if (bbox) {
            getters.getView().fit(bbox, mapCollection.getMap("2D").getSize());
        }
    },

    /**
     * Sets the opacity of a layer.
     * @param {Object} state the state
     * @param {Object} payload parameter object
     * @param {String} payload.layerId id of layer to change opacity of
     * @param {Number} payload.opacity opacity value in range (0, 1)
     * @returns {void}
     */
    setLayerOpacity (state, {layerId, opacity}) {
        getters.layers(state)[layerId].opacity = opacity;
    },

    /**
     * Sets the visibility of a layer.
     * @param {Object} state the state
     * @param {Object} payload parameter object
     * @param {String} payload.layerId id of layer to set visibility of
     * @param {Boolean} payload.visibility isVisible
     * @returns {void}
     */
    setLayerVisibility (state, {layerId, visibility}) {
        getters.layers(state)[layerId].visibility = visibility;
    },

    /**
     * finds the right resolution for the scale and sets it for this view
     * @param {Object} state the state.
     * @param {Number} scale - map view scale
     * @returns {void}
     */
    setResolutionByScale (state, scale) {
        const params = findWhereJs(getters.getView().get("options"), {scale: scale});

        if (getters.getView() !== undefined) {
            getters.getView().setResolution(params.resolution);
        }
    },

    /**
     * Sets the scales for the map.
     * @param {Object} state the state
     * @param {String} scales list of scales
     * @returns {void}
     */
    setScales (state, scales) {
        state.scales = scales;
    },

    /**
     * Set map size to state.
     * @param {Object} state The state.
     * @param {Event} evt The change size event of the map.
     * @returns {void}
     */
    setSize (state, evt) {
        state.size = evt.target.getSize();
    }
};

export default mutations;
