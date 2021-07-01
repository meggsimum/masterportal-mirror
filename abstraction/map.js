import mapCollection from "./mapCollection.js";
import * as map2D from "../src/map.js";
import map3D from "./olcs/map.js";
//import store from "../app-store/index.js";

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

        mapCollection.addMap(map);

        return map;
    },

    get2DMap: function () {
        //diese Funktion ist vielleicht nicht sinnvoll, wenn es 2 2D-maps gibt
        return mapCollection.getMapByMode("2D");
    },

    /**
     * Adds an interaction to the map.
     * @param {module:ol/interaction/Interaction} interaction Interaction to be added to map.
     * @param {Sting} [mapId=store.getters.mapId] Id of the map.
     * @returns {void}
     */
    addInteraction: function (interaction, mapId = store.getters.mapId) {
        const map = mapCollection.getMapById(mapId),
            interactionFunctions = {
                "2D": () => map.addInteraction(interaction),
                "3D": () => map3D.addInteraction(interaction)
            };

        interactionFunctions[map?.mapMode || map.get("mapMode")]();
    },

    removeInteraction: function (interaction, mapId = store.getters.mapId) {
        const map = mapCollection.getMapById(mapId),
            interactionFunctions = {
                "2D": () => map.removeInteraction(interaction),
                "3D": () => map3D.removeInteraction(interaction)
            };

        interactionFunctions[map?.mapMode || map.get("mapMode")]();
    }


};
