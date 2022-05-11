import {getLayerWhere} from "@masterportal/masterportalapi/src/rawLayerList";
import {getCenter} from 'ol/extent';

export default {
    /**
     * Switches to the feature list of the selected layer.
     * @param {Object} param.state the state
     * @param {Object} param.commit the commit
     * @param {Object} param.dispatch the dispatch
     * @param {Object} layer selected layer.
     * @returns {void}
     */
    switchToList ({state, rootGetters, commit}, layer) {
        commit("setLayer", layer);
        if (state.layer) {
            commit("setLayerId", layer.id);
            commit("setGfiFeaturesOfLayer", rootGetters["Maps/getVisibleLayerList"]);
            commit("setFeatureCount", state.gfiFeaturesOfLayer.length);
            commit("setShownFeatures", state.gfiFeaturesOfLayer.length < state.maxFeatures ? state.gfiFeaturesOfLayer.length : state.maxFeatures);
            commit("setLayerListView", false);
            commit("setFeatureDetailView", false);
            commit("setFeatureListView", true);
        }
    },
    /**
     * Click event that gets triggered when clicking on a feature in the list view.
     * @param {Object} param.state the state
     * @param {Object} param.commit the commit
     * @param {Object} param.dispatch the dispatch
     * @param {String} featureIndex index of the clicked Feature
     * @returns {void}
     */
    clickOnFeature ({state, commit, dispatch, rootGetters}, featureIndex) {
        if (featureIndex !== "" && featureIndex >= 0 && featureIndex <= state.shownFeatures) {
            const feature = state.gfiFeaturesOfLayer[featureIndex],
                featureGeometry = state.rawFeaturesOfLayer[featureIndex].getGeometry(),
                mapView = rootGetters["Maps/getView"];

            commit("setSelectedFeature", feature);

            dispatch("switchToDetails");
            dispatch("Map/zoomTo", {
                geometryOrExtent: featureGeometry,
                options: {duration: 500, zoom: 9}
            }, {root: true});

            if (featureGeometry.getType() === "Point") {
                Radio.trigger("MapView", "setCenter", featureGeometry.getCoordinates(), styleObj.zoom);
            }
            else {
                Radio.trigger("MapView", "setCenter", getCenter(featureGeometry.getExtent()), styleObj.zoom);
            }
        }
    },
    /**
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
    highlightFeature ({state, rootGetters, dispatch}, featureId) {
        dispatch("Maps/removeHighlightFeature", "decrease", {root: true});
        let featureGeometryType = "";
        const layer = rootGetters["Maps/getVisibleLayerList"].find((l) => l.values_.id === state.layer.id),
            layerFeatures = state.nestedFeatures ? state.rawFeaturesOfLayer : layer.getSource().getFeatures(),
            featureWrapper = layerFeatures.find(feat => {
                featureGeometryType = feat.getGeometry().getType();
                return feat.getId().toString() === featureId;
            }),
            rawLayer = getLayerWhere({id: state.layer.id}),
            styleObj = state.layer.geometryType.toLowerCase().indexOf("polygon") > -1 ? state.highlightVectorRulesPolygon : state.highlightVectorRulesPointLine,
            highlightObject = {
                type: featureGeometryType === "Point" || featureGeometryType === "MultiPoint" ? "increase" : "highlightPolygon",
                id: featureId,
                layer: layer,
                feature: featureWrapper,
                scale: styleObj.image?.scale
            };

        if (featureGeometryType === "LineString") {
            highlightObject.type = "highlightLine";
        }
        layer.id = state.layer.id;
        if (styleObj.zoom) {
            highlightObject.zoom = styleObj.zoom;
        }
        if (rawLayer && rawLayer.styleId) {
            highlightObject.styleId = rawLayer.styleId;
        }

        if (highlightObject.type === "highlightPolygon") {
            highlightObject.highlightStyle = {
                fill: styleObj.fill,
                stroke: styleObj.stroke,
                image: styleObj.image
            };
        }
        dispatch("Maps/highlightFeature", highlightObject, {root: true});
    },
    /**
     * Switches to the themes list of all visibile layers and resets the featureList and the selectedFeature.
     * @param {Object} param.commit the commit
     * @param {Object} param.dispatch the dispatch
     * @returns {void}
     */
    switchToThemes ({commit}) {
        commit("resetToThemeChooser");
    },
    /**
     * Switches to the details list of the selected feature.
     * @param {Object} param.state the state
     * @param {Object} param.commit the commit
     * @param {Object} param.dispatch the dispatch
     * @returns {void}
     */
    switchToDetails ({state, commit}) {
        if (state.selectedFeature) {
            commit("setLayerListView", false);
            commit("setFeatureListView", false);
            commit("setFeatureDetailView", true);
        }
    },
    /**
     * Expands the feature list to show more features.
     * @param {Object} param.state the state
     * @param {Object} param.commit the commit
     * @returns {void}
     */
    showMore ({state, commit}) {
        const numberOfFeaturesToShow = state.shownFeatures < state.featureCount - 10 ? state.shownFeatures + 10 : state.featureCount;

        commit("setShownFeatures", numberOfFeaturesToShow);
    }
};

