import {generateSimpleGetters} from "../../../app-store/utils/generators";
import searchBarState from "./stateSearchBar";

const getters = {
    ...generateSimpleGetters(searchBarState)
};

export default getters;
