<script>
import {mapActions, mapGetters, mapMutations} from "vuex";
import getComponent from "../../../../utils/getComponent";
import ToolTemplate from "../../ToolTemplate.vue";
import getters from "../store/gettersMeasure";
import mutations from "../store/mutationsMeasure";
import actions from "../store/actionsMeasure";
import MeasureInMapTooltip from "./MeasureInMapTooltip.vue";

/**
 * Measurement tool to measure lines and areas in the map.
 */
export default {
    name: "MeasureInMap",
    components: {
        ToolTemplate,
        MeasureInMapTooltip
    },
    computed: {
        ...mapGetters("Tools/Measure", Object.keys(getters)),
        ...mapGetters(["uiStyle"]),
        ...mapGetters("Map", ["layerById", "is3d", "ol2DMap"])
    },
    watch: {
        /**
         * (Re-)Creates or removes draw interaction on opening/closing tool.
         * @param {boolean} value active state of tool
         * @returns {void}
         */
        active (value) {
            if (!value) {
                this.removeIncompleteDrawing();
                this.removeDrawInteraction();
            }
            else {
                this.createDrawInteraction();
                this.setFocusToFirstControl();
            }
        },
        /**
         * Recreates draw interaction on geometry type update.
         * @returns {void}
         */
        selectedGeometry () {
            if (this.active) {
                this.createDrawInteraction();
            }
        }
    },
    created () {
        this.$on("close", this.close);
        this.ol2DMap.addLayer(this.layer);
    },
    mounted () {
        if (this.active) {
            this.createDrawInteraction();
        }
    },
    methods: {
        ...mapMutations("Tools/Measure", Object.keys(mutations)),
        ...mapActions("Tools/Measure", Object.keys(actions)),

        /**
         * Sets the focus to the first control
         * @returns {void}
         */
        setFocusToFirstControl () {
            this.$nextTick(() => {
                if (this.$refs["measure-tool-geometry-select"] && !this.$refs["measure-tool-geometry-select"].disabled) {
                    this.$refs["measure-tool-geometry-select"].focus();
                }
                else if (this.$refs["measure-tool-unit-select"]) {
                    this.$refs["measure-tool-unit-select"].focus();
                }
            });
        },
        /**
         * Sets active to false.
         * @returns {void}
         */
        close () {
            this.setActive(false);
            const model = getComponent(this.id);

            if (model) {
                model.set("isActive", false);
            }
        },
        /**
         * removes the last drawing if it has not been completed
         * @return {void}
         */
        removeIncompleteDrawing () {
            const feature = this.lines[this.featureId] || this.polygons[this.featureId];

            if (feature && feature.get("isBeingDrawn")) {
                const layerSource = this.layer.getSource();

                if (layerSource.getFeatures().length > 0) {
                    const actualFeature = layerSource.getFeatures().slice(-1)[0];

                    layerSource.removeFeature(actualFeature);
                }
            }
        },
        isDefaultStyle () {
            return this.uiStyle !== "SIMPLE" && this.uiStyle !== "TABLE";
        }
    }
};
</script>

<template lang="html">
    <ToolTemplate
        :title="name"
        :icon="icon"
        :active="active"
        :render-to-window="renderToWindow"
        :resizable-window="resizableWindow"
        :deactivate-gfi="deactivateGFI"
    >
        <template #toolBody>
            <div
                v-if="active"
                id="measure"
            >
                <MeasureInMapTooltip />
                <form
                    class="form-horizontal"
                    role="form"
                >
                    <div class="form-group form-group-sm row">
                        <label
                            for="measure-tool-geometry-select"
                            class="col-md-5 col-form-label"
                        >
                            {{ $t("modules.tools.measure.geometry") }}
                        </label>
                        <div class="col-md-7">
                            <select
                                id="measure-tool-geometry-select"
                                ref="measure-tool-geometry-select"
                                class="font-arial form-select form-select-sm float-start"
                                :disabled="is3d"
                                :value="selectedGeometry"
                                @change="setSelectedGeometry($event.target.value)"
                            >
                                <option
                                    v-for="geometryValue in geometryValues"
                                    :key="'measure-tool-geometry-select-' + geometryValue"
                                    :value="geometryValue"
                                >
                                    {{ is3d
                                        ? selectedGeometry
                                        : $t("modules.tools.measure." +
                                            (geometryValue === "LineString" ? "stretch" : "area"))
                                    }}
                                </option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group form-group-sm row">
                        <label
                            for="measure-tool-unit-select"
                            class="col-md-5 col-form-label"
                        >
                            {{ $t("modules.tools.measure.measure") }}
                        </label>
                        <div class="col-md-7">
                            <select
                                id="measure-tool-unit-select"
                                ref="measure-tool-unit-select"
                                class="font-arial form-select form-select-sm float-start"
                                :value="selectedUnit"
                                @change="setSelectedUnit($event.target.value)"
                            >
                                <option
                                    v-for="(unit, i) in currentUnits"
                                    :key="'measure-tool-unit-select-' + i"
                                    :value="i"
                                >
                                    {{ unit }}
                                </option>
                            </select>
                        </div>
                    </div>
                    <div
                        v-if="isDefaultStyle()"
                        class="form-group form-group-sm row"
                    >
                        <div class="col-md-12 inaccuracy-list">
                            {{ $t("modules.tools.measure.influenceFactors") }}
                            <ul>
                                <li>{{ $t("modules.tools.measure.scale") }}</li>
                                <li>{{ $t("modules.tools.measure.resolution") }}</li>
                                <li>{{ $t("modules.tools.measure.screenResolution") }}</li>
                                <li>{{ $t("modules.tools.measure.inputAccuracy") }}</li>
                                <li>{{ $t("modules.tools.measure.measureDistance") }}</li>
                            </ul>
                        </div>
                    </div>
                    <div class="form-group form-group-sm row">
                        <div class="col-md-12">
                            <button
                                id="measure-delete"
                                type="button"
                                class="btn btn-lgv-grey col-md-12"
                                @click="deleteFeatures"
                            >
                                {{ $t('modules.tools.measure.deleteMeasurements') }}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </template>
    </ToolTemplate>
</template>

<style lang="scss" scoped>
@import "~variables";

.inaccuracy-list {
    max-width: 270px;
}
</style>
