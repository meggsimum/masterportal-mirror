const actions = {
    /**
     * Sets the config-params of this MouseHover into state.
     * Adds the overlay and eventListener for the map.
     * @returns {void}
     */
    initialize ({rootGetters, state, commit, dispatch}) {
        const map = rootGetters["Maps/get2DMap"];

        map.on("click", (evt) => {
            map.forEachFeatureAtPixel(evt.pixel, (feature, layer) => {
                if (state.featureA && state.featureB) {
                    console.error("Error");
                }
                else if (state.featureA) {
                    const payloadB = {
                        layerId: layer.get("id"),
                        featureId: feature.id_
                    };

                    commit("setFeatureB", feature);
                    commit("setFeatureBLayerId", layer.get("id"));
                    dispatch("highlightFeature", payloadB);
                }
                else {
                    commit("setFeatureA", feature);
                    commit("setFeatureALayerId", layer.get("id"));
                }
                // console.log(feature, layer.get("id"));
            });
        });
    }
    // highlightFeature ({state, rootGetters, dispatch}, {layerId, featureId}) {
    //     console.log(featureId, layerId);
    //     dispatch("Maps/removeHighlightFeature", "decrease", {root: true});
    //     let featureGeometryType = "";
    //     const layer = rootGetters["Maps/getVisibleLayerList"].find((l) => l.values_.id === layerId),
    //         layerFeatures = layer.getSource().getFeatures(),
    //         featureWrapper = layerFeatures.find(feat => {
    //             featureGeometryType = feat.getGeometry().getType();
    //             return feat.getId().toString() === featureId;
    //         }),
    //         styleObj = state.highlightVectorRulesPointLine,
    //         highlightObject = {
    //             type: featureGeometryType === "Point" || featureGeometryType === "MultiPoint" ? "increase" : "highlightPolygon",
    //             id: featureId,
    //             layer: layer,
    //             feature: featureWrapper,
    //             scale: styleObj.image?.scale
    //         };

    //     layer.id = layerId;
    //     console.log(highlightObject, layer.id);

    //     if (highlightObject.type === "highlightPolygon") {
    //         highlightObject.highlightStyle = {
    //             fill: styleObj.fill,
    //             stroke: styleObj.stroke,
    //             image: styleObj.image
    //         };
    //     }
    //     dispatch("Maps/highlightFeature", highlightObject, {root: true});
    // }
};

export default actions;
