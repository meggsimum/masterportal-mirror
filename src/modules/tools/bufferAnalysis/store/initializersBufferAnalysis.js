import {
    LineString,
    MultiLineString,
    MultiPoint,
    MultiPolygon,
    LinearRing,
    Point,
    Polygon
} from "ol/geom";
import {rawLayerList} from "@masterportal/masterportalapi";

/**
 * Injects OpenLayers geom classes to JSTS Parser
 *
 * @returns {void}
 */
function initJSTSParser ({getters}) {
    // inject possible geometries to jsts parser
    getters.jstsParser.inject(
        Point,
        LineString,
        LinearRing,
        Polygon,
        MultiPoint,
        MultiLineString,
        MultiPolygon
    );
}
/**
 * Initially loads all available options for select elements
 *
 * @return {void}
 */
function loadSelectOptions ({commit}) {
    rawLayerList.getLayerList()
        .filter(({typ}) => typ === "WFS")
        .forEach(layer => {
            commit("addSelectOption", layer);
        });
}

export {
    initJSTSParser,
    loadSelectOptions
};
