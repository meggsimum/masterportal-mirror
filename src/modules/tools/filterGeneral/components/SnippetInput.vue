<script>
import {translateKeyWithPlausibilityCheck} from "../../../../utils/translateKeyWithPlausibilityCheck.js";
import SnippetInfo from "./SnippetInfo.vue";

export default {
    name: "SnippetInput",
    components: {
        SnippetInfo
    },
    props: {
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
        title: {
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
            translationKey: "snippetInput"
        };
    },
    computed: {
        ariaLabelInput () {
            return this.$t("modules.tools.filterGeneral.ariaLabel.input", {param: this.attrName});
        },
        titleText () {
            if (this.title === true) {
                return this.attrName;
            }
            else if (typeof this.title === "string") {
                return this.translateKeyWithPlausibilityCheck(this.title, key => this.$t(key));
            }
            return "";
        }
    },
    watch: {
        value (val) {
            if (!val) {
                this.deleteCurrentRule();
            }
            else {
                this.emitCurrentRule(this.value, this.isInitializing);
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
        if (this.visible && this.prechecked !== "") {
            this.emitCurrentRule(this.prechecked, true);
        }
    },
    mounted () {
        this.$emit("setSnippetPrechecked", this.visible && this.prechecked !== "");
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
         * Triggers when the input field has lost its focus.
         * @returns {void}
         */
        inputChanged () {
            if (!this.value) {
                this.deleteCurrentRule();
            }
            else {
                this.emitCurrentRule(this.value, this.isInitializing);
            }
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
                :for="'snippetInput-' + snippetId"
                class="snippetInputLabel left"
            >{{ titleText }}</label>
            <input
                :id="'snippetInput-' + snippetId"
                v-model="value"
                :aria-label="ariaLabelInput"
                class="snippetInput form-control"
                type="text"
                name="input"
                :disabled="disabled"
                :placeholder="placeholder"
                @blur="inputChanged()"
                @keyup.enter="inputChanged()"
            >
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
        right: 0;
    }
    .category-layer .right {
        right: 30px;
    }
</style>
