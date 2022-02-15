import api from "masterportalAPI/src/maps/api";
import {getLayerList} from "masterportalAPI/src/rawLayerList";

import "./2DMap";
import "./2DMapView";
import "./2DMapRadioBridge";
import "./2DMapViewRadioBridge";

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
    mapCollection.getMapView("ol", "2D").initStore();

    // Remove later

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
    // Todo hier die neue 3D map nach Umzug anlegen.
    // Layervorbereitungen hier per action aufrufen? vgl activateMap3d aus map3D.js
    // shadowTime ergänzen
    // startingMap3D.configJs
    if (window.Cesium) {
        mapCollection.getMapView("ol", "2D").initStore();
        const map3D2D = mapCollection.getMap("ol", "2D"),
            map3D = api.map.createMap({
                map2D: map3D2D,
                shadowTime: undefined
            }, "3D");

        mapCollection.addMap(map3D, "olcs", "3D");
        // store.dispatch("Maps/setMapAttributes", {map: map3D2D});
        store.dispatch("Map/setMapAttributes", {map: map3D2D});
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
 * Create the map in differnt modes (2D, 3D and oblique)
 * @param {Object} configJs The config.js file.
 * @param {Object} mapViewSettings The mapViewSettings of config.json file.
 * @returns {void}
 */
export function createMaps (configJs, mapViewSettings) {
    create2DMap(mapViewSettings);
    create3DMap(configJs);
    createObliqueMap(configJs);
}

/**
 * Returns the mapmode. Oblique, 3D and 2D are available for selection.
 * @todo Refactor this function once the 3DMap and ObliqueMap have been migrated.
 * @returns {String} The current mapMode.
 */
export function getMapMode () {
    if (Radio.request("ObliqueMap", "isActive")) {
        return "Oblique";
    }
    else if (Radio.request("Map", "isMap3d")) {
        return "3D";
    }
    return "2D";
}
