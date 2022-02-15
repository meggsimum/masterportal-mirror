import state from "./statePortalFooter";
import getters from "./gettersPortalFooter";
import actions from "./actionsPortalFooter";
import mutations from "./mutationsPortalFooter";

export default {
    namespaced: true,
    state: {...state},
    getters,
    actions,
    mutations
};
