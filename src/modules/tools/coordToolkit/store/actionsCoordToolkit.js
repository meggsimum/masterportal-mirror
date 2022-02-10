import {toStringHDMS, toStringXY} from "ol/coordinate.js";
import proj4 from "proj4";
import isMobile from "../../../../utils/isMobile";
import {convertSexagesimalFromString, convertSexagesimalToDecimal, convertSexagesimalFromDecimal} from "../../../../utils/convertSexagesimalCoordinates";
import getProxyUrl from "../../../../utils/getProxyUrl";
import {requestGfi} from "../../../../api/wmsGetFeatureInfo";
import {getLayerWhere} from "masterportalAPI/src/rawLayerList";

export default {
    /**
     * Copies the coordinates to clipboard, delimited by limiter from state.
     * @param {Object} param.state the state
     * @param {Object} param.dispatch the dispatch
     * @param {Array} coords coordinates to copy
     * @returns {void}
     */
    copyCoordinates ({state, dispatch}, coords) {
        if (Array.isArray(coords)) {
            let toCopy = "";

            coords.forEach(coord => {
                toCopy += coord;
                toCopy += state.delimiter;
            });
            if (toCopy.length > 0) {
                toCopy = toCopy.substr(0, toCopy.length - 1);
            }
            navigator.clipboard.writeText(toCopy)
                .then(() => {
                    dispatch("Alerting/addSingleAlert", {content: i18next.t("common:modules.util.copyToClipboard.contentSaved")}, {root: true});
                })
                .catch(err => {
                    dispatch("Alerting/addSingleAlert", {content: i18next.t("common:modules.util.copyToClipboard.contentNotSaved")}, {root: true});
                    console.error(`CopyToClipboard: ${err}`);
                });
        }
        else {
            console.warn("Cannot copy coordinates to clipboard, coordinates:", coords);
        }
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
        dispatch("changedPosition");
        commit("setUpdatePosition", !updatePosition);

        dispatch("MapMarker/placingPointMarker", position, {root: true});
        if (state.heightLayer) {
            if (updatePosition) {
                dispatch("getHeight", position);
            }
            else {
                commit("setHeight", "");
            }
        }
    },
    /**
     * Creates a new WMSLayer to get the height from with id stored in state.heightLayerId and sets the layer to state.
     * @returns {void}
     */
    initHeightLayer ({commit, state}) {
        const rawLayer = getLayerWhere({id: state.heightLayerId});
        let layer = null;

        if (rawLayer) {
            layer = Radio.request("ModelList", "getModelByAttributes", {id: state.heightLayerId});
            if (layer === undefined) {
                Radio.trigger("ModelList", "addModelsByAttributes", {id: state.heightLayerId});
                layer = Radio.request("ModelList", "getModelByAttributes", {id: state.heightLayerId});
            }
            if (layer) {
                if (!layer.has("layerSource")) {
                    Radio.trigger("Layer", "prepareLayerObject", layer);
                }
                if (layer.has("layerSource")) {
                    commit("setHeightLayer", layer);
                }
                else {
                    console.warn("CoordToolkit: Layer with id " + state.heightLayerId + " to retrieve height from has no layerSource. Heights are not available!");
                }
            }
        }
        if (!layer) {
            console.warn("CoordToolkit: the layer with id " + state.heightLayerId + " to retrieve height from is not available. Check the Id in config.json with path 'Portalconfig.menu.tools.children.coordToolkit.heightLayerId'!");
        }
    },
    /**
     * Requests the layer with id state.heightLayerId and parses the xml-response for the height.
     * Sets the height to the state.
     * @param {Number[]} position position of the projection in the map
     * @returns {void}
     */
    getHeight ({dispatch, rootGetters, state}, position) {
        const projection = rootGetters["Map/projection"],
            resolution = rootGetters["Map/resolution"],
            gfiParams = {INFO_FORMAT: state.heightInfoFormat, FEATURE_COUNT: 1};
        let url = state.heightLayer.get("layerSource").getFeatureInfoUrl(position, resolution, projection, gfiParams);

        /**
         * @deprecated in the next major-release!
         * useProxy
         * getProxyUrl()
         */
        url = state.heightLayer.get("useProxy") ? getProxyUrl(url) : url;

        requestGfi("text/xml", url, false).then(features => {
            dispatch("retrieveHeightFromGfiResponse", features);
        });
    },
    /**
     * Reads the height value from feature and sets it to state.
     * @param {Array} features to get the height value from
     * @returns {void}
     */
    retrieveHeightFromGfiResponse ({commit, state}, features) {
        let height = "";

        if (features.length >= 1) {
            height = features[0].get(state.heightElementName);
            if (height === state.heightValueWater) {
                height = "common:modules.tools.coordToolkit.noHeightWater";
            }
            else if (height === state.heightValueBuilding) {
                height = "common:modules.tools.coordToolkit.noHeightBuilding";
            }
            else {
                const heightParsed = Number.parseFloat(height);

                if (!isNaN(heightParsed)) {
                    height = heightParsed.toFixed(1);

                }
            }
        }
        commit("setHeight", height);
    },
    /**
     * Reacts on new selected projection. Sets the current projection and its name to state,
     * changes position if mode is 'supply' and sets transformed coordinates to input fields.
     * @param {String} value id of the new selected projection
     * @returns {void}
     */
    newProjectionSelected ({dispatch, commit, state, getters}, value) {
        const targetProjection = getters.getProjectionById(value);

        dispatch("formatInput", [state.coordinatesEasting, state.coordinatesNorthing]);
        dispatch("transformCoordinatesFromTo", targetProjection);
        commit("setCurrentProjection", targetProjection);
        dispatch("changedPosition");
        commit("setExample");
    },
    /**
     * Delegates the calculation and transformation of the position according to the projection
     * @returns {void}
     */
    changedPosition ({dispatch, state, rootGetters, getters}) {
        if (state.mode === "supply") {
            const targetProjectionName = state.currentProjection?.name,
                position = getters.getTransformedPosition(rootGetters["Map/ol2DMap"], targetProjectionName);

            if (position) {
                dispatch("adjustPosition", {position: position, targetProjection: state.currentProjection});
            }
        }
    },
    /**
     * Sets the position to map's center, if coordinates are  not set.
     * @returns {void}
     */
    setFirstSearchPosition ({dispatch, commit, state, rootState, rootGetters, getters}) {
        if (state.mode === "search" && state.active) {
            const targetProjectionName = state.currentProjection?.name,
                position = getters.getTransformedPosition(rootGetters["Map/ol2DMap"], targetProjectionName);

            if (position && position[0] === 0 && position[1] === 0 && rootState.Map.center) {
                commit("setCoordinatesEasting", {id: "easting", value: String(rootState.Map.center[0])});
                commit("setCoordinatesNorthing", {id: "northing", value: String(rootState.Map.center[1])});
                dispatch("moveToCoordinates", rootState.Map.center);
            }
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
                let converted;

                coord = toStringHDMS(position);
                if (targetProjection.id === "EPSG:4326-DG") {
                    converted = convertSexagesimalToDecimal(coord);
                }
                else {
                    converted = convertSexagesimalFromString(coord);
                }
                easting = converted.easting;
                northing = converted.northing;
            }
            // cartesian coordinates
            else {
                coord = toStringXY(position, 2);
                easting = Number.parseFloat(coord.split(",")[0].trim()).toFixed(2);
                northing = Number.parseFloat(coord.split(",")[1].trim()).toFixed(2);
            }
            commit("setCoordinatesEasting", {id: "easting", value: String(easting)});
            commit("setCoordinatesNorthing", {id: "northing", value: String(northing)});
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

        commit("resetErrorMessages", "all");
        dispatch("formatInput", coords);
        dispatch("transformCoordinates");
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
     * Remembers the projection and shows mapmarker at the given position.
     * @param {Object} context actions context object.
     * @param {Event} event - pointerdown-event, to get the position from
     * @returns {void}
     */
    setMarker: function ({dispatch}, event) {
        dispatch("MapMarker/placingPointMarker", event, {root: true});
    },
    /**
     * Validates the user-input depending on the selected projection and sets the error messages.
     * @param {Object} context actions context object.
     * @param {Object} coord the coordinate the user entered
     * @returns {void}
     */
    validateInput ({state, commit}, coord) {
        const validETRS89UTM = /^[0-9]{6,7}[.,]{0,1}[0-9]{0,3}\s*$/,
            validETRS89 = /^[0-9]{7}[.,]{0,1}[0-9]{0,3}\s*$/,
            validWGS84 = /^\d[0-9]{0,2}[°]{1}\s*[0-9]{0,2}['`´′]{0,1}\s*[0-9]{0,2}['`´′]{0,2}["″]{0,2}[\sNS]*\s*$/,
            validWGS84_dez = /[0-9]{1,3}[.,][0-9]{0,20}[\s]{0,10}°?\s*$/,
            {currentProjection} = state,
            validators = {
                "http://www.opengis.net/gml/srs/epsg.xml#25832": validETRS89UTM,
                "http://www.opengis.net/gml/srs/epsg.xml#25833": validETRS89UTM,
                "EPSG:31467": validETRS89,
                "EPSG:8395": validETRS89,
                "EPSG:4326": validWGS84,
                "EPSG:4326-DG": validWGS84_dez
            };

        if (coord.id === "easting") {
            commit("resetErrorMessages", coord.id);
            if (coord.value === "") {
                commit("setEastingNoCoord", true);
            }
            else if (!String(coord.value).match(validators[currentProjection.id])) {
                commit("setEastingNoMatch", true);
            }
        }
        else if (coord.id === "northing") {
            commit("resetErrorMessages", coord.id);
            if (coord.value === "") {
                commit("setNorthingNoCoord", true);
            }
            else if (!String(coord.value).match(validators[currentProjection.id])) {
                commit("setNorthingNoMatch", true);
            }
        }
    },
    /**
     * Pushes the formatted coordinates in the selectedCoordinates String[].
     * @param {Object} context actions context object.
     * @param {String[]} coords the coordinates the user entered
     * @returns {void}
     */
    formatInput ({state, commit, getters}, coords) {
        const {currentProjection} = state;

        commit("setSelectedCoordinates", []);
        for (const coord of coords) {
            if (!getters.getEastingError && !getters.getNorthingError) {
                let formatter;

                if (currentProjection.id === "EPSG:4326-DG") {
                    formatter = coordinate=>coordinate.value.split(/[\s°]+/);
                }
                else if (currentProjection.projName === "longlat") {
                    formatter = coordinate=>coordinate.value.split(/[\s°′″'"´`]+/);
                }
                else {
                    formatter = coordinate=>coordinate.value;
                }

                commit("resetErrorMessages", "all");
                commit("pushCoordinates", formatter(coord));
            }
        }
    },
    /**
     * Transforms the selected coordinates from the current projection to the target projection and sets them to state.
     * @param {Object} context actions context object.
     * @param {*} targetProjection the target projection
     * @returns {void}
     */
    transformCoordinatesFromTo ({state, commit}, targetProjection) {
        let transformedCoordinates, coordinates;

        if (state.selectedCoordinates.length === 2) {
            if (state.currentProjection.projName === "longlat") {
                coordinates = convertSexagesimalToDecimal(state.selectedCoordinates);
            }
            else {
                coordinates = [Math.round(state.selectedCoordinates[0]), Math.round(state.selectedCoordinates[1])];
            }
            transformedCoordinates = proj4(state.currentProjection, targetProjection, coordinates);
            if (targetProjection.projName === "longlat" && targetProjection.id !== "EPSG:4326-DG") {
                transformedCoordinates = [convertSexagesimalFromDecimal(transformedCoordinates[1]), convertSexagesimalFromDecimal(transformedCoordinates[0])];
            }
            else if (targetProjection.id === "EPSG:4326-DG") {
                transformedCoordinates = [transformedCoordinates[1].toFixed(4) + "°", transformedCoordinates[0].toFixed(4) + "°"];
            }
            else {
                transformedCoordinates = [transformedCoordinates[0].toFixed(2), transformedCoordinates[1].toFixed(2)];
            }
            commit("setCoordinatesEasting", {id: "easting", value: transformedCoordinates[0]});
            commit("setCoordinatesNorthing", {id: "northing", value: transformedCoordinates[1]});
        }
    },

    /**
     * Transforms the selected and validated coordinates to their given coordinate system and calls the moveToCoordinates function.
     * @param {Object} context actions context object.
     * @returns {void}
     */
    transformCoordinates ({state, dispatch}) {
        const mapProjection = Radio.request("MapView", "getProjection").getCode();

        if (state.selectedCoordinates.length === 2) {
            dispatch("setZoom", state.zoomLevel);

            if (state.currentProjection.id === "EPSG:4326" || state.currentProjection.id === "EPSG:4326-DG") {
                const coordinates = convertSexagesimalToDecimal(state.selectedCoordinates);

                state.transformedCoordinates = proj4(proj4("EPSG:4326"), proj4(mapProjection), coordinates);
                dispatch("moveToCoordinates", state.transformedCoordinates);
            }
            else if (state.currentProjection.id === "EPSG:31467") {
                const coordinates = [Math.round(state.selectedCoordinates[0]), Math.round(state.selectedCoordinates[1])];

                state.transformedCoordinates = proj4(proj4("EPSG:31467"), proj4(mapProjection), coordinates);
                dispatch("moveToCoordinates", state.transformedCoordinates);
            }
            else if (state.currentProjection.id === "EPSG:8395") {
                const coordinates = [Math.round(state.selectedCoordinates[0]), Math.round(state.selectedCoordinates[1])];

                state.transformedCoordinates = proj4(proj4("EPSG:8395"), proj4(mapProjection), coordinates);
                dispatch("moveToCoordinates", state.transformedCoordinates);
            }
            else if (state.currentProjection.id !== mapProjection) {
                let coordinates;

                if (state.currentProjection.projName === "longlat") {
                    coordinates = convertSexagesimalToDecimal(state.selectedCoordinates);
                }
                else {
                    coordinates = [Math.round(state.selectedCoordinates[0]), Math.round(state.selectedCoordinates[1])];
                }

                state.transformedCoordinates = proj4(proj4(state.currentProjection.id), proj4(mapProjection), coordinates);
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
     * Sets the zoom level to the map.
     * @param {Object} context actions context object.
     * @param {Number} zoomLevel - Zoomlevel to zoom to
     * @returns {void}
     */
    setZoom: function ({dispatch}, zoomLevel) {
        dispatch("Map/setZoomLevel", zoomLevel, {root: true});
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

        dispatch("Map/setCenter", newCoords, {root: true});
    }
};
