<script>
import ToolTemplate from "../../ToolTemplate.vue";
import {mapActions, mapGetters, mapMutations} from "vuex";
import getters from "../store/gettersSearchByCoord";
import actions from "../store/actionsSearchByCoord";
import mutations from "../store/mutationsSearchByCoord";
import state from "../store/stateSearchByCoord";

export default {
    name: "SearchByCoord",
    components: {
        ToolTemplate
    },
    computed: {
        ...mapGetters("Tools/SearchByCoord", Object.keys(getters)),
        eastingNoCoordMessage: function () {
            if (state.currentSelection === "ETRS89") {
                return this.$t("common:modules.tools.searchByCoord.errorMsg.noCoord", {valueKey: this.$t(this.getLabel("eastingLabel"))});
            }
            return this.$t("common:modules.tools.searchByCoord.errorMsg.hdmsNoCoord", {valueKey: this.$t(this.getLabel("eastingLabel"))});
        },
        northingNoCoordMessage: function () {
            if (state.currentSelection === "ETRS89") {
                return this.$t("common:modules.tools.searchByCoord.errorMsg.noCoord", {valueKey: this.$t(this.getLabel("northingLabel"))});
            }
            return this.$t("common:modules.tools.searchByCoord.errorMsg.hdmsNoCoord", {valueKey: this.$t(this.getLabel("northingLabel"))});
        },
        northingNoMatchMessage: function () {
            if (state.currentSelection === "ETRS89") {
                return this.$t("common:modules.tools.searchByCoord.errorMsg.noMatch", {valueKey: this.$t(this.getLabel("northingLabel"))});
            }
            return this.$t("common:modules.tools.searchByCoord.errorMsg.hdmsNoMatch", {valueKey: this.$t(this.getLabel("northingLabel"))});
        },
        eastingNoMatchMessage: function () {
            if (state.currentSelection === "ETRS89") {
                return this.$t("common:modules.tools.searchByCoord.errorMsg.noMatch", {valueKey: this.$t(this.getLabel("eastingLabel"))});
            }
            return this.$t("common:modules.tools.searchByCoord.errorMsg.hdmsNoMatch", {valueKey: this.$t(this.getLabel("eastingLabel"))});
        }
    },
    watch: {
        /**
         * Sets the active property of the state to the given value.
         * @param {Boolean} value Value deciding whether the tool gets activated or deactivated.
         * @returns {void}
         */
        active (value) {
            if (!value) {
                this.removeMarker();
                this.resetErrorMessages();
                this.resetValues();
            }
            else {
                this.setFocusToFirstControl();
            }
        }
    },
    created () {
        console.warn("The tool 'searchByCoord' is deprecated in 3.0.0. Please use 'coordToolkit' instead.");
        this.$on("close", this.close);
        this.setExample();
    },
    methods: {
        ...mapMutations("Tools/SearchByCoord", Object.keys(mutations)),
        ...mapActions("Tools/SearchByCoord", Object.keys(actions)),
        /**
         * Closes this tool window by setting active to false and removes the marker if it was placed.
         * @returns {void}
         */
        close () {
            this.setActive(false);
            // set the backbone model to active false in modellist for changing css class in menu (menu/desktop/tool/view.toggleIsActiveClass)
            const model = Radio.request("ModelList", "getModelByAttributes", {id: this.$store.state.Tools.SearchByCoord.id});

            if (model) {
                model.set("isActive", false);
            }
        },
        /**
         * Sets the focus to the first control
         * @returns {void}
         */
        setFocusToFirstControl () {
            this.$nextTick(() => {
                if (this.$refs.coordSystemField) {
                    this.$refs.coordSystemField.focus();
                }
            });
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
                id="search-by-coord"
            >
                <form
                    class="form-horizontal"
                    role="form"
                >
                    <div class="form-group form-group-sm row">
                        <label
                            class="col-md-5 col-form-label"
                            for="coordSystemField"
                        >{{ $t("modules.tools.searchByCoord.coordinateSystem") }}</label>
                        <div class="col-md-7">
                            <select
                                id="coordSystemField"
                                ref="coordSystemField"
                                class="font-arial form-select form-select-sm float-start"
                                :value="currentSelection"
                                @change="selectionChanged"
                            >
                                <option
                                    v-for="coordinateSystem in coordinateSystems"
                                    :key="coordinateSystem"
                                    :value="coordinateSystem"
                                >
                                    {{ coordinateSystem }}
                                </option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group form-group-sm row">
                        <label
                            id="coordinatesEastingLabel"
                            for="coordinatesEastingField"
                            class="col-md-5 col-form-label"
                        >{{ $t(getLabel("eastingLabel")) }}</label>
                        <div class="col-md-7">
                            <input
                                id="coordinatesEastingField"
                                v-model="coordinatesEasting.value"
                                :class="{ inputError: getEastingError }"
                                type="text"
                                class="form-control form-control-sm"
                                :placeholder="$t('modules.tools.searchByCoord.exampleAcronym') + coordinatesEastingExample"
                                @input="validateInput(coordinatesEasting)"
                            ><p
                                v-if="eastingNoCoord"
                                class="error-text"
                            >
                                {{ eastingNoCoordMessage }}
                            </p>
                            <p
                                v-if="eastingNoMatch"
                                class="error-text"
                            >
                                {{ eastingNoMatchMessage + coordinatesEastingExample }}
                            </p>
                        </div>
                    </div>
                    <div class="form-group form-group-sm row">
                        <label
                            id="coordinatesNorthingLabel"
                            for="coordinatesNorthingField"
                            class="col-md-5 col-form-label"
                        >{{ $t(getLabel("northingLabel")) }}</label>
                        <div class="col-md-7">
                            <input
                                id="coordinatesNorthingField"
                                v-model="coordinatesNorthing.value"
                                :class="{ inputError: getNorthingError }"
                                type="text"
                                class="form-control form-control-sm"
                                :placeholder="$t('modules.tools.searchByCoord.exampleAcronym') + coordinatesNorthingExample"
                                @input="validateInput(coordinatesNorthing)"
                            ><p
                                v-if="northingNoCoord"
                                class="error-text"
                            >
                                {{ northingNoCoordMessage }}
                            </p>
                            <p
                                v-if="northingNoMatch"
                                class="error-text"
                            >
                                {{ northingNoMatchMessage + coordinatesNorthingExample }}
                            </p>
                        </div>
                    </div>
                    <div class="form-group form-group-sm row">
                        <div class="col-12 d-grid gap-2">
                            <button
                                class="btn btn-primary"
                                :disabled="getEastingError || getNorthingError || !coordinatesEasting.value || !coordinatesNorthing.value"
                                type="button"
                                @click="searchCoordinate(coordinatesEasting, coordinatesNorthing)"
                            >
                                {{ $t("common:modules.tools.searchByCoord.search") }}
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
#search-by-coord {
    @media (min-width: 768px) {
        width: 350px;
    }
}
.error-text {
    font-size: 100%;
    color: #a94442;
}
.inputError {
    border: 1px solid #a94442;
}
</style>
