/**
 * check how to highlight
 * @param {Object} ctx store context
 * @param {Function} ctx.commit commit function
 * @param {Function} ctx.dispatch dispatch function
 * @param {Object} ctx.getters map getters
 * @param {Object} highlightObject contains several parameters for feature highlighting
 * @returns {void}
 */
function highlightFeature ({commit, dispatch, getters}, highlightObject) {
    if (highlightObject.type === "increase") {
        increaseFeature(commit, getters, highlightObject);
    }
    else if (highlightObject.type === "viaLayerIdAndFeatureId") {
        highlightViaParametricUrl(dispatch, getters, highlightObject.layerIdAndFeatureId);
    }
    else if (highlightObject.type === "highlightPolygon") {
        highlightPolygon(commit, dispatch, highlightObject);
    }
}
/**
 * highlights a polygon feature
 * @param {Function} commit commit function
 * @param {Function} dispatch dispatch function
 * @param {Object} highlightObject contains several parameters for feature highlighting
 * @fires VectorStyle#RadioRequestStyleListReturnModelById
 * @returns {void}
 */
function highlightPolygon (commit, dispatch, highlightObject) {
    if (highlightObject.highlightStyle) {
        const newStyle = highlightObject.highlightStyle,
            feature = highlightObject.feature,
            originalStyle = styleObject(highlightObject, feature) ? styleObject(highlightObject, feature) : undefined;

        if (originalStyle) {
            const clonedStyle = Array.isArray(originalStyle) ? originalStyle[0].clone() : originalStyle.clone();

            commit("addHighlightedFeature", feature);
            commit("addHighlightedFeatureStyle", feature.getStyle());

            if (newStyle.fill?.color) {
                clonedStyle.getFill().setColor(newStyle.fill.color);
            }
            if (newStyle.stroke?.width) {
                clonedStyle.getStroke().setWidth(newStyle.stroke.width);
            }
            if (newStyle.stroke?.color) {
                clonedStyle.getStroke().setColor(newStyle.stroke.color);
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
 * @param {Object} getters map getters
 * @param {String} layerIdAndFeatureId contains layerid and featureid
 * @fires ModelList#RadioRequestModelListGetModelByAttributes
 * @returns {void}
 */
function highlightViaParametricUrl (dispatch, getters, layerIdAndFeatureId) {
    const featureToAdd = layerIdAndFeatureId;
    let temp,
        feature;

    if (featureToAdd) {
        temp = featureToAdd.split(",");
        feature = getHighlightFeature(temp[0], temp[1], getters);
    }
    if (feature) {
        dispatch("MapMarker/placingPolygonMarker", feature, {root: true});
    }
}
/**
 * Searches the feature which shall be hightlighted
 * @param {String} layerId Id of the layer, containing the feature to hightlight
 * @param {String} featureId Id of feature which shall be hightlighted
 * @param {Object} getters map getters
 * @fires ModelList#RadioRequestModelListGetModelByAttributes
 * @returns {ol/feature} feature to highlight
 */
function getHighlightFeature (layerId, featureId, getters) {
    const layer = getters.layerById(layerId)?.olLayer;

    if (layer) {
        return layer.getSource().getFeatureById(featureId)
            || layer.getSource().getFeatures() // if feature clustered source find cluster the highlighted feature belongs to
                .find(feat => feat.get("features")?.find(feat_ => feat_.getId() === featureId));
    }
    return undefined;
}
/**
 * increases the icon of the feature
 * @param {Function} commit commit function
 * @param {Object} getters map getters
 * @param {Object} highlightObject contains several parameters for feature highlighting
 * @fires VectorStyle#RadioRequestStyleListReturnModelById
 * @returns {void}
 */
function increaseFeature (commit, getters, highlightObject) {
    const scaleFactor = highlightObject.scale ? highlightObject.scale : 1.5,
        features = highlightObject.layer ? highlightObject.layer.features : undefined, // use list of features provided if given
        feature = features?.find(feat => feat.id.toString() === highlightObject.id)?.feature // retrieve from list of features provided by id, if both are given
            || highlightObject.layer?.id && highlightObject.id // if layerId and featureId are given
            ? getHighlightFeature(highlightObject.layer?.id, highlightObject.id, getters) // get feature from layersource, incl. check against clustered features
            : highlightObject.feature, // else, use provided feature itself if given
        clonedStyle = styleObject(highlightObject, feature) ? styleObject(highlightObject, feature).clone() : feature.getStyle()?.clone(),
        clonedImage = clonedStyle ? clonedStyle.getImage() : undefined;

    if (clonedImage) {
        commit("addHighlightedFeature", feature);
        commit("addHighlightedFeatureStyle", feature.getStyle());

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

