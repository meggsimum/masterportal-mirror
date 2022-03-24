let unsubscribes = [];

export default {
    /**
         * Sets the map to the store. As a side-effect, map-related functions are registered
         * to fire changes when required. Each time a new map is registered, all old listeners
         * are discarded and new ones are registered.
         *
         * @param {module:ol/Map} map map object
         * @returns {void}
         */
    setMapAttributes ({commit, dispatch, rootState}, {map}) {
        // discard old listeners
        if (unsubscribes.length) {
            unsubscribes.forEach(unsubscribe => unsubscribe());
            unsubscribes = [];
        }

        const mapView = map.getView(),
            layerIds = dispatch("normalizeLayers", map.getLayers().getArray()),
            channel = Radio.channel("VectorLayer");

        // listen to featuresLoaded event to be able to determine if all features of a layer are completely loaded
        channel.on({"featuresLoaded": id => {
            commit("addLoadedLayerId", id);
            if (rootState.urlParams["Map/highlightFeature"]) {
                dispatch("highlightFeature", {type: "viaLayerIdAndFeatureId", layerIdAndFeatureId: rootState.urlParams["Map/highlightFeature"]});
            }
        }});

        commit("setMode", map.mode);
        // update state once initially to get initial settings
        dispatch("updateAttributes", {map: map});
        commit("setLayerIds", layerIds[1]);


        dispatch("setViewAttributes", mapView);

        // register listeners with state update functions
        unsubscribes = [
            map.on("moveend", evt => dispatch("updateAttributes", evt)),
            map.on("pointermove", evt => dispatch("updatePointer", evt)),
            map.on("click", evt => dispatch("updateClick", evt)),
            map.on("change:size", evt => commit("setSize", evt.target.getSize()))
        ];

    },

    /**
     * Sets mapView values to the store.
     * @param {module:ol/MapView} mapView map object
     * @returns {void}
     */
    setViewAttributes ({commit}, mapView) {
        // currently has no change mechanism
        commit("setProjection", mapView.getProjection());
        commit("setBackgroundImage", mapView.get("backgroundImage"));
        // note initial values for quick comparisons/resets
        commit("setInitialZoomLevel", mapView.getZoom());
        commit("setInitialCenter", mapView.getCenter());
        commit("setInitialResolution", mapView.getResolution());
    },

    /**
     * @param {MapBrowserEvent} evt - Moveend event
     * @returns {Function} update function for state parts to update onmoveend
     */
    updateAttributes ({commit, getters, dispatch}, evt) {
        let map;

        if (evt) {
            map = evt.map;
        }
        else {
            ({map} = getters);
        }

        const mapView = map.getView();

        commit("setResolution", mapView.getResolution());
        commit("setBoundingBox", mapView.calculateExtent(map.getSize()));
        commit("setRotation", mapView.getRotation());
        dispatch("setCenter", mapView);
    },
    /**
     * @param {Object} evt update event
     * @returns {Function} update function for mouse coordinate
     */
    updatePointer ({commit}, evt) {
        if (evt.dragging) {
            return;
        }
        commit("setMouseCoordinate", evt.coordinate);
    },

    /**
     * Updates the click coordinate and the related pixel depending on the map mode.
     * If Gfi Tool is active, the features of this coordinate/pixel are set.
     *
     * @param {MapBrowserEvent} evt - Click event in 2D, fake click event in 3D
     * @returns {void}
     */
    updateClick ({getters, commit, dispatch, rootGetters}, evt) {

        if (getters.mode === "2D" || getters.mode === "Oblique") {
            commit("setClickCoordinate", evt.coordinate);
            commit("setClickPixel", evt.pixel);
        }
        else {
            commit("setClickCoordinate", evt.pickedPosition);
            commit("setClickPixel", [evt.position.x, evt.position.y]);
        }

        if (rootGetters["Tools/Gfi/active"]) {
            commit("setGfiFeatures", null);
            dispatch("MapMarker/removePolygonMarker", null, {root: true});
            dispatch("Maps/collectGfiFeatures", null, {root: true});
        }

<<<<<<< HEAD
    const mapView = map.getView();

    commit("setResolution", mapView.getResolution());
    commit("setBoundingBox", mapView.calculateExtent(map.getSize()));
    commit("setRotation", mapView.getRotation());
    dispatch("setCenter", mapView);
}
/**
 * @param {Object} evt update event
 * @returns {Function} update function for mouse coordinate
 */
function updatePointer ({commit}, evt) {
    if (evt.dragging) {
        return;
    }
    commit("setMouseCoordinate", evt.coordinate);
}

/**
 * Updates the click coordinate and the related pixel depending on the map mode.
 * If Gfi Tool is active, the features of this coordinate/pixel are set.
 *
 * @param {MapBrowserEvent} evt - Click event in 2D, fake click event in 3D
 * @returns {void}
 */
function updateClick ({getters, commit, dispatch, rootGetters}, evt) {

    if (getters.mode === "2D" || getters.mode === "Oblique") {
        commit("setClickCoordinate", evt.coordinate);
        commit("setClickPixel", evt.pixel);
    }
    else {
        commit("setClickCoordinate", evt.pickedPosition);
        commit("setClickCartesianCoordinate", [evt.position.x, evt.position.y]);
    }
=======
        if (!rootGetters["controls/orientation/poiModeCurrentPositionEnabled"]) {
            dispatch("MapMarker/placingPointMarker", evt.coordinate, {root: true});
            commit("controls/orientation/setPosition", evt.coordinate, {root: true});
            commit("controls/orientation/setShowPoi", true, {root: true});
        }
    },

    /**
     * @typedef {Object} LayerData minimal implementation, more to come
     * @property {String} name layer name
     * @property {Boolean} visibility layer visibility
     * @property {Number} opacity layer opacity in [0, 1] range
     * @property {module:ol/layer} olLayer openlayers layer object kept for quick access
     */
>>>>>>> d1bdac183... BG-2294 add interactionsZoomTo and WIP unit tests

    /**
     * Normalizes layer data of map for easy access.
     * @param {Object} state state object
     * @param {module:ol/Layer[]} layerArray array of layers of ol/Map
     * @returns {[object, LayerData[]]} returns layer byId and idList according to store normalization
     */
    normalizeLayers (state, layerArray) {
        const layers = {},
            layerIds = [];

        layerArray.forEach(layer => {
            const id = layer?.get("id");

            if (typeof id !== "undefined") {
                layerIds.push(id);
                layers[id] = {
                    name: layer.get("name") || "Unbenannter Layer",
                    visibility: layer.getVisible(),
                    opacity: layer.getOpacity(),
                    olLayer: layer
                };
            }
        });
        return [
            layers,
            layerIds
        ];
    },

    /**
     * Sets the center of the current view.
     * @param {Object} payload parameter object
     * @param {number[]} mapView view of the the map
     * @returns {void}
     */
    setCenter ({commit, getters}, mapView) {
        const coords = mapView.getCenter();

        if (Array.isArray(coords) && coords.length === 2 && typeof coords[0] === "number" && typeof coords[1] === "number") {
            commit("setCenter", coords);
            getters.getView.setCenter(coords);
        }
        else {
            console.warn("Center was not set. Probably there is a data type error. The format of the coordinate must be an array with two numbers.");
        }
    }
};
