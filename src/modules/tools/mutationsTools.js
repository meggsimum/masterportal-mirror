import {generateSimpleMutations} from "../../app-store/utils/generators";
import toolsState from "./stateTools";

const mutations = {
    /**
     * Creates from every state-key a setter.
     * For example, given a state object {key: value}, an object
     * {setKey:   (state, payload) => *   state[key] = payload * }
     * will be returned.
     */
    ...generateSimpleMutations(toolsState),

    /**
     * Filters the configured tools from the two configuration options:
     * "portalconfigs.menu" and "portalconfigs.menu.tools.children" in config.json.
     * @param {Object} state the state of Tools-module
     * @param {Object} menuConfig The menu entry of config.json
     * @returns {Object[]} The configured Tools.
     */
    setConfiguredTools (state, menuConfig) {
        const configPossibilitiesPaths = [
                "configJson.Portalconfig.menu",
                "configJson.Portalconfig.menu.tools.children",
                "configJson.Portalconfig.menu.info.children",
                "configJson.Portalconfig.menu.simulation.children",
                "configJson.Portalconfig.menu.utilities.children"
            ],
            configPossibilities = [
                menuConfig || {},
                menuConfig?.tools?.children || {},
                menuConfig?.info?.children || {},
                menuConfig?.simulation?.children || {},
                menuConfig?.utilities?.children || {}
            ],
            configuredTools = [];

        configPossibilities.forEach((toolsFromConfig, index) => {
            Object
                .keys(toolsFromConfig)
                .map(key => {
                    if (state.componentMap[key]) {
                        return {
                            component: state.componentMap[key],
                            configPath: configPossibilitiesPaths[index] + "." + key,
                            key
                        };
                    }
                    return key;
                })
                .filter(tool => typeof tool === "object")
                .forEach(configuredTool => configuredTools.push(configuredTool));
        });

        state.configuredTools = configuredTools;
    }
};

export default mutations;
