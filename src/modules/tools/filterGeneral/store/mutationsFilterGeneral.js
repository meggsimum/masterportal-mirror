import {generateSimpleMutations} from "../../../../app-store/utils/generators";
import filterGeneralState from "./stateFilterGeneral";

const mutations = {
    /**
     * Creates from every state-key a setter.
     * For example, given a state object {key: value}, an object
     * {setKey:   (state, payload) => *   state[key] = payload * }
     * will be returned.
     */
    ...generateSimpleMutations(filterGeneralState)
};

export default mutations;
