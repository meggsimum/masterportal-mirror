import source from "../utils/measureSource";
import makeDraw2d from "../utils/measureDraw";
import makeDraw3d from "../utils/measureDraw3d";

export default {
    /**
     * Deletes all geometries from the measure layer,
     * and removes belonging UI/state.
     * @return {void}
     */
    deleteFeatures ({state, commit}) {
        const {unlisteners, interaction} = state;

        if (interaction) {
            interaction.abortDrawing();
        }
        unlisteners.forEach(unlistener => unlistener());
        source.clear();

        commit("setLines", {});
        commit("setPolygons", {});
        commit("setUnlisteners", []);
    },
    /**
     * Creates a new draw interaction depending on state to either draw
     * lines or polygons. The method will first remove any prior draw
     * interaction created by this tool.
     * @returns {void}
     */
    createDrawInteraction ({state, dispatch, commit, rootGetters, rootState, getters}) {
        dispatch("removeDrawInteraction");

        let interaction = null;

        if (rootGetters["Maps/is3D"]) {
            dispatch("deleteFeatures");
            interaction = makeDraw3d(
                mapCollection.getMap("3D"),
                rootGetters["Maps/projectionCode"],
                unlistener => commit("addUnlistener", unlistener),
                rootState._store
            );
        }
        else {
            if (getters.unlisteners.length) {
                // if unlisteners are registered, this indicates 3D mode was active immediately before
                dispatch("deleteFeatures");
            }
            const {selectedGeometry} = state;

            interaction = makeDraw2d(
                selectedGeometry,
                feature => commit("addFeature", feature),
                flag => commit("setIsDrawing", flag),
                featureId => commit("setFeatureId", featureId),
                tooltipCoord => commit("setTooltipCoord", tooltipCoord)
            );
            dispatch("Maps/addInteraction", interaction, {root: true});
        }

        commit("setInteraction", interaction);
    },
    /**
     * Removes the draw interaction. This includes aborting any current
     * unfinished drawing, removing the interaction from the map, and
     * removing the interaction from the store.
     * @returns {void}
     */
    removeDrawInteraction ({state, dispatch, commit}) {
        const {interaction} = state;

        if (interaction) {
            interaction.abortDrawing();

            if (interaction.interaction3d) {
                // 3d interaction is not directly added to map, but provides it's own method
                interaction.stopInteraction();
            }
            else {
                dispatch("Maps/removeInteraction", interaction, {root: true});
            }

            commit("setInteraction", null);
        }
    }
};
