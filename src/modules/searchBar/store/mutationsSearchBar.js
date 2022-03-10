import {generateSimpleMutations} from "../../../app-store/utils/generators";
import searchBarState from "./stateSearchBar";

const mutations = {
    ...generateSimpleMutations(searchBarState),

    /**
     * Adds an instance of a search interface to searchInterfaceInstances.
     * @param {Object} state The state of search bar.
     * @param {SearchInterface} searchInterfaceInstance The instance of a search interface.
     * @returns {void}
     */
    addSearchInterfaceInstances (state, searchInterfaceInstance) {
        state.searchInterfaceInstances.push(searchInterfaceInstance);
    },

    /**
     * Adds search hits to result or suggestion list depending on search type.
     * @param {Object} state The state of search bar.
     * @param {Object} param The params.
     * @param {Object} param.instance The search instance.
     * @param {Object} param.searchHits The search hits.
     * @param {Object} param.searchType The search type.
     * @returns {void}
     */
    addSearchHits (state, {instance, searchHits, searchType}) {
        const hits = {
            searchInterfaceId: instance.searchInterfaceId,
            searchState: instance.searchState,
            totalHits: instance.totalHits
        };

        if (searchType === "suggestion") {
            hits.searchSuggestions = searchHits;
            state.searchSuggestions.push(hits);
        }
        else if (searchType === "result") {
            hits.searchResults = searchHits;
            state.searchResults.push(hits);
        }
    }
};

export default mutations;
