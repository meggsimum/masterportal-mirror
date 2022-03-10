import SearchInterface from "./searchInterface";

/**
 * The search interface to the visible vector.
 * @constructs
 * @extends SearchInterface
 * @param {String[]} [layerTypes="WFS"] Vector layer types to be used.
 * @param {Object} [resultEvents] Actions that are executed when an interaction, such as hover or click, is performed with a result list item.
 * @param {String[]} [resultEvents.onClick=["setMarker", "zoomToFeature"]] Actions that are fired when clicking on a result list item.
 * @param {String[]} [resultEvents.onHover=["setMarker"]] Actions that are fired when hovering on a result list item.
 * @param {String} [searchInterfaceId="visibleVector"] The id of the service interface.
 * @returns {void}
 */
export default function SearchInterfaceVisibleVector ({layerTypes, resultEvents, searchInterfaceId} = {}) {
    SearchInterface.call(this,
        "client",
        searchInterfaceId || "visibleVector",
        resultEvents || {
            onClick: ["setMarker", "zoomToFeature"],
            onHover: ["setMarker"]
        });

    this.layerTypes = layerTypes;
}

SearchInterfaceVisibleVector.prototype = Object.create(SearchInterface.prototype);

/**
 * Search in visible vector search interface.
 * @override
 * @param {String} searchInput The search input.
 * @returns {void}
 */
SearchInterfaceVisibleVector.prototype.search = function (searchInput) {
    // Do something
    return searchInput; // Dummy for linter
};
