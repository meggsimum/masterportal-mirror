import {generateSimpleGetters} from "../../../app-store/utils/generators";
import initialState from "./stateMap";

const getters = {
    ...generateSimpleGetters(initialState),
    /**
     * Returns the 2D map
     *
     * @param {Object} state Current state object of the store.
     * @returns {Object} Returns the 2D map.
     */
    get2DMap (state) {
        const xyz = state;

        return xyz;
    },
    /**
     * Returns
     *
     * @param {Object} state Current state object of the store.
     * @returns {Object} Returns the .
     */
    getLayer (state) {
        const xyz = state;

        return xyz;
    },
    /**
     * Returns
     *
     * @param {Object} state Current state object of the store.
     * @returns {Object} Returns the .
     */
    getLayerList (state) {
        const xyz = state;

        return xyz;
    },
    /**
     * Returns
     *
     * @param {Object} state Current state object of the store.
     * @returns {Object} Returns the .
     */
    getView (state) {
        const xyz = state;

        return xyz;
    },
    /**
     * Returns
     *
     * @param {Object} state Current state object of the store.
     * @returns {Object} Returns the .
     */
    getOverlay (state) {
        const xyz = state;

        return xyz;
    },
    /**
     * Returns
     *
     * @param {Object} state Current state object of the store.
     * @returns {Object} Returns the .
     */
    getResolutionByScale (state) {
        const xyz = state;

        return xyz;
    },
    /**
     * Returns
     *
     * @param {Object} state Current state object of the store.
     * @returns {Object} Returns the .
     */
    getProjectedBBox (state) {
        const xyz = state;

        return xyz;
    },
    /**
     * Returns
     *
     * @param {Object} state Current state object of the store.
     * @returns {Object} Returns the .
     */
    get3DMap (state) {
        const xyz = state;

        return xyz;
    },
    /**
     * Returns
     *
     * @param {Object} state Current state object of the store.
     * @returns {Object} Returns the .
     */
    getCamera (state) {
        const xyz = state;

        return xyz;
    },
    /**
     * Returns
     *
     * @param {Object} state Current state object of the store.
     * @returns {Object} Returns the .
     */
    getGlobe (state) {
        const xyz = state;

        return xyz;
    },
    /**
     * Returns
     *
     * @param {Object} state Current state object of the store.
     * @returns {Object} Returns the .
     */
    getShadowMap (state) {
        const xyz = state;

        return xyz;
    }
};

export default getters;
