import {unByKey as unlistenByKey} from "ol/Observable.js";

export default {
    /**
     * Adds an interaction to the map.
     * @param {module:ol/interaction/Interaction} interaction - Interaction to be added to map.
     * @returns {void}
     */
    addInteraction ({getters}, interaction) {
        const map = getters.get2DMap;

        map.addInteraction(interaction);
    },
    /**
     * Reduces the zoomlevel by one.
     * @returns {void}
     */
    decreaseZoomLevel ({dispatch, getters}) {
        dispatch("setZoomLevel", getters.getView.getZoom() - 1);
    },
    /**
     * Increases the zoomlevel by one.
     * @returns {void}
     */
    increaseZoomLevel ({dispatch, getters}) {
        dispatch("setZoomLevel", getters.getView.getZoom() + 1);
    },
    /**
     * Registered listener for certain events on the map.
     * @see https://openlayers.org/en/latest/apidoc/module-ol_Map-Map.html
     * @param {Object} payload parameter object
     * @param {String | Object} payload.event The event type or an object used as a key.
     * @param {Function} payload.callback The callback function.
     * @param {Object} payload.context The context.
     * @returns {void}
     */
    registerListener ({getters}, {event, callback, context}) {
        const view = getters.getView;

        view.on(event, callback, context);
    },
    /**
     * Removes an interaction from the map.
     * @param {module:ol/interaction/Interaction} interaction - Interaction to be removed from map.
     * @returns {void}
     */
    removeInteraction ({getters}, interaction) {
        const map = getters.get2DMap;

        map.removeInteraction(interaction);
    },
    /**
     * Sets center and resolution to initial values.
     * @returns {void}
     */
    resetView ({state, dispatch, getters}) {
        const view = getters.getView;

        view.setCenter(state.initialCenter);
        view.setResolution(state.initialResolution);
        dispatch("MapMarker/removePointMarker", null, {root: true});
    },
    /**
     * Sets the Background for the Mapview.
     * @param  {string} value Image Url
     * @returns {void}
     */
    setBackground ({getters}, value) {
        const view = getters.getView;

        view.background = value;
    },
    /**
     * Sets the center of the current view.
     * @param {number[]} coords An array of numbers representing a xy-coordinate.
     * @returns {void}
     */
    setCenter ({commit, getters}, coords) {
        let first2Coords = [coords[0], coords[1]];

        if (first2Coords.some(coord => typeof coord !== "number")) {
            console.warn("Given coordinates must be of type integer! Although it might not break, something went wrong and needs to be checked!");
            first2Coords = first2Coords.map(singleCoord => parseInt(singleCoord, 10));
        }
        if (Array.isArray(first2Coords) && first2Coords.length === 2) {
            commit("setCenter", coords);
            getters.getView.setCenter(coords);
        }
        else {
            console.warn("Center was not set. Probably there is a data type error. The format of the coordinate must be an array with two numbers.");
        }
    },
    /**
     * Sets a new zoom level to map and store. All other fields will be updated onmoveend.
     * @param {Number} zoomLevel The zoomLevel to zoom to.
     * @returns {void}
     */
    setZoomLevel ({getters}, zoomLevel) {
        const view = getters.getView;

        if (zoomLevel <= view.getMaxZoom() && zoomLevel >= view.getMinZoom()) {
            view.setZoom(zoomLevel);
        }
    },
    /**
     * toggles the maps background
     * @returns {void}
     */
    toggleBackground ({state, dispatch, getters}) {
        const view = getters.getView;

        if (view.background === "white") {
            dispatch("setBackground", state.backgroundImage);
            document.getElementById("map").style.background = `url(${state.backgroundImage}) repeat scroll 0 0 rgba(0, 0, 0, 0)`;
        }
        else {
            dispatch("setBackground", "white");
            document.getElementById("map").style.background = "white";
        }
    },
    /**
     * Unsubscribes listener to certain events.
     * @param {Object} payload parameter object
     * @param {String | Object} payload.event The event type or an object used as a key.
     * @param {Function} payload.callback The callback function.
     * @param {Object} payload.context The context.
     * @returns {void}
     */
    unregisterListener ({getters}, {event, callback, context}) {
        const view = getters.getView;

        if (typeof event === "string") {
            view.un(event, callback, context);
        }
        else {
            unlistenByKey(event);
        }
    }
};
