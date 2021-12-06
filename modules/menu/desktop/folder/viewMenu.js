import Template from "text-loader!./templateMenu.html";

/**
 * @member Template
 * @description Template used to create the Folder View Menu
 * @memberof Menu.Desktop.Folder
 */

const FolderViewMenu = Backbone.View.extend(/** @lends FolderViewMenu.prototype */{
    /**
     * @class FolderViewMenu
     * @extends Backbone.View
     * @memberof Menu.Desktop.Folder
     * @constructs
     * @listens Map#RadioTriggerMapChange
     * @listens Core#RadioTriggerUtilIsViewMobileChanged
     * @fires Map#RadioRequestMapGetMapMode
     */
    initialize: function () {
        this.listenTo(Radio.channel("Map"), {
            "change": this.toggleDisplayByMapMode
        });
        this.listenTo(Radio.channel("Util"), {
            "isViewMobileChanged": function () {
                this.toggleDisplayByMapMode(Radio.request("Map", "getMapMode"));
            }
        });
        this.render();
    },
    tagName: "li",
    className: "dropdown dropdown-folder",
    template: _.template(Template),

    /**
     * Renders the data to DOM.
     * @return {void}
     */
    render: function () {
        const attr = this.model.toJSON();

        if (this.model.get("isVisibleInMenu")) {
            $("#" + this.model.get("parentId")).append(this.$el.html(this.template(attr)));
        }

        if (this.model.get("isInitOpen")) {
            this.$el.addClass("open");
        }
        else {
            this.$el.removeClass("open");
            $(".dropdown-menu.fixed").removeClass("fixed");
            $(".bi-pin-angle-fill").removeClass("rotate-pin");
            $(".bi-pin-angle-fill").addClass("rotate-pin-back");
        }

        this.clearFixedTree();
        return this;
    },

    /**
     * adds only layers to the tree that support the current mode of the map
     * e.g. 2D, 3D
     * @param {String} mapMode - current mode from map
     * @returns {void}
     */
    toggleDisplayByMapMode: function (mapMode) {
        const obliqueModeBlacklist = this.model.get("obliqueModeBlacklist"),
            modelId = this.model.get("id");

        if (mapMode === "Oblique" && obliqueModeBlacklist.indexOf(modelId) > -1) {
            this.$el.hide();
        }
        else {
            this.$el.show();
        }
    },

    /**
     * Removing fixed tree if clicking on the menu point Themen
     * @returns {void}
     */
    clearFixedTree: function () {
        this.$el.click(function () {
            if ($(this).find("ul#tree.fixed").length) {
                if (!$(this).hasClass("open")) {
                    $(this).addClass("open");
                }
                $(this).find("ul#tree").removeClass("fixed");
                $(".bi-pin-angle-fill").removeClass("rotate-pin");
                $(".bi-pin-angle-fill").addClass("rotate-pin-back");
            }
        });
    }
});

export default FolderViewMenu;
