import OverlaySynchronizer from "olcs/OverlaySynchronizer.js";

/**
 * Represents a FixedOverlaySynchronizer.
 */
class FixedOverlaySynchronizer extends OverlaySynchronizer {
    /* eslint-disable no-useless-constructor */
    /**
     * This object takes care of one-directional synchronization of
     * Openlayers WMS raster layers to the given Cesium globe. This Synchronizer
     * assumes that the given WMS supports EPSG Code 4326 (WGS84)
     * @param {!ol.Map} map -
     * @param {!Cesium.Scene} scene -
     * @constructor
     * @extends {olcs.AbstractSynchronizer.<Cesium.ImageryLayer>}
     * @api
     * @struct
     */
    constructor (map, scene) {
        super(map, scene);
    }

    /**
     * @api
     * @returns {void}
     */
    addOverlays () {
        /* eslint no-underscore-dangle: ["error", { "allow": ["overlays_"] }]*/
        this.overlays_.forEach((overlay) => {
            if (overlay.getId() !== undefined) {
                this.addOverlay(overlay);
            }
        });
    }
}

export default FixedOverlaySynchronizer;

/* eslint-enable no-useless-constructor */
