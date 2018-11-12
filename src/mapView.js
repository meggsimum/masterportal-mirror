import _ from "underscore";
import {View} from "ol";
import defaults from "./defaults";

/**
 * Creates a View from config.
 * @param {object} config - configuration object
 * @returns {ol/View} view with start values from config
 */
export function createMapView (config) {
    var mergedConfig = _.extend({}, defaults, config);

    return new View({
        projection: mergedConfig.epsg,
        center: mergedConfig.startCenter,
        extent: mergedConfig.extent,
        resolution: mergedConfig.startResolution,
        resolutions: mergedConfig.options.map(function (entry) {
            return entry.resolution;
        })
    });
}
