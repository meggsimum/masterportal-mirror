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
        <button
            type="button"
            class="btn-tags"
            title="löschen"
            @click="removeTag()"
            @keydown.enter="removeTag()"
        >
            <span class="snippetTagValue pull-left">{{ value }}</span>
            <span class="glyphicon glyphicon-remove pull-right" />
            <br>
            <span class="snippetTagLabel">{{ label }}</span>
        </button>
    </div>
</template>

<style lang="scss" scoped>
    @import "~/css/mixins.scss";
    .snippetTagContainer {
        margin: 0 0 2px 2px;
        float: left;
    }
    .snippetTagContainer button {
        min-height: 39px;
    }
    .snippetTagContainer .snippetTagLabel {
        font-size: 10px;
    }
    .snippetTagContainer .snippetTagValue {
        font-size: 10px;
        font-weight: bold;
        padding-right: 2px;
    }
    .glyphicon-remove:hover {
        color: #E10019;
    }
</style>
