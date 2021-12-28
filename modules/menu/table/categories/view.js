import Template from "text-loader!./template.html";
import Collapse from "bootstrap/js/dist/collapse";

const CategoryView = Backbone.View.extend({
    events: {
        "click #table-nav-cat-panel-toggler": "toggleCategoryMenu"
    },
    /**
     * @listens Map#RadioTriggerMapChange
     * @return {void} -
     */
    initialize: function () {
        this.listenTo(Radio.channel("TableMenu"), {
            "hideMenuElementCategory": this.hideCategoryMenu
        });

        this.listenTo(Radio.channel("Map"), {
            "change": function (mapMode) {
                if (mapMode === "3D" || mapMode === "Oblique") {
                    this.disableCategoryButton();
                }
                else if (mapMode === "2D") {
                    this.enableCategoryButton();
                }
            }
        });
        this.$el.on("show.bs.collapse", function () {
            Radio.request("TableMenu", "setActiveElement", "Category");
        });

        this.render();
    },
    render: function () {
        $("#table-nav").append(this.$el.html(this.template()));
        if (Radio.request("TableMenu", "getActiveElement") === "Category") {
            // Upgrade to BT5
            const collapse = Collapse.getInstance($("#table-nav-cat-panel").get(0));

            collapse.show();
        }
        return this;
    },
    id: "table-category-list",
    className: "table-category-list table-nav col-lg-2",
    template: _.template(Template),
    toggleCategoryMenu: function () {
        if (this.$(".table-nav-cat-panel").hasClass("show")) {
            this.hideCategoryMenu();
        }
        else if (!this.$el.hasClass("disableCategoryButton")) {
            this.showCategoryMenu();
        }
    },
    hideCategoryMenu: function () {
        this.$(".table-nav-cat-panel").removeClass("show");
        this.$el.removeClass("table-category-active");
        Radio.trigger("TableMenu", "deactivateCloseClickFrame");
    },
    showCategoryMenu: function () {
        this.$el.addClass("table-category-active");
        this.$(".table-nav-cat-panel").addClass("show");
        this.$("div.btn-group.header").hide();

        if (this.$("#table-nav").attr("class") === "table-nav-0deg" || this.$("#table-nav").attr("class") === "table-nav-180deg") {
            this.$("#table-nav-cat-panel").css({
                "left": ""
            });
            this.$("#funnel").css({
                "left": ""
            });
        }
        else if (this.$("#table-nav").attr("class") === "table-nav-270deg" || this.$("#table-nav").attr("class") === "table-nav-90deg") {
            this.$("#table-nav-cat-panel").css({
                "left": "-170px"
            });
            this.$("#funnel").css({
                "left": "175px"
            });
        }

        Radio.request("TableMenu", "setActiveElement", "Category");
    },
    disableCategoryButton: function () {
        this.$("#table-nav-cat-panel-icon").addClass("disableCategoryIcon");
        this.$el.addClass("disableCategoryButton");
    },
    enableCategoryButton: function () {
        this.$("#table-nav-cat-panel-icon").removeClass("disableCategoryIcon");
        this.$el.removeClass("disableCategoryButton");
    }
});

export default CategoryView;
