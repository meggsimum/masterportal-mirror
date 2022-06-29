/**
* Parses the cesium parameters given by Config or by url parameters.
* @param {Object} urlParams url parameter
* @returns {Object} the parsed parameters
*/
export default function parseCesiumParameters (urlParams) {
    const backwardsConfigCesiumParameter = Config?.cesiumParameter ? {...Config?.cesiumParameter} : {};

    /**
     * @deprecated in the next major-release!
     * Backward compatibility: globe parameters are set in the object globe now
     */
    if (!backwardsConfigCesiumParameter.globe) {
        backwardsConfigCesiumParameter.globe = {};
    }
    if (!backwardsConfigCesiumParameter.camera) {
        backwardsConfigCesiumParameter.camera = {};
    }
    if (backwardsConfigCesiumParameter.enableLighting) {
        backwardsConfigCesiumParameter.globe.enableLighting = backwardsConfigCesiumParameter.enableLighting;
        console.warn("The attribute 'cesiumParameter.enableLighting' is deprecated. Please use 'cesiumParameter.globe.enableLighting'!");
    }
    if (backwardsConfigCesiumParameter.maximumScreenSpaceError) {
        backwardsConfigCesiumParameter.globe.maximumScreenSpaceError = backwardsConfigCesiumParameter.maximumScreenSpaceError;
        console.warn("The attribute 'cesiumParameter.maximumScreenSpaceError' is deprecated. Please use 'cesiumParameter.globe.maximumScreenSpaceError'!");
    }
    if (backwardsConfigCesiumParameter.tileCacheSize) {
        backwardsConfigCesiumParameter.globe.tileCacheSize = backwardsConfigCesiumParameter.tileCacheSize;
        console.warn("The attribute 'cesiumParameter.tileCacheSize' is deprecated. Please use 'cesiumParameter.globe.tileCacheSize'!");
    }
    if (typeof urlParams?.heading !== "undefined") {
        backwardsConfigCesiumParameter.camera.heading = urlParams.heading;
    }
    if (typeof urlParams?.tilt !== "undefined") {
        backwardsConfigCesiumParameter.camera.tilt = urlParams.tilt;
    }
    if (typeof urlParams?.altitude !== "undefined") {
        backwardsConfigCesiumParameter.camera.altitude = urlParams.altitude;
    }
    return backwardsConfigCesiumParameter;
}
