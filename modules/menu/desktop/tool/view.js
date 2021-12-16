import ItemTemplate from "text-loader!./template.html";
import store from "../../../../src/app-store/index";
import Dropdown from "bootstrap/js/dist/dropdown";
/**
 * @member ToolTemplate
 * @description Template for a Tool
 * @memberof Menu.Desktop.Tool
 */
const ToolView = Backbone.View.extend(/** @lends ToolView.prototype */{
    events: {
        "click": "checkItem",
        "keydown": "checkItem"

    },
    /**
    * @class ToolView
    * @extends Backbone.View
    * @memberof Menu.Desktop.Tool
    * @constructs
    * @fires Map#RadioRequestMapGetMapMode
    * @listens Map#RadioTriggerMapChange
    */
    initialize: function () {
        this.listenTo(this.model, {
            "change:isActive": this.toggleIsActiveClass
        });
        // Listener for addOns so that multilanguage geht initially adjusted.
        this.listenTo(this.model, {
            "change:name": this.rerender,
            "change:bootstrap-icon": this.rerender
        });
        this.listenTo(Radio.channel("Map"), {
            "change": function (mode) {
                this.toggleSupportedVisibility(mode);
            }
        });
        this.render();
        this.toggleSupportedVisibility(Radio.request("Map", "getMapMode"));
        this.setCssClass();
        this.toggleIsActiveClass();
    },
    tagName: "li",
    className: "dropdown",
    template: _.template(ItemTemplate),
    /**
     * @todo Write the documentation.
     * @returns {this} this
     */
    render: function () {
        const attr = this.translateName(this.model.toJSON());

        if (this.model.get("isVisibleInMenu") !== false) {
            $("#" + this.model.get("parentId")).append(this.$el.html(this.template(attr)));
        }
        return this;
    },

    /**
     * Rerenders the view. Gets triggered on name change
     * @returns {void}
     */
    rerender: function () {
        const attr = this.model.toJSON();

        this.$el.html(this.template(attr));
    },

    /**
     * Looks for the key "translate#" in the name of the model. If found the name will be translated.
     * The name is not yet translated, because it is from an addon.
     * @param {Array} attr attributes of this model
     * @returns {Array} attributes of this model maybe with translated name, if necessary
     */
    translateName: function (attr) {
        if (attr.name && attr.name.indexOf("translate#") === 0) {
            // addons-model: name is not translated in app.js, must be done here
            const translationKey = attr.name.substr("translate#".length);

            if (i18next.exists(translationKey)) {
                const name = i18next.t(translationKey);

                this.model.set("name", name);
                attr.name = name;
            }
        }
        return attr;
    },


    /**
     * Controls which tools are available in 2D, 3D and Oblique modes.
     * @param {String} mode Flag of the view mode
     * @returns {void}
     */
    toggleSupportedVisibility: function (mode) {
        const modelId = this.model.get("id"),
            supportedIn3d = this.model.get("supportedIn3d"),
            supportedOnlyIn3d = this.model.get("supportedOnlyIn3d"),
            supportedInOblique = this.model.get("supportedInOblique");

        if (mode === "2D" && !supportedOnlyIn3d.includes(modelId)) {
            this.$el.show();
        }
        else if (mode === "3D" && (supportedIn3d.includes(modelId) || supportedOnlyIn3d.includes(modelId))) {
            this.$el.show();
        }
        else if (mode === "Oblique" && supportedInOblique.includes(modelId)) {
            this.$el.show();
        }
        else {
            this.$el.hide();
        }
    },

    /**
     * Abhängig davon ob ein Tool in die Menüleiste oder unter dem Punkt Werkzeuge gezeichnet wird,
     * bekommt die View eine andere CSS-Klasse zugeordent
     * @returns {void}
     */
    setCssClass: function () {
        if (this.model.get("parentId") === "root") {
            this.$el.addClass("menu-style");
            this.$el.find("span").addClass("hidden-sm");
            this.$el.attr("title", this.model.get("name"));
        }
        else {
            this.$el.addClass("submenu-style");
        }
    },
    /**
     * @todo Write the documentation.
     * @returns {void}
     */
    toggleIsActiveClass: function () {
        if (this.model.get("isActive") === true) {
            this.$el.addClass("active");
        }
        else {
            this.$el.removeClass("active");
        }
    },
    /**
     * @todo Opens the selected tool.
     * @param {Event} event - the dom event
     * @returns {void}
     */
    checkItem: function (event) {
        if (event.type === "click" || event.which === 32 || event.which === 13) {

            event.preventDefault();
            event.stopPropagation();

            if (this.model.get("id") === "legend") {
                const isActive = this.model.get("isActive");

                this.model.setIsActive(!isActive);
                store.dispatch("Legend/setShowLegend", !isActive);
            }
            else {
                if (!this.model.collection) {
                    // addons are initialized with 'new Tool(attrs, options);' Then the model is replaced after importing the addon.
                    // In that case 'this.model' of this class has not full content, e.g. collection is undefined --> replace it by the new model in the list
                    this.model = Radio.request("ModelList", "getModelByAttributes", {id: this.model.id});
                    // for the highlighting in the menu -> view-model-binding is lost by addons
                    this.listenTo(this.model, {
                        "change:isActive": this.toggleIsActiveClass
                    });
                }
                if (!this.model.get("isActive")) {
                    // active the tool if it is not active
                    // deactivate all other modules as long as the tool is not set to "keepOpen"
                    this.model.collection.setActiveToolsToFalse(this.model);
                    this.model.setIsActive(true);
                    store.dispatch("Tools/setToolActive", {id: this.model.id, active: true});
                }
                else {
                    // deactivate tool if it is already active
                    this.model.setIsActive(false);
                    store.dispatch("Tools/setToolActive", {id: this.model.id, active: false});
                }
            }

            // menu navigation is closed
            $("div.collapse.navbar-collapse").removeClass("in");
            // Upgrade to BT5, use JS method instead of class removal
            const dropdown = Dropdown.getInstance("li.dropdown-folder > .dropdown-toggle.show");

            dropdown.hide();
            $(".dropdown-menu.fixed").removeClass("fixed");
            $(".bi-pin-angle-fill").removeClass("rotate-pin");
            $(".bi-pin-angle-fill").addClass("rotate-pin-back");
        }
    }
});

export default ToolView;
