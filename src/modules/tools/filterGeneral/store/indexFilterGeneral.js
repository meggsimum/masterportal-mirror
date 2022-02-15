import state from "./stateFilterGeneral";
import actions from "./actionsFilterGeneral";
import getters from "./gettersFilterGeneral";
import mutations from "./mutationsFilterGeneral";

export default {
    namespaced: true,
    state: {...state},
    mutations,
    actions,
    getters
};
