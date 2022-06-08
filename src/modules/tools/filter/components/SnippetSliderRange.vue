<script>
import isObject from "../../../../utils/isObject";
import {translateKeyWithPlausibilityCheck} from "../../../../utils/translateKeyWithPlausibilityCheck.js";
import {getDefaultOperatorBySnippetType} from "../utils/compileSnippets.js";
import SnippetInfo from "./SnippetInfo.vue";

export default {
    name: "SnippetSliderRange",
    components: {
        SnippetInfo
    },
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
        adjustment: {
            type: [Object, Boolean],
            required: false,
            default: false
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
        filterId: {
            type: Number,
            required: false,
            default: 0
        },
        info: {
            type: [String, Boolean],
            required: false,
            default: false
        },
        isParent: {
            type: Boolean,
            required: false,
            default: false
        },
        title: {
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
            default: undefined
        },
        prechecked: {
            type: Array,
            required: false,
            default: undefined
        },
        fixedRules: {
            type: Array,
            required: false,
            default: () => {
                return [];
            }
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
            isAdjusting: false,
            minimumValue: 0,
            maximumValue: 100,
            value: [0, 100],
            translationKey: "snippetSliderRange",
            operatorWhitelist: [
                "BETWEEN",
                "INTERSECTS"
            ]
        };
    },
    computed: {
        ariaLabelSliderRangeMin () {
            return this.$t("modules.tools.filter.ariaLabel.slider.min", {param: this.attrName});
        },
        ariaLabelSliderRangeMax () {
            return this.$t("modules.tools.filter.ariaLabel.slider.max", {param: this.attrName});
        },
        titleText () {
            if (this.title === true) {
                return this.attrName;
            }
            else if (typeof this.title === "string") {
                return this.translateKeyWithPlausibilityCheck(this.title, key => this.$t(key));
            }
            return "";
        },
        inRangeValueLeft: {
            get () {
                const value = Math.min(this.value[1], Math.max(this.minimumValue, this.value[0]));

                return !isNaN(value) ? value : 0;
            },
            set (value) {
                this.$set(this.value, 0, Math.min(this.inRangeValueRight, Math.max(this.minimumValue, value)));
            }
        },
        inRangeValueRight: {
            get () {
                const value = Math.min(this.maximumValue, Math.max(this.value[0], this.value[1]));

                return !isNaN(value) ? value : 0;
            },
            set (value) {
                this.$set(this.value, 1, Math.min(this.maximumValue, Math.max(this.inRangeValueLeft, value)));
            }
        },
        securedOperator () {
            if (!this.operatorWhitelist.includes(this.operator)) {
                return getDefaultOperatorBySnippetType("sliderRange");
            }
            return this.operator;
        }
    },
    watch: {
        value () {
            if (!this.isAdjusting && (!this.isInitializing || Array.isArray(this.prechecked) && this.prechecked.length === 2)) {
                this.emitCurrentRule([this.inRangeValueLeft, this.inRangeValueRight], this.isInitializing);
            }
        },
        adjustment (adjusting) {
            if (!isObject(adjusting) || this.visible === false || this.isParent) {
                return;
            }

            if (adjusting?.start) {
                this.isAdjusting = true;
            }

            if (adjusting?.finish) {
                this.$nextTick(() => {
                    this.isAdjusting = false;
                });
            }
        },
        disabled (value) {
            this.disable = typeof value === "boolean" ? value : true;
        }
    },
    mounted () {
        this.$nextTick(() => {
            if (typeof this.minValue !== "undefined" && typeof this.maxValue !== "undefined") {
                this.minimumValue = this.minValue;
                this.maximumValue = this.maxValue;
                this.value = Array.isArray(this.prechecked) && this.prechecked.length === 2 ? this.prechecked : [this.minimumValue, this.maximumValue];
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
                    this.value = Array.isArray(this.prechecked) && this.prechecked.length === 2 ? this.prechecked : [this.minimumValue, this.maximumValue];
                    this.$nextTick(() => {
                        this.isInitializing = false;
                        this.disable = false;
                    });
                }, err => {
                    this.isInitializing = false;
                    this.disable = false;
                    console.warn(err);
                }, typeof this.minValue === "undefined" && typeof this.maxValue !== "undefined", typeof this.minValue !== "undefined" && typeof this.maxValue === "undefined", false,
                {rules: this.fixedRules, filterId: this.filterId});
            }
            else {
                this.value = Array.isArray(this.prechecked) && this.prechecked.length === 2 ? this.prechecked : [0, 100];
                this.$nextTick(() => {
                    this.isInitializing = false;
                    this.disable = false;
                });
            }
            if (this.visible && Array.isArray(this.prechecked) && this.prechecked.length === 2) {
                this.emitCurrentRule(this.prechecked, true);
            }
        });
        this.$emit("setSnippetPrechecked", this.visible && Array.isArray(this.prechecked) && this.prechecked.length === 2);
    },
    methods: {
        translateKeyWithPlausibilityCheck,

        /**
         * Calculates the position of the left slider button in percent.
         * @info a 5% offset is calculated in to compensate for button width
         * @returns {String} the percentage to use for css left style
         */
        getMeasureLeft () {
            const range = this.maximumValue - this.minimumValue,
                left = this.inRangeValueLeft - this.minimumValue;

            return String((95 / Math.max(1, range) * left).toFixed(1)) + "%";
        },
        /**
         * Calculates the distance between both slider buttons in percent.
         * @info a 5% offset is calculated in to compensate for button width
         * @returns {String} the percentage to use for css width style
         */
        getMeasureWidth () {
            const range = this.maximumValue - this.minimumValue,
                measure = this.inRangeValueRight - this.inRangeValueLeft;

            return String((95 / Math.max(1, range) * measure + 5).toFixed(1)) + "%";
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
                operator: this.securedOperator,
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
            this.isAdjusting = true;
            if (this.visible) {
                this.inRangeValueLeft = this.minimumValue;
                this.inRangeValueRight = this.maximumValue;
            }
            this.$nextTick(() => {
                if (typeof onsuccess === "function") {
                    onsuccess();
                }
                this.isAdjusting = false;
            });
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
         * Triggered once when changes are made at the slider to avoid set of rules during changes.
         * @returns {void}
         */
        startSliderChange () {
            if (!isObject(this.adjustment)) {
                return;
            }
            this.isAdjusting = true;
        },
        /**
         * Triggered once when end of changes are detected at the slider to start set of rules after changes.
         * @returns {void}
         */
        endSliderChange () {
            if (!isObject(this.adjustment)) {
                return;
            }
            this.isAdjusting = false;
            this.$nextTick(() => {
                this.emitCurrentRule([this.inRangeValueLeft, this.inRangeValueRight], this.isInitializing);
            });
        }
    }
};
</script>

<template>
    <div
        v-show="visible"
        class="snippetSliderRangeContainer"
    >
        <div class="sliderInputWrapper">
            <div class="left">
                <label
                    v-if="title !== false"
                    :for="'snippetSliderInpMin-' + snippetId"
                    class="snippetSliderRangeLabel"
                >{{ titleText }}</label>
            </div>
            <div
                v-if="info"
                class="right"
            >
                <SnippetInfo
                    :info="info"
                    :translation-key="translationKey"
                />
            </div>
        </div>
        <div class="sliderRangeWrapper">
            <div class="sliderInputContainer">
                <div class="left">
                    <input
                        :id="'snippetSliderInputMin-' + snippetId"
                        v-model="inRangeValueLeft"
                        :aria-label="ariaLabelSliderRangeMin"
                        class="slider-input-min form-control"
                        type="number"
                        :disabled="disable"
                        :step="getSliderSteps(decimalPlaces)"
                        :min="minimumValue"
                        :max="maximumValue"
                        @focus="startSliderChange()"
                        @blur="endSliderChange()"
                        @keyup.enter="endSliderChange()"
                    >
                </div>
                <div class="right">
                    <input
                        :id="'snippetSliderInputMax-' + snippetId"
                        v-model="inRangeValueRight"
                        :aria-label="ariaLabelSliderRangeMax"
                        class="slider-input-max form-control"
                        type="number"
                        :disabled="disable"
                        :step="getSliderSteps(decimalPlaces)"
                        :min="minimumValue"
                        :max="maximumValue"
                        @focus="startSliderChange()"
                        @blur="endSliderChange()"
                        @keyup.enter="endSliderChange()"
                    >
                </div>
            </div>
            <div class="sliderRangeContainer">
                <div class="slider-range-track">
                    <div
                        class="slider-range-measure"
                        :style="{ left: getMeasureLeft(), width: getMeasureWidth() }"
                    />
                </div>
                <input
                    :id="'snippetSliderRangeMin-' + snippetId"
                    v-model="inRangeValueLeft"
                    :aria-label="ariaLabelSliderRangeMin"
                    class="slider-range-min"
                    type="range"
                    :class="disable ? 'disabled':''"
                    :disabled="disable"
                    :step="getSliderSteps()"
                    :min="minimumValue"
                    :max="maximumValue"
                    @mousedown="startSliderChange()"
                    @mouseup="endSliderChange()"
                >
                <input
                    :id="'snippetSliderRangeMax-' + snippetId"
                    v-model="inRangeValueRight"
                    :aria-label="ariaLabelSliderRangeMax"
                    class="slider-range-max"
                    type="range"
                    :class="disable ? 'disabled':''"
                    :disabled="disable"
                    :step="getSliderSteps()"
                    :min="minimumValue"
                    :max="maximumValue"
                    @mousedown="startSliderChange()"
                    @mouseup="endSliderChange()"
                >
                <div class="values">
                    <span class="max">{{ maximumValue }}</span>
                    <span class="min">{{ minimumValue }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
    @import "~/css/mixins.scss";
    @import "~variables";
    .form-control {
        height: 28px;
    }
    .sliderInputWrapper {
        height: 20px;
    }
    .sliderInputWrapper .left {
        float: left;
        width: 90%;
    }
    .sliderInputWrapper .right {
        position: absolute;
        right: 0;
    }
    .sliderRangeWrapper {
        position: relative;
        width: 100%;
        background-color: $white;
        padding: 0 5px;
        margin: auto;
        position: relative;
        height: 80px;
    }
    .sliderRangeContainer {
        position: relative;
        width: 100%;
        height: 60px;
    }
    .sliderInputContainer {
        position: relative;
        width: 100%;
        height: 16px;
    }
    .sliderInputContainer .left {
        float: left;
    }
    .sliderInputContainer .right {
        float: right;
    }
    .values {
        position: relative;
        margin: auto;
        font-size: 12px;
        color: $black;
    }
    input[type="range"] {
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        width: 100%;
        outline: none;
        position: absolute;
        margin: auto;
        top: 0;
        bottom: 1px;
        left: 0;
        background-color: transparent;
        pointer-events: none;
    }
    input[type=number]:focus,
    input[type=range]:focus {
        outline: none;
    }
    .slider-range-track {
        width: 100%;
        height: 15px;
        background-color: $light_grey;
        position: absolute;
        margin: auto;
        top: 0;
        bottom: 0;
        border-radius: 10px;
    }
    .slider-range-measure {
        height: 15px;
        background-color: $light_blue;
        position: absolute;
        top: 0;
        bottom: 0;
        border-radius: 10px;
    }
    input[type="range"]::-webkit-slider-runnable-track {
        -webkit-appearance: none;
        height: 3px;
        width: 100%;
        cursor: pointer;
        border-radius: 1px;
        box-shadow: none;
    }
    input[type="range"]::-moz-range-track {
        -moz-appearance: none;
        height: 3px;
    }
    input[type="range"]::-ms-track {
        appearance: none;
        height: 3px;
    }
    input[type="range"]::-webkit-slider-thumb {
        -webkit-appearance: none;
        height: 15px;
        width: 15px;
        background-color: $white;
        cursor: pointer;
        border-radius: 10px;
        pointer-events: auto;
        margin-top: -5px;
        z-index: 2;
    }
    input[type="range"]::-moz-range-thumb {
        -webkit-appearance: none;
        height: 15px;
        width: 15px;
        background-color: $white;
        cursor: pointer;
        border-radius: 50%;
        pointer-events: auto;
    }
    input[type="range"]::-ms-thumb {
        -appearance: none;
        height: 15px;
        width: 15px;
        background-color: $white;
        cursor: pointer;
        border-radius: 50%;
        pointer-events: auto;
    }
    input[type="range"]:active::-ms-thumb {
        background-color: $white;
        border: 1px solid $light_blue;
    }
    input[type="range"]:active::-moz-range-thumb {
        background-color: $white;
        border: 1px solid $light_blue;
    }
    input[type="range"]:active::-webkit-slider-thumb {
        background-color: $white;
        border: 1px solid $light_blue;
    }
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }
    input[type="number"] {
        text-align: center;
        font-size: 12px;
        -moz-appearance: textfield;
        outline: none;
        width: 80px;
        float: right;
        margin-bottom: 10px;
        padding-top: 5px;
        margin-left: 2px;
    }
    input[type="number"]::-webkit-outer-spin-button,
    input[type="number"]::-webkit-inner-spin-button {
        -webkit-appearance: none;
    }
    span {
        &.min {
            float: left;
            position: absolute;
            left: 0;
            top: 48px;
        }
        &.max {
            float: right;
            position: absolute;
            right: 0;
            top: 48px;
        }
    }
    input[type="range"].disabled::-webkit-slider-thumb {
        background-color: $light_grey;
    }
    .category-layer .right {
        right: 30px;
    }
</style>
