import {PluggableMap} from "ol";
// import {unByKey as unlistenByKey} from "ol/Observable.js";
import {Group as LayerGroup} from "ol/layer.js";
/* import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";

const originalAddLayer = PluggableMap.prototype.addLayer; */

/**
 * Pushes layers with the attribute: "alwaysOnTop" to the top of the layer collection.
 * @param {module:ol/Collection~Collection} layers Layer Collection.
 * @returns {void}
 */
function setLayersAlwaysOnTop (layers) {
    layers.forEach(layer => {
        if (layer.get("alwaysOnTop") === true) {
            layer.setZIndex(layers.getLength());
        }
    });
}

/**
 * Adds a layer to the map.
 * Layers with the attribute "alwaysOnTop": true are set on top of the map.
 * @param {module:ol/layer/Base~BaseLayer} layer The layer to add.
 * @returns {void}
 */
/* PluggableMap.prototype.addLayer = function (layer) {
    layer.setZIndex(this.getLayers().getLength());
    originalAddLayer.call(this, layer);

    setLayersAlwaysOnTop(this.getLayers());
}; */

/**
 * Adds a layer with a zIndex to the map.
 * If the layer already exists, only the zIndex of the layer will be reset.
 * Layers with the attribute "alwaysOnTop": true are set on top of the map.
 * @param {module:ol/layer/Base~BaseLayer} layer The layer to add.
 * @param {Number} zIndex The zIndex of the layer.
 * @returns {void}
 */
PluggableMap.prototype.addLayerToIndex = function (layer, zIndex) {
    layer.setZIndex(zIndex);
    if (!this.getLayers().getArray().includes(layer)) {
        this.addLayer(layer);
    }

    setLayersAlwaysOnTop(this.getLayers());
};

/**
 * Adds a layer on top of the map
 * Layers with the attribute "alwaysOnTop": true are set on top of the map.
 * @param {module:ol/layer/Base~BaseLayer} layer The layer to add.
 * @returns {void}
 */
/* PluggableMap.prototype.addLayerOnTop = function (layer) {
    this.addLayerToIndex(layer, this.getLayers().getLength());
}; */

/**
 * Checks if the layer with the given name already exists and uses it,
 * creates a new layer and returns it if not.
 * @param {String} layerName The name of the layer to check.
 * @param {Boolean} [alwaysOnTop=true] Layers with the attribute "alwaysOnTop": true are set on top of the map.
 * @returns {module:ol/layer/Base~BaseLaye}  the found layer or a new layer with the given name.
 */
/* PluggableMap.prototype.addNewLayerIfNotExists = function (layerName, alwaysOnTop = true) {
    let resultLayer = this.getLayerByName(layerName);

    if (!resultLayer) {
        resultLayer = new VectorLayer({
            id: layerName,
            name: layerName,
            source: new VectorSource(),
            alwaysOnTop: alwaysOnTop
        });

        this.addLayer(resultLayer);
    }

    return resultLayer;
}; */

/**
* Returns a layer or a child layer of a layer group by id.
* @param  {String} layerId Id of the Layer.
* @param  {Boolean} searchInGroupLayers Specifies whether to search for the id in the childLayers of groupLayers.
* @return {module:ol/layer/Base~BaseLayer} The layer found by id.
*/
PluggableMap.prototype.getLayerById = function (layerId, searchInGroupLayers = true) {
    let returnLayer = null;

    this.getLayers().getArray().forEach(layer => {
        if (searchInGroupLayers && layer instanceof LayerGroup) {
            const groupLayer = layer.getLayers().getArray().find(childLayer => childLayer.get("id") === layerId);

            returnLayer = groupLayer || returnLayer;
        }
        else if (layer.get("id") === layerId) {
            returnLayer = layer;
        }
    });

    return returnLayer;
};

/**
* Returns a layer by a given layer name.
* @param  {String} layerName Name of the Layer.
* @return {module:ol/layer/Base~BaseLayer} The layer found by name.
*/
PluggableMap.prototype.getLayerByName = function (layerName) {
    return this.getLayers().getArray().find(layer => layer.get("name") === layerName);
};

// /**
// * Registered listener for certain events on the map.
// * @see https://openlayers.org/en/latest/apidoc/module-ol_Map-Map.html
// * @param {String} event The Eventtype.
// * @param {Function} callback The callback function.
// * @param {Object} context The context.
// * @returns {void}
// */
// PluggableMap.prototype.registerListener = function (event, callback, context) {
//     this.on(event, callback, context);
// };

// /**
// * Unsubscribes listener to certain events.
// * @param {String | Object} event The event type or an object used as a key.
// * @param {Function} callback The callback function.
// * @param {Object} context The context.
// * @returns {void}
// */
// PluggableMap.prototype.unregisterListener = function (event, callback, context) {
//     if (typeof event === "string") {
//         this.un(event, callback, context);
//     }
//     else {
//         unlistenByKey(event);
//     }
// };
