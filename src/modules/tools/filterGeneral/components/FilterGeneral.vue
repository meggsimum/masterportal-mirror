<script>
import ToolTemplate from "../../ToolTemplate.vue";
import getComponent from "../../../../utils/getComponent";
import {mapActions, mapGetters, mapMutations} from "vuex";
import getters from "../store/gettersFilterGeneral";
import mutations from "../store/mutationsFilterGeneral";
import LayerFilterSnippet from "./LayerFilterSnippet.vue";
import {convertToNewConfig} from "../utils/convertToNewConfig";
import MapHandler from "../utils/mapHandler.js";
import {
    getLayerByLayerId,
    showFeaturesByIds,
    createLayerIfNotExists,
    liveZoom,
    addLayerByLayerId,
    setParserAttributeByLayerId,
    getLayers,
    isUiStyleTable,
    setFilterInTableMenu
} from "../utils/openlayerFunctions.js";
import FilterApi from "../interfaces/filter.api.js";
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
            selectedLayers: [],
            layerLoaded: {},
            filterApiList: [],
            layerFilterSnippetPostKey: ""
        };
    },
    computed: {
        ...mapGetters("Tools/FilterGeneral", Object.keys(getters)),
        console: () => console,
        filtersOnly () {
            return this.layers.filter(layer => {
                return isObject(layer) && !Object.prototype.hasOwnProperty.call(layer, "category");
            });
        },
        categoriesOnly () {
            return this.layers.filter(layer => {
                return isObject(layer) && Object.prototype.hasOwnProperty.call(layer, "category");
            });
        }
    },
    created () {
        this.$on("close", this.close);
    },
    mounted () {
        this.$nextTick(() => {
            this.initialize();
            this.replaceStringWithObjectLayers();
            this.setFilterId();
            this.initializeFilterApiList();

            if (isUiStyleTable()) {
                setFilterInTableMenu(this.$el.querySelector("#tool-general-filter"));
                this.$el.remove();
            }
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
            if (!Array.isArray(this.layers)) {
                return;
            }
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
                if (!Object.prototype.hasOwnProperty.call(layer, "snippets")) {
                    layer.snippets = [];
                }
            });
        },
        /**
         * Initializes a filter api for every layer.
         * @pre filterApiList is empty
         * @post filterApiList is filled with api instances
         * @returns {void}
         */
        initializeFilterApiList () {
            if (!Array.isArray(this.layers)) {
                return;
            }
            this.layers.forEach(layer => {
                if (layer?.category) {
                    layer.layers.forEach(subLayer => {
                        this.filterApiList[subLayer.filterId] = new FilterApi(subLayer.filterId);
                    });
                }
                else {
                    this.filterApiList[layer.filterId] = new FilterApi(layer.filterId);
                }
            });
            this.setLayerFilterSnippetPostKey("rerender");
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
        },
        /**
         * Replaces all configured layerId specified as string with an object.
         * @returns {void}
         */
        replaceStringWithObjectLayers () {
            if (Array.isArray(this.layers)) {
                this.layers.forEach((layer, idx) => {
                    if (typeof layer === "string") {
                        this.layers[idx] = {
                            layerId: layer
                        };
                    }
                });
            }
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
                    v-if="Array.isArray(layers) && layers.length && layerSelectorVisible"
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
                                :api="filterApiList[slotProps.layer.filterId]"
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
                        :key="'layer-' + indexLayer + layerFilterSnippetPostKey"
                        :api="filterApiList[layerConfig.filterId]"
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
