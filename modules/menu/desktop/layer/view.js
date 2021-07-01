import Template from "text-loader!./template.html";
import checkChildrenDatasets from "../../checkChildrenDatasets.js";
import store from "../../../../src/app-store/index";
import axios from "axios";

const LayerView = Backbone.View.extend(/** @lends LayerView.prototype */{
    events: {
        "click .layer-item": "preToggleIsSelected",
        "click .layer-info-item > .glyphicon-info-sign": "showLayerInformation",
        "click .layer-info-item > .glyphicon-cog": "toggleIsSettingVisible",
        "click .layer-sort-item > .glyphicon-triangle-top": "moveModelUp"
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
        checkChildrenDatasets(this.model);
        this.listenTo(this.model, {
            "change:isSelected": this.rerender,
            "change:isVisibleInTree": this.removeIfNotVisible,
            "change:isOutOfRange": this.toggleColor
        });
        this.listenTo(Radio.channel("LayerInformation"), {
            "unhighlightLayerInformationIcon": this.unhighlightLayerInformationIcon
        });
        this.listenTo(Radio.channel("Map"), {
            "change": function (mode) {
                if (this.model.get("supported").indexOf(mode) >= 0) {
                    this.removeDisableClass();
                }
                else if (mode === "2D") {
                    this.addDisableClass("Layer im 2D-Modus nicht verfügbar");
                }
                else {
                    this.addDisableClass("Layer im 3D-Modus nicht verfügbar");
                }
            }
        });
        // translates the i18n-props into current user-language. is done this way, because model's listener to languageChange reacts too late (after render, which ist riggered by creating new Menu)
        this.model.changeLang();
        this.render();
        this.toggleColor(this.model, this.model.get("isOutOfRange"));
    },
    tagName: "li",
    className: "layer list-group-item",
    template: _.template(Template),

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
        return this;
    },
    /**
     * Wenn der Layer außerhalb seines Maßstabsberreich ist, wenn die view ausgegraut und nicht anklickbar
     * @param {Backbone.Model} model -
     * @param {boolean} value -
     * @returns {void}
     */
    toggleColor: function (model, value) {
        const mode = Radio.request("Map", "getMapMode");

        if (model.has("minScale") === true) {
            if (value === true) {
                this.addDisableClass("Layer wird in dieser Zoomstufe nicht angezeigt");
            }
            else if (this.model.get("supported").indexOf(mode) >= 0) {
                this.removeDisableClass();
            }
            else if (mode === "2D") {
                this.addDisableClass("Layer im 2D-Modus nicht verfügbar");
            }
            else {
                this.addDisableClass("Layer im 3D-Modus nicht verfügbar");
            }
        }
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
            this.addDisableClass();
        }
    },

    /**
     * handles toggeling of secured and not-secured layers
     * @returns {void}
     */
    preToggleIsSelected: function () {
        const isErrorCalled = false;

        // if layer is secured and not selected
        if (this.model.get("isSecured") && !this.model.get("isSelected")) {
            this.triggerBrowserAuthentication(this.toggleIsSelected.bind(this), isErrorCalled);
        }
        else {
            this.toggleIsSelected();
        }
    },

    /**
     * Init the LayerInformation window and inits the highlighting of the informationIcon.
     * @returns {void}
     */
    showLayerInformation: function () {
        this.model.showLayerInformation();
        this.highlightLayerInformationIcon();
    },

    /**
     * triggers the browser basic authentication if the selected layer is secured
     * @param {Function} successFunction - Function called after triggering the browser basic authentication successfully
     * @param {Boolean} isErrorCalled - Flag if the function is called from error function
     * @returns {void}
     */
    triggerBrowserAuthentication: function (successFunction, isErrorCalled) {
        const that = this;

        axios({
            method: "get",
            url: this.model.get("authenticationUrl"),
            withCredentials: true
        }).then(function () {
            that.toggleIsSelected();
        }).catch(function () {
            that.errorFunction(successFunction, isErrorCalled);
        });
    },

    /**
     * Error handling for triggering the browser basic authentication
     * @param {Function} successFunction - Function called after triggering the browser basic authentication successfully
     * @param {Number} isErrorCalled - Flag if the function is called from error function
     * @returns {void}
     */
    errorFunction: function (successFunction, isErrorCalled) {
        const isError = isErrorCalled,
            layerName = this.model.get("name"),
            authenticationUrl = this.model.get("authenticationUrl");

        if (isError === false) {
            this.triggerBrowserAuthentication(successFunction, !isError);
        }
        else if (isError === true) {
            store.dispatch("Alerting/addSingleAlert", {
                category: i18next.t("common:modules.alerting.categories.error"),
                displayClass: "error",
                content: i18next.t("common:modules.menu.layer.basicAuthError") + "\"" + layerName + "\"",
                kategorie: "alert-danger"
            });
            console.warn("Triggering the basic browser authentication for the secured layer \"" + layerName + "\" was not successfull. Something went wrong with the authenticationUrl (" + authenticationUrl + ")");
        }
    },

    /**
     * Executes toggleIsSelected in the model
     * @returns {void}
     */
    toggleIsSelected: function () {
        this.model.toggleIsSelected();
        Radio.trigger("ModelList", "setIsSelectedOnParent", this.model);
        this.rerender();
        this.toggleColor(this.model, this.model.get("isOutOfRange"));
    },

    /**
     * Executes setIsSettingVisible and setIsSelected in the model
     * removes the element
     * @returns {void}
     */
    removeFromSelection: function () {
        this.model.setIsInSelection(false);
        this.$el.remove();
    },

    /**
     * Executes toggleIsSettingVisible in the model
     * @returns {void}
     */
    toggleIsSettingVisible: function () {
        this.model.toggleIsSettingVisible();
    },

    /**
     * Executes moveDown in the model
     * @returns {void}
     */
    moveModelDown: function () {
        this.model.moveDown();
    },

    /**
     * Executes moveUp in the model
     * @returns {void}
     */
    moveModelUp: function () {
        this.model.moveUp();
    },

    /**
     * todo
     * @returns {void}
     */
    removeIfNotVisible: function () {
        if (!this.model.get("isVisibleInTree")) {
            this.remove();
        }
    },

    /**
     * todo
     * @param {string} text -
     * @returns {void}
     */
    addDisableClass: function (text) {
        const statusCheckbox = this.$el.find("span.glyphicon.glyphicon-unchecked").length;

        this.$el.addClass("disabled");
        this.$el.find("*").css("cursor", "not-allowed");
        this.$el.find("*").css("pointer-events", "none");
        if (statusCheckbox === 0) {
            this.$el.find("span.pull-left").css({"pointer-events": "auto", "cursor": "pointer"});
        }
        this.$el.attr("title", text);
    },

    /**
     * todo
     * @returns {void}
     */
    removeDisableClass: function () {
        this.$el.removeClass("disabled");
        this.$el.find("*").css("pointer-events", "auto");
        this.$el.find("*").css("cursor", "pointer");
        this.$el.attr("title", "");
    },

    /**
     * Highlights the Layerinformation Icon in the layertree
     * @returns {void}
     */
    highlightLayerInformationIcon: function () {
        if (this.model.get("layerInfoChecked")) {
            this.$el.find("span.glyphicon-info-sign").addClass("highlightLayerInformationIcon");
        }
    },

    /**
     * Unhighlights the Layerinformation Icon in the layertree
     * @returns {void}
     */
    unhighlightLayerInformationIcon: function () {
        this.$el.find("span.glyphicon-info-sign").removeClass("highlightLayerInformationIcon");
        this.model.setLayerInfoChecked(false);
    }
});

export default LayerView;
