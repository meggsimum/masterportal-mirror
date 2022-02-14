import SearchResult from "../searchResults/searchResult";
import axios from "axios";

/**
 * Search interface is used as a parent element for concrete search interfaces.
 * @abstract
 * @constructs
 * @param {Object} [resultEvents={}] Actions that are executed when an interaction, such as hover or click, is performed with a result list item.
 * @param {String[]} resultEvents.onClick Actions that are fired when clicking on a result list item.
 * @param {String[]} resultEvents.onHover Actions that are fired when hovering on a result list item.
 * @param {Object} [suggestionEvents={}] Actions that are executed when an interaction, such as hover or click, is performed with a suggestion list item.
 * @param {String[]} suggestionEvents.onClick Actions that are fired when clicking on a suggestion list item.
 * @param {String[]} suggestionEvents.onHover Actions that are fired when hovering on a suggestion list item.
 * @returns {void}
 */
export default function SearchInterface (resultEvents = [], suggestionEvents = []) {
    this.resultEvents = resultEvents;
    this.suggestionEvents = suggestionEvents;

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
     * Timeout for request to a search interface.
     * @type {Number}
     */
    this.timeout = this.timeout || 5000;
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

/**
 * Sends a get request to a search interface.
 * If the same URL is requested again, the previous request is aborted.
 * @param {String} searchUrl The search URL.
 * @param {Object} searchParams The search params.
 * @returns {void}
 */
SearchInterface.prototype.requestSearch = function (searchUrl, searchParams = {}) {
    this.currentController = abortRequest(this.currentController);

    axios.get(searchUrl, {
        param: searchParams,
        signal: this.currentController.signal,
        timeout: this.timeout
    })
        .then(response => {
            return response;
        })
        .catch(error => {
            console.error(error.toJSON());
        })
        .then(() => {
            this.currentController = null;
        });
};

/**
 * Creates a new abort controller and cancels the previous request that was already sent.
 * @param {AbortController} currentController The abort controller of previous request to cancel.
 * @returns {AbortController} The new abort controller for next request.
 */
function abortRequest (currentController) {
    const controller = new AbortController();

    if (typeof currentController === AbortController) {
        currentController.abort();
    }

    return controller;
}
