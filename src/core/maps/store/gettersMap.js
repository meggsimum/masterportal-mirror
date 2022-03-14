import {generateSimpleGetters} from "../../../app-store/utils/generators";
import {getLayerList} from "masterportalAPI/src/rawLayerList";
import initialState from "./stateMap";
import {createGfiFeature} from "../../../api/gfi/getWmsFeaturesByMimeType";
import {getGfiFeaturesByTileFeature} from "../../../api/gfi/getGfiFeaturesByTileFeature";
import thousandsSeparator from "../../../utils/thousandsSeparator.js";
import mapCollection from "../../../core/dataStorage/mapCollection.js";

const getters = {
    ...generateSimpleGetters(initialState),
    /**
     * Returns the 2D ol map from the map collection.
     * @returns {module:ol/PluggableMap~PluggableMap} ol 2D map
     */
    get2DMap: () => {
        return mapCollection.getMap("ol", "2D");
    },
    /**
     * Returns the 3D olcs map from the map collection.
     * @returns {module:ol/PluggableMap~PluggableMap} ol 2D map
     */
    get3DMap: () => {
        return mapCollection.getMap("olcs", "3D");
    },
    /**
     * Returns the layer collection of the map
     * @returns {Object} layer collection of the map.
     */
    getLayers: () => {

        return mapCollection.getMap("ol", "2D").getLayers();
    },
    /**
     * gets the features at the given pixel for the gfi
     * @param {object} state - the map state
     * @param {number[]} state.clickPixel - the pixel coordinate of the click event
     * @returns {object[]} gfi features
     */
    gfiFeaturesAtPixel: (state, {clickPixel}) => {
        const featuresAtPixel = [],
            map3D = mapCollection.getMap("olcs", "3D");

        mapCollection.getMap("ol", "2D").forEachFeatureAtPixel(clickPixel, (feature, layer) => {
            if (layer?.getVisible() && layer?.get("gfiAttributes") && layer?.get("gfiAttributes") !== "ignore") {
                if (feature.getProperties().features) {
                    feature.get("features").forEach(function (clusteredFeature) {
                        featuresAtPixel.push(createGfiFeature(
                            layer,
                            "",
                            clusteredFeature
                        ));
                    });
                }
                else {
                    featuresAtPixel.push(createGfiFeature(
                        layer,
                        "",
                        feature
                    ));
                }
            }
        });

        if (map3D && Array.isArray(clickPixel) && clickPixel.length === 2) {
            // add features from map3d
            const scene = map3D.getCesiumScene(),
                tileFeatures = scene.drillPick({x: clickPixel[0], y: clickPixel[1]});

            tileFeatures.forEach(tileFeature => {
                const gfiFeatures = getGfiFeaturesByTileFeature(tileFeature);

                if (Array.isArray(gfiFeatures)) {
                    gfiFeatures.forEach(gfiFeature => {
                        featuresAtPixel.push(gfiFeature);
                    });
                }
            });
        }

        return featuresAtPixel;
    },
    /**
     * Returns the current 2D map view
     * @returns {Object} Returns current 2D map view .
     */
    getView: () => {
        return mapCollection.getMapView("ol", "2D");
    },
    /**
     * Returns a map overlay of a certain id.
     * @param {String} id of the overlay.
     * @returns {Object} overlay of the map.
     */
    getOverlayById: (id) => {
        return mapCollection.getMap("ol", "2D").getOverlayById(id);
    },
    /**
     * Returns the corresponding resolution for the scale.
     * @param  {String|Number} scale - the scale
     * @param  {String} scaleType - min or max
     * @return {Number} resolution
     */
    getResolutionByScale: () => (scale, scaleType) => {
        const scales = mapCollection.getMapView("ol", "2D").get("options").map(option => option.scale);

        let index = "",
            unionScales = scales.concat([parseInt(scale, 10)].filter(item => scales.indexOf(item) < 0));

        unionScales = unionScales.sort((a, b) => b - a);

        index = unionScales.indexOf(parseInt(scale, 10));
        if (unionScales.length === scales.length || scaleType === "max") {
            return mapCollection.getMapView("ol", "2D").getResolutions()[index];
        }
        else if (scaleType === "min") {
            return mapCollection.getMapView("ol", "2D").getResolutions()[index - 1];
        }
        return null;
    },
    /**
     * Returns a projected boundingbox of a provided coordinate system.
     * @param {String} crs for the target projection of the bbox.
     * @returns {Array} Returns the projected bbox.
     */
    getProjectedBBox: () => (crs) => {
        return mapCollection.getMapView("ol", "2D").getProjectedBBox(crs);
    },
    /**
     * Returns the camera of the 3D map
     * @returns {Object} Returns the camera of the 3D map
     */
    getCamera: () => {
        return mapCollection.getMap("olcs", "3D").getCamera();
    },
    /**
     * Returns the globe of Cesium scene
     * @returns {Object} Returns the 3D globe object.
     */
    getGlobe: () => {
        return mapCollection.getMap("olcs", "3D").getCesiumScene().globe;
    },
    /**
     * Returns the Cesium scene
     * @returns {Object} Returns the cesium scene.
     */
    getCesiumScene: () => {
        return mapCollection.getMap("olcs", "3D").getCesiumScene();
    },
    /**
     * Returns
     *
     * @param {Object} state Current state object of the store.
     * @returns {Object} Returns the .
     */
    getShadowMap: () => {
        return mapCollection.getMap("olcs", "3D").getCesiumScene().shadowMap;
    },
    /**
     * @param {object} state - the map state
     * @returns {Array} reversed gfiFeatures Array from state
     */
    gfiFeaturesReverse: (state) => {
        if (state.gfiFeatures !== null && Array.isArray(state.gfiFeatures)) {
            return state.gfiFeatures.slice().reverse();
        }

        return state.gfiFeatures;
    },
    /**
     * @param {Object} mode of the map
     * @return {boolean} whether the portal is currently in 3D mode
     */
    is3d ({mode}) {
        return mode === "3D";
    },
    /**
     * @param {Object} _ state
     * @param {Object} g getters
     * @returns {Boolean} whether current zoom level is the maximum zoom level
     */
    maximumZoomLevelActive: (_, g) => g.getView.getZoom() >= g.getView.getMaxZoom(),
    /**
     * @param {Object} _ state
     * @param {Object} g getters
     * @returns {Boolean} whether current zoom level is the minimal zoom level
     */
    minimumZoomLevelActive: (_, g) => g.getView.getZoom() <= g.getView.getMinZoom(),
    /**
     * @param {Object} _ state
     * @param {Object} params getter parameters
     * @param {Number} params.scale x from computed scale value 1:x
     * @returns {String} pretty-printed scale to 2cms
     */
    scaleWithUnit: (_, {scale}) => {
        const scaleNumber = Math.round(0.02 * scale);

        return scaleNumber >= 1000 ? `${Math.round(scaleNumber / 100) / 10} km` : `${scaleNumber} m`;
    },
    /**
     * returns a beautified state in format "1 : scale" where scale is rounded based on its value
     * @param {Object} _ state
     * @param {Object} params getter parameters
     * @param {Number} params.scale a value (number) from computed scale 1:x
     * @returns {String} pretty-printed scale as "1 : scale"
     */
    scaleToOne: (_, {scale}) => {
        if (typeof scale !== "number" || scale <= 0) {
            return "1 : scale must be a positive number";
        }
        let result = Math.round(scale);

        if (result > 10000) {
            result = Math.round(result / 500) * 500;
        }
        else if (result > 1000) {
            result = Math.round(result / 50) * 50;
        }

        return "1 : " + thousandsSeparator(result);
    },
    /**
     * @param {Object} _ state
     * @param {Object} params getter parameters
     * @param {Number[]} params.mouseCoord the mouse coord as array
     * @returns {String} pretty-printed mouse coordinate
     */
    prettyMouseCoord: (_, {mouseCoordinate}) => mouseCoordinate ? `${mouseCoordinate[0].toString().substr(0, 9)}, ${mouseCoordinate[1].toString().substr(0, 10)}` : "",
    /**
     * @param {Object} _ state
     * @param {Object} g getters
     * @returns {String} projection code
     */
    projectionCode: (_, g) => g.projection?.getCode(),

    /*
     * Layerlist
     *
     */

    /**
     * Gets all layers from layerList
     * @returns {Object} Returns the layerlist.
     */
    getLayerList: () => {
        return getLayerList();
    },
    /**
     * Gets all visible layers from layerList
     * @param {Object[]} state.layerList - all visible layers in the map
     * @returns {Object[]} all visible layers
     */
    getVisibleLayerList: () => {
        return getLayerList().filter(layer => layer.getVisible());
    },
    /**
     * Gets all visible layers with children from group layers.
     * @param {Object} state - The map state.
     * @param {Object} visibleLayerList visible layers.
     * @param {Object[]} getters.layerList all visible layers in the map.
     * @returns {Object[]} all visible layers.
     */
    visibleLayerListWithChildrenFromGroupLayers: (state, {visibleLayerList}) => {
        const list = [];

        visibleLayerList.forEach(layer => {

            if (layer.get("layers") && typeof layer.get("layers").getArray === "function") {
                layer.get("layers").getArray().forEach(childLayer => {
                    list.push(childLayer);
                });
            }
            else {
                list.push(layer);
            }
        });
        return list;
    },
    /**
     * Gets all visible wms layers.
     * @param {Object} state - the map state
     * @param {Object} visibleLayerListWithChildrenFromGroupLayers children list from group layers
     * @param {Object} getters - the map getters
     * @param {Object[]} getters.visibleLayerList - all visible layers in the map
     * @returns {Object[]} all visible wms layers
     */
    visibleWmsLayerList: (state, {visibleLayerListWithChildrenFromGroupLayers}) => {
        return visibleLayerListWithChildrenFromGroupLayers.filter(layer => {
            return layer.get("typ") === "WMS";
        });
    },
    /**
     * gets all visible wms layers at the current resolution
     * @param {Object} state - the map state
     * @param {Object} getters - the map getters
     * @param {Object[]} getters.visibleWmsLayerList - all visible wms layers in the map
     * @returns {Object[]} all visible wms layers at the current resolution
     */
    visibleWmsLayerListAtResolution: (state, {visibleWmsLayerList, resolution}) => {
        return visibleWmsLayerList.filter(layer => {
            return resolution <= layer.get("maxResolution") && resolution >= layer.get("minResolution");
        });
    }
};

export default getters;

