import ItemTemplate from "text-loader!./template.html";

const ItemView = Backbone.View.extend({
    events: {
        "click": "click"
    },
    initialize: function () {

        this.render();
        this.setCssClass();
    },
    tagName: "li",
    className: "dropdown dropdown-tools",
    template: _.template(ItemTemplate),
    render: function () {
        const attr = this.model.toJSON();

        $("#" + this.model.get("parentId")).append(this.$el.html(this.template(attr)));
        return this;
    },

    /**
     * Abhängig davon ob ein Viepoint in die Menüleiste oder unter dem Punkt Ansichten gezeichnet wird,
     * bekommt die View eine andere CSS-Klasse zugeordent
     * @returns {void}
     */
    setCssClass: function () {
        if (this.model.get("parentId") === "root") {
            this.$el.addClass("viewpoint-style");
            this.$el.find("span").addClass("d-md-none d-lg-inline-block");
        }
        else {
            this.$el.addClass("viewpoint-style");
        }
    },
    click: function () {
        this.model.activateViewpoint();
    }
});

export default ItemView;
