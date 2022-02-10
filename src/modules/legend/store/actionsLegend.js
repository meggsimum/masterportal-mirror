import {fetchFirstModuleConfig} from "../../../utils/fetchFirstModuleConfig";

/** @const {String} [Path array of possible config locations. First one found will be used] */
/** @const {object} [vue actions] */
const configPaths = [
        "configJson.Portalconfig.legend",
        "configJson.Portalconfig.menu.legend",
        "configJson.Portalconfig.menu.tools.children.legend"
    ],
    actions = {
        /**
         * Sets the config-params of this tool into state.
         * @param {object} context the context Vue instance
         * @returns {boolean} false, if config does not contain the tool
         */
        getLegendConfig: context => {
            return fetchFirstModuleConfig(context, configPaths, "Legend");
        },

        /**
         * Shows or hides the legend.
         * @param {Object} param.commit the commit
         * @param {Boolean} showLegend Flag if legend should be shown or not
         * @returns {void}
         */
        setShowLegend: function ({commit}, showLegend) {
            commit("setShowLegend", showLegend);
        },

        /**
         * Adds the legend of one layer to the legends in the store
         * @param {Object} param.commit the commit
         * @param {Object} param.state the state
         * @param {Object} legendObj Legend object of one layer
         * @returns {void}
         */
        addLegend: function ({state, commit}, legendObj) {
            const legends = state.legends;

            if (!legends.find(layer => layer.name === legendObj.name)) {
                legends.push(legendObj);
                commit("setLegends", legends);
            }
        },

        /**
         * Sorts the Legend Entries by position descending
         * @param {Object} param.commit the commit
         * @param {Object} param.state the state
         * @returns {void}
         */
        sortLegend: function ({state, commit}) {
            const sorted = state.legends.sort(function (a, b) {
                return b.position - a.position;
            });

            commit("setLegends", sorted);
        },

        /**
         * Removes a layer legend from the legends in the store by given id.
         * @param {Object} param.commit the commit
         * @param {Object} param.state the state
         * @param {String} id Id of layer.
         * @returns {void}
         */
        removeLegend: function ({state, commit}, id) {
            const legends = state.legends.filter((legendObj) => {
                return legendObj.id !== id;
            });

            commit("setLegends", legends);
        },

        /**
         * Sets the ShowLegendInMenu to the given value
         * @param {Object} param.commit the commit
         * @param {Boolean} value true or false
         * @returns {void}
         */
        setShowLegendInMenu: function ({commit}, value) {
            commit("setShowLegendInMenu", value);
        },

        /**
         * Sets the id of the layer to state.layerIdForLayerInfo
         * @param {Object} param.commit the commit
         * @param {String} id Id of layer
         * @returns {void}
         */
        setLayerIdForLayerInfo: function ({commit}, id) {
            commit("setLayerIdForLayerInfo", id);
        },

        /**
         * Sets the time as counter id to state.layerCounterIdForLayerInfo
         * @param {Object} param.commit the commit
         * @param {String} time the timestamp used as id
         * @returns {void}
         */
        setLayerCounterIdForLayerInfo: function ({commit}, time) {
            commit("setLayerCounterIdForLayerInfo", time);
        },

        /**
         * Sets the legendObj to state.layerInfoLegend
         * @param {Object} param.commit the commit
         * @param {String} legendObj contains legend infos
         * @returns {void}
         */
        setLegendForLayerInfo: function ({commit}, legendObj) {
            commit("setLayerInfoLegend", legendObj);
        },

        /**
         * This will check if legend is changed from other module/component
         * @param {Object} param.commit the commit
         * @param {Object} legendValue the changed legend value
         * @returns {void}
         */
        setLegendOnChanged: function ({commit}, legendValue) {
            commit("setLegendOnChanged", legendValue);
        }
    };

export default actions;
