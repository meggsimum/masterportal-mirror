import Template from "text-loader!./templateSelection.html";
import TemplateSettings from "text-loader!./templateSettings.html";
import checkChildrenDatasets from "../../checkChildrenDatasets.js";
import LayerBaseView from "./viewBase.js";

const LayerView = LayerBaseView.extend(/** @lends LayerView.prototype */{
    events: {
        "click a.layer-item": "toggleIsVisibleInMap",
        "keydown a.layer-item": function (event) {
            if (this.handleKeyboardTriggeredAction(event, "toggleIsVisibleInMap")) {
                this.setFocus();
            }
        },
        "click .info-icon": "toggleLayerInformation",
        "keydown .info-icon": function (event) {
            this.handleKeyboardTriggeredAction(event, "toggleLayerInformation");
        },
        "click .x-icon": "removeFromSelection",
        "keydown .x-icon": function (event) {
            if (this.handleKeyboardTriggeredAction(event, "removeFromSelection")) {
                this.setFocus(".x-icon");
            }
        },
        "click .settings-icon": "toggleIsSettingVisible",
        "keydown .settings-icon": function (event) {
            this.handleKeyboardTriggeredAction(event, "toggleIsSettingVisible");
        },
        "click .arrows > .up-icon": "moveModelUp",
        "keydown .arrows > .up-icon": function (event) {
            if (this.handleKeyboardTriggeredAction(event, "moveModelUp")) {
                this.setFocus(".arrows .up-icon");
            }
        },
        "click .arrows > .down-icon": "moveModelDown",
        "keydown .arrows > .down-icon": function (event) {
            if (this.handleKeyboardTriggeredAction(event, "moveModelDown")) {
                this.setFocus(".arrows .down-icon");
            }
        },
        "click .increase-icon": "incTransparency",
        "keydown .increase-icon": function (event) {
            if (this.handleKeyboardTriggeredAction(event, "incTransparency")) {
                this.setFocus(".transparency .increase-icon");
            }
        },
        "click .decrease-icon": "decTransparency",
        "keydown .decrease-icon": function (event) {
            if (this.handleKeyboardTriggeredAction(event, "decTransparency")) {
                this.setFocus(".transparency .decrease-icon");
            }
        },
        "click .style-icon": "openStyleWMS",
        "keydown .style-icon": function (event) {
            if (this.handleKeyboardTriggeredAction(event, "openStyleWMS")) {
                this.setFocus(".styleWMS");
            }
        },
        "click .remove-layer": "removeLayer",
        "keydown .remove-layer": function (event) {
            if (this.handleKeyboardTriggeredAction(event, "removeLayer")) {
                this.setFocus();
            }
        }
    },

    /**
     * @class LayerView
     * @extends Backbone.View
     * @memberof Menu.Desktop.Layer
     * @constructs
     */
    initialize: function () {
        const channel = Radio.channel("MenuSelection");

        checkChildrenDatasets(this.model);
        this.initializeDomId();
        channel.on({
            "rerender": this.rerender,
            "renderSetting": this.renderSetting,
            "change:isOutOfRange": this.toggleColor
        }, this);
        this.listenTo(this.model, {
            "change:isVisibleInMap": this.rerender,
            "change:isSettingVisible": this.renderSetting,
            "change:transparency": this.rerender,
            "change:isOutOfRange": this.toggleColor
        });
        this.listenTo(Radio.channel("LayerInformation"), {
            "unhighlightLayerInformationIcon": this.unhighlightLayerInformationIcon
        });
        // translates the i18n-props into current user-language. is done this way, because model's listener to languageChange reacts too late (after render, which ist riggered by creating new Menu)
        this.model.changeLang();
        this.render();
        this.toggleColor(this.model, this.model.get("isOutOfRange"));
    },
    tagName: "li",
    className: "layer-item list-group-item",
    template: _.template(Template),
    templateSettings: _.template(TemplateSettings),

    /**
     * Renders the selection view.
     * @returns {void}
     */
    render: function () {
        const selector = $("ul#SelectedLayer"),
            attr = this.model.toJSON();

        selector.prepend(this.$el.html(this.template(attr)));
        if (this.model.get("isSettingVisible") === true) {
            this.$el.append(this.templateSettings(attr));
        }
        if (this.model.get("layerInfoChecked")) {
            this.highlightLayerInformationIcon();
        }
        return this;
    },

    /**
     * Rerenders the selection view.
     * @returns {void}
     */
    rerender: function () {
        const attr = this.model.toJSON();

        this.$el.html(this.template(attr));
        if (this.model.get("isSettingVisible") === true) {
            this.$el.append(this.templateSettings(attr));
        }
        if (this.model.get("layerInfoChecked")) {
            this.highlightLayerInformationIcon();
        }
    },

    /**
     * Executes setIsSettingVisible and setIsSelected in the model
     * removes the element
     * @returns {void}
     */
    removeFromSelection: function () {
        this.model.setIsSettingVisible(false);
        this.model.setIsSelected(false);
        this.$el.remove();

        if (this.model.get("typ") === "WMS" && this.model.get("time")) {
            this.model.removeLayer(this.model.get("id"));
        }
    },

    /**
     * Executes toggleIsVisibleInMap in the model
     * @returns {void}
     */
    toggleIsVisibleInMap: function () {
        this.model.toggleIsVisibleInMap();
        this.toggleColor(this.model, this.model.get("isOutOfRange"));
    }
});

export default LayerView;
