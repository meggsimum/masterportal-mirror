import proj4 from "proj4";

export default {
    /**
     * Remembers the projection and shows mapmarker at the given position.
     * @param {Object} context actions context object.
     * @param {Event} event - pointerdown-event, to get the position from
     * @returns {void}
     */
    setMarker: function ({dispatch}, event) {
        dispatch("MapMarker/placingPointMarker", event, {root: true});
    },
    /**
     * Removes the marker from selected position.
     * @param {Object} context actions context object.
     * @returns {void}
     */
    removeMarker: function ({dispatch}) {
        dispatch("MapMarker/removePointMarker", null, {root: true});
    },
    /**
     * Sets the zoom level to the map.
     * @param {Object} context actions context object.
     * @param {Number} zoomLevel - Zoomlevel to zoom to
     * @returns {void}
     */
    setZoom: function ({dispatch}, zoomLevel) {
        dispatch("Maps/setZoomLevel", zoomLevel, {root: true});
    },
    /**
     * Takes the selected coordinates and centers the map to the new position.
     * @param {Object} context actions context object.
     * @param {String[]} coordinates - coordinates for new center position
     * @returns {void}
     */
    setCenter: function ({dispatch}, coordinates) {
        // coordinates come as string and have to be changed to numbers for setCenter from mutations to work.
        const newCoords = [parseFloat(coordinates[0]), parseFloat(coordinates[1])];

        dispatch("Maps/setCenter", newCoords, {root: true});
    },
    /**
     * Pushes the formatted coordinates in the selectedCoordinates String[].
     * @param {Object} context actions context object.
     * @param {String[]} coords the coordinates the user entered
     * @returns {void}
     */
    formatInput ({state, commit, getters}, coords) {
        const {currentSelection} = state,
            formatters = {
                ETRS89: coord=>coord.value,
                WGS84: coord=>coord.value.split(/[\s°′″'"´`]+/),
                "WGS84(Dezimalgrad)": coord=>coord.value.split(/[\s°]+/)
            };

        commit("setSelectedCoordinates", []);
        for (const coord of coords) {
            if (!getters.getEastingError && !getters.getNorthingError) {
                commit("resetErrorMessages");
                commit("pushCoordinates", formatters[currentSelection](coord));
            }
        }
    },
    /**
     * Validates the user-input depending on the selected projection and sets the error messages.
     * @param {Object} context actions context object.
     * @param {Object} coord the coordinate the user entered
     * @returns {void}
     */
    validateInput ({state, commit}, coord) {
        const validETRS89 = /^[0-9]{6,7}[.,]{0,1}[0-9]{0,3}\s*$/,
            validWGS84 = /^\d[0-9]{0,2}[°]{1}\s*[0-9]{0,2}['`´′]{0,1}\s*[0-9]{0,2}['`´′]{0,2}["″]{0,2}\s*$/,
            validWGS84_dez = /[0-9]{1,3}[.,][0-9]{0,5}[\s]{0,1}[°]\s*$/,
            {currentSelection} = state,
            validators = {
                ETRS89: validETRS89,
                WGS84: validWGS84,
                "WGS84(Dezimalgrad)": validWGS84_dez
            };

        if (coord.id === "easting") {
            commit("resetEastingMessages");
            if (coord.value === "") {
                commit("setEastingNoCoord", true);
            }
            else if (!coord.value.match(validators[currentSelection])) {
                commit("setEastingNoMatch", true);
            }
        }
        else if (coord.id === "northing") {
            commit("resetNorthingMessages");
            if (coord.value === "") {
                commit("setNorthingNoCoord", true);
            }
            else if (!coord.value.match(validators[currentSelection])) {
                commit("setNorthingNoMatch", true);
            }
        }
    },
    /**
     * Transforms the selected and validated coordinates to their given coordinate system and calls the moveToCoordinates function.
     * @param {Object} context actions context object.
     * @returns {void}
     */
    transformCoordinates ({state, dispatch}) {
        if (state.selectedCoordinates.length === 2) {
            dispatch("setZoom", state.zoomLevel);

            if (state.currentSelection !== "ETRS89") {

                const latitude = state.selectedCoordinates[0],
                    newLatitude = Number(latitude[0]) +
            (Number(latitude[1] ? latitude[1] : 0) / 60) +
            (Number(latitude[2] ? latitude[2] : 0) / 60 / 60),

                    longitude = state.selectedCoordinates[1],
                    newLongitude = Number(longitude[0]) +
            (Number(longitude[1] ? longitude[1] : 0) / 60) +
            (Number(longitude[2] ? longitude[2] : 0) / 60 / 60);

                state.transformedCoordinates = proj4(proj4("EPSG:4326"), proj4("EPSG:25832"), [newLongitude, newLatitude]); // turning the coordinates around to make it work for WGS84
                dispatch("moveToCoordinates", state.transformedCoordinates);
            }
            else {
                dispatch("moveToCoordinates", state.selectedCoordinates);
            }
        }
    },
    /**
     * Transforms the selected and validated coordinates to their given coordinate system and calls the moveToCoordinates function.
     * @param {Object} context actions context object.
     * @param {String[]} coordinates from the validated coordinates
     * @returns {void}
     */
    moveToCoordinates ({dispatch}, coordinates) {
        dispatch("setMarker", coordinates);
        dispatch("setCenter", coordinates);
    },
    /**
     * Resets the error messages, calls the validation function with the entered coordinates
     * and calls the transformCoordinates function.
     * @param {Object} context actions context object.
     * @param {String} context.state.coordinatesEasting the coordinates user entered
     * @param {String} context.state.coordinatesNorthing the coordinates user entered
     * @returns {void}
     */
    searchCoordinate ({dispatch, commit, state}) {
        const coords = [state.coordinatesEasting, state.coordinatesNorthing];

        commit("resetErrorMessages");
        dispatch("formatInput", coords);
        dispatch("transformCoordinates");
    },
    /**
     * Called if selection of coordinate system changed.
     * @returns {void}
     */
    selectionChanged ({commit, dispatch}, {currentTarget}) {
        commit("setCurrentSelection", currentTarget.value);
        commit("setExample");
        commit("resetValues");
        commit("resetErrorMessages");
        dispatch("removeMarker");
    }
};
