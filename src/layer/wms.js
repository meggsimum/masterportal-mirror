import TileLayer from "ol/layer/Tile";
import ImageLayer from "ol/layer/Image";
import TileWMS from "ol/source/TileWMS.js";
import TileGrid from "ol/tilegrid/TileGrid";
import ImageWMS from "ol/source/ImageWMS.js";

import {getLayerWhere} from "../rawLayerList";

/** @returns {number} random session id in range (0, 9999999) */
export function generateSessionId () {
    return Math.floor(Math.random() * 9999999);
}

/**
 * Creates query parameters for webservice requests from rawLayer.
 * @param {object} rawLayer - layer specification as in services.json
 * @param {string} [rawLayer.format="image/png"] - format of images requested
 * @param {string} layers - comma-separated list of requested layers
 * @param {version} version - webservice version as string, e.g. "1.1.1"
 * @param {boolean} transparent - whether tiles from this service should have transparency where no information is available
 * @param {boolean} singleTile - whether only one tile shall be requested that fills the whole view
 * @param {boolean} STYLES - stles of the layer, if available
 * @param {(string|number)} tilesize - if singleTile is true, this is the requested tilesize
 * @returns {object} maps query parameter names to values
 */
export function makeParams (rawLayer) {
    return Object.assign({
        SESSIONID: generateSessionId(),
        CACHEID: rawLayer.cacheId,
        FORMAT: rawLayer.format || "image/png",
        LAYERS: rawLayer.layers,
        VERSION: rawLayer.version,
        TRANSPARENT: rawLayer.transparent,
        SINGLETILE: rawLayer.singleTile,
        STYLES: rawLayer.STYLES
    }, rawLayer.singleTile ? {} : {WIDTH: rawLayer.tilesize, HEIGHT: rawLayer.tilesize});
}

/**
 * Creates an ol/source element for the rawLayer.
 * @param {object} rawLayer - layer specification as in services.json
 * @param {string} [rawLayer.serverType] - optional servertype definition: "geoserver" or "mapserver" or "qgis"
 * @param {object} options - optional resolutions and origin to create the TileGrid
 * @param {object} [resolutions] - optional resolutions to create the TileGrid
 * @param {object} [origin] - optional origin to create the TileGrid
 * @returns {(ol.source.TileWMS|ol.source.ImageWMS)} TileWMS or ImageWMS, depending on whether singleTile is true.
 */
export function createLayerSource (rawLayer, options) {
    const params = makeParams(rawLayer);
    let tileGrid = null;

    if (rawLayer.singleTile) {
        return new ImageWMS({
            url: rawLayer.url,
            gutter: rawLayer.gutter,
            params,
            serverType: rawLayer.serverType,
            attributions: rawLayer.olAttribution
        });
    }
    if (options && options.resolutions) {
        tileGrid = new TileGrid({
            resolutions: options.resolutions,
            origin: options.origin ? options.origin : undefined,
            tileSize: parseInt(rawLayer.tilesize, 10)
        });
    }
    return new TileWMS({
        url: rawLayer.url,
        params,
        gutter: rawLayer.gutter || 0,
        tileGrid: tileGrid,
        attributions: rawLayer.olAttribution
    });
}

/**
 * Creates complete ol/Layer from rawLayer containing all required children.
 * @param {*} rawLayer - layer specification as in services.json
 * @param {object} options - optional resolutions and origin to create the TileGrid
 * @returns {ol.Layer} Layer that can be added to map.
 */
export function createLayer (rawLayer, options) {
    const source = createLayerSource(rawLayer, options),
        Layer = rawLayer.singleTile ? ImageLayer : TileLayer;

    return new Layer({
        source,
        minResolution: rawLayer.minScale,
        maxResolution: rawLayer.maxScale,
        // id passed to help identification in services.json
        id: rawLayer.id
    });
}

/**
 * Forces an update by giving a layer a new sessionID.
 * @param {ol.Layer} layer - the layer that is to be updated
 * @returns {number} the new sessionID
 */
export function updateSource (layer) {
    const oldSessionId = layer.getSource().getParams().SESSIONID;
    let newSessionId = oldSessionId;

    // to avoid rolling the same ID again; never happens except in your presentation
    while (oldSessionId === newSessionId) {
        newSessionId = generateSessionId();
    }

    layer.getSource().updateParams({SESSIONID: newSessionId});
    return newSessionId;
}

/**
 * Creates the gfiURL from clicked layer, map, and coordinate.
 * @param {ol.Layer} layer - what to get the gfiURL for
 * @param {ol.Map} map - needed for resolution/projection
 * @param {ol.coordinate} coordinate - which point to get the gfiURL for
 * @returns {(string|undefined)} the gfiURL, or undefined if it could not be constructed
 */
export function getGfiURL (layer, map, coordinate) {
    const rawLayer = getLayerWhere({Id: layer.get("id")}),
        resolution = map.getView().getResolution(),
        projection = map.getView().getProjection(),
        params = Object.assign({
            INFO_FORMAT: (rawLayer && rawLayer.infoFormat) || "text/xml"
        }, rawLayer && typeof rawLayer.featureCount !== "undefined"
            ? {FEATURE_COUNT: rawLayer.featureCount}
            : {});

    return layer.getSource().getFeatureInfoUrl(coordinate, resolution, projection, params);
}
