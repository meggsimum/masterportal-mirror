<script>
import {mapGetters, mapMutations, mapActions} from "vuex";
import getters from "../store/gettersLayerSlider";
import mutations from "../store/mutationsLayerSlider";
import "bootstrap-slider";

export default {
    name: "LayerSliderHandle",
    computed: {
        ...mapGetters("Tools/LayerSlider", Object.keys(getters))
    },
    created () {
        this.setActiveIndex(0);
    },
    mounted () {
        const dataSliderTicks = this.prepareSliderTicks(this.layerIds);

        this.setDataSliderMax(String((this.layerIds.length - 1) * 10));
        this.setDataSliderTicks(dataSliderTicks);
        this.initializeSlider();
    },
    methods: {
        ...mapMutations("Tools/LayerSlider", Object.keys(mutations)),
        ...mapActions("Tools/LayerSlider", [
            "sendModification",
            "setActiveIndex"
        ]),

        /**
         * Initialize the slider.
         * Thereby adds the on slide event.
         * @returns {void}
         */
        initializeSlider: function () {
            this.$nextTick(() => {
                $(".slider").slider({
                    "ticks_labels": this.layerIds.map(layerId => layerId.title)
                }).on("slide", event => {
                    this.dragHandle(event.value);
                }).on("slideStop", event => {
                    this.dragHandle(event.value);
                });
            });
        },

        /**
         * Prepares the slider ticks based on the layerIds array.
         * @param {Object[]} layerIds Layer ids.
         * @return {String} - Slider ticks configuration for bootstrap-slider.
         */
        prepareSliderTicks: function (layerIds) {
            let sliderTicks = [];

            layerIds.forEach((layerId, index) => {
                sliderTicks.push(index * 10);
            });
            sliderTicks = JSON.stringify(sliderTicks);

            return sliderTicks;
        },

        /**
         * Drags the handle and shows the corresponding layer with its transparency.
         * @param {Number} index Index of handle position.
         * @returns {void}
         */
        dragHandle: function (index) {
            const prevLayerId = this.getLayerIdFromIndex(index),
                nextLayerId = this.getLayerIdFromIndex(index, "next"),
                prevLayerTransparency = (index % 10) * 10,
                nextLayerTransparency = 100 - prevLayerTransparency;

            this.showLayer(prevLayerId, prevLayerTransparency, this.layerIds);
            this.showLayer(nextLayerId, nextLayerTransparency, this.layerIds);
        },

        /**
         * Gets the layerId from the given index.
         * @param {Number} index Index of handle position.
         * @param {String} mode The Mode. Indicates which layer should be taken.
         * @returns {String} The layerId.
         */
        getLayerIdFromIndex: function (index, mode) {
            const position = this.getPositionFromValue(index, mode),
                layerIds = this.layerIds[position],
                layerId = layerIds ? layerIds.layerId : {};

            return layerId;
        },

        /**
         * Calculates the position of the layer, based on the handle position.
         * @param {Number} index Index of handle position.
         * @param {String} mode The Mode. Indicates which layer should be taken.
         * @returns {Number} Position of layer in "layerIds"
         */
        getPositionFromValue: function (index, mode) {
            let position = Math.floor(Math.round(index) / 10);

            if (mode === "next") {
                ++position;
            }

            return position;
        },

        /**
         * Modificates the layers visibility and transparency based on the handle position.
         * @param {String} layerId The Layer id.
         * @param {Number} transparency transparency based on the handle position.
         * @param {Object[]} layerIds The configuration of the layers from config.json.
         * @returns {void}
         */
        showLayer: function (layerId, transparency, layerIds) {
            this.sendModification({
                layerId: layerId,
                status: transparency >= 0 && transparency < 100,
                transparency: transparency === 100 ? 0 : transparency
            });

            if (transparency === 0) {
                const filteredObj = layerIds.filter(obj => obj.layerId === layerId),
                    index = layerIds.indexOf(filteredObj[0]);

                this.setActiveIndex(index);
            }
        }
    }
};
</script>

<template lang="html">
    <div id="tool-layer-slider-handle">
        <label
            id="label-slider"
            for="slider"
        />
        <input
            id="slider"
            ref="sliderHandle"
            type="range"
            class="slider"
            :data-slider-min="dataSliderMin"
            :data-slider-max="dataSliderMax"
            data-slider-step="1"
            data-slider-value="0"
            :data-slider-ticks="dataSliderTicks"
            data-slider-tooltip="hide"
        >
    </div>
</template>

<style lang="scss" scoped>
#tool-layer-slider-handle {
    display: flex;
    justify-content: space-evenly;
    flex-wrap: wrap;
    width: 100%;

    #label-slider {
        flex-basis: 100%;
    }
}
</style>

<style lang="scss">
#tool-layer-slider-handle {
    .slider.slider-horizontal {
        width: 80%;
    }
}
</style>
