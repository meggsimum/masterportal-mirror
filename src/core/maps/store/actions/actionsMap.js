
import * as actionsMapAttributesMapper from "./actionsMapAttributesMapper.js";
import * as actionsMapInteractions from "./actionsMapInteractions.js";
import * as actionsMapInteractionsZoomTo from "./actionsMapInteractionsZoomTo.js";
import * as actionsMapLayers from "./actionsMapLayers.js";
import * as actionsMapMode from "./actionsMapMode.js";
import * as highlightFeature from "./highlightFeature.js";

const actions = {

    /**
         * .
         * @param {Object} payload parameter object

        * @returns {void}
        */
    functionstoadd () {
        // let coord;
    },
    ...actionsMapAttributesMapper,
    ...actionsMapInteractions,
    ...actionsMapInteractionsZoomTo,
    ...actionsMapLayers,
    ...actionsMapMode,
    ...highlightFeature
};

export default actions;
