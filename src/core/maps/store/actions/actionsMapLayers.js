import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import {Group as LayerGroup} from "ol/layer.js";


export default {
    /**
     * Creates a new vector layer and adds it to the map.
     * If it already exists, this layer is returned.
     * @param {Object} context parameter object
     * @param {String} name The name and the id for the layer.
     * @returns {module:ol/layer} The created or the already existing layer.
     */
    createLayer ({state, dispatch}, name) {
        const layerList = state.layerList;

        let resultLayer = layerList.find(layer => {
            return layer.get("name") === name;
        });

        if (resultLayer !== undefined) {
            return resultLayer;
        }

        resultLayer = new VectorLayer({
            id: name,
            name: name,
            source: new VectorSource(),
            zIndex: 999
        });
        dispatch("addLayer", resultLayer);
        return resultLayer;
    },
    /**
     * Adds a layer to the map.
     * Layers with the attribute "alwaysOnTop": true are set on top of the map.
     * @param {Object} context parameter object
     * @param {module:ol/layer/Base~BaseLayer} layer The layer to add.
     * @returns {void}
     */
    addLayer ({dispatch, getters}, layer) {
        layer.setZIndex(getters.get2DMap.getLayers().getLength());
        getters.get2DMap.addLayer(layer);

        dispatch("setLayersAlwaysOnTop", getters.get2DMap.getLayers());
    },
    /**
     * Pushes layers with the attribute: "alwaysOnTop" to the top of the layer collection.
     * @param {Object} state parameter object
     * @param {module:ol/Collection~Collection} layers Layer Collection.
     * @returns {void}
     */
    setLayersAlwaysOnTop (state, layers) {
        layers.forEach(layer => {
            if (layer.get("alwaysOnTop") === true) {
                layer.setZIndex(layers.getLength());
            }
        });
    },
    /**
     * Adds a layer with a zIndex to the map.
     * If the layer already exists, only the zIndex of the layer will be reset.
     * Layers with the attribute "alwaysOnTop": true are set on top of the map.
     * @param {Object} context parameter object
     * @param {Object} payload parameter object
     * @param {module:ol/layer/Base~BaseLayer} payload.layer The layer to add.
     * @param {Number} payload.zIndex The zIndex of the layer.
     * @returns {void}
     */
    addLayerToIndex ({dispatch, getters}, {layer, zIndex}) {
        layer.setZIndex(zIndex);
        if (!getters.get2DMap.getLayers().getArray().includes(layer)) {
            dispatch("addLayer", layer);
        }

        dispatch("setLayersAlwaysOnTop", getters.get2DMap.getLayers());
    },
    /**
     * Adds a layer on top of the map
     * Layers with the attribute "alwaysOnTop": true are set on top of the map.
     * @param {Object} context parameter object
     * @param {module:ol/layer/Base~BaseLayer} layer The layer to add.
     * @returns {void}
     */
    addLayerOnTop ({dispatch, getters}, layer) {
        dispatch("addLayerToIndex", {layer: layer, zIndex: getters.get2DMap.getLayers().getLength()});
    },
    /**
     * Checks if the layer with the given name already exists and uses it,
     * creates a new layer and returns it if not.
     * @param {Object} context parameter object
     * @param {String} layerName The name of the layer to check.
     * @param {Boolean} [alwaysOnTop=true] Layers with the attribute "alwaysOnTop": true are set on top of the map.
     * @returns {module:ol/layer/Base~BaseLaye}  the found layer or a new layer with the given name.
     */
    addNewLayerIfNotExists ({dispatch}, {layerName, alwaysOnTop = true}) {
        let resultLayer = dispatch("getLayerByName", layerName);

        if (!resultLayer) {
            resultLayer = new VectorLayer({
                id: layerName,
                name: layerName,
                source: new VectorSource(),
                alwaysOnTop: alwaysOnTop
            });

            dispatch("addLayer", resultLayer);
        }

        return resultLayer;
    },
    /**
    * Returns a layer or a child layer of a layer group by id.
    * @param {Object} context parameter object.
    * @param  {String} layerId Id of the Layer.
    * @param  {Boolean} searchInGroupLayers Specifies whether to search for the id in the childLayers of groupLayers.
    * @return {module:ol/layer/Base~BaseLayer} The layer found by id.
    */
    getLayerById ({getters}, {layerId, searchInGroupLayers = true}) {
        let returnLayer = null;

        getters.get2DMap.getLayers().getArray().forEach(layer => {
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
    * @param {Object} context parameter object.
    * @param  {String} layerName Name of the Layer.
    * @return {module:ol/layer/Base~BaseLayer} The layer found by name.
    */
    getLayerByName ({getters}, layerName) {
        return getters.get2DMap.getLayers().getArray().find(layer => layer.get("name") === layerName);
    }
};

