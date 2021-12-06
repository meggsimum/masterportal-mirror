<script>
import {mapGetters, mapActions} from "vuex";
import componentExists from "../../../../../../utils/componentExists.js";

export default {
    name: "CompareFeatureIcon",
    props: {
        feature: {
            type: Object,
            required: true
        }
    },
    data: function () {
        return {
            gfiFeature: {
                featureId: this.feature.getId(),
                layerId: this.feature.getLayerId(),
                layerName: this.feature.getTitle(),
                attributesToShow: this.feature.getAttributesToShow(),
                properties: this.feature.getMappedProperties()
            }
        };
    },
    computed: {
        ...mapGetters("Tools/CompareFeatures", ["isFeatureSelected"]),
        ...mapGetters("Map", ["mapMode"]),
        /**
         * Returns Boolean after checking if feature is on comparison list.
         * @returns {String} Title for the comparelist.
         */
        featureIsOnCompareList () {
            return this.isFeatureSelected(this.gfiFeature);
        },

        /**
         * Returns the correct title, depending on whether the feature is on the comparelist or not.
         * @returns {String} Title for the comparelist.
         */
        titleCompareList: function () {
            return this.featureIsOnCompareList ? this.$t("modules.tools.gfi.favoriteIcons.compareFeatureIcon.fromCompareList") : this.$t("modules.tools.gfi.favoriteIcons.compareFeatureIcon.toCompareList");
        }
    },
    watch: {
        /**
         * If the feature is changed with GFI open, the gfiFeature must be changed here.
         * @param {Object} value An object with gfi properties.
         * @returns {void}
         */
        feature (value) {
            this.gfiFeature = {
                featureId: value.getId(),
                layerId: value.getLayerId(),
                layerName: value.getTitle(),
                attributesToShow: value.getAttributesToShow(),
                properties: value.getMappedProperties()
            };
        }
    },
    methods: {
        ...mapActions("Tools/CompareFeatures", ["isFeatureOnCompareList", "removeFeature"]),
        componentExists,

        /**
         * Triggers the event "addFeatureToList" of the CompareFeatures module to add the feature.
         * @param {Event} event The click event.
         * @returns {void}
         */
        toogleFeatureToCompareList: function (event) {
            if (event?.target?.classList?.contains("bi-star")) {
                this.isFeatureOnCompareList(this.gfiFeature);
            }
            else {
                this.removeFeature(this.gfiFeature);
            }
        }
    }
};
</script>

<template>
    <span
        v-if="componentExists('compareFeatures') && mapMode === '2D'"
        :class="'bootstrap-icon'"
        :title="titleCompareList"
        tabindex="0"
        @click="toogleFeatureToCompareList"
        @keydown.enter="toogleFeatureToCompareList"
    >
        <i :class="[featureIsOnCompareList ? 'bi-star-fill' : 'bi-star']" />
    </span>
</template>

<style lang="scss" scoped>
@import "~/css/mixins.scss";

$color: #fec44f;

span.bootstrap-icon {
    &:focus {
        @include primary_action_focus;
    }
    &:hover {
        @include primary_action_hover;
    }
}

.bi-star-fill {
    color: $color;
}
</style>
