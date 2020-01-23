import {Map, PluggableMap} from "ol";
import {defaults as olDefaultInteractions} from "ol/interaction.js";

import setBackgroundImage from "./lib/setBackgroundImage";
import getInitialLayers from "./lib/getInitialLayers";
import defaults from "./defaults";
import * as wms from "./layer/wms";
import * as geojson from "./layer/geojson";
import {createMapView} from "./mapView";
import {initializeLayerList, getLayerWhere} from "./rawLayerList";
import {registerProjections} from "./crs";
import {setGazetteerUrl} from "./searchAddress";

/**
 * lookup for layer constructors
 * @ignore
 */
const layerBuilderMap = {
        wms: wms,
        geojson: geojson
    },
    originalAddLayer = PluggableMap.prototype.addLayer;

/**
 * Adds a layer to the map, or adds a layer to the map by id.
 * This id is looked up within the array of all known services.
 *
 * Make sure services have been loaded with a callback on createMap
 * if you request the services from the internet.
 *
 * This function is available on all ol/Map instances.
 * @param {(string|ol/Layer)} layerOrId - if of layer to add to map
 * @param {object} [params] - optional parameter object
 * @param {boolean} [params.visibility=true] - whether added layer is initially visible
 * @param {Number} [params.transparency=0] - how visible the layer is initially
 * @returns {?ol.Layer} added layer
 */
export function addLayer (layerOrId, params = {visibility: true, transparency: 0}) {
    var layer, layerBuilder;

    // if parameter is id, create and add layer with masterportalAPI mechanisms
    if (typeof layerOrId === "string") {
        const rawLayer = getLayerWhere({id: layerOrId});

        if (!rawLayer) {
            console.error("Layer with id '" + layerOrId + "' not found. No layer added to map.");
            return null;
        }
        layerBuilder = layerBuilderMap[rawLayer.typ.toLowerCase()];
        if (!layerBuilder) {
            console.error("Layer with id '" + layerOrId + "' has unknown type '" + rawLayer.typ + "'. No layer added to map.");
            return null;
        }

        layer = layerBuilder.createLayer(rawLayer, {map: this.map});
        layer.setVisible(typeof params.visibility === "boolean" ? params.visibility : true);
        layer.setOpacity(typeof params.transparency === "number" ? (100 - params.transparency) / 100 : 1);
        originalAddLayer.call(this, layer);
        return layer;
    }

    // else use original function
    return originalAddLayer.call(this, layerOrId);
}

PluggableMap.prototype.addLayer = addLayer;

/**
 * Creates an openlayers map according to configuration. Does not set many default values itself, but uses function that do.
 * Check the called functions for default values, or [the defaults file]{@link ./defaults.js}.
 * @param {object} [config] - configuration object - falls back to defaults if none given
 * @param {string} [config.target="map"] - div id to render map to
 * @param {string} [config.backgroundImage] - background image for map; "" to use none
 * @param {string} [config.epsg] - CRS to use
 * @param {number[]} [config.extent] - extent to use
 * @param {Array.<{resolution: number, scale: number, zoomLevel: number}>} [config.options] - zoom level definition
 * @param {Array.<string[]>} [config.options] - each sub-array has two values: projection name, and projection description
 * @param {number} [config.startResolution] - initial resolution
 * @param {number[]} [config.startCenter] - initial position
 * @param {(string|object)} [config.layerConf] - services registry or URL thereof
 * @param {string} [config.gazetteerUrl] - url of gazetteer to use in searchAddress
 * @param {object} [params={}] - parameter object
 * @param {object} [params.mapParams] - additional parameter object that is spread into the ol.Map constructor object
 * @param {function} [params.callback] - optional callback for layer list loading
 * @returns {object} map object from ol
 */
export function createMap (config = defaults, {mapParams, callback} = {}) {
    registerProjections(config.namedProjections);
    setBackgroundImage(config);
    setGazetteerUrl(config.gazetteerUrl);
    const map = new Map(Object.assign({
        target: config.target || defaults.target,
        interactions: olDefaultInteractions({altShiftDragRotate: false, pinchRotate: false}),
        controls: [],
        view: createMapView(config)
    }, mapParams));

    // extend callback to load configured initial layers
    initializeLayerList(config.layerConf, (param, error) => {
        getInitialLayers(config)
            .forEach(layer => map.addLayer(layer.id, layer));

        if (typeof callback === "function") {
            return callback(param, error);
        }

        return null;
    });

    return map;
}
