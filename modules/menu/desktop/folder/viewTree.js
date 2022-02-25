import FolderTemplate from "text-loader!./templateTree.html";

/**
 * @member FolderTemplate
 * @description Template used to create the Folder View Tree
 * @memberof Menu.Desktop.Folder
 */

const FolderViewTree = Backbone.View.extend(/** @lends FolderViewTree.prototype */{
    events: {
        "click .title, .glyphicon-minus-sign, .glyphicon-plus-sign": "toggleIsExpanded",
        "click .selectall": "toggleIsSelected",
        "keydown": "toggleKeyAction"
    },
    /**
     * @class FolderViewTree
     * @extends Backbone.View
     * @memberof Menu.Desktop.Folder
     * @constructs
     * @listens FolderViewTree#changeIsSelected
     * @listens FolderViewTree#changeIsExpanded
     * @listens FolderViewTree#isVisibleInTree
     * @fires FolderViewTree#toggleIsExpanded
     * @fires FolderViewTree#toggleIsSelected
     * @fires ModelList#RadioTriggerModelListSetIsSelectedOnChildModels
     */
    initialize: function () {
        // prevents the theme tree to close due to Bootstrap
        this.$el.on({
            click: function (e) {
                e.stopPropagation();
            }
        });
        this.listenTo(this.model, {
            "change:isSelected": this.rerender,
            "change:isExpanded": this.rerender,
            "change:isVisibleInTree": this.removeIfNotVisible
        });
        this.render();
    },
    tagName: "li",
    className: "themen-folder list-group-item",
    id: "",
    template: _.template(FolderTemplate),

    /**
     * Renders the data to DOM.
     * @return {FolderViewTree} returns this
     */
    render: function () {
        const attr = this.model.toJSON();

        let selector = "",
            paddingLeftValue = 0;

        this.$el.html("");

        if (this.model.get("isVisibleInTree")) {
            this.$el.attr("id", this.model.get("id"));

            // external Folder
            if (this.model.get("parentId") === "ExternalLayer") {
                const parentEl = $("#" + this.model.get("parentId"));

                parentEl.css("height", "auto");
                parentEl.append(this.$el.html(this.template(attr)));
            }
            else {
                // Folder ab der ersten Ebene
                if (this.model.get("level") > 0) {
                    $("#" + this.model.get("parentId")).after(this.$el.html(this.template(attr)));
                }
                else {
                    // Folder ist auf der Höchsten Ebene (direkt unter Themen)
                    if (this.model.get("parentId") === "Baselayer") {
                        selector = "#Baselayer";
                    }
                    else {
                        selector = "#Overlayer";
                    }
                    $(selector).append(this.$el.html(this.template(attr)));
                }
                paddingLeftValue = (this.model.get("level") * 15) + 5;

                $(this.$el).css("padding-left", paddingLeftValue + "px");
            }
        }
        else if (this.model.get("parentId") === "ExternalLayer") {
            // fixes Bug BG-750: IE11 height was negative
            $("#" + this.model.get("parentId")).css("height", "0px");
        }
        return this;
    },

    /**
     * Handles all keyboard events, e.g. for open/close the folder or selecting the whole component.
     * @param {Event} event - the event instance
     * @returns {void}
     */
    toggleKeyAction: function (event) {
        if (event.which === 32 || event.which === 13) {
            if (this.model.get("isFolderSelectable")) {
                this.toggleIsSelected();
            }
            else {
                this.toggleIsExpanded();
            }
            event.stopPropagation();
            event.preventDefault();
        }
        else if (event.which === 37) {
            this.model.setIsExpanded(false);
            event.stopPropagation();
            event.preventDefault();
        }
        else if (event.which === 39) {
            this.model.setIsExpanded(true);
            event.stopPropagation();
            event.preventDefault();
        }
    },

    /**
     * Sets the focus to the <a> element of this component.
     * @returns {void}
     */
    setFocus: function () {
        const htmlAElement = document.querySelector("#\\" + this.model.get("id") + "> div>a");

        if (htmlAElement) {
            htmlAElement.focus();
        }
    },

    /**
     * Rerenders the data to DOM.
     * @return {void}
     */
    rerender: function () {
        const attr = this.model.toJSON();

        this.$el.html(this.template(attr));
        this.setFocus();
    },
    /**
     * Toogle Expanded
     * @return {void}
     */
    toggleIsExpanded: function () {
        this.model.toggleIsExpanded();
    },
    /**
     * Toggle Selected
     * @fires ModelList#RadioTriggerModelListSetIsSelectedOnChildModels
     * @return {void}
     */
    toggleIsSelected: function () {
        this.model.toggleIsSelected();
        Radio.trigger("ModelList", "setIsSelectedOnChildModels", this.model);
        this.model.setIsExpanded(true);
    },
    /**
     * Remove if not visible
     * @return {void}
     */
    removeIfNotVisible: function () {
        if (!this.model.get("isVisibleInTree")) {
            this.remove();
        }
    }

});

export default FolderViewTree;
