<script>
import isObject from "../../../../utils/isObject";
import {translateKeyWithPlausibilityCheck} from "../../../../utils/translateKeyWithPlausibilityCheck.js";

export default {
    name: "SnippetSliderRange",
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
            isInitializing: true,
            minimumValue: 0,
            maximumValue: 100,
            showInfo: false,
            value: [0, 100]
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
                return this.$t("common:modules.tools.filterGeneral.info.snippetSliderRange");
            }
            else if (typeof this.info === "string") {
                return this.translateKeyWithPlausibilityCheck(this.info, key => this.$t(key));
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
        }
    },
    watch: {
        value () {
            if (!this.isInitializing || Array.isArray(this.prechecked) && this.prechecked.length === 2) {
                this.emitCurrentRule([this.inRangeValueLeft, this.inRangeValueRight], this.isInitializing);
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
            }, typeof this.minValue === "undefined" && typeof this.maxValue !== "undefined", typeof this.minValue !== "undefined" && typeof this.maxValue === "undefined");
        }
        else {
            this.value = Array.isArray(this.prechecked) && this.prechecked.length === 2 ? this.prechecked : [0, 100];
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
                this.inRangeValueLeft = this.minimumValue;
                this.inRangeValueRight = this.maximumValue;
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
                    v-if="label !== false"
                    :for="'snippetSliderInpMin-' + snippetId"
                    class="snippetSliderRangeLabel"
                >{{ labelText }}</label>
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
        </div>
        <div class="sliderRangeWrapper">
            <div class="sliderInputContainer">
                <div class="left">
                    <label
                        :for="'snippetSliderInputMin-' + snippetId"
                    />
                    <input
                        :id="'snippetSliderInputMin-' + snippetId"
                        v-model="inRangeValueLeft"
                        class="slider-input-min"
                        type="number"
                        :disabled="disable"
                        :step="getSliderSteps(decimalPlaces)"
                        :min="minimumValue"
                        :max="maximumValue"
                    >
                </div>
                <div class="right">
                    <label
                        :for="'snippetSliderInputMax-' + snippetId"
                    />
                    <input
                        :id="'snippetSliderInputMax-' + snippetId"
                        v-model="inRangeValueRight"
                        class="slider-input-max"
                        type="number"
                        :disabled="disable"
                        :step="getSliderSteps(decimalPlaces)"
                        :min="minimumValue"
                        :max="maximumValue"
                    >
                </div>
            </div>
            <div class="sliderRangeContainer">
                <div class="slider-range-track">
                    &nbsp;
                </div>
                <label
                    :for="'snippetSliderRangeMin-' + snippetId"
                />
                <input
                    :id="'snippetSliderRangeMin-' + snippetId"
                    v-model="inRangeValueLeft"
                    class="slider-range-min"
                    type="range"
                    :class="disable ? 'disabled':''"
                    :disabled="disable"
                    :step="getSliderSteps()"
                    :min="minimumValue"
                    :max="maximumValue"
                >
                <label
                    :for="'snippetSliderRangeMax-' + snippetId"
                />
                <input
                    :id="'snippetSliderRangeMax-' + snippetId"
                    v-model="inRangeValueRight"
                    class="slider-range-max"
                    type="range"
                    :class="disable ? 'disabled':''"
                    :disabled="disable"
                    :step="getSliderSteps()"
                    :min="minimumValue"
                    :max="maximumValue"
                >
                <div class="values">
                    <span class="max">{{ maximumValue }}</span>
                    <span class="min">{{ minimumValue }}</span>
                </div>
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
    .sliderInputWrapper {
        padding: 5px;
        margin-bottom: 10px;
        height: 20px;
    }
    .info-icon {
        float: right;
        font-size: 16px;
        color: #ddd;
    }
    .info-icon .opened {
        color: #000;
    }
    .info-icon:hover {
        cursor: pointer;
        color: #a5a09e;
    }
    .info-text {
        border: 1px solid #ddd;
        border-radius: 5px;
        font-size: 10px;
        padding: 15px 10px;
        margin-top: 15px;
    }
    .bottom {
        clear: left;
        width: 100%;
        padding: 0 5px;
    }
    .sliderInputWrapper .left {
        float: left;
        width: 90%;
    }
    .sliderInputWrapper .right {
        position: absolute;
        right: 10px;
    }
    .sliderRangeWrapper {
        position: relative;
        width: 100%;
        background-color: #fff;
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
        color: #000;
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
        bottom: 0;
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
        background-color: #ddd;
        position: absolute;
        margin: auto;
        top: 0;
        bottom: 0;
        border-radius: 0px;
    }
    input[type="range"]::-webkit-slider-runnable-track {
        -webkit-appearance: none;
        height: 3px;
        width: 100%;
        cursor: pointer;
        animate: 0.2s;
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
        background-color: #fff;
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
        background-color: #fff;
        cursor: pointer;
        border-radius: 50%;
        pointer-events: auto;
    }
    input[type="range"]::-ms-thumb {
        -appearance: none;
        height: 15px;
        width: 15px;
        background-color: #fff;
        cursor: pointer;
        border-radius: 50%;
        pointer-events: auto;
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
        width: 60px;
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
            top: 45px;
        }
        &.max {
            float: right;
            position: absolute;
            right: 0;
            top: 45px;
        }
    }
    input[type="range"].disabled::-webkit-slider-thumb {
        background-color: #b9b5b5;
    }
    .category-layer .right {
        right: 30px;
    }
</style>
