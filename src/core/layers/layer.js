import store from "../../app-store";
import mapCollection from "../../core/dataStorage/mapCollection.js";
import deepCopy from "../../utils/deepCopy.js";
import * as bridge from "./RadioBridge.js";

/**
 * Creates a layer object to extend from.
 * @param {Object} attrs attributes of the layer
 * @param {ol.Layer} layer the new created layer
 * @param {Boolean} [initialize=true] to be set to false, if layer is no Child-Layer
 * @returns {void}
 */
export default function Layer (attrs, layer, initialize = true) {
    const defaults = {
        hitTolerance: 0,
        isNeverVisibleInTree: false,
        isRemovable: false,
        isSelected: false,
        isSettingVisible: false,
        isVisibleInMap: false,
        layerInfoClicked: false,
        singleBaselayer: false,
        legend: true,
        maxScale: "1000000",
        minScale: "0",
        selectionIDX: 0,
        showSettings: true,
        styleable: false,
        supported: ["2D"],
        transparency: 0,
        isOutOfRange: undefined,
        isSecured: false,
        domId: "layer-list-group-item-" + attrs.id,
        showTopicText: i18next.t("common:tree.showTopic"),
        removeTopicText: i18next.t("common:tree.removeTopicText"),
        changeClassDivisionText: i18next.t("common:tree.changeClassDivision"),
        transparencyText: i18next.t("common:tree.transparency"),
        increaseTransparencyText: i18next.t("common:tree.increaseTransparency"),
        reduceTransparencyText: i18next.t("common:tree.reduceTransparency"),
        removeLayerText: i18next.t("common:tree.removeLayer"),
        levelUpText: i18next.t("common:tree.levelUp"),
        levelDownText: i18next.t("common:tree.levelDown"),
        settingsText: i18next.t("common:tree.settings"),
        infosAndLegendText: i18next.t("common:tree.infosAndLegend")
    };

    this.layer = layer;
    this.attributes = {...Object.assign({}, this.layer.values_, defaults, attrs)};
    this.id = attrs.id;
    delete this.attributes.source;
    if (initialize) {
        this.initialize(attrs);
    }
    else if (attrs.isSelected === true || store.getters.treeType === "light") {
        this.setIsVisibleInMap(attrs.isSelected);
    }
    this.setMinMaxResolutions();
    this.checkForScale({scale: store.getters["Map/scale"]});
    this.registerInteractionMapViewListeners();
}
/**
 * Initalizes the layer. Sets property singleBaselayer and sets the layer visible, if selected in attributes or treetype light.
 * @param {Object} attrs attributes of the layer
 * @returns {void}
 */
Layer.prototype.initialize = function (attrs) {
    if (store.state.configJson?.Portalconfig.singleBaselayer !== undefined) {
        this.set("singleBaselayer", store.state.configJson?.Portalconfig.singleBaselayer);
    }

    if (attrs.isSelected === true || store.getters.treeType === "light") {
        this.updateLayerTransparency();
        this.setIsVisibleInMap(attrs.isSelected);
        this.set("isRemovable", store.state.configJson?.Portalconfig.layersRemovable);
    }
    else {
        this.layer.setVisible(false);
    }
};
/**
 * To be overwritten, does nothing.
 * @returns {void}
 */
Layer.prototype.createLayer = function () {
    // do in children
    console.warn("function Layer.createLayer must be overwritten in extended layers!");
};
/**
 * To be overwritten, does nothing.
 * @returns {void}
 */
Layer.prototype.createLegend = function () {
    // do in children
    console.warn("function Layer.createLegend must be overwritten in extended layers!");
};
/**
* Register interaction with map view. Listens to change of scale.
* @returns {void}
*/
Layer.prototype.registerInteractionMapViewListeners = function () {
    store.watch((state, getters) => getters["Map/scale"], scale => {
        this.checkForScale({scale: scale});
    });
};
/**
 * Setter for ol/layer.setMaxResolution
 * @param {Number} value Maximum resolution of layer
 * @returns {void}
 */
Layer.prototype.setMaxResolution = function (value) {
    this.layer.setMaxResolution(value);
};
/**
 * Setter for ol/layer.setMinResolution
 * @param {Number} value Minimum resolution of layer
 * @returns {void}
 */
Layer.prototype.setMinResolution = function (value) {
    this.layer.setMinResolution(value);
};
/**
 * Removes the layer from the map and the collection
 * @returns {void}
 */
Layer.prototype.removeLayer = function () {
    const map = mapCollection.getMap(store.state.Map.mapId, store.state.Map.mapMode);

    this.setIsVisibleInMap(false);
    bridge.removeLayerByIdFromModelList(this.get("id"));
    map.removeLayer(this.layer);
};
/**
 * Toggles the attribute isSelected. Calls Function setIsSelected.
 * @returns {void}
 */
Layer.prototype.toggleIsSelected = function () {
    const newValue = this.attributes.isSelected === undefined ? true : !this.attributes.isSelected,
        map = mapCollection.getMap(store.state.Map.mapId, store.state.Map.mapMode);

    this.setIsSelected(newValue);
    handleSingleBaseLayer(newValue, this, map);
};

/**
 * Checks whether the layer is visible or not based on the scale.
 * @param {object} options - of the map, contains scale of the map
 * @returns {void}
 **/
Layer.prototype.checkForScale = function (options) {
    const lastValue = this.get("isOutOfRange");

    if (options && parseFloat(options.scale, 10) <= parseInt(this.get("maxScale"), 10) && parseFloat(options.scale, 10) >= parseInt(this.get("minScale"), 10)) {
        this.setIsOutOfRange(false);
        if (lastValue !== false) {
            bridge.outOfRangeChanged(this, false);
        }
    }
    else {
        this.setIsOutOfRange(true);
        if (lastValue !== true) {
            bridge.outOfRangeChanged(this, true);
        }
    }
};
/**
 * Sets the property 'isOutOfRange'.
 * @param {boolean} value to set
 * @returns {void}
 */
Layer.prototype.setIsOutOfRange = function (value) {
    this.set("isOutOfRange", value);
};

/**
 * Setter for isVisibleInMap and setter for layer.setVisible
 * @param {Boolean} newValue Flag if layer is visible in map
 * @returns {void}
 */
Layer.prototype.setIsVisibleInMap = function (newValue) {
    const lastValue = this.get("isVisibleInMap");

    this.set("isVisibleInMap", newValue);
    this.layer.setVisible(newValue);
    if (this.get("typ") === "GROUP" && this.get("layers")) {
        this.get("layers").forEach(layer => {
            layer.setVisible(newValue);
        });
    }
    if (lastValue !== newValue) {
        // here it is possible to change the layer visibility-info in state and listen to it e.g. in LegendWindow
        // e.g. store.dispatch("Map/toggleLayerVisibility", {layerId: this.get("id")});
        bridge.layerVisibilityChanged(this, this.get("isVisibleInMap"));
    }
};
/**
 * Setter for transparency and setter for opacitiy of the layer.
 * @param {Number} newValue Tranparency in percent
 * @returns {void}
 */
Layer.prototype.setTransparency = function (newValue) {
    const transparency = parseInt(newValue, 10),
        opacity = (100 - transparency) / 100;

    this.set("transparency", transparency);
    this.layer.setOpacity(opacity);
};
/**
 * Decreases layer transparency by 10 percent
 * @return {void}
 */
Layer.prototype.decTransparency = function () {
    const transparency = parseInt(this.get("transparency"), 10);

    if (transparency <= 100 && transparency > 0) {
        this.setTransparency(transparency - 10);
        bridge.renderMenu();
        bridge.renderMenuSelection();
    }
};
/**
 * Increases layer transparency by 10 percent.
 * @return {void}
 */
Layer.prototype.incTransparency = function () {
    const transparency = parseInt(this.get("transparency"), 10);

    if (transparency <= 90) {
        this.setTransparency(transparency + 10);
        bridge.renderMenu();
        bridge.renderMenuSelection();
    }
};
/**
 * Transforms transparency into opacity and sets opacity on layer.
 * @return {void}
 */
Layer.prototype.updateLayerTransparency = function () {
    const opacity = (100 - parseInt(this.get("transparency"), 10)) / 100;

    this.layer.setOpacity(opacity);
};
/**
 * Setter for isVisibleInTree
 * @param {Boolean} newValue flag if layer is visible in tree
 * @returns {void}
 */
Layer.prototype.setIsVisibleInTree = function (newValue) {
    this.set("isVisibleInTree", newValue);
    bridge.isVisibleInTreeChanged();
};
/**
 * Resets selectionIDX property; 0 is defined as initial value and the layer will be acknowledged as
 * newly added for the sake of initial positioning
 * @returns {void}
 */
Layer.prototype.resetSelectionIDX = function () {
    this.setSelectionIDX(0);
};
/**
 * Setter for selectionIDX
 * @param {String} newValue the selectionIDX
 * @returns {void}
 */
Layer.prototype.setSelectionIDX = function (newValue) {
    this.set("selectionIDX", parseInt(newValue, 10));
};
/**
 * Setter for isSettingVisible
 * @param {Boolean} newValue flag if layer settings are visible
 * @returns {void}
 */
Layer.prototype.setIsSettingVisible = function (newValue) {
    this.set("isSettingVisible", newValue);
};
/**
 * Setter for layerInfoChecked
 * @param {Boolean} newValue flag if layer info is checked
 * @returns {void}
 */
Layer.prototype.setLayerInfoChecked = function (newValue) {
    this.set("layerInfoChecked", newValue);
};
/**
 * Toggles the attribute isSettingVisible. Sets the settings of all other layers to invisible.
 * @return {void}
 */
Layer.prototype.toggleIsSettingVisible = function () {
    const layers = bridge.getAllLayers(),
        oldValue = this.attributes.isSettingVisible;

    layers.setIsSettingVisible(false);
    this.setIsSettingVisible(!oldValue);
    bridge.renderMenuSettings();
};
/**
 * Sets the attribute isSelected and sets the layers visibility. If newValue is false, the layer is removed from map.
 * If configured and the layer is a baseLayer, the other selected baseLayers are deselected.
 * @param {Boolean} newValue true, if layer is selected
 * @returns {void}
 */
Layer.prototype.setIsSelected = function (newValue) {
    const map = mapCollection.getMap("ol", "2D"),
        treeType = store.getters.treeType;

    // do not use this.set("isSelected", value), because of neverending recursion
    this.attributes.isSelected = newValue;
    this.setIsVisibleInMap(newValue);
    if (treeType !== "light") {
        this.resetSelectionIDX();
    }

    if (newValue) {
        bridge.addLayerToIndex(this.layer, this.get("selectionIDX"));
    }
    else {
        map.removeLayer(this.layer);
    }
    if (treeType !== "light" || store.state.mobile) {
        bridge.updateLayerView(this);
        bridge.renderMenu();
    }
};
/**
* Toggles the attribute isVisibleInMap. If is true, the layer is set visible.
* @return {void}
*/
Layer.prototype.toggleIsVisibleInMap = function () {
    if (this.get("isVisibleInMap") === true) {
        this.setIsVisibleInMap(false);
    }
    else {
        this.setIsSelected(true);
    }
    if (store.getters.treeType !== "light" || store.state.mobile) {
        bridge.renderMenu();
        bridge.renderMenuSelection();
    }
};
/**
 * Refresh layerSource when updated,
 * e.g. needed because wmts source is created asynchronously.
 * @returns {void}
 */
Layer.prototype.updateLayerSource = function () {
    const layers = bridge.getLayerModelsByAttributes({name: this.get("name")});

    if (layers && layers[0] && this.get("layerSource") !== null) {
        layers[0].setSource(this.get("layerSource"));
        layers[0].getSource().refresh();
    }
};
/**
 * Change language - sets default values for the language
 * @returns {void}
 */
Layer.prototype.changeLang = function () {
    this.attributes.selectedTopicsText = i18next.t("common:tree.removeSelection");
    this.attributes.infosAndLegendText = i18next.t("common:tree.infosAndLegend");
    this.attributes.removeTopicText = i18next.t("common:tree.removeTopic");
    this.attributes.showTopicText = i18next.t("common:tree.showTopic");
    this.attributes.securedTopicText = i18next.t("common:tree.securedTopic");
    this.attributes.changeClassDivisionText = i18next.t("common:tree.changeClassDivision");
    this.attributes.settingsText = i18next.t("common:tree.settings");
    this.attributes.increaseTransparencyText = i18next.t("common:tree.increaseTransparency");
    this.attributes.reduceTransparencyText = i18next.t("common:tree.reduceTransparency");
    this.attributes.removeLayerText = i18next.t("common:tree.removeLayer");
    this.attributes.levelUpText = i18next.t("common:tree.levelUp");
    this.attributes.levelDownText = i18next.t("common:tree.levelDown");
    this.attributes.transparencyText = i18next.t("common:tree.transparency");
};
/**
 * Calls Collection function moveModelDown
 * @return {void}
 */
Layer.prototype.moveDown = function () {
    bridge.moveModelInTree(this, -1);
};
/**
 * Calls Collection function moveModelUp
 * @return {void}
 */
Layer.prototype.moveUp = function () {
    bridge.moveModelInTree(this, 1);
};
/**
 * Called from setSelected, handles singleBaseLayer and timelayers.
 * @param {Boolean} isSelected true, if layer is selected
 * @param {ol.Layer} layer the dedicated layer
 * @param {ol.Map} map the current map
 * @returns {void}
 */
function handleSingleBaseLayer (isSelected, layer, map) {
    const id = layer.get("id"),
        layerGroup = bridge.getLayerModelsByAttributes({parentId: layer.get("parentId")}),
        singleBaselayer = layer.get("singleBaselayer") && layer.get("parentId") === "Baselayer",
        timeLayer = layer.get("typ") === "WMS" && layer.get("time");

    if (isSelected) {
        // This only works for treeType 'custom', otherwise the parentId is not set on the layer
        if (singleBaselayer) {
            layerGroup.forEach(aLayer => {
                // folders parentId is baselayer too, but they have not a function checkForScale
                if (aLayer.get("id") !== id && typeof aLayer.checkForScale === "function") {
                    aLayer.set("isSelected", false);
                    aLayer.set("isVisibleInMap", false);
                    if (aLayer.get("layer") !== undefined) {
                        aLayer.get("layer").setVisible(false);
                    }
                    map.removeLayer(aLayer.get("layer"));
                    // This makes sure that the Oblique Layer, if present in the layerList, is not selectable if switching between baseLayers
                    aLayer.checkForScale({scale: store.getters["Map/scale"]});
                }
            });
            bridge.renderMenu();
        }
        if (timeLayer) {
            store.commit("WmsTime/setTimeSliderActive", {active: true, currentLayerId: id});
        }
    }
    else if (timeLayer) {
        layer.removeLayer(layer.get("id"));
    }
}

/**
 * Setter for isJustAdded (currently only used in uiStyle = table)
 * @param {Boolean} value Flag if layer has just been added to the tree
 * @returns {void}
 */
Layer.prototype.setIsJustAdded = function (value) {
    this.set("isJustAdded", value);
};

/**
 * Initiates the presentation of layer information.
 * @returns {void}
 */
Layer.prototype.showLayerInformation = function () {
    let cswUrl = null,
        showDocUrl = null,
        layerMetaId = null;

    if (this.get("datasets") && Array.isArray(this.get("datasets")) && this.get("datasets")[0] !== null && typeof this.get("datasets")[0] === "object") {
        cswUrl = this.get("datasets")[0]?.csw_url ? this.get("datasets")[0].csw_url : null;
        showDocUrl = this.get("datasets")[0]?.show_doc_url ? this.get("datasets")[0].show_doc_url : null;
        layerMetaId = this.get("datasets")[0]?.md_id ? this.get("datasets")[0].md_id : null;
    }
    const metaID = [],
        name = this.get("name");

    metaID.push(layerMetaId);

    store.dispatch("LayerInformation/layerInfo", {
        "id": this.get("id"),
        "metaID": layerMetaId,
        "metaIdArray": metaID,
        "layername": name,
        "url": this.get("url"),
        "typ": this.get("typ"),
        "cswUrl": cswUrl,
        "showDocUrl": showDocUrl,
        "urlIsVisible": this.get("urlIsVisible")
    });

    store.dispatch("LayerInformation/activate", true);
    store.dispatch("LayerInformation/additionalSingleLayerInfo");
    store.dispatch("LayerInformation/setMetadataURL", layerMetaId);
    store.dispatch("Legend/setLayerIdForLayerInfo", this.get("id"));
    store.dispatch("Legend/setLayerCounterIdForLayerInfo", Date.now());
    if (typeof this.createLegend === "function") {
        this.createLegend();
    }
    this.setLayerInfoChecked(true);
};

/**
 * Setter for legend, commits the legend to vue store using "Legend/setLegendOnChanged"
 * @param {String} value legend
 * @returns {void}
 */
Layer.prototype.setLegend = function (value) {
    this.set("legend", value);
    store.dispatch("Legend/setLegendOnChanged", value);
};
/**
 * Sets visible min and max resolution on layer.
 * @returns {void}
 */
Layer.prototype.setMinMaxResolutions = function () {
    const resoByMaxScale = bridge.getResoByScale(this.get("maxScale"), "max"),
        resoByMinScale = bridge.getResoByScale(this.get("minScale"), "min");

    this.get("layer").setMaxResolution(resoByMaxScale + (resoByMaxScale / 100));
    this.get("layer").setMinResolution(resoByMinScale);
};

// backbone-relevant functions (may be removed if all layers are no longer backbone models):
Layer.prototype.set = function (arg1, arg2) {
    if (typeof arg1 === "object") {
        Object.keys(arg1).forEach(key => {
            if (key === "isSelected") {
                this.setIsSelected(arg1[key]);
            }
            else if (key === "transparency") {
                this.setTransparency(arg1[key]);
            }
            else {
                this.attributes[key] = arg1[key];
            }
        }, this);
    }
    else if (typeof arg1 === "string") {
        if (arg1 === "isSelected") {
            this.setIsSelected(arg2);
        }
        else {
            this.attributes[arg1] = arg2;
        }
    }
};

Layer.prototype.get = function (key) {
    if (key === "layer") {
        return this.layer;
    }
    else if (key === "layerSource") {
        if (this.attributes.typ === "GROUP") {
            return this.attributes.layerSource;
        }
        return this.layer.getSource();
    }
    return this.attributes[key];
};

Layer.prototype.has = function (key) {
    if (key === "layer") {
        return this.layer !== undefined;
    }
    else if (key === "layerSource") {
        if (this.attributes.typ === "GROUP") {
            return this.attributes.layerSource !== undefined;
        }
        return this.layer.getSource() !== undefined;
    }
    return this.attributes[key] !== undefined;
};

Layer.prototype.getLayerStatesArray = function () {
    return this.layer.getLayerStatesArray();
};

Layer.prototype.toJSON = function () {
    const atts = {...this.attributes};

    delete atts.layerSource;
    delete atts.layers;
    return deepCopy(atts);
};

Layer.prototype.on = function () {
    // do nothing
};
Layer.prototype.off = function () {
    // do nothing
};
Layer.prototype.removeEventListener = function () {
    // do nothing
};
Layer.prototype.addEventListener = function () {
    // do nothing
};
Layer.prototype.trigger = function () {
    // do nothing
};
Layer.prototype.prepareLayerObject = function () {
    // do nothing
};
Layer.prototype.updateSource = function () {
    // do nothing
};
Layer.prototype.setIsActive = function () {
    // do nothing
};