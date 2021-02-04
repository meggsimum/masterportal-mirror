import {generateSimpleGetters} from "../../../../app-store/utils/generators";
import compareFeaturesState from "./statecompareFeatures";

const getters = {
    ...generateSimpleGetters(compareFeaturesState),
    isFeatureSelected: (state) => (gfiFeature) => {
        const layerId = gfiFeature.layerId;

        if (state.layerFeatures.hasOwnProperty(layerId)) {

            for (const feature of state.layerFeatures[layerId]) {
                if (feature.featureId === gfiFeature.featureId) {
                    return true;
                }
            }
        }
        return false;
    },
    hasFeatures: (state) => {
        for (const prop in state.layerFeatures) {
            console.log(state.layerFeatures.hasOwnProperty(prop));
            if (state.layerFeatures.hasOwnProperty(prop)) {
                return true;
            }
        }
        return false;
    }

    // NOTE overwrite getters here if you need a special behaviour in a getter
};

export default getters;
