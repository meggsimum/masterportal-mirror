import mutations from "./mutationsIsochrones";
import actions from "./actionsIsochrones";
import getters from "./gettersIsochrones";
import state from "./stateIsochrones";

export default {
    namespaced: true,
    state: {...state},
    mutations,
    actions,
    getters
};
