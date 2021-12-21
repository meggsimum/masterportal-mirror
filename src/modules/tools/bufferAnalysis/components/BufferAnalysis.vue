<script>
import ToolTemplate from "../../ToolTemplate.vue";
import getComponent from "../../../../utils/getComponent";
import {mapActions, mapGetters, mapMutations} from "vuex";
import getters from "../store/gettersBufferAnalysis";
import mutations from "../store/mutationsBufferAnalysis";
import actions from "../store/actionsBufferAnalysis";
import {ResultType} from "../store/enums";

/**
 * Tool to check if a subset of features associated to a target layer are located within or outside an applied radius to all features of a source layer.
 */
export default {
    name: "BufferAnalysis",
    components: {
        ToolTemplate
    },
    data: () => ({resultTypeEnum: ResultType}),
    computed: {
        ...mapGetters("Tools/BufferAnalysis", Object.keys(getters)),
        ...mapGetters("Map", ["map"]),
        selectedSourceLayer: {
            /**
             * getter for the computed property selectedSourceLayer
             * @returns {Object} the current selected source layer
             */
            get () {
                return this.$store.state.Tools.BufferAnalysis.selectedSourceLayer;
            },
            /**
             * setter for the computed property selectedSourceLayer
             * @param {Object} newLayerSelection the new selected source layer
             * @returns {void}
             */
            set (newLayerSelection) {
                this.applySelectedSourceLayer(newLayerSelection);
            }
        },
        selectedTargetLayer: {
            /**
             * getter for the computed property selectedTargetLayer
             * @returns {Object} the current selected target layer
             */
            get () {
                return this.$store.state.Tools.BufferAnalysis.selectedTargetLayer;
            },
            /**
             * setter for the computed property selectedTargetLayer
             * @param {Object} newLayerSelection the new selected target layer
             * @returns {void}
             */
            set (newLayerSelection) {
                this.applySelectedTargetLayer(newLayerSelection);
            }
        },
        resultType: {
            /**
             * getter for the computed property resultType
             * @returns {ResultType} the current selected result type
             */
            get () {
                return this.$store.state.Tools.BufferAnalysis.resultType;
            },
            /**
             * setter for the computed property resultType
             * @param {ResultType} newType the new selected result type
             * @returns {void}
             */
            set (newType) {
                this.setResultType(newType);
            }
        },
        inputBufferRadius: {
            get () {
                return this.$store.state.Tools.BufferAnalysis.inputBufferRadius;
            },
            set (newRadius) {
                this.setInputBufferRadius(newRadius);
            }
        }
    },
    watch: {
        /**
         * Watches the value of selectedTargetLayer
         * deselects the previous selected target layer if it exists and a new selection is made
         * @param {Object} layer the new selected target layer
         * @param {Object} previous  the previous selected target layer
         * @returns {void}
         */
        selectedTargetLayer (layer, previous) {
            if (previous && layer) {
                previous.setIsSelected(false);
            }
        },
        /**
         * Watches the value of selectedSourceLayer
         * deselects the previous selected source layer if it exists and the new selected layer is falsy
         * @param {Object} layer the new selected source layer
         * @param {Object} previous  the previous selected source layer
         * @returns {void}
         */
        selectedSourceLayer (layer, previous) {
            if (previous && !layer) {
                previous.setIsSelected(false);
            }
        },
        /**
         * Watches the value of inputBufferRadius
         * debounces the input values to prevent unnecessary calculations
         * @param {Number} newBufferRadius the new selected buffer radius
         * @returns {void}
         */
        inputBufferRadius (newBufferRadius) {
            clearTimeout(this.timerId);
            this.setTimerId(setTimeout(() => {
                this.applyBufferRadius(newBufferRadius);
            }, 500));
        },
        /**
         * Sets focus if view becomes active.
         * @param {Boolean} isActive - if active or not
         * @returns {void}
         */
        active (isActive) {
            if (isActive) {
                this.setFocusToFirstControl();
            }
        }
    },
    /**
     * Lifecycle hook:
     * - initializes the JSTS parser
     * - loads available options for selections
     * - adds a "close"-Listener to close the tool.
     * @returns {void}
     */
    created () {
        this.initJSTSParser();
        this.loadSelectOptions();
        this.$on("close", this.close);
    },
    methods: {
        ...mapMutations("Tools/BufferAnalysis", Object.keys(mutations)),
        ...mapActions("Tools/BufferAnalysis", Object.keys(actions)),
        ...mapActions("Map", ["toggleLayerVisibility"]),

        /**
         * Sets the focus to the first control
         * @returns {void}
         */
        setFocusToFirstControl () {
            this.$nextTick(() => {
                if (this.$refs["tool-bufferAnalysis-selectSourceInput"]) {
                    this.$refs["tool-bufferAnalysis-selectSourceInput"].focus();
                }
            });
        },
        /**
         * Sets active to false.
         * @returns {void}
         */
        close () {
            this.removeGeneratedLayers();
            this.resetModule();
            this.setActive(false);
            // TODO replace trigger when ModelList is migrated
            // set the backbone model to active false in modellist for changing css class in menu (menu/desktop/tool/view.toggleIsActiveClass)
            const model = getComponent(this.$store.state.Tools.BufferAnalysis.id);

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
        :initial-width="initialWidth"
    >
        <template #toolBody>
            <div
                v-if="active"
                id="tool-bufferAnalysis"
                class="row"
            >
                <label
                    for="tool-bufferAnalysis-selectSourceInput"
                    class="col-md-5 col-form-label"
                >{{ $t("modules.tools.bufferAnalysis.sourceSelectLabel") }}</label>
                <div class="col-md-7 form-group form-group-sm">
                    <select
                        id="tool-bufferAnalysis-selectSourceInput"
                        ref="tool-bufferAnalysis-selectSourceInput"
                        v-model="selectedSourceLayer"
                        class="font-arial form-select form-select-sm float-start"
                    >
                        <option
                            v-for="layer in selectOptions"
                            :key="layer.get('id')"
                            :value="layer"
                        >
                            {{ layer.get("name") }}
                        </option>
                    </select>
                </div>
                <label
                    for="tool-bufferAnalysis-radiusTextInput"
                    class="col-md-5 col-form-label"
                >{{ $t("modules.tools.bufferAnalysis.rangeLabel") }}</label>

                <div class="col-md-7 form-group form-group-sm">
                    <input
                        id="tool-bufferAnalysis-radiusTextInput"
                        v-model="inputBufferRadius"
                        :disabled="!selectedSourceLayer || selectedTargetLayer"
                        min="0"
                        max="3000"
                        step="10"
                        class="font-arial form-control form-control-sm float-start"
                        type="number"
                    >
                    <input
                        id="tool-bufferAnalysis-radiusRangeInput"
                        v-model="inputBufferRadius"
                        :disabled="!selectedSourceLayer || selectedTargetLayer"
                        min="0"
                        max="3000"
                        step="10"
                        class="font-arial form-control form-control-sm float-start"
                        type="range"
                    >
                </div>

                <label
                    for="tool-bufferAnalysis-resultTypeInput"
                    class="col-md-5 col-form-label"
                >{{ $t("modules.tools.bufferAnalysis.resultTypeLabel") }}</label>

                <div class="col-md-7 form-group form-group-sm">
                    <select
                        id="tool-bufferAnalysis-resultTypeInput"
                        v-model="resultType"
                        class="font-arial form-select form-select-sm float-start"
                        :disabled="!selectedSourceLayer || !bufferRadius || selectedTargetLayer"
                    >
                        <option
                            :value="resultTypeEnum.WITHIN"
                        >
                            {{ $t("modules.tools.bufferAnalysis.overlapping") }}
                        </option>
                        <option
                            :value="resultTypeEnum.OUTSIDE"
                        >
                            {{ $t("modules.tools.bufferAnalysis.notOverlapping") }}
                        </option>
                    </select>
                </div>

                <label
                    for="tool-bufferAnalysis-selectTargetInput"
                    class="col-md-5 col-form-label"
                >{{ $t("modules.tools.bufferAnalysis.targetSelectLabel") }}</label>

                <div class="col-md-7 form-group form-group-sm">
                    <select
                        id="tool-bufferAnalysis-selectTargetInput"
                        v-model="selectedTargetLayer"
                        class="font-arial form-select form-select-sm float-start"
                        :disabled="!selectedSourceLayer || !bufferRadius || selectedTargetLayer"
                    >
                        <option
                            v-for="layer in selectOptions"
                            :key="layer.get('id')"
                            :value="layer"
                        >
                            {{ layer.get("name") }}
                        </option>
                    </select>
                </div>

                <div class="col-md-12 form-group form-group-sm d-grid gap-2">
                    <button
                        id="tool-bufferAnalysis-resetButton"
                        class="float-end btn btn-lgv-grey"
                        :disabled="!selectedSourceLayer"
                        @click="resetModule"
                    >
                        {{ $t("modules.tools.bufferAnalysis.clearButton") }}
                    </button>
                </div>

                <div class="col-md-12 form-group form-group-sm d-grid gap-2">
                    <button
                        id="tool-bufferAnalysis-saveButton"
                        class="float-end btn btn-primary"
                        :disabled="!selectedSourceLayer || !selectedTargetLayer || !bufferRadius"
                        @click="buildUrlFromToolState"
                    >
                        {{ $t("modules.tools.bufferAnalysis.saveButton") }}
                    </button>
                </div>
                <div class="col-md-12 form-group form-group-sm">
                    <input
                        id="tool-bufferAnalysis-savedUrlText"
                        v-model="savedUrl"
                        class="col-md-12 form-control form-control-sm"
                        readonly
                        :hidden="!savedUrl"
                        type="text"
                        @click="copyToClipboard($event.currentTarget)"
                    >
                </div>
            </div>
        </template>
    </ToolTemplate>
</template>

<style lang="scss" scoped>
    // @import "~variables";
    #tool-bufferAnalysis-radiusRangeInput {
        -webkit-appearance: none;
        appearance: none;
        border-radius: 4px;
        border: none;
        height: 12px;
        margin-top: 19px;
        background: #cbcbcb;
    }
    #tool-bufferAnalysis-radiusRangeInput {
        &::-moz-range-thumb, &::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            background-color: #08589e;
            cursor: pointer;
            border-width: 1px;
            border-color: white;
            width: 22px;
            height:22px;
            border-radius: 50%;
        }

    }
</style>
