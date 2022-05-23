import {RoutingWaypoint} from "../../utils/classes/routing-waypoint";
import {fetchRoutingOrsDirections} from "../../utils/directions/routing-ors-directions";
import Feature from "ol/Feature";
import LineString from "ol/geom/LineString";

export default {
    /**
     * Finds the route for the current waypoints.
     * @param {Object} context actions context object.
     * @returns {void}
     */
    async findDirections ({state, getters, commit, dispatch, rootState}) {
        if (getters.directionsCoordinates.length < 2) {
            return;
        }
        const {waypoints, directionsRouteSource, routingAvoidFeaturesOptions, settings, directionsAvoidSource} = state,
            map = await mapCollection.getMap(rootState.Maps.mode),
            wgs84Coords = await dispatch("getDirectionsCoordinatesWgs84"),
            lineStringFeature = await dispatch("getRouteFeature");

        commit("setIsLoadingDirections", true);
        await dispatch("resetRoutingDirectionsResults");

        try {
            const result = await dispatch("fetchDirections", {wgs84Coords: wgs84Coords, instructions: true});

            if (JSON.stringify(wgs84Coords) !== JSON.stringify(await dispatch("getDirectionsCoordinatesWgs84"))) {
                return;
            }

            lineStringFeature
                .getGeometry()
                .setCoordinates(result.getLineString());

            lineStringFeature.set("avoidFeaturesOptions", JSON.parse(JSON.stringify(routingAvoidFeaturesOptions)));
            lineStringFeature.set("speedProfile", JSON.parse(JSON.stringify(settings.speedProfile)));
            lineStringFeature.set("preference", JSON.parse(JSON.stringify(settings.preference)));
            lineStringFeature.set("hasAvoidPolygons", directionsAvoidSource.getFeatures().length > 0);

            waypoints.forEach((waypoint, index) => {
                waypoint.setIndexDirectionsLineString(
                    result.getLineStringWaypointIndex()[index]
                );
            });
            map.getView().fit(directionsRouteSource.getExtent());
            commit("setRoutingDirections", result);
        }
        catch (err) {
            dispatch("Alerting/addSingleAlert", {
                category: i18next.t("common:modules.alerting.categories.info"),
                content: err.message
            }, {root: true});
        }
        commit("setIsLoadingDirections", false);
    },

    /**
     * Resets the routing direction results
     * @param {Object} context actions context object.
     * @returns {void}
     */
    async resetRoutingDirectionsResults ({dispatch, commit}) {
        const lineStringFeature = await dispatch("getRouteFeature");

        commit("setRoutingDirections", null);
        lineStringFeature
            .getGeometry()
            .setCoordinates([]);
    },

    /**
     * Fetches the directions with the configured external service.
     * Needs to be extended if new services should be configurable.
     * @param {Object} context actions context object.
     * @param {Object} parameter with wgs84Coords as input and instructions for the external service
     * @param {[Number, Number]} [parameter.wgs84Coords] coordinates in wgs84 projection
     * @param {Boolean} [parameter.instructions] should request with instructions
     * @returns {RoutingDirections} routingDirections
     */
    async fetchDirections ({state, getters, dispatch}, {wgs84Coords, instructions}) {
        const {settings} = state,
            {selectedAvoidSpeedProfileOptions} = getters,
            avoidPolygons = await dispatch("getAvoidPolygonsWgs84");

        if (settings.type === "ORS") {
            return fetchRoutingOrsDirections({
                coordinates: wgs84Coords,
                language: i18next.language,
                transformCoordinatesToLocal: coordinates => dispatch(
                    "Tools/Routing/transformCoordinatesWgs84ToLocalProjection",
                    coordinates,
                    {root: true}
                ),
                speedProfile: settings.speedProfile,
                avoidSpeedProfileOptions: selectedAvoidSpeedProfileOptions,
                preference: settings.preference,
                avoidPolygons: avoidPolygons,
                instructions: instructions
            });
        }
        throw new Error("fetchDirections Type is not configured correctly.");
    },

    /**
     * Returns the feature to display the route on
     * @param {Object} context actions context object.
     * @returns {module:ol/Feature} routing Feature
     */
    getRouteFeature ({state}) {
        const {directionsRouteSource} = state;

        return directionsRouteSource.getFeatures().find(feature => !feature.get("isHighlight"));
    },

    /**
     * Returns the feature to display the highlight on
     * @param {Object} context actions context object.
     * @returns {module:ol/Feature} highlight Feature
     */
    getHighlightFeature ({state}) {
        const {directionsRouteSource} = state;

        return directionsRouteSource.getFeatures().find(feature => feature.get("isHighlight"));
    },

    /**
     * Resets the highlighting
     * @param {Object} context actions context object.
     * @returns {void}
     */
    async unHighlightRoute ({dispatch}) {
        const highlightFeature = await dispatch("getHighlightFeature");

        highlightFeature.getGeometry().setCoordinates([]);
    },

    /**
     * Highlights part of the route.
     * @param {Object} context actions context object.
     * @param {Object} params with the starting and ending index
     * @param {Number} [params.fromWaypointIndex] at which waypoint to start the highlight
     * @param {Number} [params.toWaypointIndex] at which waypoint to end the highlight
     * @param {[Number, Number]} [params.coordsIndex] alternative to select the coordinate index directly
     * @returns {void}
     */
    async highlightRoute ({dispatch, state}, {fromWaypointIndex, toWaypointIndex, coordsIndex}) {
        const {waypoints} = state,
            routeFeature = await dispatch("getRouteFeature"),
            highlightFeature = await dispatch("getHighlightFeature"),
            lineIndex = coordsIndex ? coordsIndex.slice(0) : [
                waypoints[fromWaypointIndex].getIndexDirectionsLineString(),
                waypoints[toWaypointIndex].getIndexDirectionsLineString()
            ];

        highlightFeature.getGeometry().setCoordinates(
            routeFeature.getGeometry().getCoordinates().slice(...lineIndex)
        );
    },

    /**
     * Zooms to part of the route
     * @param {Object} context actions context object.
     * @param {Object} params with the starting and ending index
     * @param {Number} [params.fromWaypointIndex] at which waypoint to start the zoom
     * @param {Number} [params.toWaypointIndex] at which waypoint to end the zoom
     * @param {[Number, Number]} [params.coordsIndex] alternative to select the coordinate index directly
     * @returns {void}
     */
    async zoomToRoute ({dispatch, state, rootState}, {fromWaypointIndex, toWaypointIndex, coordsIndex}) {
        const {waypoints} = state,
            map = mapCollection.getMap(rootState.Maps.mode),
            routeFeature = await dispatch("getRouteFeature"),
            lineIndex = coordsIndex ? coordsIndex.slice(0) : [
                waypoints[fromWaypointIndex].getIndexDirectionsLineString(),
                waypoints[toWaypointIndex].getIndexDirectionsLineString()
            ],
            linestringFeature = new Feature({
                geometry: new LineString(routeFeature.getGeometry().getCoordinates().slice(...lineIndex))
            });

        map.getView().fit(linestringFeature.getGeometry().getExtent());
    },

    /**
     * Retrieves the waypoint coordinates in wgs84 projection
     * @param {Object} context actions context object.
     * @returns {[Number, Number][]} wgs84 coordinates
     */
    async getDirectionsCoordinatesWgs84 ({getters, dispatch}) {
        const coordinates = [];

        for (const coords of getters.directionsCoordinates) {
            coordinates.push(
                await dispatch(
                    "Tools/Routing/transformCoordinatesLocalToWgs84Projection",
                    coords,
                    {root: true}
                )
            );
        }
        return coordinates;
    },

    /**
     * Retrieves the polygons to avoid in the wgs84 projection as a MultiPolygon
     * @param {Object} context actions context object.
     * @returns {Object} MultiPolygon in wgs84
     */
    async getAvoidPolygonsWgs84 ({state, dispatch}) {
        const {directionsAvoidSource} = state,
            sourceFeatures = directionsAvoidSource.getFeatures(),
            polygonFeature = {type: "MultiPolygon", coordinates: []};

        for (const sourceFeature of sourceFeatures) {
            const sourceCoordinates = sourceFeature.getGeometry().getCoordinates(),
                wgsPolygon = [];

            for (const coordinates of sourceCoordinates) {
                const wgsCoordinates = [];

                for (const coordinate of coordinates) {
                    wgsCoordinates.push(
                        await dispatch(
                            "Tools/Routing/transformCoordinatesLocalToWgs84Projection",
                            coordinate,
                            {root: true}
                        )
                    );
                }
                wgsPolygon.push(wgsCoordinates);
            }
            polygonFeature.coordinates.push(wgsPolygon);
        }
        return polygonFeature;
    },

    /**
     * Called when Routing.vue is created to initialize the map layers, map interactions and waypoints.
     * @param {Object} context actions context object.
     * @returns {void}
     */
    async initDirections ({state, dispatch, commit}) {
        const {
            directionsWaypointsLayer,
            directionsRouteLayer,
            directionsAvoidLayer,
            directionsWaypointsDrawInteraction,
            directionsAvoidDrawInteraction,
            directionsAvoidSelectInteraction,
            mapListenerAdded
        } = state;

        dispatch("initWaypoints");

        if (!mapListenerAdded) {
            directionsWaypointsDrawInteraction.on("drawend", event => dispatch("onDirectionsWaypointsDrawEnd", event));
            directionsAvoidDrawInteraction.on("drawend", event => dispatch("onDirectionsAvoidDrawEnd", event));
            directionsAvoidSelectInteraction.on("select", event => dispatch("onDirectionsAvoidSelect", event));
            dispatch("createDirectionsWaypointsModifyInteractionListener");
            dispatch("createDirectionsAvoidModifyInteractionListener");
            dispatch("createDirectionsRouteModifyInteractionListener");
            commit("setMapListenerAdded", true);
        }

        dispatch("Maps/addLayerOnTop", directionsRouteLayer, {root: true});
        dispatch("Maps/addLayerOnTop", directionsWaypointsLayer, {root: true});
        dispatch("Maps/addLayerOnTop", directionsAvoidLayer, {root: true});


        dispatch("createInteractionFromMapInteractionMode");
    },

    /**
     * Creates the currently needed map interaction based on the user input
     * @param {Object} context actions context object.
     * @returns {void}
     */
    createInteractionFromMapInteractionMode ({state, dispatch}) {
        const {mapInteractionMode} = state;

        if (mapInteractionMode === "WAYPOINTS") {
            dispatch("createDirectionsWaypointsDrawInteraction");
        }
        else if (mapInteractionMode === "AVOID_AREAS") {
            dispatch("createDirectionsAvoidDrawInteraction");
        }
        else if (mapInteractionMode === "DELETE_AVOID_AREAS") {
            dispatch("createDirectionsAvoidSelectInteraction");
        }
    },

    /**
     * Called when the directions tab is being closed to reset the map layer and interaction
     * @param {Object} context actions context object.
     * @returns {void}
     */
    async closeDirections ({rootState, state, dispatch}) {
        const {directionsWaypointsLayer, directionsRouteLayer, directionsAvoidLayer} = state,
            map = await mapCollection.getMap(rootState.Maps.mode);

        map.removeLayer(directionsRouteLayer);
        map.removeLayer(directionsWaypointsLayer);
        map.removeLayer(directionsAvoidLayer);

        dispatch("removeMapInteractions");
    },

    /**
     * Creates event listener to be called when the waypoints are dragged/modified
     * @param {Object} context actions context object.
     * @returns {void}
     */
    createDirectionsWaypointsModifyInteractionListener ({state, dispatch}) {
        const {directionsWaypointsModifyInteraction} = state;

        let changedFeature;

        directionsWaypointsModifyInteraction.on("modifystart", event => {
            event.features.getArray().forEach(feature => {
                feature.getGeometry().once("change", () => {
                    changedFeature = feature;
                });
            });
        });

        directionsWaypointsModifyInteraction.on("modifyend", async () => {
            const {waypoints} = state,
                waypoint = waypoints[changedFeature.get("routingId")],
                coordinates = await dispatch(
                    "Tools/Routing/transformCoordinatesLocalToWgs84Projection",
                    changedFeature.getGeometry().getCoordinates(),
                    {root: true}
                ),
                geoSearchResult = await dispatch(
                    "Tools/Routing/fetchTextByCoordinates",
                    {
                        coordinates
                    },
                    {root: true}
                );

            waypoint.setDisplayName(
                geoSearchResult ? geoSearchResult.getDisplayName() : null
            );
            dispatch("findDirections");
        });
    },

    /**
     * Creates event listener to be called when the avoid polygons are modified
     * @param {Object} context actions context object.
     * @returns {void}
     */
    createDirectionsAvoidModifyInteractionListener ({state, dispatch}) {
        const {directionsAvoidModifyInteraction} = state;

        directionsAvoidModifyInteraction.on("modifyend", async () => {

            dispatch("findDirections");
        });
    },

    /**
     * Tries to find the waypoint index between the given lineStringIndex.
     * Used to determine where to insert the new waypoint when the route is dragged in the map.
     * @param {Object} context actions context object.
     * @param {Object} params with lineStringIndex as number to search
     * @param {Number} [params.lineStringIndex] at which index in the linestring to search for waypoints
     * @returns {Number | null} the waypoint index or null if nothing was found
     */
    findWaypointBetweenLineStringIndex ({state}, {lineStringIndex}) {
        const {waypoints} = state;

        for (let i = 0; i < waypoints.length; i++) {
            const waypoint = waypoints[i],
                nextWaypoint = waypoints[i + 1];

            if (
                !nextWaypoint ||
                waypoint.getIndexDirectionsLineString() === null ||
                nextWaypoint.getIndexDirectionsLineString() === null
            ) {
                break;
            }
            if (
                lineStringIndex >= waypoint.getIndexDirectionsLineString() &&
                lineStringIndex < nextWaypoint.getIndexDirectionsLineString()
            ) {
                return i;
            }
        }
        return null;
    },

    /**
     * Creates event listener to be called when the user drags the route feature to create a new waypoint.
     * Requests new Directions afterwards.
     * @param {Object} context actions context object.
     * @returns {void}
     */
    createDirectionsRouteModifyInteractionListener ({
        state,
        dispatch
    }) {
        const {directionsRouteModifyInteraction} = state;

        directionsRouteModifyInteraction.on("modifyend", async event => {
            const {routingDirections} = state,
                newCoordinates = event.features
                    .getArray()[0]
                    .getGeometry()
                    .getCoordinates(),
                oldLineString = routingDirections.getLineString();

            for (let i = 0; i < oldLineString.length; i++) {
                if (
                    oldLineString[i][0] === newCoordinates[i][0] &&
                    oldLineString[i][1] === newCoordinates[i][1]
                ) {
                    continue;
                }
                const newCoordinate = newCoordinates[i],
                    nextIndex = await dispatch(
                        "findWaypointBetweenLineStringIndex",
                        {
                            lineStringIndex: i
                        }
                    ),
                    waypoint = await dispatch("addWaypoint", {
                        index: nextIndex + 1
                    }),
                    wgs84Coordinates = await dispatch(
                        "Tools/Routing/transformCoordinatesLocalToWgs84Projection",
                        newCoordinate,
                        {root: true}
                    ),
                    geoSearchResult = await dispatch(
                        "Tools/Routing/fetchTextByCoordinates",
                        {
                            coordinates: wgs84Coordinates
                        },
                        {root: true}
                    );

                waypoint.setCoordinates(newCoordinate);
                waypoint.setDisplayName(geoSearchResult ? geoSearchResult.getDisplayName() : null);
                break;
            }
            dispatch("findDirections");
        });
    },

    /**
     * Adds a new waypoint to the array.
     * @param {Object} context actions context object.
     * @param {Object} payload payload object.
     * @param {Number} [payload.index] index for the waypoint to insert at
     * @param {ol.Feature} [payload.feature] optional feature to use in the waypoint or to extract coordinates from
     * @param {String} [payload.displayName] optional displayName for the waypoint
     * @returns {RoutingWaypoint} added waypoint
     */
    addWaypoint ({state}, {index, feature, displayName}) {
        let waypointIndex = index;

        if (typeof index !== "number") {
            waypointIndex = state.waypoints.length;
        }
        if (feature) {
            // If feature is set the call comes from the map and we try to find a
            // waypoint without coordinates first before adding it
            const waypointWithoutCoordinates = state.waypoints.find(
                waypoint => waypoint.getCoordinates().length === 0
            );

            if (waypointWithoutCoordinates) {
                waypointWithoutCoordinates.setCoordinates(
                    feature.getGeometry().getCoordinates()
                );
                if (displayName) {
                    waypointWithoutCoordinates.setDisplayName(displayName);
                }
                // Drawend is called before feature is added to directionsWaypointsSource
                // We delete the drawn Feature and only copy the Coordinates
                setTimeout(() => {
                    state.directionsWaypointsSource.removeFeature(feature);
                });
                return waypointWithoutCoordinates;
            }
        }
        const waypoint = new RoutingWaypoint({
            index: waypointIndex,
            feature,
            displayName,
            source: state.directionsWaypointsSource
        });

        state.waypoints.splice(waypointIndex, 0, waypoint);
        // Fix Index on Waypoints after new Waypoint
        for (let i = waypointIndex + 1; i < state.waypoints.length; i++) {
            state.waypoints[i].setIndex(i);
        }
        return waypoint;
    },
    /**
     * Removes a waypoint at the given index and reloads the directions if reload = true
     * @param {Object} context actions context object.
     * @param {Object} params with a waypoint index and reload to control if the directions should be requested.
     * @param {Number} [params.index] index to remove the waypoint at
     * @param {Boolean} [params.reload = false] if the route should be reloaded
     * @returns {void}
     */
    removeWaypoint ({state, dispatch, commit}, {index, reload = false}) {
        const {waypoints, directionsWaypointsSource, directionsRouteSource} = state;

        if (waypoints.length === 2) {
            waypoints[index].reset();
            directionsRouteSource.getFeatures().forEach(feature => feature.getGeometry().setCoordinates([]));
            commit("setRoutingDirections", null);
            return;
        }
        if (waypoints[index].addedToSource) {
            directionsWaypointsSource.removeFeature(waypoints[index].getFeature());
        }
        for (let i = index; i < waypoints.length; i++) {
            waypoints[i].setIndex(waypoints[i].getIndex() - 1);
        }
        waypoints.splice(index, 1);
        if (reload) {
            dispatch("findDirections");
        }
    },
    /**
     * Moves the waypoint at the given index down
     * @param {Object} context actions context object.
     * @param {Number} index for the waypoint to be moved down
     * @returns {void}
     */
    moveWaypointDown ({state, dispatch}, index) {
        const {waypoints} = state,
            newIndex = index + 1,
            waypoint = waypoints[index],
            waypointUnder = waypoints[newIndex];

        if (index < 0 || newIndex >= waypoints.length) {
            return;
        }

        waypoints.splice(index, 2, waypoints[newIndex], waypoints[index]);
        waypoint.setIndex(newIndex);
        waypointUnder.setIndex(index);
        dispatch("findDirections");
    },
    /**
     * Moves the waypoint at the given index up
     * @param {Object} context actions context object.
     * @param {Number} index for the waypoint to be moved up
     * @returns {void}
     */
    moveWaypointUp ({state, dispatch}, index) {
        const {waypoints} = state,
            newIndex = index - 1,
            waypoint = waypoints[index],
            waypointUnder = waypoints[newIndex];

        if (index < 0 || newIndex === waypoints.length) {
            return;
        }

        waypoints.splice(newIndex, 2, waypoints[index], waypoints[newIndex]);
        waypoint.setIndex(newIndex);
        waypointUnder.setIndex(index);
        dispatch("findDirections");
    },

    /**
     * Initializes the waypoint array with the minimum waypoints (2) for start and end.
     * @param {Object} context actions context object.
     * @returns {void}
     */
    initWaypoints ({dispatch, state}) {
        for (let i = state.waypoints.length; i < 2; i++) {
            dispatch("addWaypoint", {index: i});
        }
    },

    /**
     * Executed when user clicks on the map to add a waypoint
     * @param {Object} context actions context object.
     * @param {Object} event OL OnDrawEvent.
     * @returns {void}
     */
    async onDirectionsWaypointsDrawEnd ({dispatch}, event) {
        const coordinates = await dispatch(
                "Tools/Routing/transformCoordinatesLocalToWgs84Projection",
                event.feature.getGeometry().getCoordinates(),
                {root: true}
            ),
            geoSearchResult = await dispatch(
                "Tools/Routing/fetchTextByCoordinates",
                {
                    coordinates
                },
                {root: true}
            );

        await dispatch("addWaypoint", {
            feature: event.feature,
            displayName: geoSearchResult
                ? geoSearchResult.getDisplayName()
                : null
        });
        dispatch("findDirections");
    },

    /**
     * Executed when User adds a new polygon to avoid on the Map
     * @param {Object} context actions context object.
     * @param {Object} event OL OnDrawEvent.
     * @returns {void}
     */
    async onDirectionsAvoidDrawEnd ({dispatch}) {
        // OpenLayers calls drawend before the feature is added to the source so we wait one iteration
        setTimeout(() => dispatch("findDirections"), 0);
    },
    /**
     * Executed when User adds a new polygon to avoid on the Map
     * @param {Object} context actions context object.
     * @param {Object} event OL OnSelectEvent.
     * @returns {void}
     */
    onDirectionsAvoidSelect ({state, dispatch}, event) {
        const {directionsAvoidSource} = state;

        for (const feature of event.selected) {
            directionsAvoidSource.removeFeature(feature);
        }
        setTimeout(() => dispatch("findDirections"), 0);
    },

    /**
     * Creates a new draw interaction depending on state to either draw
     * lines or polygons. The method will first remove any prior draw
     * interaction created by this tool.
     * @param {Object} context actions context object.
     * @returns {void}
     */
    createDirectionsWaypointsDrawInteraction ({state, dispatch}) {
        dispatch("removeMapInteractions");
        const {
            directionsWaypointsModifyInteraction,
            directionsWaypointsSnapInteraction,
            directionsWaypointsDrawInteraction,
            directionsRouteModifyInteraction,
            directionsRouteSnapInteraction
        } = state;

        dispatch("Maps/addInteraction", directionsRouteModifyInteraction, {root: true});
        dispatch("Maps/addInteraction", directionsRouteSnapInteraction, {root: true});

        dispatch("Maps/addInteraction", directionsWaypointsDrawInteraction, {root: true});
        dispatch("Maps/addInteraction", directionsWaypointsModifyInteraction, {root: true});
        dispatch("Maps/addInteraction", directionsWaypointsSnapInteraction, {root: true});
    },
    /**
     * Removes the draw interaction. This includes aborting any current
     * unfinished drawing, removing the interaction from the map, and
     * removing the interaction from the store.
     * @param {Object} context actions context object.
     * @returns {void}
     */
    removeDirectionsWaypointsDrawInteraction ({state, dispatch}) {
        const {
            directionsWaypointsDrawInteraction,
            directionsWaypointsModifyInteraction,
            directionsWaypointsSnapInteraction,
            directionsRouteModifyInteraction,
            directionsRouteSnapInteraction
        } = state;

        directionsWaypointsDrawInteraction.abortDrawing();

        dispatch("Maps/removeInteraction", directionsRouteModifyInteraction, {root: true});
        dispatch("Maps/removeInteraction", directionsRouteSnapInteraction, {root: true});

        dispatch("Maps/removeInteraction", directionsWaypointsDrawInteraction, {root: true});
        dispatch("Maps/removeInteraction", directionsWaypointsModifyInteraction, {root: true});
        dispatch("Maps/removeInteraction", directionsWaypointsSnapInteraction, {root: true});
    },

    /**
     * Creates a new draw interaction for polygons to avoid.
     * @param {Object} context actions context object.
     * @returns {void}
     */
    createDirectionsAvoidDrawInteraction ({state, dispatch}) {
        dispatch("removeMapInteractions");
        const {
            directionsAvoidModifyInteraction,
            directionsAvoidSnapInteraction,
            directionsAvoidDrawInteraction
        } = state;

        dispatch("Maps/addInteraction", directionsAvoidDrawInteraction, {root: true});
        dispatch("Maps/addInteraction", directionsAvoidModifyInteraction, {root: true});
        dispatch("Maps/addInteraction", directionsAvoidSnapInteraction, {root: true});
    },
    /**
     * Removes the draw interaction for polygons to avoid.
     * @param {Object} context actions context object.
     * @returns {void}
     */
    removeDirectionsAvoidDrawInteraction ({state, dispatch}) {
        const {
            directionsAvoidModifyInteraction,
            directionsAvoidSnapInteraction,
            directionsAvoidDrawInteraction
        } = state;

        directionsAvoidDrawInteraction.abortDrawing();

        dispatch("Maps/removeInteraction", directionsAvoidModifyInteraction, {root: true});
        dispatch("Maps/removeInteraction", directionsAvoidSnapInteraction, {root: true});
        dispatch("Maps/removeInteraction", directionsAvoidDrawInteraction, {root: true});
    },

    /**
     * Creates a new select interaction to delete avoid areas.
     * @param {Object} context actions context object.
     * @returns {void}
     */
    createDirectionsAvoidSelectInteraction ({state, dispatch}) {
        dispatch("removeMapInteractions");
        const {directionsAvoidSelectInteraction} = state;

        dispatch("Maps/addInteraction", directionsAvoidSelectInteraction, {root: true});
    },
    /**
     * Removes the select interaction for deletion of avoid areas.
     * @param {Object} context actions context object.
     * @returns {void}
     */
    removeDirectionsAvoidSelectInteraction ({state, dispatch}) {
        const {directionsAvoidSelectInteraction} = state;

        dispatch("Maps/removeInteraction", directionsAvoidSelectInteraction, {root: true});
    },
    /**
     * Removes the directions interactions.
     * @param {Object} context actions context object.
     * @returns {void}
     */
    removeMapInteractions ({dispatch}) {
        dispatch("removeDirectionsWaypointsDrawInteraction");
        dispatch("removeDirectionsAvoidDrawInteraction");
        dispatch("removeDirectionsAvoidSelectInteraction");
    }
};
