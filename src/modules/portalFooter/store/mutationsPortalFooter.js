import {generateSimpleMutations} from "../../../app-store/utils/generators";
import state from "./statePortalFooter";

const mutations = {
    /**
     * Creates from every state-key a setter.
     * For example, given a state object {key: value}, an object
     * {setKey:   (state, payload) => *   state[key] = payload * }
     * will be returned.
     */
    ...generateSimpleMutations(state)
};

export default mutations;
