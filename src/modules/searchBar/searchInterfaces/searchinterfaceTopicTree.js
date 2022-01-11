import SearchInterface from "./searchInterface";

/**
 * The search interface to the topic tree.
 * @constructs
 * @extends SearchInterface
 * @param {String[]} [onClick=["activateLayerInTopicTree", "openTopicTree"]] Actions that are fired when clicking on the search result.
 * @param {String[]} [onHover=[]] Actions that are fired when hovering on the search result.
 * @returns {void}
 */
export default function SearchInterfaceTopicTree ({onclick, onHover} = {}) {
    SearchInterface.call(this, onclick || ["activateLayerInTopicTree", "openTopicTree"], onHover);
}

SearchInterfaceTopicTree.prototype = Object.create(SearchInterface.prototype);

/**
 * Search in topic tree search interface.
 * @override
 * @param {String} searchInput The search input.
 * @returns {void}
 */
SearchInterfaceTopicTree.prototype.search = function (searchInput) {
    // Do something
    return searchInput; // Dummy for linter
};
