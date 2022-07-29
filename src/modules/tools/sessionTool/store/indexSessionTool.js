import getters from "./gettersSessionTool";
import mutations from "./mutationsSessionTool";
import actions from "./actionsSessionTool";
import state from "./stateSessionTool";

export default {
    namespaced: true,
    state: {...state},
    mutations,
    actions,
    getters
};
