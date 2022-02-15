<script>
export default {
    name: "SnippetTag",
    props: {
        isResetAll: {
            type: Boolean,
            required: false,
            default: false
        },
        snippetId: {
            type: Number,
            required: false,
            default: 0
        },
        label: {
            type: String,
            required: false,
            default: ""
        },
        value: {
            type: String,
            required: false,
            default: ""
        }
    },
    methods: {
        /**
         * Triggers the functions to reset the snippet and change the rules.
         * @returns {void}
         */
        removeTag () {
            if (this.isResetAll) {
                this.$emit("resetAllSnippets", () => {
                    this.$emit("deleteAllRules");
                });
            }
            else {
                this.$emit("resetSnippet", this.snippetId, () => {
                    this.$emit("deleteRule", this.snippetId);
                });
            }
        }
    }
};
</script>

<template>
    <div
        class="snippetTagContainer"
    >
        <div class="snippetTagLeft">
            <div class="snippetTagLabel">
                {{ label }}
            </div>
            <div class="snippetTagValue">
                {{ value }}
            </div>
        </div>
        <div class="snippetTagRight">
            <div class="snippetTagRemove">
                <a
                    class="snippetTagRemoveButton"
                    @click="removeTag()"
                    @keydown.enter="removeTag()"
                >X</a>
            </div>
        </div>
        <div class="clear" />
    </div>
</template>

<style lang="scss" scoped>
    @import "~/css/mixins.scss";

    .snippetTagContainer {
        float: left;
        width: 80px;
        height: 20px;
        margin: 2px;
        border: 1px solid Gray;
    }
    .snippetTagContainer .clear {
        clear: both;
    }
    .snippetTagContainer .snippetTagLeft {
        float: left;
        width: 80%;
        height: 20px;
        overflow: hidden;
    }
    .snippetTagContainer .snippetTagRight {
        float: right;
        width: 20%;
        height: 20px;
    }
    .snippetTagContainer .snippetTagLabel {
        font-size: 6px;
        color: Black;
    }
    .snippetTagContainer .snippetTagValue {
        font-size: 10px;
        color: Black;
    }
    .snippetTagRemoveButton {
        font-weight: bold;
        color: Black;
        text-decoration: none;
        cursor: pointer;
    }
    .snippetTagRemoveButton:hover {
        color: Red;
        text-decoration: underline;
    }
</style>
