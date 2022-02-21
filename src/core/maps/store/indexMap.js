import state from "./stateMap";
import actions from "./actions/actionsMap";
import getters from "./gettersMap";
import mutations from "./mutationsMap";

export default {
    namespaced: true,
    state,
    actions,
    mutations,
    getters
};
