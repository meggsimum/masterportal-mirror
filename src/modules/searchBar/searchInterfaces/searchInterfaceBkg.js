import SearchInterface from "./searchInterface";

/**
 * The search interface to the bkg geocoder.
 * @constructs
 * @extends SearchInterface
 * @param {String} geosearchServiceId Search service id. Resolved using the rest-services.json file.
 * @param {String} suggestServiceId Suggestion service id. Resolved using the rest-services.json file.
 *
 * @param {String} [epsg] EPSG code of the coordinate reference system to use. By default, the value in `Portalconfig.mapView.epsg` is used.
 * @param {Number[]} [extent= [454591, 5809000, 700000, 6075769]] Coordinate extent in which search algorithms should return.
 * @param {String} [filter="filter=(typ:*)"] Filter string sent to the BKG interface.
 * @param {String[]} [onClick=["setMarker", "zoomToFeature"]] Actions that are fired when clicking on the search result.
 * @param {String[]} [onHover=["setMarker"]] Actions that are fired when hovering on the search result.
 * @param {Number} [score=0.6] Score defining the minimum quality of search results.
 * @param {Number} [suggestCount=20] Suggestion amount.
 * @param {Number} [zoomLevel=7] Defines the zoom level to use on zooming to a result.
 * @returns {void}
 */
export default function SearchInterfaceBkg ({geosearchServiceId, suggestServiceId, epsg, extent, filter, onClick, onHover, score, suggestCount, zoomLevel} = {}) {
    SearchInterface.call(this, onClick || ["setMarker", "zoomToFeature"], onHover || ["setMarker"]);

    this.geosearchServiceId = geosearchServiceId;
    this.suggestCount = suggestCount || 20;

    this.epsg = epsg;
    this.extent = extent || [454591, 5809000, 700000, 6075769];
    this.filter = filter || "filter=(typ:*)";
    this.score = score || 0.6;
    this.suggestServiceId = suggestServiceId;
    this.zoomLevel = zoomLevel || 7;
}

SearchInterfaceBkg.prototype = Object.create(SearchInterface.prototype);

/**
 * Search in bkg search interface.
 * @override
 * @param {String} searchInput The search input.
 * @returns {void}
 */
SearchInterfaceBkg.prototype.search = function (searchInput) {
    // Do something
    return searchInput; // Dummy for linter
};
