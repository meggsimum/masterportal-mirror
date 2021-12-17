<script>
import {mapGetters, mapMutations, mapActions} from "vuex";
import getters from "../store/gettersLayerSlider";
import mutations from "../store/mutationsLayerSlider";

export default {
    name: "LayerSliderPlayer",
    computed: {
        ...mapGetters("Tools/LayerSlider", Object.keys(getters))
    },
    mounted () {
        this.setProgressBarWidth(this.layerIds);
    },
    methods: {
        ...mapMutations("Tools/LayerSlider", Object.keys(mutations)),
        ...mapActions("Tools/LayerSlider", [
            "setActiveIndex"
        ]),

        /**
         * Starts the Windows interval once.
         * @returns {void}
         */
        startInterval: function () {
            if (this.windowsInterval === null) {
                this.forwardLayer();
                this.setWindowsInterval(this.forwardLayer);
            }
        },

        /**
         * Finds the next index in the array in a loop.
         * @returns {void}
         */
        forwardLayer: function () {
            const index = this.activeLayer.index,
                max = this.layerIds.length - 1;

            if (index > -1 && index < max) {
                this.setActiveIndex(index + 1);
            }
            else {
                this.setActiveIndex(0);
            }
        },

        /**
         * Finds the previous index in the array in a loop.
         * @returns {void}
         */
        backwardLayer: function () {
            const index = this.activeLayer.index,
                max = this.layerIds.length - 1;

            if (index > 0) {
                this.setActiveIndex(index - 1);
            }
            else {
                this.setActiveIndex(max);
            }
        },

        /**
         * Stops the windows interval.
         * @returns {void}
         */
        stopInterval: function () {
            if (typeof this.windowsInterval !== "undefined") {
                this.setWindowsInterval(null);
            }
        },

        /**
         * Resets the tool.
         * @returns {void}
         */
        reset: function () {
            this.stopInterval();
            this.resetActiveLayer();
        }
    }
};
</script>

<template lang="html">
    <div id="tool-layer-slider-player">
        <div class="progress">
            <div
                class="progress-bar"
                role="progressbar"
                aria-valuenow="0"
                aria-valuemin="0"
                :aria-valuemax="layerIds.length"
                :style="currentProgressBarWidth"
            >
                <span class="sr-only">{{ $t("modules.tools.layerSlider.displayLayers") }}</span>
            </div>
        </div>
        <div class="input-group">
            <button
                v-if="windowsInterval === null"
                id="play"
                type="button"
                class="btn btn-default active-button"
                @click="startInterval"
            >
                <span
                    class="bootstrap-icon"
                    aria-hidden="true"
                >
                    <i class="bi-play-fill" />
                </span>
            </button>
            <button
                v-else
                id="pause"
                type="button"
                class="btn btn-default active-button"
                @click="stopInterval"
            >
                <span
                    class="bootstrap-icon"
                    aria-hidden="true"
                >
                    <i class="bi-pause" />
                </span>
            </button>
            <button
                id="stop"
                type="button"
                class="btn btn-default active-button"
                @click="reset"
            >
                <span
                    class="bootstrap-icon"
                    aria-hidden="true"
                >
                    <i class="bi-stop-fill" />
                </span>
            </button>
            <button
                id="backward"
                type="button"
                class="btn btn-default active-button"
                @click="backwardLayer"
            >
                <span
                    class="bootstrap-icon"
                    aria-hidden="true"
                >
                    <i class="bi-skip-backward-fill" />
                </span>
            </button>
            <button
                id="forward"
                type="button"
                class="btn btn-default active-button"
                @click="forwardLayer"
            >
                <span
                    class="bootstrap-icon"
                    aria-hidden="true"
                >
                    <i class="bi-skip-forward-fill" />
                </span>
            </button>
            <label for="title" />
            <input
                id="title"
                type="text"
                class="form-control"
                :placeholder="$t('common:modules.tools.layerSlider.titleNotConfigured')"
                :value="$t(activeLayer.title)"
                readonly="true"
            >
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import "../../../../../css/mixins.scss";
@import "~variables";

$color_1: black;
$background_color_1: #eee;

#tool-layer-slider-player {
    .progress-bar {
        background-color: $secondary_focus;
        transition: all .6s;
    }
    .progress {
        height: 25px;
        background-color: $background_color_1;
    }
    .active-button {
        background-color: $background_color_1;
        transition: all .2s ease-in-out;
        &:focus {
            @include primary_action_focus;
        }
        &:hover {
            @include primary_action_hover;
        }
    }
    input[readonly] {
        color: $color_1;
        cursor: not-allowed;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        padding: 16px 12px 17px 12px;
    }
}
</style>
