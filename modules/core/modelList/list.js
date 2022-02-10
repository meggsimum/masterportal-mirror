import WMSLayer from "../../../src/core/layers/wms";
import WFSLayer from "../../../src/core/layers/wfs";
import GroupedLayers from "../../../src/core/layers/group";
import WMSTimeLayer from "../../../src/core/layers/wmsTime";
import WMTSLayer from "../../../src/core/layers/wmts";
import StaticImageLayer from "./layer/staticImage";
import GeoJSONLayer from "./layer/geojson";
import SensorLayer from "./layer/sensor";
import HeatmapLayer from "./layer/heatmap";
import TerrainLayer from "./layer/terrain";
import EntitiesLayer from "./layer/entities";
import TileSetLayer from "./layer/tileset";
import VectorTileLayer from "./layer/vectorTile";
import VectorBaseLayer from "../../../src/core/layers/vectorBase";
import ObliqueLayer from "./layer/oblique";
import Folder from "./folder/model";
import Tool from "./tool/model";
import StaticLink from "./staticlink/model";
import Filter from "../../tools/filter/model";

/**
 * WfsFeatureFilter
 * @deprecated in 3.0.0
 */
import WfsFeatureFilter from "../../wfsFeatureFilter/model";
import TreeFilter from "../../treeFilter/model";
/**
 * ExtendedFilter
 * @deprecated in 3.0.0
 */
import ExtendedFilter from "../../tools/extendedFilter/model";
import FeatureLister from "../../tools/featureLister/model";
import Shadow from "../../tools/shadow/model";
import ParcelSearch from "../../tools/parcelSearch/model";
import StyleWMS from "../../tools/styleWMS/model";
import Viewpoint from "./viewPoint/model";
import VirtualCityModel from "../../tools/virtualCity/model";
import store from "../../../src/app-store/index";
import WfstModel from "../../tools/wfst/model";

const ModelList = Backbone.Collection.extend(/** @lends ModelList.prototype */{
    /**
     * @class ModelList
     * @description Collection that manages all models.
     * Models can be of type folder, layer, staticlink, tool, viewpoint, ...
     * @extends Backbone.Collection
     * @memberof Core.ModelList
     * @constructs
     * @listens ModelList#RadioRequestModelListGetCollection
     * @listens ModelList#RadioRequestModelListGetModelsByAttributes
     * @listens ModelList#RadioRequestModelListGetModelByAttributes
     * @listens ModelList#RadioTriggerModelListSetModelAttributesById
     * @listens ModelList#RadioTriggerModelListShowAllFeatures
     * @listens ModelList#RadioTriggerModelListHideAllFeatures
     * @listens ModelList#RadioTriggerModelListShowFeaturesById
     * @listens ModelList#RadioTriggerModelListRemoveModelsByParentId
     * @listens ModelList#RadioTriggerModelListRemoveModelsById
     * @listens ModelList#RadioTriggerModelListAddInitiallyNeededModels
     * @listens ModelList#RadioTriggerModelListAddModelsByAttributes
     * @listens ModelList#RadioTriggerModelListSetIsSelectedOnChildLayers
     * @listens ModelList#RadioTriggerModelListSetIsSelectedOnParent
     * @listens ModelList#RadioTriggerModelListShowModelInTree
     * @listens ModelList#RadioTriggerModelListCloseAllExpandedFolder
     * @listens ModelList#RadioTriggerModelListSetAllDescendantsInvisible
     * @listens ModelList#RadioTriggerModelListRenderTree
     * @listens ModelList#RadioTriggerModelListToggleDefaultTool
     * @listens ModelList#RadioTriggerModelListReplaceModelById
     * @listens ModelList#RadioTriggerModelListAddAlwaysActiveTool
     * @listens ModelList#ChangeIsVisibleInMap
     * @listens ModelList#ChangeIsExpanded
     * @listens ModelList#ChangeIsSelected
     * @listens ModelList#ChangeTransparency
     * @listens ModelList#ChangeSelectionIDX
     * @fires Map#RadioRequestMapGetMapMode
     * @fires Map#RadioTriggerMapAddLayerToIndex
     * @fires ModelList#RadioTriggerModelListUpdatedSelectedLayerList
     * @fires ModelList#RadioTriggerModelListUpdateVisibleInMapList
     * @fires ModelList#RenderTree
     * @fires ModelList#TraverseTree
     * @fires ModelList#updateOverlayerView
     * @fires ModelList#UpdateOverlayerView
     * @fires ModelList#UpdateSelection
     */
    initialize: function () {
        const channel = Radio.channel("ModelList");

        channel.reply({
            "getCollection": this,
            "getModelsByAttributes": function (attributes) {
                return this.where(attributes);
            },
            "getModelByAttributes": function (attributes) {
                return this.findWhere(attributes) !== undefined ? this.findWhere(attributes) : this.retrieveGroupModel(attributes);
            }
        }, this);

        channel.on({
            "setModelAttributesById": this.setModelAttributesById,
            "showAllFeatures": this.showAllFeatures,
            "hideAllFeatures": this.hideAllFeatures,
            "showFeaturesById": this.showFeaturesById,
            "removeModelsByParentId": this.removeModelsByParentId,
            "removeModelsById": this.removeModelsById,
            "replaceModelById": this.replaceModelById,
            // Initial sichtbare Layer etc.
            "addInitiallyNeededModels": this.addInitiallyNeededModels,
            "addModelsByAttributes": this.addModelsByAttributes,
            "addModel": this.addModel,
            "setIsSelectedOnChildLayers": this.setIsSelectedOnChildLayers,
            "setIsSelectedOnParent": this.setIsSelectedOnParent,
            "showModelInTree": this.showModelInTree,
            "closeAllExpandedFolder": this.closeAllExpandedFolder,
            "setAllDescendantsInvisible": this.setAllDescendantsInvisible,
            "renderTree": function () {
                this.trigger("renderTree");
            },
            "toggleDefaultTool": this.toggleDefaultTool,
            "refreshLightTree": this.refreshLightTree,
            "addAlwaysActiveTool": this.addAlwaysActiveTool,
            "setActiveToolsToFalse": this.setActiveToolsToFalse,
            "updateLayerView": this.updateLayerView,
            "removeLayerById": this.removeLayerById,
            "moveModelInTree": this.moveModelInTree,
            "updateSelection": function (model) {
                this.trigger("updateSelection", model);
            },
            "selectedChanged": this.selectedChanged
        }, this);

        this.listenTo(this, {
            "change:isVisibleInMap": function () {
                channel.trigger("updateVisibleInMapList");
                channel.trigger("updatedSelectedLayerList", this.where({isSelected: true, type: "layer"}));
                // this.sortLayersAndSetIndex();
            },
            "change:isExpanded": function (model) {
                this.trigger("updateOverlayerView", model);
                if (model.get("id") === "SelectedLayer") {
                    this.trigger("updateSelection", model);
                }
                // Trigger for mobile tree traversion
                this.trigger("traverseTree", model);
                channel.trigger("updatedSelectedLayerList", this.where({isSelected: true, type: "layer"}));
            },
            "change:isSelected": this.selectedChanged,
            "change:transparency": function () {
                channel.trigger("updatedSelectedLayerList", this.where({isSelected: true, type: "layer"}));
            },
            "change:selectionIDX": function () {
                channel.trigger("updatedSelectedLayerList", this.where({isSelected: true, type: "layer"}));
            }
        });

        this.listenTo(Radio.channel("Map"), {
            "beforeChange": function (mapMode) {
                if (mapMode === "3D" || mapMode === "Oblique") {
                    this.toggleWfsCluster(false);
                }
                else if (mapMode === "2D") {
                    this.toggleWfsCluster(true);
                }
            }
        });
        this.defaultToolId = Object.prototype.hasOwnProperty.call(Config, "defaultToolId") ? Config.defaultToolId : "gfi";
    },
    defaultToolId: "",
    alwaysActiveTools: [],
    model: function (attrs, options) {
        if (attrs.type === "layer") {
            if (attrs.typ === "WMS") {
                if (attrs.time) {
                    return new WMSTimeLayer(attrs, options);
                }
                return new WMSLayer(attrs);
            }
            else if (attrs.typ === "WMTS") {
                return new WMTSLayer(attrs, options);
            }
            else if (attrs.typ === "WFS") {
                if (attrs.outputFormat === "GeoJSON") {
                    return new GeoJSONLayer(attrs, options);
                }
                return new WFSLayer(attrs, options);
            }
            else if (attrs.typ === "StaticImage") {
                return new StaticImageLayer(attrs, options);
            }
            else if (attrs.typ === "GeoJSON") {
                return new GeoJSONLayer(attrs, options);
            }
            else if (attrs.typ === "GROUP") {
                return new GroupedLayers(attrs, options);
            }
            else if (attrs.typ === "SensorThings") {
                return new SensorLayer(attrs, options);
            }
            else if (attrs.typ === "Heatmap") {
                return new HeatmapLayer(attrs, options);
            }
            else if (attrs.typ === "Terrain3D") {
                return new TerrainLayer(attrs, options);
            }
            else if (attrs.typ === "Entities3D") {
                return new EntitiesLayer(attrs, options);
            }
            else if (attrs.typ === "TileSet3D") {
                return new TileSetLayer(attrs, options);
            }
            else if (attrs.typ === "Oblique") {
                return new ObliqueLayer(attrs, options);
            }
            else if (attrs.typ === "VectorTile") {
                return new VectorTileLayer(attrs, options);
            }
            else if (attrs.typ === "VectorBase") {
                return new VectorBaseLayer(attrs, options);
            }
        }
        else if (attrs.type === "folder") {
            return new Folder(attrs, options);
        }
        else if (attrs.type === "tool") {
            if (attrs.id === "parcelSearch") {
                return new ParcelSearch(attrs, options);
            }
            else if (attrs.id === "styleWMS") {
                return new StyleWMS(attrs, options);
            }
            else if (attrs.id === "filter") {
                return new Filter(attrs, options);
            }
            else if (attrs.id === "shadow") {
                return new Shadow(attrs, options);
            }
            else if (attrs.id === "treeFilter") {
                return new TreeFilter(Object.assign(attrs, Object.prototype.hasOwnProperty.call(Config, "treeConf") ? {treeConf: Config.treeConf} : {}), options);
            }
            /**
             * wfsFeatureFilter
             * @deprecated in 3.0.0
             */
            else if (attrs.id === "wfsFeatureFilter") {
                console.warn("Tool: 'wfsFeatureFilter' is deprecated. Please use 'filter' instead.");
                return new WfsFeatureFilter(attrs, options);
            }
            /**
             * extendedFilter
             * @deprecated in 3.0.0
             */
            else if (attrs.id === "extendedFilter") {
                console.warn("Tool: 'extendedFilter' is deprecated. Please use 'filter' instead.");
                return new ExtendedFilter(Object.assign(attrs, Object.prototype.hasOwnProperty.call(Config, "ignoredKeys") ? {ignoredKeys: Config.ignoredKeys} : {}), options);
            }
            else if (attrs.id === "featureLister") {
                return new FeatureLister(attrs, options);
            }
            else if (attrs.id === "wfst") {
                return new WfstModel(attrs, options);
            }
            else if (attrs.id === "virtualcity") {
                return new VirtualCityModel(attrs, options);
            }
            return new Tool(attrs, options);
        }
        else if (attrs.type === "staticlink") {
            return new StaticLink(attrs, options);
        }
        else if (attrs.type === "viewpoint") {
            return new Viewpoint(attrs, options);
        }
        else {
            Radio.trigger("Alert", "alert", "unbekannter LayerTyp " + attrs.type + ". Bitte wenden Sie sich an einen Administrator!");
        }
        return null;
    },
    /**
     * Returns the default tool of the app
     * @return {Tool} The tool with the same id as the defaultToolId
     */
    getDefaultTool: function () {
        return this.get(this.defaultToolId);
    },

    /**
     * Closes all expanded folders in layertree.
     * @return {void}
     */
    closeAllExpandedFolder: function () {
        const folderModels = this.where({isExpanded: true});

        folderModels.forEach(folderModel => folderModel.setIsExpanded(false));
    },

    /**
     * Sets all models of given parentId visibleInTree=false
     * @param {String} parentId The Id of the parent whose children should be set invisible
     * @return {void}
     */
    setModelsInvisibleByParentId: function (parentId) {
        let children;

        if (parentId === "SelectedLayer") {
            children = this.where({isSelected: true});
        }
        else {
            children = this.where({parentId: parentId});
        }
        children.forEach(item => {
            item.setIsVisibleInTree(false);
        });
    },

    /**
     * Sets all children visible or invisible depending on the parents attribute isExpanded
     * @param {String} parentId The Id of the parent whose children should be set visible
     * @return {void}
     */
    setVisibleByParentIsExpanded: function (parentId) {
        const parent = this.findWhere({id: parentId});

        if (!parent?.get("isExpanded")) {
            this.setAllDescendantsInvisible(parentId, Radio.request("Util", "isViewMobile"));
        }
        else {
            this.setAllDescendantsVisible(parentId);
        }
    },

    /**
     * Sets all models(layer/folder/tools) of a parent id to invisible in the tree
     * in mobile mode folders are closed
     * @param {String} parentId - id of the parent model
     * @param {Boolean} isMobile - is the mobile tree visible
     * @returns {void}
     */
    setAllDescendantsInvisible: function (parentId, isMobile) {
        const additionalChildren =
            this.where({
                isVisibleInTree: true,
                parentId: parentId,
                typ: "GROUP",
                type: "layer"
            });

        let children = this.where({parentId: parentId});

        children = children.concat(additionalChildren);

        children.forEach(child => {
            child.setIsVisibleInTree(false);
            if (child.get("type") === "folder") {
                if (isMobile) {
                    child.setIsExpanded(false, {silent: true});
                }
                this.setAllDescendantsInvisible(child.get("id"), isMobile);
            }
        });
    },

    /**
     * Sets all models(layer/folder/tools) of a parent id to visible in the tree
     * @param {String} parentId - id of the parent model
     * @returns {void}
     */
    setAllDescendantsVisible: function (parentId) {
        const children = this.where({parentId: parentId});

        children.forEach(child => {
            child.setIsVisibleInTree(true);
            if (child.get("type") === "folder" && child.get("isExpanded")) {
                this.setAllDescendantsVisible(child.get("id"));
            }
        });
    },

    /**
     * Sets all models invisible
     * @return {void}
     */
    setAllModelsInvisible: function () {
        this.forEach(function (model) {
            model.setIsVisibleInTree(false);
            if (model.get("type") === "folder") {
                model.setIsExpanded(false, {silent: true});
            }
        });
    },
    /**
     * All layer models of a leaf folder (folder with only layers, and no folders)
     * get selected or deselected based on the parends attribute isSelected
     * @param {Folder} model - folderModel
     * @return {void}
     */
    setIsSelectedOnChildLayers: function (model) {
        const folder = Radio.request("Parser", "getItemsByAttributes", {id: model.get("id")});
        let descendantModels = this.add(Radio.request("Parser", "getItemsByAttributes", {parentId: model.get("id")}));

        // Layers in default tree are always sorted alphabetically while in other tree types, layers are
        // displayed in the order taken from config.json.
        if (Radio.request("Parser", "getTreeType") === "default") {
            descendantModels = this.sortLayers(descendantModels, "name");
        }

        // Since each layer will be put into selected layers list seperately, their order changes because we
        // shift the layers from one stack to another. So just revert the stack order first.
        // This behavior can be avoided setting the invertLayerOrder flag to true.
        if (!Array.isArray(folder) || !folder.length || !folder[0].invertLayerOrder) {
            descendantModels = descendantModels.reverse();
        }

        // Setting each layer as selected will trigger rerender of OL canvas and displayed selected layers.
        descendantModels.forEach(childModel => {
            childModel.setIsSelected(model.get("isSelected"));
        });
    },

    /**
     * Sorts elements from an array by given attribute
     * @param {Layer[]} childModels Layer models to be sorted by
     * @param {String} key Attribute name to be sorted by
     * @returns {Layer[]} sorted Array
     */
    sortLayers: function (childModels, key) {
        return childModels.sort(function (firstChild, secondChild) {
            const firstValue = firstChild.get(key),
                secondValue = secondChild.get(key);

            let direction;

            if (firstValue < secondValue) {
                direction = -1;
            }
            else if (firstValue > secondValue) {
                direction = 1;
            }
            else {
                direction = 0;
            }

            return direction;
        });
    },

    /**
     * Checks if all layers in a leaffolder (folder with only layers and no other folders) are selected.
     * If so, the leaf folder is also set to isSelected=true
     * @param {Layer} model Layer model
     * @return {void}
     */
    setIsSelectedOnParent: function (model) {
        const layers = this.where({parentId: model.get("parentId")}),
            folderModel = this.findWhere({id: model.get("parentId")}),
            allLayersSelected = layers.every(layer => layer.get("isSelected") === true);

        if (allLayersSelected === true) {
            folderModel.setIsSelected(true);
        }
        else {
            folderModel.setIsSelected(false);
        }
    },

    /**
     * Sets all Tools (except the legend, the given tool and the gfi,
     * if the model attribute deactivateGFI is true) to isActive=false
     * @param {Tool} activatedToolModel Model of the Tool (Backbone) or the state of the Tool (Vue).
     * @returns {void}
     */
    setActiveToolsToFalse: function (activatedToolModel) {
        const legendModel = this.findWhere({id: "legend"}),
            activeTools = this.where({isActive: true}),
            activatedToolModels = Array.isArray(activatedToolModel) ? activatedToolModel : [activatedToolModel],
            alwaysActiveTools = [...activatedToolModels, ...this.alwaysActiveTools, legendModel],
            deactivateGFI = typeof activatedToolModel.get === "function"
                ? activatedToolModel.get("deactivateGFI")
                : activatedToolModel.deactivateGFI;
        let activeToolsToDeactivate = [];

        if (!deactivateGFI) {
            alwaysActiveTools.push(this.findWhere({id: "gfi"}));
        }

        activeToolsToDeactivate = activeTools.filter(tool => !alwaysActiveTools.includes(tool));
        activeToolsToDeactivate.forEach((tool) => {
            tool.setIsActive(false);
            store.dispatch("Tools/setToolActive", {id: tool.id, active: false});
        });
    },

    /**
     * Sets the default tool to active if no other tool (except the legend) is active
     * @return {void}
     */
    toggleDefaultTool: function () {
        const legendModel = this.findWhere({id: "legend"}),
            defaultTool = this.getDefaultTool();
        let activeTools = this.where({isActive: true});

        activeTools = activeTools.filter(tool => tool !== legendModel);
        if (activeTools.length === 0 && defaultTool !== undefined) {
            defaultTool.setIsActive(true);
            store.dispatch("Tools/setToolActive", {id: defaultTool.id, active: true});
        }
    },

    /**
     * Moves layer in Tree and accordingly changes drawing index. Always swaps index with target Layer.
     * If no target layer is found, the action is aborted.
     * @param  {Layer} model Layer model to be pulled up
     * @param  {Integer} movement Direction and range to move
     * @fires ModelList#UpdateSelection
     * @fires ModelList#UpdateLightTree
     * @fires ModelList#ChangeSelectedList
     * @return {void}
     */
    moveModelInTree: function (model, movement) {
        const currentSelectionIdx = model.get("selectionIDX"),
            newSelectionIndex = currentSelectionIdx + movement;

        let modelToSwap = this.where({selectionIDX: newSelectionIndex});

        // Do not move models when no model to swap is found.
        // There are hidden models such as "oblique" at selectionIDX 0, causing modelToSwap array to be not
        // empty although it should be. That's why newSelectionIndex <= 0 is also checked.
        if (newSelectionIndex <= 0 || !modelToSwap || modelToSwap.length === 0) {
            return;
        }

        modelToSwap = modelToSwap[0];

        model.setSelectionIDX(newSelectionIndex);
        modelToSwap.setSelectionIDX(currentSelectionIdx);

        this.updateLayerView();

        this.trigger("updateSelection");
        this.trigger("updateLightTree");
        // Trigger for mobile
        this.trigger("changeSelectedList");
    },

    /**
     * Sets Layer indeces initially. Background layers are treatet seperatly from normal layers to ensure
     * they will be put into background, if they haven't been defined in the URL Parameters array.
     * @param  {array} paramLayers The Layer Array according the URL Parameters
     * @return {void}
     */
    initLayerIndeces: function (paramLayers) {
        const allLayerModels = this.getTreeLayers(),
            baseLayerModels = allLayerModels.filter(layerModel => {
                return layerModel.get("isBaseLayer") === true && paramLayers.find(model => {
                    return model.id === layerModel.id;
                }) === undefined;
            }),
            layerModels = allLayerModels.filter(layerModel => {
                return layerModel.get("isBaseLayer") !== true || paramLayers.find(model => {
                    return model.id === layerModel.id;
                }) !== undefined;
            }),
            treeType = Radio.request("Parser", "getTreeType");

        let initialLayers = [];

        // if the treeType is custom, handle sorting according to layerSequence
        if (treeType === "custom" && layerModels.find(layer => layer.get("layerSequence"))) {
            initialLayers = this.handleLayerSequence(allLayerModels);
        }
        else if (treeType === "light") {
            layerModels.forEach(layer => {
                const index = allLayerModels.indexOf(layer);

                if (index > -1) {
                    baseLayerModels.splice(index, 0, layer);
                }
                else {
                    baseLayerModels.push(layer);
                }
            });
            initialLayers = baseLayerModels;
        }
        else {
            initialLayers = baseLayerModels.concat(layerModels);
        }
        this.resetLayerIndeces(initialLayers);
    },

    /**
     * inserts a new layer at the correct position in an array
     * @param {Object[]} layers - sorted array with layers
     * @param {Object} newLayer - layer to insert in array
     * @return {Object[]} layers - sorted array with the new layer
     */
    addNewLayerToSequence: function (layers, newLayer) {
        let layerIndex;

        // newLayer must be inserted before first layer in sorted array that has a smaller layerSequence value
        if (layers.length > 0 && layers.find(layer => layer.get("layerSequence") < newLayer.get("layerSequence")) !== undefined) {
            layerIndex = layers.findIndex(layer => layer.get("layerSequence") < newLayer.get("layerSequence"));
            layers.splice(layerIndex, 0, newLayer);
        }
        // if there is no scmaller layerSequence value, insert newLayer at the end of the array
        else {
            layers.push(newLayer);
        }

        return layers;
    },

    /**
     * Sets Layer indeces initially. Background layers are treatet seperatly from normal layers to ensure
     * they will be put into background.
     * @param  {array} layers Array of layers to have their indeces reset
     * @return {array} Layers with fresh new indeces
     */
    resetLayerIndeces: function (layers) {
        // we start indexing at 1 because 0 is defined as newly selected layer
        layers.forEach((oLayerModel, newSelectionIndex) => {
            oLayerModel.setSelectionIDX(newSelectionIndex + 1);
        });
        return layers;
    },

    /**
     * Fetches all selected layers. For light tree, these are all layers of the tree. for custom tree, these
     * are only the ones listed under selected layers.
     * @fires Parser#RadioRequestParserGetTreeType
     * @return {array} Selected Layers
     */
    getTreeLayers: function () {
        const treeType = Radio.request("Parser", "getTreeType");
        let allLayerModels = this.where({type: "layer"});

        // we dont want to see these layers in the tree
        allLayerModels = allLayerModels.filter(layerModel => {
            return ["Oblique", "TileSet3D", "Terrain3D"].indexOf(layerModel.get("typ")) === -1;
        });

        // in custom tree, only selected layers are sortable, thus only those may get an index
        if (treeType !== "light") {
            allLayerModels = allLayerModels.filter(layerModel => {
                return layerModel.get("isSelected");
            });
        }

        return allLayerModels;
    },

    /**
     * Fetches all selected layers. For light tree, these are all layers of the tree. for custom tree, these
     * are only the ones listed under selected layers.
     * @return {array} Sorted selected Layers
     */
    getSortedTreeLayers: function () {
        const combinedLayers = this.getTreeLayers(),
            newLayers = combinedLayers.filter(layer => layer.get("selectionIDX") === 0),
            treeType = Radio.request("Parser", "getTreeType");

        // we need to devide current layers from newly added ones to be able to put the latter ones in
        // at a nice position
        let currentLayers = combinedLayers.filter(layer => layer.get("selectionIDX") !== 0),
            firstBaseLayerIndex;

        // first just sort all current layers
        currentLayers.sort(function (layer1, layer2) {
            return layer1.get("selectionIDX") > layer2.get("selectionIDX") ? 1 : -1;
        });

        // if the treeType is custom, handle sorting according to layerSequence
        if (treeType === "custom" && combinedLayers.find(layer => layer.get("layerSequence"))) {
            currentLayers = this.handleLayerSequence(combinedLayers, currentLayers, newLayers);
        }
        else {
            // following 3 steps must be done seperately because during this process, number of array entries
            // and therefore its indeces will be changing
            // ---
            // 1: push all new normal layers, so they will be displayed on top
            newLayers.forEach(newLayer => {
                if (!newLayer.get("isBaseLayer")) {
                    currentLayers.push(newLayer);
                }
            });
            // 2: now find the index, at which background layers should be inserted
            currentLayers.forEach((currentLayer, currentIndex) => {
                if (currentLayer.get("isBaseLayer")) {
                    firstBaseLayerIndex = currentIndex;
                }
            });
            // 3: push all new background layers
            newLayers.forEach(newLayer => {
                if (newLayer.get("isBaseLayer")) {
                    currentLayers.splice(firstBaseLayerIndex + 1, 0, newLayer);
                }
            });
        }

        // finally, reset all layer indeces, so that the new layers also become part of this nice layer stack
        currentLayers = this.resetLayerIndeces(currentLayers);

        return currentLayers;
    },

    /**
     * handles the sorting of the layerSequence paramter
     * @param {Object[]} combinedLayers Combination of previously active and newly activated layers
     * @param {Object[]} currentLayers previously active layers
     * @param {Object[]} newLayers newly activated layers
     * @returns {Object[]} sortedLayers - Layers sorted by layerSequence
     */
    handleLayerSequence: function (combinedLayers, currentLayers, newLayers) {
        const layerWithSequence = combinedLayers.find(layer => {
                return layer.get("layerSequence");
            }),
            previousLayers = currentLayers !== undefined ? currentLayers : [];
        let sortedLayers = combinedLayers,
            numberOfLayerWithSequence = 0,
            layersToAdd = newLayers !== undefined ? newLayers : [];

        // how many of the previously active layers have the paramter layerSequence?
        previousLayers.forEach(layer => {
            if (layer.get("layerSequence") !== undefined) {
                numberOfLayerWithSequence += 1;
            }
        });

        // check if all layers already got a layerSequence parameter, or if it is the initial call
        if (previousLayers.length === 0 || numberOfLayerWithSequence !== previousLayers.length) {
            if (layerWithSequence !== undefined && typeof layerWithSequence === "object") {
                sortedLayers = this.sortLayerSequence(this.addLayerSequence(combinedLayers));
            }
        }
        // add new layer
        else if (numberOfLayerWithSequence === previousLayers.length && layersToAdd.length > 0) {
            layersToAdd = this.addLayerSequence(layersToAdd);
            layersToAdd.forEach(newLayer => {
                sortedLayers = this.addNewLayerToSequence(previousLayers, newLayer);
            });
        }
        else {
            sortedLayers = this.sortLayerSequence(sortedLayers);
        }
        return sortedLayers;
    },

    /**
     * Gives all passed layers a layerSequence, if they don't have one
     * @param {Object[]} layers - layer, that should get a layerSequence
     * @returns {Object[]} layers - layers with layerSequence
     */
    addLayerSequence: function (layers) {
        let baseLayerSequence = 1000;

        layers.forEach(layer => {
            if (!layer.get("isBaseLayer") && layer.get("layerSequence") === undefined) {
                layer.set("layerSequence", 1000);
            }
            else if (layer.get("isBaseLayer") && layer.get("layerSequence") === undefined) {
                baseLayerSequence += 1;
                layer.set("layerSequence", baseLayerSequence);
            }
        });

        return layers;
    },

    /**
     * sorts passed layers according to the layerSequence
     * @param {Object[]} layers - layers
     * @returns {Object[]} sortedLayers - sorted layers
     */
    sortLayerSequence: function (layers) {
        let sortedLayers = [];

        layers.forEach(layer => {
            sortedLayers = this.addNewLayerToSequence(sortedLayers, layer);
        });

        return sortedLayers;
    },

    /**
     * Forces rerendering of all layers. Layers are sorted before rerender.
     * @fires Map#RadioTriggerMapAddLayerToIndex
     * @return {void}
     */
    updateLayerView: function () {
        const sortedLayers = this.getSortedTreeLayers();

        sortedLayers.forEach(layer => {
            Radio.trigger("Map", "addLayerToIndex", [layer.get("layer"), layer.get("selectionIDX"), layer.get("layerSequence")]);
        });
    },

    /**
     * Sets all models that are of type "layer" the attribute isSettingVisible to given value
     * @param {Boolean} value Flag if settings have to be visible
     * @return {void}
     */
    setIsSettingVisible: function (value) {
        const models = this.where({type: "layer"});

        models.forEach(model => {
            model.setIsSettingVisible(value);
        });
    },

    /**
     * Adds in light tree mode all layer models. Otherwise only the layers are added that are initially set to visible
     * @fires ParametricUrl#RadioRequestParametricURLGetLayerParams
     * @fires Parser#RadioRequestParserGetTreeType
     * @fires Parser#RadioRequestParserGetItemsByAttributes
     * @fires Parser#RadioRequestParserGetItemByAttributes
     * @return {void}
     */
    addInitiallyNeededModels: function () {
        // lighttree: Alle models gleich hinzufügen, weil es nicht viele sind und sie direkt einen Selection index
        // benötigen, der ihre Reihenfolge in der Config Json entspricht und nicht der Reihenfolge
        // wie sie hinzugefügt werden
        const paramLayers = store.state.urlParams && store.state.urlParams["Map/layerIds"] ? store.state.urlParams["Map/layerIds"] : [],
            treeType = Radio.request("Parser", "getTreeType");

        let lightModels,
            itemIsVisibleInMap,
            lightModel;

        if (treeType === "light") {
            lightModels = Radio.request("Parser", "getItemsByAttributes", {type: "layer"});
            lightModels = this.mergeParamsToLightModels(lightModels, paramLayers);

            lightModels.forEach(model => {
                if (Object.prototype.hasOwnProperty.call(model, "children")) {
                    if (model.children.length > 0) {
                        this.add(model);
                    }
                }
                else {
                    this.add(model);
                }
            }, this);
        }
        else if (paramLayers.length > 0) {
            itemIsVisibleInMap = Radio.request("Parser", "getItemsByAttributes", {isVisibleInMap: true});
            itemIsVisibleInMap.forEach(layer => {
                layer.isVisibleInMap = false;
                layer.isSelected = false;
            });

            paramLayers.forEach(paramLayer => {
                lightModel = Radio.request("Parser", "getItemByAttributes", {id: paramLayer.id});

                if (lightModel !== undefined) {
                    this.add(lightModel);
                    this.setModelAttributesById(paramLayer.id, {isSelected: true, transparency: paramLayer.transparency});
                    // selektierte Layer werden automatisch sichtbar geschaltet, daher muss hier nochmal der Layer auf nicht sichtbar gestellt werden
                    if (paramLayer.visibility === false && this.get(paramLayer.id) !== undefined) {
                        this.get(paramLayer.id).setIsVisibleInMap(false);
                    }
                }
            });
            this.addModelsByAttributes({typ: "Oblique"});
        }
        else {
            this.addModelsByAttributes({type: "layer", isSelected: true});
            this.addModelsByAttributes({typ: "Oblique"});
        }

        this.initLayerIndeces(paramLayers);
        this.updateLayerView();
    },

    /**
     * Merges layer config parameters to light models
     * @param  {Object[]} lightModels Light models requested from Parser
     * @param  {Object[]} paramLayers Parameters from parametric url
     * @return {Object[]} Light models with merged parameters
     */
    mergeParamsToLightModels: function (lightModels, paramLayers) {
        lightModels.reverse();
        // Merge die parametrisierten Einstellungen an die geparsten Models
        if (paramLayers !== undefined && paramLayers.length !== 0) {
            lightModels.forEach(lightModel => {
                const hit = paramLayers.find(paramLayer => paramLayer.id === lightModel.id);

                if (hit) {
                    Object.assign(lightModel, hit);
                    lightModel.isSelected = hit.visibility;
                }
                else {
                    lightModel.isSelected = false;
                }
            });
        }
        return lightModels;
    },

    /**
     * Sets Attributes to model with given id
     * @param {String} id Id of the model where the attributes have to be added
     * @param {Object} attrs Attributes to be added
     * @return {void}
     */
    setModelAttributesById: function (id, attrs) {
        const model = this.get(id);

        if (model !== undefined) {
            model.set(attrs);
        }
    },

    /**
     * Adds an existing model to the collection ignoring the Parser
     * @param {Backbone.Model} model model to add
     * @returns {void}
     */
    addModel: function (model) {
        this.add(model);
    },

    /**
     * Requests the light models from the parser by attributes and adds them to the collection
     * @param {Object} attrs Attributes of which the model to be added is requested from the parser and added to the collection
     * @fires Parser#RadioRequestparserGetItemsByAttributes
     * @return {void}
     */
    addModelsByAttributes: function (attrs) {
        const lightModels = Radio.request("Parser", "getItemsByAttributes", attrs);

        lightModels.forEach(model => this.add(model));
        this.updateLayerView();
    },

    /**
     * Opens the layertree, selects the layer model and adds it to selection
     * Gets called from searchbar
     * @param {String} modelId Id of the layer model
     * @fires Core#RadioRequestMapGetMapMode
     * @fires Core.ConfigLoader#RadioRequestParserGetItemByAttributes
     * @return {void}
     */
    showModelInTree: function (modelId) {
        const mode = Radio.request("Map", "getMapMode"),
            lightModel = Radio.request("Parser", "getItemByAttributes", {id: modelId});

        this.closeAllExpandedFolder();
        // open the layerTree
        $("#root li:first-child").addClass("open");
        // Parent and possible siblings are added
        this.addAndExpandModelsRecursive(lightModel.parentId);
        if (this.get(modelId).get("supported").indexOf(mode) >= 0) {
            this.setModelAttributesById(modelId, {isSelected: true});
        }

        if (lightModel.parentId !== "Baselayer") {
            this.scrollToLayer(lightModel.name);
        }

        // für DIPAS Table Ansicht
        if (Radio.request("Util", "getUiStyle") === "TABLE") {
            Radio.request("ModelList", "getModelByAttributes", {id: modelId}).setIsJustAdded(true);
            $("#table-nav-layers-panel").collapse("show");

        }
    },

    /**
     * Scrolls to layer in layerTree
     * @param {String} overlayerName Name of Layer in "Overlayer" to be scrolled to
     * @return {void}
     */
    scrollToLayer: function (overlayerName) {
        const $Overlayer = $("#Overlayer"),
            element = $Overlayer.find("span").toArray().find(layer => layer.title === overlayerName);

        let overlayOffsetToTop,
            overlayerHeight,
            elementOffsetFromTop,
            targetPosition,
            offset;

        if (element !== undefined) {
            overlayOffsetToTop = $Overlayer.offset().top;
            overlayerHeight = $Overlayer.height();
            elementOffsetFromTop = element ? $(element).offset().top : null;
            targetPosition = overlayOffsetToTop + overlayerHeight / 2;
            offset = elementOffsetFromTop - targetPosition;

            $("#Overlayer").animate({
                scrollTop: offset
            }, "fast");
        }
    },

    /**
     * Recursive method thats starts from the bottom of the layer tree
     * Adds all models with same parentId. Then calls itself with the parentId, and so on
     * expands the parend models
     * @param {String} parentId All layer models with this parentId are added
     * @fires Parser#RadioRequestParserGetItemsByAttributes
     * @fires Parser#RadioRequestParserGetItemByAttributes
     * @return {void}
     */
    addAndExpandModelsRecursive: function (parentId) {
        const lightSiblingsModels = Radio.request("Parser", "getItemsByAttributes", {parentId: parentId}),
            parentModel = Radio.request("Parser", "getItemByAttributes", {id: lightSiblingsModels[0].parentId});

        this.add(lightSiblingsModels);
        // Abbruchbedingung
        if (parentModel !== undefined && parentModel.id !== "tree") {
            this.addAndExpandModelsRecursive(parentModel.parentId);
            this.get(parentModel.id).setIsExpanded(true);
        }
    },

    /**
     * Toggles the layer catalogues.
     * Every catalogue that has neither the given id, nor has isAlwaysExpanded=true gets collapsed
     * @param {String} id Id of the catalogue
     * @return {void}
     */
    toggleCatalogs: function (id) {
        this.where({parentId: "tree"}).forEach(model => {
            if (model.get("id") !== id && !model.get("isAlwaysExpanded")) {
                model.setIsExpanded(false);
            }
        });
    },

    /**
     * Removes all layer models from the map
     * @param {String} parentId Id of the parent folder
     * @return {void}
     */
    removeModelsByParentId: function (parentId) {
        this.where({parentId: parentId}).forEach(model => {
            if (model.get("type") === "layer" && model.get("isVisibleInMap") === true) {
                model.setIsVisibleInMap(false);
            }
            model.setIsVisibleInTree(false);

            this.remove(model);
        });
    },

    /**
     * replaces a model by a given id
     * @param  {String} id from model that be replaced in ModelList
     * @param  {Object} newModel to add to the ModelList
     * @return {void}
     */
    replaceModelById: function (id, newModel) {
        const model = this.get(id);
        let index = 0;

        if (model) {
            index = this.indexOf(model);
            this.remove(model);
            this.add(newModel, {at: index});
            this.updateLayerView();
        }
    },
    /**
     * remove a model by a given id
     * @param  {String} id from model that be remove from ModelList
     * @return {void}
     */
    removeModelsById: function (id) {
        const model = this.get(id);

        this.remove(model);
        this.updateLayerView();
    },

    /**
     * Delivers groupModel by a given id
     * @param {Object|Number} attributes the id from model
     * @returns {Object} model
     */
    retrieveGroupModel: function (attributes) {
        const layerId = typeof attributes === "object" ? attributes.id : attributes,
            groupModels = this.filter(function (model) {
                return model.get("typ") === "GROUP";
            });

        return groupModels.find(groupModel => {
            return groupModel.get("children").find(child => {
                return child.id === layerId;
            });
        });
    },

    /**
     * Shows all features of the vector layer model
     * @param  {String} id Id of the layer whose features have to be shown
     * @return {void}
     */
    showAllFeatures: function (id) {
        const model = this.getModelById(id);

        model.showAllFeatures();
    },

    /**
     * Shows all features of the vector layer model that match the given featureIds
     * @param  {String} id Id of vector layer model
     * @param  {String[]} featureIds Array of feature ids to be shown
     * @return {void}
     */
    showFeaturesById: function (id, featureIds) {
        const model = this.getModelById(id);

        model.showFeaturesByIds(featureIds);
    },

    /**
     * Hides all features of the vector layer model
     * @param  {String} id Id of the vector layer model
     * @return {void}
     */
    hideAllFeatures: function (id) {
        const model = this.getModelById(id);

        model.hideAllFeatures();
    },

    /**
     * Removes layer from Collection
     * @param {String} id LayerId to be removed
     * @return {void}
     */
    removeLayerById: function (id) {
        this.remove(id);
    },

    /**
     * Returns layer model by given id
     * @param {String} id Id of model to be returned
     * @returns {Layer} model
     */
    getModelById: function (id) {
        let model = this.get(id);

        if (model === undefined || model instanceof GroupedLayers) {
            model = this.retrieveGroupModel(id).get("layerSource").find(child => child.get("id") === id);
        }
        return model;
    },

    /**
     * Sets all clustered vector layer models  the attribute isClustered to given value
     * Is used when changing the map mode
     * In 3D mode features cannot be clustered
     * @param {Boolean} value Flag if layer should be clustered or not
     * @returns {void}
     */
    toggleWfsCluster: function (value) {
        const clusterModels = this.filter(function (model) {
            return model.has("clusterDistance");
        });

        clusterModels.forEach(function (layer) {
            if (layer.get("layer")) {
                layer.set("isClustered", value);
                layer.styling(value);
                layer.get("layer").setStyle(layer.get("style"));
            }
        });
    },

    /**
     * todo
     * @returns {void}
     */
    refreshLightTree: function () {
        this.trigger("updateLightTree");
    },

    /**
     * returns all layers of this collection, which can be sorted like WMS, usw.
     * @returns {Array<Layer>} list of layers which can be sorted visibly
     */
    getIndexedLayers: function () {
        return this.filter(function (model) {
            return model.get("type") === "layer" &&
                model.get("typ") !== "Terrain3D" &&
                model.get("typ") !== "TileSet3D" &&
                model.get("typ") !== "Entities3D" &&
                model.get("typ") !== "Oblique";
        });
    },
    addAlwaysActiveTool: function (model) {
        this.alwaysActiveTools.push(model);
    },

    /**
     * Updates the selected layersList if selected is changed.
     * @param {Object} model The model.
     * @param {Boolean} value Is selected value.
     * @returns {void}
     */
    selectedChanged: function (model, value) {
        if (model.get("type") === "layer") {
            model.setIsVisibleInMap(value);
            this.updateLayerView();
        }
        this.trigger("updateSelection");
        Radio.channel("ModelList").trigger("updateVisibleInMapList");
        Radio.channel("ModelList").trigger("updatedSelectedLayerList", this.where({isSelected: true, type: "layer"}));
    }
});

export default ModelList;
