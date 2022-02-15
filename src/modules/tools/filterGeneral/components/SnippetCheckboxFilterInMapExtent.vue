<script>
export default {
    name: "SnippetCheckboxFilterInMapExtent",
    props: {
        filterId: {
            type: Number,
            required: true
        }
    },
    data () {
        return {
            checked: false,
            showInfo: false
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
        <div class="right">
            <div class="info-icon">
                <span
                    class="glyphicon glyphicon-info-sign"
                    @click="toggleInfo()"
                    @keydown.enter="toggleInfo()"
                />
            </div>
        </div>
        <div
            v-show="showInfo"
            class="bottom"
        >
            <div class="info-text">
                <span>{{ $t("modules.tools.filterGeneral.checkBoxInfo") }}</span>
            </div>
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
        right: -10px;
    }
</style>
