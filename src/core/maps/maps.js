import api from "masterportalapi/src/maps/api";
import {getLayerList} from "masterportalapi/src/rawLayerList";

import "./2DMap";
import "./2DMapView";
import "./2DMapRadioBridge";
import "./2DMapViewRadioBridge";
import "./3DMapRadioBridge";

import ObliqueMap from "../../../modules/core/obliqueMap";
import mapCollection from "../dataStorage/mapCollection";
import store from "../../app-store";

/**
 * Create the 2D map and mapview
 * @param {Object} mapViewSettings The mapViewSettings of config.json file.
 * @returns {void}
 */
function create2DMap (mapViewSettings) {
    const map = api.map.createMap(
        {
            ...Config,
            ...mapViewSettings,
            layerConf: getLayerList()
        }, "2D", {});

    mapCollection.addMap(map, "ol", "2D");
    store.dispatch("Maps/initStore");

    // Remove later "Map/setMapAttributes"

    store.dispatch("Map/setMapAttributes", {map: map});
    store.dispatch("Maps/setMapAttributes", {map: map});
    Radio.trigger("ModelList", "addInitiallyNeededModels");
}

/**
 * Create the 3D map.
 * @param {Object} configJs The settings of config.json file.
 * @returns {void}
 */
function create3DMap () {
    if (window.Cesium && Config.startingMap3D) {
        store.dispatch("Maps/activateMap3D");
    }

}


/**
 * Create the oblique map.
 * @param {Object} configJs The config.js file.
 * @returns {void}
 */
function createObliqueMap (configJs) {
    if (configJs?.obliqueMap) {
        Radio.trigger("Map", "setObliqueMap", new ObliqueMap({}));
    }
}

/**
 * Create the map in different modes (2D, 3D and oblique)
 * @param {Object} configJs The config.js file.
 * @param {Object} mapViewSettings The mapViewSettings of config.json file.
 * @returns {void}
 */
export function createMaps (configJs, mapViewSettings) {
    create2DMap(mapViewSettings);
    create3DMap(configJs);
    createObliqueMap(configJs);
}
