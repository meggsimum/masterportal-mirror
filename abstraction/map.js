import * as map2D from "./ol/map.js";
import map3D from "./olcs/map.js";

export default {
    /**
     * Creates a map and adds it to the mapCollection.
     * @param {Object} settings The map settings.
     * @param {String} mapMode The map mode.
     * @returns {module:ol/PluggableMap~PluggableMap} The map.
     */
    createMap: function (settings, mapMode) {
        const createMapFunctions = {
                "2D": map2D.createMap,
                "3D": map3D.createMap
            },
            map = createMapFunctions[mapMode](settings);

        return map;
    }
    // ,

    // get2DMap: function () {
    //     //diese Funktion ist vielleicht nicht sinnvoll, wenn es 2 2D-maps gibt
    //     return mapCollection.getMapByMode("2D");
    // },

    // getMapById: function (id) {
    //     return mapCollection.getMapById(id);
    // },

};
