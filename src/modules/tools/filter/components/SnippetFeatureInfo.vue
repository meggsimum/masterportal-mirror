<script>
import isObject from "../../../../utils/isObject.js";
import {getLayerByLayerId} from "../utils/openlayerFunctions";
import beautifyKey from "../../../../utils/beautifyKey.js";
import {translateKeyWithPlausibilityCheck} from "../../../../utils/translateKeyWithPlausibilityCheck.js";

export default {
    name: "SnippetFeatureInfo",
    props: {
        adjustment: {
            type: [Object, Boolean],
            required: false,
            default: false
        },
        attrName: {
            type: Array,
            required: false,
            default: () => []
        },
        title: {
            type: [String, Boolean],
            required: false,
            default: true
        },
        layerId: {
            type: String,
            required: false,
            default: undefined
        },
        snippetId: {
            type: Number,
            required: false,
            default: 0
        },
        filteredItems: {
            type: Array,
            required: false,
            default: () => []
        }
    },
    data () {
        return {
            featureInfo: null,
            visible: false
        };
    },
    computed: {
        titleText () {
            if (typeof this.title === "string") {
                return translateKeyWithPlausibilityCheck(this.title, key => this.$t(key));
            }
            return "";
        },
        featureInfoWithoutDuplicates () {
            if (this.featureInfo === null) {
                return [];
            }
            const result = {};

            Object.entries(this.featureInfo).forEach(([key, value]) => {
                result[key] = Array.isArray(value) ? value.join(", ") : value;
            });
            return result;
        }
    },
    watch: {
        filteredItems (items) {
            const attributesObject = this.getUniqueObjectFromAttributes(this.attrName, items);

            if (attributesObject === null) {
                this.featureInfo = null;
                return;
            }

            if (typeof this.gfiAttributes === "undefined") {
                this.featureInfo = this.beautifyObjectKeys(attributesObject);
            }
            else {
                this.featureInfo = Radio.request("Util", "renameKeys", this.gfiAttributes, attributesObject);
            }
        },
        featureInfo: {
            handler () {
                if (isObject(this.featureInfo) && Object.keys(this.featureInfo).length > 0) {
                    this.visible = true;
                    return;
                }
                this.visible = false;
            },
            deep: true
        }
    },
    created () {
        if (this.layerId) {
            this.setGfiAttributes(this.layerId);
        }
    },
    methods: {
        /**
         * Beautify the keys of an object.
         * @param {Object} unlovelyObject - The object to be beautified.
         * @returns {Object} The beautified object.
         */
        beautifyObjectKeys (unlovelyObject) {
            const beautifiedObj = {};

            Object.entries(unlovelyObject).forEach(([key, value]) => {
                beautifiedObj[beautifyKey(key)] = value;
            });
            return beautifiedObj;
        },

        /**
         * Sets the gfiAttributes of a layer by the id if available.
         * and if gfiAttributes are an object. It can also be a string ("ignore" or "showAll").
         * Is used to beautify the keys of the feature info.
         * @param {String} layerId - The id of the layer.
         * @returns {void}
         */
        setGfiAttributes (layerId) {
            const layer = getLayerByLayerId(layerId);

            this.gfiAttributes = isObject(layer?.get("gfiAttributes")) ? layer.get("gfiAttributes") : undefined;
        },

        /**
         * Gets an object with unique list of values for each attribute.
         * @param {String[]} attrName an array of attrNames
         * @param {Object[]} features an array of objects
         * @returns {Object|null} returns object or null if given features is not an array
         */
        getUniqueObjectFromAttributes (attrName, features) {
            if (!Array.isArray(attrName) || !Array.isArray(features) || features.length === 0) {
                return null;
            }
            const uniqueObjects = {},
                result = {};

            features.forEach(feature => {
                attrName.forEach(attr => {
                    if (!isObject(uniqueObjects[attr])) {
                        uniqueObjects[attr] = {};
                    }
                    uniqueObjects[attr][feature.get(attr)] = true;
                });
            });
            Object.entries(uniqueObjects).forEach(([attr, obj]) => {
                result[attr] = [];
                Object.keys(obj).forEach(value => {
                    if (value === "undefined") {
                        result[attr].push("");
                        return;
                    }
                    result[attr].push(value);
                });
            });

            return result;
        }
    }
};
</script>

<template>
    <div
        v-if="visible"
        class="snippetFeatureInfoContainer"
    >
        <h6 v-if="title">
            {{ titleText }}
        </h6>
        <dl class="row">
            <template v-for="(value, key, index) in featureInfoWithoutDuplicates">
                <dt
                    :key="key + index"
                    class="col-sm-4"
                >
                    {{ key }}&#58;
                </dt>
                <template v-if="value === ''">
                    <dd
                        :key="key"
                        class="col-sm-8"
                    >
                        ---
                    </dd>
                </template>
                <template v-else>
                    <dd
                        :key="key"
                        class="col-sm-8"
                    >
                        {{ value }}
                    </dd>
                </template>
            </template>
        </dl>
    </div>
</template>

<style lang="scss" scoped>
    .snippetFeatureInfoContainer {
        border: 1px solid #ddd;
        padding: 8px;
        h6 {
            color: #E10019
        }
        .row {
            margin-bottom: 0;
            dt {
                font-weight: normal;
            }
        }
    }
</style>
