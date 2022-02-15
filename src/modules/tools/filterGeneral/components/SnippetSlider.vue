<script>
import isObject from "../../../../utils/isObject";
import {translateKeyWithPlausibilityCheck} from "../../../../utils/translateKeyWithPlausibilityCheck.js";

export default {
    name: "SnippetSlider",
    props: {
        api: {
            type: Object,
            required: false,
            default: null
        },
        attrName: {
            type: String,
            required: false,
            default: ""
        },
        decimalPlaces: {
            type: Number,
            required: false,
            default: 0
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
        label: {
            type: [String, Boolean],
            required: false,
            default: true
        },
        minValue: {
            type: Number,
            required: false,
            default: undefined
        },
        maxValue: {
            type: Number,
            required: false,
            default: undefined
        },
        operator: {
            type: String,
            required: false,
            default: "EQ"
        },
        prechecked: {
            type: Number,
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
            isInitializing: true,
            minimumValue: 0,
            maximumValue: 100,
            showInfo: false,
            value: 0
        };
    },
    computed: {
        labelText () {
            if (this.label === true) {
                return this.attrName;
            }
            else if (typeof this.label === "string") {
                return this.translateKeyWithPlausibilityCheck(this.label, key => this.$t(key));
            }
            return "";
        },
        infoText () {
            if (this.info === true) {
                return this.$t("common:modules.tools.filterGeneral.info.snippetSlider");
            }
            else if (typeof this.info === "string") {
                return this.translateKeyWithPlausibilityCheck(this.info, key => this.$t(key));
            }
            return "";
        },
        inRangeValue: {
            get () {
                const value = Math.min(this.maximumValue, Math.max(this.minimumValue, this.value));

                return !isNaN(value) ? value : 0;
            },
            set (value) {
                this.value = value;
            }
        }
    },
    watch: {
        value () {
            if (!this.isInitializing || typeof this.prechecked !== "undefined") {
                this.emitCurrentRule(this.inRangeValue, this.isInitializing);
            }
        },
        disabled (value) {
            this.disable = typeof value === "boolean" ? value : true;
        }
    },
    created () {
        if (typeof this.minValue !== "undefined" && typeof this.maxValue !== "undefined") {
            this.minimumValue = this.minValue;
            this.maximumValue = this.maxValue;
            this.value = typeof this.prechecked !== "undefined" ? this.prechecked : this.minimumValue;
            this.$nextTick(() => {
                this.isInitializing = false;
                this.disable = false;
            });
        }
        else if (this.api) {
            this.api.getMinMax(this.attrName, minMaxObj => {
                if (!isObject(minMaxObj)) {
                    return;
                }
                this.minimumValue = Object.prototype.hasOwnProperty.call(minMaxObj, "min") ? minMaxObj.min : this.minValue;
                this.maximumValue = Object.prototype.hasOwnProperty.call(minMaxObj, "max") ? minMaxObj.max : this.maxValue;
                this.value = typeof this.prechecked !== "undefined" ? this.prechecked : this.minimumValue;
                this.$nextTick(() => {
                    this.isInitializing = false;
                    this.disable = false;
                });
            }, err => {
                this.isInitializing = false;
                this.disable = false;
                console.warn(err);
            }, typeof this.minValue === "undefined" && typeof this.maxValue !== "undefined", typeof this.minValue !== "undefined" && typeof this.maxValue === "undefined");
        }
        else {
            this.value = typeof this.prechecked !== "undefined" ? this.prechecked : 0;
            this.$nextTick(() => {
                this.isInitializing = false;
                this.disable = false;
            });
        }
    },
    methods: {
        translateKeyWithPlausibilityCheck,

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
                if (typeof this.minimumValue === "number") {
                    this.value = this.minimumValue;
                }
                else {
                    this.value = 0;
                }
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
        },
        /**
         * Returns the steps the slider will make over the number range.
         * @param {Number} decimalPlaces the amount of decimal places
         * @returns {Number} the steps
         */
        getSliderSteps (decimalPlaces) {
            return 1 / Math.pow(10, decimalPlaces);
        },
        /**
         * Checking if the input field is valid and reset to valid value
         * @param {Event} evt - input event
         * @returns {void}
         */
        checkInput (evt) {
            if (evt?.target?.value === "") {
                this.getAlertRangeText(undefined);
                this.$refs.inputNumber.value = this.inRangeValue;
            }
            else {
                const value = parseFloat(evt?.target?.value);

                if (value < this.minimumValue || value > this.maximumValue) {
                    this.getAlertRangeText(value);
                    this.$refs.inputNumber.value = this.inRangeValue;
                }
            }
        },
        /**
         * Getting slider range error text in alerting box
         * @param {String} value the input value from input field
         * @returns {void}
         */
        getAlertRangeText (value) {
            if (value === undefined) {
                this.$store.dispatch("Alerting/addSingleAlert", i18next.t("common:snippets.slider.valueEmptyErrorMessage"));
            }
            else {
                this.$store.dispatch("Alerting/addSingleAlert", i18next.t("common:snippets.slider.valueOutOfRangeErrorMessage", {
                    inputValue: value,
                    minValueSlider: this.minimumValue,
                    maxValueSlider: this.maximumValue
                }));
            }
        }
    }
};
</script>

<template>
    <div
        v-show="visible"
        class="snippetSliderContainer"
    >
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
        <label
            v-if="label !== false"
            :for="'snippetSlider-' + snippetId"
            class="snippetSliderLabel left"
        >{{ labelText }}</label>
        <input
            :id="'snippetSlider-' + snippetId"
            ref="inputNumber"
            v-model="inRangeValue"
            class="input-single"
            type="number"
            :min="minimumValue"
            :max="maximumValue"
            :name="label"
            :disabled="disable"
            @blur="checkInput"
            @keyup.enter="checkInput"
        >
        <div class="slider-input-container">
            <input
                v-model="inRangeValue"
                class="slider-single"
                type="range"
                :class="disable ? 'disabled':''"
                :step="getSliderSteps(decimalPlaces)"
                :disabled="disable"
                :min="minimumValue"
                :max="maximumValue"
            >
        </div>
        <span class="min">{{ minimumValue }}</span>
        <span class="max">{{ maximumValue }}</span>
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
    .snippetSliderContainer {
        padding: 5px;
        margin-bottom: 10px;
        height: auto;
    }
    .snippetSliderContainer input {
        clear: left;
        width: 100%;
        box-sizing: border-box;
        outline: 0;
        position: relative;
        margin-bottom: 5px;
    }
    .snippetSliderContainer .info-icon {
        float: right;
        font-size: 16px;
        color: #ddd;
    }
    .snippetSliderContainer .info-icon .opened {
        color: #000;
    }
    .snippetSliderContainer .info-icon:hover {
        cursor: pointer;
        color: #a5a09e;
    }
    .snippetSliderContainer .info-text {
        border: 1px solid #ddd;
        border-radius: 5px;
        font-size: 10px;
        padding: 15px 10px;
    }
    .snippetSliderContainer .bottom {
        clear: left;
        width: 100%;
    }
    .snippetSliderContainer .left {
        float: left;
        width: 90%;
    }
    .snippetSliderContainer .right {
        position: absolute;
        right: 10px;
    }
    input[type="number"] {
        text-align: center;
        font-size: 12px;
        -moz-appearance: textfield;
        width: 60px;
        float: right;
        margin-bottom: 10px;
        padding-top: 5px;
        margin-top: 2px;
    }

    /* Chrome, Safari, Edge, Opera */
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }

    /* Firefox */
    input[type="range"] {
        -webkit-appearance: none;
        background-color: #ddd;
        height: 15px;
        overflow: hidden;
        width: 100%;
    }

    input[type="range"]::-webkit-slider-runnable-track {
        -webkit-appearance: none;
        height: 15px;
    }

    input[type="range"]::-webkit-slider-thumb {
        -webkit-appearance: none;
        background: #ffffff;
        border-radius: 50%;
        box-shadow: -210px 0 0 200px #3177b1;
        cursor: pointer;
        height: 15px;
        width: 15px;
        border: 0;
    }

    input[type="range"]::-moz-range-thumb {
        background: #ffffff;
        border-radius: 50%;
        box-shadow: -1010px 0 0 1000px #3177b1;
        cursor: pointer;
        height: 15px;
        width: 15px;
        border: 0;
    }

    input[type="range"]::-moz-range-track {
        background-color: #ddd;
    }
    input[type="range"]::-moz-range-progress {
        background-color: #3177b1;
        height: 15px
    }
    input[type="range"]::-ms-fill-upper {
        background-color: #ddd;
    }
    input[type="range"]::-ms-fill-lower {
        background-color: #3177b1;
    }
    span {
        &.min {
            float: left;
        }
        &.max {
            float: right;
        }
    }
    input[type="range"].disabled {
        -webkit-appearance: none;
        background-color: grey;
        height: 15px;
        overflow: hidden;
        width: 100%;
    }

    input[type="range"].disabled::-webkit-slider-thumb {
        -webkit-appearance: none;
        background: #ddd;
        border-radius: 50%;
        box-shadow: -210px 0 0 200px grey;
        cursor: pointer;
        height: 15px;
        width: 15px;
        border: 0;
    }

    input[type="range"].disabled::-moz-range-thumb {
        background: #ddd;
        border-radius: 50%;
        box-shadow: -1010px 0 0 1000px grey;
        cursor: pointer;
        height: 15px;
        width: 15px;
        border: 0;
    }
    input[type="range"].disabled::-moz-range-track {
        background-color: grey;
    }
    input[type="range"].disabled::-moz-range-progress {
        background-color: grey;
        height: 15px
    }
    input[type="range"].disabled::-ms-fill-upper {
        background-color: grey;
    }
    input[type="range"].disabled::-ms-fill-lower {
        background-color: grey;
    }
    .category-layer .right {
        right: 30px;
    }
</style>
