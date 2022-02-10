<script>
import {translateKeyWithPlausibilityCheck} from "../../../../utils/translateKeyWithPlausibilityCheck.js";

export default {
    name: "SnippetCheckbox",
    props: {
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
        label: {
            type: [String, Boolean],
            required: false,
            default: true
        },
        operator: {
            type: String,
            required: false,
            default: "EQ"
        },
        prechecked: {
            type: Boolean,
            required: false,
            default: false
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
            isInitializing: true,
            value: false,
            showInfo: false
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
                return this.$t("common:modules.tools.filterGeneral.info.snippetCheckbox");
            }
            else if (typeof this.info === "string") {
                return this.translateKeyWithPlausibilityCheck(this.info, key => this.$t(key));
            }
            return "";
        }
    },
    watch: {
        value: {
            handler (value) {
                this.emitCurrentRule(value, this.isInitializing);
            }
        }
    },
    created () {
        if (this.prechecked) {
            this.value = this.prechecked;
        }
        this.$nextTick(() => {
            this.isInitializing = false;
        });
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
            if (value) {
                this.$emit("changeRule", {
                    snippetId: this.snippetId,
                    startup,
                    fixed: !this.visible,
                    attrName: this.attrName,
                    operator: this.operator,
                    value
                });
            }
            else {
                this.deleteCurrentRule();
            }
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
                this.value = false;
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
        class="snippetCheckboxContainer"
    >
        <div class="left">
            <input
                :id="'snippetCheckbox-' + snippetId"
                v-model="value"
                class="snippetCheckbox"
                type="checkbox"
                name="checkbox"
                :disabled="disabled"
            >
            <label
                v-if="label !== false"
                :for="'snippetCheckbox-' + snippetId"
                class="snippetCheckboxLabel"
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
    .snippetCheckboxContainer {
        margin-bottom: 10px;
        height: auto;
    }
    .snippetCheckboxContainer .info-icon {
        float: right;
        font-size: 16px;
        color: #ddd;
    }
    .snippetCheckboxContainer .info-icon .opened {
        color: #000;
    }
    .snippetCheckboxContainer .info-icon:hover {
        cursor: pointer;
        color: #a5a09e;
    }
    .snippetCheckboxContainer .info-text {
        border: 1px solid #ddd;
        border-radius: 5px;
        font-size: 10px;
        padding: 15px 10px;
    }
    .glyphicon-info-sign:before {
        content: "\E086";
    }
    .snippetCheckboxContainer .bottom {
        clear: left;
        width: 100%;
    }
    .snippetCheckboxContainer .left {
        float: left;
        input {
            float: left;
            width: 15px;
            margin-right: 5px;
        }
        label {
            float: left;
            width: calc(100% - 20px);
            margin-bottom: 0;
            cursor: pointer;
        }
    }
    .snippetCheckboxContainer .right {
        position: absolute;
        right: 10px;
    }
    .category-layer .right {
        right: 30px;
    }
</style>
