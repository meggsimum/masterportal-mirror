import ListTemplate from "text-loader!./templates/template.html";
import SingleLayerView from "./singleLayerView";
import Collapse from "bootstrap/js/dist/collapse";

const LayerView = Backbone.View.extend({
    initialize: function () {
        this.collection = Radio.request("ModelList", "getCollection");
        this.listenTo(Radio.channel("TableMenu"), {
            "hideMenuElementLayer": this.hideMenu
        });
        this.listenTo(this.collection, {
            "updateLightTree": function () {
                this.$el.find("ul.layers").html("");
                this.renderList();
            },
            "change:currentLng": () => {
                this.render();
            }
        });

        this.$el.on("hide.bs.collapse", function () {
            Radio.trigger("TableMenu", "deactivateCloseClickFrame");
        });

        this.$el.on("show.bs.collapse", function () {
            Radio.request("TableMenu", "setActiveElement", "Layer");
        });

    },
    id: "table-layer-list",
    className: "table-layer-list table-nav",
    template: _.template(ListTemplate),
    hideMenu: function () {
        // Upgrade to BT5
        const collapse = Collapse.getInstance($("#table-nav-layers-panel").get(0));

        collapse.hide();
        Radio.trigger("TableMenu", "deactivateCloseClickFrame");
    },
    render: function () {
        this.$el.html(this.template());
        if (Radio.request("TableMenu", "getActiveElement") === "Layer") {
            // Upgrade to BT5
            const collapse = Collapse.getInstance($("#table-nav-layers-panel").get(0));

            collapse.show();
        }
        this.renderList();
        return this;
    },
    renderList: function () {
        const models = this.collection.where({type: "layer"});

        models.sort((modelA, modelB) => modelA.get("selectionIDX") - modelB.get("selectionIDX"));
        this.addViews(models);
    },
    addViews: function (models) {
        let childElement = {};

        models.forEach(model => {
            if (!model.get("isNeverVisibleInTree")) {
                if (model.get("isVisibleInTree") === true) {
                    childElement = new SingleLayerView({model: model}).render().$el;
                    this.$el.find("ul.layers").prepend(childElement);
                }
            }
        });
    }
});

export default LayerView;
