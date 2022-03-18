import normalizeLayers from "./normalizeLayers";
import * as highlightFeature from "./highlightFeature";
import * as removeHighlightFeature from "./removeHighlighting";
import {getWmsFeaturesByMimeType} from "../../../../api/gfi/getWmsFeaturesByMimeType";
import getProxyUrl from "../../../../utils/getProxyUrl";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";

let unsubscribes = [],
    loopId = null;

/**
 * When map module is done, the normalized layers should be constructed on the fly when adding layers.
 * For now, these processes happen independently of each other, so we need a hack to get the data.
 * TODO remove this once all layers are added/removed with an action (~= replace map.js with this module)
 *
 * @param {Function} commit commit function
 * @param {module:ol/Map} map ol map
 * @returns {void}
 */
function loopLayerLoader (commit, map) {
    clearInterval(loopId);
    loopId = setInterval(() => {
        const [layers, layerIds] = normalizeLayers(map.getLayers().getArray());

        commit("setLayers", layers);
        commit("setLayerIds", layerIds);
    }, 5000);
}

const actions = {
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
            channel = Radio.channel("VectorLayer");

        // listen to featuresLoaded event to be able to determine if all features of a layer are completely loaded
        channel.on({"featuresLoaded": id => {
            commit("addLoadedLayerId", id);
            if (rootState.urlParams["Map/highlightFeature"]) {
                dispatch("highlightFeature", {type: "viaLayerIdAndFeatureId", layerIdAndFeatureId: rootState.urlParams["Map/highlightFeature"]});
            }
        }});
        commit("setMapId", map.id);
        commit("setMapMode", map.mode);
        commit("setLayerList", map.getLayers().getArray());
        // update state once initially to get initial settings
        dispatch("updateViewState", {map: map});
        // hack: see comment on function
        loopLayerLoader(commit, map);
        // currently has no change mechanism
        commit("setProjection", mapView.getProjection());

        // note initial values for quick comparisons/resets
        commit("setInitialZoomLevel", mapView.getZoom());
        commit("setInitialCenter", mapView.getCenter());
        commit("setInitialResolution", mapView.getResolution());

        // register listeners with state update functions
        unsubscribes = [
            map.on("moveend", evt => dispatch("updateViewState", evt)),
            map.on("pointermove", evt => dispatch("updatePointer", evt)),
            map.on("click", evt => dispatch("updateClick", evt)),
            map.on("change:size", evt => commit("setSize", evt.target.getSize()))
        ];
    },

    /**
     * @param {MapBrowserEvent} evt - Moveend event
     * @returns {Function} update function for state parts to update onmoveend
     */
    updateViewState ({commit, dispatch, getters}, evt) {
        let map;

        if (evt) {
            map = evt.map;
        }
        else {
            ({map} = getters);
        }

        const mapView = map.getView();

        commit("setZoomLevel", mapView.getZoom());
        commit("setMaxZoomLevel", mapView.getMaxZoom());
        commit("setMinZoomLevel", mapView.getMinZoom());
        commit("setResolution", mapView.getResolution());
        commit("setMaxResolution", mapView.getMaxResolution());
        commit("setMinResolution", mapView.getMinResolution());
        commit("setBbox", mapView.calculateExtent(map.getSize()));
        commit("setRotation", mapView.getRotation());
        dispatch("setCenter", mapView.getCenter());
    },
    /**
     * @param {Object} evt update event
     * @returns {Function} update function for mouse coordinate
     */
    updatePointer ({commit}, evt) {
        if (evt.dragging) {
            return;
        }
        commit("setMouseCoord", evt.coordinate);
    },

    /**
     * Updates the click coordinate and the related pixel depending on the map mode.
     * If Gfi Tool is active, the features of this coordinate/pixel are set.
     *
     * @param {MapBrowserEvent} evt - Click event in 2D, fake click event in 3D
     * @returns {void}
     */
    updateClick ({getters, commit, dispatch, rootGetters}, evt) {

        if (getters.mapMode === "2D" || getters.mapMode === "Oblique") {
            commit("setClickCoord", evt.coordinate);
            commit("setClickPixel", evt.pixel);
        }
        else {
            commit("setClickCoord", evt.pickedPosition);
            commit("setClickPixel", [evt.position.x, evt.position.y]);
            commit("setMap3d", evt.map3d);
        }

        if (rootGetters["Tools/Gfi/active"]) {
            commit("setGfiFeatures", null);
            dispatch("MapMarker/removePolygonMarker", null, {root: true});
            dispatch("collectGfiFeatures");
        }

        if (!rootGetters["controls/orientation/poiModeCurrentPositionEnabled"]) {
            dispatch("MapMarker/placingPointMarker", evt.coordinate, {root: true});
            commit("controls/orientation/setPosition", evt.coordinate, {root: true});
            commit("controls/orientation/setShowPoi", true, {root: true});
        }
    },

    /**
     * collects features for the gfi.
     *
     * @returns {void}
     */
    collectGfiFeatures ({getters, commit, dispatch}) {
        const {clickCoord, visibleWmsLayerListAtResolution, resolution, projection, gfiFeaturesAtPixel} = getters,
            gfiWmsLayerList = visibleWmsLayerListAtResolution.filter(layer => {
                return layer.get("gfiAttributes") !== "ignore";
            });

        Promise.all(gfiWmsLayerList.map(layer => {
            const gfiParams = {
                INFO_FORMAT: layer.get("infoFormat"),
                FEATURE_COUNT: layer.get("featureCount")
            };
            let url = layer.getSource().getFeatureInfoUrl(clickCoord, resolution, projection, gfiParams);

            // this part is needed if a Url contains a style which seems to mess up the getFeatureInfo call
            if (url.indexOf("STYLES") && url.indexOf("STYLES=&") === -1) {
                const newUrl = url.replace(/STYLES=.*?&/g, "STYLES=&");

                url = newUrl;
            }

            /**
             * @deprecated in the next major-release!
             * useProxy
             * getProxyUrl()
             */
            url = layer.get("useProxy") ? getProxyUrl(url) : url;

            return getWmsFeaturesByMimeType(layer, url);
        }))
            .then(gfiFeatures => {
                // only commit if features found
                if (gfiFeaturesAtPixel.concat(...gfiFeatures).length > 0) {
                    commit("setGfiFeatures", gfiFeaturesAtPixel.concat(...gfiFeatures));
                }
            })
            .catch(error => {
                console.warn(error);
                dispatch("Alerting/addSingleAlert", i18next.t("common:modules.tools.gfi.errorMessage"), {root: true});
            });
    },

    /**
     * Sets a new zoom level to map and store. All other fields will be updated onmoveend.
     *
     * @param {number} zoomLevel The zoomLevel to zoom to.
     * @returns {void}
     */
    setZoomLevel ({getters, commit}, zoomLevel) {
        const {maxZoomLevel, minZoomLevel} = getters;

        if (zoomLevel <= maxZoomLevel && zoomLevel >= minZoomLevel) {
            getters.ol2DMap.getView().setZoom(zoomLevel);
            commit("setZoomLevel", zoomLevel);
        }
    },
    increaseZoomLevel ({dispatch, getters}) {
        dispatch("setZoomLevel", getters.zoomLevel + 1);
    },
    decreaseZoomLevel ({dispatch, getters}) {
        dispatch("setZoomLevel", getters.zoomLevel - 1);
    },
    /**
     * Turns a visible layer invisible and the other way around.
     *
     * @param {String} layerId id of the layer to toggle visibility of
     * @returns {void}
     */
    toggleLayerVisibility ({getters, commit}, {layerId}) {
        const layer = getters.layers[layerId];

        if (layer) {
            const nextVisibility = !layer.olLayer.getVisible();

            layer.olLayer.setVisible(nextVisibility);
            commit("setLayerVisibility", {layerId, visibility: nextVisibility});
            return;
        }

        console.warn(`No layer with id ${layerId} found to toggle visibility of.`);
    },
    /**
     * Sets the opacity of a layer.
     *
     * @param {Object} payload parameter object
     * @param {String} payload.layerId id of layer to change opacity of
     * @param {Number} payload.value opacity value in range (0, 1)
     * @returns {void}
     */
    setLayerOpacity ({getters, commit}, {layerId, value}) {
        const layer = getters.layers[layerId];

        if (!layer) {
            console.warn(`No layer with id ${layerId} found to set opacity of.`);
            return;
        }

        layer.olLayer.setOpacity(value);
        commit("setLayerOpacity", {layerId, opacity: value});
    },
    /**
     * Sets center and resolution to initial values.
     * @returns {void}
     */
    resetView ({state, dispatch, getters}) {
        const {initialCenter, initialResolution} = state,
            mapView = getters.ol2DMap.getView();

        mapView.setCenter(initialCenter);
        mapView.setResolution(initialResolution);

        dispatch("MapMarker/removePointMarker", null, {root: true});
    },
    /**
     * Sets the resolution by the given index of available resolutions.
     * NOTE: is used by scaleSwitcher tutorial.
     *
     * @param {*} _ empty store
     * @param {Number} index of the resolution
     * @returns {void}
     */
    setResolutionByIndex ({getters}, index) {
        const map = getters.ol2DMap,
            view = map.getView();

        view.setResolution(view.getResolutions()[index]);
    },
    /**
     * Adds a listener to maps pointermove and calls callback-funktion
     *
     * @param {*} _ empty store
     * @param {Function} callback  to be called on pointermove
     * @returns {void}
     */
    addPointerMoveHandler ({getters}, callback) {
        if (callback) {
            getters.ol2DMap.on("pointermove", e => callback(e));
        }

    },
    /**
     * Removes a listener from maps pointermove
     *
     * @param {*} _ empty store
     * @param {Function} callback  to be called on pointermove
     * @returns {void}
     */
    removePointerMoveHandler ({getters}, callback) {
        const map = getters.ol2DMap;

        map.un("pointermove", e => callback(e));
    },
    /**
     * Adds an interaction to the map.
     *
     * @param {*} _ empty store
     * @param {module:ol/interaction/Interaction} interaction - Interaction to be added to map.
     * @returns {void}
     */
    addInteraction ({getters}, interaction) {
        const map = getters.ol2DMap;

        map.addInteraction(interaction);
    },
    /**
     * Removes an interaction from the map.
     *
     * @param {*} _ empty store
     * @param {module:ol/interaction/Interaction} interaction - Interaction to be removed from map.
     * @returns {void}
     */
    removeInteraction ({getters}, interaction) {
        const map = getters.ol2DMap;

        map.removeInteraction(interaction);
    },
    /**
     * Zoom to the given geometry or extent based on the current map size.
     * @see {@link https://openlayers.org/en/latest/apidoc/module-ol_View-View.html#fit|ol.view.fit}
     * @param {module:ol/geom/Geometry | module:ol/extent} payload.geometryOrExtent The geometry or extent to zoom to.
     * @param {Object} payload.options Documentation linked.
     * @returns {void}
     */
    zoomTo ({commit, getters}, {geometryOrExtent, options}) {
        const mapView = getters.ol2DMap.getView();

        mapView.fit(geometryOrExtent, {
            duration: options?.duration ? options.duration : 800,
            ...options
        });
        commit("setCenter", mapView.getCenter());
    },
    /**
     * Creates a new vector layer and adds it to the map.
     * If it already exists, this layer is returned.
     * @param {Object} payload parameter object
     * @param {String} name The name and the id for the layer.
     * @returns {module:ol/layer} The created or the already existing layer.
     */
    createLayer ({state, getters}, name) {
        const layerList = state.layerList;

        let resultLayer = layerList.find(layer => {
            return layer.get("name") === name;
        });

        if (resultLayer !== undefined) {
            return resultLayer;
        }

        resultLayer = new VectorLayer({
            id: name,
            name: name,
            source: new VectorSource(),
            zIndex: 999
        });
        getters.ol2DMap.addLayer(resultLayer);
        return resultLayer;
    },
    /**
     * Sets the center of the current view.
     * @param {Object} payload parameter object
     * @param {number[]} coords An array of numbers representing a xy-coordinate.
     * @returns {void}
     */
    setCenter ({commit, getters}, coords) {
        if (Array.isArray(coords) && coords.length === 2 && typeof coords[0] === "number" && typeof coords[1] === "number") {
            commit("setCenter", coords);
            getters.ol2DMap.getView().setCenter(coords);
        }
        else {
            console.warn("Center was not set. Probably there is a data type error. The format of the coordinate must be an array with two numbers.");
        }
    },
    ...highlightFeature,
    ...removeHighlightFeature
};

export default actions;
