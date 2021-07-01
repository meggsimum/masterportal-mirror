import TileWMS from "ol/source/TileWMS.js";
import ImageWMS from "ol/source/ImageWMS.js";

export default {
    /**
     * Creates tile wms source.
     * @param {Object} tileWMSSourceParams Contains the parameter for the tile wms source.
     * @returns {ol/source/TileWMS} Returns the OpenLayers tile wms source.
     */
    createTileWMSSource: function (tileWMSSourceParams) {
        return new TileWMS(tileWMSSourceParams);
    },
    /**
     * Creates the image wms.
     * @param {Object} imageWMSParams Contains the parameter for the image wms.
     * @returns {ol/source/ImageWMS} Returns the OpenLayers image wms source.
     */
    createImageWMS: function (imageWMSParams) {
        return new ImageWMS(imageWMSParams);
    },
    /**
     * Checks if it is an instance of tile wms .
     * @param {Object} layersource Contains the layer source.
     * @returns {Boolean} true | false
     */
    isInstanceOfTileWMS: function (layersource) {
        return layersource instanceof TileWMS;
    },
    /**
     * Checks if it is an instance of tile wms .
     * @param {Object} layersource Contains the layer source.
     * @returns {Boolean} true | false
     */
    isInstanceOfImageWMS: function (layersource) {
        return layersource instanceof ImageWMS;
    }
};
