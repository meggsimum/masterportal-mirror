import DesktopToolView from "./tool/view";
import DesktopFolderView from "./folder/viewMenu";
import CatalogFolderView from "./folder/viewCatalog";
import DesktopStaticLinkView from "./staticlink/view";
import DesktopViewpointView from "./viewPoint/view";

// import "bootstrap";

const ListViewMain = Backbone.View.extend(/** @lends ListViewMain.prototype */{
    /**
     * @class ListViewMain
     * @extends Backbone.View
     * @memberof Menu.Desktop
     * @constructs
     */
    collection: {},
    el: "nav#main-nav",
    attributes: {
        role: "navigation"
    },
    /**
     * Render Main
     * @return {void}
     */
    renderMain: function () {
        $("div.collapse.navbar-collapse ul.nav-menu").addClass("nav navbar-nav desktop");
        $("div.collapse.navbar-collapse ul.nav-menu").removeClass("list-group mobile");
        $("div.collapse.navbar-collapse").removeClass("show");

        this.renderTopMenu();
    },
    /**
     * Render the top menu
     * @return {void}
     */
    renderTopMenu: function () {
        const models = this.collection.filter(function (model) {
            return model.get("type") === "tool" || model.get("type") === "staticlink" || (model.get("parentId") === "root" && model.get("type") === "folder") || model.get("type") === "viewpoint";
        });

        this.parseViews(models);
    },
    /**
     * Parse Views
     * @param {Array} models to do
     * @return {void}
     */
    parseViews: function (models) {
        models.forEach(model => {
            switch (model.get("type")) {
                case "tool": {
                    this.addToolView(model);
                    break;
                }
                case "staticlink": {
                    this.addStaticLinkView(model);
                    break;
                }
                case "folder": {
                    // Oberste ebene im Themenbaum?
                    if (model.get("parentId") === "tree") {
                        this.addCatalogFolderView(model);
                    }
                    else {
                        this.addDesktopFolderView(model);
                    }
                    break;
                }
                case "viewpoint": {
                    this.addViewpointView(model);
                    break;
                }
                default: {
                    break;
                }
            }
        });
    },
    /**
     * Add Catalog Folder View
     * @param {*} model to do
     * @return {void}
     */
    addCatalogFolderView: function (model) {
        new CatalogFolderView({model: model});
    },
    /**
     * Add Desktop Folder View
     * @param {*} model to do
     * @return {void}
     */
    addDesktopFolderView: function (model) {
        new DesktopFolderView({model: model});
    },
    /**
     * Add Viewpoint View
     * @param {*} model to do
     * @return {void}
     */
    addViewpointView: function (model) {
        new DesktopViewpointView({model: model});
    },
    /**
     * Add Tool View
     * @param {*} model to do
     * @return {void}
     */
    addToolView: function (model) {
        new DesktopToolView({model: model});
    },
    /**
     * Add Static Link View
     * @param {*} model to do
     * @return {void}
     */
    addStaticLinkView: function (model) {
        new DesktopStaticLinkView({model: model});
    },
    /**
     * Remove View
     * @return {void}
     */
    removeView: function () {
        this.$el.find("ul.nav-menu").html("");

        // remove all listeners and the DOM element
        this.remove();
        this.collection.setAllModelsInvisible();
        // The DOM element is needed for the change to and from the mobile view
        // hence it's added again
        $("#map").before(this.el);
    }
});

export default ListViewMain;
