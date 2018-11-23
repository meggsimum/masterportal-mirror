import defaults from "../defaults";

/**
 * Returns the layers to be initialized as soon as services are known.
 * @param {object} config - configuration object
 * @returns {object[]} array of layer initialization objects
 * @ignore
 */
export default function (config) {
    // user specified what to do => use that
    if (Array.isArray(config.layers)) {
        return config.layers;
    }

    // user didn't specify, layerConf is lgv services => use default for lgv services
    if (typeof config.layerConf === "undefined" || config.layerConf === defaults.layerConf) {
        return defaults.layers;
    }

    // user didn't specify, layerConf is not known => don't set anything initially
    return [];
}
