import stateMap from "./stateMap";
import {generateSimpleGetters} from "../../../app-store/utils/generators";
import {createGfiFeature} from "../../../api/gfi/getWmsFeaturesByMimeType";
import {getGfiFeaturesByTileFeature} from "../../../api/gfi/getGfiFeaturesByTileFeature";
import thousandsSeparator from "../../../utils/thousandsSeparator.js";
import mapCollection from "../../../core/dataStorage/mapCollection.js";

const gettersMap = {
    ...generateSimpleGetters(stateMap),

    /**
     * @param {Object} state the map state
     * @return {boolean} whether the portal is currently in 3D mode
     */
    is3d ({mapMode}) {
        return mapMode === "3D";
    },

    /**
     * gets all visible layers
     * @param {Object} state - the map state
     * @param {Object[]} state.layerList - all avaible layers in the map
     * @returns {Object[]} all visible layers
     */
    visibleLayerList: ({layerList}) => {
        return layerList.filter(layer => layer.getVisible());
    },

    /**
     * Gets all visible layers with children from Group layers.
     * @param {Object} state - The map state.
     * @param {Object[]} getters.layerList - All visible layers in the map.
     * @returns {Object[]} all visible layers
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
    },

    /**
     * gets the features at the given pixel for the gfi
     * @param {object} state - the map state
     * @param {object} state.map3d - the OLCesium  3d map
     * @param {number[]} state.clickPixel - the pixel coordinate of the click event
     * @returns {object[]} gfi features
     */
    gfiFeaturesAtPixel: (state, {clickPixel}) => {
        const featuresAtPixel = [],
            map3D = mapCollection.getMap("olcs", "3D");

        if (clickPixel) {
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
        }

        return featuresAtPixel;
    },

    /**
     * @param {Object} _ state
     * @param {Object} g getters
     * @returns {Function} layer getter by id
     */
    layerById: (_, g) => id => g.layers && g.layers[id],
    /**
     * @param {Object} _ state
     * @param {Object} g getters
     * @returns {Boolean} whether current zoom level is the maximum zoom level
     */
    maximumZoomLevelActive: (_, g) => g.zoomLevel >= g.maxZoomLevel,
    /**
     * @param {Object} _ state
     * @param {Object} g getters
     * @returns {Boolean} whether current zoom level is the minimal zoom level
     */
    minimumZoomLevelActive: (_, g) => g.zoomLevel <= g.minZoomLevel,
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
    prettyMouseCoord: (_, {mouseCoord}) => mouseCoord ? `${mouseCoord[0].toString().substr(0, 9)}, ${mouseCoord[1].toString().substr(0, 10)}` : "",
    projectionCode: (_, g) => g.projection?.getCode(),
    projectionMetersPerUnit: (_, g) => g.projection?.getMetersPerUnit(),
    projectionUnits: (_, g) => g.projection?.getUnits(),
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
     * returns the 2D ol map from the map collection.
     * @returns {module:ol/PluggableMap~PluggableMap} ol 2D map
     */
    ol2DMap: () => {
        return mapCollection.getMap("ol", "2D");
    }
};

export default gettersMap;
