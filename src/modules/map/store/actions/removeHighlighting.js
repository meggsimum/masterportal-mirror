import Feature from "ol/Feature";

/**
 * Removes all features from the highlighted features
 * @param {Object} state map state
 * @param {Function} commit commit function
 * @returns {void}
 */
function removeAllHighlightedFeatures (state, commit) {
    state.highlightedFeatureStyles.forEach((style, index) => {
        state.highlightedFeatures[index].setStyle(style);
    });

    commit("setHighlightedFeatureStyles", []);
    commit("setHighlightedFeatures", []);
}

/**
 * Remove a single feature from the highlighted features
 * @param {Object} state map state
 * @param {Function} commit commit function
 * @param {module:ol/Feature} feature the feature to remove from the highlighted features, remove all if none is given
 * @returns {void}
 */
function removeSingleHighlightedFeature (state, commit, feature) {

    const index = state.highlightedFeatures.indexOf(feature);

    if (index !== -1) {
        const highlightedFeatureStyle = state.highlightedFeatureStyles[index];

        state.highlightedFeatures[index].setStyle(highlightedFeatureStyle);
        commit("setHighlightedFeatureStyles", state.highlightedFeatureStyles.filter((style, i) => i !== index));
        commit("setHighlightedFeatures", state.highlightedFeatures.filter((feat, i) => i !== index));
    }
}

/**
 * reset highlighted feature style
 * @param {Object} ctx the store context
 * @param {Function} ctx.commit commit function
 * @param {Object} ctx.state map state
 * @param {module:ol/Feature} [feature] the feature to remove from the highlighted features, remove all if none is given
 * @returns {void}
 */
function removeHighlightFeature ({commit, state}, feature) {
    if (feature && feature instanceof Feature) {
        removeSingleHighlightedFeature(state, commit, feature);
    }
    else {
        removeAllHighlightedFeatures(state, commit);
    }
}

export {removeHighlightFeature};

