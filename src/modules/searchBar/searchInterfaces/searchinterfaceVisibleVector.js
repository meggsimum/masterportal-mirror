import SearchInterface from "./searchInterface";

/**
 * The search interface to the visible vector.
 * @constructs
 * @extends SearchInterface
 * @param {String[]} [layerTypes="WFS"] Vector layer types to be used.
 * @param {String[]} [onClick=["setMarker", "zoomToFeature"]] Actions that are fired when clicking on the search result.
 * @param {String[]} [onHover=["setMarker"]] Actions that are fired when hovering on the search result.
 * @returns {void}
 */
export default function SearchInterfaceVisibleVector ({layerTypes, onClick, onHover} = {}) {
    SearchInterface.call(this, onClick || ["setMarker", "zoomToFeature"], onHover || "setMarker");

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
