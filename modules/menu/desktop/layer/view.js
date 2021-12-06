import Template from "text-loader!./template.html";
import checkChildrenDatasets from "../../checkChildrenDatasets.js";
import LayerBaseView from "./viewBase.js";
import templateSettingsTransparency from "text-loader!./templateSettingsTransparency.html";

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
        "click .layer-info-item > .info-icon": "toggleLayerInformation",
        "keydown .layer-info-item": function (event) {
            this.handleKeyboardTriggeredAction(event, "toggleLayerInformation");
        },
        "click .layer-info-item > .settings-icon": "toggleIsSettingVisible",
        "keydown .layer-info-item > .settings-icon": function (event) {
            this.handleKeyboardTriggeredAction(event, "toggleIsSettingVisible");
        },
        "click .layer-sort-item > .up-icon": "moveModelUp",
        "keydown .layer-sort-item > .up-icon": function (event) {
            this.handleKeyboardTriggeredAction(event, "moveModelUp");
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
        }
    },

    /**
     * @class LayerView
     * @extends Backbone.View
     * @memberof Menu.Desktop.Layer
     * @constructs
     * @listens Layer#changeIsSelected
     * @listens Layer#changeIsVisibleInTree
     * @listens Layer#changeIsOutOfRange
     * @listens Map#RadioTriggerMapChange
     * @listens i18next#RadioTriggerLanguageChanged
     * @fires ModelList#RadioRequestModelListSetIsSelectedOnParent
     * @fires Alerting#RadioTriggerAlertAlert
     */
    initialize: function () {
        const channel = Radio.channel("Menu");

        checkChildrenDatasets(this.model);
        this.initializeDomId();
        channel.on({
            "rerender": this.rerender,
            "renderSetting": this.renderTransparency,
            "change:isOutOfRange": this.toggleColor,
            "change:isVisibleInTree": this.removeIfNotVisible
        }, this);

        this.listenTo(this.model, {
            "change:isSelected": this.rerender,
            "change:isVisibleInTree": this.removeIfNotVisible,
            "change:isSettingVisible": this.renderSetting,
            "change:transparency": this.rerender,
            "change:isOutOfRange": this.toggleColor
        });
        this.listenTo(Radio.channel("Map"), {
            "change": function (mode) {
                if (this.model.get("supported").indexOf(mode) >= 0) {
                    this.enableComponent();
                }
                else if (mode === "2D") {
                    this.disableComponent("Layer im 2D-Modus nicht verfügbar");
                }
                else {
                    this.disableComponent("Layer im 3D-Modus nicht verfügbar");
                }
            }
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
    className: "layer list-group-item",
    template: _.template(Template),
    templateSettings: _.template(templateSettingsTransparency),

    /**
     * Renders the selection view.
     * @returns {void}
     */
    render: function () {
        const attr = this.model.toJSON(),
            selector = $("#" + this.model.get("parentId"));

        this.$el.html("");
        if (this.model.get("isVisibleInTree")) {
            if (this.model.get("level") === 0) {
                selector.prepend(this.$el.html(this.template(attr)));
            }
            else {
                selector.after(this.$el.html(this.template(attr)));
            }
            this.$el.css("padding-left", ((this.model.get("level") * 15) + 5) + "px");
        }

        this.renderTransparency();

        return this;
    },

    /**
     * Rerenders the model with updated elements.
     * @returns {void}
     */
    rerender: function () {
        const attr = this.model.toJSON(),
            scale = Radio.request("MapView", "getOptions").scale;

        this.$el.html("");
        this.$el.html(this.template(attr));

        if (this.model.get("layerInfoChecked")) {
            this.highlightLayerInformationIcon();
        }
        // If the the model should not be selectable make sure that is not selectable!
        if (!this.model.get("isSelected") && (this.model.get("maxScale") < scale || this.model.get("minScale") > scale)) {
            this.disableComponent();
        }

        if (this.model.get("isSettingVisible") === true) {
            this.$el.append(this.templateSettings(attr));
        }
    },

    /**
     * Draws the settings (transparency, metainfo, ...)
     * @param {String} layerId The layer id.
     * @return {void}
     */
    renderTransparency: function (layerId) {
        const attr = this.model.toJSON();

        // Animation cog
        if (layerId === attr.id) {
            this.$(".glyphicon-cog").toggleClass("rotate rotate-back");
        }

        // Slide-Animation templateSetting
        if (this.model.get("isSettingVisible") === false) {
            this.$el.find(".layer-settings").slideUp("slow", function () {
                $(this).remove();
            });
        }
        else {
            this.$el.append(this.templateSettings(attr));
            this.$el.find(".layer-settings").hide();
            this.$el.find(".layer-settings").slideDown();
        }
    },

    /**
     * todo
     * @returns {void}
     */
    removeIfNotVisible: function () {
        if (!this.model.get("isVisibleInTree")) {
            this.remove();
        }
    }
});

export default LayerView;
