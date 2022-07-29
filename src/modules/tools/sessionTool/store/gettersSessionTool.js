
import {generateSimpleGetters} from "../../../../app-store/utils/generators";
import sessionToolState from "./stateSessionTool";

const getters = {
    ...generateSimpleGetters(sessionToolState)

    // NOTE overwrite getters here if you need a special behaviour in a getter
};

export default getters;
