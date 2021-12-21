<script>
import * as constants from "../store/constantsDraw";
import DownloadItem from "../components/DownloadItem.vue";
import DrawItemFeaturesFilter from "./DrawItemFeaturesFilter.vue";

import getComponent from "../../../../utils/getComponent";

import {mapActions, mapGetters, mapMutations} from "vuex";
import ToolTemplate from "../../ToolTemplate.vue";

export default {
    name: "DrawItem",
    components: {
        DrawItemFeaturesFilter,
        DownloadItem,
        ToolTemplate
    },
    data () {
        return {
            mapElement: document.getElementById("map"),
            storePath: this.$store.state.Tools.Draw,
            constants: constants,
            drawing: true
        };
    },
    computed: {
        ...mapGetters("Tools/Draw", constants.keyStore.getters),
        /**
         * Enables or disables all the select or input elements depending on if the currentInteraction is "draw".
         * @returns {Boolean} currentInteraction === "draw": return false and activate the HTML elements, else: return true and deactivate the HTML elements.
         */
        drawHTMLElements () {
            // remember: true means disable, false means enable
            return !(this.currentInteraction === "draw");
        },
        /**
         * Enables or disables the select- or input-boxes depending on the state of currentInteraction and selectedFeature.
         * @returns {Boolean} false activates the elements, true deactivates the elements
         */
        drawHTMLElementsModifyFeature () {
            if (this.selectedFeature !== null && this.currentInteraction === "modify") {
                return false;
            }
            // remember: true means disable, false means enable
            return !(this.currentInteraction === "draw");
        },
        /**
         * Enables the input for the radius if the circleMethod is "defined", for interaction "modify" the rule of drawHTMLElementsModifyFeature takes place.
         * @returns {Boolean} returns true to disable the input, false to enable the input
         */
        drawCircleMethods () {
            if (this.currentInteraction === "draw") {
                // remember: true means disable, false means enable
                return !(this.styleSettings?.circleMethod === "defined");
            }
            return this.drawHTMLElementsModifyFeature;
        },

        circleRadiusComputed: {
            /**
             * getter for the computed property circleRadius of the current drawType
             * @info the internal representation of circleRadius is always in meters
             * @returns {Number} the current radius
             */
            get () {
                if (this.styleSettings?.unit === "km") {
                    return this.styleSettings?.circleRadius / 1000;
                }
                return this.styleSettings?.circleRadius;
            },
            /**
             * setter for the computed property circleRadius of the current drawType
             * @info the internal representation of circleRadius is always in meters
             * @param {Number} value the value to set the target to
             * @returns {void}
             */
            set (value) {
                if (this.styleSettings?.unit === "km") {
                    this.setCircleRadius(parseInt(value, 10) * 1000);
                }
                else {
                    this.setCircleRadius(parseInt(value, 10));
                }
            }
        },
        circleOuterRadiusComputed: {
            /**
             * getter for the computed property circleOuterRadius of the current drawType
             * @info the internal representation of circleOuterRadius is always in meters
             * @returns {Number} the current radius
             */
            get () {
                if (this.styleSettings?.unit === "km") {
                    return this.styleSettings?.circleOuterRadius / 1000;
                }
                return this.styleSettings?.circleOuterRadius;
            },
            /**
             * setter for the computed property circleOuterRadius of the current drawType
             * @info the internal representation of circleOuterRadius is always in meters
             * @param {Number} value the value to set the target to
             * @returns {void}
             */
            set (value) {
                if (this.styleSettings?.unit === "km") {
                    this.setCircleOuterRadius(parseInt(value, 10) * 1000);
                }
                else {
                    this.setCircleOuterRadius(parseInt(value, 10));
                }
            }
        },
        /**
         * computed property for circleMethod of the current drawType
         * @returns {String} "defined" or "interactive"
         */
        circleMethodComputed () {
            return this.styleSettings?.circleMethod;
        },
        /**
         * computed property for the unit of the current drawType
         * @returns {String} "m" or "km"
         */
        unitComputed () {
            return this.styleSettings?.unit;
        },
        /**
         * computed property for the text of the current drawType
         * @returns {String} the current text
         */
        textComputed () {
            return this.styleSettings?.text;
        },
        /**
         * computed property for the font-size of the current drawType
         * @returns {Number} the current font-size as number
         */
        fontSizeComputed () {
            return this.styleSettings?.fontSize;
        },
        /**
         * computed property for the font family of the current drawType
         * @returns {Number} the current font family
         */
        fontComputed () {
            return this.styleSettings?.font;
        },
        /**
         * computed property for the stroke width of the current drawType
         * @returns {Number} the current width as number
         */
        strokeWidthComputed () {
            return this.styleSettings?.strokeWidth;
        },
        /**
         * computed property for the opacity linked to color of the current drawType
         * @returns {Number} the current opacity as css range [0..1] - this is the value, not the caption (!)
         */
        opacityComputed () {
            return this.styleSettings?.opacity;
        },
        /**
         * computed property for the opacity linked to colorContour of the current drawType
         * @returns {Number} the current opacity (of colorContour) as css range [0..1] - this is the value, not the caption (!)
         */
        opacityContourComputed () {
            return this.styleSettings?.opacityContour;
        },
        /**
         * computed property for the color of the current drawType
         * @returns {Number[]} the current color as array of numbers - e.g. [0, 0, 0, 1]
         */
        colorContourComputed () {
            return this.styleSettings?.colorContour;
        },
        /**
         * computed property for the outer color of a double circle
         * @returns {Number[]} the current color as array of numbers - e.g. [0, 0, 0, 1]
         */
        outerColorContourComputed () {
            return this.styleSettings?.outerColorContour;
        },
        /**
         * computed property for the colorContour of the current drawType
         * @returns {Number[]} the current color as array of numbers - e.g. [0, 0, 0, 1]
         */
        colorComputed () {
            return this.styleSettings?.color;
        },
        /**
         * computed property of the label for the normal colorContour - in case this is a double circle
         * @returns {String} the label to use for the normal colorContour
         */
        colorContourLabelComputed () {
            if (this.drawType.id === "drawDoubleCircle" && this.currentInteraction !== "modify") {
                return this.$i18n.i18next.t("common:modules.tools.draw.innerColorContour");
            }
            return this.$i18n.i18next.t("common:modules.tools.draw.colorContour");
        },
        /**
         * computed property of the label for the normal innerRadius - in case this is a double circle
         * @returns {String} the label to use for the normal innerRadius
         */
        innerRadiusLabelComputed () {
            if (this.drawType.id === "drawDoubleCircle" && this.currentInteraction !== "modify") {
                return this.$i18n.i18next.t("common:modules.tools.draw.innerRadius");
            }
            return this.$i18n.i18next.t("common:modules.tools.draw.radius");
        },

        /**
         * Checks if the filter list is valid.
         * @returns {boolean} True if valid.
         */
        isFilterListValid () {
            if (this.filterList === null) {
                return false;
            }
            if (!Array.isArray(this.filterList) || !this.filterList.length) {
                console.warn(this.filterList, "Die Konfiguration für den Filter ist nicht valide.");
                return false;
            }
            return true;
        },

        /**
         * Checks if there are visible features from draw tool.
         *
         * @returns {Boolean} True if there are visible features otherwise false.
         */
        isFromDrawTool () {
            const visibleFeatures = this.layer.getSource().getFeatures().filter(feature => feature.get("fromDrawTool") && feature.get("isVisible"));

            return visibleFeatures.length > 0;
        },

        /**
         * Returns the features are setted from drawTool
         * @returns {module:ol/Feature[]} The features from drawTool
         */
        featuresFromDrawTool () {
            return this.layer.getSource().getFeatures().filter(feature => feature.get("fromDrawTool"));
        }

        // NOTE: A nice feature would be that, similar to the interactions with the map, the Undo and Redo Buttons are disabled if not useable.
    },
    watch: {
        /**
          * Starts the action for processes, if the tool is be activated (active === true).
          * @param {Boolean} value Value deciding whether the tool gets activated or deactivated.
          * @returns {void}
         */
        active (value) {
            if (value) {
                this.setActive(value);
                this.setCanvasCursorByInteraction(this.currentInteraction);
                this.setFocusToFirstControl();
            }
            else {
                this.resetModule();
                this.resetCanvasCursor();
            }
        }
    },
    mounted () {
        if (this.active) {
            this.setCanvasCursorByInteraction(this.currentInteraction);
        }
    },
    created () {
        const channel = Radio.channel("Draw");

        channel.reply({
            "getLayer": function () {
                return this.layer;
            },
            "downloadWithoutGUI": payload => this.downloadFeaturesWithoutGUI(payload)
        });
        channel.on({
            "initWithoutGUI": prmObject => this.initializeWithoutGUI(prmObject),
            "deleteAllFeatures": () => this.clearLayer(),
            "editWithoutGUI": () => this.editFeaturesWithoutGUI(),
            "cancelDrawWithoutGUI": () => this.cancelDrawWithoutGUI(),
            "downloadViaRemoteInterface": geomType => this.downloadViaRemoteInterface(geomType)
        });

        Radio.trigger("RemoteInterface", "postMessage", {"initDrawTool": true});
        this.$on("close", this.close);
    },
    methods: {
        ...mapMutations("Tools/Draw", constants.keyStore.mutations),
        ...mapActions("Tools/Draw", constants.keyStore.actions),
        ...mapActions("Alerting", ["addSingleAlert"]),

        /**
         * Sets the focus to the first control
         * @returns {void}
         */
        setFocusToFirstControl () {
            this.$nextTick(() => {
                if (this.$refs["tool-draw-drawType"]) {
                    this.$refs["tool-draw-drawType"].focus();
                }
            });
        },
        /**
         * checks if both given arrays have the same number at their first 3 positions
         * note: the opacity (4th number) will be ignored - this is only about color
         * @param {Number[]} a a "color"-array e.g. white: [255, 255, 255, 1] or [255, 255, 255]
         * @param {Number[]} b another "color"-array to compare with
         * @returns {Boolean} true: the values at the first 3 positions of the given color arrays are identical
         */
        isEqualColorArrays (a, b) {
            if (Array.isArray(a) && Array.isArray(b) && a.length >= 3 && b.length >= 3) {
                return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
            }
            return false;
        },
        close () {
            this.resetModule();
            // The value "isActive" of the Backbone model is also set to false to change the CSS class in the menu (menu/desktop/tool/view.toggleIsActiveClass)
            const model = getComponent(this.storePath.id);

            if (model) {
                model.set("isActive", false);
            }
        },
        resetCanvasCursor () {
            this.mapElement.style.cursor = "";
            this.mapElement.onmousedown = undefined;
            this.mapElement.onmouseup = undefined;
        },
        setCanvasCursor (cursorType) {
            this.mapElement.style.cursor = cursorType;
            this.mapElement.onmousedown = this.onMouseDown;
            this.mapElement.onmouseup = this.onMouseUp;
        },
        setCanvasCursorByInteraction (interaction) {
            if (interaction === "modify" || interaction === "delete") {
                this.setCanvasCursor("pointer");
            }
            else {
                this.setCanvasCursor("crosshair");
            }
        },
        onMouseDown () {
            if (this.mapElement.style.cursor === "pointer") {
                this.mapElement.style.cursor = "grabbing";
            }
        },
        onMouseUp () {
            if (this.mapElement.style.cursor === "grabbing") {
                this.mapElement.style.cursor = "pointer";
            }
        },
        getIconLabelKey (option) {
            if (option.id) {
                if (this.$i18n.i18next.exists(option.id)) {
                    return option.id;
                }
                else if (this.$i18n.i18next.exists("common:modules.tools.draw.iconList." + option.id)) {
                    return "common:modules.tools.draw.iconList." + option.id;
                }
                else if (option.caption) {
                    return option.caption;
                }
                return option.id;
            }
            return "noName";
        }
    }
};

</script>

<template lang="html">
    <ToolTemplate
        :title="$t(name)"
        :icon="icon"
        :active="active && !withoutGUI"
        :render-to-window="renderToWindow"
        :resizable-window="resizableWindow"
        :initial-width="initialWidth"
        :initial-width-mobile="initialWidthMobile"
        :deactivate-gfi="deactivateGFI"
    >
        <template #toolBody>
            <select
                id="tool-draw-drawType"
                ref="tool-draw-drawType"
                class="form-select form-select-sm"
                :disabled="drawHTMLElements"
                @change="setDrawType"
            >
                <option
                    v-for="option in constants.drawTypeOptions"
                    :id="option.id"
                    :key="'draw-drawType-' + option.id"
                    :value="option.geometry"
                    :selected="option.id === drawType.id"
                >
                    {{ $t("common:modules.tools.draw." + option.id) }}
                </option>
            </select>
            <hr>
            <template
                v-if="isFromDrawTool && isFilterListValid"
            >
                <DrawItemFeaturesFilter
                    :filter-list="filterList"
                    :features="featuresFromDrawTool"
                />
            </template>
            <form
                class="form-horizontal"
                role="form"
                @submit.prevent
            >
                <div
                    v-if="drawType.id === 'drawCircle' && currentInteraction !== 'modify'"
                    class="form-group form-group-sm row"
                >
                    <label
                        class="col-md-5 col-form-label"
                        for="tool-draw-circleMethod"
                    >
                        {{ $t("common:modules.tools.draw.method") }}
                    </label>
                    <div class="col-md-7">
                        <select
                            id="tool-draw-circleMethod"
                            class="form-select form-select-sm"
                            :disabled="drawHTMLElementsModifyFeature"
                            @change="setCircleMethod"
                        >
                            <option
                                value="interactive"
                                :selected="circleMethodComputed === 'interactive'"
                            >
                                {{ $t("common:modules.tools.draw.interactive") }}
                            </option>
                            <option
                                value="defined"
                                :selected="circleMethodComputed === 'defined'"
                            >
                                {{ $t("common:modules.tools.draw.defined") }}
                            </option>
                        </select>
                    </div>
                </div>
                <div
                    v-if="drawType.id === 'drawCircle' || drawType.id === 'drawDoubleCircle'"
                    class="form-group form-group-sm row"
                >
                    <label
                        class="col-md-5 col-form-label"
                        for="tool-draw-circleRadius"
                    >
                        {{ innerRadiusLabelComputed }}
                    </label>
                    <div class="col-md-7">
                        <input
                            id="tool-draw-circleRadius"
                            v-model="circleRadiusComputed"
                            class="form-control form-control-sm"
                            :style="{borderColor: innerBorderColor}"
                            type="number"
                            step="1"
                            :placeholder="$t('common:modules.tools.draw.doubleCirclePlaceholder')"
                            :disabled="drawCircleMethods"
                            min="0"
                        >
                    </div>
                </div>
                <div
                    v-if="drawType.id === 'drawDoubleCircle'"
                    class="form-group form-group-sm row"
                >
                    <label
                        class="col-md-5 col-form-label"
                        for="tool-draw-circleOuterRadius"
                    >
                        {{ $t("common:modules.tools.draw.outerRadius") }}
                    </label>
                    <div class="col-md-7">
                        <input
                            id="tool-draw-circleOuterRadius"
                            v-model="circleOuterRadiusComputed"
                            class="form-control form-control-sm"
                            :style="{borderColor: outerBorderColor}"
                            type="number"
                            :placeholder="$t('common:modules.tools.draw.doubleCirclePlaceholder')"
                            :disabled="drawCircleMethods"
                            min="0"
                        >
                    </div>
                </div>
                <div
                    v-if="drawType.id === 'drawCircle' || drawType.id === 'drawDoubleCircle'"
                    class="form-group form-group-sm row"
                >
                    <label
                        class="col-md-5 col-form-label"
                        for="tool-draw-circleUnit"
                    >
                        {{ $t("common:modules.tools.draw.unit") }}
                    </label>
                    <div class="col-md-7">
                        <select
                            id="tool-draw-circleUnit"
                            class="form-select form-select-sm"
                            :disabled="drawHTMLElementsModifyFeature"
                            @change="setUnit"
                        >
                            <option
                                v-for="option in constants.unitOptions"
                                :key="'draw-fontSize-' + option.value"
                                :selected="option.value === unitComputed"
                                :value="option.value"
                            >
                                {{ option.caption }}
                            </option>
                        </select>
                    </div>
                </div>
                <div
                    v-if="drawType.id === 'writeText'"
                    class="form-group form-group-sm row"
                >
                    <label
                        class="col-md-5 col-form-label"
                        for="tool-draw-text"
                    >
                        {{ $t("common:modules.tools.draw.text") }}
                    </label>
                    <div class="col-md-7">
                        <input
                            id="tool-draw-text"
                            class="form-control form-control-sm"
                            type="text"
                            :placeholder="$t('common:modules.tools.draw.clickToPlaceText')"
                            :disabled="drawHTMLElementsModifyFeature"
                            :value="textComputed"
                            @input="setText"
                        >
                    </div>
                </div>
                <div
                    v-if="drawType.id === 'writeText'"
                    class="form-group form-group-sm row"
                >
                    <label
                        class="col-md-5 col-form-label"
                        for="tool-draw-fontSize"
                    >
                        {{ $t("common:modules.tools.draw.fontSize") }}
                    </label>
                    <div class="col-md-7">
                        <select
                            id="tool-draw-fontSize"
                            class="form-select form-select-sm"
                            :disabled="drawHTMLElementsModifyFeature"
                            @change="setFontSize"
                        >
                            <option
                                v-for="option in constants.fontSizeOptions"
                                :key="'draw-fontSize-' + option.value"
                                :selected="option.value === fontSizeComputed"
                                :value="option.value"
                            >
                                {{ option.caption }}
                            </option>
                        </select>
                    </div>
                </div>
                <div
                    v-if="drawType.id === 'writeText'"
                    class="form-group form-group-sm row"
                >
                    <label
                        class="col-md-5 col-form-label"
                        for="tool-draw-font"
                    >
                        {{ $t("common:modules.tools.draw.fontName") }}
                    </label>
                    <div class="col-md-7">
                        <select
                            id="tool-draw-font"
                            class="form-select form-select-sm"
                            :disabled="drawHTMLElementsModifyFeature"
                            @change="setFont"
                        >
                            <option
                                v-for="option in constants.fontOptions"
                                :key="'draw-font-' + option.value"
                                :value="option.value"
                                :selected="option.value === fontComputed"
                            >
                                {{ option.caption }}
                            </option>
                        </select>
                    </div>
                </div>
                <div
                    v-if="drawType.id === 'drawSymbol'"
                    class="form-group form-group-sm row"
                >
                    <label
                        class="col-md-5 col-form-label"
                        for="tool-draw-symbol"
                    >
                        {{ $t("common:modules.tools.draw.symbol") }}
                    </label>
                    <div class="col-md-7">
                        <select
                            id="tool-draw-symbol"
                            class="form-select form-select-sm"
                            :disabled="drawHTMLElementsModifyFeature"
                            @change="setSymbol"
                        >
                            <!-- NOTE: caption of the iconList is deprecated in 3.0.0 -->
                            <option
                                v-for="option in iconList"
                                :key="'draw-icon-' + (option.id ? option.id : option.caption)"
                                :value="(option.id ? option.id : option.caption)"
                                :selected="option.id === symbol.id"
                            >
                                {{ $t(getIconLabelKey(option)) }}
                            </option>
                        </select>
                    </div>
                </div>
                <div
                    v-if="drawType.id !== 'drawSymbol' && drawType.id !== 'writeText'"
                    class="form-group form-group-sm row"
                >
                    <label
                        class="col-md-5 col-form-label"
                        for="tool-draw-strokeWidth"
                    >
                        {{ $t("common:modules.tools.draw.lineWidth") }}
                    </label>
                    <div class="col-md-7">
                        <select
                            id="tool-draw-strokeWidth"
                            class="form-select form-select-sm"
                            :disabled="drawHTMLElementsModifyFeature"
                            @change="setStrokeWidth"
                        >
                            <option
                                v-for="option in constants.strokeOptions"
                                :key="'draw-stroke-' + option.value"
                                :value="option.value"
                                :selected="option.value === strokeWidthComputed"
                            >
                                {{ option.caption }}
                            </option>
                        </select>
                    </div>
                </div>
                <div
                    v-if="drawType.id !== 'drawLine' && drawType.id !== 'drawCurve'&& drawType.id !== 'drawSymbol'"
                    class="form-group form-group-sm row"
                >
                    <label
                        class="col-md-5 col-form-label"
                        for="tool-draw-opacity"
                    >
                        {{ $t("common:modules.tools.draw.transparency") }}
                    </label>
                    <div class="col-md-7">
                        <select
                            id="tool-draw-opacity"
                            :key="`tool-draw-opacity-select`"
                            class="form-select form-select-sm"
                            :disabled="drawHTMLElementsModifyFeature"
                            @change="setOpacity"
                        >
                            <option
                                v-for="option in constants.transparencyOptions"
                                :key="'draw-opacity-option-' + option.value"
                                :selected="option.value === opacityComputed"
                                :value="option.value"
                            >
                                {{ option.caption }}
                            </option>
                        </select>
                    </div>
                </div>
                <div
                    v-if="drawType.id === 'drawLine' || drawType.id === 'drawCurve'"
                    class="form-group form-group-sm row"
                >
                    <label
                        class="col-md-5 col-form-label"
                        for="tool-draw-opacityContour"
                    >
                        {{ $t("common:modules.tools.draw.transparencyOutline") }}
                    </label>
                    <div class="col-md-7">
                        <select
                            id="tool-draw-opacityContour"
                            :key="`tool-draw-opacityContour-select`"
                            class="form-select form-select-sm"
                            :disabled="drawHTMLElementsModifyFeature"
                            @change="setOpacityContour"
                        >
                            <option
                                v-for="option in constants.transparencyOptions.slice(0, constants.transparencyOptions.length -1)"
                                :key="'draw-opacityContour-option-' + option.value"
                                :selected="option.value === opacityContourComputed"
                                :value="option.value"
                            >
                                {{ option.caption }}
                            </option>
                        </select>
                    </div>
                </div>
                <div
                    v-if="drawType.id !== 'drawSymbol' && drawType.id !== 'writeText'"
                    class="form-group form-group-sm row"
                >
                    <label
                        class="col-md-5 col-form-label"
                        for="tool-draw-colorContour"
                    >
                        {{ colorContourLabelComputed }}
                    </label>
                    <div class="col-md-7">
                        <select
                            id="tool-draw-colorContour"
                            class="form-select form-select-sm"
                            :disabled="drawHTMLElementsModifyFeature"
                            @change="setColorContour"
                        >
                            <option
                                v-for="option in constants.colorContourOptions"
                                :key="'draw-colorContour-' + option.color"
                                :value="option.value"
                                :selected="isEqualColorArrays(option.value, colorContourComputed)"
                            >
                                {{ $t("common:colors." + option.color) }}
                            </option>
                        </select>
                    </div>
                </div>
                <div
                    v-if="drawType.id === 'drawDoubleCircle'"
                    class="form-group form-group-sm row"
                >
                    <label
                        class="col-md-5 col-form-label"
                        for="tool-draw-outerColorContour"
                    >
                        {{ $t("common:modules.tools.draw.outerColorContour") }}
                    </label>
                    <div class="col-md-7">
                        <select
                            id="tool-draw-outerColorContour"
                            class="form-select form-select-sm"
                            :disabled="drawHTMLElementsModifyFeature"
                            @change="setOuterColorContour"
                        >
                            <option
                                v-for="option in constants.colorContourOptions"
                                :key="'draw-outerColorContour-' + option.color"
                                :value="option.value"
                                :selected="isEqualColorArrays(option.value, outerColorContourComputed)"
                            >
                                {{ $t("common:colors." + option.color) }}
                            </option>
                        </select>
                    </div>
                </div>
                <div
                    v-if="drawType.id === 'drawSymbol' && symbol.id === 'iconPoint'"
                    class="form-group form-group-sm row"
                >
                    <label
                        class="col-md-5 col-form-label"
                        for="tool-draw-pointColor"
                    >
                        {{ $t("common:modules.tools.draw.color") }}
                    </label>
                    <div class="col-md-7">
                        <select
                            id="tool-draw-pointColor"
                            class="form-select form-select-sm"
                            :disabled="drawHTMLElementsModifyFeature"
                            @change="setColor"
                        >
                            <option
                                v-for="option in constants.colorOptions"
                                :key="'draw-color-' + option.color"
                                :value="option.value"
                                :selected="isEqualColorArrays(option.value, colorComputed)"
                            >
                                {{ $t("common:colors." + option.color) }}
                            </option>
                        </select>
                    </div>
                </div>
                <div
                    v-if="drawType.id !== 'drawLine' && drawType.id !== 'drawCurve' && drawType.id !== 'drawSymbol'"
                    class="form-group form-group-sm row"
                >
                    <label
                        class="col-md-5 col-form-label"
                        for="tool-draw-pointColor"
                    >
                        {{ $t("common:modules.tools.draw.color") }}
                    </label>
                    <div class="col-md-7">
                        <select
                            id="tool-draw-pointColor"
                            class="form-select form-select-sm"
                            :disabled="drawHTMLElementsModifyFeature"
                            @change="setColor"
                        >
                            <option
                                v-for="option in constants.colorOptions"
                                :key="'draw-color-' + option.color"
                                :value="option.value"
                                :selected="isEqualColorArrays(option.value, colorComputed)"
                            >
                                {{ $t("common:colors." + option.color) }}
                            </option>
                        </select>
                    </div>
                </div>
            </form>
            <hr>
            <div
                class="form-horizontal"
                role="form"
            >
                <div class="form-group form-group-sm row">
                    <div class="col-12 d-grid gap-2">
                        <button
                            id="tool-draw-drawInteraction"
                            class="btn btn-sm"
                            :class="currentInteraction === 'draw' ? 'btn-primary' : 'btn-lgv-grey'"
                            :disabled="currentInteraction === 'draw'"
                            @click="toggleInteraction('draw'); setCanvasCursorByInteraction('draw')"
                        >
                            <span class="bootstrap-icon">
                                <i class="bi-pencil-fill" />
                            </span>
                            {{ $t("common:modules.tools.draw.button.draw") }}
                        </button>
                    </div>
                </div>
                <div class="form-group form-group-sm row">
                    <div class="col-12 d-grid gap-2">
                        <button
                            id="tool-draw-undoInteraction"
                            class="btn btn-sm btn-lgv-grey"
                            @click="undoLastStep"
                        >
                            <span class="bootstrap-icon">
                                <i class="bi-arrow-counterclockwise" />
                            </span>
                            {{ $t("common:modules.tools.draw.button.undo") }}
                        </button>
                    </div>
                </div>
                <div class="form-group form-group-sm row">
                    <div class="col-12 d-grid gap-2">
                        <button
                            id="tool-draw-redoInteraction"
                            class="btn btn-sm btn-lgv-grey"
                            @click="redoLastStep"
                        >
                            <span class="bootstrap-icon">
                                <i class="bi-arrow-clockwise" />
                            </span>
                            {{ $t("common:modules.tools.draw.button.redo") }}
                        </button>
                    </div>
                </div>
                <div class="form-group form-group-sm row">
                    <div class="col-12 d-grid gap-2">
                        <button
                            id="tool-draw-editInteraction"
                            class="btn btn-sm"
                            :class="currentInteraction === 'modify' ? 'btn-primary' : 'btn-lgv-grey'"
                            :disabled="currentInteraction === 'modify'"
                            @click="toggleInteraction('modify'); setCanvasCursorByInteraction('modify')"
                        >
                            <span class="bootstrap-icon">
                                <i class="bi-wrench" />
                            </span>
                            {{ $t("common:modules.tools.draw.button.edit") }}
                        </button>
                    </div>
                </div>
                <div class="form-group form-group-sm row">
                    <div class="col-12 d-grid gap-2">
                        <button
                            id="tool-draw-deleteInteraction"
                            class="btn btn-sm"
                            :class="currentInteraction === 'delete' ? 'btn-primary' : 'btn-lgv-grey'"
                            :disabled="currentInteraction === 'delete'"
                            @click="toggleInteraction('delete'); setCanvasCursorByInteraction('delete')"
                        >
                            <span class="bootstrap-icon">
                                <i class="bi-trash" />
                            </span>
                            {{ $t("common:modules.tools.draw.button.delete") }}
                        </button>
                    </div>
                </div>
                <div class="form-group form-group-sm row">
                    <div class="col-12 d-grid gap-2">
                        <button
                            id="tool-draw-deleteAllInteraction"
                            class="btn btn-sm btn-lgv-grey"
                            @click="clearLayer"
                        >
                            <span class="bootstrap-icon">
                                <i class="bi-trash" />
                            </span>
                            {{ $t("common:modules.tools.draw.button.deleteAll") }}
                        </button>
                    </div>
                </div>
                <DownloadItem v-if="download.enabled" />
            </div>
        </template>
    </ToolTemplate>
</template>

<style lang="scss" scoped>
    @import "~variables";
    .no-cursor {
        cursor: none;
    }
    .cursor-crosshair {
        cursor: crosshair;
    }

    button {
        &:disabled {
            background-color: $accent_active;
            opacity: 1;
        }
    }
</style>
