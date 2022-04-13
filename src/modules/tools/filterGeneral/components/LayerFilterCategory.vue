<script>
import {translateKeyWithPlausibilityCheck} from "../../../../utils/translateKeyWithPlausibilityCheck.js";
import LayerItem from "./LayerItem.vue";

export default {
    name: "LayerFilterCategory",
    components: {
        LayerItem
    },
    props: {
        multiLayerSelector: {
            type: Boolean,
            required: true
        },
        layerSelectorVisible: {
            type: Boolean,
            required: true
        },
        layerConfig: {
            type: Object,
            required: true
        },
        deselectAllLayers: {
            type: Function,
            required: true
        },
        selectLayer: {
            type: Function,
            required: true
        }
    },
    data () {
        return {};
    },
    computed: {
        layerTitle () {
            return this.layerConfig.title || this.layerConfig.category || this.layerConfig.layerId || this.layerConfig.filterId;
        },
        layerDescription () {
            const description = this.isSelected() ? this.layerConfig.description : this.layerConfig.shortDescription;

            return translateKeyWithPlausibilityCheck(description, key => this.$t(key));
        }
    },
    methods: {
        translateKeyWithPlausibilityCheck,

        isCategory () {
            return isObject(this.layerConfig) && typeof this.layerConfig.category === "string";
        },

        isSelected () {
            return this.layerConfig.selected;
        },

        toggle () {
            if (this.multiLayerSelector) {
                this.layerConfig.selected = !this.layerConfig.selected;
                return;
            }
            const selected = this.layerConfig.selected;

            this.deselectAllLayers();
            if (!selected) {
                this.selectLayer(this.layerConfig.filterId);
            }
            else {
                this.selectLayer(this.layerConfig.parent?.filterId);
            }
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
            class="panel panel-default"
        >
            <div
                class="panel-heading category-layer"
                role="tab"
            >
                <h2
                    class="panel-title"
                    @click="toggle()"
                    @keydown.enter="toggle()"
                >
                    <a
                        role="button"
                        data-toggle="collapse"
                        data-parent="#accordion"
                        tabindex="0"
                    >
                        {{ layerTitle }} +
                    </a>
                </h2>
                <div
                    class="layerInfoText"
                >
                    {{ layerDescription }}
                </div>
                <div
                    v-if=""
                    class="panel-group"
                    role="tablist"
                    aria-multiselectable="true"
                >
                </div>
            </div>
        </div>
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
