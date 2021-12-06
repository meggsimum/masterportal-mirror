const Item = Backbone.Model.extend(/** @lends Item.prototype */{
    /**
     * @class Item
     * @description Module to represent any Item (Folder, Tool, Layer, ...)
     * @extends Backbone.Model
     * @memberof Core.ModelList
     * @constructs
     * @property {String} name="" Name of item
     * @property {String} id="" Id of item
     * @property {String} parentId="" Parent id of item
     * @property {String} type="" Type of item: folder/layer/tool/staticlink
     * @property {String} title="no title defined" Title of item to be displayed
     * @property {String} icon="" Bootstrap icon class of item
     * @property {Boolean} isInThemen=false Flag if item is in layer tree
     * @property {Number} level=0 Level of selected layer
     * @property {Boolean} isVisibleInTree=false Flag if item is initially visible in layer tree
     */
    defaults: {
        name: "",
        id: "",
        parentId: "",
        type: "",
        title: "no title defined",
        icon: "",
        isInThemen: false,
        level: 0,
        isVisibleInTree: false
    },
    /**
     * Setter for id
     * @param {String} value Id
     * @returns {void}
     */
    setId: function (value) {
        this.set("id", value);
    },

    /**
     * Setter for parentId
     * @param {String} value ParentId
     * @returns {void}
     */
    setParentId: function (value) {
        this.set("parentId", value);
    },

    /**
     * Setter for name
     * @param {String} value Name
     * @returns {void}
     */
    setName: function (value) {
        this.set("name", value);
    },
    /**
     * Setter for type
     * @param {String} value Type
     * @returns {void}
     */
    setType: function (value) {
        return this.set("type", value);
    },

    /**
     * Setter for icon
     * @param {String} value Icon
     * @returns {void}
     */
    setIcon: function (value) {
        return this.set("icon", value);
    },

    /**
     * Setter for isInThemen
     * @param {Boolean} value Flag if item is in themen
     * @returns {void}
     */
    setIsInThemen: function (value) {
        this.set("isInThemen", value);
    },

    /**
     * Setter for level
     * @param {String} value Level
     * @returns {void}
     */
    setLevel: function (value) {
        this.set("level", value);
    },

    /**
     * Setter for isVisibleInTree
     * @param {Boolean} value Flag if item is visible in layertree
     * @returns {void}
     */
    setIsVisibleInTree: function (value) {
        this.set("isVisibleInTree", value);
    },

    /**
     * Setter for setIsVisibleInMenu
     * @param {Boolean} value Flag if item is visible in menu
     * @returns {void}
     */
    setIsVisibleInMenu: function (value) {
        this.set("isVisibleInMenu", value);
    }
});

export default Item;
