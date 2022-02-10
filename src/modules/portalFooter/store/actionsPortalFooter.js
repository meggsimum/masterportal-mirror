import {fetchFirstModuleConfig} from "../../../utils/fetchFirstModuleConfig";

/**
 * @const {String} configPaths an array of possible config locations. First one found will be used
 * @const {Object} actions vue actions
 */
const configPaths = [
        "configJs.footer"
    ],
    actions = {
        /**
         * Sets the config-params of this footer into state.
         * @param {Object} context the context Vue instance
         * @returns {Boolean} false, if config does not contain the footer
         */
        initialize: context => {
            return fetchFirstModuleConfig(context, configPaths, "Footer");
        }
    };

export default actions;
