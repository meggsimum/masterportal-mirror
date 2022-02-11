import {generateSimpleGetters} from "../../../../app-store/utils/generators";
import featureListerState from "./stateFeatureLister";

const getters = {
    ...generateSimpleGetters(featureListerState),
    /**
     * Gets the currently available layers.
     * @param {Object} state context object.
     * @returns {void}
     */
    getFeatureProperties: state => {
        const featuresWithProperties = [],
            sortedProperties = [];

        state.gfiFeaturesOfLayer.forEach(feature => {
            featuresWithProperties.push(feature.getProperties());
        });

        featuresWithProperties.forEach(properties => {
            const attvalue = [];

            state.headers.forEach(header => {
                if (!Object.prototype.hasOwnProperty.call(properties, header.key)) {
                    Object.entries(properties).forEach(() => {
                        properties[header.key] = "";
                    });
                }

                Object.entries(properties).forEach(([key, value]) => {
                    if (header.key === key) {
                        attvalue.push(value);
                    }
                });
            });
            sortedProperties.push(attvalue);
        });
        return sortedProperties;
    },

    getFeatureDetails: state => {
        const featureDetail = [];

        Object.entries(state.selectedFeature.getProperties()).forEach(([propkey, propvalue]) => {
            Object.entries(state.selectedFeature.getAttributesToShow()).forEach(([key, value]) => {
                if (propkey === key) {
                    featureDetail.push([value, propvalue]);
                }
            });
        });
        return featureDetail;
    },
    /**
     * Gets the currently available layers.
     * @param {Object} state context object.
     * @returns {void}
     */
    getHeaders: state => {
        const headers = [],
            lengths = [];
        let indexOfFeatureWithMostAttributes = "";

        Object.values(state.gfiFeaturesOfLayer).forEach(element => {
            lengths.push(Object.keys(element.getAttributesToShow()).length);
        });
        indexOfFeatureWithMostAttributes = lengths.indexOf(Math.max(...lengths));

        if (state.gfiFeaturesOfLayer[indexOfFeatureWithMostAttributes].getAttributesToShow() === "showAll") {
            Object.entries(state.gfiFeaturesOfLayer[indexOfFeatureWithMostAttributes].getProperties()).forEach(([key]) => {
                headers.push({key: key, value: key});
            });
        }
        else {
            Object.entries(state.gfiFeaturesOfLayer[indexOfFeatureWithMostAttributes].getAttributesToShow()).forEach(([key, value]) => {
                headers.push({key, value});
            });
        }
        state.headers = headers;
        return headers;
    }
};

export default getters;