<script>
import ToolTemplate from "../../ToolTemplate.vue";
import getComponent from "../../../../utils/getComponent";
import {mapGetters, mapActions, mapMutations} from "vuex";
import getters from "../store/gettersFeatureMeasure";
import mutations from "../store/mutationsFeatureMeasure";
import actions from "../store/actionsFeatureMeasure";
import {getDistance} from "ol/sphere";
import {transform as transformCoord} from "@masterportal/masterportalapi/src/crs";

export default {
    name: "FeatureMeasure",
    components: {
        ToolTemplate
    },
    computed: {
        ...mapGetters("Tools/FeatureMeasure", Object.keys(getters))
    },
    created () {
        this.$on("close", this.close);
    },
    mounted () {
        this.initialize();
    },
    methods: {
        ...mapActions("Tools/FeatureMeasure", Object.keys(actions)),
        ...mapMutations("Tools/FeatureMeasure", Object.keys(mutations)),
        close () {
            this.reset();
            this.setActive(false);

            const model = getComponent(this.id);

            if (model) {
                model.set("isActive", false);
            }
        },
        reset () {
            this.setFeatureA(null);
            this.setFeatureB(null);
            this.setDistance(0);
        },
        start () {
            const coordA = this.featureA.getGeometry().flatCoordinates,
                coordB = this.featureB.getGeometry().flatCoordinates,
                transformedCoordA = transformCoord("EPSG:25832", "EPSG:4326", coordA),
                transformedCoordB = transformCoord("EPSG:25832", "EPSG:4326", coordB);

            // console.log(coordA, transformedCoordA);
            this.setDistance(Math.round(getDistance(transformedCoordA, transformedCoordB)));
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
                id="featureMeasure"
            >
                <div class="col-md-7">
                    <div v-if="featureA">
                        {{ featureA.id_ }}
                    </div>
                    <div v-if="featureB">
                        {{ featureB.id_ }}
                    </div>
                </div>
                <form
                    class="form-horizontal"
                    role="form"
                >
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
                                    v-for="(unit, i) in lineStringUnits"
                                    :key="'measure-tool-unit-select-' + i"
                                    :value="i"
                                >
                                    {{ unit }}
                                </option>
                            </select>
                        </div>
                    </div>
                    <div class="col-md-7">
                        <div>
                            {{ $t("modules.tools.featureMeasure.distance") }}: {{ lineStringUnits[selectedUnit] === "m" ? distance : distance / 1000 }} {{ lineStringUnits[selectedUnit] }}
                        </div>
                    </div>
                    <div class="form-group form-group-sm row">
                        <div class="col-md-12">
                            <button
                                type="button"
                                class="btn btn-lgv-grey col-md-12"
                                @click="start()"
                            >
                                Start
                            </button>
                            <button
                                type="button"
                                class="btn btn-lgv-grey col-md-12"
                                @click="reset()"
                            >
                                Reset
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

</style>
