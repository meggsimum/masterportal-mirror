<script>
import isObject from "../../../../utils/isObject";
import {translateKeyWithPlausibilityCheck} from "../../../../utils/translateKeyWithPlausibilityCheck.js";
import moment from "moment";
import SnippetInfo from "./SnippetInfo.vue";

export default {
    name: "SnippetDate",
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
        title: {
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
            default: "EQ"
        },
        prechecked: {
            type: String,
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
            isAdjusting: false,
            minimumValue: "",
            maximumValue: "",
            value: "",
            precheckedIsValid: false,
            translationKey: "snippetDate"
        };
    },
    computed: {
        ariaLabelDate () {
            return this.$t("modules.tools.filterGeneral.ariaLabel.date", {param: this.attrName});
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
        inRangeValue: {
            get () {
                const momentMinimum = moment(this.minimumValue, this.internalFormat),
                    momentMaximum = moment(this.maximumValue, this.internalFormat),
                    momentValue = moment(this.value, this.internalFormat);

                if (!momentValue.isValid()) {
                    return "";
                }
                else if (momentValue.isSameOrAfter(momentMaximum)) {
                    return momentMaximum.format(this.internalFormat);
                }
                else if (momentValue.isSameOrBefore(momentMinimum)) {
                    return momentMinimum.format(this.internalFormat);
                }
                return momentValue.format(this.internalFormat);
            },
            set (value) {
                this.value = value;
            }
        }
    },
    watch: {
        value () {
            if (!this.isAdjusting && (!this.isInitializing || this.precheckedIsValid)) {
                this.emitCurrentRule(moment(this.inRangeValue, this.internalFormat).format(this.format), this.isInitializing);
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
            this.disable = typeof this.disabled === "boolean" ? value : true;
        }
    },
    created () {
        const momentPrechecked = moment(this.prechecked, this.format),
            momentMin = moment(this.minValue, this.format),
            momentMax = moment(this.maxValue, this.format);

        this.precheckedIsValid = momentPrechecked.isValid();

        if (momentMin.isValid() && momentMax.isValid()) {
            this.minimumValue = momentMin.format(this.internalFormat);
            this.maximumValue = momentMax.format(this.internalFormat);

            if (this.precheckedIsValid) {
                this.value = momentPrechecked.format(this.internalFormat);
            }
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

                if (Object.prototype.hasOwnProperty.call(minMaxObj, "min")) {
                    this.minimumValue = moment(minMaxObj.min, this.format).format(this.internalFormat);
                }
                else {
                    this.minimumValue = momentMin.format(this.internalFormat);
                }
                if (Object.prototype.hasOwnProperty.call(minMaxObj, "max")) {
                    this.maximumValue = moment(minMaxObj.max, this.format).format(this.internalFormat);
                }
                else {
                    this.maximumValue = momentMax.format(this.internalFormat);
                }

                if (this.precheckedIsValid) {
                    this.value = momentPrechecked.format(this.internalFormat);
                }
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
            this.value = this.precheckedIsValid ? momentPrechecked.format(this.internalFormat) : "";
            this.$nextTick(() => {
                this.isInitializing = false;
                this.disable = false;
            });
        }
        if (this.visible && this.precheckedIsValid) {
            this.emitCurrentRule(this.prechecked, true);
        }
    },
    mounted () {
        this.$emit("setSnippetPrechecked", this.visible && this.precheckedIsValid);
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
                this.value = "";
            }
            this.$nextTick(() => {
                if (typeof onsuccess === "function") {
                    onsuccess();
                }
            });
        },
        /**
         * Triggered once when changes are made at the date picker to avoid set of rules during changes.
         * @returns {void}
         */
        startDateChange () {
            if (!isObject(this.adjustment)) {
                return;
            }
            this.isAdjusting = true;
        },
        /**
         * Triggered once when end of changes are detected at the date picker to start set of rules after changes.
         * @returns {void}
         */
        endDateChange () {
            if (!isObject(this.adjustment)) {
                return;
            }
            this.isAdjusting = false;
            this.$nextTick(() => {
                this.emitCurrentRule(moment(this.inRangeValue, this.internalFormat).format(this.format), this.isInitializing);
            });
        }
    }
};
</script>

<template>
    <div
        v-show="visible"
        class="snippetDateContainer"
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
        <div class="input-container">
            <label
                v-if="title !== false"
                class="snippetDateLabel left"
                :for="'snippetDate-' + snippetId"
            >{{ titleText }}</label>
            <input
                :id="'snippetDate-' + snippetId"
                v-model="inRangeValue"
                :aria-label="ariaLabelDate"
                class="snippetDate form-control"
                type="date"
                name="dateInput"
                :max="maximumValue"
                :min="minimumValue"
                :disabled="disable"
                @focus="startDateChange()"
                @blur="endDateChange()"
                @keyup.enter="endDateChange()"
            >
        </div>
    </div>
</template>

<style lang="scss" scoped>
    @import "~/css/mixins.scss";
    .form-control {
        height: 28px;
    }
    .snippetDateContainer {
        height: auto;
    }
    .snippetDateContainer input {
        clear: left;
        width: 100%;
        box-sizing: border-box;
        outline: 0;
        position: relative;
        margin-bottom: 5px;
        height: 34px;
    }
    .snippetDateContainer .left {
        float: left;
        width: 90%;
    }
    .snippetDateContainer .right {
        position: absolute;
        right: 0;
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
