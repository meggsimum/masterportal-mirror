import {generateSimpleGetters} from "../../../../app-store/utils/generators";
import featureListerState from "./stateFeatureLister";

const getters = {
    ...generateSimpleGetters(featureListerState),
    /**
     * Builds and returns a two-dimensional array that contains value lists per feature based on the header
     * @param {Object} state context object.
     * @returns {Array} [[a1, b1], [a2, b2], ...] array for each line containing array for each property of the header
     */
    featureProperties: state => {
        return state.gfiFeaturesOfLayer
            .map(feature => feature.getProperties())
            .map(properties => state.headers.map(({key}) => properties[key] ?? ""));
    },
    /**
     * The v-for calls this function for every property of the selected feature and returns pairs of header and
     * value as an array
     * @param {Object} state context object.
     * @returns {Array} [header, value] for each property of the selected feature
     */
    featureDetails: state => {
        const attributesToShow = state.selectedFeature.getAttributesToShow(),
            featureProperties = state.selectedFeature.getProperties();

        return attributesToShow === "showAll"
            ? Object.entries(featureProperties)
                .filter(([key, value]) => value && !Config.ignoredKeys.includes(key.toUpperCase()))
            : Object.entries(attributesToShow)
                .filter(([key]) => featureProperties[key])
                .map(([key, value]) => [value, featureProperties[key]]);
    },
    /**
     * Gets a list of all property keys to show in a table header.
     * @param {Object} state context object.
     * @returns {Array} [key, value] for each property
     */
    headers: state => {
        const headers = Object.entries(state.gfiFeaturesOfLayer
            .reduce((acc, it) => {
                let keys = it.getAttributesToShow();

                keys = keys === "showAll"
                    ? Object.keys(it.getProperties()).map(prop => [prop, prop])
                    : Object.entries(keys);
                keys.forEach(([key, value]) => {
                    if (!Config.ignoredKeys.includes(key.toUpperCase())) {
                        acc[key] = value;
                    }
                });
                return acc;
            }, {})).map(([key, value]) => ({key, value}));

        state.headers = headers;
        return headers;
    }
};

export default getters;
