import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import {Style} from "ol/style.js";

/**
 * User type definition
 * @typedef {Object} MapMarkerState
 * @property {String} pointStyleId The id references the style.json for a point map marker.
 * @property {String} polygonStyleId The id references the style.json for a polygon map marker.
 * @property {Object} markerPoint The vector layer for the point map marker.
 * @property {Object} markerPolygon The vector layer for the polygon map marker.
 */
export default {
    pointStyleId: "defaultMapMarkerPoint",
    polygonStyleId: "defaultMapMarkerPolygon",
    markerPoint: new VectorLayer({
        id: "marker_point_layer",
        name: "markerPoint",
        source: new VectorSource(),
        visible: false,
        style: new Style(),
        alwaysOnTop: true,
        altitudeMode: "clampToGround"
    }),
    markerPolygon: new VectorLayer({
        id: "marker_polygon_layer",
        name: "markerPolygon",
        source: new VectorSource(),
        visible: false,
        style: new Style(),
        alwaysOnTop: true,
        altitudeMode: "clampToGround"
    }),
    coordinates: []
};
