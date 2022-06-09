import store from "../../app-store";
import {entities} from "@masterportal/masterportalapi/src";
import getProxyUrl from "../../utils/getProxyUrl";
import * as bridge from "./RadioBridge.js";
import Layer from "./layer";
/**
 * Creates an entities-layer to display on 3D-map.
 * @param {Object} attrs  attributes of the layer
 * @returns {void}
 */
export default function EntitiesLayer (attrs) {
    const defaults = {
        supported: ["3D"],
        showSettings: false,
        selectionIDX: -1,
        useProxy: false
    };

    /**
     * @deprecated in the next major-release!
     * useProxy
     * getProxyUrl()
     */
    if (attrs.useProxy) {
        attrs.entities.forEach(entity => {
            entity.url = getProxyUrl(entity.url);
        });
    }

    this.createLayer(Object.assign(defaults, attrs));
    // call the super-layer
    Layer.call(this, Object.assign(defaults, attrs), this.layer, !attrs.isChildLayer);

    store.watch((state, getters) => getters["Maps/mode"], mode => {
        if (mode === "3D") {
            const map = mapCollection.getMap(store.state.Maps.mode);

            entities.createDataSource(attrs, map, () => {
                this.setIsSelected(this.get("isVisibleInMap"));
            });
        }
    });
}
// Link prototypes and add prototype methods, means EntitiesLayer uses all methods and properties of Layer
EntitiesLayer.prototype = Object.create(Layer.prototype);

/**
 * Creates the layer by using masterportalAPI's entities-layer.
 * If attribute isSelected is true, setIsSelected is called.
 * @param {Object} attr the attributes for the layer
 * @returns {void}
 */
EntitiesLayer.prototype.createLayer = function (attr) {
    const map = mapCollection.getMap(store.state.Maps.mode);

    this.layer = entities.createLayer(attr, map);
    if (attr.isSelected) {
        this.setIsSelected(true, attr);
    }
};

/**
 * Calls the function setIsSelected.
 * @param {boolean} newValue if true, layer is selected
 * @returns {void}
 */
EntitiesLayer.prototype.setVisible = function (newValue) {
    this.setIsSelected(newValue);
};

/**
 * Calls masterportalAPI's entities-layer to set this layer visible.
 * @param {Boolean} newValue if true, layer is visible
 * @param {Object} attr the attributes for the layer
 * @returns {void}
 */
EntitiesLayer.prototype.setIsSelected = function (newValue, attr) {
    const map = mapCollection.getMap(store.state.Maps.mode);

    if (map && map.mode === "3D") {
        if (!this.attributes && attr) {
            attr.isSelected = newValue;
        }
        else {
            this.attributes.isSelected = newValue;
            this.setIsVisibleInMap(newValue);
        }
        entities.setVisible(newValue, this.attributes ? this.attributes : attr, map);
        bridge.updateLayerView(this);
        bridge.renderMenu();
        bridge.renderMenuSelection();
    }
};
/**
 * Setter for isVisibleInMap.
 * @param {Boolean} newValue Flag if layer is visible in map
 * @returns {void}
 */
EntitiesLayer.prototype.setIsVisibleInMap = function (newValue) {
    const lastValue = this.get("isVisibleInMap");

    this.set("isVisibleInMap", newValue);
    if (!newValue) {
        const map = mapCollection.getMap(store.state.Maps.mode);

        if (map && map.mode === "3D") {
            entities.setVisible(newValue, this.attributes, map);
        }
    }
    if (lastValue !== newValue) {
        // here it is possible to change the layer visibility-info in state and listen to it e.g. in LegendWindow
        // e.g. store.dispatch("Map/toggleLayerVisibility", {layerId: this.get("id")});
        bridge.layerVisibilityChanged(this, this.get("isVisibleInMap"));
    }
};
/**
* Register interaction with map view. Listens to change of scale.
* @returns {void}
*/
EntitiesLayer.prototype.registerInteractionMapViewListeners = function () {
    // no listeners shall be registered
};
/**
 * Transforms transparency into opacity and sets opacity on layer.
 * @return {void}
 */
EntitiesLayer.prototype.updateLayerTransparency = function () {
    // not needed in 3D
};
/**
 * Sets visible min and max resolution on layer.
 * @returns {void}
 */
EntitiesLayer.prototype.setMinMaxResolutions = function () {
    // not needed in 3D
};
/**
 * Checks whether the layer is visible or not based on the scale.
 * @param {object} options - of the map, contains scale of the map
 * @returns {void}
 **/
EntitiesLayer.prototype.checkForScale = function () {
    // not needed in 3D
};
/**
 * Setter for transparency and setter for opacitiy of the layer.
 * @param {Number} newValue Tranparency in percent
 * @returns {void}
 */
EntitiesLayer.prototype.setTransparency = function () {
    // not needed in 3D
};
