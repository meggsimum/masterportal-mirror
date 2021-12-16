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
 * Adds optional wms parameters to the given parameters.
 * @param {object} params - the mandatory params of wms request url
 * @param {object} rawLayer - layer specification as in services.json
 * @param {boolean} [rawLayer.STYLES] - styles of the layer, if available
 * @param {boolean} [rawLayer.TIME] - time attribute, if available
 * @returns {object} maps query extended parameter names to values
 */
export function addOptionalParams (params, rawLayer) {
    const extendedParams = {...params},
        rawLayerParams = {},
        optionalParams = [
            "STYLES",
            "TIME"
        ];

    Object.keys(rawLayer).forEach(key => {
        rawLayerParams[key.toUpperCase()] = rawLayer[key];
    });

    optionalParams.forEach(optionalParam => {
        if (rawLayer[optionalParam]) {
            extendedParams[optionalParam] = rawLayer[optionalParam];
        }
    });

    return extendedParams;
}

/**
 * Creates query parameters for webservice requests from rawLayer.
 * @param {object} rawLayer - layer specification as in services.json
 * @param {string} [rawLayer.format="image/png"] - format of images requested
 * @param {string} rawLayer.layers - comma-separated list of requested layers
 * @param {version} rawLayer.version - webservice version as string, e.g. "1.1.1"
 * @param {boolean} rawLayer.transparent - whether tiles from this service should have transparency where no information is available
 * @param {boolean} rawLayer.singleTile - whether only one tile shall be requested that fills the whole view
 * @param {boolean} rawLayer.STYLES - styles of the layer, if available
 * @param {(string|number)} rawLayer.tilesize - if singleTile is true, this is the requested tilesize
 * @returns {object} maps query parameter names to values
 */
export function makeParams (rawLayer) {
    let params = {};

    params = Object.assign({
        CACHEID: generateSessionId(),
        FORMAT: rawLayer.format || "image/png",
        LAYERS: rawLayer.layers,
        VERSION: rawLayer.version,
        TRANSPARENT: rawLayer.transparent,
        SINGLETILE: rawLayer.singleTile
    }, rawLayer.singleTile ? {} : {WIDTH: rawLayer.tilesize, HEIGHT: rawLayer.tilesize});

    params = addOptionalParams(params, rawLayer);

    return params;
}

/**
 * Creates an ol/source element for the rawLayer.
 * @param {object} rawLayer - layer specification as in services.json
 * @param {string} [rawLayer.url] - WMS service URL
 * @param {string} [rawLayer.serverType] - optional servertype definition: "geoserver" or "mapserver" or "qgis"
 * @param {string} [rawLayer.gutter] - optional the size in pixels of the gutter around image tiles to ignore
 * @param {function} [rawLayer.olAttribution] - optional function that takes a module:ol/PluggableMap~FrameState and returns a string or an array of strings representing source attributions
 * @param {string|number} [rawLayer.tilesize] - optional needed to create the tileGrid
 * @param {object} options - optional resolutions and origin to create the TileGrid
 * @param {Array} [options.resolutions] - optional resolutions to create the TileGrid, must be in descending order
 * @param {Array} [options.origin] - optional origin to create the TileGrid
 * @returns {(ol.source.TileWMS|ol.source.ImageWMS)} TileWMS or ImageWMS, depending on whether singleTile is true.
 */
export function createLayerSource (rawLayer, options) {
    const params = makeParams(rawLayer);
    let tileGrid = null;

    if (rawLayer.singleTile) {
        return new ImageWMS({
            url: rawLayer.url,
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
 * Creates complete ol/Layer from rawLayer containing source and all required children.
 * @param {object} rawLayer - layer specification as in services.json
 * @param {string} [rawLayer.id] - optional id of the layer, passed to help identification in services.json
 * @param {string} [rawLayer.url] - WMS service URL
 * @param {string} [rawLayer.minScale] - optional the minimal resolution
 * @param {string} [rawLayer.maxScale] - optional the maximal resolution
 * @param {string} [rawLayer.serverType] - optional servertype definition: "geoserver" or "mapserver" or "qgis"
 * @param {string} [rawLayer.gutter] - optional the size in pixels of the gutter around image tiles to ignore
 * @param {function} [rawLayer.olAttribution] - optional function that takes a module:ol/PluggableMap~FrameState and returns a string or an array of strings representing source attributions
 * @param {string|number} [rawLayer.tilesize] - optional needed to create the tileGrid
 * @param {object} layerParams - additional layer params
 * @param {object} options - optional resolutions and origin to create the TileGrid
 * @param {Array} [options.resolutions] - optional resolutions to create the TileGrid, must be in descending order
 * @param {Array} [options.origin] - optional origin to create the TileGrid
 * @returns {ol.Layer} Layer that can be added to map.
 */
export function createLayer (rawLayer, layerParams = {}, options) {
    const source = createLayerSource(rawLayer, options),
        Layer = rawLayer.singleTile ? ImageLayer : TileLayer;

    return new Layer(Object.assign({
        source,
        minResolution: rawLayer.minScale,
        maxResolution: rawLayer.maxScale,
        id: rawLayer.id
    }, layerParams));
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
