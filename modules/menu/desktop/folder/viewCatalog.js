import CatalogTemplate from "text-loader!./templateCatalog.html";
import store from "../../../../src/app-store";
import Dropdown from "bootstrap/js/dist/dropdown";

/**
 * @member CatalogTemplate
 * @description Template used to create the Catalog View
 * @memberof Menu.Desktop.Folder
 */

const FolderCatalogView = Backbone.View.extend(/** @lends FolderCatalogView.prototype */{
    events: {
        "change select": "setSelection",
        "keydown .form-select": function (event) {
            event.stopPropagation();
        },
        "click .header > a > .bootstrap-icon, .header > a > .form-label": "toggleIsExpanded",
        "keydown .header > a": "keyAction",

        "click .Baselayer .catalog_buttons .question-icon": function () {
            this.openHelp();
        },
        "keydown .Baselayer .catalog_buttons .question-icon": function (event) {
            this.handleKeyboardTriggeredAction(event, "openHelp");
        },

        "click .background-icon": "toggleBackground",
        "keydown .background-icon": function (event) {
            this.handleKeyboardTriggeredAction(event, "toggleBackground");
        },

        "click .rotate-pin": "unfixTree",
        "keydown .rotate-pin": function (event) {
            this.handleKeyboardTriggeredAction(event, "unfixTree");
        },

        "click .rotate-pin-back": "fixTree",
        "keydown .rotate-pin-back": function (event) {
            this.handleKeyboardTriggeredAction(event, "fixTree");
        },

        "click .layer-selection-save": "saveSelection",
        "keydown .layer-selection-save": function (event) {
            this.handleKeyboardTriggeredAction(event, "saveSelection");
        }
    },

    /**
     * @class FolderCatalogView
     * @extends Backbone.View
     * @memberof Menu.Desktop.Folder
     * @constructs
     * @listens Core#RadioTriggerMapChange
     * @listens Menu.Desktop.Folder#changeIsExpanded
     * @listens Menu.Desktop.Folder#isVisibleInTree
     * @fires Menu.Desktop.Folder#toggleIsExpanded
     * @fires Menu.Desktop.Folder#setSelection
     * @fires Menu.Desktop.Folder#toggleBackground
     * @fires Menu.Desktop.Folder#unfixTree
     * @fires Menu.Desktop.Folder#fixTree
     * @fires Core#RadioTriggerMapViewToggleBackground
     * @fires Core#RadioRequestMapGetMapMode
     * @fires Core.ConfigLoader#RadioRequestParserGetTreeType
     * @fires Core.ConfigLoader#RadioRequestParserGetCategory
     * @fires Core.ConfigLoader#RadioRequestParserGetCategories
     * @fires Core.ConfigLoader#RadioRequestParserGetItemByAttributes
     * @fires Core.ConfigLoader#RadioRequestParserSetCategory
     */
    initialize: function () {
        this.listenTo(Radio.channel("Map"), {
            "change": function (mode) {
                if (mode === "Oblique") {
                    this.model.setIsExpanded(false);
                }
                this.togle3dCatalog(mode);
            }
        });
        this.listenTo(this.model, {
            "change:isExpanded": this.toggleIcon
        }, this);
        this.$el.on({
            click: function (e) {
                e.stopPropagation();
            }
        });
        this.render();
        this.togle3dCatalog(Radio.request("Map", "getMapMode"));
    },
    tagName: "li",
    className: "layer-catalog",
    template: _.template(CatalogTemplate),

    /**
     * Renders the data to DOM.
     * @fires Core.ConfigLoader#RadioRequestParserGetTreeType
     * @fires Core.ConfigLoader#RadioRequestParserGetCategory
     * @fires Core.ConfigLoader#RadioRequestParserGetCategories
     * @fires Core.ConfigLoader#RadioRequestParserGetItemByAttributes
     * @return {FolderCatalogView} returns this
     */
    render: function () {
        const attr = this.model.toJSON();

        attr.treeType = Radio.request("Parser", "getTreeType");
        attr.category = Radio.request("Parser", "getCategory");
        attr.categories = Radio.request("Parser", "getCategories");
        attr.backgroundImage = Radio.request("MapView", "getBackgroundImage");
        this.$el.find(".header").toggleClass("closed");
        $("#" + this.model.get("parentId")).append(this.$el.html(this.template(attr)));
        if (attr.isPinned) {
            this.fixTree();
        }
        if (attr.isExpanded) {
            // to provoke reaction of listener ModelList#ChangeIsExpanded
            this.model.setIsExpanded(false);
            this.model.setIsExpanded(true);
        }
        return this;
    },

    /**
      * Handles all keys for open/close actions of the layer list.
      * @param {Event} event - the event
      * @returns {void}
      */
    keyAction: function (event) {
        this.handleKeyboardTriggeredAction(event, "toggleIsExpanded");
        if (event.which === 37) {
            this.model.setIsExpanded(false);
            this.model.toggleCatalogs();
            event.stopPropagation();
            event.preventDefault();
        }
        else if (event.which === 39) {
            this.model.setIsExpanded(true);
            this.model.toggleCatalogs();
            event.stopPropagation();
            event.preventDefault();
        }
    },

    /**
     * Executes the given function callback if a execution key has been triggered.
     * @param {Event} event - the dom event
     * @param {String} callback - the name of the callback function called on this
     * @returns {boolean} if the action has been triggered
     */
    handleKeyboardTriggeredAction: function (event, callback) {
        if (event.which === 32 || event.which === 13) {
            if (typeof this[callback] === "function") {
                this[callback]();
            }
            event.stopPropagation();
            event.preventDefault();
            return true;
        }
        return false;
    },

    /**
     * Opens the help window.
     * @returns {void}
     */
    openHelp: function () {
        if (!store.getters["QuickHelp/active"]) {
            store.commit("QuickHelp/setQuickHelpKey", "tree");
            store.commit("QuickHelp/setActive", true);
        }
        else {
            store.commit("QuickHelp/setActive", false);
        }
    },

    /**
     * open dialog to save the layer selection.
     * @returns {void}
     */
    saveSelection: function () {
        this.model.collection.setActiveToolsToFalse(this.model);
        this.model.collection.get("saveSelection").setIsActive(true);
        store.dispatch("Tools/setToolActive", {id: "saveSelection", active: true});
        // closes the menu tree
        // Upgrade to BT5, use JS method instead of class removal
        const dropdown = Dropdown.getInstance(".nav li:first-child > .dropdown-toggle");

        dropdown.hide();
        $(".dropdown-menu.fixed").removeClass("fixed");
        $(".bi-pin-angle-fill").removeClass("rotate-pin");
        $(".bi-pin-angle-fill").addClass("rotate-pin-back");
        // closes the mobile menu
        $(".navbar-collapse").removeClass("in");
        // selects the url
        $(".input-save-url").select();
    },

    /**
     * Toogle Expanded
     * @return {void}
     */
    toggleIsExpanded: function () {
        this.model.toggleIsExpanded();
    },

    /**
     * Toogle Icon
     * @return {void}
     */
    toggleIcon: function () {
        const elem = $("ul#" + this.model.get("id")).prev().find(".bootstrap-icon:first > i");

        if (!this.model.get("isExpanded")) {
            elem.removeClass("bi-dash-circle-fill");
            elem.addClass("bi-plus-circle-fill");
        }
        else {
            elem.removeClass("bi-plus-circle-fill");
            elem.addClass("bi-dash-circle-fill");
        }
        // Hässlicher IE Bugfix, weil IE 11 mit overflow: auto und remove probleme macht (leerer Katalog wird sehr hoch und bekommt die Höhe -0.01)
        if (!this.model.get("isExpanded")) {
            this.$el.find(".LayerListMaxHeight").css("overflow", "visible");
        }
        else {
            this.$el.find(".LayerListMaxHeight").css("overflow", "auto");
        }
    },

    /**
     * Toogle Background
     * @return {void}
     */
    toggleBackground: function () {
        Radio.trigger("MapView", "toggleBackground");
        $(".background-icon").toggleClass("rotate-adjust");
        $(".background-icon").toggleClass("rotate-adjust-back");
    },

    /**
     * Toogle 3dCatalog
     * @param {*} mode todo
     * @return {void}
     */
    togle3dCatalog: function (mode) {
        if (mode === "3D" && this.model.get("id") === "3d_daten") {
            this.$el.show();
        }
        else if (mode !== "3D" && this.model.get("id") === "3d_daten") {
            this.$el.hide();
        }
    },

    /**
     * Fix tree
     * @return {void}
     */
    fixTree: function () {
        $("body").on("click", "#map", this.helpForFixing);
        $("body").on("click", "#searchbar", this.helpForFixing);
        this.$el.parent().addClass("fixed");
        $(".bi-pin-angle-fill").addClass("rotate-pin");
        $(".bi-pin-angle-fill").removeClass("rotate-pin-back");
        this.model.setIsPinned(true);
    },

    /**
     * unfix Tree
     * @return {void}
     */
    unfixTree: function () {
        $("body").off("click", "#map", this.helpForFixing);
        $("body").off("click", "#searchbar", this.helpForFixing);
        this.$el.parent().removeClass("fixed");
        $(".bi-pin-angle-fill").removeClass("rotate-pin");
        $(".bi-pin-angle-fill").addClass("rotate-pin-back");
        this.model.setIsPinned(false);
    },

    /**
     * Help for fixing
     * @param {evt} evt todo
     * @return {void}
     */
    helpForFixing: function (evt) {
        evt.stopPropagation();
    },

    /**
    * Set Selection
    * @param {evt} evt todo
    * @fires Core.ConfigLoader#RadioRequestParserSetCategory
    * @return {void}
    */
    setSelection: function (evt) {
        Radio.trigger("Parser", "setCategory", evt.currentTarget.value);
        $("." + this.model.get("id") + " select.tabable").trigger("focus");
    }
});

export default FolderCatalogView;
