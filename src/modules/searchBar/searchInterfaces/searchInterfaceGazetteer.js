import SearchInterface from "./searchInterface";

/**
 * The search interface to the gazetteer.
 * @constructs
 * @extends SearchInterface
 * @param {String} serviceId Search service id. Resolved using the rest-services.json file.
 *
 * @param {Object} [resultEvents] Actions that are executed when an interaction, such as hover or click, is performed with a result list item.
 * @param {String[]} [resultEvents.onClick=["setMarker", "zoomToFeature"]] Actions that are fired when clicking on a result list item.
 * @param {String[]} [resultEvents.onHover=["setMarker"]] Actions that are fired when hovering on a result list item.
 * @param {Boolean} [searchDistricts=false] Defines whether district search is active.
 * @param {Boolean} [searchHouseNumbers=false] Defines whether house numbers should be searched for.
 * @param {Boolean} [searchParcels=false] Defines whether parcels search is active.
 * @param {Boolean} [searchStreet=false] Defines whether street search is active.
 * @param {Boolean} [searchStreetKey=false] Defines whether streets should be searched for by key.
 * @param {Object} [suggestionEvents] Actions that are executed when an interaction, such as hover or click, is performed with a suggestion list item.
 * @param {String[]} [suggestionEvents.onClick=["setMarker", "zoomToFeature"]] Actions that are fired when clicking on a suggestion list item.
 * @param {String[]} [suggestionEvents.onHover=["setMarker"]] Actions that are fired when hovering on a suggestion list item.
 * @returns {void}
 */
export default function SearchInterfaceGazetteer ({serviceId, resultEvents, searchDistricts, searchHouseNumbers, searchParcels, searchStreet, searchStreetKey, suggestionEvents} = {}) {
    SearchInterface.call(this,
        resultEvents || {
            onClick: ["setMarker", "zoomToFeature"],
            onHover: ["setMarker"]
        },
        suggestionEvents || {
            onClick: ["setMarker", "zoomToFeature"],
            onHover: ["setMarker"]
        });

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
