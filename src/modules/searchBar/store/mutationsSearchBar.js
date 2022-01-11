import {generateSimpleMutations} from "../../../app-store/utils/generators";
import searchBarState from "./stateSearchBar";

const mutations = {
    ...generateSimpleMutations(searchBarState)
};

export default mutations;
