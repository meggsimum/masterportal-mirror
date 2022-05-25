import {generateSimpleMutations} from "../../../../app-store/utils/generators";
import initialState from "./stateSaveSelection";

const mutations = {
    ...generateSimpleMutations(initialState)
};

export default mutations;
