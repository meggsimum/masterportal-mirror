import {View} from "ol";
import defaults from "./defaults";

/**
 * Sets the startResolution or the startZoomlevel, depending on the configuration.
 * Where the resolution is preferred.
 * The value to use is set and the other is undefined.
 * @param {object} config - configuration object
 * @param {object} [mergedConfig=defaults] - configuration from object merged with default configuration
 * @returns {object} object that contains startZoomLevel and startResolution
 */
export function chooseZoomOrResolution (config = {}, mergedConfig = defaults) {
    const zoomResolution = {
        startZoomLevel: undefined,
        startResolution: undefined
    };

    if (config.hasOwnProperty("startZoomLevel") && !config.hasOwnProperty("startResolution")) {
        zoomResolution.startZoomLevel = mergedConfig.startZoomLevel;
    }
    else {
        zoomResolution.startResolution = mergedConfig.startResolution;
    }

    return zoomResolution;
}

/**
 * Creates a View from config.
 * @param {object} config - configuration object
 * @param {string} [config.epsg="EPSG:25832"] - CRS to use
 * @param {number[]} [config.extent=[510000.0, 5850000.0, 625000.4, 6000000.0]] - extent to use
 * @param {Array.<string[]>} [config.options=[{resolution: 66.14579761460263, scale: 250000, zoomLevel: 0},{resolution: 26.458319045841044, scale: 100000, zoomLevel: 1},{resolution: 15.874991427504629, scale: 60000, zoomLevel: 2},{resolution: 10.583327618336419, scale: 40000, zoomLevel: 3},{resolution: 5.2916638091682096, scale: 20000, zoomLevel: 4},{resolution: 2.6458319045841048, scale: 10000, zoomLevel: 5},{resolution: 1.3229159522920524, scale: 5000, zoomLevel: 6},{resolution: 0.6614579761460262, scale: 2500, zoomLevel: 7},{resolution: 0.2645831904584105, scale: 1000, zoomLevel: 8},{resolution: 0.13229159522920521, scale: 500, zoomLevel: 9}]] - each sub-array has two values: projection name, and projection description
 * @param {number} [config.startResolution=15.874991427504629] - initial resolution
 * @param {number[]} [config.startCenter=[565874, 5934140]] - initial position
 * @returns {ol.View} view with start values from config
 */
export function createMapView (config) {
    const mergedConfig = Object.assign({}, defaults, config),
        zoomResolution = chooseZoomOrResolution(config, mergedConfig);

    return new View({
        projection: mergedConfig.epsg,
        center: mergedConfig.startCenter,
        extent: mergedConfig.extent,
        zoom: zoomResolution.startZoomLevel,
        resolution: zoomResolution.startResolution,
        resolutions: mergedConfig.options.map(entry => entry.resolution)
    });
}
