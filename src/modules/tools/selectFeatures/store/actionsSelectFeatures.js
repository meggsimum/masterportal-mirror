export default {
    /**
<<<<<<< HEAD
     * Highlights a feature depending on its geometryType.
     * @param {Object} param.state the state
     * @param {Object} param.dispatch the dispatch
     * @param {String} feature id of the feature to be highlighted.
     * @returns {void}
     */
    highlightFeature ({state, rootGetters, dispatch}, {featureId, layerId}) {
        dispatch("Map/removeHighlightFeature", "decrease", {root: true});
        const layer = rootGetters["Map/visibleLayerList"].find((l) => l.values_.id === layerId),
            featureGeometryType = featureId.getGeometry().getType(),
            featureIdString = featureId.getId(),
            styleObj = featureGeometryType.toLowerCase().indexOf("polygon") > -1 ? state.highlightVectorRulesPolygon : state.highlightVectorRulesPointLine,
            highlightObject = {
                type: featureGeometryType === "Point" || featureGeometryType === "MultiPoint" ? "increase" : "highlightPolygon",
                id: featureIdString,
                layer: layer,
                feature: featureId,
                scale: styleObj.image?.scale
            };

        if (featureGeometryType === "LineString") {
            highlightObject.type = "highlightLine";
        }
=======
     * Hover event that gets triggered when hovering over a feature in the list view.
     * @param {Object} param.state the state
     * @param {Object} param.dispatch the dispatch
     * @param {String} featureIndex index of the clicked Feature
     * @returns {void}
     */
    hoverOverFeature ({state, dispatch}, featureIndex) {
        if (featureIndex !== "" && featureIndex >= 0 && featureIndex <= state.shownFeatures) {
            const feature = state.nestedFeatures ? state.rawFeaturesOfLayer[featureIndex] : state.layer.features[featureIndex];

            dispatch("highlightFeature", feature.getId());
        }
    },
    /**
     * Highlights a feature depending on its geometryType.
     * @param {Object} param.state the state
     * @param {Object} param.dispatch the dispatch
     * @param {String} featureId id of the feature to be highlighted.
     * @returns {void}
     */
    highlightFeature ({state, rootGetters, dispatch}, {feature, layerId}) {
        dispatch("Map/removeHighlightFeature", "decrease", {root: true});
        let featureGeometryType = "";
        const layer = rootGetters["Map/visibleLayerList"].find((l) => l.values_.id === layerId),
            // layerFeatures = state.nestedFeatures ? state.rawFeaturesOfLayer : layer.getSource().getFeatures(),
            // featureWrapper = layerFeatures.find(feat => {
            //     featureGeometryType = feat.getGeometry().getType();
            //     return feat.getId().toString() === featureId;
            // }),
            styleObj = state.layer.geometryType.toLowerCase().indexOf("polygon") > -1 ? state.highlightVectorRulesPolygon : state.highlightVectorRulesPointLine,
            highlightObject = {
                type: featureGeometryType === "Point" || featureGeometryType === "MultiPoint" ? "increase" : "highlightPolygon",
                id: featureId,
                layer: layer,
                feature: feature,
                scale: styleObj.image?.scale
            };

>>>>>>> 18c2bb2b3 (first try to highlight features)
        layer.id = layerId;

        if (highlightObject.type === "highlightPolygon") {
            highlightObject.highlightStyle = {
                fill: styleObj.fill,
                stroke: styleObj.stroke,
                image: styleObj.image
            };
        }
<<<<<<< HEAD
        else if (highlightObject.type === "highlightLine" || highlightObject.type === "increase") {
            highlightObject.highlightStyle = {
                stroke: styleObj.stroke,
                image: styleObj.image
            };
        }
=======
>>>>>>> 18c2bb2b3 (first try to highlight features)
        dispatch("Map/highlightFeature", highlightObject, {root: true});
    }
};

