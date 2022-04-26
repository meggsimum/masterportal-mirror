<script>
import ToolTemplate from "../../ToolTemplate.vue";
import getComponent from "../../../../utils/getComponent";
import {mapActions, mapGetters, mapMutations} from "vuex";
import getters from "../store/gettersFilterGeneral";
import mutations from "../store/mutationsFilterGeneral";
import LayerFilterSnippet from "./LayerFilterSnippet.vue";
import MapHandler from "../utils/mapHandler.js";
import {compileLayers} from "../utils/compileLayers.js";
import {
    getLayerByLayerId,
    showFeaturesByIds,
    createLayerIfNotExists,
    liveZoom,
    addLayerByLayerId,
    setParserAttributeByLayerId,
    getLayers,
    isUiStyleTable,
    setFilterInTableMenu,
    getSnippetInfos
} from "../utils/openlayerFunctions.js";
import LayerCategory from "../components/LayerCategory.vue";
import isObject from "../../../../utils/isObject.js";

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
                liveZoom,
                addLayerByLayerId,
                setParserAttributeByLayerId,
                getLayers
            }),
            layerConfigs: [],
            selectedLayers: [],
            layerLoaded: {},
            layerFilterSnippetPostKey: ""
        };
    },
    computed: {
        ...mapGetters("Tools/FilterGeneral", Object.keys(getters)),
        console: () => console,
        filtersOnly () {
            return this.layerConfigs.filter(layer => {
                return isObject(layer) && !Object.prototype.hasOwnProperty.call(layer, "category");
            });
        },
        categoriesOnly () {
            return this.layerConfigs.filter(layer => {
                return isObject(layer) && Object.prototype.hasOwnProperty.call(layer, "category");
            });
        }
    },
    created () {
        this.$on("close", this.close);
    },
    mounted () {
        this.initialize();
        this.convertConfig({
            snippetInfos: getSnippetInfos()
        });

        this.layerConfigs = compileLayers(this.layers);

        this.$nextTick(() => {
            if (isUiStyleTable()) {
                setFilterInTableMenu(this.$el.querySelector("#tool-general-filter"));
                this.$el.remove();
            }
        });
    },
    methods: {
        ...mapMutations("Tools/FilterGeneral", Object.keys(mutations)),
        ...mapActions("Tools/FilterGeneral", ["initialize", "convertConfig"]),

        close () {
            this.setActive(false);
            const model = getComponent(this.storePath.id);

            if (model) {
                model.set("isActive", false);
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
            const confLayers = this.layerConfigs.filter(layer => {
                return Array.isArray(filterIds) ? filterIds.includes(layer.filterId) : layer.filterId === filterIds;
            });

            for (const layer of this.layerConfigs) {
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
        },
        /**
         * Setting the post key for layerFilterSnippet
         * @param {String} value the post key of layerFilterSnippet
         * @returns {void}
         */
        setLayerFilterSnippetPostKey (value) {
            this.layerFilterSnippetPostKey = value;
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
        :initial-width="450"
    >
        <template #toolBody>
            <div
                v-if="active"
                id="tool-general-filter"
            >
                <LayerCategory
                    v-if="Array.isArray(layerConfigs) && layerConfigs.length && layerSelectorVisible"
                    class="layerSelector"
                    :filters-only="filtersOnly"
                    :categories-only="categoriesOnly"
                    :changed-selected-layers="selectedLayers"
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
                                :api="slotProps.layer.api"
                                :layer-config="slotProps.layer"
                                :map-handler="mapHandler"
                                :min-scale="minScale"
                                :live-zoom-to-features="liveZoomToFeatures"
                            />
                        </div>
                    </template>
                </LayerCategory>
                <div v-else-if="Array.isArray(layerConfigs) && layerConfigs.length">
                    <LayerFilterSnippet
                        v-for="(layerConfig, indexLayer) in filtersOnly"
                        :key="'layer-' + indexLayer + layerFilterSnippetPostKey"
                        :api="layerConfig.api"
                        :layer-config="layerConfig"
                        :map-handler="mapHandler"
                        :min-scale="minScale"
                        :live-zoom-to-features="liveZoomToFeatures"
                    />
                </div>
            </div>
        </template>
    </ToolTemplate>
</template>

<style lang="scss" scoped>
    @import "~/css/mixins.scss";
</style>
