import {fetchFirstModuleConfig} from "../../../../utils/fetchFirstModuleConfig.js";
import FilterConfigConverter from "../utils/filterConfigConverter.js";

/**
 * @const {String} configPath an array of possible config locations. First one found will be used
 */
const configPaths = [
    "configJson.Portalconfig.menu.filterGeneral",
    "configJson.Portalconfig.menu.tools.children.filterGeneral"
];

export default {
    /**
     * Sets the config-params of this tool into state.
     * @param {Object} context the context Vue instance
     * @returns {Boolean} false, if config does not contain the tool
     */
    initialize: context => fetchFirstModuleConfig(context, configPaths, "filterGeneral"),

    /**
     * Converts the current config to a new version if the current config is of an older version.
     * @param {Object} context the context Vue instance
     * @returns {void}
     */
    convertConfig: context => {
        const converter = new FilterConfigConverter(context.state);

        if (!converter.isOldConfig()) {
            return;
        }
        if (converter.checkboxClassicExists()) {
            context.commit("setActive", true);
        }
        context.commit("setSaveTo", converter.getSaveTo());
        context.commit("setLayerSelectorVisible", converter.getLayerSelectorVisible());
        context.commit("setLayers", converter.getLayers());
    }
};
