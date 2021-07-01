import TileGrid from "ol/tilegrid/TileGrid.js";

/**
 * Creates a 2D-map.
 * @param {Object} tileWMSParams todo
 * @returns {void}
 */
export default {
    createTileGrid: function (tileWMSParams) {
        return new TileGrid(tileWMSParams);
    }
};
