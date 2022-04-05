import actions from "./actionsFeatureLister";
import mutations from "./mutationsFeatureLister";
import getters from "./gettersFeatureLister";
import state from "./stateFeatureLister";


export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
};
