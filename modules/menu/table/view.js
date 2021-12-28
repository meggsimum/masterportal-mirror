import MainTemplate from "text-loader!./main/template.html";
import TableNavModel from "./model";
import LayerListView from "./layer/listView";
import CategoryList from "./categories/view";
import ToolView from "./tool/view";
import CloseClickView from "./closeClickView";

const Menu = Backbone.View.extend({
    events: {
        "touchmove .icon-drag": "touchMoveMenu"
    },
    initialize: function () {
        this.render();
        this.renderLayerList();
        this.renderCategoryList();
        this.renderTools();
        this.hideContextMenu();

        this.listenTo(this.model, {
            "appendFilterContent": this.appendFilterContent
        });
    },
    model: new TableNavModel(),
    id: "table-navigation",
    className: "table-nav-0deg",
    template: _.template(MainTemplate),
    render: function () {

        $(this.el).html(this.template());
        $("#masterportal-container").append(this.$el);
        this.$el.draggable({
            containment: "#map",
            handle: ".icon-drag",
            drag: function () {
                const rotAngle = this.model.get("rotateAngle");

                if (rotAngle === 0 || rotAngle === 180) {
                    this.$el.css({

                        "-webkit-transform-origin": "50% 50%",
                        "-ms-transform-origin": "50% 50%",
                        "-moz-transform-origin": "50% 50%"
                    });
                }
                else if (rotAngle === 90) {
                    this.$el.css({

                        "-webkit-transform-origin": "5% 50%",
                        "-ms-transform-origin": "5% 50%",
                        "-moz-transform-origin": "5% 50%"
                    });
                }
                else if (rotAngle === 270) {
                    this.$el.css({

                        "-webkit-transform-origin": "240px 240px",
                        "-ms-transform-origin": "240px 240px",
                        "-moz-transform-origin": "240px 240px"
                    });
                }
            }.bind(this),
            stop: function (evt, ui) {
                const pos = ui.helper.offset(),
                    x = pos.left,
                    y = pos.top;

                this.placeMenu(x, y);
            }.bind(this)
        });

        new CloseClickView().render();

        return this;
    },
    renderLayerList: function () {
        this.$el.find("#table-nav-main").append(new LayerListView().render().$el);
    },
    renderCategoryList: function () {
        new CategoryList();
    },
    renderTools: function () {
        new ToolView();
    },
    hideContextMenu: function () {
        $("body").attr("oncontextmenu", "return false;");
    },
    /**
     * add HTML content to the Categories Window
     * @param {DOM} element - from a tool view
     * @returns {void}
     */
    appendFilterContent: function (element) {
        this.$el.find(".table-filter-container").append(element);
    },
    touchMoveMenu: function (evt) {

        const touch = evt.originalEvent.touches[0],
            x = touch.clientX - 20,
            y = touch.clientY - 20,
            rotateAngle = this.model.getRotateAngle(),
            menuWidth = $("#table-navigation").width(),
            menuHeight = $("#table-navigation").height();

        if (rotateAngle === 0) {
            this.$el.css({
                "left": x + "px",
                "top": y + "px"
            });
        }
        else if (rotateAngle === 90) {
            this.$el.css({
                "left": x - menuWidth / 2 + menuHeight / 2 + "px",
                "top": y + menuWidth / 2 - menuHeight / 2 + "px"
            });
        }
        else if (rotateAngle === 180) {
            this.$el.css({
                "left": x - menuWidth + menuHeight / 2 + "px",
                "top": y + "px"
            });
        }
        else if (rotateAngle === 270) {
            this.$el.css({
                "left": x - menuWidth / 2 + menuHeight / 2 + "px",
                "top": y - menuWidth / 2 + "px"
            });
        }

        this.$el.on("touchend", function () {
            this.placeMenu(x, y);
        }.bind(this));

    },
    placeMenu: function (x, y) {
        const currentClass = $("#table-navigation").attr("class"),
            minPos = this.calcSnapPosition(x, y);
        let posClass;

        if (minPos === 0) {
            posClass = "table-nav-0deg";
            this.model.setRotateAngle(0);
        }
        else if (minPos === 1) {
            posClass = "table-nav-90deg";
            this.model.setRotateAngle(90);
        }
        else if (minPos === 2) {
            posClass = "table-nav-180deg";
            this.model.setRotateAngle(180);
        }
        else if (minPos === 3) {
            posClass = "table-nav-270deg";
            this.model.setRotateAngle(270);
        }

        this.$el.removeClass(currentClass);
        this.$el.addClass(posClass);
        this.$el.removeAttr("style");
    },
    calcSnapPosition (x, y) {
        const mapWidth = Math.round($(".masterportal-container").width()),
            mapHeight = Math.round($(".masterportal-container").height()),
            distArray = [],
            // calculate the distances of the current finger position to the middle positions of each side
            distBottom = Math.sqrt((mapWidth / 2 - x) * (mapWidth / 2 - x) + (mapHeight - y) * (mapHeight - y)),
            distLeft = Math.sqrt((0 - x) * (0 - x) + (mapHeight / 2 - y) * (mapHeight / 2 - y)),
            distTop = Math.sqrt((mapWidth / 2 - x) * (mapWidth / 2 - x) + (0 - y) * (0 - y)),
            distRight = Math.sqrt((mapWidth - x) * (mapWidth - x) + (mapHeight / 2 - y) * (mapHeight / 2 - y));

        let minDist = "",
            minPos = "";

        distArray.push(distBottom);
        distArray.push(distLeft);
        distArray.push(distTop);
        distArray.push(distRight);
        minDist = Math.min(...distArray);
        minPos = distArray.indexOf(minDist);

        return minPos;
    }
});

export default Menu;
