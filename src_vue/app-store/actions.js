import axios from "axios";
import {initializeLayerList} from "@masterportal/masterportalapi/src/rawLayerList";

export default {
    /**
     * Load the rest-services.json.
     * @param {Object} portalConf The URL to config.json.
     * @returns {void}
     */
    loadConfigJson ({commit}, portalConf) {
        const format = ".json";
        let targetPath = "config.json";

        if (portalConf?.slice(-5) === format) {
            targetPath = portalConf;
        }

        axios.get(targetPath)
            .then(response => {
                commit("setPortalConfig", response.data?.Portalconfig);
                commit("setThemenConfig", response.data?.Themenconfig);
            })
            .catch(error => {
                console.error(`Error occured during loading config.json specified by config.js (${targetPath}).`, error);
            });
    },

    /**
     * Load the rest-services.json.
     * @param {Object} restConf The URL to rest-services.json.
     * @returns {void}
     */
    loadRestServicesJson ({commit}, restConf) {
        axios.get(restConf)
            .then(response => {
                commit("setRestConf", response.data);
            })
            .catch(error => {
                console.error(`Error occured during loading rest-services.json specified by config.js (${restConf}).`, error);
            });
    },

    /**
     * Load the services.json.
     * @param {object} _ Store state.
     * @param {Object} layerConf The URL to services.json.
     * @returns {void}
     */
    loadServicesJson (_, layerConf) {
        initializeLayerList(layerConf);
    }
};
