import {getLayerWhere} from "@masterportal/masterportalapi/src/rawLayerList";
import {getCenter} from "ol/extent";

export default {
    /**
     * Highlights a feature depending on its geometryType.
     * @param {Object} param.state the state
     * @param {Object} param.dispatch the dispatch
     * @param {String} feature id of the feature to be highlighted.
     * @returns {void}
     */
    highlightFeature ({state, rootGetters, dispatch}, {featureId, layerId}) {
        dispatch("Maps/removeHighlightFeature", "decrease", {root: true});
        const layer = rootGetters["Maps/getVisibleLayerList"].find((l) => l.values_.id === layerId),
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
        highlightObject.zoomLevel = styleObj.zoomLevel;
        if (rawLayer && rawLayer.styleId) {
            highlightObject.styleId = rawLayer.styleId;
        }
        else if (layer && layer.styleId) {
            highlightObject.styleId = layer.styleId;
        }

        highlightObject.highlightStyle = {
            fill: styleObj.fill,
            stroke: styleObj.stroke,
            image: styleObj.image
        };
        dispatch("Maps/highlightFeature", highlightObject, {root: true});

        if (styleObj && styleObj.zoomLevel) {
            if (featureGeometryType === "Point") {
                dispatch("Maps/setCenter", featureId.getGeometry().getCoordinates(), {root: true});
            }
            else {
                dispatch("Maps/setCenter", getCenter(featureId.getGeometry().getExtent()), {root: true});
            }
            dispatch("Maps/setZoomLevel", styleObj.zoomLevel, {root: true});
        }
    }
};

