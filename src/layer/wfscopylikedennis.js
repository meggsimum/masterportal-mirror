import VectorSource from "ol/source/Vector.js";
import VectorLayer from "ol/layer/Vector.js";
import Cluster from "ol/source/Cluster.js";
import {WFS} from "ol/format.js";
import axios from "axios";
import { bbox } from 'ol/loadingstrategy.js'

import {getLayerWhere} from "masterportalAPI/src/rawLayerList";

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
    if(!options.loadingStrategy){
        options.loadingStrategy = bbox;
    }
    const source = new VectorSource({
        url: (extent) => {
            const bboxParam = options.loadingStrategy === options.bbox ? `&bbox=${extent.join(',')},${code}` : '',
            version = options.version || "1.1.0",    
            urlLiteral = `${rawLayer.url}?service=WFS&version=${version}&request=GetFeature&propertyname=${options.propertyname}&typename=${rawLayer.featureType}&srsname=${options.projectionCode}${bboxParam}`;
            return encodeURI(urlLiteral);
          },
          strategy: options.loadingStrategy,
        format: new WFS({
            featureNS: rawLayer.featureNS,
            featureType: rawLayer.featureType
        }),
        
    });

    // fetch(url)
    // .then(response => response.text())
    // .then(responseString => parser.readFeatures(responseString))
    // .then(features => {
    //     source.addFeatures([...features, ...featuresToAdd]);
    // });

    if (rawLayer.clusterDistance) {
        return createClusterLayerSource(source, rawLayer.clusterDistance, options);
    }
    return source;
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
export function createClusterLayerSource (layerSource, clusterDistance, options) {
    let geometryFunction = {};

    if (options && options.clusterGeometryFunction) {
        geometryFunction = options.clusterGeometryFunction;
    }
    return new Cluster(Object.assign({
        source: layerSource,
        distance: clusterDistance
    }, geometryFunction));
}

/**
 * Creates complete ol/Layer from rawLayer containing all required children.
 * @param {*} rawLayer - layer specification as in services.json
 * @param {object} options - optional resolutions and origin to create the TileGrid
 * @returns {ol.Layer} Layer that can be added to map.
 */
export function createLayer (rawLayer, layerParams = {}, options) {
    const source = createLayerSource(rawLayer, options),
    layer = new VectorLayer(Object.assign({
        source,
        id: rawLayer.id
    }, layerParams));
    if(options.style){
        layer.setStyle(options.style);
    }

    return layer;
}

/**
 * Forces an update by giving a layer a new sessionID.
 * @param {ol.Layer} layer - the layer that is to be updated
 * @returns {number} the new sessionID
 */
export function updateSource (layer) {
    layer.getSource().refresh();
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
