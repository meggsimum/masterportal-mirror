import {fetchFirstModuleConfig} from "../../utils/fetchFirstModuleConfig";
import getComponent from "../../utils/getComponent";


const actions = {
    /**
     * Sets the parameter "active" to the given parameter for the tool with the given id.
     * Note: The toolId specified in the global state is not the same as tool.id.
     * @param {Object} payload The given parameters
     * @param {String} payload.id The id of the Tool to be (de-)activated
     * @param {String} payload.active Value for (de-)activation
     * @returns {void}
     */
    setToolActive ({state, commit, dispatch}, {id, active}) {
        const toolId = Object.keys(state).find(tool => state[tool]?.id?.toLowerCase() === id?.toLowerCase());

        if (toolId !== undefined) {
            dispatch("controlActivationOfTools", state[toolId].name);
            commit(toolId + "/setActive", active);
            if (toolId !== "Gfi") {
                commit("Gfi/setActive", !state[toolId].deactivateGFI);
            }
        }
    },

    /**
     * Sets the translated name of the tool to the given parameter for the tool with the given id.
     * @param {Object} payload The given parameters
     * @param {String} payload.id The id of the Tool
     * @param {String} payload.name The translated name of the Tool
     * @returns {void}
     */
    languageChanged ({state, commit}, {id, name}) {
        const toolId = Object.keys(state).find(tool => state[tool]?.id?.toLowerCase() === id?.toLowerCase());

        if (toolId !== undefined) {
            commit(toolId + "/setName", name);
        }
    },

    /**
     * Sets the config-params for every configured tool into state from that tool.
     * @param {Object} context the context Vue instance
     * @param {Object} configuredTool the tool component
     * @returns {Boolean} false, if config does not contain the tool
     */
    pushAttributesToStoreElements: (context, configuredTool) => {
        return fetchFirstModuleConfig(context, [configuredTool.configPath], configuredTool.key.charAt(0).toUpperCase() + configuredTool.key.slice(1));
    },

    /**
     * Adds a tool dynamically to componentMap.
     * @param {Object} tool tool to be added dynamically
     * @returns {void}
     */
    addTool: ({state, commit}, tool) => {
        const toolName = tool.name !== undefined ? tool.name.charAt(0).toLowerCase() + tool.name.slice(1) : tool.name;

        commit("setComponentMap", Object.assign(state.componentMap, {[toolName]: tool}));
    },

    /**
     * Control the activation of the tools.
     * Deactivate all activated tools except the gfi tool and then activate the given tool if it is available.
     * @param {String} activeToolName - Name of the tool to be activated.
     * @returns {void}
     */
    controlActivationOfTools: ({getters, commit, dispatch}, activeToolName) => {
        getters.getActiveToolNames.forEach(tool => commit(tool + "/setActive", false));

        if (getters.getConfiguredToolNames.includes(activeToolName)) {
            commit(activeToolName + "/setActive", true);
            dispatch("activateToolInModelList", activeToolName);
        }
    },

    /**
    * Sets the active property of the state form tool which has the parameter isActive: true
    * Also starts processes if the tool is activated (active === true).
    * The gfi is excluded, because it is allowed to be active in parallel with another tool.
    * @returns {void}
    */
    setToolActiveByConfig ({state, getters, commit, dispatch}) {
        const activeTools = getters.getActiveToolNames,
            firstActiveTool = activeTools.find(tool => tool !== "Gfi");

        if (firstActiveTool !== undefined) {
            activeTools.forEach(tool => commit(tool + "/setActive", false));

            commit(firstActiveTool + "/setActive", true);
            dispatch("activateToolInModelList", firstActiveTool);
            if (activeTools.includes("Gfi") && state[firstActiveTool]?.deactivateGFI !== true) {
                commit("Gfi/setActive", true);
            }

            dispatch("errorMessageToManyToolsActive", {activeTools, firstActiveTool});
        }
    },

    /**
     * Print error message if to many tools has the attribute active: true.
     * @param {Object} context Context of this vue store.
     * @param {Object} payload The payload
     * @param {String[]} payload.activeTools Alls active tools.
     * @param {String} payload.firstActiveTool The activated tool.
     * @returns {void}
     */
    errorMessageToManyToolsActive (context, {activeTools, firstActiveTool}) {
        const activeToolsWithoutFirstActiveAndGfi = activeTools.filter(tool => tool !== firstActiveTool && tool !== "Gfi");

        if (activeToolsWithoutFirstActiveAndGfi.length > 0) {
            console.error("More than one tool has the configuration parameter 'active': true."
                + " Only one entry is considered. Therefore the tool(s): "
                + activeToolsWithoutFirstActiveAndGfi
                + " is/are not activated!");
        }
    },

    /**
     * Activates a tool in the ModelList.
     * @param {String} activeTool The tool to activate.
     * @returns {void}
     */
    activateToolInModelList ({state}, activeTool) {
        const model = getComponent(state[activeTool]?.id);

        if (model) {
            model.set("isActive", true);
        }
    },

    /**
     * Adds the name and glyphicon of a tool to the ModelList, because they are used by the menu.
     * @param {String} activeTool The tool to set name.
     * @returns {void}
     */
    addToolNameAndGlyphiconToModelList ({state}, activeTool) {
        const activeToolState = state[activeTool],
            model = getComponent(activeToolState?.id);

        if (model) {
            model.set("name", i18next.t(activeToolState?.name));
            model.set("glyphicon", activeToolState?.glyphicon);
        }
    }
};

export default actions;
