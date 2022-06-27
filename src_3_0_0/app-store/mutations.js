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
     * Sets layer configuration.
     * @param {Object} state store state
     * @param {Object} layerConfig Layerconfig from config.json
     * @returns {void}
     */
    setLayerConfig (state, layerConfig) {
        state.layerConfig = layerConfig;
    },

    /**
     * Sets portal configuration.
     * @param {Object} state store state
     * @param {Object} portalConfig Portalconfig from config.json
     * @returns {void}
     */
    setPortalConfig (state, portalConfig) {
        state.portalConfig = portalConfig;
    },

    /**
     * Sets rest services configuration.
     * @param {Object} state store state
     * @param {Object} restConfig rest-services.json
     * @returns {void}
     */
    setRestConfig (state, restConfig) {
        state.restConfig = restConfig;
    }
};
