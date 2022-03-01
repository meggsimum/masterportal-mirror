<script>
import Multiselect from "vue-multiselect";
import {translateKeyWithPlausibilityCheck} from "../../../../utils/translateKeyWithPlausibilityCheck.js";
import {getStyleModel, getIconListFromLegend} from "../utils/getIconListFromLegend.js";
import isObject from "../../../../utils/isObject.js";
import SnippetInfo from "./SnippetInfo.vue";

export default {
    name: "SnippetDropdown",
    components: {
        Multiselect,
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
        addSelectAll: {
            type: [String, Boolean],
            required: false,
            default: false
        },
        adjustment: {
            type: [Object, Boolean],
            required: false,
            default: false
        },
        autoInit: {
            type: Boolean,
            required: false,
            default: true
        },
        disabled: {
            type: Boolean,
            required: false,
            default: false
        },
        display: {
            type: String,
            required: false,
            default: "default"
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
        layerId: {
            type: String,
            required: false,
            default: undefined
        },
        multiselect: {
            type: Boolean,
            required: false,
            default: false
        },
        operator: {
            type: String,
            required: false,
            default: "EQ"
        },
        placeholder: {
            type: String,
            required: false,
            default: ""
        },
        prechecked: {
            type: Array,
            required: false,
            default: undefined
        },
        renderIcons: {
            type: [String, Object],
            required: false,
            default: undefined
        },
        snippetId: {
            type: Number,
            required: false,
            default: 0
        },
        value: {
            type: Array,
            required: false,
            default: undefined
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
            isInitializing: true,
            isAdjusting: false,
            dropdownValue: [],
            dropdownSelected: [],
            styleModel: {},
            legendsInfo: [],
            iconList: {},
            allSelected: false,
            translationKey: "snippetDropdown"
        };
    },
    computed: {
        titleText () {
            if (this.title === true) {
                return this.attrName;
            }
            else if (typeof this.title === "string") {
                return this.translateKeyWithPlausibilityCheck(this.title, key => this.$t(key));
            }
            return "";
        },
        emptyList () {
            return this.$t("modules.tools.filterGeneral.dropdown.emptyList");
        },
        noElements () {
            return this.$t("modules.tools.filterGeneral.dropdown.noElements");
        },
        dropdownValueComputed () {
            if (this.multiselect && this.addSelectAll) {
                return [{
                    selectAllTitle: this.selectAllTitle,
                    list: this.dropdownValue
                }];
            }
            return this.dropdownValue;
        },
        selectAllTitle () {
            return !this.allSelected ? this.$t("modules.tools.filterGeneral.dropdown.selectAll") : this.$t("modules.tools.filterGeneral.dropdown.deselectAll");
        }
    },
    watch: {
        dropdownSelected (value) {
            if (!this.isAdjusting && (!this.isInitializing || this.isInitializing && Array.isArray(this.prechecked))) {
                if (typeof value === "string" && value || Array.isArray(value) && value.length) {
                    this.emitCurrentRule(value, this.isInitializing);
                }
                else {
                    this.deleteCurrentRule();
                }
            }
            this.allSelected = this.dropdownValue.length !== 0 && this.dropdownValue.length === this.dropdownSelected.length;
        },
        adjustment (adjusting) {
            if (!isObject(adjusting) || this.visible === false) {
                return;
            }

            if (adjusting?.start) {
                this.isAdjusting = true;
                this.dropdownValue = [];
            }

            if (isObject(adjusting?.adjust) && Array.isArray(adjusting.adjust?.value)) {
                adjusting.adjust.value.forEach(value => {
                    if (!this.dropdownValue.includes(value) && (!Array.isArray(this.value) || this.value.includes(value))) {
                        this.dropdownValue.push(value);
                    }
                });
            }
            if (adjusting?.finish) {
                const selected = [];

                if (Array.isArray(this.dropdownValue)) {
                    this.dropdownValue.forEach(value => {
                        if (this.dropdownSelected.includes(value)) {
                            selected.push(value);
                        }
                    });
                }
                this.dropdownSelected = selected;
                this.$nextTick(() => {
                    this.isAdjusting = false;
                });
            }
        },
        disabled (value) {
            this.disable = typeof value === "boolean" ? value : true;
        },
        legendsInfo (value) {
            if (this.renderIcons === "fromLegend") {
                this.iconList = getIconListFromLegend(value, this.styleModel);
            }
        }
    },
    created () {
        this.dropdownSelected = Array.isArray(this.prechecked) ? this.prechecked : [];

        if (!this.visible) {
            this.dropdownValue = Array.isArray(this.prechecked) ? this.prechecked : [];
            this.$nextTick(() => {
                this.isInitializing = false;
                this.disable = false;
            });
        }
        else if (Array.isArray(this.value)) {
            this.dropdownValue = this.value;
            this.$nextTick(() => {
                this.isInitializing = false;
                this.disable = false;
            });
        }
        else if (this.api && this.autoInit !== false) {
            this.api.getUniqueValues(this.attrName, list => {
                this.dropdownValue = list;
                this.$nextTick(() => {
                    this.isInitializing = false;
                    this.disable = false;
                });
            }, error => {
                this.disable = false;
                this.isInitializing = false;
                console.warn(error);
            });
        }
        else {
            this.dropdownValue = [];
            this.$nextTick(() => {
                this.isInitializing = false;
                this.disable = false;
            });
        }

        if (this.visible && Array.isArray(this.prechecked) && this.prechecked.length) {
            this.emitCurrentRule(this.prechecked, true);
        }
    },
    mounted () {
        if (this.renderIcons === "fromLegend") {
            this.styleModel = getStyleModel(this.layerId);

            if (!this.styleModel || !this.styleModel.getLegendInfos() || !Array.isArray(this.styleModel.getLegendInfos())) {
                this.legendsInfo = [];
            }
            else {
                this.legendsInfo = this.styleModel.getLegendInfos();
            }
        }
        else if (isObject(this.renderIcons)) {
            this.iconList = this.renderIcons;
        }

        this.$emit("setSnippetPrechecked", this.visible && Array.isArray(this.prechecked) && this.prechecked.length);
    },
    methods: {
        translateKeyWithPlausibilityCheck,

        /**
         * Returns true if an icon path exists for the given value.
         * @param {String} value the value to check for
         * @returns {Boolean} true if there is an icon path, false if not
         */
        iconExists (value) {
            return Object.prototype.hasOwnProperty.call(this.iconList, value);
        },
        /**
         * Returns true if there are any icons to show.
         * @returns {Boolean} true if there are any icons, false if not
         */
        anyIconExists () {
            return Object.keys(this.iconList).length > 0;
        },
        /**
         * Returns the title to use in the gui.
         * @returns {String} the title to use
         */
        getTitle () {
            return this.title || this.attrName;
        },
        /**
         * Emits the current rule to whoever is listening.
         * @param {*} value the value to put into the rule
         * @param {Boolean} [startup=false] true if the call comes on startup, false if a user actively changed a snippet
         * @returns {void}
         */
        emitCurrentRule (value, startup = false) {
            let result = [];

            if (typeof value === "string") {
                result = value;
            }
            else if (Array.isArray(value)) {
                value.forEach(obj => {
                    if (typeof obj === "string") {
                        result.push(obj);
                    }
                    else if (isObject(obj) && obj.title) {
                        result.push(obj.title);
                    }
                });
            }
            this.$emit("changeRule", {
                snippetId: this.snippetId,
                startup,
                fixed: !this.visible,
                attrName: this.attrName,
                operator: this.operator,
                value: result
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
                this.dropdownSelected = [];
            }
            this.$nextTick(() => {
                if (typeof onsuccess === "function") {
                    onsuccess();
                }
            });
        },
        /**
         * Select all items
         * @returns {void}
         */
        selectAll () {
            this.dropdownSelected = [];
            for (const item of this.dropdownValue) {
                if (item) {
                    this.dropdownSelected.push(item);
                }
            }
        },
        /**
         * Deselect all items
         * @returns {void}
         */
        deselectAll () {
            this.dropdownSelected = [];
        }
    }
};
</script>

<template>
    <div
        v-show="visible"
        class="snippetDropdownContainer"
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
        <div
            v-if="display === 'default'"
            class="snippetDefaultContainer"
        >
            <div
                v-if="title !== false"
                class="left"
            >
                <label
                    class="select-box-label"
                    :for="'snippetSelectBox-' + snippetId"
                >{{ titleText }}</label>
            </div>
            <div class="select-box-container">
                <Multiselect
                    :id="'snippetSelectBox-' + snippetId"
                    v-model="dropdownSelected"
                    :options="dropdownValueComputed"
                    name="select-box"
                    :disabled="disable"
                    :multiple="multiselect"
                    :placeholder="placeholder"
                    :show-labels="false"
                    open-direction="bottom"
                    :hide-selected="true"
                    :close-on-select="true"
                    :clear-on-select="false"
                    :loading="disable"
                    :group-select="multiselect && addSelectAll"
                    :group-values="(multiselect && addSelectAll) ? 'list' : ''"
                    :group-label="(multiselect && addSelectAll) ? 'selectAllTitle' : ''"
                >
                    <span slot="noOptions">{{ emptyList }}</span>
                    <span slot="noResult">{{ noElements }}</span>
                </Multiselect>
            </div>
        </div>
        <div
            v-if="display === 'list'"
            class="snippetListContainer"
        >
            <div class="table-responsive">
                <table :class="['table table-sm table-hover table-bordered table-striped', info ? 'left': '']">
                    <thead
                        v-if="title !== false"
                    >
                        <tr>
                            <th
                                :colspan="anyIconExists() ? 3 : 2"
                            >
                                <div
                                    class="pull-left"
                                >
                                    {{ titleText }}
                                </div>
                                <div
                                    v-if="multiselect && addSelectAll"
                                    class="pull-right"
                                >
                                    <a
                                        href="#"
                                        class="link-secondary"
                                        @click="!allSelected ? selectAll() : deselectAll()"
                                    >
                                        {{ selectAllTitle }}
                                    </a>
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-for="val in dropdownValue"
                            :key="val"
                        >
                            <td
                                v-if="anyIconExists()"
                            >
                                <label
                                    for="'snippetRadioCheckbox-' + snippetId + '-' + val"
                                >
                                    <img
                                        v-show="iconExists(val)"
                                        class="snippetListContainerIcon"
                                        :src="iconList[val]"
                                        :alt="val"
                                    >
                                </label>
                            </td>
                            <td>
                                <input
                                    v-if="multiselect"
                                    :id="'snippetRadioCheckbox-' + snippetId + '-' + val"
                                    v-model="dropdownSelected"
                                    :aria-label="'snippetRadioCheckbox-' + snippetId + '-' + val"
                                    :class="multiselect ? 'checkbox': 'radio'"
                                    :type="multiselect ? 'checkbox': 'radio'"
                                    :value="val"
                                >
                                <input
                                    v-else
                                    :id="'snippetRadioCheckbox-' + snippetId + '-' + val"
                                    v-model="dropdownSelected[0]"
                                    :aria-label="'snippetRadioCheckbox-' + snippetId + '-' + val"
                                    :class="multiselect ? 'checkbox': 'radio'"
                                    :type="multiselect ? 'checkbox': 'radio'"
                                    :value="val"
                                >
                            </td>
                            <td>
                                <label
                                    class="check-box-label"
                                    :for="'snippetRadioCheckbox-' + snippetId + '-' + val"
                                >{{ val }}</label>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>

<style>
    .select-box-container .multiselect .multiselect__spinner:after, .multiselect__spinner:before {
        position: absolute;
        content: "";
        top: 50%;
        left: 50%;
        margin: -8px 0 0 -8px;
        width: 16px;
        height: 16px;
        border-radius: 100%;
        border: 2px solid transparent;
        border-top-color: #828282;
        box-shadow: 0 0 0 1px transparent;
    }
    .select-box-container .multiselect .multiselect__option {
        display: block;
        min-height: 30px;
        line-height: 10px;
        text-decoration: none;
        text-transform: none;
        vertical-align: middle;
        position: relative;
        cursor: pointer;
        white-space: nowrap;
    }
    .select-box-container .multiselect .multiselect__option--highlight {
        background: #3177b1;
        outline: none;
        color: #fff;
    }
    .select-box-container .multiselect .option__image {
        width: 22px;
    }
    .select-box-container .multiselect .multiselect__tag {
        position: relative;
        display: inline-block;
        padding: 4px 26px 4px 10px;
        border-radius: 5px;
        margin-right: 10px;
        color: #fff;
        line-height: 1;
        background: #3177b1;
        margin-bottom: 5px;
        white-space: nowrap;
        overflow: hidden;
        max-width: 100%;
        text-overflow: ellipsis;
    }
    .select-box-container .multiselect .multiselect__option--highlight:after {
        content: attr(data-select);
        background: #a1d0ff;
        color: white;
    }
    .select-box-container .multiselect .multiselect__tag-icon::after {
        content: "\D7";
        color: #dddddd;
        font-size: 14px;
    }
    .select-box-container .multiselect .multiselect__tag-icon:hover {
        background: #299ec1;
    }
    .select-box-container .multiselect .multiselect__placeholder {
        color: #adadad;
        display: inline-block;
        margin-bottom: 10px;
        padding-top: 2px;
    }
    .select-box-container .multiselect .multiselect__tag-icon:focus, .multiselect__tag-icon:hover {
        background: #ddd;
    }
</style>

<style lang="scss" scoped>
    @import "~/css/mixins.scss";
    select {
        box-sizing: border-box;
        outline: 0;
        position: relative;
        width: 100%;
        margin-bottom: 5px;
    }
    .disabled {
        border-color: #dddddd;
        background-color: #f8f8f8;
    }
    .enabled {
        border-color: initial;
        background-color: initial;
    }
    .snippetDropdownContainer {
        height: auto;
    }
    .snippetDropdownContainer input[type=radio], input[type=checkbox] {
        margin: 0;
    }
    .snippetDropdownContainer .radio, .snippetDropdownContainer .checkbox {
        display: inline-block;
    }
    .snippetDropdownContainer label {
        margin-bottom: 0;
    }
    .snippetDropdownContainer .table > thead > tr > th, .table > thead > tr > td, .table > tbody > tr > th, .table > tbody > tr > td, .table > tfoot > tr > th, .table > tfoot > tr > td {
        padding: 4px;
        line-height: 1.428571429;
        vertical-align: middle;
        border-top: 1px solid #ddd;
    }
    .snippetListContainer .snippetListContainerIcon {
        width: 25px;
    }
    .snippetDropdownContainer select {
        clear: left;
        width: 100%;
    }
    .snippetDropdownContainer .bottom {
        clear: left;
        width: 100%;
    }
    .snippetDropdownContainer .table-responsive .right {
        position: absolute;
        right: 0;
    }
    .snippetDropdownContainer .table-responsive a {
        margin-right: 20px;
    }
    .panel .snippetDropdownContainer .right,  .snippetDropdownContainer .right {
        position: absolute;
        right: 0;
    }
    .category-layer .panel .right {
        right: 30px;
    }
    .category-layer .panel .table-responsive .right {
        right: 24px;
    }
    .table {
        margin-bottom: 10px;
    }
</style>
