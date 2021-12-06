import Item from "../item";

const Folder = Item.extend(/** @lends Folder.prototype */{
    defaults: Object.assign({}, Item.prototype.defaults, {
        isVisibleInMenu: true,
        isRoot: false,
        isExpanded: false,
        isInitiallyExpanded: false,
        isAlwaysExpanded: false,
        isSelected: false,
        type: "",
        parentId: "",
        id: "",
        selectAllIcon: "bi-square",
        icon: "bi-folder2-open",
        obliqueModeBlacklist: ["tree", "tools"],
        isPinned: false,
        isSecured: false,
        // translate
        currentLng: "",
        saveSelectionText: "",
        topicsHelpText: "",
        mapBackgroundText: "",
        pinTopicsTreeText: "",
        hideAllTopicsText: "",
        showAllTopicsText: "",
        categoryText: "",
        toolsName: "",
        securedAllTopicsText: ""
    }),
    /**
     * @class Folder
     * @extends Item
     * @memberof Core.ModelList.Folder
     * @constructs
     * @property {Boolean} isVisibleInMenu=true Flag if folder is visible in menu.
     * @property {Boolean} isRoot=false Flag if folder belongs to first level.
     * @property {Boolean} isExpanded=false Flag if folder is expanded.
     * @property {Boolean} isInitiallyExpanded=false Flag if folder is expanded initially.
     * @property {Boolean} isSelected=false Flag if all children are selected.
     * @property {Boolean} isPinned=false Flag if tree is pinned
     * @property {String} type="" Flag what kind of item it is. "folder".
     * @property {String} parentId="" Id of parent node.
     * @property {String} id="" Unique id for folder.
     * @property {String} selectAllIcon="bi-square" Icon class of folder to select all children.
     * @property {String} icon="bi-folder2-open" icon class of folder
     * @property {String} currentLng=""contains the current language - view listens to it
     * @property {String} saveSelectionText="" will be translated
     * @property {String} topicsHelpText="" will be translated
     * @property {String} mapBackgroundText="" will be translated
     * @property {String} pinTopicsTreeText="" will be translated
     * @property {String} hideAllTopicsText="" will be translated
     * @property {String} showAllTopicsText="" will be translated
     * @property {String} securedAllTopicsText="" will be translated
     * @property {String} categoryText="" will be translated
     * @property {String[]} obliqueModeBlacklist=["tree,"tools"] List of folder ids that are not displayed in oblique mode("Schr�gluftbilder").
     */
    initialize: function () {
        let items,
            isEveryToolInvisible = true,
            isEveryLayerSelected = true,
            isEveryLayerSecured;

        // Wenn alle Layer in einem Folder selektiert sind, wird der Folder auch selektiert
        if (this.get("parentId") === "Overlayer") {
            items = Radio.request("Parser", "getItemsByAttributes", {parentId: this.get("id")});
            isEveryLayerSelected = items.every(item => item.isSelected === true);

            if (isEveryLayerSelected === true) {
                this.setIsSelected(true);
            }

            // If all layers in one folder are secured, the folder will be marked as secured as well
            isEveryLayerSecured = items.every(item => item.isSecured === true);
            if (isEveryLayerSecured === true) {
                this.setIsSecured(true);
            }

        }
        if (this.get("id") === "tools") {
            items = Radio.request("Parser", "getItemsByAttributes", {parentId: this.get("id")});
            isEveryToolInvisible = items.every(item => item.isVisibleInMenu === false);

            if (isEveryToolInvisible === true) {
                this.setIsVisibleInMenu(false);
            }
        }
        this.listenTo(Radio.channel("i18next"), {
            "languageChanged": this.changeLang
        });
        this.changeLang();
    },
    /**
     * change language - sets default values for the language
     * and translates the name of the folder, if translation-key was set in config.json
     * @param {String} lng the language changed to
     * @returns {Void}  -
     */
    changeLang: function (lng) {
        /* eslint-disable consistent-this */
        const model = this;

        this.set({
            saveSelectionText: i18next.t("common:menu.tools.saveSelection"),
            topicsHelpText: i18next.t("common:tree.topicsHelp"),
            mapBackgroundText: i18next.t("common:tree.mapBackground"),
            pinTopicsTreeText: i18next.t("common:tree.pinTopicsTree"),
            hideAllTopicsText: i18next.t("common:tree.hideAllTopics"),
            showAllTopicsText: i18next.t("common:tree.showAllTopics"),
            securedAllTopicsText: i18next.t("common:tree.securedAllTopics"),
            categoryText: i18next.t("common:tree.category"),
            toolsName: i18next.t("common:menu.tools.name"),
            currentLng: lng
        });
        // translate name of folder, key is defined in config.json
        if (this.has("i18nextTranslate") && typeof this.get("i18nextTranslate") === "function") {
            this.get("i18nextTranslate")(function (key, value) {
                if (!model.has(key) || typeof value !== "string") {
                    return;
                }
                model.set(key, value);
            });
        }
    },

    /**
     * Setter for attribute "isExpanded".
     * @param {Boolean} value Flag for isExpanded.
     * @param {Object} options Backbone options for setter
     * @returns {void}
     */
    setIsExpanded: function (value, options) {
        this.set("isExpanded", value, options);
    },
    /**
     * Setter for attribute "isPinned".
     * @param {Boolean} value Flag for isPinned.
     * @param {Object} options Backbone options for setter
     * @returns {void}
     */
    setIsPinned: function (value, options) {
        this.set("isPinned", value, options);
    },

    /**
     * Setter for attribute "isSelected"
     * @param {Boolean} value Flag for isSelected.
     * @param {Boolean} silent Flag if attribute should be set in silent-mode.
     * @returns {void}
     */
    setIsSelected: function (value, silent) {
        if (silent === undefined) {
            this.set("isSelected", value);
        }
        this.set("isSelected", value, {silent: silent});
    },

    /**
     * Setter for attribute "isSecured".
     * @param {Boolean} value Flag for isSecured
     * @returns {void}
     */
    setIsSecured: function (value) {
        this.set("isSecured", value);
    },

    /**
     * Toggles the attribute "isSelected"
     * @returns {void}
     */
    toggleIsSelected: function () {
        if (this.get("isSelected") === true) {
            this.setIsSelected(false);
        }
        else {
            this.setIsSelected(true);
        }
    },

    /**
     * Toggles the attribute "isExpanded".
     * @returns {void}
     */
    toggleIsExpanded: function () {
        if (this.get("isExpanded") === true) {
            this.setIsExpanded(false);
        }
        else {
            this.setIsExpanded(true);
        }
        this.toggleCatalogs();
    },

    toggleCatalogs: function () {
        if (this.get("parentId") === "tree" && !this.get("isAlwaysExpanded")) {
            this.collection.toggleCatalogs(this.get("id"));
        }
    },

    /**
     * Sets the attribute "selectAllIcon"
     * @param {String} value Icon class.
     * @returns {void}
     */
    setSelectAllIcon: function (value) {
        this.set("selectAllIcon", value);
    },
    /**
     * Translates the given key
     * @param {String} key key to translate
     * @returns {void}
     */
    translate: function (key) {
        return i18next.t(key);
    }
});

export default Folder;
