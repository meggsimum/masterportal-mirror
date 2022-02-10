<script>
import Dropdown from "../../dropdowns/components/DropdownSimple.vue";
import {mapGetters, mapActions, mapMutations} from "vuex";
import getters from "../store/gettersGraphicalSelect";
import mutations from "../store/mutationsGraphicalSelect";
import actions from "../store/actionsGraphicalSelect";
import Draw, {createBox} from "ol/interaction/Draw.js";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import {Circle} from "ol/geom.js";

export default {
    name: "GraphicalSelect",
    components: {
        Dropdown
    },
    props: {
        // The used template element for graphical selection
        selectElement: {
            type: String,
            required: false,
            default: "Dropdown"

        },
        // preselected draw modus
        selectedOption: {
            type: String,
            required: false,
            default: "Box"

        },
        // The keys corresponds to the ol draw modus
        // and the values to the elements text content.
        options: {
            type: Object,
            required: false,
            default: undefined
        },
        // if focus should be set to this component when it is created
        focusOnCreation: {
            type: Boolean,
            default: false,
            required: false
        }
    },
    data () {
        return {
            selectedOptionData: this.selectedOption
        };
    },
    computed: {
        ...mapGetters("GraphicalSelect", Object.keys(getters)),
        optionsValue: function () {
            return this.options ? this.options : {
                "Box": this.$t("common:snippets.graphicalSelect.selectBySquare"),
                "Circle": this.$t("common:snippets.graphicalSelect.selectByCircle"),
                "Polygon": this.$t("common:snippets.graphicalSelect.selectByPolygon")
            };
        }
    },
    watch: {
        selectedOptionData: function () {
            this.createDrawInteraction();
        }
    },

    /**
     * Created hook:
     * @returns {void}
     */
    created () {
        this.$parent.$parent.$on("close", () => {
            this.setActive(false);
            this.resetView();
        });
    },

    /**
     * Mounted hook:
     * @returns {void}
     */
    mounted () {
        this.selectedOptionData = this.selectedOption;
        this.createDomOverlay({id: "circle-overlay", overlay: this.circleOverlay});
        this.createDomOverlay({id: "tooltip-overlay", overlay: this.tooltipOverlay});
        this.createDrawInteraction();
        this.addLayerToMap(this.layer);
        this.checkOptions();
        this.setDefaultSelection(this.selectedOptionData);
    },

    methods: {
        ...mapMutations("GraphicalSelect", Object.keys(mutations)),
        ...mapActions("GraphicalSelect", Object.keys(actions)),
        ...mapMutations("Map", ["addLayerToMap", "removeLayerFromMap"]),
        ...mapActions("Map", ["addInteraction", "removeInteraction"]),
        ...mapActions("Alerting", ["addSingleAlert"]),

        /**
         * Handles (de-)activation of this Tool
         * @param {Boolean} value flag if tool is active
         * @fires Core#RadioTriggerMapRemoveOverlay
         * @todo Replace if removeOverlay is available in vue
         * @returns {void}
         */

        setStatus: function (value) {
            if (value) {
                this.createDrawInteraction();
            }
            else {
                if (typeof this.drawInteraction === "object") {
                    this.drawInteraction.setActive(false);
                }
                Radio.trigger("Map", "removeOverlay", this.circleOverlay);
                Radio.trigger("Map", "removeOverlay", this.tooltipOverlay);
            }
        },

        /**
         * Sets the selection of the dropdown to the default value
         * @returns {void}
         */
        resetGeographicSelection: function () {
            this.selectedOptionData = Object.keys(this.optionsValue)[0];
        },

        /**
         * Check the provided configuration of the graphicalSelect element
         * @returns {void}
         */
        checkOptions: function () {
            if (!this.geographicValues.every(key => Object.keys(this.optionsValue).includes(key))) {
                this.addSingleAlert({
                    "content": i18next.t("common:snippets.graphicalSelect.alert.notSupportedOption") + this.geographicValues
                });
            }

            if (!this.geographicValues.includes(this.selectedOption)) {
                this.addSingleAlert({
                    "content": i18next.t("common:snippets.graphicalSelect.alert.notSupportedSelection") + this.geographicValues
                });
            }

            if (!this.selectionElements.includes(this.selectElement)) {
                this.addSingleAlert({
                    "content": i18next.t("common:snippets.graphicalSelect.alert.notSupportedElement") + this.selectionElements
                });
            }
        },

        /**
         * Used to hide Geometry and Textoverlays if request was unsuccessful for any reason
         * @fires Core#RadioTriggerMapRemoveOverlay
         * @todo Replace if removeOverlay is available in vue
         * @returns {void}
         */
        resetView: function () {
            this.layer.getSource().clear();
            this.removeInteraction(this.draw);
            this.circleOverlay.element.innerHTML = "";
            Radio.trigger("Map", "removeOverlay", this.circleOverlay);
            Radio.trigger("Map", "removeOverlay", this.tooltipOverlay);
        },

        /**
         * Rounds the circle radius.
         * @param {Number} radius circle radius
         * @return {String} the rounded radius
         */
        roundRadius: function (radius) {
            if (radius > 500) {
                return (Math.round(radius / 1000 * 100) / 100) + " km";
            }
            return (Math.round(radius * 10) / 10) + " m";
        },

        /**
         * Calculates the circle radius and places the circle overlay on geometry change.
         * @param {number} radius - circle radius
         * @param {number[]} coords - point coordinate
         * @returns {void}
         */
        showOverlayOnSketch: function (radius, coords) {
            const circleOverlay = this.circleOverlay;

            circleOverlay.element.innerHTML = this.roundRadius(radius);
            circleOverlay.setPosition(coords);
        },

        /**
         * Rounds the given number with the given precision.
         * @param {Number} number to round
         * @param {Number} precision exponent
         * @returns {Number} the rounded number
         */
        precisionRound: function (number, precision) {
            const factor = Math.pow(10, precision);

            return Math.round(number * factor) / factor;
        },

        /**
         * If drawtype == "Circle" set the radius to the circle-geometry
         * @param {*} coordinates array of coordinates to get the radius from
         * @param {*} opt_geom optional existing geometry
         * @returns {*} the optional existing geometry or a circle geometry
         */
        snapRadiusToInterval: function (coordinates, opt_geom) {
            let radius = Math.sqrt(Math.pow(coordinates[1][0] - coordinates[0][0], 2) + Math.pow(coordinates[1][1] - coordinates[0][1], 2));

            radius = this.precisionRound(radius, -1);
            const geometry = opt_geom || new Circle(coordinates[0]);

            geometry.setRadius(radius);

            this.showOverlayOnSketch(radius, coordinates[1]);
            return geometry;
        },

        /**
         * Create the draw interaction Box |Circle |Polygon
         * @todo Replace if removeOverlay and pointermove is available in vue
         * @returns {void}
         */

        createDrawInteraction: function () {
            const geometryFunction = createBox(),
                drawtype = this.selectedOptionData;

            if (this.layer) {
                this.resetView(this.layer);
            }
            else {
                this.layer = new VectorLayer({
                    id: "geometry_selection_layer",
                    name: "Geometry-Selection",
                    source: new VectorSource(),
                    alwaysOnTop: true
                });
            }

            // createBox() and type: 'Circle' return a box instead of a circle geometry
            this.draw = new Draw({
                source: this.layer.getSource(),
                type: drawtype === "Box" ? "Circle" : drawtype,
                geometryFunction: drawtype === "Polygon" ? undefined : (coordinates, opt_geom) => {
                    if (drawtype === "Box") {
                        return geometryFunction(coordinates, opt_geom);
                    }
                    return this.snapRadiusToInterval(coordinates, opt_geom);
                }
            });

            this.addInteraction(this.draw);
            this.setCurrentValue(drawtype);
            this.toggleOverlay({type: drawtype, overlayCircle: this.circleOverlay, overlayTool: this.tooltipOverlay});
            this.setDrawInteractionListener({interaction: this.draw, layer: this.layer, vm: this});
            this.setDrawInteraction(this.draw);
            Radio.trigger("Map", "registerListener", "pointermove", this.showTooltipOverlay.bind(this), this);
        }
    }
};
</script>

<template>
    <form>
        <Dropdown
            v-if="selectElement === 'Dropdown'"
            v-model="selectedOptionData"
            :options="optionsValue"
            :focus-on-creation="focusOnCreation"
        />
    </form>
</template>

<style lang="scss" scoped>
</style>
