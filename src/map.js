import {Map} from "ol";
import {defaults as olDefaultInteractions} from "ol/interaction.js";

import setBackgroundImage from "./lib/setBackgroundImage";
import defaults from "./defaults";
import * as wms from "./layer/wms";
import * as geojson from "./layer/geojson";
import {createMapView} from "./mapView";
import {initializeLayerList, getLayerWhere} from "./rawLayerList";
import {registerProjections} from "./crs";

/**
 * lookup for layer constructors
 * @ignore
 */
const layerBuilderMap = {
    wms: wms,
    geojson: geojson
};

/**
 * last map created by createMap
 * @type {ol.Map}
 * @ignore
 */
let map;

/**
 * Creates an openlayers map according to configuration. Does not set many default values itself, but uses function that do.
 * Check the called functions for default values, or [the defaults file]{@link ./defaults.js}.
 * @param {object} config - configuration object
 * @param {string} [config.target="map"] - div id to render map to
 * @param {string} [config.backgroundImage] - background image for map; "" to use none
 * @param {string} [config.epsg] - CRS to use
 * @param {number[]} [config.extent] - extent to use
 * @param {Array.<{resolution: number, scale: number, zoomLevel: number}>} [config.options] - zoom level definition
 * @param {Array.<string[]>} [config.options] - each sub-array has two values: projection name, and projection description
 * @param {number} [config.startResolution] - initial resolution
 * @param {number[]} [config.startCenter] - initial position
 * @param {(string|object)} [config.layerConf] - services registry or URL thereof
 * @param {object} [params={}] - parameter object
 * @param {object} [params.mapParams] - additional parameter object that is spread into the ol.Map constructor object
 * @param {function} [params.callback] - optional callback for layer list loading
 * @returns {object} map object from ol
 */
export function createMap (config, {mapParams, callback} = {}) {
    registerProjections(config.namedProjections);
    initializeLayerList(config.layerConf, callback);
    setBackgroundImage(config);
    map = new Map(Object.assign({
        target: config.target || defaults.target,
        interactions: olDefaultInteractions({altShiftDragRotate: false, pinchRotate: false}),
        view: createMapView(config)
    }, mapParams));
    return map;
}

/**
 * Adds a layer to the map by id. This id is looked up within the array of all known services.
 * @param {string} id - if of layer to add to map
 * @returns {?ol.Layer} added layer
 */
export function addLayer (id) {
    const rawLayer = getLayerWhere({id});
    var layer, layerBuilder;

    if (!rawLayer) {
        console.error("Layer with id '" + id + "' not found. No layer added to map.");
        return null;
    }
    layerBuilder = layerBuilderMap[rawLayer.typ.toLowerCase()];
    if (!layerBuilder) {
        console.error("Layer with id '" + id + "' has unknown type '" + rawLayer.typ + "'. No layer added to map.");
        return null;
    }

    layer = layerBuilder.createLayer(rawLayer, {map});
    map.addLayer(layer);
    return layer;
}
