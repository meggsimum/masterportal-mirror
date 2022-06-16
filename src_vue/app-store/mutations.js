export default {
    /**
     * Sets config.js.
     * @param {Object} state store state
     * @param {Object} configJs config.js
     * @returns {void}
     */
    setConfigJs (state, configJs) {
        state.configJs = configJs;
    },
    /**
     * Sets config.js.
     * @param {Object} state store state
     * @param {Object} portalConfig Portalconfig from config.json
     * @returns {void}
     */
    setPortalConfig (state, portalConfig) {
        state.portalConfig = portalConfig;
    },

    /**
     * Sets config.js.
     * @param {Object} state store state
     * @param {Object} themenConfig Themenconfig from config.json
     * @returns {void}
     */
    setThemenConfig (state, themenConfig) {
        state.themenConfig = themenConfig;
    },

    /**
     * Sets rest services configuration.
     * @param {Object} state store state
     * @param {Object} restConf rest-services.json
     * @returns {void}
     */
    setRestConf (state, restConf) {
        state.restConf = restConf;
    }
};
