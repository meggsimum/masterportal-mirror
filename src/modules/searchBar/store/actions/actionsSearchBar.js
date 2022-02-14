/**
 * Contains global actions of the search bar.
 */

import {fetchFirstModuleConfig} from "../../../../utils/fetchFirstModuleConfig";
import actionsSearchBarResultList from "./actionsSearchBarResultList";
import actionsSearchBarSearchInterfaces from "./actionsSearchBarSearchInterfaces";
import actionsSearchBarSearchResult from "./actionsSearchBarSearchResult";
import actionsSearchBarSuggestionList from "./actionsSearchBarSuggestionList";
import SearchInterface from "../../searchInterfaces/searchInterface";

/**
 * @const {String} configPath An array of possible config locations. First one found will be used.
 */
const configPaths = [
    "configJson.Portalconfig.searchBar"
];

export default {
    ...actionsSearchBarResultList,
    ...actionsSearchBarSearchInterfaces,
    ...actionsSearchBarSearchResult,
    ...actionsSearchBarSuggestionList,

    /**
     * Sets the config-params of the search bar into state.
     * @param {Object} context The context Vue instance.
     * @returns {Boolean} False, if config does not contain the tool.
     */
    initialize: context => {
        return fetchFirstModuleConfig(context, configPaths, "SearchBar");
    },

    /**
     * Overwrite default values in search interface.
     * @returns {void}
     */
    overwriteDefaultValues: ({state}) => {
        SearchInterface.prototype.timeout = state.timeout;
    }
};
