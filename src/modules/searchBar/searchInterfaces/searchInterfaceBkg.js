import SearchInterface from "./searchInterface";

/**
 * The search interface to the bkg geocoder.
 * @constructs
 * @extends SearchInterface
 * @see {@link https://sg.geodatenzentrum.de/web_public/gdz/dokumentation/deu/geokodierungsdienst.pdf}
 * @param {String} geosearchServiceId Search service id. Resolved using the rest-services.json file.
 * @param {String} suggestServiceId Suggestion service id. Resolved using the rest-services.json file.
 *
 * @param {String} [epsg] EPSG code of the coordinate reference system to use. By default, the value in `Portalconfig.mapView.epsg` is used.
 * @param {Number[]} [extent= [454591, 5809000, 700000, 6075769]] Coordinate extent in which search algorithms should return.
 * @param {String} [filter="filter=(typ:*)"] Filter string sent to the BKG interface.
 * @param {Object} [resultEvents] Actions that are executed when an interaction, such as hover or click, is performed with a result list item.
 * @param {String[]} [resultEvents.onClick=["setMarker", "zoomToFeature"]] Actions that are fired when clicking on a result list item.
 * @param {String[]} [resultEvents.onHover=["setMarker"]] Actions that are fired when hovering on a result list item.
 * @param {Number} [maxscore] Maximum score value that the results must have.
 * @param {Number} [minscore] Minimum score value that the results must have
 * @param {Number} [suggestCount=20] Suggestion amount.
 * @param {Object} [suggestionEvents] Actions that are executed when an interaction, such as hover or click, is performed with a suggestion list item.
 * @param {String[]} [suggestionEvents.onClick=["setMarker", "zoomToFeature"]] Actions that are fired when clicking on a suggestion list item.
 * @param {String[]} [suggestionEvents.onHover=["setMarker"]] Actions that are fired when hovering on a suggestion list item.
 * @returns {void}
 */
export default function SearchInterfaceBkg ({geosearchServiceId, suggestServiceId, epsg, extent, filter, resultEvents, maxScore, minScore, suggestCount, suggestionEvents} = {}) {
    SearchInterface.call(this,
        resultEvents || {
            onClick: ["setMarker", "zoomToFeature"],
            onHover: ["setMarker"]
        },
        suggestionEvents || {
            onClick: ["setMarker", "zoomToFeature"],
            onHover: ["setMarker"]
        });

    this.geosearchServiceId = geosearchServiceId;
    this.suggestCount = suggestCount || 20;

    this.epsg = epsg;
    this.extent = extent || [454591, 5809000, 700000, 6075769];
    this.filter = filter || "filter=(typ:*)";
    this.maxScore = maxScore;
    this.minScore = minScore;
    this.suggestServiceId = suggestServiceId;
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
