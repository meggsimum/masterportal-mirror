import {generateSimpleGetters} from "../../../app-store/utils/generators";
import initialState from "./stateMap";
import thousandsSeparator from "../../../utils/thousandsSeparator.js";
import {transformFromMapProjection} from "@masterportal/masterportalapi/src/crs";
import {Group as LayerGroup} from "ol/layer.js";

const getters = {
    ...generateSimpleGetters(initialState),

    /**
     * Returns the layer collection of the map
     * @returns {Object} layer collection of the map.
     */
    getLayers: () => {
        return mapCollection.getMap("2D").getLayers();
    },

    /**
     * Returns the current 2D map view
     * @returns {Object} Returns current 2D map view .
     */
    getView: () => {
        return mapCollection.getMapView("2D");
    },

    /**
     * Returns the corresponding resolution for the scale.
     * @param  {String|Number} scale - the scale
     * @param  {String} scaleType - min or max
     * @return {Number} resolution
     */
    getResolutionByScale: () => (scale, scaleType) => {
        const scales = getters.getView().get("options").map(option => option.scale);

        let index = "",
            unionScales = scales.concat([parseInt(scale, 10)].filter(item => scales.indexOf(item) < 0));

        unionScales = unionScales.sort((a, b) => b - a);

        index = unionScales.indexOf(parseInt(scale, 10));
        if (unionScales.length === scales.length || scaleType === "max") {
            return getters.getView().getResolutions()[index];
        }
        else if (scaleType === "min") {
            return getters.getView().getResolutions()[index - 1];
        }
        return null;
    },

    /**
     * Returns a projected boundingbox of a provided coordinate system.
     * @param {String} epsgCode for the target projection of the bbox.
     * @returns {Array} Returns the projected bbox.
     */
    getProjectedBBox: () => (epsgCode) => {
        const map = mapCollection.getMap("2D"),
            bbox = getters.getView().calculateExtent(map.getSize),
            firstCoordTransform = transformFromMapProjection(map, epsgCode, [bbox[0], bbox[1]]),
            secondCoordTransform = transformFromMapProjection(map, epsgCode, [bbox[2], bbox[3]]);

        return [firstCoordTransform[0], firstCoordTransform[1], secondCoordTransform[0], secondCoordTransform[1]];
    },

    /**
     * Returns the 3D mode
     * @param {Object} mode of the map
     * @return {boolean} whether the portal is currently in 3D mode
     */
    is3D: ({mode}) => {
        return mode === "3D";
    },

    /**
     * @param {Object} state the state
     * @param {Object} getter the getters
     * @returns {Boolean} whether current zoom level is the maximum zoom level
     */
    maximumZoomLevelActive: (state, getter) => getter.getView.getZoom() >= getter.getView.getMaxZoom(),

    /**
     * @param {Object} state the state
     * @param {Object} getter the getters
     * @returns {Boolean} whether current zoom level is the minimal zoom level
     */
    minimumZoomLevelActive: (state, getter) => getter.getView.getZoom() <= getter.getView.getMinZoom(),

    /**
     * @param {Object} state the state
     * @param {Object} params getter parameters
     * @param {Number} params.scale x from computed scale value 1:x
     * @returns {String} pretty-printed scale to 2cms
     */
    scaleWithUnit: (state, {scale}) => {
        const scaleNumber = Math.round(0.02 * scale);

        return scaleNumber >= 1000 ? `${Math.round(scaleNumber / 100) / 10} km` : `${scaleNumber} m`;
    },

    /**
     * Returns a beautified state in format "1 : scale" where scale is rounded based on its value
     * @param {Object} state the state
     * @param {Object} params getter parameters
     * @param {Number} params.scale a value (number) from computed scale 1:x
     * @returns {String} pretty-printed scale as "1 : scale"
     */
    scaleToOne: (state, {scale}) => {
        if (typeof scale !== "number" || scale <= 0) {
            return "1 : scale must be a positive number";
        }
        let result = Math.round(scale);

        if (result > 10000) {
            result = Math.round(result / 500) * 500;
        }
        else if (result > 1000) {
            result = Math.round(result / 50) * 50;
        }

        return "1 : " + thousandsSeparator(result);
    },

    /**
     * @param {Object} state the state
     * @param {Object} params getter parameters
     * @param {Number[]} params.mouseCoord the mouse coord as array
     * @returns {String} pretty-printed mouse coordinate (in 3d with height).
     */
    prettyMouseCoord: (state, {mouseCoordinate}) => {
        let prettyMouseCoord = mouseCoordinate ? `${mouseCoordinate[0].toFixed(2).toString()}, ${mouseCoordinate[1].toFixed(2).toString()}` : "";

        prettyMouseCoord = mouseCoordinate?.length === 3 ? `${prettyMouseCoord}, ${mouseCoordinate[2].toFixed(1)}` : prettyMouseCoord;
        return prettyMouseCoord;

    },

    projectionCode: (state, getter) => getter.projection?.getCode(),
    projectionMetersPerUnit: (state, getter) => getter.projection?.getMetersPerUnit(),
    projectionUnits: (state, getter) => getter.projection?.getUnits(),

    /**
     * Gets all visible layers from map
     * @returns {Object[]} all visible layers
     */
    getVisibleLayerList: () => {
        return mapCollection.getMap("2D").getLayers().getArray().filter(layer => layer.getVisible());
    },

    /**
     * calculate the extent for the current view state and the passed size
     * @return {ol.extent} extent
     */
    getCurrentExtent: () => {
        let size;

        if (Array.isArray(getters.size)) {
            size = getters.size;
        }
        else {
            size = mapCollection.getMap("2D").getSize();
        }
        return getters.getView().calculateExtent(size);
    },

    /**
    * Returns a layer or a child layer of a layer group by id.
    * @param  {String} layerId Id of the Layer.
    * @param  {Boolean} searchInGroupLayers Specifies whether to search for the id in the childLayers of groupLayers.
    * @return {module:ol/layer/Base~BaseLayer} The layer found by id.
    */
    getLayerById: () => ({layerId, searchInGroupLayers = true}) => {
        let returnLayer = null;
console.log(mapCollection.getMap("2D").getLayers().getArray());
        mapCollection.getMap("2D").getLayers().getArray().forEach(layer => {
            if (searchInGroupLayers && layer instanceof LayerGroup) {
                const groupLayer = layer.getLayers().getArray().find(childLayer => childLayer.get("id") === layerId);

                returnLayer = groupLayer || returnLayer;
            }
            else if (layer.get("id") === layerId) {
                returnLayer = layer;
            }
        });

        return returnLayer;
    },

    /**
    * Returns a layer by a given layer name.
    * @param  {String} layerName Name of the Layer.
    * @return {module:ol/layer/Base~BaseLayer} The layer found by name.
    */
    getLayerByName: () => (layerName) => {
        return mapCollection.getMap("2D").getLayers().getArray().find(layer => layer.get("name") === layerName);
    }
};

export default getters;

