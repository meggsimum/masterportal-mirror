import VectorSource from "ol/source/Vector.js";
import Cluster from "ol/source/Cluster.js";

/**
 * Creates a VectorSource.
 * @param {function|string} urlOrLoader loader-function to load the features or an url to load them
 * @param {module:ol.source.Vector~LoadingStrategy} strategy The loading strategy to use.
 * @param {module:ol.Format} format to parse the response with
 * @returns {(module:ol.source.VectorSource|module:ol.source.Cluster)} the VectorSource
 */
export function createVectorSource (urlOrLoader, strategy, format) {
    let loader = null,
        url = null;

    if (typeof urlOrLoader === "string") {
        url = urlOrLoader;
    }
    else if (typeof urlOrLoader === "function") {
        loader = urlOrLoader;
    }
    return new VectorSource({
        loader,
        url,
        strategy,
        format
    });
}
/**
 * Creates a Cluster.
 * @param {module:ol.source.VectorSource} source the source of the layer
 * @param {number} distance - Pixel radius, within this radius, all features are "clustered" into one feature. If available, a cluster source is created.
 * @param {function | undefined} geometryFunction - returns the geometry of the cluster, gets parameter feature. When a feature should not be considered for clustering, the function should return null.
 * @returns {module:ol.source.Cluster} the Cluster
 */
export function createClusterVectorSource (source, distance, geometryFunction) {
    return new Cluster({
        source,
        distance,
        geometryFunction});
}
