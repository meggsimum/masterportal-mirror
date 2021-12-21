<script>
import {mapGetters, mapActions, mapMutations} from "vuex";
import getters from "../../store/directions/gettersDirections";
import actions from "../../store/directions/actionsDirections";
import mutations from "../../store/directions/mutationsDirections";
import RoutingCoordinateInput from "../RoutingCoordinateInput.vue";
import RoutingDistanceDisplay from "../RoutingDistanceDisplay.vue";
import RoutingDurationDisplay from "../RoutingDurationDisplay.vue";
import DirectionsItemBatchProcessing from "./DirectionsItemBatchProcessing.vue";
import RoutingBatchProcessingCheckbox from "../RoutingBatchProcessingCheckbox.vue";
import RoutingDownload from "../RoutingDownload.vue";
import RoutingAvoidFeatures from "../RoutingAvoidFeatures.vue";
import RoutingSpeedProfileIcon from "../RoutingSpeedProfileIcon.vue";
import * as constants from "../../store/directions/constantsDirections";
import * as constantsRouting from "../../store/constantsRouting";

export default {
    name: "DirectionsItem",
    components: {
        RoutingCoordinateInput,
        RoutingDistanceDisplay,
        RoutingDurationDisplay,
        RoutingDownload,
        DirectionsItemBatchProcessing,
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
        ...mapGetters("Tools/Routing/Directions", Object.keys(getters)),
        /**
         * Checks if current map mode is "AVOID_AREAS"
         * @returns {Boolean} true if mode is "AVOID_AREAS"
         */
        isMapInteractionModeAvoidAreasEdit () {
            return this.mapInteractionMode === "AVOID_AREAS";
        },
        /**
         * Checks if current map mode is "DELETE_AVOID_AREAS"
         * @returns {Boolean} true if mode is "DELETE_AVOID_AREAS"
         */
        isMapInteractionModeAvoidAreasDelete () {
            return this.mapInteractionMode === "DELETE_AVOID_AREAS";
        }
    },
    async created () {
        this.initDirections();
    },
    beforeDestroy () {
        this.closeDirections();
    },
    methods: {
        ...mapMutations("Tools/Routing/Directions", Object.keys(mutations)),
        ...mapActions("Tools/Routing/Directions", Object.keys(actions)),

        /**
         * Changes the current speed profile and requests directions after
         * @param {String} speedProfileId from constantsRouting
         * @returns {void}
         */
        changeSpeedProfile (speedProfileId) {
            if (this.isInputDisabled) {
                return;
            }
            this.settings.speedProfile = speedProfileId;
            this.findDirections();
        },
        /**
         * Changes the current preference and requests directions after
         * @param {String} preferenceId from constantsDirections
         * @returns {void}
         */
        changePreference (preferenceId) {
            this.settings.preference = preferenceId;
            this.findDirections();
        },
        /**
         * Toggles the current map mode between "AVOID_AREAS" and "WAYPOINTS"
         * @returns {void}
         */
        changeMapInteractionModeAvoidAreasEdit () {
            if (this.mapInteractionMode === "AVOID_AREAS") {
                this.setMapInteractionMode("WAYPOINTS");
            }
            else {
                this.setMapInteractionMode("AVOID_AREAS");
            }
            this.createInteractionFromMapInteractionMode();
        },
        /**
         * Toggles the current map mode between "DELETE_AVOID_AREAS" and "WAYPOINTS"
         * @returns {void}
         */
        changeMapInteractionModeAvoidAreasDelete () {
            if (this.mapInteractionMode === "DELETE_AVOID_AREAS") {
                this.setMapInteractionMode("WAYPOINTS");
            }
            else {
                this.setMapInteractionMode("DELETE_AVOID_AREAS");
            }
            this.createInteractionFromMapInteractionMode();
        },
        /**
         * Resets the current settings, including waypoints and avoid areas.
         * @returns {void}
         */
        reset () {
            for (let i = this.waypoints.length - 1; i >= 0; i--) {
                this.removeWaypoint({index: this.waypoints[i].index});
            }
            this.directionsRouteSource.getFeatures().forEach(feature => feature.getGeometry().setCoordinates([]));
            this.setRoutingDirections(null);
            this.directionsAvoidSource.clear();
        },
        /**
         * Adds a new option to avoid when requesting directions afterwards
         * @param {String} optionId from constantsRouting
         * @returns {void}
         */
        onAddAvoidOption (optionId) {
            this.routingAvoidFeaturesOptions.push(optionId);
            this.findDirections();
        },
        /**
         * Removes an option to avoid when requesting directions afterwards
         * @param {String} optionId from constantsRouting
         * @returns {void}
         */
        onRemoveAvoidOption (optionId) {
            const index = this.routingAvoidFeaturesOptions.findIndex(
                (opt) => opt === optionId
            );

            this.routingAvoidFeaturesOptions.splice(index, 1);
            this.findDirections();
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
    <div id="routing-directions">
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
            <DirectionsItemBatchProcessing :settings="settings" />
        </template>
        <template v-else>
            <form
                id="routing-directions-coordinate-input-form"
                class="form-horizontal"
                role="form"
            >
                <RoutingCoordinateInput
                    v-for="(waypoint, index) of waypoints"
                    :key="index"
                    :count-waypoints="waypoints.length"
                    :waypoint="waypoint"
                    @moveWaypointUp="moveWaypointUp(waypoint.index)"
                    @moveWaypointDown="moveWaypointDown(waypoint.index)"
                    @removeWaypoint="removeWaypoint({index: waypoint.index, reload: true})"
                    @searchResultSelected="findDirections()"
                />
            </form>

            <div class="d-flex justify-content-between mt-4">
                <div class="d-flex">
                    <span> {{ $t('common:modules.tools.routing.directions.restrictedAreas') }}:</span>

                    <svg
                        class="ml-2 pointer"
                        width="20px"
                        height="20px"
                        viewBox="0 0 30 30"
                        version="1.1"
                        xmlns="http://www.w3.org/2000/svg"
                        xmlns:xlink="http://www.w3.org/1999/xlink"
                        xml:space="preserve"
                        xmlns:serif="http://www.serif.com/"
                        fill-rule="evenodd"
                        @click="changeMapInteractionModeAvoidAreasEdit()"
                        @keydown.enter="changeMapInteractionModeAvoidAreasEdit()"
                    >
                        <title>{{ $t('common:modules.tools.routing.directions.editRestrictedAreas') }}</title>
                        <path
                            :fill="isMapInteractionModeAvoidAreasEdit ? '#f00' : '#000'"
                            d="M3,0c1.656,0 3,1.344 3,3c0,1.656 -1.344,3 -3,3c-1.656,0 -3,-1.344 -3,-3c0,-1.656 1.344,-3 3,-3Zm0,1.5c0.828,0 1.5,0.672 1.5,1.5c0,0.828 -0.672,1.5 -1.5,1.5c-0.828,0 -1.5,-0.672 -1.5,-1.5c0,-0.828 0.672,-1.5 1.5,-1.5Z"
                        />
                        <path
                            :fill="isMapInteractionModeAvoidAreasEdit ? '#f00' : '#000'"
                            d="M27,4c1.656,0 3,1.344 3,3c0,1.656 -1.344,3 -3,3c-1.656,0 -3,-1.344 -3,-3c0,-1.656 1.344,-3 3,-3Zm0,1.5c0.828,0 1.5,0.672 1.5,1.5c0,0.828 -0.672,1.5 -1.5,1.5c-0.828,0 -1.5,-0.672 -1.5,-1.5c0,-0.828 0.672,-1.5 1.5,-1.5Z"
                        />
                        <path
                            :fill="isMapInteractionModeAvoidAreasEdit ? '#f00' : '#000'"
                            d="M27,20c1.656,0 3,1.344 3,3c0,1.656 -1.344,3 -3,3c-1.656,0 -3,-1.344 -3,-3c0,-1.656 1.344,-3 3,-3Zm0,1.5c0.828,0 1.5,0.672 1.5,1.5c0,0.828 -0.672,1.5 -1.5,1.5c-0.828,0 -1.5,-0.672 -1.5,-1.5c0,-0.828 0.672,-1.5 1.5,-1.5Z"
                        />
                        <path
                            :fill="isMapInteractionModeAvoidAreasEdit ? '#f00' : '#000'"
                            d="M3,24c1.656,0 3,1.344 3,3c0,1.656 -1.344,3 -3,3c-1.656,0 -3,-1.344 -3,-3c0,-1.656 1.344,-3 3,-3Zm0,1.5c0.828,0 1.5,0.672 1.5,1.5c0,0.828 -0.672,1.5 -1.5,1.5c-0.828,0 -1.5,-0.672 -1.5,-1.5c0,-0.828 0.672,-1.5 1.5,-1.5Z"
                        />
                        <path
                            d="M3,6l0,18"
                            fill="none"
                            :stroke="isMapInteractionModeAvoidAreasEdit ? '#f00' : '#000'"
                            stroke-width="1px"
                        /><path
                            d="M27,10l0,10"
                            fill="none"
                            :stroke="isMapInteractionModeAvoidAreasEdit ? '#f00' : '#000'"
                            stroke-width="1px"
                        /><path
                            d="M24,23l-18,4"
                            fill="none"
                            :stroke="isMapInteractionModeAvoidAreasEdit ? '#f00' : '#000'"
                            stroke-width="1px"
                        /><path
                            d="M24,7l-18,-4"
                            fill="none"
                            :stroke="isMapInteractionModeAvoidAreasEdit ? '#f00' : '#000'"
                            stroke-width="1px"
                        /></svg>


                    <svg
                        class="ml-2 pointer"
                        width="20px"
                        height="20px"
                        viewBox="0 0 30 30"
                        version="1.1"
                        xmlns="http://www.w3.org/2000/svg"
                        xmlns:xlink="http://www.w3.org/1999/xlink"
                        xml:space="preserve"
                        xmlns:serif="http://www.serif.com/"
                        fill-rule="evenodd"
                        @click="changeMapInteractionModeAvoidAreasDelete()"
                        @keydown.enter="changeMapInteractionModeAvoidAreasDelete()"
                    >
                        <title>{{ $t('common:modules.tools.routing.directions.deleteRestrictedAreas') }}</title>
                        <path
                            :fill="isMapInteractionModeAvoidAreasDelete ? '#f00' : '#000'"
                            d="M3,0c1.656,0 3,1.344 3,3c0,1.656 -1.344,3 -3,3c-1.656,0 -3,-1.344 -3,-3c0,-1.656 1.344,-3 3,-3Zm0,1.5c0.828,0 1.5,0.672 1.5,1.5c0,0.828 -0.672,1.5 -1.5,1.5c-0.828,0 -1.5,-0.672 -1.5,-1.5c0,-0.828 0.672,-1.5 1.5,-1.5Z"
                        />
                        <path
                            :fill="isMapInteractionModeAvoidAreasDelete ? '#f00' : '#000'"
                            d="M27,4c1.656,0 3,1.344 3,3c0,1.656 -1.344,3 -3,3c-1.656,0 -3,-1.344 -3,-3c0,-1.656 1.344,-3 3,-3Zm0,1.5c0.828,0 1.5,0.672 1.5,1.5c0,0.828 -0.672,1.5 -1.5,1.5c-0.828,0 -1.5,-0.672 -1.5,-1.5c0,-0.828 0.672,-1.5 1.5,-1.5Z"
                        />
                        <path
                            :fill="isMapInteractionModeAvoidAreasDelete ? '#f00' : '#000'"
                            d="M27,20c1.656,0 3,1.344 3,3c0,1.656 -1.344,3 -3,3c-1.656,0 -3,-1.344 -3,-3c0,-1.656 1.344,-3 3,-3Zm0,1.5c0.828,0 1.5,0.672 1.5,1.5c0,0.828 -0.672,1.5 -1.5,1.5c-0.828,0 -1.5,-0.672 -1.5,-1.5c0,-0.828 0.672,-1.5 1.5,-1.5Z"
                        />
                        <path
                            :fill="isMapInteractionModeAvoidAreasDelete ? '#f00' : '#000'"
                            d="M3,24c1.656,0 3,1.344 3,3c0,1.656 -1.344,3 -3,3c-1.656,0 -3,-1.344 -3,-3c0,-1.656 1.344,-3 3,-3Zm0,1.5c0.828,0 1.5,0.672 1.5,1.5c0,0.828 -0.672,1.5 -1.5,1.5c-0.828,0 -1.5,-0.672 -1.5,-1.5c0,-0.828 0.672,-1.5 1.5,-1.5Z"
                        />
                        <path
                            d="M3,6l0,18"
                            fill="none"
                            :stroke="isMapInteractionModeAvoidAreasDelete ? '#f00' : '#000'"
                            stroke-width="1px"
                        /><path
                            d="M27,10l0,10"
                            fill="none"
                            :stroke="isMapInteractionModeAvoidAreasDelete ? '#f00' : '#000'"
                            stroke-width="1px"
                        /><path
                            d="M24,23l-18,4"
                            fill="none"
                            :stroke="isMapInteractionModeAvoidAreasDelete ? '#f00' : '#000'"
                            stroke-width="1px"
                        /><path
                            d="M24,7l-18,-4"
                            fill="none"
                            :stroke="isMapInteractionModeAvoidAreasDelete ? '#f00' : '#000'"
                            stroke-width="1px"
                        /><path
                            d="M23.044,19.067l-15.588,-9l-0.5,0.866l15.588,9l0.5,-0.866Z"
                            fill="#f00"
                        /><path
                            d="M22.544,10.067l-15.588,9l0.5,0.866l15.588,-9l-0.5,-0.866Z"
                            fill="#f00"
                        /></svg>
                </div>

                <div class="d-flex">
                    <span
                        class="bootstrap-icon pointer ml-4"
                        :title="$t('common:modules.tools.routing.resetSettings')"
                        @click="reset()"
                        @keydown.enter="reset()"
                    >
                        <i class="bi-trash" />
                    </span>
                    <span
                        class="bootstrap-icon pointer ml-4"
                        :title="$t('common:modules.tools.routing.addWaypoint')"
                        @click="addWaypoint({index: waypoints.length -1})"
                        @keydown.enter="addWaypoint({index: waypoints.length -1})"
                    >
                        <i class="bi-plus-lg" />
                    </span>
                </div>
            </div>
        </template>

        <hr>

        <select
            id="routing-directions-preference"
            class="form-select form-select-sm"
            @change="changePreference($event.target.value)"
        >
            <option
                v-for="option in constants.preferenceOptions"
                :id="option"
                :key="'routing-directions-preference-' + option"
                :value="option"
                :selected="option === settings.preference"
                :disabled="isInputDisabled"
            >
                {{ $t('common:modules.tools.routing.directions.preference.' + option) }}
            </option>
        </select>

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

            <div
                v-if="routingDirections"
                id="routing-directions-result-directions"
            >
                <div
                    class="d-flex justify-content-between"
                >
                    <RoutingSpeedProfileIcon
                        :speed-profile-id="settings.speedProfile"
                        fill-color="#000000"
                        :tooltip="$t('common:modules.tools.routing.speedprofiles.' + settings.speedProfile)"
                    />
                    <RoutingDurationDisplay :duration="routingDirections.duration" />
                    <RoutingDistanceDisplay :distance="routingDirections.distance" />
                </div>

                <hr class="mb-0">

                <template v-for="(segment, segmentIndex) of routingDirections.segments">
                    <div
                        :key="'segment_header_' + segmentIndex"
                        class="d-flex pointer step pl-2 py-4"
                        @mouseover="highlightRoute({fromWaypointIndex: segmentIndex, toWaypointIndex: segmentIndex + 1})"
                        @focus="highlightRoute({fromWaypointIndex: segmentIndex, toWaypointIndex: segmentIndex + 1})"
                        @mouseout="unHighlightRoute()"
                        @blur="unHighlightRoute()"
                    >
                        <div
                            class="d-flex"
                            @click="segment.displayDetails = !segment.displayDetails"
                            @keydown.enter="segment.displayDetails = !segment.displayDetails"
                        >
                            <span>{{ segmentIndex === 0 ? 'A' : segmentIndex }}</span>

                            <b>
                                <span
                                    v-if="segment.displayDetails"
                                    class="pointer bootstrap-icon"
                                >
                                    <i class="bi-chevron-down" />
                                </span>
                                <span
                                    v-else
                                    class="pointer bootstrap-icon"
                                >
                                    <i class="bi-chevron-right" />
                                </span>
                            </b>
                        </div>

                        <div
                            class="d-flex flex-column ml-2 w-100"
                            @click="zoomToRoute({fromWaypointIndex: segmentIndex, toWaypointIndex: segmentIndex + 1})"
                            @keydown.enter="zoomToRoute({fromWaypointIndex: segmentIndex, toWaypointIndex: segmentIndex + 1})"
                        >
                            <b>{{ waypoints[segmentIndex].getDisplayName() }}</b>
                            <div
                                class="d-flex justify-content-between"
                            >
                                <RoutingDurationDisplay :duration="segment.duration" />
                                <RoutingDistanceDisplay :distance="segment.distance" />
                            </div>
                        </div>
                    </div>

                    <hr
                        :key="'segment_divider_' + segmentIndex"
                        class="m-0"
                    >

                    <div
                        v-if="segment.displayDetails"
                        :key="'segment_content_' + segmentIndex"
                    >
                        <template
                            v-for="(step, stepIndex) of segment.steps"
                        >
                            <div
                                v-if="stepIndex !== segment.steps.length - 1"
                                :key="'segment_' + segmentIndex + '_step_' + stepIndex"
                                class="ml-4 d-flex flex-column"
                                @mouseover="highlightRoute({coordsIndex: step.getWaypoints()})"
                                @focus="highlightRoute({coordsIndex: step.getWaypoints()})"
                                @mouseout="unHighlightRoute()"
                                @blur="unHighlightRoute()"
                                @click="zoomToRoute({coordsIndex: step.getWaypoints()})"
                                @keydown.enter="zoomToRoute({coordsIndex: step.getWaypoints()})"
                            >
                                <div class="d-flex flex-column pointer step pl-2 py-4">
                                    <span>{{ step.instruction }}</span>
                                    <div
                                        class="d-flex justify-content-between"
                                    >
                                        <RoutingDurationDisplay :duration="step.duration" />
                                        <RoutingDistanceDisplay :distance="step.distance" />
                                    </div>
                                </div>
                                <hr class="w-100 m-0">
                            </div>
                        </template>
                    </div>
                </template>

                <div
                    class="d-flex pointer step pl-2 py-4"
                    @mouseover="highlightRoute({
                        coordsIndex: [
                            waypoints[waypoints.length - 1].getIndexDirectionsLineString() - 1,
                            waypoints[waypoints.length - 1].getIndexDirectionsLineString() + 1
                        ]
                    })"
                    @focus="highlightRoute({
                        coordsIndex: [
                            waypoints[waypoints.length - 1].getIndexDirectionsLineString() - 1,
                            waypoints[waypoints.length - 1].getIndexDirectionsLineString() + 1
                        ]
                    })"
                    @mouseout="unHighlightRoute()"
                    @blur="unHighlightRoute()"
                    @click="zoomToRoute({
                        coordsIndex: [
                            waypoints[waypoints.length - 1].getIndexDirectionsLineString() - 1,
                            waypoints[waypoints.length - 1].getIndexDirectionsLineString() + 1
                        ]
                    })"
                    @keydown.enter="zoomToRoute({
                        coordsIndex: [
                            waypoints[waypoints.length - 1].getIndexDirectionsLineString() - 1,
                            waypoints[waypoints.length - 1].getIndexDirectionsLineString() + 1
                        ]
                    })"
                >
                    <span>B</span>
                    <b class="ml-4">{{ waypoints[waypoints.length - 1].getDisplayName() }}</b>
                </div>

                <hr class="mt-0">

                <RoutingDownload />
            </div>
        </template>
    </div>
</template>

<style lang="scss" scoped>
@import "~variables";
#routing-directions {
  min-width: 350px;
}
.d-flex {
  display: flex;
}
.flex-column {
  flex-direction: column;
}
.justify-content-end {
    justify-content: flex-end;
}
.justify-content-between {
    justify-content: space-between;
}
.align-self-center {
    align-self: center;
}

.m-0 {
    margin-left: 0;
    margin-top: 0;
    margin-right: 0;
    margin-bottom: 0;
}
.mt-0 {
    margin-top: 0;
}
.mb-0 {
    margin-bottom: 0;
}
.mb-2 {
    margin-bottom: 0.5rem;
}

.mr-4 {
    margin-right: 1rem;
}

.ml-2 {
  margin-left: 0.5rem;
}
.ml-4 {
  margin-left: 1rem;
}
.mt-4 {
    margin-top: 1rem;
}
.pointer {
  cursor: pointer;
}

.pl-0 {
    padding-left: 0;
}
.pl-2 {
    padding-left: 0.5rem
}
.pr-0 {
    padding-right: 0;
}
.pt-4 {
    padding-top: 1rem;
}
.pb-4 {
    padding-bottom: 1rem;
}
.py-4 {
    padding-top: 1rem;
    padding-bottom: 1rem;
}

.w-100 {
    width: 100%;
}

.step {
    border-left: 2px solid transparent;
}
.step:hover {
    border-left: 2px solid rgb(255, 44, 0);
}


.opacity-05 {
    opacity: 0.5;
}
</style>
