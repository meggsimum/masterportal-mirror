import SearchInterface from "./searchInterface";

/**
 * The search interface to the gazetteer.
 * @constructs
 * @extends SearchInterface
 * @param {String} serviceId Search service id. Resolved using the rest-services.json file.
 *
 * @param {String[]} [onClick=["setMarker", "zoomToFeature"]] Actions that are fired when clicking on the search result.
 * @param {String[]} [onHover=["setMarker"]] Actions that are fired when hovering on the search result.
 * @param {Boolean} [searchDistricts=false] Defines whether district search is active.
 * @param {Boolean} [searchHouseNumbers=false] Defines whether house numbers should be searched for.
 * @param {Boolean} [searchParcels=false] Defines whether parcels search is active.
 * @param {Boolean} [searchStreet=false] Defines whether street search is active.
 * @param {Boolean} [searchStreetKey=false] Defines whether streets should be searched for by key.
 * @returns {void}
 */
export default function SearchInterfaceGazetteer ({serviceId, onClick, onHover, searchDistricts, searchHouseNumbers, searchParcels, searchStreet, searchStreetKey} = {}) {
    SearchInterface.call(this, onClick || ["setMarker", "zoomToFeature"], onHover || ["setMarker"]);

    this.serviceId = serviceId;

    this.searchDistricts = searchDistricts || false;
    this.searchHouseNumbers = searchHouseNumbers || false;
    this.searchParcels = searchParcels || false;
    this.searchStreet = searchStreet || false;
    this.searchStreetKey = searchStreetKey || false;
}

SearchInterfaceGazetteer.prototype = Object.create(SearchInterface.prototype);

/**
 * Search in gazetteer search interface.
 * @override
 * @param {String} searchInput The search input.
 * @returns {void}
 */
SearchInterfaceGazetteer.prototype.search = function (searchInput) {
    // Do something
    return searchInput; // Dummy for linter
};
