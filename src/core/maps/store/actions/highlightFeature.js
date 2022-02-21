/**
 * check how to highlight
 * @param {Object} state state object
 * @param {Object} highlightObject contains several parameters for feature highlighting
 * @returns {void}
 */
function highlightFeature ({commit, dispatch}, highlightObject) {
    if (highlightObject.type === "increase") {
        increaseFeature(commit, highlightObject);
    }
    else if (highlightObject.type === "viaLayerIdAndFeatureId") {
        highlightViaParametricUrl(dispatch, highlightObject.layerIdAndFeatureId);
    }
    else if (highlightObject.type === "highlightPolygon") {
        highlightPolygon(commit, dispatch, highlightObject);
    }
}
/**
 * highlights a polygon feature
 * @param {Function} commit commit function
 * @param {Function} dispatch commit function
 * @param {Object} highlightObject contains several parameters for feature highlighting
 * @fires VectorStyle#RadioRequestStyleListReturnModelById
 * @returns {void}
 */
function highlightPolygon (commit, dispatch, highlightObject) {
    if (highlightObject.highlightStyle) {
        const newStyle = highlightObject.highlightStyle,
            feature = highlightObject.feature,
            styleObj = styleObject(highlightObject, feature),
            clonedStyle = styleObj ? styleObj.clone() : undefined;

        if (clonedStyle) {
            commit("setHighlightedFeature", feature);
            commit("setHighlightedFeatureStyle", feature.getStyle());

            if (clonedStyle.getFill()) {
                clonedStyle.getFill().setColor(newStyle.fill.color);
            }
            if (clonedStyle.getStroke()) {
                clonedStyle.getStroke().setColor(newStyle.stroke.color);
                clonedStyle.getStroke().setWidth(newStyle.stroke.width);
            }
            feature.setStyle(clonedStyle);

        }
    }
    else {
        dispatch("MapMarker/placingPolygonMarker", highlightObject.feature, {root: true});
    }

}
/**
 * highlights a feature via layerid and featureid
 * @param {Function} dispatch commit function
 * @param {String} layerIdAndFeatureId contains layerid and featureid
 * @fires ModelList#RadioRequestModelListGetModelByAttributes
 * @returns {void}
 */
function highlightViaParametricUrl (dispatch, layerIdAndFeatureId) {
    const featureToAdd = layerIdAndFeatureId;
    let temp,
        feature;

    if (featureToAdd) {
        temp = featureToAdd.split(",");
        feature = getHighlightFeature(temp[0], temp[1]);
    }
    if (feature) {
        dispatch("MapMarker/placingPolygonMarker", feature, {root: true});
    }
}
/**
 * Searches the feature which shall be hightlighted
 * @param {String} layerId Id of the layer, containing the feature to hightlight
 * @param {String} featureId Id of feature which shall be hightlighted
 * @fires ModelList#RadioRequestModelListGetModelByAttributes
 * @returns {ol/feature} feature to highlight
 */
function getHighlightFeature (layerId, featureId) {
    const layer = Radio.request("ModelList", "getModelByAttributes", {id: layerId});

    if (layer && layer.get("layerSource")) {
        return layer.get("layerSource").getFeatureById(featureId);
    }
    return undefined;
}
/**
 * increases the icon of the feature
 * @param {Function} commit commit function
 * @param {Object} highlightObject contains several parameters for feature highlighting
 * @fires VectorStyle#RadioRequestStyleListReturnModelById
 * @returns {void}
 */
function increaseFeature (commit, highlightObject) {
    const scaleFactor = highlightObject.scale ? highlightObject.scale : 1.5,
        features = highlightObject.layer ? highlightObject.layer.features : undefined,
        feature = features ? features.find(feat => {
            return feat.id.toString() === highlightObject.id;
        }).feature : highlightObject.feature,
        clonedStyle = styleObject(highlightObject, feature) ? styleObject(highlightObject, feature).clone() : undefined,
        clonedImage = clonedStyle ? clonedStyle.getImage() : undefined;

    if (clonedImage) {
        commit("setHighlightedFeature", feature);
        commit("setHighlightedFeatureStyle", feature.getStyle());

        if (clonedStyle.getText()) {
            clonedStyle.getText().setScale(scaleFactor);
        }
        clonedImage.setScale(clonedImage.getScale() * scaleFactor);
        feature.setStyle(clonedStyle);
    }
}
/**
 * Get style via styleList
 * @param {Object} highlightObject contains several parameters for feature highlighting
 * @param {ol/feature} feature openlayers feature to highlight
 * @fires VectorStyle#RadioRequestStyleListReturnModelById
 * @returns {ol/style} ol style
 */
function styleObject (highlightObject, feature) {
    let styleModel = Radio.request("StyleList", "returnModelById", highlightObject.layer.id),
        style;

    if (!styleModel) {
        styleModel = Radio.request("StyleList", "returnModelById", highlightObject.layer.styleId);
    }
    if (styleModel) {
        style = styleModel.createStyle(feature, false);
        if (Array.isArray(style) && style.length > 0) {
            style = style[0];
        }
    }
    return style;
}

export {highlightFeature};

