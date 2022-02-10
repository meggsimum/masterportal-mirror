import Template from "text-loader!./template.html";
import Model from "./model";

const LanguageView = Backbone.View.extend(/** @lends LanguageView.prototype */{
    /**
     * @class LanguageView
     * @extends Backbone.View
     * @memberof language
     * @constructs
     */
    initialize: function () {
        this.model = new Model();

        this.listenTo(this.model, {
            "change:isActive": this.render,
            "change:activeCode": this.render
        });

        this.render();
    },

    className: "language-switch",
    id: "languagebar",
    template: _.template(Template),
    /**
     * Render function for view in an overlay.
     * @returns {void}
     */
    render: function () {
        const attr = this.model.toJSON();

        this.$el.html(this.template(attr));
        this.bindShowLanguageList(this.$el);
        this.bindChangeLanguage(this.$el);
        this.bindClosePopup(this.$el);
        this.model.setOverlayElement(this.$el[0]);

        // Add languagebar to footer if availible. For both cases different styles are apllied (by style.scss).
        if ($("#map > div.ol-viewport > div.footer").length > 0) {

            const scaleLineElement = $("#map > div.ol-viewport > div.footer > div.scale-line");

            // languagebar should be the most right element
            if (scaleLineElement.length > 0) {
                scaleLineElement.before(this.$el);
            }
            else {
                $("#map > div.ol-viewport > div.footer").append(this.$el);
            }
        }
        else if (document.getElementsByClassName("ol-viewport").length > 0) {
            $("#map > div.ol-viewport > div.ol-overlaycontainer-stopevent").append(this.$el);
        }

        return this;
    },

    /**
     * show the popup window of the language list
     * @param {Object} content - the content of current element
     * @returns {void}
     */
    bindShowLanguageList: function (content) {
        content.find(".currentLan").click(function () {
            content.find(".popup-language").show();
        });
    },

    /**
     * change the language when one option is selected
     * @param {Object} content - the content of current element
     * @returns {void}
     */
    bindChangeLanguage: function (content) {
        const lngLink = content.find("a.lng");

        lngLink.unbind("click");
        lngLink.click(function () {
            i18next.changeLanguage($(this).data("code"));
            content.find(".popup-language").hide();
        });
    },

    /**
     * close the popup window of the language list
     * @param {Object} content - the content of current element
     * @returns {void}
     */
    bindClosePopup: function (content) {
        content.find(".lng-header span").click(function () {
            content.find(".popup-language").hide();
        });
    }
});

export default LanguageView;
