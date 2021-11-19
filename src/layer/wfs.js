import VectorLayer from "ol/layer/Vector.js";
import {bbox} from "ol/loadingstrategy.js";
import {WFS} from "ol/format.js";

import {createVectorSource, createClusterVectorSource} from "./vector";

/**
 * Called after features are loaded. Calls options.featuresFilter, success-callback and options.afterLoading.
 * Features are added to source.
 * @param {ol.source.VectorSource} source the vector source
 * @param {Array.<module:ol/Feature~Feature>} features loaded features
 * @param {object} options - optional additional options
 * @param {function} success  callback: 'featuresloadend' event will be fired
 * @returns {void}
 */
function onLoad (source, features, options, success) {
    let filteredFeatures = features;

    if (options.featuresFilter) {
        filteredFeatures = options.featuresFilter(features);
    }
    source.addFeatures(filteredFeatures);
    if (options.afterLoading) {
        options.afterLoading(filteredFeatures);
    }
    // The 'featuresloadend' and 'featuresloaderror' events will only fire if the success and failure callbacks are used.
    success(filteredFeatures);
}
/**
 * Loads the WFS filter. The content of the filter file will be sent to the wfs server as POST request.
 * Filters the features after load, if options.featuresFilter is given.
 * Adds the features to the source.
 * @param {string} filter - xml resource as wfs filter
 * @param {string} url - url to load features from
 * @param {ol.source.VectorSource} source the vector source
 * @param {object} options - optional additional options
 * @param {function} [options.onLoadingError] - function called on loading error, gets parameter error
 * @param {function} [options.afterLoading] - function called after loading
 * @param {function} [options.featuresFilter] - function called after loading to filter features, gets parameter features
 * @param {function} onError  Calls options.onLoadingError and 'featuresloaderror' event will be fired by using failure callback.
 * @param {function} success  callback: 'featuresloadend' event will be fired
 * @returns {void}
 */
function loadWFSFilter (filter, url, source, options, onError, success) {
    fetch(filter)
        .then((response) => {
            if (response.status >= 200 && response.status <= 299) {
                return response.text();
            }
            return onError(`Request to wfs-filter failed. Response status is ${response.status}`);

        })
        .then((payload) => {
            fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "text/xml"
                },
                body: payload
            })
                .then((response) => {
                    if (response.status >= 200 && response.status <= 299) {
                        return response.text();
                    }
                    return onError(`Post request to ${url} failed. Response status is ${response.status}`);

                })
                .then(responseString => source.getFormat().readFeatures(responseString))
                .then(features => {
                    onLoad(source, features, options, success);
                }).catch((error) => {
                // Only network error comes here
                    console.error(error);
                    if (options.onLoadingError) {
                        options.onLoadingError(error);
                    }
                });
        }).catch((error) => {
        // Only network error comes here
            console.error(error);
            if (options.onLoadingError) {
                options.onLoadingError(error);
            }
        });
}
/**
 * Loads the WFS.
 * Filters the features after load, if options.featuresFilter is given.
 * Adds the features to the source.
 * @param {string} url - url to load features from
 * @param {ol.source.VectorSource} source the vector source
 * @param {object} options - optional additional options
 * @param {function} [options.onLoadingError] - function called on loading error, gets parameter error
 * @param {function} [options.afterLoading] - function called after loading, gets parameter features
 * @param {function} [options.featuresFilter] - function called after loading to filter features, gets parameter features
 * @param {function} onError  Calls options.onLoadingError and 'featuresloaderror' event will be fired by using failure callback.
 * @param {function} success  callback: 'featuresloadend' event will be fired
 * @returns {void}
 */
function loadWFS (url, source, options, onError, success) {
    fetch(url)
        .then((response) => {
            if (response.status >= 200 && response.status <= 299) {
                return response.text();
            }
            return onError(`Request to ${url} failed. Response status is ${response.status}`);

        })
        .then(responseString => source.getFormat().readFeatures(responseString))
        .then(features => {
            onLoad(source, features, options, success);
        }).catch((error) => {
        // Only network error comes here
            console.error(error);
            if (options.onLoadingError) {
                options.onLoadingError(error);
            }
            onError(error);
        });
}
/**
 * Creates an ol/source element for the rawLayer by using a loader.
 * The 'featuresloadend' and 'featuresloaderror' events will be fired.
 * @param {object} rawLayer - layer specification as in services.json
 * @param {string} [rawLayer.url] - url to load features from
 * @param {string} [rawLayer.featureType] - type of features
 * @param {string} [rawLayer.featureNS] -The namespace URI used for features.
 * @param {number} [rawLayer.clusterDistance] - Pixel radius, within this radius, all features are "clustered" into one feature. If available, a cluster source is created.
 * @param {object} options - optional additional options
 * @param {module:ol/source/Vector~LoadingStrategy} [options.loadingStrategy] - optional: the loading strategy to use. If not set 'bbox' is used.
 * @param {string} [options.version] - version of WFS requests. If not set, '1.1.0' is used.
 * @param {function} [options.onLoadingError] - function called on loading error, gets parameter error
 * @param {function} [options.beforeLoading] - function called before loading
 * @param {function} [options.afterLoading] - function called after loading
 * @param {function} [options.featuresFilter] - function called after loading to filter features, gets parameter features
 * @param {string} [options.wfsFilter] - xml resource as wfs filter, the content of the filter file will be sent to the wfs server as POST request
 * @param {function} [options.clusterGeometryFunction] - used in cluster source. Returns the geometry of the cluster, gets parameter feature
 * @param {object} loadingParams - optional params, added as params to url
 * @returns {(ol.source.VectorSource|ol.source.Cluster)} VectorSource or Cluster, depending on whether clusterDistance is set.
 */
export function createLayerSource (rawLayer, options = {}, loadingParams) {
    if (!options.loadingStrategy) {
        options.loadingStrategy = bbox;
    }
    const format = new WFS({
        featureNS: rawLayer.featureNS,
        featureType: rawLayer.featureType
    });
    let source = null;

    function loader (extent, resolution, projection, success, failure) {
        const bboxParam = options.loadingStrategy === bbox ? `&bbox=${extent.join(",")},${projection.getCode()}` : "",
            version = options.version || "1.1.0";
        let url;

        function onError (error) {
            if (options.onLoadingError) {
                options.onLoadingError(error);
            }
            // The 'featuresloadend' and 'featuresloaderror' events will only fire if the success and failure callbacks are used.
            failure();
        }

        if (options.beforeLoading) {
            options.beforeLoading();
        }
        if (!options.wfsFilter) {
            url = `${rawLayer.url}?service=WFS&version=${version}&request=GetFeature&typename=${rawLayer.featureType}&srsname=${projection.getCode()}${bboxParam}`;
            for (const key in loadingParams) {
                const option = Array.isArray(loadingParams[key]) ? loadingParams[key].join(",") : loadingParams[key];

                if (option !== undefined) {
                    url += `&${key}=${option}`;
                }
            }
            loadWFS(url, source, options, onError, success);
        }
        else {
            loadWFSFilter(options.wfsFilter, rawLayer.url, source, options, onError, success);
        }
    }

    source = createVectorSource(null, loader, options.loadingStrategy, format);

    if (rawLayer.clusterDistance) {
        return createClusterVectorSource(source, rawLayer.clusterDistance, options.clusterGeometryFunction);
    }
    return source;
}

/**
 * Creates complete ol/Layer from rawLayer containing all required children.
 * @param {object} rawLayer - layer specification as in services.json
 * @param {object} [rawLayer.id] - id of the layer
 * @param {string} [rawLayer.url] - url to load features from
 * @param {string} [rawLayer.featureType] - type of features
 * @param {string} [rawLayer.featureNS] - namespace of features
 * @param {function} [rawLayer.style] - style function to style the layer if options.style is not set
 * @param {number} [rawLayer.clusterDistance] - Pixel radius, within this radius, all features are "clustered" into one feature. If available, a cluster source is created.
 * @param {object} layerParams - additional layer params
 * @param {object} options - optional additional options
 * @param {module:ol/source/Vector~LoadingStrategy} [options.loadingStrategy] - optional: the loading strategy to use. If not set 'bbox' is used.
 * @param {string} [options.version] - version of WFS requests. If not set, '1.1.0' is used.
 * @param {function} [options.onLoadingError] - function called on loading error, gets parameter error
 * @param {function} [options.beforeLoading] - function called before loading
 * @param {function} [options.afterLoading] - function called after loading
 * @param {function} [options.featuresFilter] - function called after loading to filter features, gets parameter features
 * @param {string} [options.wfsFilter] - xml resource as wfs filter, the content of the filter file will be sent to the wfs server as POST request
 * @param {function} [options.clusterGeometryFunction] - used in cluster source. Returns the geometry of the cluster, gets parameter feature
 * @param {function} [options.style] - style function to style the layer
 * @param {object} loadingParams - optional params, added as params to url
 * @returns {ol.Layer} Layer that can be added to map.
 */
export function createLayer (rawLayer, layerParams = {}, options = {}, loadingParams) {
    const source = createLayerSource(rawLayer, options, loadingParams),
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

/**
 * Forces an update by giving a layer a new sessionID.
 * @param {ol.Layer} layer - the layer that is to be updated
 * @returns {void}
 */
export function updateSource (layer) {
    layer.getSource().refresh();
}
