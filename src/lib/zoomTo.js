import Polygon from "ol/geom/Polygon";
import Point from "ol/geom/Point";

import coordsToPairs from "./coordsToPairs";

/**
 * Zooms the map to a geometry.
 * @param {ol/Map} map map object to zoom
 * @param {(ol/geom/SimpleGeometry|ol/extent)} geometryOrExtent the geometry or extent to zoom to
 * @param {object} [params={}] forwarded to ol/View.fit, may e.g. specify duration of animation {@link https://openlayers.org/en/latest/apidoc/module-ol_View.html#~FitOptions}
 * @returns {void}
 */
export default function zoomTo (map, geometryOrExtent, params = {}) {
    map.getView().fit(geometryOrExtent, params);
}

/**
 * Zooms the map to a searchResult.
 * @param {ol/Map} map map object to zoom
 * @param {SearchResult} searchResult result from searchAddress
 * @param {object} [params={}] forwarded to ol/View.fit, may e.g. specify duration of animation {@link https://openlayers.org/en/latest/apidoc/module-ol_View.html#~FitOptions}
 * @returns {void}
 */
export function zoomToSearchResult (map, searchResult, params = {}) {
    let geom;

    switch (searchResult.geometry.type) {
        case "Polygon":
            geom = new Polygon([coordsToPairs(searchResult.geometry.coordinates)]);
            break;
        case "Point":
            geom = new Point(searchResult.geometry.coordinates.map(parseFloat));
            break;
        default:
            console.warn(`ZoomTo for type ${searchResult.geometry.type} not implemented.`);
            return;
    }

    zoomTo(map, geom, params);
}
