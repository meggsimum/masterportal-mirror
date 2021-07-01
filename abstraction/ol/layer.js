import {Image, Tile} from "ol/layer.js";

export default {
    /**
     * Creates the base class for tile layer.
     * @param {Object} layerobjects Contains the parameter for the tile base class.
     * @returns {ol/layer/tile} Returns the OpenLayers tile base class.
     */
    createTile: function (layerobjects) {
        return new Tile(layerobjects);
    },
    /**
     * Creates the base class for image layer.
     * @param {Object} layerobjects Contains the parameter for the image base class.
     * @returns {ol/layer/image} Returns the OpenLayers image base class.
     */
    createImage: function (layerobjects) {
        return new Image(layerobjects);
    }
};
