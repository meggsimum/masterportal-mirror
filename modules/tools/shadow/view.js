import ShadowTemplate from "text-loader!./template.html";
import SnippetSliderView from "../../snippets/slider/view";
import SnippetCheckBoxView from "../../snippets/checkbox/view";
import SnippetDatepickerView from "../../snippets/datepicker/view";
/**
 * @member ShadowTemplate
 * @description Template used to style the shadow tool
 * @memberof Tools.Shadow
 */
const ShadowView = Backbone.View.extend(/** @lends ShadowView.prototype */{
    /**
     * @class ShadowView
     * @extends Backbone.View
     * @memberof Tools.Shadow
     * @constructs
     * @fires Core#RadioRequestUtilGetUiStyle
     * @listens Menu#RadioTriggerMenuLoaderReady
     */

    events: {
        "click .x-icon": "destroy"
    },

    /**
     * Initializing module
     * @fires Core#RadioRequestUtilGetUiStyle
     * @listens Menu#RadioTriggerMenuLoaderReady
     * @returns {void}
     */
    initialize: function () {
        this.listenTo(this.model, {
            "change:isActive": this.render,
            "toggleButtonValueChanged": this.toggleElements,
            "change:currentLng": () => {
                this.rerender();
            }
        });

        if (Radio.request("Util", "getUiStyle") === "TABLE") {
            this.listenTo(Radio.channel("MenuLoader"), {
                "ready": function () {
                    this.setElement("#table-tools-menu");
                    this.renderToToolbar();
                }
            });
        }
    },

    template: _.template(ShadowTemplate),
    tabletemplate: _.template("<div id='shadow-tool' class='table-tool'><a href='#'><span class='bootstrap-icon'><i class='<%= icon %>'></i></span><span id='shadow-tool_title'><%= name %></span></a> </div>"),

    /**
     * render method
     * @returns {this} this
     */
    render: function () {
        if (this.model.get("isActive")) {
            this.ensureSnippetsReady();
            this.setElement(document.getElementsByClassName("win-body")[0]);
            this.$el.html(this.template({}));
            this.$el.append(this.toggleButtonView.render().el);
            this.$el.append(this.datepickerView.render().el);
            this.$el.append(this.timesliderView.render().el);
            this.$el.append(this.datesliderView.render().el);
            this.toggleElements(this.model.get("isShadowEnabled"));
            this.model.toggleShadow(this.model.get("isShadowEnabled"));
            this.delegateEvents();
        }
        else {
            this.undelegateEvents();
        }
        $("#window .win-heading span.bootstrap-icon.x-icon").trigger("focus");
        return this;
    },

    rerender: async function () {
        if (this.model.get("isActive")) {
            await this.datepickerView.rerender();
            this.setElement(document.getElementsByClassName("win-body")[0]);
            this.$el.html(this.template({}));
            this.$el.append(this.toggleButtonView.render().el);
            this.$el.append(this.datepickerView.render().el);
            this.$el.append(this.timesliderView.render().el);
            this.$el.append(this.datesliderView.render().el);
            this.toggleElements(this.model.get("isShadowEnabled"));
            this.model.toggleShadow(this.model.get("isShadowEnabled"));
            document.getElementsByClassName("title-checkbox")[0].firstChild.nextSibling.innerText = this.model.get("shadowDisplay");
            document.getElementsByClassName("title-values")[0].children[0].children[0].innerText = String(this.model.get("time"));
            document.getElementsByClassName("title-values")[1].children[0].children[0].innerText = String(this.model.get("date"));
            this.delegateEvents();
            $("#window .win-heading span.bootstrap-icon.x-icon").trigger("focus");
        }
        return this;
    },

    /**
     * Ensures all snippet models are ready
     * @returns {void}
     */
    ensureSnippetsReady: function () {
        if (this.model.get("snippetsReady") === false) {
            this.model.prepareSnippets();
            this.toggleButtonView = new SnippetCheckBoxView({model: this.model.get("toggleButton")});
            this.datepickerView = new SnippetDatepickerView({model: this.model.get("datepicker")});
            this.timesliderView = new SnippetSliderView({model: this.model.get("timeslider")});
            this.datesliderView = new SnippetSliderView({model: this.model.get("dateslider")});
        }
    },

    /**
     * Render Function for template in table-tool
     * @returns {this} this
     */
    renderToToolbar: function () {
        this.$el.append(this.tabletemplate(this.model.toJSON()));

        return this;
    },

    /**
     * Toggles slider elements according to the checkbox state
     * @param   {boolean} chkBoxValue Value of the checkbox
     * @returns {void}
     */
    toggleElements: function (chkBoxValue) {
        this.$el.find(".slider-container, .datepicker-container").each(function (index, slider) {
            if (chkBoxValue) {
                slider.style.display = "block";
            }
            else {
                slider.style.display = "none";
            }
        });
    }
});

export default ShadowView;
