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
        ...mapGetters("Map", ["map"]),
        sliderOptionCount () {
            return this.timeRange.length - 1;
        },
        selectedTime () {
            return this.timeRange[this.sliderValue];
        }
    },
    watch: {
        defaultValue () {
            this.sliderValue = this.timeRange.indexOf(this.defaultValue);
        },
        sliderValue () {
            if (!this.timeRange[this.sliderValue]) {
                // revert to 0 in case of fault
                this.sliderValue = 0;
            }

            const layer = Radio.request(
                    "ModelList",
                    "getModelByAttributes",
                    {id: this.layerId}
                ),
                targetTime = this.timeRange[this.sliderValue];

            if (layer) {
                layer.updateTime(this.layerId, targetTime);
                if (this.layerSwiper.active) {
                    this.updateMap();
                }
            }
        }
    },
    created () {
        this.sliderValue = this.timeRange.indexOf(this.defaultValue);
    },
    methods: {
        ...mapActions("WmsTime", ["toggleSwiper", "updateMap"]),
        ...mapMutations("WmsTime", Object.keys(mutations)),
        setSliderValue (value) {
            this.sliderValue = Number(value);
        },
        animate () {
            const index = this.nextIndex();

            if (index === this.timeRange.length) {
                this.playing = false;
                this.clearPlayback();
                return;
            }
            this.sliderValue = index;
        },
        clearPlayback () {
            clearInterval(this.playbackHandle);
            this.playbackHandle = null;
        },
        nextIndex (forward = true) {
            return this.sliderValue + (forward ? 1 : -1);
        },
        moveOne (forward) {
            this.sliderValue = this.nextIndex(forward);
        },
        play () {
            this.playing = !this.playing;

            // This is true whenever any of the two players is being used.
            this.setTimeSliderPlaying(this.playing);

            if (this.playing) {
                this.playbackHandle = setInterval(this.animate, this.timeSlider.playbackDelay * 1000);
            }
            else {
                this.clearPlayback();
            }
        }
    }
};
</script>

<template>
    <div class="timeSlider-wrapper centered-box-wrapper">
        <div class="timeSlider-control-row">
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
            </div>
        </div>
        <label
            :id="`timeSlider-input-range-${layerId}-label`"
            :for="'timeSlider-input-range-' + layerId"
            class="timeSlider-input-range-label"
        >
            <input
                :id="'timeSlider-input-range-' + layerId"
                type="range"
                :value="sliderValue"
                :min="0"
                :max="sliderOptionCount"
                :step="1"
                :aria-label="$t('common:modules.wmsTime.timeSlider.inputRangeLabel')"
                @input="setSliderValue($event.target.value)"
            >
            {{ selectedTime }}
        </label>
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

    .timeSlider-control-row {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
    }

    .timeSlider-innerWrapper {
        display: flex;
        justify-content: flex-start;
        // No margin on bottom
        margin: $bigger-margin;
    }

    .timeSlider-input-range-label {
        margin: $bigger-margin;
    }

    .timeSlider-innerWrapper-interactions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: $bigger-margin;
    }
}
</style>
