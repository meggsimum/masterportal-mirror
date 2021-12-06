import Template from "text-loader!./templateLight.html";
import TemplateSettings from "text-loader!./templateSettings.html";
import checkChildrenDatasets from "../../checkChildrenDatasets.js";
import LayerBaseView from "./viewBase.js";

const LayerView = LayerBaseView.extend(/** @lends LayerView.prototype */{
    events: {
        "click .layer-item.tabable": function () {
            this.preToggleIsSelected();
            this.setFocus();
        },
        "keydown .layer-item.tabable": function (event) {
            if (this.handleKeyboardTriggeredAction(event, "preToggleIsSelected")) {
                this.setFocus();
            }
        },
        "click .info-icon": "toggleLayerInformation",
        "keydown .info-icon": function (event) {
            this.handleKeyboardTriggeredAction(event, "toggleLayerInformation");
        },
        "click .settings-icon": "toggleIsSettingVisible",
        "keydown .settings-icon": function (event) {
            this.handleKeyboardTriggeredAction(event, "toggleIsSettingVisible");
        },
        "click .arrows > .up-icon": "moveModelUp",
        "keydown .arrows > .up-icon": function (event) {
            this.handleKeyboardTriggeredAction(event, "moveModelUp");
        },
        "click .arrows > .down-icon": "moveModelDown",
        "keydown .arrows > .down-icon": function (event) {
            this.handleKeyboardTriggeredAction(event, "moveModelDown");
        },
        "click .increase-icon": "incTransparency",
        "keydown .increase-icon": function (event) {
            if (this.handleKeyboardTriggeredAction(event, "incTransparency")) {
                this.setFocus(".increase-icon");
            }
        },
        "click .decrease-icon": "decTransparency",
        "keydown .decrease-icon": function (event) {
            if (this.handleKeyboardTriggeredAction(event, "decTransparency")) {
                this.setFocus(".decrease-icon");
            }
        },
        "click .styleWMS": "openStyleWMS",
        "keydown .styleWMS": function (event) {
            if (this.handleKeyboardTriggeredAction(event, "openStyleWMS")) {
                this.setFocus(".styleWMS");
            }
        },
        "click .styleVT": "openStyleVT",
        "keydown .styleVT": function (event) {
            if (this.handleKeyboardTriggeredAction(event, "openStyleVT")) {
                this.setFocus(".styleVT");
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
     * @listens Layer#changeIsSelected
     * @listens Layer#changeIsSettingVisible
     * @listens Layer#changeTransparency
     * @listens Layer#changeIsOutOfRange
     * @listens Layer#changeCurrentLng
     * @listens Map#RadioTriggerMapChange
     * @listens LayerInformation#RadioTriggerLayerInformationUnhighlightLayerInformationIcon
     * @listens i18next#RadioTriggerLanguageChanged
     * @fires Map#RadioRequestMapGetMapMode
     * @fires StyleWMS#RadioTriggerStyleWMSOpenStyleWMS
     * @fires Parser#RadioTriggerParserRemoveItem
     * @fires Alerting#RadioTriggerAlertAlert
     */
    initialize: function () {
        const channel = Radio.channel("Menu");

        checkChildrenDatasets(this.model);
        this.initializeDomId();

        channel.on({
            "renderSetting": this.renderSetting,
            "rerender": this.rerender,
            "change:isOutOfRange": this.toggleColor
        }, this);
        this.listenTo(this.model, {
            "change:isSelected": this.rerender,
            "change:isSettingVisible": this.renderSetting,
            "change:transparency": this.rerender,
            "change:isOutOfRange": this.toggleColor,
            "change:currentLng": () => {
                this.render();
            }
        });
        this.listenTo(Radio.channel("Map"), {
            "change": this.toggleByMapMode
        });
        this.listenTo(Radio.channel("LayerInformation"), {
            "unhighlightLayerInformationIcon": this.unhighlightLayerInformationIcon
        });
        this.$el.on({
            click: function (e) {
                e.stopPropagation();
            }
        });
        this.render();

        this.toggleColor(this.model, this.model.get("isOutOfRange"));
        this.toggleByMapMode(Radio.request("Map", "getMapMode"));
    },
    tagName: "li",
    className: "layer list-group-item",
    template: _.template(Template),
    templateSettings: _.template(TemplateSettings),

    /**
     * Renders the selection view.
     * @returns {Backbone.View} todo
     */
    render: function () {
        const attr = this.model.toJSON(),
            selector = $("#" + this.model.get("parentId"));

        selector.prepend(this.$el.html(this.template(attr)));
        if (this.model.get("isSettingVisible") === true) {
            this.$el.append(this.templateSettings(attr));
        }
        return this;
    },

    /**
     * Rerenders the model with updated elements.
     * @returns {void}
     */
    rerender: function () {
        const attr = this.model.toJSON();

        this.$el.html(this.template(attr));
        if (this.model.get("layerInfoChecked")) {
            this.highlightLayerInformationIcon();
        }
        if (this.model.get("isSettingVisible")) {
            this.$el.append(this.templateSettings(attr));
        }
    },

    /**
     * adds only layers to the tree that support the current mode of the map
     * e.g. 2D, 3D
     * @param {String} mapMode - current mode from map
     * @returns {void}
     */
    toggleByMapMode: function (mapMode) {
        if (this.model.get("supported").indexOf(mapMode) >= 0) {
            this.$el.show();
            if (this.model.get("isOutOfRange") !== true) {
                this.enableComponent();
            }
            else {
                this.disableComponent();
            }
        }
        else {
            this.$el.hide();
        }
    }
});

export default LayerView;
