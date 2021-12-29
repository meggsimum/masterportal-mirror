import Template from "text-loader!./template.html";

const BreadCrumbView = Backbone.View.extend({
    events: {
        "click": "removeItems"
    },
    initialze: function () {
        this.listenTo(this.model, {
            "remove": this.remove
        });
    },
    tagName: "li",
    className: "breadcrumb-item",
    template: _.template(Template),

    /**
     * Zeichnet das Item und gibt es an die ListView zurück
     * @return {Backbone.View} this
     */
    render: function () {
        const attr = this.model.toJSON();

        this.$el.html(this.template(attr));
        return this;
    },

    removeItems: function () {
        this.model.removeItems();
    }
});

export default BreadCrumbView;
