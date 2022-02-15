<script>
import isObject from "../../../../utils/isObject";
import {translateKeyWithPlausibilityCheck} from "../../../../utils/translateKeyWithPlausibilityCheck.js";
import moment from "moment";

export default {
    name: "SnippetDate",
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
            minimumValue: "",
            maximumValue: "",
            showInfo: false,
            value: "",
            precheckedIsValid: false
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
                return this.$t("common:modules.tools.filterGeneral.info.snippetDate");
            }
            else if (typeof this.info === "string") {
                return this.translateKeyWithPlausibilityCheck(this.info, key => this.$t(key));
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
            if (!this.isInitializing || this.precheckedIsValid) {
                this.emitCurrentRule(moment(this.inRangeValue, this.internalFormat).format(this.format), this.isInitializing);
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
        class="snippetDateContainer"
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
        <div class="input-container">
            <label
                v-if="label !== false"
                class="snippetDateLabel left"
                :for="'snippetDate-' + snippetId"
            >{{ labelText }}</label>
            <input
                :id="'snippetDate-' + snippetId"
                v-model="inRangeValue"
                class="snippetDate"
                type="date"
                name="dateInput"
                :max="maximumValue"
                :min="minimumValue"
                :disabled="disable"
            >
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
    .snippetDateContainer {
        padding: 5px;
        margin-bottom: 10px;
        height: auto;
    }
    .snippetDateContainer input {
        clear: left;
        width: 100%;
        box-sizing: border-box;
        outline: 0;
        position: relative;
        margin-bottom: 5px;
    }
    .snippetDateContainer .info-icon {
        float: right;
        font-size: 16px;
        color: #ddd;
    }
    .snippetDateContainer .info-icon .opened {
        color: #000;
    }
    .snippetDateContainer .info-icon:hover {
        cursor: pointer;
        color: #a5a09e;
    }
    .snippetDateContainer .info-text {
        border: 1px solid #ddd;
        border-radius: 5px;
        font-size: 10px;
        padding: 15px 10px;
    }
    .snippetDateContainer .bottom {
        clear: left;
        width: 100%;
    }
    .snippetDateContainer .left {
        float: left;
        width: 90%;
    }
    .snippetDateContainer .right {
        position: absolute;
        right: 10px;
    }
    label {
        text-transform: capitalize;
        margin: 0;
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
