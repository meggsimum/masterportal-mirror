import VectorLayer from "ol/layer/Vector.js";
import {bbox} from "ol/loadingstrategy.js";
import {WFS} from "ol/format.js";

import {createVectorSource, createClusterVectorSource} from "./vector";

/**
 * Layer specification as in services.json.
 * @typedef {Object} rawLayer
 * @property {string} id - id of the layer
 * @property {string} url - url to load features from
 * @property {string} featureType - type of features
 * @property {string} featureNS - the namespace URI used for features
 * @property {number} clusterDistance - pixel radius, within this radius, all features are "clustered" into one feature - if available, a cluster source is created.
 * @property {function} style - style function to style the layer if options.style is not set
/**
 * Additional options used to create and load the layer source.
 * @typedef {Object} options
 * @property {module:ol.source.Vector~LoadingStrategy} loadingStrategy - the loading strategy to use, if not set 'bbox' is used
 * @property {string} version - version of WFS requests. If not set, '1.1.0' is used.
 * @property {function} onLoadingError - function called on loading error, gets parameter error
 * @property {function} beforeLoading - function called before loading
 * @property {function} afterLoading - function called after loading, gets parameter features
 * @property {function} featuresFilter - function called after loading to filter features, gets parameter features
 * @property {function} wfsFilter -  xml resource as wfs filter, the content of the filter file will be sent to the wfs server as POST request
 * @property {function} clusterGeometryFunction -  used in cluster source. Returns the geometry of the cluster, gets parameter feature
 * @property {function} style - style function to style the layer
 * @property {object} loadingParams - added as params to url
 */

function handleErrors (response, onError) {
    if (!response.ok) {
        return onError(`Request to wfs-filter failed. Response status is ${response.statusText}`);
    }
    return response;
}
/**
 * Called after features are loaded. Calls options.featuresFilter, success-callback and options.afterLoading.
 * Features are added to source.
 * @param {ol.source.VectorSource} source the vector source
 * @param {Array.<module:ol/Feature~Feature>} features loaded features
 * @param {options} [options] additional options
 * @param {function} onError  Calls options.onLoadingError and 'featuresloaderror' event will be fired by using failure callback.
 * @param {function} success  callback: 'featuresloadend' event will be fired
 * @returns {void}
 */
function onLoad (source, features, options, onError, success) {
    let filteredFeatures = features;

    try {
        if (options.featuresFilter) {
            filteredFeatures = options.featuresFilter(features);
        }
        source.addFeatures(filteredFeatures);
        if (options.afterLoading) {
            options.afterLoading(filteredFeatures);
        }
        // success: see https://openlayers.org/en/latest/apidoc/module-ol_source_Vector-VectorSource.html
        success(filteredFeatures);
    }
    catch (error) {
        onError(error);
    }
}
/**
 * Returns the parameters for the wfs filter request.
 * @param {object} payload to set as body
 * @returns {object} the parameters for the wfs filter request
 */
function getFilterRequestParams (payload) {
    return {
        method: "POST",
        headers: {
            "Content-Type": "text/xml"
        },
        body: payload
    };
}
/**
 * Loads the WFS.
 * Filters the features after load, if options.featuresFilter is given.
 * Adds the features to the source.
 * @param {string} url url to load features from
 * @param {object} params extra loading parameters
 * @param {ol.source.VectorSource} source the vector source
 * @param {options} [options] optional additional options
 * @param {function} onError  Calls options.onLoadingError and 'featuresloaderror' event will be fired by using failure callback.
 * @param {function} success  callback: 'featuresloadend' event will be fired
 * @returns {void}
 */
function loadWFS (url, params, source, options, onError, success) {
    fetch(url, params)
        .then((response) => handleErrors(response, onError))
        .then((response) => response.text())
        .then(responseString => source.getFormat().readFeatures(responseString))
        .then(features => onLoad(source, features, options, onError, success))
        .catch((error) => {
            // Only network error comes here
            onError(error);
        });
}
/**
 * Loads the WFS filter. The content of the filter file will be sent to the wfs server as POST request.
 * Filters the features after load, if options.featuresFilter is given.
 * Adds the features to the source.
 * @param {string} filter xml resource as wfs filter
 * @param {string} url url to load features from
 * @param {ol.source.VectorSource} source the vector source
 * @param {options} [options] optional additional options
 * @param {function} onError  Calls options.onLoadingError and 'featuresloaderror' event will be fired by using failure callback.
 * @param {function} success  callback: 'featuresloadend' event will be fired
 * @returns {void}
 */
function loadWFSFilter (filter, url, source, options, onError, success) {
    fetch(filter)
        .then((response) => handleErrors(response, onError))
        .then((response) => response.text())
        .then((payload) => loadWFS(url, getFilterRequestParams(payload), source, options, onError, success))
        .catch((error) => {
            // Only network error comes here
            onError(error);
        });
}
/**
 * Creates an ol/source element for the rawLayer by using a loader.
 * The 'featuresloadend' and 'featuresloaderror' events will be fired by using success and failure callbacks of the loader.
 * See https://openlayers.org/en/latest/apidoc/module-ol_source_Vector-VectorSource.html
 * @param {rawLayer} rawLayer layer specification as in services.json
 * @param {options} [options] additional options
 * @returns {(ol.source.VectorSource|ol.source.Cluster)} VectorSource or Cluster, depending on whether clusterDistance is set.
 */
export function createLayerSource (rawLayer, options = {}) {
    if (!options.loadingStrategy) {
        options.loadingStrategy = bbox;
    }
    const format = new WFS({
        featureNS: rawLayer.featureNS,
        featureType: rawLayer.featureType
    });
    let source = null;

    function loader (extent, resolution, projection, success, failure) {
        function onError (error) {
            console.error(error);
            if (options.onLoadingError) {
                options.onLoadingError(error);
            }
            // failure: see https://openlayers.org/en/latest/apidoc/module-ol_source_Vector-VectorSource.html
            failure(error);
            throw Error(error);
        }

        if (options.beforeLoading) {
            options.beforeLoading();
        }
        if (options.wfsFilter) {
            loadWFSFilter(options.wfsFilter, rawLayer.url, source, options, onError, success);
        }
        else {
            const bboxParam = options.loadingStrategy === bbox ? `&bbox=${extent.join(",")},${projection.getCode()}` : "",
                version = options.version || "1.1.0";
            let url = `${rawLayer.url}?service=WFS&version=${version}&request=GetFeature&typeName=${rawLayer.featureType}&srsName=${projection.getCode()}${bboxParam}`;

            if (options.loadingParams) {
                for (const key in options.loadingParams) {
                    const option = Array.isArray(options.loadingParams[key]) ? options.loadingParams[key].join(",") : options.loadingParams[key];

                    if (option !== undefined) {
                        url += `&${key}=${option}`;
                    }
                }
            }
            loadWFS(url, {}, source, options, onError, success);
        }
    }

    source = createVectorSource(loader, options.loadingStrategy, format);

    if (rawLayer.clusterDistance) {
        return createClusterVectorSource(source, rawLayer.clusterDistance, options.clusterGeometryFunction);
    }
    return source;
}

/**
 * Creates complete ol/Layer from rawLayer containing all required children.
 * @param {rawLayer} rawLayer - layer specification as in services.json
 * @param {object} [optionalParams] - optional params
 * @param {object} [optionalParams.layerParams] - additional layer params
 * @param {options} [optionalParams.options] - additional options
 * @returns {ol.Layer} Layer that can be added to map.
 */
export function createLayer (rawLayer = {}, {layerParams = {}, options = {}} = {}) {
    const source = createLayerSource(rawLayer, options),
        layer = new VectorLayer(Object.assign({
            source,
            id: rawLayer.id
        }, layerParams));

    if (options.style) {
        layer.setStyle(options.style);
    }
    else if (rawLayer.style) {
        layer.setStyle(rawLayer.style);
    }
    return layer;
}
