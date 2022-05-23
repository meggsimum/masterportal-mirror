import {toStringHDMS, toStringXY} from "ol/coordinate.js";
import isMobile from "../../../../utils/isMobile";

export default {
    /**
     * Dispatches the action to copy the given element to the clipboard.
     *
     * @param {Element} el element to copy
     * @returns {void}
     */
    copyToClipboard ({dispatch}, el) {
        dispatch("copyToClipboard", el, {root: true});
    },
    /**
     * Remembers the projection and shows mapmarker at the given position.
     * @param {Event} event - pointerdown-event, to get the position from
     * @returns {void}
     */
    positionClicked: function ({commit, dispatch, state}, event) {
        const updatePosition = isMobile() ? true : state.updatePosition,
            position = event.coordinate;

        commit("setPositionMapProjection", position);
        dispatch("changedPosition", position);
        commit("setUpdatePosition", !updatePosition);

        dispatch("MapMarker/placingPointMarker", position, {root: true});
    },
    /**
     * Sets the current projection and its name to state.
     * @returns {void}
     */
    newProjectionSelected ({commit, state, getters}) {
        const targetProjectionName = state.currentSelection,
            targetProjection = getters.getProjectionByName(targetProjectionName);

        commit("setCurrentProjectionName", targetProjectionName);
        commit("setCurrentProjection", targetProjection);
    },
    /**
     * Delegates the calculation and transformation of the position according to the projection
     * @returns {void}
     */
    changedPosition ({dispatch, state, getters}) {
        const targetProjectionName = state.currentSelection,
            position = getters.getTransformedPosition(mapCollection.getMap("2D"), targetProjectionName);

        if (position) {
            dispatch("adjustPosition", {position: position, targetProjection: state.currentProjection});
        }
    },
    /**
     * Calculates the clicked position and writes the coordinate-values into the textfields.
     * @param {Number[]} position transformed coordinates
     * @param {Object} targetProjection selected projection
     * @returns {void}
     */
    adjustPosition ({commit}, {position, targetProjection}) {
        let coord, easting, northing;

        if (targetProjection && Array.isArray(position) && position.length === 2) {
            // geographical coordinates
            if (targetProjection.projName === "longlat") {
                coord = toStringHDMS(position);
                easting = coord.substr(0, 13).trim();
                northing = coord.substr(14).trim();
            }
            // cartesian coordinates
            else {
                coord = toStringXY(position, 2);
                easting = coord.split(",")[0].trim();
                northing = coord.split(",")[1].trim();
            }
            commit("setCoordinatesEastingField", easting);
            commit("setCoordinatesNorthingField", northing);
        }
    },
    /**
     * Sets the coordinates from the maps pointermove-event.
     * @param {Event} event pointermove-event, to get the position from
     * @returns {void}
     */
    setCoordinates: function ({state, commit, dispatch}, event) {
        const position = event.coordinate;

        if (state.updatePosition) {
            commit("setPositionMapProjection", position);
            dispatch("changedPosition");
        }
    },
    /**
     * Checks the position for update and shows the marker at updated position
     * @param {Number[]} position contains coordinates of mouse position
     * @returns {void}
     */
    checkPosition ({state, commit, dispatch}, position) {
        if (state.updatePosition) {
            dispatch("MapMarker/placingPointMarker", position, {root: true});

            commit("setPositionMapProjection", position);
        }
    }
};
