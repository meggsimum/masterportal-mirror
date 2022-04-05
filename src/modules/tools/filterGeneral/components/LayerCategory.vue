<script>
import {translateKeyWithPlausibilityCheck} from "../../../../utils/translateKeyWithPlausibilityCheck.js";
import LayerItem from "./LayerItem.vue";

export default {
    name: "LayerCategory",
    components: {
        LayerItem
    },
    props: {
        multiLayerSelector: {
            type: Boolean,
            required: false,
            default: true
        },
        filtersOnly: {
            type: Array,
            required: true,
            default: () => []
        },
        categoriesOnly: {
            type: Array,
            required: false,
            default: () => []
        },
        changedSelectedLayers: {
            type: Array,
            required: false,
            default: () => []
        }
    },
    data () {
        return {
            selectedLayers: [],
            selectedCategory: []
        };
    },
    watch: {
        selectedLayers () {
            this.$emit("updateselectedlayers", this.selectedLayers);
        }
    },
    methods: {
        translateKeyWithPlausibilityCheck,
        /**
         * Updates selectedLayers array.
         * @param {Number} filterId id which should be removed or added to selectedLayers array
         * @returns {void}
         */
        updateSelectedLayers (filterId) {
            if (typeof filterId !== "number") {
                return;
            }

            if (!this.multiLayerSelector) {
                this.selectedLayers = this.selectedLayers.includes(filterId) ? [] : [filterId];
                return;
            }

            const index = this.selectedLayers.indexOf(filterId);

            if (index >= 0) {
                this.selectedLayers.splice(index, 1);
            }
            else {
                this.selectedLayers.push(filterId);
            }
        },
        /**
         * Updates the selectedCategory array.
         * @param {String} category the name of the category
         * @returns {void}
         */
        updateSelectedCategories (category) {
            if (typeof category !== "string") {
                return;
            }

            const index = this.selectedCategory.indexOf(category);

            if (index >= 0) {
                this.selectedCategory.splice(index, 1);
            }
            else {
                this.selectedCategory.push(category);
            }
        },
        /**
         * Check if Selector should be disabled.
         * @param {Number} filterId id to check if should be disabled
         * @returns {void}
         */
        disabled (filterId) {
            return !this.multiLayerSelector && this.selectedLayers.length > 0 && !this.selectedLayers.includes(filterId);
        },
        /**
         * Emitting the function by transfering the filter Id of layer
         * @param {Number} filterId id to check if should be disabled
         * @returns {void}
         */
        setLayerLoaded (filterId) {
            this.$emit("setLayerLoaded", filterId);
        },
        /**
         * Translate given description.
         * @param {Object} filter the obj to fetch the description
         * @returns {String} the translatet string or empty string if given param is not a string
         */
        translateDescription (filter) {
            const description = this.selectedCategory.includes(filter.category) && filter.description ? filter.description : filter.shortDescription;

            return translateKeyWithPlausibilityCheck(description, key => this.$t(key));
        }
    }
};
</script>

<template>
    <div
        class="panel-group"
        role="tablist"
        aria-multiselectable="true"
    >
        <div
            v-for="filter in categoriesOnly"
            :key="filter.category"
            class="panel panel-default"
        >
            <div
                :class="['panel-heading', selectedCategory.includes(filter.category) ? 'category-layer': '']"
                role="tab"
            >
                <h2
                    class="panel-title"
                    @click="updateSelectedCategories(filter.category)"
                    @keydown.enter="updateSelectedCategories(filter.category)"
                >
                    <a
                        role="button"
                        data-toggle="collapse"
                        data-parent="#accordion"
                        tabindex="0"
                    >
                        {{ filter.category }} +
                    </a>
                </h2>
                <div
                    v-if="filter.shortDescription || filter.description"
                    class="layerInfoText"
                >
                    {{ translateDescription(filter) }}
                </div>
                <div
                    v-if="selectedCategory.includes(filter.category)"
                    class="panel-group"
                    role="tablist"
                    aria-multiselectable="true"
                >
                    <div
                        v-for="subFilter in filter.layers"
                        :key="subFilter.filterId"
                        :class="['panel', 'panel-collapse', 'collapse', selectedCategory.includes(filter.category) ? 'in': '']"
                        role="tabpanel"
                    >
                        <div
                            class="panel panel-default"
                            @click="setLayerLoaded(subFilter.filterId)"
                            @keydown.enter="setLayerLoaded(subFilter.filterId)"
                        >
                            <LayerItem
                                :layer="subFilter"
                                :multi-layer-selector="multiLayerSelector"
                                :disabled="disabled(subFilter.filterId)"
                                @updatetoselectedlayers="updateSelectedLayers"
                            >
                                <slot
                                    :layer="subFilter"
                                />
                            </LayerItem>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div
            v-for="filter in filtersOnly"
            :key="filter.filterId"
            class="panel panel-default"
            @click="setLayerLoaded(filter.filterId)"
            @keydown.enter="setLayerLoaded(filter.filterId)"
        >
            <LayerItem
                :layer="filter"
                :multi-layer-selector="multiLayerSelector"
                :disabled="disabled(filter.filterId)"
                :changed-selected-layers="changedSelectedLayers"
                @updatetoselectedlayers="updateSelectedLayers"
            >
                <slot
                    :layer="filter"
                />
            </LayerItem>
        </div>
    </div>
</template>

<style>
    #tool-general-filter .panel-heading .panel-title a[tabindex="0"]:focus {
        padding: 5px;
    }
</style>

<style lang="scss" scoped>
    .panel-group .panel + .panel {
        margin-top: 10px;
    }
    .panel-default > .panel-heading {
        cursor: default;
        background-color: white;
    }
    .panel-title {
        cursor: pointer;
    }
    .category-layer .panel-title{
        margin-bottom: 1rem;
    }
    .category-layer > .right{
        right: 30px;
    }
</style>
