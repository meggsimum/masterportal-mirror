import VectorSource from "ol/source/Vector.js";
import VectorLayer from "ol/layer/Vector.js";
import Cluster from "ol/source/Cluster.js";
import {WFS} from "ol/format.js";
import axios from "axios";

import {getLayerWhere} from "../rawLayerList";

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
    const source = new VectorSource({
        url: rawLayer.url,
        format: new WFS({
            featureNS: rawLayer.featureNS,
            featureType: rawLayer.featureType
        })
    });

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

    if (options && options.geometryFunction) {
        geometryFunction = options.geometryFunction;
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

    // if (layerParams.isSelected) {
        updateSource(layer, options);
    // }

    return layer;
}

/**
 * Forces an update by giving a layer a new sessionID.
 * @param {ol.Layer} layer - the layer that is to be updated
 * @returns {number} the new sessionID
 */
export function updateSource (layer, options) {
    const requestParams = getRequestParamsAndOptions(layer, options);
    let instance = axios;

    if (requestParams?.xhrParameters !== null) {
        //todo handling credentials
        instance = axios.create(requestParams.xhrParameters);
    }
    instance.get(layer.getSource().getUrl(), {params: requestParams})
                .then(response => {
                    const features = layer.getSource().getFormat().readFeatures(response.data);

                    layer.getSource().addFeatures(features);
                    if(options.style){
                        layer.setStyle(options.style);
                    }
                    // this.handleResponse(response.data);
                })
                .catch(error => {
                    console.error(error);
                })
                .then(() => {
                    //todo
                    // if (showLoader) {
                    //     Radio.trigger("Util", "hideLoader");
                    // }
                });

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
export function getRequestParamsAndOptions (layer, options) {
    const params = {
        REQUEST: "GetFeature",
        SERVICE: "WFS",
        SRSNAME: options.projectionCode,
        TYPENAME: layer.getSource().getFormat().getFeatureType(),
        VERSION: options.version || "1.1.0",
        PROPERTYNAME: options.propertyname ? options.propertyname : undefined,
        // loads only the features in the extent of this geometry
        BBOX: options.bbox ? options.bbox: undefined
    };

    return params;
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
