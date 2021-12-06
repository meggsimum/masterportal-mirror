<script>
import {mapGetters, mapMutations, mapActions} from "vuex";
import ToolTemplate from "../../ToolTemplate.vue";
import getComponent from "../../../../utils/getComponent";
import getters from "../store/gettersLayerSlider";
import mutations from "../store/mutationsLayerSlider";
import LayerSliderHandle from "./LayerSliderHandle.vue";
import LayerSliderPlayer from "./LayerSliderPlayer.vue";

export default {
    name: "LayerSlider",
    components: {
        ToolTemplate,
        LayerSliderHandle,
        LayerSliderPlayer
    },
    computed: {
        ...mapGetters("Tools/LayerSlider", Object.keys(getters))
    },
    watch: {
        active (isActive) {
            if (!isActive) {
                this.setWindowsInterval(null);
                this.resetActiveLayer();
            }
        }
    },
    created () {
        this.$on("close", this.close);
    },
    mounted () {
        this.checkIfAllLayersAvailable(this.layerIds);
        this.addIndexToLayerIds(this.layerIds);
    },
    methods: {
        ...mapMutations("Tools/LayerSlider", Object.keys(mutations)),
        ...mapActions("Tools/LayerSlider", [
            "addIndexToLayerIds",
            "checkIfAllLayersAvailable"
        ]),

        /**
         * Sets active to false.
         * @returns {void}
         */
        close () {
            this.setActive(false);
            // The value "isActive" of the Backbone model is also set to false to change the CSS class in the menu (menu/desktop/tool/view.toggleIsActiveClass)
            const model = getComponent(this.id);

            if (model) {
                model.set("isActive", false);
            }
        }
    }
};
</script>

<template lang="html">
    <ToolTemplate
        :title="$t(name)"
        :icon="icon"
        :active="active"
        :render-to-window="renderToWindow"
        :resizable-window="resizableWindow"
        :deactivate-gfi="deactivateGFI"
    >
        <template #toolBody>
            <div
                v-if="active"
                id="tool-layer-slider"
            >
                <h5>
                    {{ $t(title) }}
                </h5>
                <LayerSliderPlayer
                    v-if="sliderType === 'player'"
                />
                <LayerSliderHandle
                    v-else-if="sliderType === 'handle'"
                />
            </div>
        </template>
    </ToolTemplate>
</template>

<style lang="scss" scoped>
#tool-layer-slider {
    @media (min-width: 768px) {
        min-width: 350px;
    }
}

</style>
