import Button3dTemplate from "text-loader!./template.html";
import Button3dTemplateTable from "text-loader!./templateTable.html";
import Button3dModel from "./model";
import store from "../../../src/app-store";
import Dropdown from "bootstrap/js/dist/dropdown";
/**
 * @member Button3dTemplate
 * @description Template used for the 3D Button
 * @memberof Controls.Button3D
 */

const Button3dView = Backbone.View.extend(/** @lends Button3dView.prototype */{
    events: {
        "click .button3D": "mapChange",
        "click div#3d-ansicht": "mapChange"
    },
    /**
     * @class Button3dView
     * @extends Backbone.View
     * @memberof Controls.Button3D
     * @constructs
     * @description This control gives a user the 3D interface in the map.
     * @fires Core#RadioRequestUtilGetUiStyle
     * @fires Core#RadioRequestMapIsMap3d
     * @fires Core.ModelList#RadioTriggerModelListToggleWfsCluster
     * @fires Core#RadioTriggerMapDeactivateMap3d
     * @fires Alerting#RadioTriggerAlertAlertRemove
     * @fires Tools.Filter#RadioTriggerFilterEnable
     * @fires Core#RadioTriggerObliqueMapDeactivate
     * @fires Tools.Filter#RadioTriggerFilterDisable
     * @fires Core#RadioTriggerMapActivateMap3d
     * @fires Alerting#RadioTriggerAlertAlert
     * @fires Core.ModelList.Tool#RadioRequestToolGetSupportedOnlyIn3d
     * @fires Core.ModelList.Tool#RadioRequestToolGetSupportedIn3d
     * @fires Core.ModelList.Tool#RadioRequestToolGetSupportedOnlyInOblique
     * @fires Core.ModelList.Tool#RadioRequestToolGetCollection
     * @listens Controls.Button3d#changeButtonTitle
     * @listens Controls.Button3d#changeOpenView3dText
     * @listens Controls.Button3d#changeCloseView3dText
     * @listens Core#RadioTriggerMapChange
     */
    initialize: function () {
        const channel = Radio.channel("Map"),
            style = Radio.request("Util", "getUiStyle");

        this.model = new Button3dModel();
        channel.on({
            "change": this.change,
            "mapChangeTo3d": this.mapChange
        }, this);

        this.listenTo(this.model, {
            "change": function () {
                const changed = this.model.changed;

                if (changed.buttonTitle || changed.openView3dText || changed.closeView3dText) {
                    if (style === "DEFAULT") {
                        this.render();
                    }
                    else if (style === "TABLE") {
                        this.renderToToolbar();
                    }
                }
            }
        });


        if (style === "DEFAULT") {
            this.render();
        }
        else if (style === "TABLE") {
            this.renderToToolbarInit();
        }
    },

    /**
     * Shows the 3D button as selected.
     * Shows the 3D button as not selected.
     * @param  {String} mapMode - map mode of the map.
     * @returns {void}
     */
    change: function (mapMode) {
        if (mapMode === "3D") {
            // 3d close
            this.$("#button3D").addClass("toggleButtonPressed");
            this.$("#3d-titel-open").hide();
            this.$("#3d-titel-close").show();
        }
        else {
            // 3d open
            this.$("#button3D").removeClass("toggleButtonPressed");
            this.$("#3d-titel-close").hide();
            this.$("#3d-titel-open").show();
        }
    },
    /**
     * Render Function
     * @fires Core#RadioRequestMapIsMap3d
     * @returns {Button3dView} - Returns itself
     */
    render: function () {
        const attr = this.model.toJSON(),
            template = _.template(Button3dTemplate);

        this.$el.html(template(attr));
        if (Radio.request("Map", "isMap3d")) {
            this.$("#button3D").addClass("toggleButtonPressed");
        }

        return this;
    },

    /**
     * initial render function for the table UiStyle - this is necessary because $el has classes attached that are styled for red buttons (which are not used in table style)
     * @pre the bound element $e is in its initial state (with some css classes)
     * @post the table template is attached to $el, $el has been striped from its css classes and $el is append to the list #table-tools-menu
     * @returns {void}  -
     */
    renderToToolbarInit: function () {
        this.renderToToolbar();

        // remove all css classes of main element because this is not a red button
        this.$el.attr("class", "");
        $("#table-tools-menu").append(this.$el);
    },

    /**
     * render function for the table UiStyle
     * @pre the bound element $e is something
     * @post the table template is attached to $el
     * @fires Core#RadioRequestMapIsMap3d
     * @returns {Button3dView} - Returns itself
     */
    renderToToolbar: function () {
        const attr = this.model.toJSON(),
            templateTable = _.template(Button3dTemplateTable);

        this.$el.html(templateTable(attr));
        if (Radio.request("Map", "isMap3d")) {
            this.$("#3d-ansicht").addClass("toggleButtonPressed");
        }
        return this;
    },

    /**
     * Shows the map in 3D-mode if 3d button is activated.
     * Shows the map in 2D-mode if the 3d button is deactivated.
     * @fires Core.ModelList.Tool#RadioRequestToolGetSupportedOnlyIn3d
     * @fires Core.ModelList.Tool#RadioRequestToolGetSupportedIn3d
     * @fires Core.ModelList.Tool#RadioRequestToolGetSupportedOnlyInOblique
     * @fires Core.ModelList.Tool#RadioRequestToolGetCollection
     * @fires ObliqueMap#RadioRequestObliqueMapIsActive
     * @fires Core#RadioRequestMapIsMap3d
     * @param {Event} evt - click event
     * @return {void}
     */
    mapChange: function (evt) {
        // stop bubbling up to parent elements
        if (evt) {
            evt.stopPropagation();
        }
        const supportedOnlyIn3d = Radio.request("Tool", "getSupportedOnlyIn3d"),
            supportedIn3d = Radio.request("Tool", "getSupportedIn3d"),
            supportedOnlyInOblique = Radio.request("Tool", "getSupportedOnlyInOblique"),
            modelCollection = Radio.request("Tool", "getCollection"),
            activeTools = modelCollection !== undefined ? modelCollection.where({"type": "tool", "isActive": true}) : [],
            activeVueToolNames = store.getters["Tools/getActiveToolNames"];

        if (Radio.request("Map", "isMap3d")) {
            this.controlsMapChangeClose3D(activeTools, supportedOnlyIn3d);
        }
        else if (Radio.request("ObliqueMap", "isActive")) {
            this.controlsMapChangeCloseOblique(activeTools, supportedOnlyInOblique);
        }
        else {
            this.controlsMapChangeClose2D(activeTools, activeVueToolNames, supportedIn3d);
        }
    },

    /**
     * Controls the surface of the portal when leaving the 3D mode.
     * @param {Backbone.Collection} activeTools contains all activated tools
     * @param {String[]} supportedOnlyIn3d contains all tools that are only supported in 3D-Modues
     * @fires Core.ModelList#RadioTriggerModelListToggleWfsCluster
     * @fires Core#RadioTriggerMapDeactivateMap3d
     * @fires Alerting#RadioTriggerAlertAlert
     * @fires Tools.Filter#RadioTriggerFilterEnable
     * @returns {void}
     */
    controlsMapChangeClose3D: function (activeTools, supportedOnlyIn3d) {
        Radio.trigger("ModelList", "toggleWfsCluster", true);
        Radio.trigger("Map", "deactivateMap3d");
        Radio.trigger("Alert", "alert:remove");
        Radio.trigger("Filter", "enable");
        this.$("#3d-titel-close").hide();
        this.$("#3d-titel-open").show();
        this.model.setButtonTitle("3D");

        activeTools.forEach(tool => {
            if (supportedOnlyIn3d.includes(tool.get("id"))) {
                tool.setIsActive(false);
            }
        });

        if (document.getElementById("root").hasChildNodes()) {
            // Upgrade to BT5, use JS method instead of class removal
            const dropdown = Dropdown.getInstance(document.getElementById("root").firstChild.querySelector(".dropdown-toggle"));

            dropdown.hide();
        }
    },

    /**
     * Controls the surface of the portal when leaving the Oblique mode.
     * @param {Backbone.Collection} activeTools contains all activated tools
     * @param {String[]} supportedOnlyInOblique contains all tools that are only supported in Oblique-Modues
     * @listens Core#RadioTriggerMapChange
     * @fires Core#RadioTriggerObliqueMapDeactivate
     * @returns {void}
     */
    controlsMapChangeCloseOblique: function (activeTools, supportedOnlyInOblique) {
        Radio.once("Map", "change", function (map) {
            if (map === "2D") {
                this.mapChange();
            }
        }.bind(this));
        Radio.trigger("ObliqueMap", "deactivate");
        activeTools.forEach(tool => {
            if (!supportedOnlyInOblique.includes(tool.get("id"))) {
                tool.setIsActive(false);
            }
        });
    },

    /**
     * Controls the surface of the portal when leaving the 2D mode.
     * @param {Backbone.Collection} activeTools contains all activated tools
     * @param {String[]} activeVueToolNames contains names of active vue tools
     * @param {String[]} supportedIn3d contains all tools that are supported in 3D-Modues
     * @fires Tools.Filter#RadioTriggerFilterDisable
     * @fires Core.ModelList#RadioTriggerModelListToggleWfsCluster
     * @fires Core#RadioTriggerMapActivateMap3d
     * @fires Alerting#RadioTriggerAlertAlert
     * @returns {void}
     */
    controlsMapChangeClose2D: function (activeTools, activeVueToolNames, supportedIn3d) {
        activeTools.forEach(tool => {
            if (!supportedIn3d.includes(tool.get("id"))) {
                tool.setIsActive(false);
            }
        });
        activeVueToolNames.forEach(toolName => {
            if (!supportedIn3d.find(name => name.toLowerCase() === toolName.toLowerCase())) {
                store.dispatch("Tools/setToolActive", {id: toolName, active: false});
            }
        });
        // wait until vue tool is closed
        setTimeout(() => {
            this.$("#3d-titel-open").hide();
            this.$("#3d-titel-close").show();
            Radio.trigger("Filter", "disable");
            Radio.trigger("ModelList", "toggleWfsCluster", false);
            Radio.trigger("Map", "activateMap3d");
            this.model.setButtonTitle("2D");

            this.open3dCatalog();
        }, 200);
    },

    /**
     * Trigger to the ModelList to open the tree to show the 3d data
     * @returns {void}
     */
    open3dCatalog: function () {
        const layer3d = Radio.request("ModelList", "getModelByAttributes", {parentId: "3d_daten", isVisibleInMap: true});

        if (layer3d) {
            Radio.trigger("ModelList", "showModelInTree", layer3d.get("id"));
        }
    }
});

export default Button3dView;
