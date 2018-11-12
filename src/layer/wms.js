import _ from "underscore";
import {Tile as TileLayer, Image as ImageLayer} from "ol/layer.js";
import TileGrid from "ol/tilegrid/TileGrid.js";
import TileWMS from "ol/source/TileWMS.js";
import ImageWMS from "ol/source/ImageWMS.js";

import {getLayerWhere} from "../rawLayerList";

/** @returns {number} random session id in range (0, 9999999) */
export function generateSessionId () {
    return _.random(9999999);
}

/**
 * Creates query parameters for webservice requests from rawLayer.
 * @param {object} rawLayer - layer specification as in services.json
 * @param {string} [rawLayer.format="image/png"] - format of images requested
 * @param {string} layers - comma-separated list of requested layers
 * @param {version} version - webservice version as string, e.g. "1.1.1"
 * @param {boolean} transparent - whether tiles from this service should have transparency where no information is available
 * @param {boolean} singleTile - whether only one tile shall be requested that fills the whole view
 * @param {string|number} tilesize - if singleTile is true, this is the requested tilesize
 * @returns {object} maps query parameter names to values
 */
export function makeParams (rawLayer) {
    return _.extend({
        SESSIONID: generateSessionId(),
        FORMAT: rawLayer.format || "image/png",
        LAYERS: rawLayer.layers,
        VERSION: rawLayer.version,
        TRANSPARENT: rawLayer.transparent,
        SINGLETILE: rawLayer.singleTile
    }, rawLayer.singleTile ? {} : {WIDTH: rawLayer.tilesize, HEIGHT: rawLayer.tilesize});
}

/**
 * Creates a TileGrid for a TileLayer.
 * @param {object} rawLayer - layer specification as in services.json
 * @param {object} [map] - required for defined resolutions, returns undefined if not given
 * @returns {undefined|ol/tilegrid/TileGrid} TileGrid for WMS
 */
export function createTileGrid (rawLayer, map) {
    if (!map) {
        return undefined;
    }

    return new TileGrid({
        resolutions: map.getView().getResolutions(),
        // HH-specific default
        origin: [442800, 5809000],
        tileSize: parseInt(rawLayer.tileSize, 10) || 256
    });
}

/**
 * Creates an ol/source element for the rawLayer.
 * @param {object} rawLayer - layer specification as in services.json
 * @param {string} [rawLayer.serverType] - optional servertype definition: "geoserver" or "mapserver" or "qgis"
 * @param {object} [map] - optionally give map to create a defined TileGrid
 * @returns {(ol/source/TileWMS|ol/source/ImageWMS)} TileWMS or ImageWMS, depending on whether singleTile is true.
 */
export function createLayerSource (rawLayer, map) {
    var params = makeParams(rawLayer);

    if (rawLayer.singleTile) {
        return new ImageWMS({
            url: rawLayer.url,
            params: params,
            serverType: rawLayer.serverType
        });
    }
    return new TileWMS({
        url: rawLayer.url,
        params: params,
        gutter: rawLayer.gutter || 0,
        tileGrid: createTileGrid(rawLayer, map)
    });
}

/**
 * Creates complete ol/Layer from rawLayer containing all required children.
 * @param {*} rawLayer - layer specification as in services.json
 * @param {object} [map] - optionally give map to create a defined TileGrid
 * @returns {ol/Layer} Layer that can be added to map.
 */
export function createLayer (rawLayer, map) {
    var source = createLayerSource(rawLayer, map),
        Layer = rawLayer.singleTile ? ImageLayer : TileLayer;

    return new Layer({
        source: source,
        minResolution: rawLayer.minScale,
        maxResolution: rawLayer.maxScale,
        // id passed to help identification in services.json
        id: rawLayer.id
    });
}

/**
 * Forces an update by giving a layer a new sessionID.
 * @param {ol/Layer} layer - the layer that is to be updated
 * @returns {number} the new sessionID
 */
export function updateSource (layer) {
    var oldSessionId = layer.getSource().getParams().SESSIONID,
        newSessionId = oldSessionId;

    // to avoid rolling the same ID again; never happens except in your presentation
    while (oldSessionId === newSessionId) {
        newSessionId = generateSessionId();
    }

    layer.getSource().updateParams({SESSIONID: newSessionId});
    return newSessionId;
}

/**
 * Generates an array of URLs that are supposed to hold legend graphics.
 * @param {*} rawLayer - layer specification as in services.json
 * @returns {string[]} URLs of legend graphics for the rawLayer.
 */
export function getLegendURLs (rawLayer) {
    if (rawLayer.legendURL) {
        return rawLayer.legendURL === "ignore" ? [] : [rawLayer.legendURL];
    }
    return rawLayer.layers
        .split(",")
        .filter(_.identity /* filters empty string since it's falsy */)
        .map(function (layerName) {
            return (
                rawLayer.url +
                "&SERVICE=WMS&REQUEST=GetLegendGraphic&FORMAT=image/png" +
                "?VERSION=" + rawLayer.version +
                "&LAYER=" + layerName
            );
        });
}

/**
 * Creates the gfiURL from clicked layer, map, and coordinate.
 * @param {ol/Layer} layer - what to get the gfiURL for
 * @param {ol/Map} map - needed for resolution/projection
 * @param {ol/coordinate} coordinate - which point to get the gfiURL for
 * @returns {(string|undefined)} the gfiURL, or undefined if it could not be constructed
 */
export function getGfiURL (layer, map, coordinate) {
    var rawLayer = getLayerWhere({Id: layer.get("id")}),
        resolution = map.getView().getResolution(),
        projection = map.getView().getProjection(),
        params = _.extend({
            INFO_FORMAT: (rawLayer && rawLayer.infoFormat) || "text/xml"
        }, rawLayer && !_.isUndefined(rawLayer.featureCount)
            ? {FEATURE_COUNT: rawLayer.featureCount}
            : {});

    return layer.getSource().getGetFeatureInfoUrl(coordinate, resolution, projection, params);
}
