import Cluster from "ol/source/Cluster.js";
import transformToMapProjection from "masterportalAPI/src/crs";

import mapCollection from "../../../dataStorage/mapCollection";
import calculateExtent from "../../../../utils/calculateExtent";

export default {

    /**
     * Zoom to a given extent
     * @param {Object} state state object
     * @param {Object} payload parameter object
     * @param {String[]} payload.extent The extent to zoom.
     * @param {Object} payload.options Options for zoom.
     * @param {Number} [payload.options.duration=800] The duration of the animation in milliseconds.
     * @param {Object} [payload.map] The parameter to get the map from the map collection
     * @param {String} [payload.map.mapId="ol"] The map id.
     * @param {String} [payload.map.mapMode="2D"] The map mode.
     * @see {@link https://openlayers.org/en/latest/apidoc/module-ol_View-View.html#fit} for more options.
     * @returns {void}
     */
    zoomToExtent ({getters}, {extent, options, map = {mapId: "ol", mapMode: "2D"}}) {
        getters.getView.fit(extent, {
            size: mapCollection.getMap(map.mapId, map.mapMode).getSize(),
            ...Object.assign({duration: 800}, options)
        });
    },

    /**
     * Zoom to features that are filtered by the ids.
     * @param {Object} state state object
     * @param {Object} payload parameter object
     * @param {String[]} payload.ids The feature ids.
     * @param {String} payload.layerId The layer id.
     * @param {Object} payload.zoomOptions The options for zoom to extent.
     * @param {Object} [payload.map] The parameter to get the map from the map collection
     * @param {String} [payload.map.mapId="ol"] The map id.
     * @param {String} [payload.map.mapMode="2D"] The map mode.
     * @returns {void}
     */
    async zoomToFilteredFeatures ({dispatch}, {ids, layerId, zoomOptions}) {
        const layer = dispatch("getLayerById", {layerId: layerId});

        if (layer?.getSource()) {
            const layerSource = layer.getSource(),
                source = layerSource instanceof Cluster ? layerSource.getSource() : layerSource,
                filteredFeatures = source.getFeatures().filter(feature => ids.indexOf(feature.getId()) > -1),
                calculatedExtent = await calculateExtent(filteredFeatures);

            if (filteredFeatures.length > 0) {
                dispatch("zoomToExtent", {extent: calculatedExtent, options: zoomOptions});
            }
        }
    },

    /**
     * Zoom to a given extent, this function allows to give projection of extent
     * Note: Used in remoteInterface.
     * @param {Object} state state object
     * @param {Object} payload parameter object
     * @param {Object} payload.data Contains extent, options as Object and projection.
     * @param {String[]} payload.data.extent The extent to zoom.
     * @param {Object} payload.data.options Options for zoom.
     * @param {string} payload.data.projection The projection from RUL parameter.
     * @param {Object} [payload.map] The parameter to get the map from the map collection
     * @param {String} [payload.map.mapId="ol"] The map id.
     * @param {String} [payload.map.mapMode="2D"] The map mode.
     * @returns {void}
     */
    zoomToProjExtent ({dispatch}, {data, map = {mapId: "ol", mapMode: "2D"}}) {
        if (Object.values(data).every(val => val !== undefined)) {
            const leftBottom = data.extent.slice(0, 2),
                topRight = data.extent.slice(2, 4),
                transformedLeftBottom = transformToMapProjection(mapCollection.getMap(map.mapId, map.mapMode), data.projection, leftBottom),
                transformedTopRight = transformToMapProjection(mapCollection.getMap(map.mapId, map.mapMode), data.projection, topRight),
                extentToZoom = transformedLeftBottom.concat(transformedTopRight);

            dispatch("Maps/zoomToExtent", {extent: extentToZoom, options: data.options, map: {mapId: map.mapId, mapMode: map.mapMode}});
        }
    }
};
