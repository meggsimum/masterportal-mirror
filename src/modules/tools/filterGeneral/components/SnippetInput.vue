<script>
import {translateKeyWithPlausibilityCheck} from "../../../../utils/translateKeyWithPlausibilityCheck.js";

export default {
    name: "SnippetInput",
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
            default: "IN"
        },
        placeholder: {
            type: String,
            required: false,
            default: ""
        },
        prechecked: {
            type: String,
            required: false,
            default: ""
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
            value: "",
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
                return this.$t("common:modules.tools.filterGeneral.info.snippetInput");
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
                if (!value) {
                    this.deleteCurrentRule();
                }
                else {
                    this.emitCurrentRule(value, this.isInitializing);
                }
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
        class="snippetInputContainer"
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
                :for="'snippetInput-' + snippetId"
                class="snippetInputLabel left"
            >{{ labelText }}</label>
            <input
                :id="'snippetInput-' + snippetId"
                v-model="value"
                class="snippetInput"
                type="text"
                name="input"
                :disabled="disabled"
                :placeholder="placeholder"
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
    input {
        box-sizing: border-box;
        outline: 0;
        position: relative;
        width: 100%;
    }
    .snippetInputContainer {
        padding: 5px;
        margin-bottom: 10px;
        height: auto;
    }
    .snippetInputContainer input {
        clear: left;
        width: 100%;
        box-sizing: border-box;
        outline: 0;
        position: relative;
        margin-bottom: 5px;
    }
    .snippetInputContainer .info-icon {
        float: right;
        font-size: 16px;
        color: #ddd;
    }
    .snippetInputContainer .info-icon .opened {
        color: #000;
    }
    .snippetInputContainer .info-icon:hover {
        cursor: pointer;
        color: #a5a09e;
    }
    .snippetInputContainer .info-text {
        border: 1px solid #ddd;
        border-radius: 5px;
        font-size: 10px;
        padding: 15px 10px;
    }
    .glyphicon-info-sign:before {
        content: "\E086";
    }
    .snippetInputContainer .bottom {
        clear: left;
        width: 100%;
    }
    .snippetInputContainer .left {
        float: left;
        width: 90%;
    }
    .snippetInputContainer .right {
        position: absolute;
        right: 10px;
    }
    .category-layer .right {
        right: 30px;
    }
</style>
