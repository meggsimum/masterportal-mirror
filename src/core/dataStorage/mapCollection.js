const mapCollection = [];

export default {
    /**
     * Adds a map to the mapCollection
     * @param {module:ol/PluggableMap~PluggableMap} map The map.
     * @param {String} id The map id.
     * @param {String} mode The map mode.
     * @returns {void}
     */
    addMap: function (map, id, mode) {
        map.id = id;
        map.mode = mode;

        mapCollection.push(map);
    },

    /**
     * Removes all entries from the collection.
     * @returns {void}
     */
    clear: function () {
        mapCollection.length = 0;
    },

    /**
     * Gets a map by the given mode.
     * @param {String} mode The map mode.
     * @returns {module:ol/PluggableMap~PluggableMap} The map.
     */
    getMap: function (mode) {
        return mapCollection.find(map => map?.mode === mode);
    },

    /**
     * Returns the map collection.
     * @returns {Array} The map collection.
     */
    getMapCollection: function () {
        return mapCollection;
    },

    /**
     * Gets a mapview of a map by the given id and mode.
     * @param {String} id The map id.
     * @param {String} mode The map mode.
     * @returns {module:ol/PluggableMap~PluggableMap} The mapview.
     */
    getMapView: function (id, mode) {
        return this.getMap(mode).getView();
    }
};
