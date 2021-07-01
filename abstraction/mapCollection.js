//import store from "../app-store/index.js";

const mapCollection = [];

export default {
    /**
     * Adds a map to the mapCollection
     * @param {module:ol/PluggableMap~PluggableMap} map The map.
     * @returns {void}
     */
    addMap: function (map) {
        mapCollection.push(map);
    },

    /**
     * Gets the current map.
     * @param {Sting} [mapId=store.getters.mapId] Id of the map.
     * @returns {module:ol/PluggableMap~PluggableMap} The current map.
     */
    getCurrentMap: function (mapId = store.getters.mapId) {
        return this.getMapById(mapId);
    },

    /**
     * Gets a map by the given id.
     * @param {String} id The map id.
     * @returns {module:ol/PluggableMap~PluggableMap} The map.
     */
    getMapById: function (id) {
        return mapCollection.find(map => (map?.id || map.get("id")) === id);
    },
    getMapByMode: function (mapMode) {
        return mapCollection.find(map => (map?.mapMode || map.get("mapMode")) === mapMode);
    },

    /**
     * Gets the map collection.
     * @returns {module:ol/PluggableMap~PluggableMap[]} The map collection.
     */
    getMaps: function () {
        return mapCollection;
    },

    /**
     * Removes a map from the map collection.
     * @param {String} id The map id.
     * @returns {void}
     */
    removeMapById: function (id) {
        mapCollection.filter(map => (map?.id || map.get("id")) !== id);
    }
};
