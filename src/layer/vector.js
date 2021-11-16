import VectorSource from "ol/source/Vector.js";
import Cluster from "ol/source/Cluster.js";

/**
 * Creates a VectorSource.
 * @param {string} url to load the features from
 * @param {function} loader loader-function to load the features
 * @param {module:ol/source/Vector~LoadingStrategy} loadingStrategy The loading strategy to use.
 * @param {module:ol.Format} format to parse the response with
 * @returns {(module:ol.source.VectorSource|module:ol.source.Cluster)} the VectorSource
 */
export function createVectorSource (url, loader, loadingStrategy, format) {
    const source = new VectorSource({
        loader: loader,
        url: url,
        strategy: loadingStrategy,
        format: format
    });

    return source;
}
/**
 * Creates a Cluster.
 * @param {module:ol.source.VectorSource} layerSource the source of the layer
 * @param {number} clusterDistance - Pixel radius, within this radius, all features are "clustered" into one feature. If available, a cluster source is created.
 * @param {function} clusterGeometryFunction - returns the geometry of the cluster, gets parameter feature
 * @returns {module:ol.source.Cluster} the Cluster
 */
export function createClusterVectorSource (layerSource, clusterDistance, clusterGeometryFunction) {
    return new Cluster(Object.assign({
        source: layerSource,
        distance: clusterDistance
    }, clusterGeometryFunction || {}));
}
