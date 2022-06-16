/**
 * User type definition
 * @typedef {Object} app-storeState
 * @property {Object} configJs The config.js data.
 * @property {Object} portalConfig The portal configuration.
 * @property {Object} restConf The rest-services.json data.
 * @property {Object} themenConfig The tehmen configuration.
 */
const state = {
    configJs: null,
    portalConfig: null,
    restConf: null,
    themenConfig: null
};

export default state;
