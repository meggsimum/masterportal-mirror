import {getLayerWhere} from "@masterportal/masterportalapi/src/rawLayerList";
import {getCenter} from 'ol/extent';

export default {
    /**
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
            },
            rawLayer = getLayerWhere({id: layerId});

        if (featureGeometryType === "LineString") {
            highlightObject.type = "highlightLine";
        }
        layer.id = layerId;
        highlightObject.zoom = styleObj.zoom;
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
        else if (highlightObject.type === "highlightLine" || highlightObject.type === "increase") {
            highlightObject.highlightStyle = {
                stroke: styleObj.stroke,
                image: styleObj.image
            };
        }
        dispatch("Map/highlightFeature", highlightObject, {root: true});

        if (featureGeometryType === "Point") {
            Radio.trigger("MapView", "setCenter", featureId.getGeometry().getCoordinates(), styleObj.zoom);
        }
        else {
            Radio.trigger("MapView", "setCenter", getCenter(featureId.getGeometry().getExtent()), styleObj.zoom);
        }
}
};

