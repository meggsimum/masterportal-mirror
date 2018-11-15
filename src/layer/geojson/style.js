import {Style, Icon, Stroke, Fill} from "ol/style.js";
import markerSvg from "../../../public/marker.svg";

let customStyles = {};

/**
 * Allows setting custom styles. When available, they will be used.
 * @param {object.<string, ol/Style>} styles - lookup from feature's geometry type (Point, LineString, ...) to style
 * @returns {undefined}
 */
export function setCustomStyles (styles) {
    customStyles = styles;
}

// // // STYLE PARTS
const marker = new Icon({
        src: markerSvg,
        // center bottom of marker 📍 is intended to show the spot
        anchor: [0.5, 1]
    }),
    stroke = new Stroke({
        width: 2,
        color: "#005CA9"
    }),
    fill = new Fill({
        color: "#005CA915"
    }),

    // // // STYLES
    pointStyle = new Style({image: marker}),
    lineStyle = new Style({stroke}),
    polygonStyle = new Style({stroke, fill}),
    circleStyle = new Style({stroke, fill}),
    geometryCollectionStyle = new Style({stroke, fill, image: marker}),

    // // // DEFAULT STYLE LOOKUP
    defaultStyles = {
        Point: pointStyle,
        LineString: lineStyle,
        MultiLineString: lineStyle,
        MultiPoint: pointStyle,
        MultiPolygon: polygonStyle,
        Polygon: polygonStyle,
        GeometryCollection: geometryCollectionStyle,
        Circle: circleStyle
    };

/**
 * Style function according to https://openlayers.org/en/latest/apidoc/module-ol_style_Style.html#~StyleFunction.
 * Will use custom values first, if set, and fall back on holes in definition.
 * @param {ol/Feature} feature - to be styled
 * @returns {ol/Style} style for feature
 * @ignore
 */
function style (feature) {
    const type = feature.getGeometry().getType();

    return customStyles[type] || defaultStyles[type];
}

export default style;
