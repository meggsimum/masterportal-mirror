import mouseHoverState from "./stateMouseHover";
import {generateSimpleGetters} from "../../../app-store/utils/generators";

const getters = {
    ...generateSimpleGetters(mouseHoverState)
};

export default getters;
