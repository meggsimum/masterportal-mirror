import {generateSimpleMutations} from "../../../app-store/utils/generators";
import initialState from "./stateMap";

const mutations = {
    ...generateSimpleMutations(initialState),
    setDownloadDataString: (state, payload) => {
        state.download.dataString = payload;
    }/* ,
    setExampleMutation: (state) => {
       ...
    }*/
};

export default mutations;
