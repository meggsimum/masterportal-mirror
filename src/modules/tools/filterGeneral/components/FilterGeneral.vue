<script>
import ToolTemplate from "../../ToolTemplate.vue";
import LayerFilterCategory from "../components/LayerFilterCategory.vue";
import getComponent from "../../../../utils/getComponent";
import {mapActions, mapGetters, mapMutations} from "vuex";
import getters from "../store/gettersFilterGeneral";
import mutations from "../store/mutationsFilterGeneral";
import {compileLayers, createLayerConfigsAssoc} from "../utils/compileLayers.js";
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

export default {
    name: "FilterGeneral",
    components: {
        ToolTemplate,
        LayerFilterCategory
    },
    data () {
        return {
            storePath: this.$store.state.Tools.FilterGeneral,
            layerConfigs: [],
            layerConfigsAssoc: {}
        };
    },
    computed: {
        ...mapGetters("Tools/FilterGeneral", Object.keys(getters)),
        console: () => console
    },
    created () {
        this.$on("close", this.close);
    },
    mounted () {
        this.initialize();
        this.convertConfig();

        if (Array.isArray(this.layers) && this.layers.length) {
            this.layerConfigs = compileLayers(this.layers);
            this.layerConfigsAssoc = createLayerConfigsAssoc(this.layerConfigs);
        }
        else {
            this.collectLayersFromTree(layers => {
                this.setLayers(layers);
                this.layerConfigs = compileLayers(this.layers);
                this.layerConfigsAssoc = createLayerConfigsAssoc(this.layerConfigs);
            }, error => {
                console.warn(error);
            });
        }

        this.$nextTick(() => {
            this.handleUiStyle();
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
         * tbd: Collects layers from tree.
         * @param {Function} onsuccess a callback as function(layers) to set the layers after collecting them
         */
        collectLayersFromTree (onsuccess) {
            if (typeof onsuccess === "function") {
                onsuccess([]);
            }
        },
        /**
         * Moves the filter into another div if necessary.
         * @returns {void}
         */
        handleUiStyle () {
            if (isUiStyleTable()) {
                setFilterInTableMenu(this.$el.querySelector("#tool-general-filter"));
                this.$el.remove();
            }
        },
        /**
         * Getter for layers.
         * @param {Number} filterId the id of the filter
         * @returns {Object} the layer config
         */
        getLayerByFilterId (filterId) {
            return this.layerConfigsAssoc[filterId];
        },
        /**
         * Deselects all layers.
         * @returns {void}
         */
        deselectAllLayers () {
            Object.values(this.layerConfigsAssoc).forEach(layer => {
                layer.selected = false;
            });
        },
        /**
         * Selects a layer and all its parents.
         * @param {Number} filterId the id of the layer to select
         * @returns {void}
         */
        selectLayer (filterId) {
            const layer = this.getLayerByFilterId(filterId);

            if (!isObject(layer)) {
                return;
            }

            layer.selected = true;
            if (isObject(layer.parent)) {
                this.selectLayer(layer.parent.filterId);
            }
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
                <LayerFilterCategory
                    v-for="(layerConfig, indexLayer) in layerConfigs"
                    :key="'layer-' + indexLayer"
                    class="layerSelector"
                    :layer-selector-visible="layerSelectorVisible"
                    :layer-config="layerConfig"
                    :multi-layer-selector="multiLayerSelector"
                    :deselect-all-layers="deselectAllLayers"
                    :select-layer="selectLayer"
                />
            </div>
        </template>
    </ToolTemplate>
</template>

<style lang="scss" scoped>
    @import "~/css/mixins.scss";
</style>
