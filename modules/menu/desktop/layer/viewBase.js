import axios from "axios";
import store from "../../../../src/app-store";

/**
 * Base class for layer view that provides common functionality.
 */
const LayerBaseView = Backbone.View.extend(/** @lends LayerBaseView.prototype */{

    /**
     * Initializes the domId of this component with a fix prefix followed by the component id.
     * The id is needed for refocussing after the render-cycle.
     * The available id is a plain number and hence not a valid html id.
     * @param {String} prefix - optional prefix for the id
     * @returns {void}
     */
    initializeDomId: function (prefix) {
        let idPrefix = "layer-list-group-item-";

        if (prefix) {
            idPrefix = prefix;
        }
        this.model.set({
            domId: idPrefix + this.model.get("id")
        });
    },

    /**
     * Draws the settings (transparency, metainfo, ...)
     * @return {void}
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
        }
        else {
            this.$el.append(this.templateSettings(attr));
            this.$el.find(".layer-settings").hide();
            this.$el.find(".layer-settings").slideDown();
        }
    },

    /**
     * Enables/disables the menu entry of the layer if minScale is set, checkes if the current mode is supported.
     * @param {Backbone.Model} model the model to check for
     * @param {Boolean} value true if the entry should be disabled if it has a minScale, false will enable if mode check is ok
     * @returns {void}
     */
    toggleColor: function (model, value) {
        const mode = Radio.request("Map", "getMapMode");

        // adaption to not backbone layers
        if (this.model.get("id") !== model.get("id")) {
            return;
        }

        if (model.has("minScale")) {
            if (value === true) {
                this.disableComponent("Layer wird in dieser Zoomstufe nicht angezeigt");
            }
            else if (model.get("supported").indexOf(mode) >= 0) {
                this.enableComponent();
            }
            else if (mode === "2D") {
                this.disableComponent("Layer im 2D-Modus nicht verfügbar");
            }
            else {
                this.disableComponent("Layer im 3D-Modus nicht verfügbar");
            }
        }
    },

    /**
     * Init the LayerInformation window and inits the highlighting of the informationIcon.
     * @returns {void}
     */
    toggleLayerInformation: function () {
        if (this.model.get("layerInfoChecked")) {
            Radio.trigger("Layer", "setLayerInfoChecked", false);
            this.unhighlightLayerInformationIcon();
        }
        else {
            this.model.showLayerInformation();
            this.highlightLayerInformationIcon();
            // close navigation
            this.$("div.collapse.navbar-collapse").removeClass("in");
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
            this.triggerBrowserAuthentication(isErrorCalled);
        }
        else {
            this.toggleIsSelected();
        }
    },

    /**
     * triggers the browser basic authentication if the selected layer is secured
     * @param {Boolean} isErrorCalled - Flag if the function is called from error function, set to true to avoid recursion of errorFunction
     * @returns {void}
     */
    triggerBrowserAuthentication: function (isErrorCalled) {
        axios({
            method: "get",
            url: this.model.get("authenticationUrl"),
            withCredentials: true
        }).then(() => {
            this.toggleIsSelected();
        }).catch(() => {
            this.errorFunction(isErrorCalled);
        });
    },

    /**
     * Executes toggleIsSelected in the model
     * @returns {void}
     */
    toggleIsSelected: function () {
        this.model.toggleIsSelected();
        if (this.model.get("parentId")) {
            Radio.trigger("ModelList", "setIsSelectedOnParent", this.model);
        }
        this.rerender();
        this.toggleColor(this.model, this.model.get("isOutOfRange"));
    },

    /**
     * Error handling for triggering the browser basic authentication
     * @param {Number} isErrorCalled - Flag if the function is called from error function
     * @returns {void}
     */
    errorFunction: function (isErrorCalled) {
        const isError = isErrorCalled,
            layerName = this.model.get("name"),
            authenticationUrl = this.model.get("authenticationUrl");

        if (isError === false) {
            this.triggerBrowserAuthentication(true);
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
     * Executes the given function callback if a execution key has been triggered.
     * @param {Event} event - the dom event
     * @param {String} callback - the name of the callback function to be executed on this
     * @returns {boolean} if the action has been triggered
     */
    handleKeyboardTriggeredAction: function (event, callback) {
        if (this.model.get("isOutOfRange") === false) {
            if (event.which === 32 || event.which === 13) {
                if (typeof this[callback] === "function") {
                    this[callback]();
                }
                event.stopPropagation();
                event.preventDefault();
                return true;
            }
        }
        return false;
    },

    /**
     * Sets the focus to an element of this component.
     * @param {String|Boolean} [selector=false] selector - the selector to use to set focus (optional)
     * @returns {void}
     */
    setFocus: function (selector = false) {
        let focusElementSelector = null;

        if (selector) {
            focusElementSelector = this.$el.find(selector);
        }
        else {
            focusElementSelector = this.$el.find("#" + this.model.get("domId"));
        }
        if (focusElementSelector) {
            focusElementSelector.focus();
        }
    },

    /**
     * Disables the component for interaction, e.g. if the zoom level changes.
     * @param {string} text - the text to show as title
     * @returns {void}
     */
    disableComponent: function (text) {
        const statusCheckbox = this.$el.find("span.bootstrap-icon > .bi-square").length;

        this.$el.addClass("disabled");
        this.$el.find("*").css("cursor", "not-allowed");
        this.$el.find("*").css("pointer-events", "none");
        if (statusCheckbox === 0) {
            this.$el.find("span.pull-left").css({"pointer-events": "auto", "cursor": "pointer"});
        }
        this.$el.attr("title", text);

        this.$el.find(".tabable").addClass("disable-tabable");
        this.$el.find("*").removeClass("tabable");
        // no focus -> no keyboard events possible
        this.$el.find("*").removeAttr("tabindex");
    },

    /**
     * Enables the component for interaction.
     * @returns {void}
     */
    enableComponent: function () {
        this.$el.removeClass("disabled");
        this.$el.find("*").css("pointer-events", "auto");
        this.$el.find("*").css("cursor", "pointer");
        this.$el.attr("title", "");

        // toggle tabable class / tabindex
        this.$el.find(".disable-tabable").attr("tabindex", "0");
        this.$el.find(".disable-tabable").addClass("tabable");
        this.$el.find("*").removeClass("disable-tabable");
    },

    /**
     * Highlights the Layerinformation Icon in the layertree
     * @returns {void}
     */
    highlightLayerInformationIcon: function () {
        if (this.model.get("layerInfoChecked")) {
            this.$el.find("span.bootstrap-icon.info-icon").addClass("highlightLayerInformationIcon");
        }
    },

    /**
     * Unhighlights the Layerinformation Icon in the layertree
     * @returns {void}
     */
    unhighlightLayerInformationIcon: function () {
        this.$el.find("span.bootstrap-icon.info-icon").removeClass("highlightLayerInformationIcon");
        this.model.setLayerInfoChecked(false);
    },

    /**
      * Executes toggleIsSettingVisible in the model
      * @returns {void}
      */
    toggleIsSettingVisible: function () {
        this.model.toggleIsSettingVisible();
    },

    /**
     * Sets the transparency of the model via the event target value
     * @param {Event} evt - the event to read the transparency from
     * @returns {void}
     */
    setTransparency: function (evt) {
        this.model.setTransparency(parseInt(evt.target.value, 10));
    },

    /**
     * Executes moveDown in the model
     * @returns {void}
     */
    moveModelDown: function () {
        this.model.moveDown();
        $(".arrows > .bootstrap-icon .bi-arrow-down").trigger("focus");
    },

    /**
     * Executes moveUp in the model
     * @returns {void}
     */
    moveModelUp: function () {
        this.model.moveUp();
        $(".arrows > .bootstrap-icon > .bi-arrow-up").trigger("focus");
    },

    /**
     * Executes incTransparency in the model
     * @returns {void}
     */
    incTransparency: function () {
        this.model.incTransparency(10);
    },

    /**
     * Executes decTransparency in the model
     * @returns {void}
     */
    decTransparency: function () {
        this.model.decTransparency(10);
    },

    /**
     * Triggers the styleWMS tool to open
     * Removes the class "open" from ".nav li:first-child"
     * @fires StyleWMS#RadioTriggerStyleWMSOpenStyleWMS
     * @returns {void}
     */
    openStyleWMS: function () {
        Radio.trigger("StyleWMS", "openStyleWMS", this.model);
        $(".nav li:first-child").removeClass("open");
        $(".dropdown-menu.fixed").removeClass("fixed");
        $(".bi-pin-angle-fill").removeClass("rotate-pin");
        $(".bi-pin-angle-fill").addClass("rotate-pin-back");
    },

    /**
     * Activates the StyleVT Tool and commits the current layer model to the state.
     *
     * @returns {void}
     */
    openStyleVT: function () {
        store.dispatch("Tools/StyleVT/setActive", {active: true, layerModel: this.model}, {root: true});
    },

    /**
     * Rmoves the layer from the model, triggers removeItem event
     * @fires Parser#RadioTriggerParserRemoveItem
     * @returns {void}
     */
    removeLayer: function () {
        Radio.trigger("Parser", "removeItem", this.model.get("id"));
        this.model.removeLayer();
        this.$el.remove();
    }
});

export default LayerBaseView;
