import _ from "underscore";
import {Map} from "ol";
import {defaults as olDefaultInteractions} from "ol/interaction.js";

import setBackgroundImage from "./lib/setBackgroundImage";
import defaults from "./defaults";
import * as wms from "./layer/wms";
import * as geojson from "./layer/geojson";
import {createMapView} from "./mapView";
import {initializeLayerList, getLayerWhere} from "./rawLayerList";
import {registerProjections} from "./crs";

var layerBuilderMap = {
        wms: wms,
        geojson: geojson
    },
    map;

/**
 * Creates an openlayers map according to configuration.
 * @param {object} config - configuration object
 * @param {object} params - additional parameter object that is spread into the ol.Map constructor object
 * @returns {object} map object from ol
 */
export function createMap (config, params) {
    registerProjections(config.namedProjections);
    initializeLayerList(config.layerConf);
    setBackgroundImage(config);
    map = new Map(_.extend({
        target: config.target || defaults.target,
        interactions: olDefaultInteractions({altShiftDragRotate: false, pinchRotate: false}),
        view: createMapView(config)
    }, params));
    return map;
}

/**
 * Adds a layer to the map by id. This id is looked up within the array of all known services.
 * @param {string} id - if of layer to add to map
 * @returns {ol/Layer|null} added layer
 */
export function addLayer (id) {
    var layer,
        layerBuilder,
        rawLayer = getLayerWhere({id});

    if (!rawLayer) {
        console.error("Layer with id '" + id + "' not found. No layer added to map.");
        return null;
    }
    layerBuilder = layerBuilderMap[rawLayer.typ.toLowerCase()];
    if (!layerBuilder) {
        console.warn("Layer with id '" + id + "' has unknown type '" + rawLayer.typ + "'. No layer added to map.");
        return null;
    }
    layer = layerBuilder.createLayer(rawLayer);
    map.addLayer(layer);
    return layer;
}
