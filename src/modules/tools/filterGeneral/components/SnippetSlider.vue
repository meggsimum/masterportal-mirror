<script>
import isObject from "../../../../utils/isObject";
import {translateKeyWithPlausibilityCheck} from "../../../../utils/translateKeyWithPlausibilityCheck.js";
import SnippetInfo from "./SnippetInfo.vue";

export default {
    name: "SnippetSlider",
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
        info: {
            type: [String, Boolean],
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
            isAdjusting: false,
            minimumValue: 0,
            maximumValue: 100,
            value: 0,
            translationKey: "snippetSlider"
        };
    },
    computed: {
        titleText () {
            if (this.title === true) {
                return this.attrName;
            }
            else if (typeof this.title === "string") {
                return this.translateKeyWithPlausibilityCheck(this.title, key => this.$t(key));
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
            if (!this.isAdjusting && (!this.isInitializing || typeof this.prechecked !== "undefined")) {
                this.emitCurrentRule(this.inRangeValue, this.isInitializing);
            }
        },
        adjustment (adjusting) {
            if (!isObject(adjusting) || this.visible === false) {
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
        if (this.visible && typeof this.prechecked !== "undefined") {
            this.emitCurrentRule(this.prechecked, true);
        }
    },
    mounted () {
        this.$emit("setSnippetPrechecked", this.visible && typeof this.prechecked !== "undefined");
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
         * @param {Event} evt - input event
         * @returns {void}
         */
        endSliderChange (evt) {
            this.checkInput(evt);
            if (!isObject(this.adjustment)) {
                return;
            }
            this.$nextTick(() => {
                this.isAdjusting = false;
                this.emitCurrentRule(this.inRangeValue, this.isInitializing);
            });
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
            v-if="info"
            class="right"
        >
            <SnippetInfo
                :info="info"
                :translation-key="translationKey"
            />
        </div>
        <label
            v-if="title !== false"
            :for="'snippetSlider-' + snippetId"
            class="snippetSliderLabel left"
        >{{ titleText }}</label>
        <input
            :id="'snippetSlider-' + snippetId"
            ref="inputNumber"
            v-model="inRangeValue"
            class="input-single form-control"
            type="number"
            :min="minimumValue"
            :max="maximumValue"
            :name="title"
            :disabled="disable"
            @focus="startSliderChange()"
            @blur="endSliderChange"
            @keyup.enter="endSliderChange"
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
                @mousedown="startSliderChange()"
                @mouseup="endSliderChange"
            >
        </div>
        <span class="min">{{ minimumValue }}</span>
        <span class="max">{{ maximumValue }}</span>
    </div>
</template>

<style lang="scss" scoped>
    @import "~/css/mixins.scss";
    .form-control {
        height: 28px;
    }
    .snippetSliderContainer {
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
    .snippetSliderContainer .left {
        float: left;
        width: 90%;
    }
    .snippetSliderContainer .right {
        position: absolute;
        right: 0;
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

    input[type="range"]:active::-ms-thumb {
        background-color: #fff;
        border: 1px solid #3177b1;
    }
    input[type="range"]:active::-moz-range-thumb {
        background-color: #fff;
        border: 1px solid #3177b1;
    }
    input[type="range"]:active::-webkit-slider-thumb {
        background-color: #fff;
        border: 1px solid #3177b1;
    }

    /* Firefox */
    input[type="range"] {
        -webkit-appearance: none;
        background-color: #ddd;
        height: 15px;
        overflow: hidden;
        width: 100%;
        border-radius: 10px;
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
