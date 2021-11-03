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

    // if (layerParams.isSelected) {
        updateSource(layer, options, layerParams.visibility,layerParams.wfsFilter);
    // }

    return layer;
}

/**
 * Forces an update by giving a layer a new sessionID.
 * @param {ol.Layer} layer - the layer that is to be updated
 * @returns {number} the new sessionID
 */
export function updateSource (layer,options, visibility = true, wfsFilter=false) {
    const requestParams = getRequestParamsAndOptions(layer, options),
    url = layer.getSource().getUrl() ? layer.getSource().getUrl() : layer.getSource().getSource()?.getUrl();
    let instance = axios,
    wfsInterceptor = "";

    if (requestParams?.xhrParameters !== null) {
        instance = axios.create(options.xhrParameters);
    }
    wfsInterceptor = instance.interceptors.request.use((config) => {
        beforeLoading(options, visibility);
        return config;
    }, (error) => {
        return Promise.reject(error);
    });
    if(!wfsFilter){
        instance.get(url, {params: requestParams})
        .then(response => {
            handleResponse(response.data, layer, options, visibility);
        })
        .catch(error => {
            handleLoadingError(error, options);
        })
        .then(() => {
            afterLoading(options, visibility);
        });
    }
    else{
        instance.get(wfsFilter)
            .then(response => {
                const payload = response?.data;

                instance.post(url, payload, {
                    headers: {
                        "Content-Type": "text/xml"
                    }
                })
                    .then(response => {
                        handleResponse(response.data, layer, options, visibility);
                    });
            })
            .catch(error => {
                handleLoadingError(error, options);
            })
            .then(() => {
                afterLoading(options, visibility);
            });
    }
     // Eject the loader function
     instance.interceptors.request.eject(wfsInterceptor);
}
function handleResponse(data, layer, options, visibility){
    const reader = layer.getSource().getFormat() ? layer.getSource().getFormat() : layer.getSource().getSource()?.getFormat();
    let features = reader.readFeatures(data);

    if(options.featuresFilter){
        features = options.featuresFilter(features);
    }
    if(visibility){
        layer.getSource().clear(true);
        layer.getSource().addFeatures(features);
        if(options.style){
            layer.setStyle(options.style);
        }
    }
}
function handleLoadingError(error, options){
    console.error(error);
            if(options.handleError){
                options.handleError(error);
            }
}
function afterLoading(options, visibility){
    if(options.afterLoading){
        options.afterLoading(visibility);
    }
}
function beforeLoading(options, visibility){
    if(options.beforeLoading){
        options.beforeLoading(visibility);
    }
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
        VERSION: options.version || "1.1.0",
        PROPERTYNAME: options.propertyname ? options.propertyname : undefined,
        // loads only the features in the extent of this geometry
        BBOX: options.bbox ? options.bbox: undefined
    };
    let typeName = null;

    if(layer.getSource() instanceof Cluster){
        typeName = layer.getSource().getSource().getFormat().getFeatureType();
    }
    else{
        typeName = layer.getSource().getFormat().getFeatureType();
    }
    params.TYPENAME = typeName;

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
