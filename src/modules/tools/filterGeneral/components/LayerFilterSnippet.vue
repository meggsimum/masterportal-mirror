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
        layerConfig: {
            type: Object,
            required: true
        },
        mapHandler: {
            type: Object,
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
            layerModel: null,
            layerService: null,
            api: null,
            searchInMapExtent: false,
            filteredFeatureIds: [],
            enableZoom: true,
            isFeatureLoaded: false
        };
    },
    computed: {
        snippetTagsResetAllText () {
            return this.$t("common:modules.tools.filterGeneral.snippetTags.resetAll");
        }
    },
    watch: {
        paging (val) {
            if (val.page >= val.total) {
                this.setFormDisable(false);

                if (this.liveZoomToFeatures && this.enableZoom) {
                    this.mapHandler.zoomToFilteredFeature(this.minScale, this.filteredFeatureIds, this.layerConfig?.layerId, error => {
                        console.warn("map error", error);
                    });
                    this.setZoom(false);
                }
            }
        }
    },
    created () {
        if (!this.isExternalService(this.layerConfig?.service)) {
            const layerId = this.layerConfig?.layerId || this.layerConfig?.service?.layerId;

            if (typeof layerId !== "string" || !layerId) {
                console.warn("Please check your filter configuration: You need to give either a layerId or a service object (or both) for a layer to filter.");
                return;
            }

            this.layerModel = this.getActivatedLayerByLayerId(layerId);
            if (!this.layerModel) {
                console.warn("Please check your filter configuration: The given layerId does not exists in your config.json. Configure an extra service object for your filter configuration or add the layer to your config.json.");
                return;
            }

            if (!this.layerConfig?.service) {
                this.layerService = this.getServiceByLayerModel(layerId, this.layerModel);
            }
            else {
                this.layerService = this.layerConfig.service;
                if (!this.layerService?.layerId) {
                    this.layerService.layerId = layerId;
                }
            }
        }
        else {
            this.layerService = this.layerConfig?.service;
        }

        this.setupSnippetIds();
        this.api = new FilterApi(this.layerConfig.filterId, this.layerService);
    },
    methods: {
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
         * Changes the internal value for searchInMapExtent.
         * @param {Boolean} value the value to change to
         * @returns {void}
         */
        searchInMapExtentChanged (value) {
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
            let resetCount = this.layerConfig.snippets.length;

            this.layerConfig.snippets.forEach(snippet => {
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
                || typeof something?.attrName !== "string"
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
         * Triggered when a rule changed at a snippet.
         * @param {Object} rule the rule to set - has to be valid against LayerFilterSnippet.isRule
         * @returns {void}
         */
        changeRule (rule) {
            if (this.isRule(rule)) {
                this.$set(this.rules, rule.snippetId, rule);
            }
        },
        /**
         * Removes a rule by its snippetId.
         * @param {Number} snippetId the snippetId of the rule to delete
         * @returns {void}
         */
        deleteRule (snippetId) {
            this.$set(this.rules, snippetId, false);
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
         * Filters the layer with the current snippet rules.
         * @returns {void}
         */
        filter () {
            const filterQuestion = {
                filterId: this.layerConfig.filterId,
                service: this.layerService,
                snippetId: false,
                commands: {
                    paging: this.layerConfig?.paging ? this.layerConfig.paging : 1000,
                    searchInMapExtent: this.searchInMapExtent
                },
                rules: this.getCleanArrayOfRules()
            };

            this.filteredFeatureIds = [];
            this.setZoom(true);
            this.setFormDisable(true);
            this.showStopButton(true);

            if (isObject(this.layerModel)) {
                this.layerModel.set("isSelected", true);
                this.layerModel.set("isVisible", true);

                if (this.layerModel.layer.getSource().getFeatures().length) {
                    this.runApiFilter(filterQuestion);
                }
                else {
                    this.layerModel.layer.getSource().on("featuresloadend", () => {
                        if (this.isFeatureLoaded) {
                            this.mapHandler.showFeaturesByIds(this.layerModel.layer, this.filteredFeatureIds);
                            return;
                        }
                        this.runApiFilter(filterQuestion);
                        this.setFeatureLoaded(true);
                    });
                }
            }
        },
        /**
         * Set if feature is loaded or not
         * @param {Boolean} value true/false to set feature loaded
         * @returns {void}
         */
        setFeatureLoaded (value) {
            this.isFeatureLoaded = value;
        },
        /**
         * Enable or disable the function zoom to feature
         * @param {Boolean} value true/false to en/disable zoom to feature
         * @returns {void}
         */
        setZoom (value) {
            this.enableZoom = value;
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
         * Activating the layer for filtering
         * @param {String} layerId the layer Id from config
         * @returns {Object} the activated layer model
         */
        getActivatedLayerByLayerId (layerId) {
            const layers = Radio.request("Map", "getLayers"),
                visibleLayer = typeof layers?.getArray !== "function" ? [] : layers.getArray().filter(layer => {
                    return layer.getVisible() === true && layer.get("id") === layerId;
                });

            if (Array.isArray(visibleLayer) && !visibleLayer.length) {
                Radio.trigger("ModelList", "addModelsByAttributes", {"id": layerId});
            }
            return Radio.request("ModelList", "getModelByAttributes", {"id": layerId});
        },
        /**
         * Returns the service using the given layer model.
         * @param {Number} layerId the id of the layer
         * @param {Object} layerModel the layer model
         * @returns {Object} the service object
         */
        getServiceByLayerModel (layerId, layerModel) {
            return {
                type: "OL",
                layerId,
                url: layerModel.get("url"),
                typename: layerModel.get("featureType"),
                namespace: layerModel.get("featureNS")
            };
        },
        /**
         * Returns true if the given service object wants to use an external interface.
         * @param {Object} service the service to check
         * @returns {Boolean} true if this service links to an external interface, false if not.
         */
        isExternalService (service) {
            return isObject(service) && String(service.type).toLowerCase() !== "ol";
        },
        /**
         * For initialization only: Runs through the snippets and creates layer-unique snippetIds.
         * @pre the snippet objects in layerConfig have no snippetIds
         * @post the snippet objects in layerConfig are having snippetIds
         * @returns {void}
         */
        setupSnippetIds () {
            const snippets = this.layerConfig?.snippets;

            if (Array.isArray(snippets)) {
                snippets.forEach((snippet, snippetId) => {
                    if (typeof snippet === "string") {
                        snippets[snippetId] = {
                            snippetId,
                            attrName: snippet
                        };
                    }
                    else if (typeof snippet === "object" && snippet !== null) {
                        snippet.snippetId = snippetId;
                    }
                });
            }
        },
        /**
         * Running the api function to filter the layer
         * @param {Object} filterQuestion the filter parameters for api
         * @returns {void}
         */
        runApiFilter (filterQuestion) {
            this.api.filter(filterQuestion, filterAnswer => {
                this.paging = filterAnswer.paging;

                if (isObject(this.mapHandler) && typeof this.mapHandler.visualize === "function") {
                    this.mapHandler.visualize(filterAnswer, error => {
                        console.warn("map error", error);
                    });
                }

                if (Array.isArray(filterAnswer?.items) && filterAnswer.items.length) {
                    filterAnswer.items.forEach(item => {
                        if (!this.filteredFeatureIds.includes(item.getId())) {
                            this.filteredFeatureIds.push(item.getId());
                        }
                    });
                }
            }, error => {
                console.warn("filter error", error);
            });
        },
        /**
         * Terminating the filter process by terminating every snippet
         * @returns {void}
         */
        stopfilter () {
            this.api.stop(() => {
                this.showStopButton(false);
                this.setFormDisable(false);
            },
            err => {
                console.warn(err);
            });
        }
    }
};
</script>

<template>
    <div
        class="panel-body"
    >
        <div
            v-if="layerConfig.snippetTags !== false"
            class="snippetTags"
        >
            <div v-show="hasUnfixedRules()">
                <SnippetTag
                    :is-reset-all="true"
                    label=""
                    :value="snippetTagsResetAllText"
                    @resetAllSnippets="resetAllSnippets"
                    @deleteAllRules="deleteAllRules"
                />
            </div>
            <div
                v-for="(rule, ruleIndex) in rules"
                :key="'rule-' + ruleIndex"
            >
                <SnippetTag
                    v-if="isRule(rule) && rule.fixed === false"
                    :snippet-id="rule.snippetId"
                    :label="rule.attrName"
                    :value="String(rule.value)"
                    @resetSnippet="resetSnippet"
                    @deleteRule="deleteRule"
                />
            </div>
        </div>
        <div
            v-if="Object.prototype.hasOwnProperty.call(layerConfig, 'searchInMapExtent') && layerConfig.searchInMapExtent"
            class="snippet"
        >
            <SnippetCheckboxFilterInMapExtent
                :filter-id="layerConfig.filterId"
                @commandChanged="searchInMapExtentChanged"
            />
        </div>
        <div
            v-if="Object.prototype.hasOwnProperty.call(layerConfig, 'snippets') && Array.isArray(layerConfig.snippets)"
        >
            <div
                v-for="(snippet, indexSnippet) in layerConfig.snippets"
                :key="'snippet-' + indexSnippet"
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
                        :label="snippet.label"
                        :operator="snippet.operator"
                        :prechecked="snippet.prechecked"
                        :snippet-id="snippet.snippetId"
                        :visible="snippet.visible"
                        @changeRule="changeRule"
                        @deleteRule="deleteRule"
                    />
                </div>
                <div
                    v-else-if="hasThisSnippetTheExpectedType(snippet, 'dropdown')"
                    class="snippet"
                >
                    <SnippetDropdown
                        :ref="'snippet-' + snippet.snippetId"
                        :api="api"
                        :attr-name="snippet.attrName"
                        :add-select-all="snippet.addSelectAll"
                        :auto-init="snippet.autoInit"
                        :disabled="disabled"
                        :display="snippet.display"
                        :info="snippet.info"
                        :label="snippet.label"
                        :layer-id="layerConfig.layerId"
                        :multiselect="snippet.multiselect"
                        :operator="snippet.operator"
                        :placeholder="snippet.placeholder"
                        :prechecked="snippet.prechecked"
                        :render-icons="snippet.renderIcons"
                        :snippet-id="snippet.snippetId"
                        :value="snippet.value"
                        :visible="snippet.visible"
                        @changeRule="changeRule"
                        @deleteRule="deleteRule"
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
                        :label="snippet.label"
                        :operator="snippet.operator"
                        :placeholder="snippet.placeholder"
                        :prechecked="snippet.prechecked"
                        :snippet-id="snippet.snippetId"
                        :visible="snippet.visible"
                        @changeRule="changeRule"
                        @deleteRule="deleteRule"
                    />
                </div>
                <div
                    v-else-if="hasThisSnippetTheExpectedType(snippet, 'date')"
                    class="snippet"
                >
                    <SnippetDate
                        :ref="'snippet-' + snippet.snippetId"
                        :api="api"
                        :attr-name="snippet.attrName"
                        :disabled="disabled"
                        :info="snippet.info"
                        :format="snippet.format"
                        :label="snippet.label"
                        :max-value="snippet.maxValue"
                        :min-value="snippet.minValue"
                        :operator="snippet.operator"
                        :prechecked="snippet.prechecked"
                        :snippet-id="snippet.snippetId"
                        :visible="snippet.visible"
                        @changeRule="changeRule"
                        @deleteRule="deleteRule"
                    />
                </div>
                <div
                    v-else-if="hasThisSnippetTheExpectedType(snippet, 'dateRange')"
                    class="snippet"
                >
                    <SnippetDateRange
                        :ref="'snippet-' + snippet.snippetId"
                        :api="api"
                        :attr-name="snippet.attrName"
                        :disabled="disabled"
                        :info="snippet.info"
                        :format="snippet.format"
                        :label="snippet.label"
                        :max-value="snippet.maxValue"
                        :min-value="snippet.minValue"
                        :operator="snippet.operator"
                        :prechecked="snippet.prechecked"
                        :snippet-id="snippet.snippetId"
                        :visible="snippet.visible"
                        @changeRule="changeRule"
                        @deleteRule="deleteRule"
                    />
                </div>
                <div
                    v-else-if="hasThisSnippetTheExpectedType(snippet, 'slider')"
                    class="snippet"
                >
                    <SnippetSlider
                        :ref="'snippet-' + snippet.snippetId"
                        :api="api"
                        :attr-name="snippet.attrName"
                        :decimal-places="snippet.decimalPlaces"
                        :disabled="disabled"
                        :info="snippet.info"
                        :label="snippet.label"
                        :min-value="snippet.minValue"
                        :max-value="snippet.maxValue"
                        :operater="snippet.operator"
                        :prechecked="snippet.prechecked"
                        :snippet-id="snippet.snippetId"
                        :visible="snippet.visible"
                        @changeRule="changeRule"
                        @deleteRule="deleteRule"
                    />
                </div>
                <div
                    v-else-if="hasThisSnippetTheExpectedType(snippet, 'sliderRange')"
                    class="snippet"
                >
                    <SnippetSliderRange
                        :ref="'snippet-' + snippet.snippetId"
                        :api="api"
                        :attr-name="snippet.attrName"
                        :decimal-places="snippet.decimalPlaces"
                        :disabled="disabled"
                        :info="snippet.info"
                        :label="snippet.label"
                        :min-value="snippet.minValue"
                        :max-value="snippet.maxValue"
                        :operater="snippet.operator"
                        :prechecked="snippet.prechecked"
                        :snippet-id="snippet.snippetId"
                        :visible="snippet.visible"
                        @changeRule="changeRule"
                        @deleteRule="deleteRule"
                    />
                </div>
            </div>
            <div class="snippet">
                <button
                    @click="filter()"
                >
                    Filtern
                </button>
                <button
                    v-if="paging.page < paging.total && showStop"
                    @click="stopfilter()"
                >
                    {{ $t("button.stop") }}
                </button>
                <ProgressBar
                    :paging="paging"
                />
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
    @import "~/css/mixins.scss";
    .panel-body {
        padding: 0 15px;
    }
    .snippet {
        display: inline-block;
        margin-bottom: 15px;
        width: 100%;
        b {
            display: block;
        }
    }
    .snippetTags {
        display: block;
        margin-bottom: 25px;
    }
</style>
