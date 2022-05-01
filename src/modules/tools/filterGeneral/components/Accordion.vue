<script>
import {translateKeyWithPlausibilityCheck} from "../../../../utils/translateKeyWithPlausibilityCheck";

export default {
    name: "Accordion",
    props: {
        filtersOnly: {
            type: Array,
            required: true,
            default: () => []
        },
        categoriesOnly: {
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
}
</script>

<template>
    <div class="accordion" id="FilterCategoryAccordion">
        <div
            v-for="filter in categoriesOnly"
            :key="filter.category"
            class="accordion-item"
        >
            <h2
                :id="filter.id"
                class="accordion-header"
                @click="updateSelectedCategories(filter.category)"
                @keydown.enter="updateSelectedCategories(filter.category)"
            >
                <button class="accordion-button" type="button" data-bs-toggle="collapse" :data-bs-target="'#' + filter.category" aria-expanded="true" :aria-controls="filter.category">
                    {{ filter.category }} +
                </button>
            </h2>
            <div
                v-if="filter.shortDescription || filter.description"
                class="layerInfoText"
            >
                {{ translateDescription(filter) }}
            </div>
            <div :id="filter.category" class="accordion-collapse collapse" :aria-labelledby="filter.id" data-bs-parent="#FilterCategoryAccordion">
                <div class="accordion-body">
                    <div
                        v-for="subFilter in filter.layers"
                        :key="subFilter.filterId"
                        class="accordion-item"
                    >
                        <h2
                            :id="subFilter.filterId"
                            class="accordion-header"
                            @click="updateSelectedLayers(subFilter.filterId)"
                            @keydown.enter="updateSelectedLayers(subFilter.filterId)"
                        >
                            <button class="accordion-button" type="button" data-bs-toggle="collapse" :data-bs-target="'#collapse' + subFilter.filterId" aria-expanded="true" :aria-controls="'collapse' + subFilter.filterId">
                                {{ subFilter.title ? subFilter.title : subFilter.layerId }}
                            </button>
                        </h2>
                        <div :id="'collapse' + subFilter.filterId" class="accordion-collapse collapse" :aria-labelledby="subFilter.filterId" data-bs-parent="#accordionExample">
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
                :id="filter.filterId"
                class="accordion-header"
                @click="updateSelectedLayers(filter.filterId)"
                @keydown.enter="updateSelectedLayers(filter.filterId)"
            >
                <button class="accordion-button" type="button" data-bs-toggle="collapse" :data-bs-target="'#collapse-' + filter.filterId" aria-expanded="true" :aria-controls="'collapse-' + filter.filterId">
                    {{ filter.title ? filter.title : filter.layerId }}
                </button>
            </h2>
            <div :id="'collapse-' + filter.filterId" class="accordion-collapse collapse show" :aria-labelledby="filter.filterId" data-bs-parent="#FilterCategoryAccordion">
                <div class="accordion-body">
                    <slot
                        :layer="filter"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.accordion-header {
    margin: 0;
}
</style>
