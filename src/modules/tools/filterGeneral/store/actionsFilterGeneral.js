import {fetchFirstModuleConfig} from "../../../../utils/fetchFirstModuleConfig";

/**
 * @const {String} configPath an array of possible config locations. First one found will be used
 */
const configPaths = [
    "configJson.Portalconfig.menu.filterGeneral"
];


export default {
    /**
     * Sets the config-params of this tool into state.
     * @param {Object} context the context Vue instance
     * @returns {Boolean} false, if config does not contain the tool
     */

    initialize: context => fetchFirstModuleConfig(context, configPaths, "filterGeneral")
};
