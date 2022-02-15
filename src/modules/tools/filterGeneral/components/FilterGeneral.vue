<script>
import ToolTemplate from "../../ToolTemplate.vue";
import getComponent from "../../../../utils/getComponent";
import {mapActions, mapGetters, mapMutations} from "vuex";
import getters from "../store/gettersFilterGeneral";
import mutations from "../store/mutationsFilterGeneral";
import LayerFilterSnippet from "./LayerFilterSnippet.vue";
import {convertToNewConfig} from "../utils/convertToNewConfig";
import MapHandler from "../utils/mapHandler.js";
import {getLayerByLayerId, showFeaturesByIds, createLayerIfNotExists, liveZoom} from "../utils/openlayerFunctions.js";
import LayerCategory from "../components/LayerCategory.vue";

export default {
    name: "FilterGeneral",
    components: {
        ToolTemplate,
        LayerFilterSnippet,
        LayerCategory
    },
    data () {
        return {
            storePath: this.$store.state.Tools.FilterGeneral,
            mapHandler: new MapHandler({
                getLayerByLayerId,
                showFeaturesByIds,
                createLayerIfNotExists,
                liveZoom
            }),
            selectedLayers: [],
            layerLoaded: {}
        };
    },
    computed: {
        ...mapGetters("Tools/FilterGeneral", Object.keys(getters)),
        console: () => console,
        filtersOnly () {
            return this.layers.filter(layer => {
                return !Object.prototype.hasOwnProperty.call(layer, "category");
            });
        },
        categoriesOnly () {
            return this.layers.filter(layer => {
                return Object.prototype.hasOwnProperty.call(layer, "category");
            });
        }
    },
    created () {
        this.$on("close", this.close);
    },
    mounted () {
        this.setFilterId();
        this.$nextTick(() => {
            this.initialize();
            // console.log("Alte Config", this.configs);
            // console.log("Neue Config", this.convertToNewConfig(this.configs));
        });
    },
    methods: {
        ...mapMutations("Tools/FilterGeneral", Object.keys(mutations)),
        ...mapActions("Tools/FilterGeneral", ["initialize"]),
        convertToNewConfig,

        close () {
            this.setActive(false);
            const model = getComponent(this.storePath.id);

            if (model) {
                model.set("isActive", false);
            }
        },
        /**
         * Set a custom unique id for each filter in config.
         * @returns {void}
         */
        setFilterId () {
            if (Array.isArray(this.layers)) {
                let filterId = 0;

                this.layers.forEach(layer => {
                    if (layer?.category) {
                        layer.layers.forEach(subLayer => {
                            subLayer.filterId = filterId;
                            filterId += 1;
                        });
                    }
                    else {
                        layer.filterId = filterId;
                        filterId += 1;
                    }
                });
            }
        },
        /**
         * Update selectedLayers array.
         * @param {String[]|String} filterIds ids which should be added or removed
         * @returns {Object[]} selected layer fetched from config
         */
        updateSelectedLayers (filterIds) {
            if (!Array.isArray(filterIds) && typeof filterIds !== "number") {
                return;
            }
            const confLayers = this.layers.filter(layer => {
                return Array.isArray(filterIds) ? filterIds.includes(layer.filterId) : layer.filterId === filterIds;
            });

            for (const layer of this.layers) {
                if (layer?.category) {
                    const filteredSubLayer = layer.layers.filter(subLayer => {
                        return Array.isArray(filterIds) ? filterIds.includes(subLayer.filterId) : subLayer.filterId === filterIds;
                    });

                    if (filteredSubLayer.length === 0) {
                        continue;
                    }
                    confLayers.push({
                        category: layer.category,
                        layers: filteredSubLayer
                    });
                }
            }
            this.selectedLayers = confLayers;
        },
        /**
         * Check if layer filter should be displayed.
         * @param {String} filterId filterId to check
         * @returns {Boolean} true if should be displayed false if not
         */
        showLayerSnippet (filterId) {
            if (!Array.isArray(this.selectedLayers)) {
                return false;
            }
            if (!this.layerSelectorVisible) {
                return true;
            }
            return this.selectedLayers.filter(selectedLayer => {
                if (selectedLayer.category) {
                    return selectedLayer.layers.filter(subLayer => {
                        return subLayer.filterId === filterId;
                    }).length > 0;
                }
                return selectedLayer.filterId === filterId;
            }).length > 0;
        },
        /**
         * Setting the layer loaded true if the layer is clicked from the filter Id
         * @param {String} filterId filterId to check
         * @returns {void}
         */
        setLayerLoaded (filterId) {
            this.layerLoaded[filterId] = true;
        }
    }
};
</script>

<template lang="html">
    <ToolTemplate
        :title="$t(name)"
        :icon="glyphicon"
        :active="active"
        :render-to-window="renderToWindow"
        :resizable-window="resizableWindow"
        :deactivate-gfi="deactivateGFI"
        :initial-width="300"
    >
        <template #toolBody>
            <div
                v-if="active"
                id="tool-general-filter"
            />
            <LayerCategory
                v-if="Array.isArray(layers) && layers.length && layerSelectorVisible"
                class="layerSelector"
                :filters-only="filtersOnly"
                :categories-only="categoriesOnly"
                :multi-layer-selector="multiLayerSelector"
                @updateselectedlayers="updateSelectedLayers"
                @setLayerLoaded="setLayerLoaded"
            >
                <template
                    #default="slotProps"
                >
                    <div
                        :class="['panel-collapse', 'collapse', showLayerSnippet(slotProps.layer.filterId) ? 'in' : '']"
                        role="tabpanel"
                    >
                        <LayerFilterSnippet
                            v-if="showLayerSnippet(slotProps.layer.filterId) || layerLoaded[slotProps.layer.filterId]"
                            :layer-config="slotProps.layer"
                            :map-handler="mapHandler"
                            :min-scale="minScale"
                            :live-zoom-to-features="liveZoomToFeatures"
                        />
                    </div>
                </template>
            </LayerCategory>
            <div v-else-if="Array.isArray(layers) && layers.length">
                <LayerFilterSnippet
                    v-for="(layerConfig, indexLayer) in filtersOnly"
                    :key="'layer-' + indexLayer"
                    :layer-config="layerConfig"
                    :map-handler="mapHandler"
                    :min-scale="minScale"
                    :live-zoom-to-features="liveZoomToFeatures"
                />
            </div>
        </template>
    </ToolTemplate>
</template>

<style lang="scss" scoped>
    @import "~/css/mixins.scss";
</style>
