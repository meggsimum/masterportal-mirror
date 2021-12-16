import LightMenu from "./desktop/listViewLight";
import Menu from "./desktop/listView";
import MobileMenu from "./mobile/listView";
import TableMenu from "./table/view";
import store from "../../src/app-store/index";
import Dropdown from "bootstrap/js/dist/dropdown";

const MenuLoader = Backbone.Model.extend(/** @lends MenuLoader.prototype */{
    defaults: {
        treeType: "light",
        currentMenu: "",
        isOpen: false
    },
    /**
     * @class MenuLoader
     * @extends Backbone.Model
     * @memberof Menu
     * @constructs
     * @description This Loader gives you ...
     */
    initialize: function () {
        this.treeType = Radio.request("Parser", "getTreeType");
        this.menuStyle = store.getters.uiStyle;

        // im Table-Style soll das ui nicht verändert werden
        if (this.menuStyle === "DEFAULT") {
            Radio.on("Util", {
                "isViewMobileChanged": function () {
                    this.reloadMenu();
                }
            }, this);
        }

        this.listenTo(Radio.channel("Util"), {
            "isViewMobileChanged": function (isViewMobile) {
                if (!isViewMobile) {
                    $(".modal-backdrop").remove();
                }
            }
        });

        this.listenTo(Radio.channel("i18next"), {
            "languageChanged": function () {
                const collection = Radio.request("ModelList", "getCollection");
                let foundExpanded = false,
                    rootModels = null;

                this.switchCollectionLanguage(collection);
                if (Radio.request("Util", "isViewMobile")) {
                    rootModels = collection.where({parentId: "root"});
                    rootModels.forEach(model => {
                        if (model.get("isExpanded") === true) {
                            model.set("isExpanded", false);
                            foundExpanded = true;
                        }
                    });
                    if (foundExpanded) {
                        // do not reload mobile-menu, if one was expanded --> prevent double entries in menu after "languageChanged"
                        return;
                    }
                }
                if (this.menuStyle === "DEFAULT") {
                    this.reloadMenu();
                }
            }
        });
        this.listenToOnce(Radio.channel("Addons"), {
            "initialized": function () {
                if (this.menuStyle === "DEFAULT") {
                    this.reloadMenu();
                }
            }
        });
        this.loadMenu();
    },

    /**
     * Removes the menu and reloads it.
     * @return {Void}  -
     */
    reloadMenu: function () {
        if ($(".bi-pin-angle-fill") && $(".bi-pin-angle-fill").hasClass("rotate-pin")) {
            // tree is pinned
            if ($(".dropdown.dropdown-folder > .dropdown-toggle").hasClass("show")) {
                // menu is open
                this.set("isOpen", true);
            }
        }
        $("div.collapse.navbar-collapse ul.nav-menu").empty();
        $("div.collapse.navbar-collapse .breadcrumb-mobile").empty();
        this.loadMenu(true);
    },

    /**
     * changes the values of all models in ModelList collection where a translate function is given
     * @pre the collection is somewhat
     * @post the collection is translated where translations where found
     * @param {Backbone.Collection} collection the collection (e.g. ModelList) to run through
     * @return {Void}  -
     */
    switchCollectionLanguage: function (collection) {
        if (!collection || typeof collection.each !== "function") {
            return;
        }

        collection.each(function (model) {
            if (model.has("i18nextTranslate") && typeof model.get("i18nextTranslate") === "function") {
                model.get("i18nextTranslate")(function (key, value) {
                    if (!model.has(key) || typeof value !== "string") {
                        return;
                    }
                    model.set(key, value);
                    store.dispatch("Tools/languageChanged", {id: model.id, name: value});
                });
            }
        }, this);
    },

    /**
     * Prüft initial und nach jedem Resize, ob und welches Menü geladen werden muss und lädt bzw. entfernt Module.
     * @param  {boolean} isReload if true, this is a  reload
     * @return {Object}        this
     * @fires Map#RadioTriggerMapUpdateSize
     */
    loadMenu: function (isReload = false) {
        const isMobile = Radio.request("Util", "isViewMobile"),
            channel = Radio.channel("Menuloader");

        if (this.currentMenu) {
            this.currentMenu.stopListening();
        }
        if (!this.menuStyle) {
            this.menuStyle = Radio.request("Util", "getUiStyle");
        }

        if (this.menuStyle === "TABLE") {
            this.currentMenu = new TableMenu();
            channel.trigger("ready", this.currentMenu.id);
        }
        else if (this.menuStyle === "DEFAULT") {
            // $("#map").css("height", "calc(100% - 50px)");
            $("#main-nav").show();

            if (isMobile) {
                this.currentMenu = new MobileMenu();
            }
            else if (this.treeType === "light") {
                this.currentMenu = new LightMenu();
            }
            else if (this.get("isOpen")) {
                this.currentMenu = new Menu({firstTime: false});
                // Upgrade to BT5, use JS method instead of class addition
                const dropdown = Dropdown.getInstance(".nav-menu.nav.navbar-nav.desktop:first-child > .dropdown-toggle");

                dropdown.show();
            }
            else {
                this.currentMenu = new Menu();
            }
            // Nachdem die MapSize geändert wurde, muss die Map aktualisiert werden.
            channel.trigger("ready", this.currentMenu.id);
            if (!isReload) {
                Radio.trigger("Map", "updateSize");
            }
        }
    }
});

export default MenuLoader;
