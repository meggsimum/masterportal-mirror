import SearchResult from "./searchResult";

/**
 * Search interface is used as a parent element for concrete search interfaces.
 * @abstract
 * @constructs
 * @param {String[]} [onClick = []] Actions that are fired when clicking on the search result.
 * @param {String[]} [onHover = []] Actions that are fired when hovering on the search result.
 * @returns {void}
 */
export default function SearchInterface (onClick = [], onHover = []) {
    this.onClick = onClick;
    this.onHover = onHover;
    /**
     * @type {Object[]}
     */
    this.searchResults = [];
}

/**
 * Search function that is triggered by the search bar.
 * This function must be overridden by each sub search interface.
 * @abstract
 * @returns {void}
 */
SearchInterface.prototype.search = function () {
    throw new Error("This function must be overridden by the sub search interface!");
};

/**
 * Sets the search results to empty collection.
 * @returns {void}
 */
SearchInterface.prototype.clearSearchResults = function () {
    this.searchResults = [];
};

/**
 * Adds a search result to the search results.
 * @param {Object} [searchResult={}] One search result of an search interface.
 * @returns {void}
 */
SearchInterface.prototype.pushObjectToSearchResults = function (searchResult = {}) {
    this.searchResults.push(new SearchResult(searchResult));
};

/**
 * Adds all search results to the search results.
 * @param {Object[]} [searchResults=[]] The search results of an search interface.
 * @returns {void}
 */
SearchInterface.prototype.pushObjectsToSearchResults = function (searchResults = []) {
    searchResults.forEach(searchResult => this.pushObjectToSearchResults(searchResult));
};
