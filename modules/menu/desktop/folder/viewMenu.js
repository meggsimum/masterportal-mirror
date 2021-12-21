import Template from "text-loader!./templateMenu.html";
import Dropdown from "bootstrap/js/dist/dropdown";

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
    className: "nav-item dropdown dropdown-folder",
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

        // .children is only available after preceding lines
        // eslint-disable-next-line
        const dropdown = Dropdown.getOrCreateInstance(this.$el.children(".dropdown-toggle").get(0));

        if (this.model.get("isInitOpen")) {
            // Upgrade to BT5, use JS method instead of class addition
            dropdown.show();
        }
        else {
            // Upgrade to BT5, use JS method instead of class removal
            dropdown.hide();
            $(".dropdown-menu.fixed").removeClass("fixed");
            $(".bi-pin-angle-fill").parent(".bootstrap-icon").removeClass("rotate-pin");
            $(".bi-pin-angle-fill").parent(".bootstrap-icon").addClass("rotate-pin-back");
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
                // Upgrade to BT5, use JS method instead of class addition
                if (!$(this).children(".dropdown-toggle").hasClass("show")) {
                    const dropdown = Dropdown.getInstance($(this).children(".dropdown-toggle").get(0));

                    dropdown.show();
                }
                $(this).find("ul#tree").removeClass("fixed");
                $(".bi-pin-angle-fill").parent(".bootstrap-icon").removeClass("rotate-pin");
                $(".bi-pin-angle-fill").parent(".bootstrap-icon").addClass("rotate-pin-back");
            }
        });
    }
});

export default FolderViewMenu;
