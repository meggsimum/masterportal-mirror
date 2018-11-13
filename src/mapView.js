import {View} from "ol";
import defaults from "./defaults";

/**
 * Creates a View from config.
 * @param {object} config - configuration object
 * @returns {ol/View} view with start values from config
 */
export function createMapView (config) {
    const mergedConfig = Object.assign({}, defaults, config);

    return new View({
        projection: mergedConfig.epsg,
        center: mergedConfig.startCenter,
        extent: mergedConfig.extent,
        resolution: mergedConfig.startResolution,
        resolutions: mergedConfig.options.map(entry => entry.resolution)
    });
}
