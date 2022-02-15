<script>
import ToolTemplate from "../../ToolTemplate.vue";
import getComponent from "../../../../utils/getComponent";
import {Pointer} from "ol/interaction.js";
import {getProjections} from "masterportalAPI/src/crs";
import {mapActions, mapGetters, mapMutations} from "vuex";
import getters from "../store/gettersSupplyCoord";
import mutations from "../store/mutationsSupplyCoord";

export default {
    name: "SupplyCoord",
    components: {
        ToolTemplate
    },
    computed: {
        ...mapGetters("Tools/SupplyCoord", Object.keys(getters)),
        ...mapGetters("Map", ["projection", "mouseCoord"]),
        /**
         * Must be a two-way computed property, because it is used as v-model for select-Element, see https://vuex.vuejs.org/guide/forms.html.
         */
        currentSelection: {
            get () {
                return this.$store.state.Tools.SupplyCoord.currentSelection;
            },
            set (newValue) {
                this.setCurrentSelection(newValue);
            }
        }
    },
    watch: {
        /**
         * Sets the active property of the state to the given value.
         * @param {Boolean} value Value deciding whether the tool gets activated or deactivated.
         * @returns {void}
         */
        active (value) {
            this.removePointMarker();

            if (value) {
                this.addPointerMoveHandlerToMap(this.setCoordinates);
                this.createInteraction();
                this.setPositionMapProjection(this.mouseCoord);
                this.changedPosition();
                this.setFocusToFirstControl();
            }
            else {
                this.removePointerMoveHandlerFromMap(this.setCoordinates);
                this.setUpdatePosition(true);
                this.removeInteraction();
            }
        }
    },
    created () {
        console.warn("The tool 'supplyCoord' is deprecated in 3.0.0. Please use 'coordToolkit' instead.");
        this.$on("close", this.close);
    },
    methods: {
        ...mapMutations("Tools/SupplyCoord", Object.keys(mutations)),
        ...mapActions("Tools/SupplyCoord", [
            "checkPosition",
            "changedPosition",
            "copyToClipboard",
            "positionClicked",
            "setCoordinates",
            "newProjectionSelected"
        ]),
        ...mapActions("MapMarker", ["removePointMarker"]),
        ...mapActions("Alerting", ["addSingleAlert"]),
        ...mapActions("Map", {
            addPointerMoveHandlerToMap: "addPointerMoveHandler",
            removePointerMoveHandlerFromMap: "removePointerMoveHandler",
            addInteractionToMap: "addInteraction",
            removeInteractionFromMap: "removeInteraction"
        }),

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
        },
        /**
         * Called if selection of projection changed. Sets the current scprojectionale to state and changes the position.
         * @param {Event} event changed selection event
         * @returns {void}
         */
        selectionChanged (event) {
            this.setCurrentSelection(event.target.value);
            this.newProjectionSelected();
            this.changedPosition(event.target.value);
        },
        /**
         * Stores the projections and adds interaction pointermove to map.
         * @returns {void}
         */
        createInteraction () {
            const pr = getProjections();
            let pointerMove = null;

            this.setProjections(pr);
            this.setMapProjection(this.projection);
            pointerMove = new Pointer(
                {
                    handleMoveEvent: function (evt) {
                        this.checkPosition(evt.coordinate);
                    }.bind(this),
                    handleDownEvent: function (evt) {
                        this.positionClicked(evt);
                    }.bind(this)
                },
                this
            );

            this.setSelectPointerMove(pointerMove);
            this.addInteractionToMap(pointerMove);
        },
        /**
         * Removes the interaction from map.
         * @returns {void}
         */
        removeInteraction () {
            this.removeInteractionFromMap(this.selectPointerMove);
            this.setSelectPointerMove(null);
        },
        /**
         * Closes this tool window by setting active to false
         * @returns {void}
         */
        close () {
            this.setActive(false);

            // TODO replace trigger when Menu is migrated
            // set the backbone model to active false for changing css class in menu (menu/desktop/tool/view.toggleIsActiveClass)
            // else the menu-entry for this tool is always highlighted
            const model = getComponent(this.$store.state.Tools.SupplyCoord.id);

            if (model) {
                model.set("isActive", false);
            }
        },
        /**
         * Returns the label mame depending on the selected projection.
         * @param {String} key in the language files
         * @returns {String} the name of the label
         */
        label (key) {
            const type = this.currentProjectionName === "EPSG:4326" ? "hdms" : "cartesian";

            return "modules.tools.supplyCoord." + type + "." + key;
        }
    }
};
</script>

<template lang="html">
    <ToolTemplate
        :title="$t(name)"
        :icon="glyphicon"
        :active="active"
        :render-to-window="renderToWindow"
        :resizable-window="resizableWindow"
        :deactivate-gfi="deactivateGFI"
    >
        <template #toolBody>
            <div
                v-if="active"
                id="supply-coord"
            >
                <form
                    class="form-horizontal"
                    role="form"
                >
                    <div class="form-group form-group-sm">
                        <label
                            for="coordSystemField"
                            class="col-md-5 col-sm-5 control-label"
                        >{{ $t("modules.tools.supplyCoord.coordSystemField") }}</label>
                        <div class="col-md-7 col-sm-7">
                            <select
                                id="coordSystemField"
                                ref="coordSystemField"
                                v-model="currentSelection"
                                class="font-arial form-control input-sm pull-left"
                                @change="selectionChanged($event)"
                            >
                                <option
                                    v-for="(projection, i) in projections"
                                    :key="i"
                                    :value="projection.name"
                                    :SELECTED="projection.name === currentProjectionName"
                                >
                                    {{ projection.title ? projection.title : projection.name }}
                                </option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group form-group-sm">
                        <label
                            id="coordinatesEastingLabel"
                            for="coordinatesEastingField"
                            class="col-md-5 col-sm-5 control-label"
                        >{{ $t(label("eastingLabel")) }}</label>
                        <div class="col-md-7 col-sm-7">
                            <input
                                id="coordinatesEastingField"
                                v-model="coordinatesEastingField"
                                type="text"
                                class="form-control"
                                readonly
                                contenteditable="false"
                                @click="copyToClipboard($event.currentTarget)"
                            >
                        </div>
                    </div>
                    <div class="form-group form-group-sm">
                        <label
                            id="coordinatesNorthingLabel"
                            for="coordinatesNorthingField"
                            class="col-md-5 col-sm-5 control-label"
                        >{{ $t(label("northingLabel")) }}</label>
                        <div class="col-md-7 col-sm-7">
                            <input
                                id="coordinatesNorthingField"
                                v-model="coordinatesNorthingField"
                                type="text"
                                class="form-control"
                                readonly
                                contenteditable="false"
                                @click="copyToClipboard($event.currentTarget)"
                            >
                        </div>
                    </div>
                </form>
            </div>
        </template>
    </ToolTemplate>
</template>
