import mutations from "./mutationsRouting";
import actions from "./actionsRouting";
import getters from "./gettersRouting";
import state from "./stateRouting";

import Directions from "./directions/indexDirections";
import Isochrones from "./isochrones/indexIsochrones";

export default {
    namespaced: true,
    modules: {
        Directions,
        Isochrones
    },
    state,
    mutations,
    actions,
    getters
};
