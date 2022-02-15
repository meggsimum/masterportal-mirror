
import {generateSimpleGetters} from "../../../../app-store/utils/generators";
import filterGeneralState from "./stateFilterGeneral";

const getters = {
    ...generateSimpleGetters(filterGeneralState)

    // NOTE overwrite getters here if you need a special behaviour in a getter
};

export default getters;
