import Template from "text-loader!./template.html";
import TemplateGroups from "text-loader!./templateGroups.html";
import "bootstrap-select";
// const bootstrap = window.bootstrap = require("bootstrap"); // without this bootstrap-select crashes with `undefined bootstrap`
// require("bootstrap-select/js/bootstrap-select"); // we have to manually require the working js file

/**
 * @member Template
 * @description Template for Dropdown Snippet
 * @memberof Snippets.Dropdown
 */
const DropdownView = Backbone.View.extend(/** @lends DropdownView.prototype */{
    /**
     * @class DropdownView
     * @extends Backbone.View
     * @memberof Snippets.Dropdown
     * @constructs
     */
    events: {
        // This event fires after the select's value has been changed
        "changed.bs.select": "updateSelectedValues",
        // This event is fired when the dropdown has been made visible to the user
        "shown.bs.select": "setIsOpen",
        // This event is fired when the dropdown has finished being hidden from the user
        "hidden.bs.select": "setIsOpen",
        // This event is fired when the info button is clicked
        "click .info-icon": "toggleInfoText"
    },

    initialize: function () {
        this.listenTo(this.model, {
            "render": this.render,
            "removeView": this.removeView
        });
    },
    model: {},
    className: "dropdown-container",
    template: _.template(Template),
    templateGroups: _.template(TemplateGroups),

    /**
     * renders the view depending on the isOpen attribute
     * @return {Object} - this
     */
    render: function () {
        let attr;

        if (this.model.get("isOpen") === false) {
            attr = this.model.toJSON();

            if (this.model.get("isGrouped")) {
                this.$el.html(this.templateGroups(attr));
            }
            else {
                this.$el.html(this.template(attr));
            }
            this.initDropdown();
            this.markSelectedValues();
        }
        this.delegateEvents();
        return this;
    },

    /**
     * inits the dropdown list
     * @see {@link http://silviomoreto.github.io/bootstrap-select/options/|Bootstrap-Select}
     * @returns {void}
     */
    initDropdown: function () {
        this.$el.find(".selectpicker").selectpicker({
            width: this.model.get("infoText") === undefined ? "100%" : "90%",
            selectedTextFormat: "static",
            size: this.model.get("numOfOptions")
        });
    },

    /**
     * marks the selected value(s) in the dropdown list
     * @return {void}
     */
    markSelectedValues: function () {
        const models = this.model.get("valuesCollection").where({isSelected: true}),
            values = [];

        models.forEach(model => {
            values.push(model.get("value"));
        });
        this.$el.find(".selectpicker").selectpicker("val", values);
    },

    /**
     * calls the function "updateSelectedValues" in the model
     * @param {Event} evt - changed
     * @returns {void}
     */
    updateSelectedValues: function (evt) {
        this.model.updateSelectedValues(this.$(evt.target).val());
    },

    /**
     * calls the function "setIsOpen" in the model depending on the event type
     * @param  {Event} evt - hidden || shown
     * @returns {void}
     */
    setIsOpen: function (evt) {
        if (evt.type === "shown") {
            this.model.setIsOpen(true);
            this.model.trigger("hideAllInfoText");
        }
        else {
            this.model.setIsOpen(false);
            this.render();
        }
    },

    toggleInfoText: function () {
        const isInfoTextVisible = this.$el.find(".info-text").is(":visible");

        if (!isInfoTextVisible) {
            this.model.trigger("hideAllInfoText");
            this.$el.find(".info-icon").css("opacity", "1");
            this.$el.find(".info-text").show();
        }
        else {
            this.$el.find(".info-icon").css("opacity", "0.4");
            this.$el.find(".info-text").hide();
        }
    },

    /**
     * calls the function "setIsOpen" in the model with parameter false
     * removes this view and its el from the DOM
     * @returns {void}
     */
    removeView: function () {
        this.model.setIsOpen(false);
        this.remove();
    }

});

export default DropdownView;
