import {generateSimpleMutations} from "../../../app-store/utils/generators";
import stateZoomToFeature from "./stateZoomToFeature";

const mutations = {
    ...generateSimpleMutations(stateZoomToFeature)
};

export default mutations;
