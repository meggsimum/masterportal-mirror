import Tool from "../../core/modelList/tool/model";
import SnippetSliderModel from "../../snippets/slider/model";
import SnippetCheckboxModel from "../../snippets/checkbox/model";
import SnippetDatepickerModel from "../../snippets/datepicker/model";
import moment from "moment";

const ShadowModel = Tool.extend(/** @lends ShadowModel.prototype */{
    /**
     * @class ShadowModel
     * @extends Tool
     * @memberof Tools.Shadow
     * @property {String} [icon="bi-bullseye"] Icon that is shown before the tool name
     * @property {Boolean} [isShadowEnabled=false] Flag to enable shadows on immidiately
     * @constructs
     * @fires Core#RadioTriggerMapSetShadowTime
-    * @fires Core#RadioRequestGetMap3d
     */
    defaults: Object.assign({}, Tool.prototype.defaults, {
        icon: "bi-bullseye",
        timeslider: null,
        dateslider: null,
        toggleButton: null,
        datepicker: null,
        isShadowEnabled: false,
        snippetsReady: false,
        // translations
        shadowDisplay: "",
        time: "",
        date: ""
    }),

    /**
     * Initialize the model
     * @returns {void}
     */
    initialize: function () {
        this.superInitialize();
        this.listenTo(Radio.channel("i18next"), {
            "languageChanged": this.changeLang
        });
        this.changeLang(i18next.language);
    },
    /**
     * change language - sets default values for the language
     * @param {String} lng - new language to be set
     * @returns {Void} -
     */
    changeLang: function (lng) {
        this.set({
            "shadowDisplay": i18next.t("common:modules.tools.shadow.shadowDisplay"),
            "time": i18next.t("common:snippets.slider.time"),
            "date": i18next.t("common:snippets.slider.date"),
            "currentLng": lng
        });
    },

    /**
     * Initializes sub-models
     * @returns {void}
     */
    prepareSnippets: function () {
        const minMaxTimes = this.getMinMaxTimesOfCurrentDay(),
            defaultTime = this.getTime(this.get("shadowTime")),
            timesliderStep = 1000 * 60 * 30,
            timeslider = this.getNewSlider(minMaxTimes, defaultTime, timesliderStep, 1, i18next.t("common:snippets.slider.time"), "time"),
            minMaxDays = this.getMinMaxDatesOfCurrentYear(),
            defaultDay = this.getDate(this.get("sliderTime")),
            datesliderStep = 1000 * 60 * 60 * 24,
            dateslider = this.getNewSlider(minMaxDays, defaultDay, datesliderStep, 1, i18next.t("common:snippets.slider.date"), "date"),
            button = this.getNewButton(i18next.t("common:modules.tools.shadow.shadowDisplay"), this.get("isShadowEnabled")),
            datepicker = this.getNewDatepicker(defaultDay, minMaxDays[0], minMaxDays[1], "Datum", "datepicker");

        this.setCesiumTime(this.combineTimeAndDate(defaultTime, defaultDay));
        this.setToggleButton(button);
        this.setTimeslider(timeslider);
        this.setDateslider(dateslider);
        this.setDatepicker(datepicker);
        this.registerListener();

        this.setSnippetsReady(true);
    },

    /**
     * Register Listener to act on
     * @returns {void}
     */
    registerListener: function () {
        this.listenTo(this.get("toggleButton"), {
            "valuesChanged": this.toggleButtonValueChanged
        });
        this.listenTo(this.get("timeslider"), {
            "valuesChanged": this.timeOrDateChanged
        });
        this.listenTo(this.get("dateslider"), {
            "valuesChanged": this.sychronizePicker
        });
        this.listenTo(this.get("datepicker"), {
            "valuesChanged": this.sychronizeSlider
        });
    },

    /**
     * Combines the given timestamps for time and date together
     * @param   {timestamp} time timestamp with time
     * @param   {timestamp} date timestamd with date
     * @returns {timestamp} timestamp the combined timestamp
     */
    combineTimeAndDate: function (time, date) {
        return moment(date).hour(moment(time).get("hour")).minute(moment(time).get("minute")).second(moment(time).get("second")).valueOf();
    },

    /**
     * Gets called when or the time or the date changes and starts processing to set the new value
     * @returns {void}
     */
    timeOrDateChanged: function () {
        const time = this.get("timeslider").getSelectedValues().values[0],
            date = this.get("dateslider").getSelectedValues().values[0],
            timedate = this.combineTimeAndDate(time, date);

        this.setCesiumTime(timedate);
    },

    /**
     * Gets called when the datepicker has changed and synchronizes the slider with the same values
     * @returns {void}
     */
    sychronizeSlider: function () {
        const date = this.get("datepicker").getSelectedValues().values[0];

        this.get("dateslider").updateValuesSilently(moment(date).valueOf());
        this.timeOrDateChanged();
    },

    /**
     * Gets called when the slider has changed and synchronizes the datepicker with the same values
     * @returns {void}
     */
    sychronizePicker: function () {
        const date = this.get("dateslider").getSelectedValues().values[0];

        this.get("datepicker").updateValuesSilently(moment(date).toDate());
        this.timeOrDateChanged();
    },

    /**
     * Trigger new date to map3D
     * @param {timestamp} datetime new Time
     * @fires Core#RadioTriggerMapSetShadowTime
     * @returns {void}
     */
    setCesiumTime: function (datetime) {
        let julianDate;

        if (typeof Cesium !== "undefined") {
            julianDate = Cesium.JulianDate.fromDate(moment(datetime).toDate());
            Radio.trigger("Map", "setShadowTime", julianDate);
        }
    },

    /**
     * Proceduere what has to be done when the toggleButton gets pressed
     * @param   {boolean} chkbox state of the checkbox
     * @returns {void}
     */
    toggleButtonValueChanged: function (chkbox) {
        const value = chkbox;

        this.toggleShadow(value);
        this.setIsShadowEnabled(value);
        this.trigger("toggleButtonValueChanged", value);
        this.get("toggleButton").attributes.label = i18next.t("common:modules.tools.shadow.shadowDisplay");
    },

    /**
     * Returns an array of min. and max. timestamps of actual year
     * @returns {timestamp[]} timestamp Array of timestamps
     */
    getMinMaxDatesOfCurrentYear: function () {
        return [moment().startOf("year").valueOf(), moment().endOf("year").valueOf()];
    },

    /**
     * Returns an array of min. and max. timestamps of today
     * @returns {timestamp[]} timestamp Array of timestamps
     */
    getMinMaxTimesOfCurrentDay: function () {
        return [moment().startOf("day").valueOf(), moment().endOf("day").valueOf()];
    },

    /**
     * Returns the nearest past full half hour from now or from config
     * @param {object} [defaultTime] default time from config
     * @returns {timestamp} timestamp
     */
    getTime: function (defaultTime) {
        const hours = defaultTime ? defaultTime.hour : moment().get("hours"),
            minutes = defaultTime ? defaultTime.minute : moment().get("minutes"),
            setminutes = minutes < 30 ? 0 : 30;

        return moment().hours(hours).minutes(setminutes).seconds(0).millisecond(0).valueOf();
    },

    /**
     * Returns the start of today
     * @param {object} [defaultTime] default time from config
     * @returns {timestamp} timestamp
     */
    getDate: function (defaultTime) {
        const month = defaultTime ? defaultTime.month : moment().get("month"),
            day = defaultTime ? defaultTime.day : moment().get("date");

        return moment().month(month).date(day).hours(0).minutes(0).seconds(0).millisecond(0).valueOf();
    },

    /**
     * Returns the cesiumScene if defined
     * @fires Core#RadioRequestGetMap3d
     * @returns {object | undefined} cesiumScene cesiumScene of map3D
     */
    getCesiumScene: function () {
        const map3D = Radio.request("Map", "getMap3d");

        if (map3D) {
            return map3D.getCesiumScene();
        }

        return undefined;
    },

    /**
     * Toggles the shadows
     * @param {boolean} chkboxValue Value of the checkbox
     * @returns {void}
     */
    toggleShadow: function (chkboxValue) {
        const scene = this.getCesiumScene();

        if (scene) {
            if (!scene.sun) {
                scene.sun = new Cesium.Sun();
            }
            scene.globe.shadows = Cesium.ShadowMode.RECEIVE_ONLY;
            scene.globe.enableLighting = chkboxValue;
            scene.shadowMap.enabled = chkboxValue;
        }
    },

    /**
     * Creator for Datepicker
     * @param {Date} preselectedValue preselected date
     * @param {Date} startDate earliest selectable date
     * @param {Date} endDate latest selectable date
     * @param {string} displayName The name to be displayed near to the datepicker.
     * @param {string} type The slider type
     * @returns {object} SnippetSliderModel Slider-Object
     */
    getNewDatepicker: function (preselectedValue, startDate, endDate, displayName, type) {
        return new SnippetDatepickerModel({
            displayName: displayName,
            preselectedValue: moment(preselectedValue).toDate(),
            startDate: moment(startDate).toDate(),
            endDate: moment(endDate).toDate(),
            type: type
        });
    },

    /**
     * Creator for Sliders
     * @param {integer[]} values Array of min and max times
     * @param {integer} preselectedValue preselcted value in slider
     * @param {float} step Increment step
     * @param {float} precision The number of digits shown after the decimal.
     * @param {string} displayName The name to be displayed near to the slider.
     * @param {string} type The slider type
     * @returns {object} SnippetSliderModel Slider-Object
     */
    getNewSlider: function (values, preselectedValue, step, precision, displayName, type) {
        return new SnippetSliderModel({
            displayName: displayName,
            preselectedValues: preselectedValue,
            type: type,
            step: step,
            precision: precision,
            editableValueBox: false,
            values: values,
            selection: "none"
        });
    },

    /**
     * Creator for Checkboxes
     * @param {string} label The label to show next to the checkbox
     * @param {boolean} isSelected Set default state
     * @returns {object} SnippetCheckboxModel Checkbox-Object
     */
    getNewButton: function (label, isSelected) {
        return new SnippetCheckboxModel({
            isSelected: isSelected,
            label: label
        });
    },

    /**
     * Setter for dates
     * @param {date[]} value Array of date objects
     * @returns {void}
     */
    setDates: function (value) {
        this.set("dates", value);
    },

    /**
     * Setter for timeslider
     * @param {object} value timeslider
     * @returns {void}
     */
    setTimeslider: function (value) {
        this.set("timeslider", value);
    },

    /**
     * Setter for dateslider
     * @param {object} value dateslider
     * @returns {void}
     */
    setDateslider: function (value) {
        this.set("dateslider", value);
    },

    /**
     * Setter for datepicker
     * @param {object} value datepicker
     * @returns {void}
     */
    setDatepicker: function (value) {
        this.set("datepicker", value);
    },

    /**
     * Setter for toggleButton
     * @param {object} value toggleButton
     * @returns {void}
     */
    setToggleButton: function (value) {
        this.set("toggleButton", value);
    },

    /**
     * Setter for isShadowEnabled
     * @param {boolean} value isShadowEnabled
     * @returns {void}
     */
    setIsShadowEnabled: function (value) {
        this.set("isShadowEnabled", value);
    },

    /**
     * Setter for snippetsReady
     * @param {boolean} value snippetsReady
     * @returns {void}
     */
    setSnippetsReady: function (value) {
        this.set("snippetsReady", value);
    }
});

export default ShadowModel;
