import store from "../../app-store";
import {Tileset} from "@masterportal/masterportalapi/src";
import getProxyUrl from "../../../src/utils/getProxyUrl";
import * as bridge from "./RadioBridge.js";
import Layer from "./layer";
/**
 * Creates a tileset-layer to display on 3D-map.
 * @param {Object} attrs  attributes of the layer
 * @returns {void}
 */
export default function TileSetLayer (attrs) {
    const defaults = {
        supported: ["3D"],
        showSettings: false,
        useProxy: false,
        cesium3DTilesetDefaults: {
            maximumScreenSpaceError: "6"
        }
    };

    /**
     * @deprecated in the next major-release!
     * useProxy
     * getProxyUrl()
     */
    if (attrs.useProxy) {
        attrs.url = getProxyUrl(this.get("url"));
    }
    this.createLayer(Object.assign(defaults, attrs));
    // call the super-layer
    Layer.call(this, Object.assign(defaults, attrs), this.layer, !attrs.isChildLayer);
    this.onMapModeChanged();
}
// Link prototypes and add prototype methods, means TileSetLayer uses all methods and properties of Layer
TileSetLayer.prototype = Object.create(Layer.prototype);

/**
 * Creates the layer and if attr.isSelected = true, the layer is set visible.
 * @param {Object} attr the attributes for the layer
 * @returns {void}
 */
TileSetLayer.prototype.createLayer = function (attr) {
    this.layer = new Tileset(attr);
};

/**
 * Calls the function setIsSelected.
 * @param {boolean} newValue if true, layer is selected
 * @returns {void}
 */
TileSetLayer.prototype.setVisible = function (newValue) {
    this.setIsSelected(newValue);
};
/**
 * Sets this layer to visible, if mode changes to 3D.
 * @returns {void}
 */
TileSetLayer.prototype.onMapModeChanged = function () {
    store.watch((state, getters) => getters["Maps/mode"], mode => {
        if (mode === "3D") {
            this.setIsSelected(this.get("isVisibleInMap"));
        }
    });
};

/**
 * Calls masterportalAPI's terrain-layer to set this layer visible.
 * @param {Boolean} newValue if true, layer is visible
 * @param {Object} attr the attributes for the layer
 * @returns {void}
 */
TileSetLayer.prototype.setIsSelected = function (newValue, attr) {
    const map = mapCollection.getMap(store.getters["Maps/mode"]),
        treeType = store.getters.treeType;

    if (map && map.mode === "3D") {
        let isVisibleInMap = this.attributes ? this.get("isVisibleInMap") : false;

        if (!this.attributes && attr) {
            isVisibleInMap = attr.isVisibleInMap;
            attr.isVisibleInMap = newValue;
            attr.isSelected = newValue;
            this.layer.setVisible(newValue, map);
        }
        else {
            this.setIsVisibleInMap(newValue);
            this.attributes.isSelected = newValue;
        }
        if (isVisibleInMap) {
            this.createLegend();
        }
        if (treeType !== "light" || store.state.mobile) {
            bridge.updateLayerView(this);
            bridge.renderMenu();
        }
    }
};
/**
 * Setter for isVisibleInMap and setter for layer.setVisible
 * @param {Boolean} newValue Flag if layer is visible in map
 * @returns {void}
 */
TileSetLayer.prototype.setIsVisibleInMap = function (newValue) {
    const lastValue = this.get("isVisibleInMap"),
        map = mapCollection.getMap(store.getters["Maps/mode"]);

    this.set("isVisibleInMap", newValue);
    if (map && map.mode === "3D") {
        this.layer.setVisible(newValue, map);
    }
    if (lastValue !== newValue) {
        // here it is possible to change the layer visibility-info in state and listen to it e.g. in LegendWindow
        // e.g. store.dispatch("Map/toggleLayerVisibility", {layerId: this.get("id")});
        bridge.layerVisibilityChanged(this, this.get("isVisibleInMap"));
    }
};

/**
 * Creates the legend.
 * @returns {void}
 */
TileSetLayer.prototype.createLegend = function () {
    const styleModel = Radio.request("StyleList", "returnModelById", this.get("styleId"));
    let legend = this.get("legend");

    /**
     * @deprecated in 3.0.0
     */
    if (this.get("legendURL")) {
        if (this.get("legendURL") === "") {
            legend = true;
        }
        else if (this.get("legendURL") === "ignore") {
            legend = false;
        }
        else {
            legend = this.get("legendURL");
        }
    }
    if (Array.isArray(legend)) {
        this.setLegend(legend);
    }
    else if (styleModel && legend === true) {
        this.setLegend(styleModel.getLegendInfos());
    }
    else if (typeof legend === "string") {
        this.setLegend([legend]);
    }
};
/**
* Register interaction with map view. Listens to change of scale.
* @returns {void}
*/
TileSetLayer.prototype.registerInteractionMapViewListeners = function () {
    // no listeners shall be registered
};
/**
 * Transforms transparency into opacity and sets opacity on layer.
 * @return {void}
 */
TileSetLayer.prototype.updateLayerTransparency = function () {
    // not needed in 3D
};
/**
 * Setter for transparency and setter for opacitiy of the layer.
 * @param {Number} newValue Tranparency in percent
 * @returns {void}
 */
TileSetLayer.prototype.setTransparency = function () {
    // not needed in 3D
};
/**
 * Sets visible min and max resolution on layer.
 * @returns {void}
 */
TileSetLayer.prototype.setMinMaxResolutions = function () {
    // not needed in 3D
};
/**
 * Checks whether the layer is visible or not based on the scale.
 * @param {object} options - of the map, contains scale of the map
 * @returns {void}
 **/
TileSetLayer.prototype.checkForScale = function () {
    // not needed in 3D
};
