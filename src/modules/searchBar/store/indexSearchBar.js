import getters from "./gettersSearchBar";
import mutations from "./mutationsSearchBar";
import actions from "./actions/actionsSearchBar";
import state from "./stateSearchBar";

export default {
    namespaced: true,
    state: {...state},
    mutations,
    actions,
    getters
};
