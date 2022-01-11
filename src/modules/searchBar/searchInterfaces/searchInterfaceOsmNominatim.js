import SearchInterface from "./searchInterface";

/**
 * The search interface to the osm nominatim geocoder.
 * @constructs
 * @extends SearchInterface
 * @see {@link https://operations.osmfoundation.org/policies/nominatim/}
 * @param {String} serviceId OSM search service id. Resolved using the rest-services.json file.
 *
 * @param {String} [classes = "place,highway,building,shop,historic,leisure,city,county"] May contain the classes to search for.
 * @param {Number} [limit = 5] Maximum amount of requested unfiltered results.
 * @param {String[]} [onClick=["setMarker", "zoomToFeature"]] Actions that are fired when clicking on the search result.
 * @param {String[]} [onHover=["setMarker"]] Actions that are fired when hovering on the search result.
 * @param {String} [states=""] May contain federal state names with arbitrary separators.
 * @returns {void}
 */
export default function SearchInterfaceOsmNominatim ({serviceId, classes, limit, onClick, onHover, states} = {}) {
    SearchInterface.call(this, onClick || ["setMarker", "zoomToFeature"], onHover || ["setMarker"]);

    this.serviceId = serviceId;

    this.classes = classes || "place,highway,building,shop,historic,leisure,city,county";
    this.limit = limit || 50;
    this.states = states || "";
}

SearchInterfaceOsmNominatim.prototype = Object.create(SearchInterface.prototype);

/**
 * Search in osm nominatim search interface.
 * @override
 * @param {String} searchInput The search input.
 * @returns {void}
 */
SearchInterfaceOsmNominatim.prototype.search = function (searchInput) {
    // Do something
    return searchInput; // Dummy for linter
};
