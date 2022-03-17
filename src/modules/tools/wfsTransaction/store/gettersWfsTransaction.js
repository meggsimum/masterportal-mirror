import {generateSimpleGetters} from "../../../../app-store/utils/generators";
import initialState from "./stateWfsTransaction";

const getters = {
    ...generateSimpleGetters(initialState)
};

export default getters;
