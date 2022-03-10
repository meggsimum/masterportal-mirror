import SearchInterface from "./searchInterface";

/**
 * The search interface to the location finder.
 * @constructs
 * @extends SearchInterface
 * @param {String} serviceId Service id. Resolved using the rest-services.json file.
 *
 * @param {String[]} [classes] May contain classes (with properties) to use in searches.
 * @param {String} [epsg] Coordinate reference system to use for requests. By default, the value in `Portalconfig.mapView.epsg` is used.
 * @param {Boolean} [incrementalSearch=true] Defines whether autocomplete is enabled.
 * @param {Object} [resultEvents] Actions that are executed when an interaction, such as hover or click, is performed with a result list item.
 * @param {String[]} [resultEvents.onClick=["setMarker", "zoomToFeature"]] Actions that are fired when clicking on a result list item.
 * @param {String[]} [resultEvents.onHover=["setMarker"]] Actions that are fired when hovering on a result list item.
 * @param {String} [searchInterfaceId="locationFinder"] The id of the service interface.
 * @param {Boolean} [useProxy=false] Defines whether a service URL should be requested via proxy.
 * @returns {void}
 */
export default function SearchInterfaceLocationFinder ({serviceId, classes, epsg, incrementalSearch, resultEvents, searchInterfaceId, useProxy} = {}) {
    SearchInterface.call(this,
        "client",
        searchInterfaceId || "loactionFinder",
        resultEvents || {
            onClick: ["setMarker", "zoomToFeature"],
            onHover: ["setMarker"]
        });

    this.serviceId = serviceId;

    this.classes = classes || [];
    this.epsg = epsg;
    this.incrementalSearch = incrementalSearch || true;
    this.useProxy = useProxy || false;
}

SearchInterfaceLocationFinder.prototype = Object.create(SearchInterface.prototype);

/**
 * Search in location finder search interface.
 * @override
 * @param {String} searchInput The search input.
 * @returns {void}
 */
SearchInterfaceLocationFinder.prototype.search = function (searchInput) {
    // Do something
    return searchInput; // Dummy for linter
};
