import Item from ".././item";

const Tool = Item.extend(/** @lends Tool.prototype */{
    defaults: {
        isVisibleInMenu: true,
        isRoot: false,
        parentId: "",
        icon: "",
        name: "",
        isActive: false,
        deactivateGFI: false,
        renderToWindow: true,
        resizableWindow: false,
        supportedIn3d: ["supplyCoord", "gfi", "wfsFeatureFilter", "searchByCoord", "legend", "contact", "saveSelection", "parcelSearch", "coordToolkit"],
        supportedOnlyIn3d: ["shadow"],
        supportedInOblique: ["contact"],
        supportedOnlyInOblique: [],
        toolsToRenderInSidebar: ["filter"],
        alwaysActiveTools: []
    },
    /**
     * @class Tool
     * @description Abstract Class used for generating Tool models
     * @extends Item
     * @memberof Core.ModelList.Tool
     * @constructs
     * @property {Boolean} isVisibleInMenu=true Flag of Tool is visible in menu
     * @property {Boolean} is isRoot=false Flag if Tool button is shown on first level in menu
     * @property {String} parentId="" Id of Parent Object
     * @property {String} icon="" default icon. Icon gets shown before tool name
     * @property {String} name="" default name
     * @property {Boolean} isActive=false Flag if tool is active
     * @property {Boolean} deactivateGFI=false Flag if tool should deactivate gfi
     * @property {Boolean} renderToWindow=true Flag if tool should be rendered in window
     * @property {Boolean} resizableWindow=false Flag if tool-window should be resizable
     * @property {String[]} supportedIn3d=["supplyCoord", "shadow", "gfi", "wfsFeatureFilter", "searchByCoord", "legend", "contact", "saveSelection", "measure", "parcelSearch", "coordToolkit"] Array of tool ids that are supported in 3d
     * @property {String[]} supportedOnlyIn3d=["shadow"] Array of tool ids that are only supported in 3d
     * @property {String[]} supportedInOblique=["contact"] Array of tool ids that are supported in oblique mode
     * @property {String[]} supportedInOblique=[] Array of tool ids that are only supported in oblique mode
     * @property {String[]} toolsToRenderInSidebar=["filter"] Array of tool ids that are rendered in sidebar
     * @fires Core.ModelList.Tool#changeIsActive
     * @fires Window#RadioTriggerWindowShowTool
     * @fires Window#RadioTriggerWindowSetIsVisible
     * @fires Core#RadioTriggerAutostartInitializedModul
     * @listens Core.ModelList.Tool#changeIsActive
     * @listens Core.ModelList.Tool#RadioRequestToolGetSupportedOnlyIn3d
     * @listens Core.ModelList.Tool#RadioRequestToolGetSupportedIn3d
     * @listens Core.ModelList.Tool#RadioRequestToolGetSupportedOnlyInOblique
     * @listens Core.ModelList.Tool#RadioRequestToolGetCollection
     * @listens i18next#RadioTriggerLanguageChanged
     */

    initialize: function () {
        const channel = Radio.channel("Tool");

        channel.reply({
            getSupportedIn3d: this.get("supportedIn3d"),
            getSupportedOnlyIn3d: this.get("supportedOnlyIn3d"),
            getSupportedOnlyInOblique: this.get("supportedOnlyInOblique"),
            getCollection: this.collection
        });
    },

    superInitialize: function () {
        this.listenTo(this, {
            "change:isActive": function (model, value) {
                const gfiModel = model.collection ? model.collection.findWhere({id: "gfi"}) : undefined;
                let activeTools = [];

                if (value) {

                    if (model.get("keepOpen") !== true) {
                        if (this.collection) {
                            this.collection.setActiveToolsToFalse(model);
                        }
                    }

                    if (model.get("renderToWindow")) {
                        Radio.trigger("Window", "showTool", model);
                        Radio.trigger("Window", "setIsVisible", true);
                    }

                    if (gfiModel) {
                        gfiModel.setIsActive(!model.get("deactivateGFI"));
                    }
                }
                else {

                    if (model.get("renderToWindow")) {
                        Radio.trigger("Window", "setIsVisible", false);
                    }
                    activeTools = model.collection ? model.collection.where({isActive: true}) : undefined;

                    if (activeTools && activeTools.length === 0) {
                        model.collection.toggleDefaultTool();
                    }
                }
            }
        });

        Radio.trigger("Autostart", "initializedModule", this.get("id"));
        if (this.get("isInitOpen")) {
            this.setIsActive("true");
        }
        this.listenTo(Radio.channel("i18next"), {
            "languageChanged": this.superChangeLang
        });
        this.superChangeLang();

    },
    /**
     * change language - sets or translates the name of this tool, if property i18nextTranslate is no function.
     * If name is defined in config.json, the name is not translated else property nameTranslationKey is used.
     * @returns {Void}  -
     */
    superChangeLang: function () {
        if (typeof this.get("i18nextTranslate") !== "function") {
            if (this.get("useConfigName") === true) {
                // do not translate, use name defined in config.json
                this.set("name", this.get("name"));
            }
            else if (typeof this.get("nameTranslationKey") === "string" && i18next.exists(this.get("nameTranslationKey"))) {
                this.set("name", i18next.t(this.get("nameTranslationKey")));
            }
        }
    },
    /**
     * Activates or deactivates tool
     * @param {Boolean} value Flag if tool is active
     * @returns {void}
     */
    setIsActive: function (value) {
        this.set("isActive", value);
    }
});

export default Tool;
