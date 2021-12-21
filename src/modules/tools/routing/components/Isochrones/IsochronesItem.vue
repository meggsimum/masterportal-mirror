<script>
import {mapGetters, mapActions, mapMutations} from "vuex";
import getters from "../../store/isochrones/gettersIsochrones";
import actions from "../../store/isochrones/actionsIsochrones";
import mutations from "../../store/isochrones/mutationsIsochrones";
import * as constants from "../../store/isochrones/constantsIsochrones";
import * as constantsRouting from "../../store/constantsRouting";
import RoutingCoordinateInput from "../RoutingCoordinateInput.vue";
import RoutingSliderInput from "../RoutingSliderInput.vue";
import RoutingDownload from "../RoutingDownload.vue";
import IsochronesItemBatchProcessing from "./IsochronesItemBatchProcessing.vue";
import RoutingBatchProcessingCheckbox from "../RoutingBatchProcessingCheckbox.vue";
import RoutingAvoidFeatures from "../RoutingAvoidFeatures.vue";
import RoutingSpeedProfileIcon from "../RoutingSpeedProfileIcon.vue";

export default {
    name: "IsochronesItem",
    components: {
        RoutingCoordinateInput,
        RoutingSliderInput,
        RoutingDownload,
        IsochronesItemBatchProcessing,
        RoutingBatchProcessingCheckbox,
        RoutingAvoidFeatures,
        RoutingSpeedProfileIcon
    },
    data () {
        return {
            constants,
            constantsRouting
        };
    },
    computed: {
        ...mapGetters("Tools/Routing/Isochrones", Object.keys(getters)),
        /**
         * Computed distance/time value for the current active slider
         * @returns {Number} value for the current active slider
         */
        currentValue () {
            return this.settings.isochronesMethodOption === "DISTANCE" ? this.settings.distanceValue : this.settings.timeValue;
        },
        /**
         * Computed maximum value for the interval slider
         * @returns {Number} maximum value for the interval slider
         */
        maxIntervalValue () {
            return this.currentValue < this.settings.maxInterval ? this.currentValue : this.settings.maxInterval;
        },

        /**
         * Computed minimum value for the interval slider
         * @returns {Number} maximum value for the interval slider
         */
        minIntervalValue () {
            return this.currentValue < this.settings.minInterval ? this.currentValue : this.settings.minInterval;
        }
    },
    async created () {
        this.initIsochrones();
    },

    beforeDestroy () {
        this.closeIsochrones();
    },

    methods: {
        ...mapMutations("Tools/Routing/Isochrones", Object.keys(mutations)),
        ...mapActions("Tools/Routing/Isochrones", Object.keys(actions)),
        /**
         * Changes the speed profile
         * @param {String} speedProfileId to change
         * @returns {void}
         */
        changeSpeedProfile (speedProfileId) {
            if (this.isInputDisabled) {
                return;
            }
            this.settings.speedProfile = speedProfileId;
        },
        /**
         * Changes the isochrones method and checks the interval value
         * @param {String} methodOptionId to change
         * @returns {void}
         */
        changeMethodOption (methodOptionId) {
            this.settings.isochronesMethodOption = methodOptionId;
            if (this.currentValue < this.settings.intervalValue) {
                this.setIntervalValue(this.currentValue);
            }
        },
        /**
         * Sets the distance value and checks the interval value
         * @param {Number} distanceValue to set
         * @returns {void}
         */
        setDistanceValue (distanceValue) {
            this.settings.distanceValue = distanceValue;
            if (distanceValue < this.settings.intervalValue) {
                this.setIntervalValue(distanceValue);
            }
        },
        /**
         * Sets the time value and checks the interval value
         * @param {Number} timeValue to set
         * @returns {void}
         */
        setTimeValue (timeValue) {
            this.settings.timeValue = timeValue;
            if (timeValue < this.settings.intervalValue) {
                this.setIntervalValue(timeValue);
            }
        },
        /**
         * Sets the interval value
         * @param {Number} intervalValue to set
         * @returns {void}
         */
        setIntervalValue (intervalValue) {
            this.settings.intervalValue = intervalValue;
        },
        /**
         * Resets the input waypoint and the displayed map features
         * @returns {void}
         */
        onRemoveWaypoint () {
            this.waypoint.reset();
            this.createIsochronesPointDrawInteraction();
            this.resetIsochronesResult();
        },
        /**
         * Adds an option to avoid when requesting isochrones afterwards
         * @param {String} optionId from constantsRouting
         * @returns {void}
         */
        onAddAvoidOption (optionId) {
            this.routingAvoidFeaturesOptions.push(optionId);
        },
        /**
         * Removes an option to avoid when requesting isochrones afterwards
         * @param {String} optionId from constantsRouting
         * @returns {void}
         */
        onRemoveAvoidOption (optionId) {
            const index = this.routingAvoidFeaturesOptions.findIndex(
                (opt) => opt === optionId
            );

            this.routingAvoidFeaturesOptions.splice(index, 1);
        },
        /**
         * Changes the setting to display batch processing
         * @param {Boolean} input new value
         * @returns {void}
         */
        onBatchProcessingCheckboxInput (input) {
            this.settings.batchProcessing.active = input;
        }
    }
};
</script>

<template>
    <div id="routing-isochrones">
        <RoutingSpeedProfileIcon
            v-for="option in constantsRouting.speedProfileOptions"
            :key="option"
            :class="['pointer mr-4 ', isInputDisabled ? 'opacity-05' : '']"
            :speed-profile-id="option"
            :fill-color="option === settings.speedProfile ? '#0077ff' : '#000000'"
            :tooltip="$t('common:modules.tools.routing.speedprofiles.' + option)"
            @click.native="changeSpeedProfile(option)"
        />

        <hr>

        <template v-if="settings.batchProcessing.enabled">
            <RoutingBatchProcessingCheckbox
                :batch-processing="settings.batchProcessing"
                @input="onBatchProcessingCheckboxInput($event)"
            />

            <hr>
        </template>

        <template v-if="settings.batchProcessing.enabled && settings.batchProcessing.active">
            <IsochronesItemBatchProcessing :settings="settings" />
        </template>
        <template v-else>
            <h6>{{ $t('common:modules.tools.routing.isochrones.startpoint') }}</h6>

            <form
                id="routing-isochrones-coordinate-input-form"
                class="form-horizontal"
                role="form"
            >
                <RoutingCoordinateInput
                    :count-waypoints="1"
                    :waypoint="waypoint"
                    @removeWaypoint="onRemoveWaypoint()"
                    @searchResultSelected="zoomOnWaypoint()"
                />
            </form>
        </template>

        <hr>

        <h6>{{ $t('common:modules.tools.routing.isochrones.optimizeHeader') }}</h6>

        <select
            id="routing-isochrones-methodoption"
            class="form-select form-select-sm"
            @change="changeMethodOption($event.target.value)"
        >
            <option
                v-for="option in constants.isochronesMethodeOptions"
                :id="option"
                :key="'routing-isochrones-methodoption-' + option"
                :value="option"
                :selected="option === settings.isochronesMethodOption"
                :disabled="isInputDisabled"
            >
                {{ $t('common:modules.tools.routing.isochrones.optimization.' + option) }}
            </option>
        </select>


        <template v-if="settings.isochronesMethodOption === 'DISTANCE'">
            <RoutingSliderInput
                :label="$t('common:modules.tools.routing.isochrones.maxDistance')"
                :value="settings.distanceValue"
                :min="settings.minDistance"
                :max="settings.maxDistance"
                :disabled="isInputDisabled"
                unit="km"
                @input="setDistanceValue($event)"
            />
        </template>

        <template v-else-if="settings.isochronesMethodOption === 'TIME'">
            <RoutingSliderInput
                :label="$t('common:modules.tools.routing.isochrones.maxTraveltime')"
                :value="settings.timeValue"
                :min="settings.minTime"
                :max="settings.maxTime"
                :disabled="isInputDisabled"
                unit="min"
                @input="setTimeValue($event)"
            />
        </template>

        <RoutingSliderInput
            :label="$t('common:modules.tools.routing.isochrones.interval')"
            :value="settings.intervalValue"
            :min="minIntervalValue"
            :max="maxIntervalValue"
            :unit="settings.isochronesMethodOption ==='DISTANCE' ? 'km' : 'min'"
            :disabled="isInputDisabled"
            @input="setIntervalValue($event)"
        />

        <hr>

        <RoutingAvoidFeatures
            :settings="settings"
            :active-avoid-features-options="routingAvoidFeaturesOptions"
            :disabled="isInputDisabled"
            @addAvoidOption="onAddAvoidOption($event)"
            @removeAvoidOption="onRemoveAvoidOption($event)"
        />

        <template v-if="!(settings.batchProcessing.enabled && settings.batchProcessing.active)">
            <hr>

            <div class="d-flex flex-column">
                <div class="col-12 d-grid gap-2">
                    <button
                        class="btn btn-primary"
                        type="button"
                        :disabled="waypoint.getCoordinates().length === 0 || isInputDisabled"
                        @click="findIsochrones()"
                    >
                        {{ $t('common:modules.tools.routing.isochrones.calculate') }}
                    </button>
                </div>

                <div
                    v-if="routingIsochrones"
                    id="routing-isochrones-result-isochrones"
                >
                    <hr class="w-100">

                    <span class="mb-2">{{ $t('common:modules.tools.routing.isochrones.legend') }}</span>
                    <div
                        v-for="(area, index) of routingIsochrones.getAreas()"
                        :key="'result-area-' + index"
                        class="d-flex mb-2 ml-2"
                    >
                        <div
                            class="legendecontainer px-2"
                            :style="{backgroundColor: area.getColorRgbString()}"
                        >
                            <span>{{ area.getDisplayValue() }}</span>
                            <span>{{ area.getOptimization() === 'DISTANCE' ? 'km' : 'min' }}</span>
                        </div>
                    </div>

                    <hr class="w-100">

                    <RoutingDownload hide-gpx />
                </div>
            </div>
        </template>
    </div>
</template>

<style lang="scss" scoped>
@import "~variables";
#routing-isochrones {
  min-width: 350px;
}
.d-flex {
  display: flex;
}
.flex-column {
  flex-direction: column;
}
.ml-2 {
  margin-left: 0.5rem;
}
.ml-4 {
  margin-left: 1rem;
}
.mr-4 {
    margin-right: 1rem;
}
.mb-2 {
    margin-bottom: 0.5rem;
}
.px-2 {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
}
.pointer {
  cursor: pointer;
}
.w-100 {
    width: 100%;
}

.legendecontainer {
    width: 56px;
    text-align: center;
}

.opacity-05 {
    opacity: 0.5;
}
</style>
