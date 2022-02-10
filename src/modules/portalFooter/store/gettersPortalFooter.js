import {generateSimpleGetters} from "../../../app-store/utils/generators";
import portalFooterState from "./statePortalFooter";

const getters = {
    ...generateSimpleGetters(portalFooterState)

    // NOTE overwrite getters here if you need a special behaviour in a getter
};

export default getters;
