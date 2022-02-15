import titlePortalState from "./statePortalTitle";
import {generateSimpleGetters} from "../../../app-store/utils/generators";

const getters = {
    ...generateSimpleGetters(titlePortalState)
};

export default getters;
