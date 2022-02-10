import Parser from "./parser";
import store from "../../../src/app-store/index";

const DefaultTreeParser = Parser.extend(/** @lends DefaultTreeParser.prototype */{
    /**
     * @class DefaultTreeParser
     * @extends Parser
     * @memberof Core.ConfigLoader
     * @property {String[]} validLayerTypes=["WMS", "SENSORTHINGS", "TERRAIN3D", "TILESET3D", "OBLIQUE"] The layertypes to show in the defaultTree.
     * @fires Core#RadioRequestUtilIsViewMobile
     * @constructs
     */
    defaults: Object.assign({}, Parser.prototype.defaults, {
        validLayerTypes: ["WMS", "SENSORTHINGS", "TERRAIN3D", "TILESET3D", "OBLIQUE"]
    }),

    /**
     * Parses the layer from services.json.
     * @param {Object[]} layerList The layers from services.json.
     * @param {?Object} [layer3dList = null] If given, the list of 3D Layers.
     * @param {?Object} [timeLayerList = null] If given, the list of ids of WMS-T layers.
     * @returns {void}
     */
    parseTree: function (layerList, layer3dList = null, timeLayerList = null) {
        let newLayerList = this.filterValidLayer(this.get("validLayerTypes"), layerList);

        newLayerList = this.removeWmsBySensorThings(newLayerList);
        // Removes all layers that are already displayed in the cache
        newLayerList = this.deleteLayersIncludeCache(newLayerList);

        // For layers with more than 1 dataset, 1 additional layer is created per dataset
        newLayerList = this.createLayerPerDataset(newLayerList);

        this.parseLayerList(newLayerList, layer3dList, timeLayerList);
    },

    /**
     * Filters all objects from the layerList, which are not contained in the validLayerTypes list and are assigned to at least one dataset.
     *
     * @param {String[]} validLayerTypes The valid layerTypes.
     * @param  {Object[]} [layerList = []] The layers from services.json.
     * @return {Object[]} Valid layers from services.json
     */
    filterValidLayer: function (validLayerTypes, layerList = []) {
        return layerList.filter(element => {
            if (!element?.datasets) {
                return false;
            }

            return element?.datasets?.length > 0 && validLayerTypes.includes(element?.typ.toUpperCase());
        });
    },

    /**
     * Removes WMS-Layer containing the same dataset as SensorThings layer, using the attribute related_wms_layers.
     * @param  {Object[]} [layerList=[]] The layers from services.json
     * @returns {Object[]} LayerList without wms duplicates
     */
    removeWmsBySensorThings: function (layerList = []) {
        const sensorThingsLayer = layerList.filter(layer => layer?.typ.toUpperCase() === "SENSORTHINGS"),
            layerListWithoutWmsSDuplicates = [...layerList],
            layerIdsToRemove = this.getWmsLayerIdsToRemove(sensorThingsLayer);

        layerIdsToRemove.forEach(layerIdToRemove => {
            const layerToRemove = layerListWithoutWmsSDuplicates.find(layer => layer.id === layerIdToRemove),
                index = layerListWithoutWmsSDuplicates.indexOf(layerToRemove);

            if (index > -1) {
                layerListWithoutWmsSDuplicates.splice(index, 1);
            }
        });

        return layerListWithoutWmsSDuplicates;
    },

    /**
     * Gets the wms layer ids to remove, using the attribute related_wms_layers.
     * @param {Object[]} [sensorThingsLayer=[]] The sensorThings layers.
     * @returns {Object[]} The wms layer ids to remove.
     */
    getWmsLayerIdsToRemove: function (sensorThingsLayer = []) {
        let layerIdsToRemove = [];

        sensorThingsLayer.forEach(layer => {
            if (layer?.related_wms_layers !== undefined) {
                layerIdsToRemove = layerIdsToRemove.concat(layer.related_wms_layers);
            }
        });

        return layerIdsToRemove;
    },

    /**
     * Removes all layers that are already displayed in the cache.
     * @param  {Object[]} layerList - Objekte from services.json
     * @return {Object[]} layerList - Objekte from services.json
     */
    deleteLayersIncludeCache: function (layerList) {
        const cacheLayerMetaIDs = [],
            cacheLayer = layerList.filter(item => item.cache === true);

        cacheLayer.forEach(layer => {
            cacheLayerMetaIDs.push(layer.datasets[0].md_id);
        });

        return layerList.filter(element => !(cacheLayerMetaIDs.includes(element.datasets[0].md_id) && element.cache === false));
    },

    /**
     * Retrieves all objects with more than one record from the layerList
     * Creates a new layer per dataset
     * @param  {Object[]} layerList - Objekte from services.json
     * @return {Object[]} layerList - Objects from services.json that are assigned to exactly one dataset
     */
    createLayerPerDataset: function (layerList) {
        const layerListPerDataset = layerList.filter(element => element.datasets.length > 1);

        layerListPerDataset.forEach(layer => {
            layer.datasets.forEach((ds, index) => {
                const newLayer = {...layer};

                newLayer.id = layer.id + "_" + index;
                newLayer.datasets = [ds];
                layerList.push(newLayer);
            });
        });
        return layerList.filter(element => element.datasets.length === 1);
    },

    /**
     * Creates the layertree from the Services.json parsed by Rawlayerlist.
     * @param {Object[]} layerList -
     * @param {?Object} layer3dList If not null, the list of 3D Layers.
     * @param {?Object} timeLayerList If not null, the list of ids of WMS-T layers.
     * @returns {void}
     */
    parseLayerList: function (layerList, layer3dList, timeLayerList) {
        const baseLayerIdsPluck = this.get("baselayer").Layer !== undefined ? this.get("baselayer").Layer.map(value => value.id) : [],
            baseLayerIds = Array.isArray(baseLayerIdsPluck) ? baseLayerIdsPluck.reduce((acc, val) => acc.concat(val), []) : baseLayerIdsPluck,
            // Unterscheidung nach Overlay und Baselayer
            typeGroup = Radio.request("Util", "groupBy", layerList, function (layer) {
                if (layer.typ === "Terrain3D" || layer.typ === "TileSet3D" || layer.typ === "Entities3D") {
                    return "layer3d";
                }
                if (layer.typ === "Oblique") {
                    return "oblique";
                }
                if (layer.typ === "WMS" && layer.time) {
                    return "timeLayer";
                }
                return baseLayerIds.includes(layer.id) ? "baselayers" : "overlays";
            });

        // Models für die Hintergrundkarten erzeugen
        this.createBaselayer(layerList);
        // Models für die Fachdaten erzeugen
        this.groupDefaultTreeOverlays(typeGroup.overlays);
        // Models für 3D Daten erzeugen
        this.create3dLayer(typeGroup.layer3d, layer3dList);
        this.createTimeLayer(typeGroup.timeLayer, timeLayerList);
        // Models für Oblique Daten erzeugen
        this.createObliqueLayer(typeGroup.oblique);
    },

    /**
     * todo
     * @param {*} [layerList=[]] - todo
     * @returns {void}
     */
    createObliqueLayer: function (layerList = []) {
        layerList.forEach(layer => {
            this.addItem(Object.assign({type: "layer"}, layer));
        });
    },

    /**
     * todo
     * @param {*} layerList - todo
     * @param {?Object} layer3dList If not null, the list of 3D Layers.
     * @fires Core#RadioRequestUtilIsViewMobile
     * @returns {void}
     */
    create3dLayer: function (layerList, layer3dList) {
        const isMobile = Radio.request("Util", "isViewMobile"),
            isVisibleInTree = isMobile ? "false" : "true";

        let layer3DVisibility,
            layer3DVisible;

        if (layerList && Array.isArray(layerList)) {
            layerList.forEach(layer => {
                if (layer3dList && typeof layer3dList === "object" && layer3dList.Layer && layer3dList.Layer.length > 0) {

                    layer3DVisibility = layer3dList.Layer.filter(layer3D => {
                        return layer3D.id === layer.id;
                    });
                    if (layer3DVisibility[0] !== undefined) {
                        layer3DVisible = layer3DVisibility[0].visibility;
                    }
                }

                this.addItem(Object.assign({
                    type: "layer",
                    parentId: "3d_daten",
                    level: 0,
                    isVisibleInTree: isVisibleInTree,
                    isSelected: layer3DVisible ? layer3DVisible : false
                }, layer));
            });
        }
    },
    /**
     * Creates list entries for each time layer.
     *
     * @param {Object} layerList List of WMS-T layers defined in the config.json.
     * @param {?Object} timeLayerList If not null, the list of ids of WMS-T layers.
     * @returns {void}
     */
    createTimeLayer (layerList, timeLayerList) {
        if (Array.isArray(layerList)) {
            layerList.forEach(layer => {
                const isSelected = timeLayerList?.Layer?.length > 0
                    ? timeLayerList.Layer.find(timeLayer => timeLayer.id === layer.id)?.visibility
                    : false;

                this.addItem(Object.assign({
                    type: "layer",
                    parentId: "TimeLayer",
                    level: 0,
                    isVisibleInTree: true,
                    isSelected
                }, layer));
            });
        }
    },

    /**
     * Creates the base layer items. "newLayer" may be undefined if its id gets removed by function deleteLayersIncludeCache.
     * Then the configured id is not found.
     * @param {Object[]} layerList Layers
     * @returns {void}
     */
    createBaselayer: function (layerList) {
        const baseLayer = this.get("baselayer").Layer !== undefined ? this.get("baselayer").Layer : [];

        baseLayer.forEach(layer => {
            let newLayer;

            if (Array.isArray(layer.id)) {
                newLayer = Object.assign(this.mergeObjectsByIds(layer.id, layerList), Radio.request("Util", "omit", layer, ["id"]));
            }
            else {
                newLayer = Object.assign(layerList.find(singleLayer => singleLayer.id === layer.id), Radio.request("Util", "omit", layer, ["id"]));
            }

            if (newLayer === undefined) {
                console.error("Layer with id: " + layer.id + " cannot be found in layerlist. Possible error: layer got removed in function 'deleteLayersIncludeCache'.");
            }
            else {
                this.addItem(Object.assign({
                    isBaseLayer: true,
                    isVisibleInTree: true,
                    level: 0,
                    parentId: "Baselayer",
                    type: "layer"
                }, newLayer));
            }
        });
    },

    /**
     * subdivide the layers grouped by metaName into folders
     * and layers if a MetaNameGroup has only one entry
     * it should be added as layer and not as folder
     * @param {object} metaNameGroups - todo
     * @param {string} name - todo
     * @returns {object} categories
    */
    splitIntoFolderAndLayer: function (metaNameGroups, name) {
        const folder = [],
            layer = [],
            categories = {};

        Object.entries(metaNameGroups).forEach(metaName => {
            const group = metaName[1],
                groupname = metaName[0];

            // Wenn eine Gruppe mehr als einen Eintrag hat -> Ordner erstellen
            if (Object.keys(group).length > 1) {
                folder.push({
                    name: groupname,
                    layer: group,
                    id: this.createUniqId(groupname)
                });
            }
            else {
                layer.push(group[0]);
            }
            categories.folder = folder;
            categories.layer = layer;
            categories.id = this.createUniqId(name);
            categories.name = name;
        });
        return categories;
    },

    /**
     * Groups layers by category and MetaName
     * @param  {Object} overlays - The technical data as an object
     * @returns {void}
     */
    groupDefaultTreeOverlays: function (overlays) {
        const tree = {},
            categoryGroups = Radio.request("Util", "groupBy", overlays, function (layer) {
                // Gruppierung nach Opendatakategorie
                if (this.get("category") === "Opendata") {
                    return layer.datasets[0].kategorie_opendata[0];
                }
                // Gruppierung nach Inspirekategorie
                else if (this.get("category") === "Inspire") {
                    return layer.datasets[0].kategorie_inspire[0];
                }
                else if (this.get("category") === "Behörde") {
                    return layer.datasets[0].kategorie_organisation;
                }
                return "Nicht zugeordnet";
            }.bind(this));

        // Gruppierung nach MetaName
        Object.entries(categoryGroups).forEach(value => {
            const group = value[1],
                name = value[0],
                metaNameGroups = Radio.request("Util", "groupBy", group, function (layer) {
                    return layer.datasets[0].md_name;
                });

            // in Layer und Ordner unterteilen
            tree[name] = this.splitIntoFolderAndLayer(metaNameGroups, name);
        });
        this.createModelsForDefaultTree(tree);
    },

    /**
     * Creates all models for the DefaultTree
     * @param  {Object} tree tree created from the categories and MetaNames
     * @returns {void}
     */
    createModelsForDefaultTree: function (tree) {
        const sortedKeys = Object.keys(tree).sort(),
            sortedCategories = [],
            isQuickHelpSet = store.getters["QuickHelp/isSet"];

        sortedKeys.forEach(key => {
            sortedCategories.push(tree[key]);
        });
        // Kategorien erzeugen
        this.addItems(sortedCategories, {
            type: "folder",
            parentId: "Overlayer",
            level: 0,
            isInThemen: true,
            isVisibleInTree: true,
            glyphicon: "glyphicon-plus-sign",
            quickHelp: isQuickHelpSet
        });
        Object.keys(tree).forEach(element => {
            const category = tree[element];

            // Unterordner erzeugen
            this.addItems(category.folder, {
                glyphicon: "glyphicon-plus-sign",
                isFolderSelectable: this.get("isFolderSelectable"),
                isInThemen: true,
                isLeafFolder: true,
                level: 1,
                parentId: category.id,
                type: "folder",
                quickHelp: isQuickHelpSet
            });
            category.layer.forEach(layer => {
                layer.name = layer.datasets[0].md_name;
            });
            // Layer dirket in Kategorien
            this.addItems(category.layer, {
                isBaseLayer: false,
                level: 1,
                parentId: category.id,
                type: "layer"
            });
            category.folder.forEach(folder => {
                // Layer in der untertesten Ebene erzeugen
                this.addItems(folder.layer, {
                    isBaseLayer: false,
                    level: 2,
                    parentId: folder.id,
                    type: "layer"
                });
            });
        });
    }
});

export default DefaultTreeParser;
