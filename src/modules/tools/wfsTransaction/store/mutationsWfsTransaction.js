import {generateSimpleMutations} from "../../../../app-store/utils/generators";
import initialState from "./stateWfsTransaction";

const mutations = {
    ...generateSimpleMutations(initialState)
};

export default mutations;
