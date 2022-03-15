import ButtonObliqueTemplate from "text-loader!./template.html";
import ButtonObliqueTemplateTable from "text-loader!./templateTable.html";
import ButtonObliqueModel from "./model";
import store from "../../../src/app-store";

/**
 * @member ButtonObliqueTemplate
 * @description Template used for the "oblique aerial photos" button
 * @memberof Controls.ButtonOblique
 */
/**
 * @member ButtonObliqueTemplateTable
 * @description tableTemplate used for the ObliqueMap in Table View Tools
 * @memberof Controls.ButtonOblique
 */

const ButtonObliqueView = Backbone.View.extend(/** @lends ButtonObliqueView.prototype */{
    events: {
        "click .buttonOblique": "mapChange",
        "click div#ObliqueTable": "mapChange"
    },
    /**
     * @class ButtonObliqueView
     * @extends Backbone.View
     * @memberof Controls.ButtonOblique
     * @constructs
     * @description This control shows a user an oblique aerial picture
     * @fires ObliqueMap#RadioRequestObliqueMapIsActive
     * @fires ObliqueMap#RadioTriggerObliqueMapDeactivate
     * @fires Alerting#RadioTriggerAlertAlertRemove
     * @fires Core#RadioRequestMapIsMap3d
     * @fires ObliqueMap#RadioTriggerObliqueMapActivate
     * @fires Alerting#RadioTriggerAlertAlert
     * @listens Core#RadioTriggerMapChange
     * @listens Controls.ButtonOblique#changeButtonTitle
     * @listens Controls.ButtonOblique#changeOpenViewObliqueText
     * @listens Controls.ButtonOblique#changeCloseViewObliqueText
     */
    initialize: function () {
        const channel = Radio.channel("Map"),
            style = Radio.request("Util", "getUiStyle");

        this.model = new ButtonObliqueModel();
        channel.on({
            "change": this.change,
            "mapChangeToOblique": this.mapChange
        }, this);

        this.listenTo(this.model, {
            "change": function () {
                const changed = this.model.changed;

                if (changed.buttonTitle || changed.openViewObliqueText || changed.closeViewObliqueText) {
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
     * Shows the "Schrägluftbilder" button as selected.
     * Shows the "Schrägluftbilder" button as not selected.
     * @param  {string} map Mode of the map
     * @returns {void}
     */
    change: function (map) {
        if (map === "Oblique") {
            this.$("#buttonOblique").addClass("toggleButtonPressed");
        }
        else {
            this.$("#buttonOblique").removeClass("toggleButtonPressed");
        }
    },

    /**
     * Render Function
     * @fires ObliqueMap#RadioRequestObliqueMapIsActive
     * @returns {ButtonObliqueView} - Returns itself
     */
    render: function () {
        const attr = this.model.toJSON(),
            template = _.template(ButtonObliqueTemplate);

        this.$el.html(template(attr));
        if (Radio.request("ObliqueMap", "isActive")) {
            this.change("Oblique");
        }

        return this;
    },

    /**
     * initial render function for the table UiStyle - this is necessary because $el has classes attached that are styled for red buttons (which are not used in table style)
     * @pre the bound element $el is in its initial state (with some css classes)
     * @post the table template is attached to $el, $el has been striped from its css classes and $el is append to the list #table-tools-menu
     * @returns {Void}  -
     */
    renderToToolbarInit: function () {
        this.renderToToolbar();

        // remove all css classes of main element because this is not a red button
        this.$el.attr("class", "");
        $("#table-tools-menu").append(this.$el);
    },

    /**
     * render function for the table UiStyle
     * @pre the bound element $el is something
     * @post the table template is attached to $el
     * @fires Core#RadioRequestObliqueMapIsActive
     * @returns {ButtonObliqueView} - Returns itself
     */
    renderToToolbar: function () {
        const attr = this.model.toJSON(),
            templateTable = _.template(ButtonObliqueTemplateTable);

        this.$el.html(templateTable(attr));
        if (Radio.request("ObliqueMap", "isActive")) {
            this.$("#ObliqueTable").addClass("toggleButtonPressed");
        }
        return this;
    },

    /**
     * Shows the oblique aerial picture if the "Schräglüftbilder" button is activated.
     * Shows the map if the "Schräglüftbilder" button is deactivated.
     * @fires ObliqueMap#RadioRequestObliqueMapIsActive
     * @fires ObliqueMap#RadioTriggerObliqueMapDeactivate
     * @fires Alerting#RadioTriggerAlertAlertRemove
     * @fires Core#RadioRequestMapIsMap3d
     * @fires ObliqueMap#RadioTriggerObliqueMapActivate
     * @fires Alerting#RadioTriggerAlertAlert
     * @listens Core#RadioTriggerMapChange
     * @returns {void}
     */
    mapChange: function () {
        if (Radio.request("ObliqueMap", "isActive")) {
            Radio.trigger("ObliqueMap", "deactivate");
            Radio.trigger("Alert", "alert:remove");
            this.$("#ObliqueTable-title-close").hide();
            this.$("#ObliqueTable-title-open").show();
        }
        else if (navigator.userAgent.indexOf("Trident") > -1) {
            // IE11: show info
            store.dispatch("Alerting/addSingleAlert", {
                "category": "Info",
                "content": i18next.t("common:modules.controls.oblique.doNotUseIE"),
                "displayClass": "info"
            });
            return;
        }
        else if (Radio.request("Map", "isMap3d")) {
            Radio.once("Map", "change", function (map) {
                if (map === "2D") {
                    this.mapChange();
                }
            }.bind(this));
            store.dispatch("Maps/deactivateMap3D");
            return;
        }
        this.$("#ObliqueTable-title-open").hide();
        this.$("#ObliqueTable-title-close").show();
        Radio.trigger("ObliqueMap", "activate");
    }
});

export default ButtonObliqueView;
