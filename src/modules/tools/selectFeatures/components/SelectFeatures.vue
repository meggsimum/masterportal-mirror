<script>
import {DragBox, Select} from "ol/interaction";
import {never, platformModifierKeyOnly} from "ol/events/condition";
import VectorSource from "ol/source/Vector.js";

import ToolTemplate from "../../../../modules/tools/ToolTemplate.vue";
import {mapActions, mapGetters, mapMutations} from "vuex";
import getters from "../store/gettersSelectFeatures";
import mutations from "../store/mutationsSelectFeatures";

import {isUrl} from "../../../../utils/urlHelper";
import {isEmailAddress} from "../../../../utils/isEmailAddress.js";
import {isPhoneNumber, getPhoneNumberAsWebLink} from "../../../../utils/isPhoneNumber.js";

export default {
    name: "SelectFeatures",
    components: {
        ToolTemplate
    },
    computed: {
        ...mapGetters("Tools/SelectFeatures", Object.keys(getters))
    },
    watch: {
        active (newValue) {
            if (newValue) {
                this.createInteractions();
                this.addInteractions();
            }
            else {
                this.removeInteractions();
            }

        }
    },
    created () {
        this.$on("close", this.close);
    },
    methods: {
        ...mapMutations("Tools/SelectFeatures", Object.keys(mutations)),
        ...mapActions("Map", {
            addInteractionToMap: "addInteraction",
            removeInteractionFromMap: "removeInteraction"
        }),
        isEmailAddress,
        isPhoneNumber,
        getPhoneNumberAsWebLink,

        /**
         * Creates the interactions for selecting features.
         * @returns {void}
         */
        createInteractions: function () {
            const select = new Select({
                    // select works indirectly via DragBox results - never updates itself
                    addCondition: never,
                    removeCondition: never,
                    toggleCondition: never,
                    condition: never
                }),
                dragBox = new DragBox({condition: platformModifierKeyOnly});

            dragBox.on("boxstart", this.clearFeatures.bind(this));
            dragBox.on("boxend", this.setFeaturesFromDrag.bind(this));

            this.setSelectInteraction(select);
            this.setDragBoxInteraction(dragBox);
        },

        /**
         * Clears the selected features of all current instances.
         * @returns {void}
         */
        clearFeatures: function () {
            if (this.selectedFeatures) {
                this.selectedFeatures.clear();
            }
            this.setSelectedFeatures(this.selectInteraction.getFeatures());
            this.setSelectedFeaturesWithRenderInformation([]);
        },

        /**
         * Adds the interactions to the Map.
         * @returns {void}
         */
        addInteractions: function () {
            this.addInteractionToMap(this.selectInteraction);
            this.addInteractionToMap(this.dragBoxInteraction);
        },

        /**
         * Removes the Interactions from the Map.
         * @returns {void}
         */
        removeInteractions: function () {
            this.removeInteractionFromMap(this.selectInteraction);
            this.removeInteractionFromMap(this.dragBoxInteraction);
        },

        /**
         * Infers features from interaction state and sets them to the selectedFeatures.
         * @returns {void}
         */
        setFeaturesFromDrag: function () {
            const extent = this.dragBoxInteraction.getGeometry().getExtent();

            Radio
                .request("Map", "getLayers")
                .getArray()
                .filter(layer => layer.get("visible") && layer.get("source") instanceof VectorSource)
                .forEach(
                    layer => layer.get("source").forEachFeatureIntersectingExtent(
                        extent,
                        feature => this.prepareFeature(layer, feature)
                    )
                );
        },

        /**
         * Gets a feature or multiple features and forwards it/them to the pushFeatures Function.
         * Also pushes the features to the selected features.
         * @param {module:ol/Layer} layer layer the feature belongs to (for gfi attributes)
         * @param {module:ol/Feature} feature feature to be pushed
         * @returns {void}
         */
        prepareFeature: function (layer, feature) {
            this.addSelectedFeature(feature);
            if (feature.get("features") === undefined) {
                const item = feature;

                this.pushFeatures(layer, item);
            }
            else {
                feature.get("features").forEach(item => {
                    this.pushFeatures(layer, item);
                });
            }
        },

        /**
         * Pushes the given feature and its properties to the selectedFeaturesWithRenderInformation array.
         * @param {module:ol/Layer} layer layer the feature belongs to (for gfi attributes)
         * @param {module:ol/Feature} item feature to be pushed
         * @returns {void}
         */
        pushFeatures: function (layer, item) {
            this.addSelectedFeatureWithRenderInformation({
                item,
                properties: this.translateGFI(
                    item.getProperties(),
                    layer.get("gfiAttributes")
                )
            });
        },

        /**
         * Iterates the Properties and adds Links and Breaks.
         * @param {Array} properties Technical key to display value
         * @returns {Array.<String[]>} Array of [key,value]-pairs - may be empty
         */
        processLinksAndBreaks: function (properties) {
            const resultProperties = properties;

            // makes links in result list clickable and adds <br/>s
            Object.entries(properties).forEach(([key, propValue]) => {
                let propertyValue = propValue;

                if (Array.isArray(propValue)) {
                    propertyValue = propValue.join("|");
                }
                if (this.isValidKey(key) && this.isValidValue(propertyValue) && propertyValue.indexOf("|") > -1) {
                    resultProperties[key] = "";
                    propertyValue.split("|").forEach(function (arrayItemValue) {
                        if (isUrl(arrayItemValue)) {
                            resultProperties[key] += "<a href=" + arrayItemValue + " target=\"_blank\">" + arrayItemValue + "</a><br/>";
                        }
                        else {
                            resultProperties[key] += arrayItemValue + "<br/>";
                        }
                    });
                }
                else if (this.isValidKey(key) && this.isValidValue(propertyValue) && isUrl(propertyValue)) {
                    resultProperties[key] = "<a href=" + propertyValue + " target=\"_blank\">" + propertyValue + "</a>";
                }
            });

            return resultProperties;
        },

        /**
         * Prepares the properties of a feature for tabular display.
         * @param {Array} properties Technical key to display value
         * @param {Object} gfiAttributes Technical key to display key
         * @returns {Array.<String[]>} Array of [key,value]-pairs - may be empty
         */
        translateGFI: function (properties, gfiAttributes) {
            const resultProperties = this.processLinksAndBreaks(properties);

            // showAll => just use properties and make key look nice
            if (gfiAttributes === "showAll") {
                return Object
                    .entries(resultProperties)
                    .map(([key, value]) => {
                        if (this.isValidKey(key) && this.isValidValue(value)) {
                            return [this.beautifyKey(key), this.beautifyValue(value)];
                        }
                        return false;
                    });
            }

            // type object => contains pretty-print instruction for key as value
            if (typeof gfiAttributes === "object") {
                return Object
                    .keys(gfiAttributes)
                    .map(key => [
                        gfiAttributes[key],
                        this.beautifyValue(resultProperties[key] || "")
                    ]);
            }

            // gfiAttributes === "ignore" (or invalid)
            if (gfiAttributes !== "ignore") {
                console.warn(`Layer has invalid gfiAttributes "${gfiAttributes}". Acting as if "ignore" was given.`);
            }

            return [];
        },

        /**
         * Prepares a key for display.
         * e.g. "very_important_field" becomes "Very Important Field"
         * @param {String} str key to beautify
         * @returns {String} beautified key
         */
        beautifyKey: function (str) {
            return str
                .split("_")
                .map(item => item.substring(0, 1).toUpperCase() + item.substring(1))
                .join(" ");
        },

        /**
         * Translates | separators to newlines.
         * @param {String} str string, potentially with separators '|'
         * @returns {String} beautified string
         */
        beautifyValue: function (str) {
            return str
                .split("|")
                .map(item => item.trim())
                .join("<br/>");
        },

        /**
         * helper function: check, if key has a valid value
         * @param {String} key parameter
         * @returns {Boolean} key is valid (i.e. not a member of ignoredKeys)
         */
        isValidKey: function (key) {
            const ignoredKeys = Config.ignoredKeys ? Config.ignoredKeys : Radio.request("Util", "getIgnoredKeys");

            return ignoredKeys.indexOf(key.toUpperCase()) === -1;
        },

        /**
         * helper function: check, if str has a valid value
         * @param {String} str parameter
         * @returns {Boolean} value is valid
         */
        isValidValue: function (str) {
            return Boolean(str && typeof str === "string" && str.toUpperCase() !== "NULL");
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
            const model = Radio.request("ModelList", "getModelByAttributes", {id: this.$store.state.Tools.SelectFeatures.id});

            if (model) {
                model.set("isActive", false);
            }
        },

        /**
         * Feature listing offer clickable elements to zoom to a feature.
         * @param {Object} event click event
         * @returns {void}
         */
        featureZoom: function (event) {
            const featureIndex = event.currentTarget.id.split("-")[0],
                {item} = this.selectedFeaturesWithRenderInformation[featureIndex];

            Radio.request("Map", "getMap").getView().fit(item.getGeometry());
        },

        /**
         * translates the given key, checkes if the key exists and throws a console warning if not
         * @param {String} key the key to translate
         * @param {Object} [options=null] for interpolation, formating and plurals
         * @returns {String} the translation or the key itself on error
         */
        translate (key, options = null) {
            if (key === "common:" + this.$t(key)) {
                console.warn("the key " + JSON.stringify(key) + " is unknown to the common translation");
            }

            return this.$t(key, options);
        }
    }
};
</script>

<template lang="html">
    <ToolTemplate
        :title="translate('common:menu.tools.selectFeatures')"
        :icon="icon"
        :active="active"
        :render-to-window="renderToWindow"
        :resizable-window="resizableWindow"
        :deactivate-gfi="deactivateGFI"
        :focus-to-close-icon="true"
        class="selectFeatures"
    >
        <template #toolBody>
            <div
                v-if="active"
                id="selectFeatures"
            >
                <div
                    v-if="selectedFeaturesWithRenderInformation.length === 0"
                    class="selectFeaturesDefaultMessage"
                >
                    {{ translate("common:modules.tools.selectFeatures.noFeatureChosen") }}
                </div>
                <div
                    v-else
                    ref="select-features-tables"
                    class="select-features-tables"
                >
                    <template
                        v-for="(selectedFeature, index) in selectedFeaturesWithRenderInformation"
                    >
                        <table
                            v-if="selectedFeature.properties.length > 0"
                            :key="index"
                            class="table table-striped table-bordered"
                        >
                            <tbody>
                                <tr
                                    v-for="(property, propIndex) in selectedFeature.properties"
                                    :key="propIndex"
                                >
                                    <td
                                        class="featureName"
                                    >
                                        {{ property[0] }}
                                    </td>
                                    <td
                                        v-if="isEmailAddress(property[1])"
                                        class="featureValue"
                                    >
                                        <a :href="`mailto:${property[1]}`">{{ property[1] }}</a>
                                    </td>
                                    <td
                                        v-else-if="isPhoneNumber(property[1])"
                                        class="featureValue"
                                    >
                                        <a :href="getPhoneNumberAsWebLink(property[1])">{{ property[1] }}</a>
                                    </td>
                                    <td
                                        v-else-if="property[1] && (property[1].includes('<br') || property[1].includes('<a'))"
                                        class="featureValue"
                                        v-html="property[1]"
                                    />
                                    <td
                                        v-else
                                        class="featureValue"
                                    >
                                        {{ property[1] }}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <p
                            v-else
                            :key="index"
                        >
                            {{ translate("common:modules.tools.selectFeatures.propertylessFeature") }}
                        </p>
                        <a
                            :id="index + '-selectFeatures-feature'"
                            :key="'a' + index"
                            href="#"
                            class="select-features-zoom-link"
                            @click="featureZoom"
                        >
                            {{ translate("common:modules.tools.selectFeatures.zoomToFeature") }}
                        </a>
                        <hr
                            v-if="index !== selectedFeaturesWithRenderInformation.length - 1"
                            :key="'h' + index"
                        >
                    </template>
                </div>
            </div>
        </template>
    </ToolTemplate>
</template>

<style type="scss" scoped>
.selectFeatures {
    max-width:600px;
    max-height:745px;
}
.select-features-tables p {
    margin: 8px 0px;
}
td.featureName {
    width:30%;
}
td.featureValue {
    width:70%;
}
</style>
