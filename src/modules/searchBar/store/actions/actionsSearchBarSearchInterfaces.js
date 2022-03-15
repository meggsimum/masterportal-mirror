/**
 * Contains actions that communicate with the search interfaces.
 */
import SearchInterfaceGazetteer from "../../searchInterfaces/searchInterfaceGazetteer";

export default {
    /**
     * Instantiate the configured search interfaces
     * and stores them in the state.
     * @returns {void}
     */
    instantiateSearchInterfaces: ({state, commit}) => {
        const searchInterfacesMapper = {
            gazetteer: SearchInterfaceGazetteer
        };

        Object.keys(state.searchInterfaces).forEach(searchInterface => {
            commit("addSearchInterfaceInstances", new searchInterfacesMapper[searchInterface](state.searchInterfaces[searchInterface]));
        });
    },

    /**
     * Send search input to configured searchInterfaces
     * and push the response objects to the state attribute "searchResults".
     * @param {Object} payload The payload.
     * @param {Object} payload.searchInput The search input.
     * @param {Object} [payload.searchType="result"] The search type "suggestion" or "result".
     * @returns {void}
     */
    search: ({state, commit}, {searchInput, searchType = "result"}) => {
        state.searchInterfaceInstances.forEach(instance => {
            instance.search(searchInput, searchType)
                .then(searchHits => {
                    commit("addSearchHits", {searchHits, searchType});
                });
        });
    }
};
