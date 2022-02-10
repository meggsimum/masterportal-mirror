<script>
import {mapActions, mapGetters, mapMutations} from "vuex";
import getters from "../store/gettersWmsTime";
import mutations from "../store/mutationsWmsTime";

export default {
    name: "TimeSlider",
    props: {
        layerId: {
            type: String,
            default: ""
        }
    },
    data: () => ({playing: false, playbackHandle: null, sliderValue: 0}),
    computed: {
        ...mapGetters("WmsTime", Object.keys(getters)),
        ...mapGetters("Map", ["map"])
    },
    watch: {
        defaultValue () {
            this.sliderValue = this.defaultValue;
        },
        sliderValue () {
            if (this.timeRange.indexOf(this.sliderValue) === -1) {
                // If possible, find the next higher (or if not existent, lower) value inside the timeRange.
                const valTooHigh = this.timeRange[this.timeRange.length - 1] < this.sliderValue,
                    index = this.timeRange.findIndex(val => valTooHigh ? val < this.sliderValue : val > this.sliderValue);

                this.sliderValue = this.timeRange[index];
            }

            Radio.request("ModelList", "getModelByAttributes", {id: this.layerId}).updateTime(this.layerId, this.sliderValue);

            if (this.layerSwiper.active) {
                this.updateMap();
            }
        }
    },
    created () {
        this.sliderValue = this.defaultValue;
    },
    methods: {
        ...mapActions("WmsTime", ["toggleSwiper", "updateMap"]),
        ...mapMutations("WmsTime", Object.keys(mutations)),
        animate () {
            const index = this.nextIndex();

            if (index === this.timeRange.length) {
                this.playing = false;
                return;
            }
            this.sliderValue = this.timeRange[index];
        },
        nextIndex (forward = true) {
            return this.timeRange.indexOf(this.sliderValue) + (forward ? 1 : -1);
        },
        moveOne (forward) {
            this.sliderValue = this.timeRange[this.nextIndex(forward)];
        },
        play () {
            this.playing = !this.playing;

            // This is true whenever any of the two players is being used.
            this.setTimeSliderPlaying(this.playing);

            if (this.playing) {
                this.playbackHandle = setInterval(this.animate, this.timeSlider.playbackDelay * 1000);
            }
            else {
                clearInterval(this.playbackHandle);
                this.playbackHandle = null;
            }
        }
    }
};
</script>

<template>
    <div class="timeSlider-wrapper centered-box-wrapper">
        <div
            v-if="minWidth"
            class="timeSlider-innerWrapper"
        >
            <button
                :id="'timeSlider-activate-layerSwiper-' + layerId"
                class="btn btn-sm btn-lgv-grey"
                @click="toggleSwiper(layerId)"
            >
                {{ $t(`common:modules.wmsTime.timeSlider.buttons.${minWidth && layerSwiper.active ? "deactivateL" : "l"}ayerSwiper`) }}
            </button>
        </div>
        <div class="timeSlider-innerWrapper-interactions">
            <fieldset>
                <button
                    :id="'timeSlider-button-backward-' + layerId"
                    class="btn btn-sm btn-lgv-grey"
                    :aria-label="$t('common:modules.wmsTime.timeSlider.buttons.backward')"
                    :disabled="nextIndex(false) === -1"
                    @click="moveOne(false)"
                >
                    <i class="glyphicon glyphicon-backward" />
                </button>
                <button
                    :id="'timeSlider-button-play-' + layerId"
                    class="btn btn-sm btn-lgv-grey"
                    :aria-label="$t('common:modules.wmsTime.timeSlider.buttons.play')"
                    @click="play"
                >
                    <i
                        :class="['glyphicon', playing ? 'glyphicon-pause' : 'glyphicon-play']"
                    />
                </button>
                <button
                    :id="'timeSlider-button-forward-' + layerId"
                    class="btn btn-sm btn-lgv-grey"
                    :aria-label="$t('common:modules.wmsTime.timeSlider.buttons.forward')"
                    :disabled="nextIndex() === timeRange.length"
                    @click="moveOne(true)"
                >
                    <i class="glyphicon glyphicon-forward" />
                </button>
            </fieldset>
            <fieldset>
                <label
                    :id="`timeSlider-input-range-${layerId}-label`"
                    :for="'timeSlider-input-range-' + layerId"
                >{{ sliderValue }}</label>
            </fieldset>
            <fieldset>
                <input
                    :id="'timeSlider-input-range-' + layerId"
                    type="range"
                    :value="sliderValue"
                    :min="min"
                    :max="max"
                    :step="step"
                    :aria-label="$t('common:modules.wmsTime.timeSlider.inputRangeLabel')"
                    @input="sliderValue = Number($event.target.value)"
                >
            </fieldset>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import "~variables";

.timeSlider-wrapper {
    $base-margin: 0.25em;
    $bigger-margin: calc($base-margin * 3);

    position: absolute;
    bottom: 6em;
    left: 50%;
    z-index: 3;

    display: flex;
    flex-direction: column;
    background: white;
    box-shadow: $tool_box_shadow;

    .timeSlider-innerWrapper {
        display: flex;
        justify-content: flex-start;
        // No margin on bottom
        margin: $bigger-margin $bigger-margin 0;
    }

    .timeSlider-innerWrapper-interactions {
        $border-style: 1px solid black;

        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 28em;
        margin: $bigger-margin;
        border: 1px solid black;

        > fieldset {
            display: flex;

            button {
                margin: $base-margin;
            }
            input {
                margin-right: $base-margin;
            }
            label {
                border-left: $border-style;
                border-right: $border-style;
                margin: 0;
                padding: $bigger-margin;
            }
        }
    }
}
</style>
