<script>
import SnippetInfo from "./SnippetInfo.vue";

export default {
    name: "SnippetCheckboxFilterInMapExtent",
    components: {
        SnippetInfo
    },
    props: {
        filterId: {
            type: Number,
            required: true
        },
        info: {
            type: [String, Boolean],
            required: false,
            default: true
        }
    },
    data () {
        return {
            checked: false,
            translationKey: "snippetCheckbox"
        };
    },
    watch: {
        checked: {
            handler (value) {
                this.emitCurrentCommand(value);
            }
        }
    },
    mounted () {
        this.$nextTick(() => {
            this.emitCurrentCommand(this.checked);
        });
    },
    methods: {
        /**
         * Emits the current command to whoever is listening.
         * @param {*} value the value to put into the command
         * @returns {void}
         */
        emitCurrentCommand (value) {
            this.$emit("commandChanged", value);
        }
    }
};
</script>

<template>
    <div
        class="snippetCheckboxContainer"
    >
        <div class="left">
            <input
                :id="'CheckboxFilterInMapExtent-' + filterId"
                v-model="checked"
                class="snippetCheckbox"
                type="checkbox"
                name="checkbox"
            >
            <label
                :for="'CheckboxFilterInMapExtent-' + filterId"
            >
                {{ $t('modules.tools.filterGeneral.searchInMapExtent') }}
            </label>
        </div>
        <div
            v-if="info"
            class="right"
        >
            <SnippetInfo
                :info="info"
                :translation-key="translationKey"
            />
        </div>
    </div>
</template>

<style lang="scss" scoped>
    @import "~/css/mixins.scss";
    .snippetCheckboxContainer {
        margin-bottom: 10px;
        height: auto;
        position: relative;
    }
    .snippetCheckboxContainer .left {
        input[type=radio], input[type=checkbox] {
            margin: 0 5px 0 0;
        }
        /*float: left;*/
        input {
            float: left;
            width: 15px;
            margin-right: 5px;
        }
        label {
            float: left;
            /*margin-bottom: 0;*/
            cursor: pointer;
        }
    }
    .snippetCheckboxContainer .right {
        position: absolute;
        right: 0px;
    }
</style>
