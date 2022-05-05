import {generateSimpleMutations} from "../../../app-store/utils/generators";
import mouseHoverState from "./stateMouseHover";
import {getLayerList} from "@masterportal/masterportalapi/src/rawLayerList";

const mutations = {
    /**
     * Creates from every state-key a setter.
     * For example, given a state object {key: value}, an object
     * {setKey:   (state, payload) => *   state[key] = payload * }
     * will be returned.
     */
    ...generateSimpleMutations(mouseHoverState),
    /**
     * Sets the layers with a mouseHoverField to the state
     * @param {Object} state Context state object.
     * @returns {Array} array of all layers with a mouseHoverFild property
     */
    setMouseHoverLayers: (state) => {
        state.mouseHoverLayers = getLayerList().filter(layer => {
            return layer?.mouseHoverField && layer.mouseHoverField !== "";
        });
    },
    /**
     * Sets the mouseHoverInfos of each layer to the state
     * @param {Object} state Context state object.
     * @returns {Array} array of all layers object with their id and mouseHoverField information
     */
    setMouseHoverInfos: (state) => {
        state.mouseHoverInfos = state.mouseHoverLayers.map(layer => {
            return {id: layer.id, mouseHoverField: layer.mouseHoverField};
        });
    }
};

export default mutations;
