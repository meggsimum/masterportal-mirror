import ItemTemplate from "text-loader!./template.html";
import store from "../../../../src/app-store/index";

const ItemView = Backbone.View.extend({
    events: {
        "click": "checkItem"
    },
    initialize: function () {
        this.listenTo(this.model, {
            "change:isVisibleInTree": this.removeIfNotVisible
        });
    },
    tagName: "li",
    className: "list-group-item",
    template: _.template(ItemTemplate),
    render: function () {
        const attr = this.translateName(this.model.toJSON());

        this.$el.html(this.template(attr));
        return this;
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
    checkItem: function () {
        if (!this.model.collection) {
            // addons are initialized with 'new Tool(attrs, options);' Then the model is replaced after importing the addon.
            // In that case 'this.model' of this class has not full content, e.g. collection is undefined --> replace it by the new model in the list
            this.model = Radio.request("ModelList", "getModelByAttributes", {id: this.model.id});
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

        // Navigation is closed
        $("div.collapse.navbar-collapse").removeClass("show");
    },
    removeIfNotVisible: function () {
        if (!this.model.get("isVisibleInTree")) {
            this.remove();
        }
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
    }
});

export default ItemView;

