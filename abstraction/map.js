import * as map2D from "./ol/map.js";
import map3D from "./olcs/map.js";

export default {
    /**
    * Creates a map and adds it to the mapCollection. Depending on param 'mapMode' a 2D or a 3D map is created. Default ist 2D.
    * @param {object} [config] - configuration object - falls back to defaults if none given
    * @param {string} [config.target="map"] - div id to render map to
    * @param {string} [config.namedProjections] - projections to create the map
    * @param {string} [config.backgroundImage] - background image for map; "" to use none
    * @param {string} [config.epsg] - CRS to use
    * @param {number[]} [config.extent] - extent to use
    * @param {Array.<{resolution: number, scale: number, zoomLevel: number}>} [config.options] - zoom level definition
    * @param {Array.<string[]>} [config.options] - each sub-array has two values: projection name, and projection description
    * @param {number} [config.startResolution] - initial resolution
    * @param {number[]} [config.startCenter] - initial position
    * @param {(string|object)} [config.layerConf] - services registry or URL thereof
    * @param {string} [config.gazetteerUrl] - url of gazetteer to use in searchAddress
    * @param {object}  [settings={}] - setings object
    * @param {object} [settings.mapParams] - additional parameter object that is spread into the ol.Map constructor object
    * @param {function} [settings.callback] - optional callback for layer list loading
     * @param {String} [mapMode = "2D"] The map mode. '2D' to craete a 2D-map and '3D' to create a 3D-map.
     * @returns {module:ol/PluggableMap~PluggableMap} The map.
     */
    createMap: function (config, settings = {}, mapMode = "2D") {
        const createMapFunctions = {
                "2D": map2D.createMap,
                "3D": map3D.createMap
            },
            map = createMapFunctions[mapMode](config, settings);

        return map;
    }
};
