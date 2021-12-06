import Template from "text-loader!./template.html";
import "bootstrap-datepicker";
import "bootstrap-datepicker/dist/locales/bootstrap-datepicker.de.min";
import moment from "moment";

const DatepickerView = Backbone.View.extend(/** @lends DatepickerView.prototype */{
    /**
     * @class DatepickerView
     * @extends Backbone.View
     * @memberof Snippets.Datepicker
     * @constructs
     */
    events: {
        "changeDate": "changeDate"
    },

    /**
     * Setting listener
     * @returns {void}
     */
    initialize: function () {
        this.listenTo(this.model, {
            "updateDOM": this.updateDOM,
            "removeView": this.remove,
            "change:currentLng": () => {
                this.rerender();
            }
        }, this);
    },
    template: _.template(Template),

    /**
     * render methode
     * @returns {this} this
     */
    render: function () {
        this.$el.html(this.template());
        this.initDatepicker();
        this.delegateEvents();
        return this;
    },

    rerender: function () {
        const date = this.model.get("valuesCollection").models[0],
            newLang = this.model.get("currentLng");

        date.set({language: newLang});
    },

    /**
     * init the datepicker. no template needed.
     * @returns {void}
     */
    initDatepicker: function () {
        const date = this.model.get("valuesCollection").models[0],
            datepickerContainer = this.$el.find(".datepicker-container");

        datepickerContainer.datepicker({
            todayHighlight: date.get("todayHighlight"),
            multidate: date.get("multidate"),
            language: date.get("language"),
            defaultViewDate: date.get("date"),
            startDate: date.get("startDate"),
            endDate: date.get("endDate"),
            minViewMode: date.get("minViewMode"),
            maxViewMode: date.get("maxViewMode"),
            inputs: date.get("inputs"),
            calendarWeeks: date.get("calendarWeeks"),
            format: date.get("format"),
            autoclose: date.get("autoclose"),
            weekStart: date.get("weekStart"),
            orientation: date.get("orientation"),
            beforeShowDay: date.get("beforeShowDay"),
            templates: {
                leftArrow: "<i class=\"bi-caret-left-fill\"></i>",
                rightArrow: "<i class=\"bi-caret-right-fill\"></i>"
            }
        });

        // datepicker with target 'inputs' need listener on changeDate in order to set valuesCollection
        if (date.get("inputs")) {
            date.get("inputs").on("changeDate", this.changeDate.bind(this), null);
            if (this.model.get("readOnly")) {
                date.get("inputs").prop("readonly", true);
            }

            // listener to set classes for selectWeek
            if (this.model.get("selectWeek")) {
                date.get("inputs").on("show", this.showWeekpicker.bind(this), null);
            }
            // set date in year datepicker
            if (date.get("minViewMode") === "years" && date.get("maxViewMode") === "years") {
                date.get("inputs").datepicker("setDate", date.get("date"));
            }
            else if (!Array.isArray(date.get("date"))) {
                date.get("inputs").datepicker("update", moment(date.get("date")).format("DD.MM.YYYY"));
            }
        }

        // setter for target 'inline'
        datepickerContainer.datepicker("setDate", date.get("date"));
    },

    /**
     * Is triggered when the selected date of the datepicker changes. Sets value to the model.
     * @param {Event} evt changeData Event
     * @returns {void}
     */
    changeDate: function (evt) {
        if (this.model.get("mutexChangeEvent") === false) {
            return;
        }

        let dates = evt.dates;

        if (this.model.get("selectWeek")) {
            this.model.set("mutexChangeEvent", false);

            dates = this.model.getDatesForWeekPicker([...dates]);
            this.model.get("inputs").datepicker("clearDates");
            this.model.get("inputs").datepicker("setDates", dates);
            this.model.set("mutexChangeEvent", true);
        }

        this.model.updateValues(dates);
    },

    /**
     * Sets the datepicker value after the external model has changed.
     * Using different methods depending on render target.
     * @param   {Date} value new Date value
     * @returns {void}
     */
    updateDOM: function (value) {
        this.$el.find(".datepicker-container").datepicker("update", value);
    },

    /**
     * Sets classes to the rendered DOM element for weeks instead of days
     * @returns {void}
     */
    showWeekpicker: function () {
        const weekList = $(".datepicker-dropdown .datepicker-days table tbody tr"),
            activeWeekList = weekList.find("td.active.day").parent();

        weekList.mouseover(function () {
            $(this).addClass("week");
        });
        weekList.mouseout(function () {
            $(this).removeClass("week");
        });
        // remove all active class
        weekList.removeClass("week-active");

        // add active class
        activeWeekList.addClass("week-active");
    }
});

export default DatepickerView;
