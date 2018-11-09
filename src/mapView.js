import _ from "underscore";
import {View} from "ol";
import defaults from "./defaults";

/**
 * Creates a View from config.
 * @param {object} config - configuration object
 * @returns {ol/View} view with start values from config
 */
export function createMapView (config) {
    var options = _.extend({}, defaults, config),
        viewParams = {
            projection: options.epsg,
            center: options.startCenter,
            extent: options.extent,
            resolution: options.startResolution,
            resolutions: options.options.map(function (entry) {
                return entry.resolution;
            })
        };

    return new View(viewParams);
}
