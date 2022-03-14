import SearchHitResult from "../searchHits/searchHitResult";
import SearchHitSuggestion from "../searchHits/searchHitSuggestion";
import axios from "axios";

/**
 * Search interface is used as a parent element for concrete search interfaces.
 * @abstract
 * @constructs
 * @param {String} paging Shows if all search hits are already in the store or if new requests have to be sent for further search hits. Possible values are "client" or "request.
 * @param {String} searchInterfaceId The id of the service interface.
 * @param {Object} [resultEvents={}] Actions that are executed when an interaction, such as hover or click, is performed with a result list item.
 * @param {String[]} [resultEvents.onClick] Actions that are fired when clicking on a result list item.
 * @param {String[]} [resultEvents.onHover] Actions that are fired when hovering on a result list item.
 * @param {Sting} [searchState="instantiated"] The search state. Can have the values: "aborted", "failed", "finished", "instantiated", "running".
 * @returns {void}
 */
export default function SearchInterface (paging, searchInterfaceId, resultEvents = [], searchState = "instantiated") {
    this.paging = paging;
    this.searchInterfaceId = searchInterfaceId;
    this.resultEvents = resultEvents;
    this.searchState = searchState;

    /**
     * The current abor controller.
     * @type {String}
     */
    this.currentController = null;

    /**
     * List with results of the search.
     * @type {Object[]}
     */
    this.searchResults = [];

    /**
     * List with suggestions of the search.
     * @type {Object[]}
     */
    this.searchSuggestions = [];

    /**
     * Timeout for request to a search interface.
     * @type {Number}
     */
    this.timeout = this.timeout ?? 5000;

    /**
     * Total number of hits.
     * @type {Number}
     */
    this.totalHits = 0;
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
 * Aborts the previous request, if it is still running.
 * @returns {void}
 */
SearchInterface.prototype.abortRequest = function () {
    if (typeof this.currentController === AbortController) {
        this.searchState = "aborted";
        this.currentController.abort();
        this.currentController = null;
    }
};

/**
 * Sets the search results to empty collection.
 * @returns {void}
 */
SearchInterface.prototype.clearSearchResults = function () {
    this.searchResults = [];
};

/**
 * Sets the search suggestions to empty collection.
 * @returns {void}
 */
SearchInterface.prototype.clearSearchSuggestions = function () {
    this.searchSuggestions = [];
};

/**
 * Adds all search hits to the search result or suggestions.
 * @param {Object[]} [searchHits=[]] The search hits of an search interface.
 * @param {Object} [searchType="result"] The search type "suggestion" or "result".
 * @returns {void}
 */
SearchInterface.prototype.pushHitsToSearchResultsOrSuggestions = function (searchHits = [], searchType = "result") {
    searchHits.forEach((searchHit, index) => {
        const extendedSearchResult = Object.assign(searchHit, {
            index: index,
            searchInterfaceId: this.searchInterfaceId
        });

        if (searchType === "result") {
            this.pushHitToSearchResults(extendedSearchResult);
        }
        else if (searchType === "suggestion") {
            this.pushHitToSearchSuggestions(extendedSearchResult);
        }
    });
};

/**
 * Adds a search result to the search results.
 * @param {Object} [searchResult={}] One search result of an search interface.
 * @returns {void}
 */
SearchInterface.prototype.pushHitToSearchResults = function (searchResult = {}) {
    this.searchResults.push(new SearchHitResult(searchResult));
};

/**
 * Adds a search result to the search suggestion.
 * @param {Object} [searchSuggestion={}] One search suggestion of an search interface.
 * @returns {void}
 */
SearchInterface.prototype.pushHitToSearchSuggestions = function (searchSuggestion = {}) {
    this.searchSuggestions.push(new SearchHitSuggestion(searchSuggestion));
};

/**
 * Sends a get request to a search interface.
 * If the same URL is requested again, the previous request is aborted.
 * @param {String} searchUrl The search URL.
 * @param {Object} searchParams The search params.
 * @returns {void}
 */
SearchInterface.prototype.requestSearch = function (searchUrl, searchParams = {}) {
    this.abortRequest();
    this.searchState = "running";
    this.currentController = new AbortController();

    axios.get(searchUrl, {
        param: searchParams,
        signal: this.currentController.signal,
        timeout: this.timeout
    })
        .then(response => {
            this.searchState = "finished";
            return response;
        })
        .catch(error => {
            this.searchState = "failed";
            console.error(error.toJSON());
        })
        .then(() => {
            this.currentController = null;
        });
};

/**
 * Create an Object of resultEvents.
 * @param {Object} resultEvents The result events.
 * @returns {Object} The result evnets as object.
 */
SearchInterface.prototype.resultEventsToObject = function (resultEvents) {
    const resultEventsAsObject = {};

    Object.entries(resultEvents).forEach(([key, values]) => {
        resultEventsAsObject[key] = {};

        values.forEach(value => {
            resultEventsAsObject[key][value] = {};
        });
    });

    return resultEventsAsObject;
};
