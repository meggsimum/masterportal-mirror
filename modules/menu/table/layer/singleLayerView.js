import TemplateSettings from "text-loader!./templates/templateSettings.html";
import Template from "text-loader!./templates/templateSingleLayer.html";

const LayerView = Backbone.View.extend(/** @lends LayerView.prototype */{
    events: {
        "click .icon-checkbox, .icon-checkbox2, .title": "toggleIsSelected",
        "click .info-icon": "showLayerInformation",
        "click .settings-icon": "toggleIsSettingVisible",
        "click .arrows > .up-icon": "moveModelUp",
        "click .arrows > .down-icon": "moveModelDown",
        "click .increase-icon": "incTransparency",
        "click .decrease-icon": "decTransparency",
        "change select": "setTransparency",
        "click .remove-layer": "removeLayer"
    },
    /**
     * @class LayerView
     * @description View to represent single layer entries in layer menu of table-style
     * @extends Backbone.View
     * @memberof Menu
     * @constructs
     * @fires Parser#RadioTriggerRemoveItem
     * @listens Layer#changeIsSettingVisible
     * @listens Layer#changeTransparency
     */
    initialize: function () {
        const channel = Radio.channel("Menu");

        this.listenTo(this.model, {
            "change:isSettingVisible": this.renderSetting,
            "change:transparency": this.render
        });
        this.$el.on({
            click: function (e) {
                e.stopPropagation();
            }
        });
        channel.on({
            "renderSetting": this.renderSetting,
            "rerender": this.render
        }, this);
    },
    tagName: "li",
    className: "burgermenu-layer-list list-group-item",
    template: _.template(Template),
    templateSettings: _.template(TemplateSettings),
    render: function () {
        const attr = this.model.toJSON();

        this.$el.html(this.template(attr));
        if (this.model.get("isSettingVisible") === true) {
            this.$el.append(this.templateSettings(attr));
            this.$el.addClass("layer-settings-activated");
        }
        if (this.model.get("isJustAdded") === true) {
            this.$(".title").addClass("just-added");
        }

        return this;
    },
    /**
    * @description render the settings area and decide whether it is initially activated
    * @returns {void}
    */
    renderSetting: function () {
        const attr = this.model.toJSON();

        // Animation Zahnrad
        this.$(".bi-gear").parent(".bootstrap-icon").toggleClass("rotate rotate-back");
        // Slide-Animation templateSetting
        if (this.model.get("isSettingVisible") === false) {
            this.$el.find(".layer-settings").slideUp("slow", function () {
                $(this).remove();
            });
            this.$el.removeClass("layer-settings-activated");
        }
        else {
            this.$el.addClass("layer-settings-activated");
            this.$el.append(this.templateSettings(attr));
            this.$el.find(".layer-settings").hide();
            this.$el.find(".layer-settings").slideDown();
        }
    },
    /**
    * @description react on selection of a layer in tree
    * @returns {void}
    */
    toggleIsSelected: function () {
        const layerCollection = Radio.request("ModelList", "getCollection").where({type: "layer"});

        this.setSettingsVisibility(layerCollection, this.model);
        this.unsetJustAdded();

        this.model.toggleIsSelected();
        this.render();
    },
    /**
    * @description change settings visibility based on layerCollection and model
    * @param {Object} layerCollection - collection of the ModelList with type "layer"
    * @param {Object} model - layer model
    * @returns {void}
    */
    setSettingsVisibility: function (layerCollection, model) {
        const thislayerId = model.get("id");

        if (!model.get("isSelected")) {
            layerCollection.forEach(layer => {
                if (layer.get("id") !== thislayerId) {
                    layer.set("isSettingVisible", false);
                }
            });
        }

        return layerCollection;
    },
    /**
    * @description react on click on information symbol and shows layer information
    * @returns {void}
    */
    showLayerInformation: function () {
        this.unsetJustAdded();
        this.model.showLayerInformation();
    },
    /**
    * @description react on click on settings symbol and shows settings area
    * @returns {void}
    */
    toggleIsSettingVisible: function () {
        this.unsetJustAdded();
        this.model.toggleIsSettingVisible();
    },
    /**
    * @description set transparency of the layer
    * @param {Object} evt - event raised by clicking on transparency buttons (+ / -)
    * @returns {void}
    */
    setTransparency: function (evt) {
        this.model.setTransparency(parseInt(evt.target.value, 10));
    },
    /**
    * @description move the layer downwards in the tree
    * @returns {void}
    */
    moveModelDown: function () {
        this.model.moveDown();
    },
    /**
    * @description move the layer upwards in the tree
    * @returns {void}
    */
    moveModelUp: function () {
        this.model.moveUp();
    },
    /**
    * @description increase the transparency of the layer
    * @returns {void}
    */
    incTransparency: function () {
        this.model.incTransparency(10);
    },
    /**
    * @description decrease the transparency of the layer
    * @returns {void}
    */
    decTransparency: function () {
        this.model.decTransparency(10);
    },
    /**
    * @description remove the layer out of the tree
    * @returns {void}
    */
    removeLayer: function () {
        Radio.trigger("Parser", "removeItem", this.model.get("id"));
        this.model.removeLayer();
        this.$el.remove();
    },
    /**
    * @description remove class "just-added" from layer in tree
    * @returns {void}
    */
    unsetJustAdded: function () {
        this.$(".title").removeClass("just-added");
        this.model.setIsJustAdded(false);
    }
});

export default LayerView;
