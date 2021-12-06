import Window from "./model";
import templateMax from "text-loader!./templateMax.html";
import templateTable from "text-loader!./templateTable.html";
import "jquery-ui/ui/widgets/draggable";

/**
 * @member WindowViewTemplateMax
 * @description Template used to create the Tool Window maximised
 * @memberof WindowView
 */
/**
 * @member WindowViewTemplateTable
 * @description Template used to create Tool Window for the touch table
 * @memberof WindowView
 */

const WindowView = Backbone.View.extend(/** @lends WindowView.prototype */{
    events: {
        "click .minimize-icon": "minimize",
        "keydown .minimize-icon": "minimize",
        "click .header-min": "maximize",
        "keydown .header-min": "maximize",
        "click .x-icon": "hide",
        "keydown .x-icon": "hide",
        "touchend .x-icon": "hide",
        "touchend .header-min": "maximize",
        "touchmove .title": "touchMoveWindow",
        "touchstart .title": "touchStartWindow",
        "touchend .title": "touchMoveEnd",
        "pointerdown .resize-icon": "resizeWindowStart"
    },

    /**
     * @class WindowView
     * @extends Backbone.View
     * @memberof Window
     * @constructs
     * @fires Core.ModelList#RadioTriggerModelListToggleDefaultTool
     * @fires Core#RadioRequestUtilGetUiStyle
     * @fires Core.ModelList#RadioRequestModelListGetModelByAttributes
     * @fires Core.ModelList#RadioTriggerModelListToggleDefaultTool
     * @listens WindowView#changeIsVisible
     * @listens WindowView#changeWinType
     * @listens WindowView#RadioTriggerWindowHide
     */
    initialize: function () {
        const channel = Radio.channel("WindowView");

        this.listenTo(this.model, {
            "change:isVisible change:winType change:minimizeText change:closeText": this.render
        });

        this.$el.draggable({
            containment: "#map",
            handle: ".move",
            start: function (event, ui) {
                // As .draggable works by manipulating the css top and left values the following code is necessary if the bottom and right values
                // are used for the positioning of the tool window (as is the case for the table tool window). Otherwise dragging the window will
                // resize the window if no height and width values are set.
                ui.helper.css({
                    right: "auto",
                    bottom: "auto"
                });
            },
            stop: function (event, ui) {
                ui.helper.css({"height": "", "width": ""});
            }
        });
        this.$el.css({
            "max-height": window.innerHeight - 100 // 100 fixed value for navbar &co.
        });

        $(window).resize($.proxy(function () {
            this.$el.css({
                "max-height": window.innerHeight - 100, // 100 fixed value for navbar &co.
                "overflow": "auto"
            });
        }, this));

        window.addEventListener("pointermove", this.resizeWindowMove.bind(this));
        window.addEventListener("pointerup", this.resizeWindowEnd.bind(this));

        channel.on({
            "hide": this.hide
        }, this);

        this.render();
    },
    id: "window",
    className: "tool-window ui-widget-content",
    model: new Window(),

    /**
     * @member templateMax
     * @description todo
     * @memberof Window
     */
    templateMax: _.template(templateMax),

    /**
     * @member templateTable
     * @description todo
     * @memberof Window
     */
    templateTable: _.template(templateTable),
    dragging: false,

    /**
     * Renders the Window.
     * @fires Core#RadioRequestUtilGetUiStyle
     * @return {Backbone.View} this context.
     */
    render: function () {
        const attr = this.model.toJSON();
        let currentClass = "",
            currentTableClass = "";

        if (this.model.get("isVisible") === true) {
            this.resetSize();

            if (Radio.request("Util", "getUiStyle") === "TABLE") {
                this.$el.html(this.templateTable(attr));
                document.getElementById("masterportal-container").appendChild(this.el);
                currentClass = $("#window").attr("class").split(" ");

                this.$el.addClass("table-tool-win-all");

                currentClass.forEach(item => {
                    if (item.startsWith("table-tool-window")) {
                        currentTableClass = item;
                    }
                });

                if ($("#table-navigation").attr("class") === "table-nav-0deg ui-draggable" || $("#table-navigation").attr("class") === "table-nav-0deg") {
                    this.$el.removeClass(currentTableClass);
                    this.$el.addClass("table-tool-window");
                    this.model.set("rotationAngle", 0);
                }
                else if ($("#table-navigation").attr("class") === "table-nav-90deg") {
                    this.$el.removeClass(currentTableClass);
                    this.$el.addClass("table-tool-window-90deg");
                    this.model.set("rotationAngle", -90);
                }
                else if ($("#table-navigation").attr("class") === "table-nav-180deg") {
                    this.$el.removeClass(currentTableClass);
                    this.$el.addClass("table-tool-window-180deg");
                    this.model.set("rotationAngle", -180);
                }
                else if ($("#table-navigation").attr("class") === "table-nav-270deg") {
                    this.$el.removeClass(currentTableClass);
                    this.$el.addClass("table-tool-window-270deg");
                    this.model.set("rotationAngle", -270);
                }
            }
            else {
                this.$el.html(this.templateMax(attr));
                document.getElementById("map").after(this.el);
            }
            this.$el.show("slow");
        }
        else if (this.$(".header").hasClass("header-min")) {
            this.$el.css({"top": this.model.get("maxPosTop"), "bottom": "", "left": this.model.get("maxPosLeft"), "margin-bottom": "30px"});
            this.$el.hide();
        }
        else {
            this.$el.hide("slow");
        }

        if (this.model.get("isCollapsed")) {
            this.minimize();
        }

        return this;
    },

    /**
     * Minimizes the Window.
     * @param {Event} event the dom event, may be undefined
     * @returns {void}
     */
    minimize: function (event) {
        if (!event || event.type === "click" || event.which === 32 || event.which === 13) {
            if (!this.model.get("isCollapsed")) {
                this.model.setCollapse(true);
                this.model.set("maxPosTop", this.$el.css("top"));
                this.model.set("maxPosLeft", this.$el.css("left"));
            }
            this.$(".win-body").hide();
            this.$(".bi-dash-lg").parent(".bootstrap-icon").hide();
            this.$el.css({"top": "auto", "bottom": "0", "left": "0", "margin-bottom": "75px"});
            this.$(".header").addClass("header-min");
            this.$el.draggable("disable");
            this.resetSize();
        }
    },

    /**
     * Maximizes the Window.
     * @param {Event} event the dom event, may be undefined
     * @returns {void}
     */
    maximize: function (event) {
        if (!event || event.type === "click" || event.which === 32 || event.which === 13) {
            if (this.$(".win-body").css("display") === "none") {
                this.model.setCollapse(false);
                this.$(".win-body").show();
                this.$(".bi-dash-lg").parent(".bootstrap-icon").show();
                this.$el.css({"top": this.model.get("maxPosTop"), "bottom": "", "left": this.model.get("maxPosLeft"), "margin-bottom": "30px"});
                this.$(".header").removeClass("header-min");
                this.$el.draggable("enable");
            }
        }
    },

    /**
     * Hides the Window.
     * @fires Core.ModelList#RadioRequestModelListGetModelByAttributes
     * @fires Core.ModelList#RadioTriggerModelListToggleDefaultTool
     * @param {event} event - the dom event, may be undefined
     * @return {void}
     */
    hide: function (event) {
        if (!event || event.type === "click" || event.which === 32 || event.which === 13) {
            const toolModel = Radio.request("ModelList", "getModelByAttributes", {id: this.model.get("winType")});

            // Dont let event bubble to .header element which would trigger maximize again!
            if (event !== undefined) {
                event.stopPropagation();
            }

            if (toolModel) {
                toolModel.setIsActive(false);
                Radio.trigger("ModelList", "toggleDefaultTool");
            }
        }
    },

    /**
     * Triggered on TouchStart.
     * @param {event} evt - Event, window being touched.
     * @return {void}
     */
    touchStartWindow: function (evt) {
        const touch = evt.changedTouches[0],
            rect = document.querySelector(".tool-window").getBoundingClientRect();

        this.model.setWindowLeft(rect.left);
        this.model.setWindowTop(rect.top);
        this.model.setStartX(parseInt(touch.clientX, 10));
        this.model.setStartY(parseInt(touch.clientY, 10));

        evt.preventDefault();
    },

    /**
     * Triggered on TouchMove.
     * @param {event} evt - Event of moved window.
     * @return {void}
     */
    touchMoveWindow: function (evt) {
        const touch = evt.changedTouches[0],
            toolWindowElement = document.querySelector(".tool-window"),
            mapDomElement = document.getElementById("map"),
            width = toolWindowElement.clientWidth,
            height = toolWindowElement.clientHeight,
            mapWidth = mapDomElement.clientWidth,
            mapHeight = mapDomElement.clientHeight,
            newPosition = this.getNewPosition(touch, width, height, mapWidth, mapHeight);

        this.$el.css({
            "left": newPosition.left,
            "top": newPosition.top,
            "width": width,
            "transform-origin": "top left"
        });

        evt.preventDefault();
    },

    /**
     * Triggered on TouchEnd.
     * @return {void}
     */
    touchMoveEnd: function () {
        this.$el.css({
            "width": ""
        });
    },

    /**
     * Function to calculate the new left and top positions.
     * @param {Object} touch Object containing the touch attributes.
     * @param {Number} width Window width.
     * @param {Number} height Window height.
     * @param {Number} mapWidth Width of the map.
     * @param {Number} mapHeight Height of the map.
     * @return {Object} newPosition Object containing the new position.
     */
    getNewPosition: function (touch, width, height, mapWidth, mapHeight) {
        const distX = parseInt(touch.clientX, 10) - this.model.get("startX"),
            distY = parseInt(touch.clientY, 10) - this.model.get("startY"),
            newPosition = {},
            windowL = this.model.get("windowLeft"),
            windowT = this.model.get("windowTop");
        let newPosX,
            newPosY;

        if (this.model.get("rotationAngle") === 0) {
            newPosX = distX + parseInt(windowL, 10);
            newPosY = distY + parseInt(windowT, 10);

            if (newPosX + width > mapWidth) {
                newPosition.left = mapWidth - width - 40 + "px";
            }
            else if (newPosX < 20) {
                newPosition.left = 20 + "px";
            }
            else {
                newPosition.left = newPosX + "px";
            }

            if (newPosY + height > mapHeight - 40) {
                newPosition.top = mapHeight - height - 40 + "px";
            }
            else if (newPosY < 20) {
                newPosition.top = 20 + "px";
            }
            else {
                newPosition.top = newPosY + "px";
            }

            return newPosition;

        }
        else if (this.model.get("rotationAngle") === -90) {
            newPosX = distX + parseInt(windowL, 10) + height;
            newPosY = distY + parseInt(windowT, 10);

            if (newPosX > mapWidth - 20) {
                newPosition.left = mapWidth - 20 + "px";
            }
            else if (newPosX - height < 20) {
                newPosition.left = 20 + height + "px";
            }
            else {
                newPosition.left = newPosX + "px";
            }

            if (newPosY + width > mapHeight - 40) {
                newPosition.top = mapHeight - width - 40;
            }
            else if (newPosY < 20) {
                newPosition.top = 20 + "px";
            }
            else {
                newPosition.top = newPosY + "px";
            }

            return newPosition;
        }
        if (this.model.get("rotationAngle") === -180) {
            newPosX = distX + parseInt(windowL, 10) + width;
            newPosY = distY + parseInt(windowT, 10) + height;

            if (newPosX > mapWidth) {
                newPosition.left = mapWidth - 40 + "px";
            }
            else if (newPosX - width < 20) {
                newPosition.left = 20 + width + "px";
            }
            else {
                newPosition.left = newPosX + "px";
            }

            if (newPosY > mapHeight - 40) {
                newPosition.top = mapHeight - 40 + "px";
            }
            else if (newPosY - height < 20) {
                newPosition.top = 20 + height + "px";
            }
            else {
                newPosition.top = newPosY + "px";
            }

            return newPosition;
        }
        else if (this.model.get("rotationAngle") === -270) {
            newPosX = distX + parseInt(windowL, 10);
            newPosY = distY + parseInt(windowT, 10) + width;

            if (newPosX + height > mapWidth - 20) {
                newPosition.left = mapWidth - height - 20 + "px";
            }
            else if (newPosX < 20) {
                newPosition.left = 20 + "px";
            }
            else {
                newPosition.left = newPosX + "px";
            }

            if (newPosY > mapHeight - 40) {
                newPosition.top = mapHeight - 40 + "px";
            }
            else if (newPosY - width < 20) {
                newPosition.top = 20 + width + "px";
            }
            else {
                newPosition.top = newPosY + "px";
            }

            return newPosition;
        }
        return newPosition;
    },

    /**
     * Triggered onpointerdown .bi-caret-right-fill.
     * Sets dragging prop true, all pointer movements trigger resizeWindowMove until released.
     * @returns {void}
     */
    resizeWindowStart: function () {
        this.dragging = true;
        this.$el.css({
            "max-width": "none",
            "width": this.el.clientWidth
        });
        this.$el.find(".win-footer").addClass("dragging");
    },

    /**
     * Triggers onpointermove if dragging prop is truthy.
     * Resizes the Window if cursor is not outside the #map.
     * @param {event} evt - The pointerEvent on window Object.
     * @returns {void}
     */
    resizeWindowMove: function (evt) {
        if (this.dragging) {
            evt.preventDefault();
            if (evt.clientX < document.getElementById("map").clientWidth - 10) {
                this.$el.css({
                    "width": evt.clientX - this.el.offsetLeft
                });
            }
            else {
                this.resizeWindowEnd();
            }
        }
    },

    /**
     * Triggers onpointerup on Window Object.
     * Sets dragging property false, ends resizing.
     * @returns {void}
     */
    resizeWindowEnd: function () {
        this.dragging = false;
        this.$el.find(".win-footer").removeClass("dragging");
    },

    /**
     * Resets the size to the css defined values when the window is reopened.
     * @returns {void}
     */
    resetSize: function () {
        this.$el.css({
            "max-width": "500px",
            "width": "auto"
        });
    }
});

export default WindowView;
