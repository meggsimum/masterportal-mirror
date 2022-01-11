import {fetchFirstModuleConfig} from "../../../../utils/fetchFirstModuleConfig";
import actionsSearchBarOnClickOrHover from "./actionsSearchBarOnClickOrHover";
import actionsSearchBarSearchInterfaces from "./actionsSearchBarSearchInterfaces";

/**
 * @const {String} configPath An array of possible config locations. First one found will be used.
 */
const configPaths = [
    "configJson.Portalconfig.searchBar"
];

export default {
    ...actionsSearchBarOnClickOrHover,
    ...actionsSearchBarSearchInterfaces,

    /**
     * Sets the config-params of the search bar into state.
     * @param {Object} context The context Vue instance.
     * @returns {Boolean} False, if config does not contain the tool.
     */
    initialize: context => {
        return fetchFirstModuleConfig(context, configPaths, "SearchBar");
    }
};
