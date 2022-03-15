
import actions3DMap from "./actions3DMap.js";
import actionsMapAttributesMapper from "./actionsMapAttributesMapper.js";
import actionsMapInteractions from "./actionsMapInteractions.js";
import actionsMapInteractionsZoomTo from "./actionsMapInteractionsZoomTo.js";
import actionsMapLayers from "./actionsMapLayers.js";
import actionsMapMode from "./actionsMapMode.js";
import highlightFeature from "./highlightFeature.js";

export default {

    /**
         * .
         * @param {Object} payload parameter object

        * @returns {void}
        */
    functionstoadd () {
        // let coord;
    },
    ...actions3DMap,
    ...actionsMapAttributesMapper,
    ...actionsMapInteractions,
    ...actionsMapInteractionsZoomTo,
    ...actionsMapLayers,
    ...actionsMapMode,
    ...highlightFeature
};
