import FolderTemplate from "text-loader!./template.html";
import FolderLeafTemplate from "text-loader!./templateLeaf.html";

const FolderView = Backbone.View.extend({
    events: {
        "click .folder-item": "expand",
        "click .checked-all-item": "toggleIsSelected"
    },
    initialize: function () {
        this.listenTo(this.model, {
            "change:isSelected": this.render,
            "change:isVisibleInTree": this.removeIfNotVisible
        });
    },
    tagName: "li",
    className: "list-group-item",
    template: _.template(FolderTemplate),
    templateLeaf: _.template(FolderLeafTemplate),
    render: function () {
        const attr = this.model.toJSON();

        if (this.model.get("isExpanded") === true && this.model.get("parentId") !== "tree") {
            this.$el.html(this.templateLeaf(attr));
        }
        else {
            this.$el.html(this.template(attr));
        }
        return this;
    },
    expand: function () {
        this.model.setIsExpanded(true);
    },
    toggleIsSelected: function () {
        this.model.toggleIsSelected();
        Radio.trigger("ModelList", "setIsSelectedOnChildModels", this.model);
        this.model.setIsExpanded(true);
    },
    removeIfNotVisible: function () {
        if (!this.model.get("isVisibleInTree")) {
            this.remove();
        }
    }
});

export default FolderView;
