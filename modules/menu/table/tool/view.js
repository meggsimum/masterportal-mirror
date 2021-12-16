import MenuTemplate from "text-loader!./menutemplate.html";
import ToolsView from "./toolview";

const ToolView = Backbone.View.extend({
    events: {
        "click": "toggleToolMenu"
    },
    initialize: function () {
        this.render();
        this.listenTo(Radio.channel("TableMenu"), {
            "hideMenuElementTool": this.closeToolMenu
        });
        this.model = Radio
            .request("ModelList", "getCollection")
            .models
            .find(model => model.get("type") === "folder" && model.get("id") === "tools");
        this.listenTo(this.model, {
            "change:currentLng": () => {
                this.updateTitle();
            }
        });
        this.updateTitle();
    },
    id: "table-tools",
    className: "table-nav table-tools col-lg-2",
    template: _.template(MenuTemplate),
    updateTitle: function () {
        const toolsName = this.model.toJSON().toolsName;

        $("#table-tools-menu").prev().prop("title", toolsName);
    },
    render: function () {
        const collection = Radio.request("ModelList", "getCollection"),
            models = collection.models.filter(function (model) {
                return model.get("type") === "tool" || model.get("type") === "folder";
            });

        models.forEach(model => {
            switch (model.get("type")) {
                case "tool": {
                    this.addToolView(model);
                    break;
                }
                case "folder": {
                    if (model.get("id") === "tools") {
                        this.addToolsMenuView(model);
                    }
                    break;
                }
                default:
            }
        });
        return this;
    },
    addToolsMenuView: function (model) {
        const attr = model.toJSON();

        $("#table-nav").append(this.$el.html(this.template(attr)));
    },
    addToolView: function (model) {
        if (model.get("isVisibleInMenu")) {
            new ToolsView({model: model});
        }
    },
    toggleToolMenu: function () {
        if ($("div.table-tools").hasClass("table-tools-active")) {
            this.closeToolMenu();
        }
        else {
            $("div.table-tools").addClass("table-tools-active");
            $("div.table-tools-menu").show();
            Radio.request("TableMenu", "setActiveElement", "Tool");
        }
    },
    closeToolMenu: function () {
        $("div.table-tools").removeClass("table-tools-active");
        $("div.table-tools-menu").hide();
        Radio.trigger("TableMenu", "deactivateCloseClickFrame");
    }
});

export default ToolView;
