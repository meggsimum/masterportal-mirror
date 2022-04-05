import state from "./stateMap";
// import mutations from "./mutationsMap";
import getters from "./gettersMap";
// import actions from "./actions/actionsMap";

/**
 * Module that abstracts ol/Map and makes access reactive.
 *
 * - One map source for the whole UI
 * - Pull complexity (and knowledge about OL details) from UI
 * - Can be used by multiple components and Remote Interface (deduplicating code)
 *     ________________
 *     |              |
 *     |     UI       |
 *     |______________|
 *          |     ^
 *   action |     | getter
 *          v     |
 *     ___________________
 *     |                 | -----
 *     | VueX Map Module |     | Actions produce appropriate mutations to keep in sync with Map
 *     |_________________| <----
 *         |     ^ .on-functions registered to mutations, if they exist;
 * setters |     | where they do not exist, all access must run via VueX mutations
 *         v     | to ensure VueX/Map are kept in sync, else VueX may have old state
 *     ________________
 *     |              |
 *     |    Map       |
 *     |______________|
 */
export default {
    namespaced: true,
    state,
    // actions,
    // mutations,
    getters
};
