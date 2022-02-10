<script>
import isObject from "../../../../utils/isObject";
import {translateKeyWithPlausibilityCheck} from "../../../../utils/translateKeyWithPlausibilityCheck.js";
import moment from "moment";

export default {
    name: "SnippetDateRange",
    props: {
        api: {
            type: Object,
            required: false,
            default: null
        },
        attrName: {
            type: [String, Array],
            required: false,
            default: ""
        },
        disabled: {
            type: Boolean,
            required: false,
            default: false
        },
        info: {
            type: [String, Boolean],
            required: false,
            default: false
        },
        format: {
            type: String,
            required: false,
            default: "YYYY-MM-DD"
        },
        label: {
            type: [String, Boolean],
            required: false,
            default: true
        },
        maxValue: {
            type: String,
            required: false,
            default: undefined
        },
        minValue: {
            type: String,
            required: false,
            default: undefined
        },
        operator: {
            type: String,
            required: false,
            default: "BETWEEN"
        },
        prechecked: {
            type: Array,
            required: false,
            default: undefined
        },
        snippetId: {
            type: Number,
            required: false,
            default: 0
        },
        visible: {
            type: Boolean,
            required: false,
            default: true
        }
    },
    data () {
        return {
            disable: true,
            internalFormat: "YYYY-MM-DD",
            isInitializing: true,
            minimumValue: "",
            maximumValue: "",
            value: ["", ""],
            precheckedIsValid: false,
            showInfo: false
        };
    },
    computed: {
        labelText () {
            if (this.label === true) {
                if (Array.isArray(this.attrName)) {
                    return this.attrName[0];
                }
                return this.attrName;
            }
            else if (typeof this.label === "string") {
                return this.translateKeyWithPlausibilityCheck(this.label, key => this.$t(key));
            }
            return "";
        },
        infoText () {
            if (this.info === true) {
                return this.$t("common:modules.tools.filterGeneral.info.snippetDateRange");
            }
            else if (typeof this.info === "string") {
                return this.translateKeyWithPlausibilityCheck(this.info, key => this.$t(key));
            }
            return "";
        },
        inRangeValueLeft: {
            get () {
                if (!Array.isArray(this.value) || this.value.length !== 2) {
                    return "";
                }
                return this.getValueWithinBorders(this.value[0], this.minimumValue, this.maximumValue, this.internalFormat);
            },
            set (value) {
                this.$set(this.value, 0, value);
            }
        },
        inRangeValueRight: {
            get () {
                if (!Array.isArray(this.value) || this.value.length !== 2) {
                    return "";
                }
                return this.getValueWithinBorders(this.value[1], this.minimumValue, this.maximumValue, this.internalFormat);
            },
            set (value) {
                this.$set(this.value, 1, value);
            }
        }
    },
    watch: {
        value () {
            if (!this.isInitializing || this.precheckedIsValid) {
                const value = [
                    moment(this.inRangeValueLeft, this.internalFormat).format(this.format),
                    moment(this.inRangeValueRight, this.internalFormat).format(this.format)
                ];

                this.emitCurrentRule(value, this.isInitializing);
            }
        },
        disabled (value) {
            this.disable = typeof value === "boolean" ? value : true;
        }
    },
    created () {
        const momentPrecheckedLeft = moment(Array.isArray(this.prechecked) ? this.prechecked[0] : "", this.format),
            momentPrecheckedRight = moment(Array.isArray(this.prechecked) ? this.prechecked[1] : "", this.format),
            momentMin = moment(this.minValue, this.format),
            momentMax = moment(this.maxValue, this.format);

        this.precheckedIsValid = momentPrecheckedLeft.isValid() || momentPrecheckedRight.isValid();

        if (this.api) {
            const attrName = [];

            if (Array.isArray(this.attrName)) {
                attrName.push(this.attrName[0]);
                attrName.push(this.attrName[1]);
            }
            else if (typeof this.attrName === "string") {
                attrName.push(this.attrName);
                attrName.push(this.attrName);
            }

            if (attrName.length === 2) {
                this.minimumValue = momentMin.format(this.internalFormat);
                this.maximumValue = momentMax.format(this.internalFormat);

                this.setMinimumMaximumValue(attrName[0], !momentMin.isValid(), false, () => {
                    this.setMinimumMaximumValue(attrName[1], false, !momentMax.isValid(), () => {
                        this.value[0] = momentPrecheckedLeft.isValid() ? momentPrecheckedLeft.format(this.internalFormat) : this.minimumValue;
                        this.value[1] = momentPrecheckedRight.isValid() ? momentPrecheckedRight.format(this.internalFormat) : this.maximumValue;

                        this.$nextTick(() => {
                            this.isInitializing = false;
                            this.disable = false;
                        });
                    }, error => {
                        this.isInitializing = false;
                        this.disable = false;
                        console.warn(error);
                    });
                }, error => {
                    this.isInitializing = false;
                    this.disable = false;
                    console.warn(error);
                });
            }
        }
        else {
            this.minimumValue = momentMin.isValid() ? momentMin.format(this.internalFormat) : "";
            this.maximumValue = momentMax.isValid() ? momentMax.format(this.internalFormat) : "";
            if (this.precheckedIsValid) {
                this.value = [
                    momentPrecheckedLeft.isValid() ? momentPrecheckedLeft.format(this.internalFormat) : this.minimumValue,
                    momentPrecheckedRight.isValid() ? momentPrecheckedRight.format(this.internalFormat) : this.maximumValue
                ];
            }
            this.$nextTick(() => {
                this.isInitializing = false;
                this.disable = false;
            });
        }
    },
    methods: {
        translateKeyWithPlausibilityCheck,

        /**
         * Returns the label to use in the gui as description for the left calendar box.
         * @returns {String} the label to use
         */
        getLabelLeft () {
            if (Array.isArray(this.attrName)) {
                return this.attrName[0];
            }
            return "";
        },
        /**
         * Returns the label to use in the gui as description for the right calendar box.
         * @returns {String} the label to use
         */
        getLabelRight () {
            if (Array.isArray(this.attrName)) {
                return this.attrName[1];
            }
            return "";
        },
        /**
         * Returns a value in range of the given borders.
         * @param {String} value the value to return or correct
         * @param {String} leftBorder the value to be the bottom/left border
         * @param {String} rightBorder the value to be the top/right border
         * @param {String} format the format to format from and format to
         * @returns {String} the value but asured to be in borders
         */
        getValueWithinBorders (value, leftBorder, rightBorder, format) {
            const momentMinimum = moment(leftBorder, format),
                momentMaximum = moment(rightBorder, format),
                momentValue = moment(value, format);

            if (!momentValue.isValid()) {
                return "";
            }
            else if (momentValue.isSameOrAfter(momentMaximum)) {
                return momentMaximum.format(format);
            }
            else if (momentValue.isSameOrBefore(momentMinimum)) {
                return momentMinimum.format(format);
            }
            return momentValue.format(format);
        },
        /**
         * Calls the minMax api for the given attrName and sets minimumValue and maximumValue.
         * @param {String} attrName the attribute to receive the min and max value from
         * @param {Boolean} minOnly if minimumValue should be set
         * @param {Boolean} maxOnly if maximumValue should be set
         * @param {Function} onsuccess a function({min, max}) with the received values
         * @param {Function} onerror a function(errorMsg)
         * @returns {void}
         */
        setMinimumMaximumValue (attrName, minOnly, maxOnly, onsuccess, onerror) {
            if (minOnly === false && maxOnly === false) {
                if (typeof onsuccess === "function") {
                    onsuccess();
                }
                return;
            }

            this.api.getMinMax(attrName, minMaxObj => {
                if (!isObject(minMaxObj)) {
                    if (typeof onsuccess === "function") {
                        onsuccess();
                    }
                    return;
                }

                if (Object.prototype.hasOwnProperty.call(minMaxObj, "min")) {
                    this.minimumValue = moment(minMaxObj.min, this.format).format(this.internalFormat);
                }
                if (Object.prototype.hasOwnProperty.call(minMaxObj, "max")) {
                    this.maximumValue = moment(minMaxObj.max, this.format).format(this.internalFormat);
                }
                if (typeof onsuccess === "function") {
                    onsuccess();
                }
            }, onerror, minOnly, maxOnly);
        },
        /**
         * Emits the current rule to whoever is listening.
         * @param {*} value the value to put into the rule
         * @param {Boolean} [startup=false] true if the call comes on startup, false if a user actively changed a snippet
         * @returns {void}
         */
        emitCurrentRule (value, startup = false) {
            this.$emit("changeRule", {
                snippetId: this.snippetId,
                startup,
                fixed: !this.visible,
                attrName: this.attrName,
                operator: this.operator,
                format: this.format,
                value
            });
        },
        /**
         * Emits the delete rule function to whoever is listening.
         * @returns {void}
         */
        deleteCurrentRule () {
            this.$emit("deleteRule", this.snippetId);
        },
        /**
         * Resets the values of this snippet.
         * @param {Function} onsuccess the function to call on success
         * @returns {void}
         */
        resetSnippet (onsuccess) {
            if (this.visible) {
                this.value = ["", ""];
            }
            this.$nextTick(() => {
                if (typeof onsuccess === "function") {
                    onsuccess();
                }
            });
        },
        /**
         * Toggles the info.
         * @returns {void}
         */
        toggleInfo () {
            this.showInfo = !this.showInfo;
        }
    }
};
</script>

<template>
    <div
        v-show="visible"
        class="snippetDateRangeContainer"
    >
        <div
            v-if="label !== false"
            class="left"
        >
            <label
                for="date-from-input-container"
                class="snippetDateRangeLabel"
            >
                {{ labelText }}
            </label>
        </div>
        <div
            v-if="info !== false"
            class="right"
        >
            <div class="info-icon">
                <span
                    :class="['glyphicon glyphicon-info-sign', showInfo ? 'opened' : '']"
                    @click="toggleInfo()"
                    @keydown.enter="toggleInfo()"
                >&nbsp;</span>
            </div>
        </div>
        <div class="date-input-container">
            <div
                id="date-from-input-container"
                class="date-from-input-container"
            >
                <label
                    :for="'inputDateFrom-' + snippetId"
                >{{ getLabelLeft() }}</label>
                <input
                    :id="'inputDateFrom-' + snippetId"
                    v-model="inRangeValueLeft"
                    name="inputDateFrom"
                    class="snippetDateRangeFrom"
                    type="date"
                    :min="minimumValue"
                    :max="inRangeValueRight"
                    :disabled="disable"
                >
            </div>
            <div
                id="date-to-input-container"
                class="date-to-input-container"
            >
                <label
                    :for="'inputDateUntil-' + snippetId"
                >{{ getLabelRight() }}</label>
                <input
                    :id="'inputDateUntil-' + snippetId"
                    v-model="inRangeValueRight"
                    name="inputDateUntil"
                    class="snippetDateRangeUntil"
                    type="date"
                    :min="inRangeValueLeft"
                    :max="maximumValue"
                    :disabled="disable"
                >
            </div>
        </div>
        <div
            v-show="showInfo"
            class="bottom"
        >
            <div class="info-text">
                <span>{{ infoText }}</span>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
    @import "~/css/mixins.scss";
    .snippetDateRangeContainer {
        padding: 5px;
        margin-bottom: 10px;
        height: auto;
    }
    .snippetDateRangeContainer input {
        clear: left;
        width: 100%;
        box-sizing: border-box;
        outline: 0;
        position: relative;
        margin-bottom: 5px;
    }
    .snippetDateRangeContainer .info-icon {
        float: right;
        font-size: 16px;
        color: #ddd;
    }
    .snippetDateRangeContainer .info-icon .opened {
        color: #000;
    }
    .snippetDateRangeContainer .info-icon:hover {
        cursor: pointer;
        color: #a5a09e;
    }
    .snippetDateRangeContainer .info-text {
        border: 1px solid #ddd;
        border-radius: 5px;
        font-size: 10px;
        padding: 15px 10px;
    }
    .snippetDateRangeContainer .bottom {
        clear: left;
        width: 100%;
    }
    .snippetDateRangeContainer .left {
        float: left;
        width: 90%;
    }
    .snippetDateRangeContainer .right {
        position: absolute;
        right: 10px;
    }
    input[type='range'] {
        width: 10.5rem;
    }
    label {
        text-transform: capitalize;
        margin: 0;
    }
    .snippetDateRangeContainer > div {
        margin-bottom: 0.5rem;
    }
    input {
        box-sizing: border-box;
        outline: 0;
        position: relative;
        width: 100%;
    }
    input[type="date"]::-webkit-calendar-picker-indicator {
        background: transparent;
        bottom: 0;
        color: transparent;
        cursor: pointer;
        height: auto;
        left: 0;
        position: absolute;
        right: 0;
        top: 0;
        width: auto;
    }
    .category-layer .right {
        right: 30px;
    }
</style>
