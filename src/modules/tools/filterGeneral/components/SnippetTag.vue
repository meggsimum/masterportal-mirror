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
        padding: 5px 6px;
        font-size: 12px;
        font-family: "MasterPortalFont", "Arial", sans-serif;
        color: #fff;
        background-color: rgba(0, 0, 0, 0.5);
        border: none;
    }
    .snippetTagContainer button:hover {
        opacity: 1;
        background-color: #3177b1;
        color: #F3F3F3;
        cursor: pointer;
    }
    .snippetTagContainer .snippetTagLabel {
        font-size: 10px;
    }
    .snippetTagContainer .snippetTagValue {
        padding-right: 5px;
    }
    .glyphicon-remove:hover {
        color: #E10019;
    }
</style>
