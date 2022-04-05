import QueryDetailView from "./query/detailView";
import QuerySimpleView from "./query/simpleView";
import Template from "text-loader!./template.html";

const FilterView = Backbone.View.extend({
    events: {
        "click .closeView": "closeFilter",
        "keydown .closeView": "closeFilter"
    },
    initialize: function () {
        this.listenTo(this.model, {
            "change:isActive": function (model, isActive) {
                if (isActive) {
                    model.createQueries(model.get("predefinedQueries"));
                    this.$el.remove();
                    this.render();
                    this.renderDetailView();
                }
                else {
                    if (this.model.get("detailView") && this.model.get("detailView").$el && Array.isArray(this.model.get("detailView").$el)) {
                        this.model.get("detailView").$el[0].remove();
                    }
                    this.$el.remove();
                    Radio.trigger("Sidebar", "toggle", false);
                }
            },
            "change:currentLng": this.rerender
        });
        this.listenTo(this.model.get("queryCollection"), {
            "change:currentLng": this.rerender,
            "change:isSelected": function (model, value) {
                if (value === true) {
                    this.renderDetailView();
                }
                this.model.closeGFI();
            },
            "renderDetailView": this.renderDetailView,
            "add": function () {
                this.$el.remove();
                this.render();
                this.renderDetailView();
            }
        });

        if (this.model.get("isActive")) {
            if (this.model.get("queryCollection").length < 1) {
                this.model.createQueries(this.model.get("predefinedQueries"));
            }
            this.$el.remove();
            this.render();
        }
    },
    id: "filter-view",
    template: _.template(Template),
    className: "filter",

    render: function () {
        const attr = this.model.toJSON();

        this.$el.html(this.template(attr));
        if (this.model.get("uiStyle") === "TABLE") {
            Radio.trigger("TableMenu", "appendFilter", this.el);
        }
        else {
            Radio.trigger("Sidebar", "append", this.el, false, 450);
            Radio.trigger("Sidebar", "toggle", true);
        }
        this.renderSimpleViews();
        this.delegateEvents();
        this.setFocus();
        return this;
    },

    /**
     * Sets the focus to the first simple-view button or - if none available -
     * to the close-button.
     * @returns {void}
     */
    setFocus: function () {
        if (this.$el.find("div.simple-view > button").length > 0) {
            this.$el.find("div.simple-view > button").first().trigger("focus");
        }
        else {
            this.$("button.close").trigger("focus");
        }
    },

    renderDetailView: function () {
        const selectedModel = this.model.get("queryCollection").findWhere({isSelected: true});
        let view;

        if (selectedModel) {
            view = new QueryDetailView({model: selectedModel});

            this.model.setDetailView(view);
            this.$el.find(".detail-view-container").html(view.render().$el);
        }
    },

    renderSimpleViews: function () {
        let view;
        const queryCollectionModels = this.model.get("queryCollection").models,
            predefinedQueriesModels = this.model.get("predefinedQueries");

        if (queryCollectionModels.length > 1) {
            queryCollectionModels.forEach(function (queryCollectionModel) {
                // must only be called on initial render, else user selection will be overridden on translate
                const query = this.model.get("initialized")
                    ? queryCollectionModel
                    : this.model.regulateInitialActivating(queryCollectionModel, predefinedQueriesModels);

                view = new QuerySimpleView({model: query});
                this.$el.find(".simple-views-container").append(view.render().$el);
            }, this);

            if (!this.model.get("initialized")) {
                this.model.set("initialized", true);
            }
        }
        else {
            this.model.activateLayer(queryCollectionModels);
            this.$el.find(".simple-views-container").remove();
        }
    },
    /**
     * Rerender method that keeps filter state except for language.
     * To be used on changeLang.
     * @returns {void}
     */
    rerender: function () {
        if (this.model.get("isActive")) {
            this.render(this.model, true);
            this.renderDetailView();
        }
    },
    closeFilter: function (event) {
        if (event.type === "click" || event.which === 32 || event.which === 13) {
            this.model.setIsActive(false);
            this.model.collapseOpenSnippet();
            Radio.trigger("ModelList", "toggleDefaultTool");
        }
    }
});

export default FilterView;
