<script>
import {translateKeyWithPlausibilityCheck} from "../../../../utils/translateKeyWithPlausibilityCheck.js";
import LayerItem from "./LayerItem.vue";
import Accordion from "./Accordion.vue";
import AccordionItem from "./AccordionItem.vue";

export default {
    name: "LayerCategory",
    components: {
        LayerItem,
        Accordion,
        AccordionItem
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
    <div>
        <!--<div class="accordion" id="FilterCategoryAccordion">
            <div
                v-for="filter in filtersOnly"
                :key="filter.filterId"
                @click="setLayerLoaded(filter.filterId)"
                @keydown.enter="setLayerLoaded(filter.filterId)"
            >
                <AccordionItem
                    :layer="filter"
                    :multi-layer-selector="multiLayerSelector"
                    :disabled="disabled(filter.filterId)"
                    :changed-selected-layers="changedSelectedLayers"
                    @updatetoselectedlayers="updateSelectedLayers"
                    >
                    <slot
                        :layer="filter"
                    />
                </AccordionItem>
            </div>
        </div>-->
        <!--<Accordion
            :categoriesOnly="categoriesOnly"
            :filtersOnly="filtersOnly"
        >
        </Accordion>-->
        <div class="accordion" id="FilterCategoryAccordion">
            <div
                v-for="filter in categoriesOnly"
                :key="filter.category"
                class="accordion-item"
            >
                <h2
                    :id="'cat-header-' + filter.category"
                    class="accordion-header"
                    @click="updateSelectedCategories(filter.category)"
                    @keydown.enter="updateSelectedCategories(filter.category)"
                >
                    <button
                        class="accordion-button"
                        type="button"
                        data-bs-toggle="collapse"
                        :data-bs-target="'#' + filter.category"
                        aria-expanded="true"
                        :aria-controls="filter.category">
                        {{ filter.category }}
                    </button>
                </h2>
                <div
                    v-if="filter.shortDescription || filter.description"
                    class="layerInfoText"
                >
                    {{ translateDescription(filter) }}
                </div>
                <div :id="filter.category"
                     class="accordion-collapse collapse"
                     :aria-labelledby="'cat-header-' + filter.category"
                     :data-bs-parent="!multiLayerSelector ? '#FilterCategoryAccordion' : ''"
                >
                    <div class="accordion-body">
                        <div
                            v-for="subFilter in filter.layers"
                            :key="subFilter.filterId"
                            class="accordion-item"
                            @click="setLayerLoaded(subFilter.filterId)"
                            @keydown.enter="setLayerLoaded(subFilter.filterId)"
                        >
                            <h2
                                :id="'sub-filter-header-' + subFilter.filterId"
                                class="accordion-header"
                                @click="updateSelectedLayers(subFilter.filterId)"
                                @keydown.enter="updateSelectedLayers(subFilter.filterId)"
                            >
                                <button
                                    class="accordion-button"
                                    :disabled="disabled(filter.filterId)"
                                    type="button"
                                    data-bs-toggle="collapse"
                                    :data-bs-target="'#subFilterCollapse-' + subFilter.filterId"
                                    aria-expanded="true"
                                    :aria-controls="'subFilterCollapse-' + subFilter.filterId"
                                >
                                    {{ subFilter.title ? subFilter.title : subFilter.layerId }}
                                </button>
                            </h2>
                            <div
                                :id="'subFilterCollapse-' + subFilter.filterId"
                                class="accordion-collapse collapse"
                                :aria-labelledby="'subFilterCollapse-' + subFilter.filterId"
                            >
                                <div class="accordion-body">
                                    <slot
                                        :layer="subFilter"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div
                v-for="filter in filtersOnly"
                :key="filter.filterId"
                class="accordion-item"
                @click="setLayerLoaded(filter.filterId)"
                @keydown.enter="setLayerLoaded(filter.filterId)"
            >
                <h2
                    :id="'filter-header-' + filter.filterId"
                    class="accordion-header"
                    @click="updateSelectedLayers(filter.filterId)"
                    @keydown.enter="updateSelectedLayers(filter.filterId)"
                >
                    <button
                        :disabled="disabled(filter.filterId)"
                        class="accordion-button"
                        type="button"
                        data-bs-toggle="collapse"
                        :data-bs-target="'#collapse-' + filter.filterId"
                        aria-expanded="true"
                        :aria-controls="'collapse-' + filter.filterId"
                    >
                        {{ filter.title ? filter.title : filter.layerId }}
                    </button>
                </h2>
                <div
                    v-if="filter.shortDescription && !selected"
                    class="layerInfoText"
                >
                    {{ translateKeyWithPlausibilityCheck(layer.shortDescription, key => $t(key)) }}
                </div>
                <div :id="'collapse-' + filter.filterId"
                     class="accordion-collapse collapse"
                     :aria-labelledby="'filter-header-' + filter.filterId"
                     :data-bs-parent="!multiLayerSelector ? '#FilterCategoryAccordion' : ''"
                >
                    <div class="accordion-body">
                        <slot
                            :layer="filter"
                        />
                    </div>
                </div>
            </div>
        </div>
    <!--<div
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
                        data-bs-toggle="collapse"
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
                        :class="['panel', 'accordion-collapse', 'collapse', selectedCategory.includes(filter.category) ? 'show': '']"
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
    </div>-->
    </div>
</template>

<style lang="scss" scoped>
    .accordion-header {
        margin: 0;
    }
</style>
