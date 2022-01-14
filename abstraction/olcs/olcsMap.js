import OLCesium from "olcs/OLCesium.js";
import VectorSynchronizer from "olcs/VectorSynchronizer.js";
import FixedOverlaySynchronizer from "./3dUtils/fixedOverlaySynchronizer.js";
import WMSRasterSynchronizer from "./3dUtils/wmsRasterSynchronizer.js";

let mapIdCounter = 0;

export default {
    /**
     * Creates a 3D-map.
     * @param {object} [settings] The settings for the 3D-map.
     * @param {module:ol/PluggableMap~PluggableMap} [settings.map2D] The 2D-Map
     * @param {Cesium.JulianDate} [settings.shadowTime] The shadow time in julian date format if undefined olcs default is Cesium.JulianDate.now().
     * @returns {module:OLCesium} the 3d-map
     */
    createMap: function (settings) {
        const map3D = new OLCesium({
            map: settings.map2D,
            time: settings.shadowTime ? settings.shadowTime : undefined,
            sceneOptions: {
                shadows: false
            },
            stopOpenLayersEventsPropagation: true,
            createSynchronizers: (olMap, scene) => {
                return [new WMSRasterSynchronizer(olMap, scene), new VectorSynchronizer(olMap, scene), new FixedOverlaySynchronizer(olMap, scene)];
            }
        });

        map3D.id = `map3D_${mapIdCounter++}`;
        map3D.mapMode = "3D";

        return map3D;
    }
};


