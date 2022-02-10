import actions from "../app-store/actions"; // https://stackoverflow.com/questions/40487627/can-i-call-commit-from-one-of-mutations-in-vuex-store
import {setValuesToState} from "../utils/parametricUrl/stateModifier";

// The objects deprecatedParamsConfigJson and deprecatedParamsConfigJs store the current respectively new parameters and the related deprecated parameters.
// The key describes the current parameter or more precisely the path to the new/current path.
// The corresponding value describes the old path with the deprecated parameter.
// Later on the algorithm takes the old path, estimates the content and rewrites the content to the new path / new parameter.
// The old deprecated path will be removed.
// Please notice that the replacement only effects the state. This means that the changes only have impact on the vue-components.
// Nevertheless you can or even should specify deprecated backbone parameters here.

const deprecatedParamsConfigJson = {
        "Portalconfig.portalTitle.title": ["Portalconfig.PortalTitle"],
        "Portalconfig.portalTitle.logo": ["Portalconfig.PortalLogo"],
        "Portalconfig.portalTitle.link": ["Portalconfig.LogoLink"],
        "Portalconfig.portalTitle.toolTip": ["Portalconfig.portalTitle.tooltip", "Portalconfig.LogoToolTip"],
        "Portalconfig.searchBar.bkg.zoomToResultOnHover": ["Portalconfig.searchBar.bkg.zoomToResult"],
        "Portalconfig.treeType": ["Portalconfig.Baumtyp"],
        "Portalconfig.controls.overviewMap.layerId": ["Portalconfig.controls.overviewMap.baselayer"],
        "Portalconfig.mapView.startResolution": ["Portalconfig.mapView.resolution"],
        "Portalconfig.mapView.startZoomLevel": ["Portalconfig.mapView.zoomLevel"],
        "Portalconfig.menu.tools.children.fileImport": ["Portalconfig.menu.tools.children.kmlimport", "Portalconfig.Portalconfig.menu.kmlimport"],
        "Portalconfig.menu.tools.children.supplyCoord": ["Portalconfig.menu.tools.children.coord", "Portalconfig.Portalconfig.menu.coord"]
    },
    deprecatedParamsConfigJs = {
        "startUpModul": ["isInitOpen"]
    };

export default {
    /**
     * Sets store to store.
     * @param {Object} state store state
     * @param {Object} store vuex store
     * @returns {void}
     */
    setStore (state, store) {
        state._store = store;
    },
    /**
     * Sets config.json.
     * @param {Object} state store state
     * @param {Object} config config.json
     * @returns {void}
     */
    setConfigJson (state, config) {
        state.configJson = actions.checkWhereDeprecated(deprecatedParamsConfigJson, config);
    },
    /**
     * Sets config.js.
     * @param {Object} state store state
     * @param {Object} config config.js
     * @returns {void}
     */
    setConfigJs (state, config) {
        state.configJs = actions.checkWhereDeprecated(deprecatedParamsConfigJs, config);
    },
    /**
     * Sets mobile flag.
     * @param {Object} state store state
     * @param {Boolean} mobile whether browser resolution indicates mobile device
     * @returns {void}
     */
    setMobile (state, mobile) {
        state.mobile = mobile;
    },
    /**
     * Sets i18NextInitialized flag. Is done after languages for addons are loaded.
     * @param {Object} state store state
     * @param {Boolean} isInitialized whether i18Next is initialized
     * @returns {void}
     */
    setI18Nextinitialized (state, isInitialized) {
        state.i18NextInitialized = isInitialized;
    },
    /**
     * Sets easyReadMode on/off flag. Can be used for all modules that offer easy read mode to listen to this state change.
     * @param {Object} state store state
     * @param {Boolean} isEasyReadMode whether easyReadMode is enabled
     * @returns {void}
     */
    setEasyReadMode (state, isEasyReadMode) {
        state.easyReadMode = isEasyReadMode;
    },
    /**
     * Sets the url params at state and produces desired reaction.
     * @param {Object} state vuex state
     * @param {URLSearchParams} params an instance of URLSearchParams
     * @returns {void}
     */
    setUrlParams (state, params) {
        setValuesToState(state, params);
    }
};
