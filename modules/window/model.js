const Window = Backbone.Model.extend(/** @lends Window.prototype */{
    defaults: {
        isCollapsed: false,
        isVisible: false,
        maxPosLeft: "",
        maxPosTop: "60px",
        rotationAngle: 0,
        startX: 0,
        startY: 0,
        windowLeft: 0,
        windowTop: 0,
        currentValue: false,
        name: "",
        // translations
        minimizeText: "Minimieren",
        closeText: "Schließen"
    },

    /**
     * @class Window
     * @description Model for Window
     * @extends Backbone.Model
     * @memberof Window
     * @constructs
     * @property {Boolean} isCollapsed=false todo
     * @property {Boolean} isVisible=false todo
     * @property {String} maxPosLeft="" todo
     * @property {String} maxPosTop="60px" todo
     * @property {Number} rotationAngle=0 todo
     * @property {Number} startX=0 todo
     * @property {Number} startY=0 todo
     * @property {Number} windowLeft=0 todo
     * @property {Number} windowTop=0 todo
     * @property {Boolean} currentValue=false the current value that is shown in the window
     * @property {String} name="" todo
     * @property {String} minimizeText="", filled with "Minimieren"- translated
     * @property {String} closeText="", filled with "Schließen"- translated
     * @listens Window#RadioTriggerWindowSetIsVisible
     * @listens Window#RadioTriggerWindowShowTool
     * @listens Window#RadioTriggerWindowCollapseWin
     */
    initialize: function () {
        const channel = Radio.channel("Window");

        this.listenTo(channel, {
            "setIsVisible": this.setIsVisible,
            "showTool": this.setParams
        }, this);

        this.listenTo(Radio.channel("i18next"), {
            "languageChanged": this.changeLang
        });

        channel.on({
            "collapseWin": this.collapseWindow
        }, this);
    },

    /**
     * change language - sets default values for the language
     * Translates the title of the window, if 'nameTranslationKey' exists in tool and no name is defined in config.js for the tool.
     * @returns {Void}  -
     */
    changeLang: function () {
        const setLanguage = {
            minimizeText: i18next.t("common:button.minimize"),
            closeText: i18next.t("common:button.close")
        };

        if (this.get("currentValue") !== false && typeof this.get("currentValue").get("i18nextTranslate") === "function") {
            this.get("currentValue").get("i18nextTranslate")(function (key, value) {
                setLanguage[key] = value;
            });
        }
        else if (this.get("currentValue") !== false && this.get("currentValue").get("useConfigName") !== true) {
            const key = this.get("currentValue").get("nameTranslationKey");

            if (i18next.exists(key)) {
                const value = i18next.t(key);

                setLanguage.name = value;
            }
            else {
                console.warn("Cannot translate name of tool with id:" + this.get("currentValue").id + ", translationKey does not exist:", key);
            }
        }

        this.set(setLanguage);
    },

    /**
     * Collapses the Window
     *  @return {void}
     */
    collapseWindow: function () {
        this.setCollapse(true);
        this.set("currentValue", null);
    },

    /**
     * Sets the value for "isCollapsed"
     * @param {Boolean} value true/ false
     * @return {void}
     */
    setCollapse: function (value) {
        this.set("isCollapsed", value);
    },

    /**
     * Sets the value for "isVisible"
     * @param {Boolean} value true/ false
     * @return {void}
     */
    setIsVisible: function (value) {
        this.set("isVisible", value);

        if (value === false) {
            // on collapse (value is false) this function will also disable currentValue
            this.set("currentValue", false);
        }
    },

    /**
     * Sets the parameters for the Window
     * @param {Object} value Object containing name, icon and id
     *  @return {void}
     */
    setParams: function (value) {
        this.set("currentValue", value);
        this.set("name", value.get("name"));
        this.set("icon", value.get("icon"));
        this.set("winType", value.get("id"));
        this.set("resizable", value.get("resizableWindow"));
    },
    setWindowLeft: function (value) {
        this.set("windowLeft", value);
    },
    setWindowTop: function (value) {
        this.set("windowTop", value);
    },
    setStartX: function (value) {
        this.set("startX", value);
    },
    setStartY: function (value) {
        this.set("startY", value);
    }
});

export default Window;
