import ListViewMain from "./listViewMain";
import DesktopThemenFolderView from "./folder/viewTree";
import CatalogFolderView from "./folder/viewCatalog";
import DesktopLayerView from "./layer/view";
import SelectionView from "./layer/viewSelection";
import store from "../../../src/app-store/index";

const ListView = ListViewMain.extend(/** @lends ListView.prototype */{

    /**
     * @class ListView
     * @extends ListViewMain
     * @memberof Menu.Desktop
     * @param {?} args attributes of the model
     * @constructs
     * @fires Core.ModelList#RadioRequestModelListGetCollection
     * @fires Core.ModelList#UpdateLightTree
     * @fires Core#RadioTriggerAutostartInitializedModul
     * @fires Core.ConfigLoader#RadioRequestParserGetItemsByAttributes
     * @fires Core.ConfigLoader#RadioRequestParserGetTreeType
     * @listens Core#RadioTriggerAutostartStartModul
     * @listens Core.ModelList#UpdateOverlayerView
     * @listens Core.ModelList#UpdateSelection
     * @listens Core.ModelList#RenderTree
     */
    initialize: function (args) {
        const channel = Radio.channel("Menu");

        this.collection = Radio.request("ModelList", "getCollection");

        Radio.on("Autostart", "startModul", this.startModul, this);
        this.listenTo(this.collection, {
            "updateOverlayerView": function (parentModel) {
                this.updateOverlayer(parentModel);
                this.setMaxHeightForSelectedLayer();
            },
            "updateSelection": function () {
                this.trigger("updateLightTree");
                this.renderSelectedList();
            },
            "renderTree": function () {
                this.render();
            }
        });
        channel.on({
            "change:isOutOfRange": this.renderSelectedList
        }, this);
        this.listenTo(Radio.channel("Map"), {
            "change": function () {
                this.renderSelectedList();
            }
        });
        let firstTime = true;

        if (args && Object.prototype.hasOwnProperty.call(args, "firstTime")) {
            firstTime = args.firstTime;
        }
        this.renderMain();
        this.render(firstTime);
        this.renderSelectedList();
        Radio.trigger("Autostart", "initializedModule", "tree");
    },

    /**
     * Renders the data to DOM.
     * @param {Boolean} firstTime true, if first time
     * @return {void}
     */
    render: function (firstTime = true) {
        $("#tree").html("");
        // Renders a Theme level
        this.renderSubTree("tree", 0, 0, firstTime);
        $("ul#tree ul#Overlayer").addClass("LayerListMaxHeight");
        $("ul#tree ul#SelectedLayer").addClass("LayerListMaxHeight");
        $("ul#tree ul#Baselayer").addClass("LayerListMaxHeight");
    },

    /**
     * sets the max-height for the selectedLayer
     * @returns {void}
     */
    setMaxHeightForSelectedLayer: function () {
        const overLayerHeight = $("#Overlayer").outerHeight(),
            baseLayerHeight = $("#Baselayer").outerHeight(),
            maxUsedHeight = 0.75,
            maxHeight = Math.ceil($(window).height() * maxUsedHeight),
            availableHeight = (maxHeight - overLayerHeight - baseLayerHeight) * 100 / maxHeight * maxUsedHeight;

        $("#SelectedLayer").css("max-height", availableHeight + "vH");
    },

    /**
     * Renders the selection list
     * @return {void}
     */
    renderSelectedList: function () {

        const selectedLayerModel = this.collection.findWhere({id: "SelectedLayer"}),
            currentMap = Radio.request("Map", "getMapMode");
        let selectedModels;

        $("#SelectedLayer").html("");
        if (selectedLayerModel?.get("isExpanded")) {
            selectedModels = this.collection.where({isSelected: true, type: "layer"});
            selectedModels = selectedModels.filter(model => model.get("name") !== "Oblique");

            selectedModels = selectedModels.filter(model => {
                return model.get("supported").includes(currentMap);
            });
            selectedModels = Radio.request("Util", "sortBy", selectedModels, (model) => model.get("selectionIDX"), this);
            this.addSelectionView(selectedModels);
        }
    },

    /**
     * Renders all themes based on parentId recursively until all levels are reached
     * @param {string} parentId to do
     * @param {number} level to do
     * @param {number} levelLimit to do
     * @param {boolean} firstTime to do
     * @fires Parser#RadioRequestParserGetItemsByAttributes
     * @fires Parser#RadioRequestParserGetTreeType
     * @return {void}
     */
    renderSubTree: function (parentId, level, levelLimit, firstTime) {
        let lightModels = "",
            models = "",
            folders,
            layer;

        if (level > levelLimit) {
            return;
        }

        lightModels = Radio.request("Parser", "getItemsByAttributes", {parentId: parentId});
        models = this.collection.add(lightModels);

        // Ordner öffnen, die initial geöffnet sein sollen
        if (parentId === "tree") {
            models.forEach(model => {
                if (model.get("type") === "folder" && model.get("isInitiallyExpanded")) {
                    model.setIsExpanded(true);
                }
            });
        }

        if (level === 0 && firstTime !== true) {
            this.collection.setVisibleByParentIsExpanded(parentId);
        }

        layer = models.filter(function (model) {
            return model.get("type") === "layer";
        });

        // Layer Atlas sortieren
        if (Radio.request("Parser", "getTreeType") === "default") {
            layer = Radio.request("Util", "sortBy", layer, (item) => item.get("name"), this);
        }
        // Notwendig, da jQuery.after() benutzt werden muss wenn die Layer in den Baum gezeichnet werden, um den Layern auf allen Ebenen die volle Breite des Baumes zu geben
        // Mit jQuery.append würden sie ab der 2. ebene immer mit dem Eltern element zusammen eingerückt werden
        layer.reverse();

        this.addOverlayViews(layer);

        folders = models.filter(function (model) {
            return model.get("type") === "folder";
        });

        if (Radio.request("Parser", "getTreeType") === "default" && parentId !== "Overlayer" && parentId !== "tree") {
            folders = Radio.request("Util", "sortBy", folders, (item) => item.get("name"), this);
        }

        if (parentId !== "Overlayer" && parentId !== "tree") {
            folders.reverse();
        }

        this.addOverlayViews(folders);

        folders.filter(folder => folder.get("isExpanded")).forEach(folder => {
            this.renderSubTree(folder.get("id"), level + 1, levelLimit, false);
        });
    },

    /**
     * Updates Overlayer
     * @param {number} parentModel - parent item
     * @return {void}
     */
    updateOverlayer: function (parentModel) {
        this.renderSubTree(parentModel.get("id"), 0, 10, false);
    },

    /**
     * Add Views to Items based on type
     * @param {number} type to do
     * @param {*} items to do
     * @param {number} parentId ID of the parent item
     * @fires Parser#RadioRequestParserGetTreeType
     * @return {Array} items
     */
    addViewsToItemsOfType: function (type, items, parentId) {
        let viewItems = items.filter(function (model) {
            return model.get("type") === type;
        });

        if (Radio.request("Parser", "getTreeType") === "default" && parentId !== "tree") {
            viewItems = Radio.request("Util", "sortBy", viewItems, (item) => item.get("name"), this);
            if (parentId !== "Overlayer") {
                viewItems.reverse();
            }
        }

        this.addOverlayViews(items);
        return items;
    },

    /**
     * Add Overlay Views
     * @param {Array} models - Array of models
     * @return {void}
     */
    addOverlayViews: function (models) {
        models.forEach(function (model) {
            if (model.get("type") === "folder") {
                model.changeLang();

                // Oberste ebene im Themenbaum?
                if (model.get("parentId") === "tree") {
                    new CatalogFolderView({model: model});
                }
                else {
                    new DesktopThemenFolderView({model: model});
                }
            }
            else if (!model.get("isNeverVisibleInTree")) {
                new DesktopLayerView({model: model});
            }
        }, this);
    },

    /**
     * Add Selection View
     * @param {*} models - todo
     * @return {void}
     */
    addSelectionView: function (models) {
        models.forEach(function (model) {
            if (!model.get("isNeverVisibleInTree")) {
                new SelectionView({model: model});
            }
        }, this);
    },

    /**
     * Start the List View Modul
     * @param {String} modulId to do
     * @return {void}
     */
    startModul: function (modulId) {
        const modul = this.collection.find(function (model) {
            return model.get("id").toLowerCase() === modulId;
        });

        if (modul.get("type") === "tool") {
            modul.setIsActive(true);
            store.dispatch("Tools/setToolActive", {id: modul.id, active: true});
        }
        else {
            $("#" + modulId).parent().addClass("open");
        }
    }
});

export default ListView;
