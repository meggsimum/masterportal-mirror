import SidebarModel from "./model";
import Template from "text-loader!./template.html";

const SidebarView = Backbone.View.extend(/** @lends SidebarView.prototype */{
    events: {
        "mousedown .drag-bar": "dragStart",
        "touchstart .drag-bar": "dragStart"
    },
    /**
     * @class SidebarView
     * @extends Backbone.View
     * @memberof Sidebar
     * @constructs
     * @fires Map#RadioTriggerMapUpdateSize
     * @listens Sidebar#changeIsVisible
     * @listens Sidebar#changeIsMobile
     * @listens Sidebar#addContent
     */
    initialize: function () {
        const channel = Radio.channel("Sidebar");

        this.model = new SidebarModel();
        this.$el.addClass(this.getClassName());

        this.listenTo(channel, {
            "append": this.addContent,
            "toggle": this.toggle
        });

        this.listenTo(this.model, {
            "change:isVisible": this.updateSidebar,
            "change:isMobile": this.toggleClass,
            "change:width": this.updateWidth
        });

        this.addEventListeners();

        $("#sidebar").append(this.$el);
    },
    template: _.template(Template),
    /**
     * Creates the class name.
     * @returns {string} ClassName
     */
    getClassName: function () {
        if (this.model.get("isMobile")) {
            return "sidebar-mobile";
        }
        return "sidebar";
    },
    /**
     * adds the eventListeners to the window Object
     * responsible for handling the drag Events on Keyboard and Touch
     * @returns {void}
     */
    addEventListeners: function () {
        window.addEventListener("mouseup", () => {
            this.dragEnd();
        });
        window.addEventListener("mousemove", (event) => {
            this.dragMove(event);
        });
        window.addEventListener("touchend", () => {
            this.dragEnd();
        });
        window.addEventListener("touchmove", (event) => {
            this.dragMove(event);
        });
    },
    /**
     * Add HTML content to this sidebar
     * @param {HTML}    element Element from a tool view
     * @param {Boolean} [draggable=false] is the sidebar resizeable?
     * @param {Number|String}  [fixedWidth="auto"] fixed width of sidebar
     * @returns {void}
     */
    addContent: function (element, draggable = false, fixedWidth = "auto") {
        this.$el.html(this.template({draggable}));
        this.$el.find("#sidebar-content").html(element);
        this.model.setWidth(fixedWidth);
    },
    /**
     * Setter for "width".
     * @param {String} value The width of the sidebar in percent. e.g. "30%".
     * @returns{void}
     */
    updateWidth: function () {
        if (document.querySelector("#sidebar .sidebar") !== null) {
            document.querySelector("#sidebar .sidebar").style.width = this.model.get("width");
            Radio.trigger("Map", "updateSize");
        }
        if (document.querySelector("#sidebar .sidebar-mobile") !== null) {
            document.querySelector("#sidebar .sidebar-mobile").style.width = "auto";
            Radio.trigger("Map", "updateSize");
        }
    },
    /**
     * Updates sidebar's visibility state
     * @returns{void}
     */
    updateSidebar: function () {
        if (this.model.get("isVisible")) {
            this.$el.show();
        }
        else {
            this.$el.hide();
        }
        this.updateWidth();
    },
    /**
     * Shows or hides this view.
     * @param {boolean} visible Flag if sidebar is visible.
     * @return {void}
     */
    toggle: function (visible) {
        this.model.setIsVisible(Boolean(visible));
        if (visible === true) {
            if (document.querySelector("#sidebar .tool-manager")) {
                document.querySelector("#sidebar .tool-manager").style.display = "none";
            }
            // Timeout added since the elements are loaded before the vue app. The problem takes care of itself with the move to Vue.
            // It is only necessary for the initial opening.
            else {
                setTimeout(() => {
                    document.querySelector("#sidebar .tool-manager").style.display = "none";
                    Radio.trigger("Map", "updateSize");
                }, 300);
            }
        }
        else {
            document.querySelector("#sidebar .tool-manager").style.display = "block";
        }
    },

    /**
     * Toggles the css class for this view
     * @param {SidebarModel} model The sidebar model.
     * @param {boolean} isMobile Flag if the portal is in mobile mode.
     * @return {void}
     */
    toggleClass: function () {
        if (this.model.get("isMobile")) {
            this.$el.addClass("sidebar-mobile");
            this.$el.removeClass("sidebar");
        }
        else {
            this.$el.addClass("sidebar");
            this.$el.removeClass("sidebar-mobile");
        }
    },
    /**
     * handles the drag Start event to resize the sidebar
     * @param {*} event the DOM-event
     * @returns {void}
     */
    dragStart: function (event) {
        event.preventDefault();
        this.isDragging = true;
        this.$el.find(".drag-bar").addClass("dragging");
    },
    /**
     * handles the drag move event to resize the sidebar
     * @param {*} event the DOM-event
     * @returns {void}
     */
    dragMove: function (event) {
        if (this.isDragging) {
            const eventX = event.type === "touchmove" ? event.touches[0].clientX : event.clientX,
                newWidth = Math.floor(window.innerWidth - eventX) + "px";

            this.model.setWidth(newWidth);
        }
    },
    /**
     * handles the drag End event to resize the sidebar
     * @param {*} event the DOM-event
     * @returns {void}
     */
    dragEnd: function () {
        this.isDragging = false;
        this.$el.find(".drag-bar").removeClass("dragging");
    }
});

export default SidebarView;
