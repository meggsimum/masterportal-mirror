<script>
import ProgressBar from "./ProgressBar.vue";
import SnippetCheckbox from "./SnippetCheckbox.vue";
import SnippetCheckboxFilterInMapExtent from "./SnippetCheckboxFilterInMapExtent.vue";
import SnippetDate from "./SnippetDate.vue";
import SnippetDateRange from "./SnippetDateRange.vue";
import SnippetDropdown from "./SnippetDropdown.vue";
import SnippetInput from "./SnippetInput.vue";
import SnippetSlider from "./SnippetSlider.vue";
import SnippetSliderRange from "./SnippetSliderRange.vue";
import SnippetTag from "./SnippetTag.vue";
import isObject from "../../../../utils/isObject";
import FilterApi from "../interfaces/filter.api.js";
import MapHandler from "../utils/mapHandler.js";
import {compileSnippets} from "../utils/compileSnippets.js";
import {translateKeyWithPlausibilityCheck} from "../../../../utils/translateKeyWithPlausibilityCheck.js";
import {getSnippetAdjustments} from "../utils/getSnippetAdjustments.js";
import {getLayerByLayerId} from "../utils/openlayerFunctions";

export default {
    name: "LayerFilterSnippet",
    components: {
        SnippetCheckbox,
        SnippetCheckboxFilterInMapExtent,
        SnippetDate,
        SnippetDateRange,
        SnippetDropdown,
        SnippetInput,
        SnippetSlider,
        SnippetSliderRange,
        SnippetTag,
        ProgressBar
    },
    props: {
        api: {
            type: FilterApi,
            required: false,
            default: undefined
        },
        layerConfig: {
            type: Object,
            required: true
        },
        mapHandler: {
            type: MapHandler,
            required: false,
            default: undefined
        },
        liveZoomToFeatures: {
            type: Boolean,
            required: false,
            default: false
        },
        minScale: {
            type: Number,
            required: false,
            default: 0
        }
    },
    data () {
        return {
            rules: [],
            paging: {
                page: 0,
                total: 0
            },
            disabled: false,
            showStop: false,
            searchInMapExtent: false,
            snippets: [],
            postSnippetKey: "",
            autoRefreshSet: false,
            isRefreshing: false,
            amountOfFilteredItems: false,
            precheckedSnippets: []
        };
    },
    computed: {
        labelFilterButton () {
            if (typeof this.layerConfig.labelFilterButton === "string") {
                return translateKeyWithPlausibilityCheck(this.layerConfig.labelFilterButton, key => this.$t(key));
            }
            return this.$t("common:modules.tools.filterGeneral.filterButton");
        },
        snippetTagsResetAllText () {
            return this.$t("common:modules.tools.filterGeneral.snippetTags.resetAll");
        }
    },
    watch: {
        paging (val) {
            if (val.page >= val.total) {
                this.setFormDisable(false);
                if (!this.isRefreshing && !this.getSearchInMapExtent() && this.liveZoomToFeatures) {
                    this.mapHandler.zoomToFilteredFeature(this.layerConfig?.filterId, this.minScale, error => {
                        console.warn("map error", error);
                    });
                }
                this.isRefreshing = false;
            }
        },
        precheckedSnippets (val) {
            if (this.isStrategyActive() && val.length === this.layerConfig?.snippets.length) {
                const snippetIds = [];

                val.forEach((v, index) => {
                    if (v) {
                        snippetIds.push(index);
                    }
                });

                if (snippetIds.length) {
                    this.handleActiveStrategy(snippetIds);
                }
            }
        }
    },
    created () {
        const filterId = this.layerConfig.filterId,
            layerId = this.getLayerId(filterId, this.layerConfig?.layerId, this.layerConfig?.service?.layerId);

        if (this.api instanceof FilterApi && this.mapHandler instanceof MapHandler) {
            this.mapHandler.initializeLayer(filterId, layerId, this.isExtern(), error => {
                console.warn(error);
            });
            this.api.setServiceByLayerModel(layerId, this.mapHandler.getLayerModelByFilterId(filterId), this.isExtern(), error => {
                console.warn(error);
            });

            if (!this.mapHandler.getLayerModelByFilterId(filterId)) {
                console.warn(new Error("Please check your filter configuration: The given layerId does not exist in your config.json."));
            }
        }
    },
    mounted () {
        compileSnippets(this.layerConfig.snippets, this.api, snippets => {
            this.snippets = snippets;
        }, error => {
            console.warn(error);
        });
    },
    methods: {
        translateKeyWithPlausibilityCheck,

        /**
         * Checks if this layer is supposed to use external filtering.
         * @returns {Boolean} true if the layer should filter external
         */
        isExtern () {
            return this.layerConfig?.extern;
        },
        /**
         * Checks if the strategy of this layer is set to active.
         * @returns {Boolean} true if the strategy is active, false if not
         */
        isStrategyActive () {
            return this.layerConfig?.strategy === "active";
        },
        /**
         * Checking if the snippet type exists.
         * @param {Object} snippet the snippet configuration
         * @param {String} type the type
         * @returns {Boolean} true if the snippet type is the expected type
         */
        hasThisSnippetTheExpectedType (snippet, type) {
            return isObject(snippet) && typeof snippet.type === "string" && snippet.type === type;
        },
        /**
         * Getter for searchInMapExtent.
         * @returns {Boolean} the value of searchInMapExtent
         */
        getSearchInMapExtent () {
            return this.searchInMapExtent;
        },
        /**
         * Changes the internal value for searchInMapExtent.
         * @param {Boolean} value the value to change to
         * @returns {void}
         */
        setSearchInMapExtent (value) {
            this.searchInMapExtent = value;
        },
        /**
         * Resets a snippet by its snippetId.
         * @param {Number} snippetId the snippetId of the snippet to reset
         * @param {Function} onsuccess the function to call on success
         * @returns {void}
         */
        resetSnippet (snippetId, onsuccess) {
            const comp = this.$refs["snippet-" + snippetId];

            if (Array.isArray(comp) && typeof comp[0]?.resetSnippet === "function") {
                comp[0].resetSnippet(onsuccess);
            }
            else if (typeof onsuccess === "function") {
                onsuccess();
            }
        },
        /**
         * Resets all snippets and deletes rules.
         * @param {Function} onsuccess the function to call on success
         * @returns {void}
         */
        resetAllSnippets (onsuccess) {
            let resetCount = this.snippets.length;

            this.snippets.forEach(snippet => {
                this.resetSnippet(snippet.snippetId, () => {
                    resetCount--;
                    if (resetCount <= 0 && typeof onsuccess === "function") {
                        onsuccess();
                    }
                });
            });
        },
        /**
         * Checks if the given structure is a rule.
         * @param {*} something the unknown structure to check
         * @returns {Boolean} true if this is a rule, false if not
         */
        isRule (something) {
            return !(
                typeof something !== "object" || something === null
                || typeof something?.snippetId !== "number"
                || typeof something?.startup !== "boolean"
                || typeof something?.fixed !== "boolean"
                || typeof something?.attrName !== "string" && !Array.isArray(something.attrName)
                || typeof something?.operator !== "string"
            );
        },
        /**
         * Checks if there are rules with fixed=false in the set of rules.
         * @returns {Boolean} true if there are unfixed rules, false if no rules or only fixed rules are left
         */
        hasUnfixedRules () {
            const len = this.rules.length;

            for (let i = 0; i < len; i++) {
                if (!this.rules[i] || this.isRule(this.rules[i]) && this.rules[i].fixed) {
                    continue;
                }
                return true;
            }
            return false;
        },
        /**
         * Handles the active strategy.
         * @param {Number|Number[]} snippetId the snippet Id(s)
         * @returns {void}
         */
        handleActiveStrategy (snippetId) {
            this.filter(snippetId, filterAnswer => {
                const adjustments = getSnippetAdjustments(this.snippets, filterAnswer?.items, filterAnswer?.paging?.page, filterAnswer?.paging?.total),
                    start = typeof adjustments?.start === "boolean" ? adjustments.start : false,
                    finish = typeof adjustments?.finish === "boolean" ? adjustments.finish : false;

                this.snippets.forEach(snippet => {
                    snippet.adjustment = {
                        snippetId,
                        start,
                        finish,
                        adjust: isObject(adjustments[snippet.snippetId]) ? adjustments[snippet.snippetId] : false
                    };
                });
            });
        },
        /**
         * Pushing the value if there are prechecked value in snippet
         * @param {Boolean} value true/false for prechecked value
         * @returns {void}
         */
        setSnippetPrechecked (value) {
            this.precheckedSnippets.push(value);
        },
        /**
         * Triggered when a rule changed at a snippet.
         * @param {Object} rule the rule to set
         * @returns {void}
         */
        changeRule (rule) {
            if (this.isRule(rule)) {
                this.$set(this.rules, rule.snippetId, rule);
                if (!rule.startup && this.isStrategyActive()) {
                    this.$nextTick(() => {
                        this.handleActiveStrategy(rule.snippetId);
                    });
                }
            }
        },
        /**
         * Removes a rule by its snippetId.
         * @param {Number} snippetId the snippetId of the rule to delete
         * @returns {void}
         */
        deleteRule (snippetId) {
            this.$set(this.rules, snippetId, false);
            if (this.isStrategyActive()) {
                this.$nextTick(() => {
                    this.handleActiveStrategy(snippetId);
                });
            }
        },
        /**
         * Removes all rules.
         * @returns {void}
         */
        deleteAllRules () {
            const len = this.rules.length;

            for (let i = 0; i < len; i++) {
                if (this.isRule(this.rules[i]) && this.rules[i].fixed) {
                    continue;
                }
                this.$set(this.rules, i, false);
            }
        },
        /**
         * Returns an array where every entry is a rule.
         * @returns {Object[]} an array of rules, no other values included like false or empty.
         */
        getCleanArrayOfRules () {
            const result = [];

            this.rules.forEach(rule => {
                if (!this.isRule(rule)) {
                    return;
                }
                result.push(rule);
            });
            return result;
        },
        /**
         * Set the post snippet key to rerender the snippet
         * @param {String} value the post snippet key
         * @returns {void}
         */
        setPostSnippetKey (value) {
            this.postSnippetKey = value;
        },
        /**
         * Sets the disabled flag
         * @param {Boolean} disable true/false to en/disable form
         * @returns {void}
         */
        setFormDisable (disable) {
            this.disabled = disable;
        },
        /**
         * Showing or not Showing terminate button
         * @param {Boolean} value true/false to en/disable to show terminate button
         * @returns {void}
         */
        showStopButton (value) {
            this.showStop = value;
        },
        /**
         * Returns the layerId based on the given parameters.
         * @param {Number} filterId the unique id of the internal layer filter
         * @param {String} layerId the layer id from configuration (root scope)
         * @param {Object} serviceLayerId the id given by service, may also be a layerId
         * @returns {String} the layerId to use resulting from input params
         */
        getLayerId (filterId, layerId, serviceLayerId) {
            if (typeof layerId === "string" && layerId) {
                return layerId;
            }
            else if (typeof serviceLayerId === "string" && serviceLayerId) {
                return serviceLayerId;
            }
            return "FilterGeneral-" + filterId;
        },
        /**
         * Filters the layer with the current snippet rules.
         * @param {Number|Number[]} [snippetId=false] the id(s) of the snippet that triggered the filtering
         * @param {Function} [onsuccess=false] a function to call on success
         * @returns {void}
         */
        filter (snippetId = false, onsuccess = false) {
            const filterId = this.layerConfig.filterId,
                filterQuestion = {
                    filterId,
                    snippetId: typeof snippetId === "number" || Array.isArray(snippetId) ? snippetId : false,
                    commands: {
                        paging: this.layerConfig?.paging ? this.layerConfig.paging : 1000,
                        searchInMapExtent: this.getSearchInMapExtent()
                    },
                    rules: this.getCleanArrayOfRules()
                };

            this.setFormDisable(true);
            this.showStopButton(true);

            if (this.api instanceof FilterApi && this.mapHandler instanceof MapHandler) {
                this.mapHandler.activateLayer(filterId, () => {
                    this.api.filter(filterQuestion, filterAnswer => {
                        this.paging = filterAnswer.paging;
                        if (this.paging?.page === 1) {
                            this.mapHandler.clearLayer(filterId, this.isExtern());
                        }

                        this.mapHandler.addItemsToLayer(filterId, filterAnswer.items, this.isExtern());
                        if (!Object.prototype.hasOwnProperty.call(this.layerConfig, "showHits") || this.layerConfig.showHits) {
                            this.amountOfFilteredItems = this.mapHandler.getAmountOfFilteredItemsByFilterId(filterId);
                        }

                        if (this.isExtern()) {
                            this.mapHandler.addExternalLayerToTree(filterId);
                        }

                        if (!this.autoRefreshSet && this.mapHandler.hasAutoRefreshInterval(filterId)) {
                            this.autoRefreshSet = true;
                            this.mapHandler.setObserverAutoInterval(filterId, () => {
                                this.isRefreshing = true;
                                if (this.isStrategyActive()) {
                                    this.handleActiveStrategy();
                                }
                                else {
                                    this.filter();
                                }
                            });
                        }

                        if (typeof onsuccess === "function") {
                            onsuccess(filterAnswer);
                        }
                    }, error => {
                        console.warn(error);
                    });
                });
            }
        },
        /**
         * Terminating the filter process by terminating every snippet
         * @returns {void}
         */
        stopFilter () {
            if (!(this.api instanceof FilterApi)) {
                return;
            }
            this.api.stop(() => {
                this.showStopButton(false);
                this.setFormDisable(false);
            },
            err => {
                console.warn(err);
            });
        },
        /**
         * Get the title or if no title is set get the matching gfiAttribute.
         * @param {Object} snippet the snippet to fetch the title for
         * @param {Number} layerId the layerId
         * @returns {String|Boolean} the title - true if no title is set and no gfiAttribute is found
         */
        getTitle (snippet, layerId) {
            if (!isObject(snippet) || typeof layerId === "undefined") {
                return true;
            }
            if (Object.prototype.hasOwnProperty.call(snippet, "title")) {
                return snippet.title;
            }
            const model = getLayerByLayerId(layerId),
                title = isObject(model) ? model.get("gfiAttributes")[
                    Array.isArray(snippet.attrName) ? snippet.attrName[0] : snippet.attrName
                ] : undefined;

            if (typeof title !== "undefined") {
                return title;
            }
            return true;
        },
        /**
         * Getting the tag title from rule
         * @param {Object} rule the rule to set
         * @returns {String} the tag title
         */
        getTagTitle (rule) {
            if (Object.prototype.hasOwnProperty.call(rule, "tagTitle")) {
                return String(rule.tagTitle);
            }

            return String(rule.value);
        }
    }
};
</script>

<template>
    <div
        class="panel-body"
    >
        <div
            v-if="layerConfig.description"
            class="layerInfoText"
        >
            {{ translateKeyWithPlausibilityCheck(layerConfig.description, key => $t(key)) }}
        </div>
        <div
            v-if="layerConfig.snippetTags !== false"
            class="snippetTags"
        >
            <div
                v-show="hasUnfixedRules()"
                class="snippetTagsWrapper"
            >
                <div
                    class="snippetTagText"
                >
                    {{ $t("modules.tools.filterGeneral.snippetTags.selectionText") }}
                </div>
                <SnippetTag
                    :is-reset-all="true"
                    :value="snippetTagsResetAllText"
                    @resetAllSnippets="resetAllSnippets"
                    @deleteAllRules="deleteAllRules"
                />
            </div>
            <div
                v-for="(rule, ruleIndex) in rules"
                :key="'rule-' + ruleIndex"
                class="snippetTagsWrapper"
            >
                <SnippetTag
                    v-if="isRule(rule) && rule.fixed === false"
                    :snippet-id="rule.snippetId"
                    :value="getTagTitle(rule)"
                    @resetSnippet="resetSnippet"
                    @deleteRule="deleteRule"
                />
            </div>
        </div>
        <div
            v-if="typeof amountOfFilteredItems === 'number'"
            class="filter-result"
        >
            <span>
                {{ $t("modules.tools.filterGeneral.filterResult.label") }}
            </span>
            <span>
                {{ $t("modules.tools.filterGeneral.filterResult.unit", {amountOfFilteredItems}) }}
            </span>
        </div>
        <div
            v-if="Object.prototype.hasOwnProperty.call(layerConfig, 'searchInMapExtent') && layerConfig.searchInMapExtent"
            class="form-group"
        >
            <SnippetCheckboxFilterInMapExtent
                :info="layerConfig.searchInMapExtentInfo"
                :filter-id="layerConfig.filterId"
                @commandChanged="setSearchInMapExtent"
            />
        </div>
        <div
            v-for="(snippet, indexSnippet) in snippets"
            :key="'snippet-' + indexSnippet + postSnippetKey"
        >
            <div
                v-if="hasThisSnippetTheExpectedType(snippet, 'checkbox')"
                class="snippet"
            >
                <SnippetCheckbox
                    :ref="'snippet-' + snippet.snippetId"
                    :attr-name="snippet.attrName"
                    :disabled="disabled"
                    :info="snippet.info"
                    :title="getTitle(snippet, layerConfig.layerId)"
                    :operator="snippet.operator"
                    :prechecked="snippet.prechecked"
                    :snippet-id="snippet.snippetId"
                    :value="snippet.value"
                    :visible="snippet.visible"
                    @changeRule="changeRule"
                    @deleteRule="deleteRule"
                    @setSnippetPrechecked="setSnippetPrechecked"
                />
            </div>
            <div
                v-else-if="hasThisSnippetTheExpectedType(snippet, 'dropdown')"
                class="snippet"
            >
                <SnippetDropdown
                    :ref="'snippet-' + snippet.snippetId"
                    :api="snippet.api || api"
                    :attr-name="snippet.attrName"
                    :add-select-all="snippet.addSelectAll"
                    :adjustment="snippet.adjustment"
                    :auto-init="snippet.autoInit"
                    :delimitor="snippet.delimitor"
                    :disabled="disabled"
                    :display="snippet.display"
                    :info="snippet.info"
                    :title="getTitle(snippet, layerConfig.layerId)"
                    :layer-id="layerConfig.layerId"
                    :multiselect="snippet.multiselect"
                    :operator="snippet.operator"
                    :placeholder="snippet.placeholder"
                    :prechecked="snippet.prechecked"
                    :render-icons="snippet.renderIcons"
                    :snippet-id="snippet.snippetId"
                    :value="snippet.value"
                    :visible="snippet.visible"
                    :options-limit="snippet.optionsLimit"
                    @changeRule="changeRule"
                    @deleteRule="deleteRule"
                    @setSnippetPrechecked="setSnippetPrechecked"
                />
            </div>
            <div
                v-else-if="hasThisSnippetTheExpectedType(snippet, 'text')"
                class="snippet"
            >
                <SnippetInput
                    :ref="'snippet-' + snippet.snippetId"
                    :attr-name="snippet.attrName"
                    :disabled="disabled"
                    :info="snippet.info"
                    :title="getTitle(snippet, layerConfig.layerId)"
                    :operator="snippet.operator"
                    :placeholder="snippet.placeholder"
                    :prechecked="snippet.prechecked"
                    :snippet-id="snippet.snippetId"
                    :visible="snippet.visible"
                    @changeRule="changeRule"
                    @deleteRule="deleteRule"
                    @setSnippetPrechecked="setSnippetPrechecked"
                />
            </div>
            <div
                v-else-if="hasThisSnippetTheExpectedType(snippet, 'date')"
                class="snippet"
            >
                <SnippetDate
                    :ref="'snippet-' + snippet.snippetId"
                    :api="snippet.api || api"
                    :adjustment="snippet.adjustment"
                    :attr-name="snippet.attrName"
                    :disabled="disabled"
                    :info="snippet.info"
                    :format="snippet.format"
                    :title="getTitle(snippet, layerConfig.layerId)"
                    :max-value="snippet.maxValue"
                    :min-value="snippet.minValue"
                    :operator="snippet.operator"
                    :prechecked="snippet.prechecked"
                    :snippet-id="snippet.snippetId"
                    :visible="snippet.visible"
                    @changeRule="changeRule"
                    @deleteRule="deleteRule"
                    @setSnippetPrechecked="setSnippetPrechecked"
                />
            </div>
            <div
                v-else-if="hasThisSnippetTheExpectedType(snippet, 'dateRange')"
                class="snippet"
            >
                <SnippetDateRange
                    :ref="'snippet-' + snippet.snippetId"
                    :api="snippet.api || api"
                    :adjustment="snippet.adjustment"
                    :attr-name="snippet.attrName"
                    :disabled="disabled"
                    :info="snippet.info"
                    :format="snippet.format"
                    :title="getTitle(snippet, layerConfig.layerId)"
                    :max-value="snippet.maxValue"
                    :min-value="snippet.minValue"
                    :operator="snippet.operator"
                    :prechecked="snippet.prechecked"
                    :snippet-id="snippet.snippetId"
                    :visible="snippet.visible"
                    @changeRule="changeRule"
                    @deleteRule="deleteRule"
                    @setSnippetPrechecked="setSnippetPrechecked"
                />
            </div>
            <div
                v-else-if="hasThisSnippetTheExpectedType(snippet, 'slider')"
                class="snippet"
            >
                <SnippetSlider
                    :ref="'snippet-' + snippet.snippetId"
                    :api="snippet.api || api"
                    :adjustment="snippet.adjustment"
                    :attr-name="snippet.attrName"
                    :decimal-places="snippet.decimalPlaces"
                    :disabled="disabled"
                    :info="snippet.info"
                    :title="getTitle(snippet, layerConfig.layerId)"
                    :min-value="snippet.minValue"
                    :max-value="snippet.maxValue"
                    :operator="snippet.operator"
                    :prechecked="snippet.prechecked"
                    :snippet-id="snippet.snippetId"
                    :visible="snippet.visible"
                    @changeRule="changeRule"
                    @deleteRule="deleteRule"
                    @setSnippetPrechecked="setSnippetPrechecked"
                />
            </div>
            <div
                v-else-if="hasThisSnippetTheExpectedType(snippet, 'sliderRange')"
                class="snippet"
            >
                <SnippetSliderRange
                    :ref="'snippet-' + snippet.snippetId"
                    :api="snippet.api || api"
                    :adjustment="snippet.adjustment"
                    :attr-name="snippet.attrName"
                    :decimal-places="snippet.decimalPlaces"
                    :disabled="disabled"
                    :info="snippet.info"
                    :title="getTitle(snippet, layerConfig.layerId)"
                    :min-value="snippet.minValue"
                    :max-value="snippet.maxValue"
                    :operator="snippet.operator"
                    :prechecked="snippet.prechecked"
                    :snippet-id="snippet.snippetId"
                    :visible="snippet.visible"
                    @changeRule="changeRule"
                    @deleteRule="deleteRule"
                    @setSnippetPrechecked="setSnippetPrechecked"
                />
            </div>
        </div>
        <div class="snippet">
            <button
                v-if="!isStrategyActive()"
                class="btn btn-primary btn-sm"
                @click="filter()"
            >
                {{ labelFilterButton }}
            </button>
            <button
                v-if="paging.page < paging.total && showStop"
                class="btn btn-secondary btn-sm"
                @click="stopFilter()"
            >
                {{ $t("button.stop") }}
            </button>
            <ProgressBar
                :paging="paging"
            />
        </div>
    </div>
</template>

<style lang="scss" scoped>
    @import "~/css/mixins.scss";
    .win-body-vue {
        padding: 0px;
    }
    .panel-body {
        padding: 0 5px;
    }
    .panel-heading {
        padding: 5px;
    }
    .filter-result {
        font-size: 16px;
        color: #E10019;
        margin-top: 10px;
        display: inline-block;
        width: 100%;
        span {
            width: 50%;
            display: inline-block;
            float: left;
            &:last-child {
                text-align: right;
                padding-right: 10px;
            }
        }
    }
    .snippet {
        display: inline-block;
        margin-bottom: 20px;
        position: relative;
        &:last-child {
            margin-bottom: 10px;
        }
        width: 100%;
        b {
            display: block;
        }
    }
    .snippetTags {
        display: flow-root;
        margin: 8px 0;
        max-height: 200px;
        overflow-y: auto;
    }
    .snippetTagText {
        font-size: 12px;
        float: left;
        padding: 6px 4px 0px 0px;
    }
    .form-group {
        clear: both;
    }
    .table-filter-container {
        #tool-general-filter {
            .panel-body {
                max-height: 480px;
                overflow-y: scroll;
                .snippet {
                    max-width: 288px;
                }
            }
        }
    }
</style>
