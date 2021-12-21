<script>
export default {
    name: "DrawItemFeaturesFilter",
    props: {
        filterList: {
            type: Array,
            required: true
        },
        features: {
            type: Array,
            required: true
        }
    },
    computed: {
        /**
         * Groups the features based on the filter configuration (filterList).
         * The key is the name of the filter to which the features belong to.
         * @returns {Object} The grouped features.
         */
        groupedFeatures () {
            const groupedFeatures = {};

            this.filterList.forEach(filter => {
                groupedFeatures[filter.name] = this.filterFeaturesByType(this.features, filter.drawTypes.toString());
            });

            return groupedFeatures;
        },

        /**
         * The check if there is feature belong to the filter.
         * If there are features from another tool with another filter, the length of features here will be zero
         * @returns {Boolean} -
         */
        hasFeaturesOfFilter () {
            let featureLength = 0;

            this.filterList.forEach(filter => {
                featureLength += this.filterFeaturesByType(this.features, filter.drawTypes.toString()).length;
            });

            return featureLength > 0;
        }
    },
    methods: {
        /**
         * Filters the features by the given draw type/s.
         * @param {module:ol/Feature[]} features - The features to be filtered.
         * @param {String} type - One or more comma separated draw types. For example "drawCircle,drawArea" or "drawSymbol".
         * @returns {module:ol/Feature[]} The filtered features.
         */
        filterFeaturesByType (features, type) {
            return features.filter(feature => {
                // drawType.id = the name of the draw type
                return type.search(feature.get("drawState").drawType.id) !== -1;
            });
        },

        /**
         * Checks if there are visible features.
         * @param {module:ol/Feature[]} features - The features to be checked.
         * @returns {Boolean} True if there are visible features otherwise false.
         */
        hasVisibleFeatures (features) {
            const visibleFeatures = features.filter(feature => feature.get("fromDrawTool") && feature.get("isVisible"));

            return visibleFeatures.length > 0;
        },

        /**
         * Sets the visibility of the given features.
         * @param {module:ol/Feature[]} features - The features to be set.
         * @param {Boolean} value - True for visible and false for not visible.
         * @returns {void}
         */
        setFeaturesVisibility (features, value) {
            features.forEach(feature => {
                if (feature.get("fromDrawTool")) {
                    feature.set("isVisible", value);
                }
            });
        }
    }
};
</script>

<template lang="html">
    <form id="draw-filter">
        <template v-for="(value, key, index) in groupedFeatures">
            <div
                v-if="value.length > 0"
                :key="index"
                class="form-check"
            >
                <input
                    :id="'draw-filter-check-' + index"
                    type="checkbox"
                    class="form-check-input"
                    :checked="hasVisibleFeatures(value)"
                    @change="setFeaturesVisibility(value, $event.target.checked)"
                >
                <label
                    class="form-check-label"
                    :for="'draw-filter-check-' + index"
                >
                    {{ key }}
                </label>
            </div>
        </template>
        <hr v-if="hasFeaturesOfFilter">
    </form>
</template>


<style lang="scss" scoped>
    #draw-filter {
        input {
            margin-top: 0;
        }
    }
</style>
