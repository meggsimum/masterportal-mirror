<script>
import {mapGetters, mapMutations} from "vuex";
import getters from "../store/gettersGfi";
import MobileTemplate from "./templates/MobileTemplate.vue";
import DetachedTemplate from "./templates/DetachedTemplate.vue";
import TableTemplate from "./templates/TableTemplate.vue";
import AttachedTemplate from "./templates/AttachedTemplate.vue";
import omit from "../../../../utils/omit";
import {mapAttributes} from "../../../../utils/attributeMapper.js";

export default {
    name: "GetFeatureInfo",
    components: {
        MobileTemplate,
        DetachedTemplate,
        TableTemplate,
        AttachedTemplate
    },
    data () {
        return {
            // current index of the pagination and so also for the feature in the gfiFeatures
            pagerIndex: 0,
            // key for re-render child(detached) component
            componentKey: false
        };
    },
    computed: {
        // gfiWindow is deprecated
        ...mapGetters({
            isMobile: "mobile",
            gfiWindow: "gfiWindow",
            uiStyle: "uiStyle",
            ignoredKeys: "ignoredKeys"
        }),
        ...mapGetters("Tools/Gfi", Object.keys(getters)),
        ...mapGetters("Map", {
            gfiFeatures: "gfiFeaturesReverse",
            mapSize: "size"
        }),
        /**
         * Returns the current view type.
         * It only works if the string has the same name as the component (in ./templates).
         * @returns {String} the current view type (Detached or Mobile)
         */
        currentViewType: function () {
            // this.gfiWindow is deprecated
            if (this.gfiWindow) {
                console.warn("Parameter 'gfiWindow' is deprecated. Please use 'Portalconfig.menu.tool.gfi.desktopType' instead.");
            }

            if (this.isMobile) {
                return "MobileTemplate";
            }
            // this.gfiWindow is deprecated
            else if ((this.desktopType || this.gfiWindow)?.toLowerCase() === "attached") {
                return "AttachedTemplate";
            }
            else if (this.uiStyle === "TABLE") {
                return "TableTemplate";
            }
            return "DetachedTemplate";
        },
        /**
         * Is visible if there is at least one feature and the gfi is activated.
         * @returns {Boolean} gfi visibility
         */
        isVisible: function () {
            return this.gfiFeatures !== null && this.active;
        },
        /**
         * Returns the feature depending on the pager index.
         * @returns {?Object} - the current feature
         */
        feature: function () {
            if (this.gfiFeatures !== null && Array.isArray(this.gfiFeatures) && this.gfiFeatures.length > 0) {
                return this.gfiFeatures[this.pagerIndex];
            }
            return null;
        }
    },
    watch: {
        /**
         * Whenever active changes and it's false, reset function will call
         * @param {Boolean} newValue - is gfi active
         * @returns {void}
         */
        active: function (newValue) {
            if (!newValue) {
                this.reset();
            }
        },
        /**
         * Whenever feature changes, put it into the store
         * @param {?Object} newValue - the current feature
         * @returns {void}
         */
        feature: function (newValue) {
            this.setCurrentFeature(newValue);
        },
        /**
         * Whenever mapSize changes, component key is changed
         * to force re-render detached component (key-changing).
         * @returns {void}
         */
        mapSize: function () {
            if (this.currentViewType === "Detached") {
                this.componentKey = !this.componentKey;
            }
        },
        /**
         * Whenever gfiFeatures changes, set pagerIndex to zero.
         * @returns {void}
         */
        gfiFeatures: function () {
            this.pagerIndex = 0;
        }
    },
    beforeUpdate () {
        this.createMappedProperties(this.feature);
    },
    methods: {
        ...mapMutations("Map", ["setGfiFeatures"]),
        ...mapMutations("Tools/Gfi", ["setCurrentFeature"]),
        /**
         * Reset means to set the gfiFeatures to null.
         * This closes the gfi window/modal/popover.
         * @returns {void}
         */
        reset: function () {
            this.setGfiFeatures(null);
        },
        /**
         * Increases the index for the pagination.
         * @returns {void}
         */
        increasePagerIndex: function () {
            if (this.pagerIndex < this.gfiFeatures.length - 1) {
                this.pagerIndex += 1;
            }
        },
        /**
         * Decreases the index for the pagination.
         * @returns {void}
         */
        decreasePagerIndex: function () {
            if (this.pagerIndex > 0) {
                this.pagerIndex -= 1;
            }
        },
        createMappedProperties: function (feature) {
            if (Array.isArray(feature?.getFeatures())) {
                feature.getFeatures().forEach(singleFeature => {
                    this.createMappedProperties(singleFeature);
                });

            }
            else if (feature?.getProperties() && feature?.getProperties() !== null) {
                feature.getMappedProperties = () => this.prepareProperties(feature.getProperties(), feature.getAttributesToShow(), this.ignoredKeys);
            }
        },
        /**
         * Checks which properties should be displayed.
         * If all should be displayed, the ignoredKeys omitted.
         * Otherwise the properties are mapped
         * @param {Object} properties - the feature properties
         * @param {Object} mappingObject - "gfiAttributes" from the layer
         * @param {String[]} ignoredKeys - configured in the config.js
         * @returns {Object} prepared properties - mapped by MappingObject or omitted by ignoredKeys
         */
        prepareProperties: function (properties, mappingObject, ignoredKeys) {
            if (mappingObject === "showAll" && Array.isArray(ignoredKeys)) {
                return omit(properties, ignoredKeys, true);
            }
            return mapAttributes(properties, mappingObject);
        }
    }
};
</script>

<template>
    <div
        v-if="isVisible && feature !== null"
        class="gfi"
    >
        <component
            :is="currentViewType"
            :key="componentKey"
            :feature="feature"
            @close="reset"
        >
            <!-- Slot Content for Footer -->
            <template
                v-if="gfiFeatures.length > 1"
                #footer
            >
                <div class="gfi-footer">
                    <div
                        :class="[pagerIndex < 1 ? 'disabled' : '', 'pager-left', 'pager']"
                        tabindex="0"
                        @click="decreasePagerIndex"
                        @keydown.enter="decreasePagerIndex"
                    >
                        <span class="bootstrap-icon">
                            <i class="bi-chevron-left" />
                        </span>
                    </div>
                    <div
                        tabindex="0"
                        :class="[pagerIndex === gfiFeatures.length - 1 ? 'disabled' : '', 'pager-right', 'pager']"
                        @click="increasePagerIndex"
                        @keydown.enter="increasePagerIndex"
                    >
                        <span class="bootstrap-icon">
                            <i class="bi-chevron-right" />
                        </span>
                    </div>
                </div>
            </template>
        </component>
    </div>
</template>


<style lang="scss">
@import "~variables";

.gfi {
    color: $secondary_contrast;
}
.bold{
    font-weight: bold;
}
.gfi-footer {
        color: #646262;
        font-size: 22px;
         .pager {
            background-color: $secondary;
            padding: 6px;
            cursor: pointer;
            width: 50%;
            margin: 0;
            text-align: center;
            list-style: none;
        }

        .pager-left {
            float: left;
            border-right: 1px solid #ddd;
        }

        .pager-right {
            float: right;
        }
        .disabled {
            cursor: not-allowed;
            background-color: $primary_inactive_contrast;
            opacity: 0.2;
        }

    }

</style>
