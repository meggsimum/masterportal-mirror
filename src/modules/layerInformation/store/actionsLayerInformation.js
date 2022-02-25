import {getRecordById} from "../../../api/csw/getRecordById";
import getProxyUrl from "../../../utils/getProxyUrl";

const actions = {

    /**
     * This will set the Layer Information
     * @param {Object} param.commit the commit
     * @param {Object} layerInformation the layerInformation that we get from the module
     * @returns {void}
     */
    layerInfo: function ({commit}, layerInformation) {
        commit("setLayerInfo", layerInformation);
        Radio.trigger("LayerInformation", "unhighlightLayerInformationIcon");
    },

    /**
     * This sets additional layerInformations in case of group layers
     * @param {Object} param.commit the commit
     * @param {Object} additionalLayer the layerInformation for each other group layer
     * @returns {void}
     */
    setAdditionalLayer: function ({commit}, additionalLayer) {
        commit("setAdditionalLayer", additionalLayer);
    },

    /**
     * This sets the layerInformation active (needed in model.js and group.js)
     * @param {Object} param.commit the commit
     * @param {Object} active the active state
     * @returns {void}
     */
    activate: function ({commit}, active) {
        commit("setActive", active);
    },

    /**
     * This sets the layerInformation active (needed in model.js and group.js)
     * @param {Object} param.commit the commit
     * @param {Object} currentLayerName the layerName
     * @returns {void}
     */
    setCurrentLayerName: function ({commit}, currentLayerName) {
        commit("setCurrentLayerName", currentLayerName);
    },

    /**
     * get the layer Infos that aren't in the store but saved in the object
     * @param {Object} param.dispatch the dispatch
     * @param {Object} param.state the state
     * @returns {void}
     */
    additionalSingleLayerInfo: async function ({dispatch, state}) {
        let metaId;

        if (typeof state.layerInfo.metaID === "string") {
            metaId = state.layerInfo.metaID;
        }
        else if (state.layerInfo.metaID) {
            metaId = state.layerInfo.metaID[0];
        }
        const cswUrl = state.layerInfo.cswUrl,
            metaInfo = {metaId, cswUrl};

        dispatch("getAbstractInfo", metaInfo);

    },

    /**
     * if the user changes the layerInfo Abstract Text via the dropdown for the group layers
     * @param {Object} param.dispatch the dispatch
     * @param {Object} param.state the state
     * @param {Object} chosenElementTitle the chosen Elementtitle, grouplayer, in the dropDown
     * @returns {void}
     */
    changeLayerInfo: async function ({dispatch, state}, chosenElementTitle) {
        let metaId = "",
            cswUrl = "",
            metaInfo = {},
            layer = "";
        const additionalLayer = state.additionalLayer;

        layer = additionalLayer.find(({layerName}) => layerName === chosenElementTitle);
        metaId = layer.metaID;
        cswUrl = layer.cswUrl;
        metaInfo = {metaId, cswUrl};

        dispatch("getAbstractInfo", metaInfo);
        dispatch("setMetadataURL", metaId);
    },

    /**
     * set all the abstract Infos for the layer
     * @param {Object} param.commit the commit
     * @param {Object} param.state the state
     * @param {Object} param.rootGetters the rootGetters
     * @param {Object} metaInfo the metaInformation that is necessary
     * @returns {void}
     */
    getAbstractInfo: async function ({commit, state, rootGetters}, metaInfo) {
        let metadata;

        /**
         * @deprecated in the next major-release!
         * useProxy
         * getProxyUrl()
         */
        if (rootGetters.metadata?.useProxy?.includes(metaInfo.cswUrl)) {
            metadata = await getRecordById(getProxyUrl(metaInfo.cswUrl), metaInfo.metaId);
        }
        else if (metaInfo.cswUrl !== null && typeof metaInfo.metaId !== "undefined") {
            metadata = await getRecordById(metaInfo.cswUrl, metaInfo.metaId);
        }
        // use default csw_url from rest-services.json if csw_url not stated in the specific service
        else if (Config.cswId !== null && typeof Config.cswId !== "undefined") {
            const service = rootGetters.getRestServiceById(Config.cswId);
            let metaURL = "";

            if (service === undefined) {
                console.warn("Rest Service with the ID " + Config.cswId + " is not configured in rest-services.json!");
            }
            else {
                metaURL = service.url;
            }

            if (metaURL !== "" && typeof metaInfo.metaId !== "undefined") {
                metadata = await getRecordById(metaURL, metaInfo.metaId);
            }
        }

        if (typeof metadata === "undefined") {
            commit("setTitle", "");
            commit("setPeriodicityKey", "");
            commit("setDateRevision", "");
            commit("setDatePublication", "");
            commit("setAbstractText", i18next.t("common:modules.layerInformation.noMetadataLoaded"));
            commit("setNoMetadataLoaded", i18next.t("common:modules.layerInformation.noMetadataLoaded"));
        }
        else {
            commit("setTitle", metadata?.getTitle());
            commit("setAbstractText", metadata?.getAbstract());
            commit("setPeriodicityKey", metadata?.getFrequenzy());
            commit("setDateRevision", metadata?.getRevisionDate());
            commit("setDownloadLinks", metadata?.getDownloadLinks());
            commit("setDatePublication", metadata?.getPublicationDate() || metadata?.getCreationDate());
        }

        if (state.downloadLinks) {
            const downloadLinks = [];

            state.downloadLinks.forEach(link => {
                downloadLinks.push(link);
            });
            commit("setDownloadLinks", Radio.request("Util", "sortBy", downloadLinks, "linkName"));
        }
    },

    /**
     * Checks the array of metaIDs and creates array metaURL with complete URL for template. Does not allow duplicated entries
     * @param {Object} param.state the state
     * @param {Object} param.commit the commit
     * @param {Object} metaId the given metaId for one layer
     * @returns {void}
     */
    setMetadataURL: function ({state, commit, rootGetters}, metaId) {
        const metaURLs = [],
            metaDataCatalogueId = state.metaDataCatalogueId;
        let metaURL = "",
            service = null;

        service = rootGetters.getRestServiceById(metaDataCatalogueId);
        if (typeof state.layerInfo.showDocUrl !== "undefined" && state.layerInfo.showDocUrl !== null) {
            metaURL = state.layerInfo.showDocUrl + metaId;
        }
        else if (service !== undefined) {
            metaURL = service.url + metaId;
        }
        else {
            console.warn("Rest Service with the ID " + metaDataCatalogueId + " is not configured in rest-services.json!");
        }

        if (metaId !== null && metaId !== "" && metaURLs.indexOf(metaURL) === -1) {
            metaURLs.push(metaURL);
        }

        commit("setMetaURLs", metaURLs);
    },

    /**
     * set Parameters from configuration
     * @param {Object} param.commit - the commit
     * @param {Object} config - Configuration
     * @returns {void}
     */
    setConfigParams: function ({commit}, config) {
        if (config.layerInformation !== undefined && config.layerInformation.showUrlGlobal !== null) {
            commit("setShowUrlGlobal", config.layerInformation.showUrlGlobal);
        }
        else if (config.layerInformation === undefined) {
            commit("setShowUrlGlobal", undefined);
        }
    }

};

export default actions;
