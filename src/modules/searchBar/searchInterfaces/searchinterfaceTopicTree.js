import SearchInterface from "./searchInterface";

/**
 * The search interface to the topic tree.
 * @constructs
 * @extends SearchInterface
 * @param {Object} [resultEvents] Actions that are executed when an interaction, such as hover or click, is performed with a result list item.
 * @param {String[]} [resultEvents.onClick=["activateLayerInTopicTree", "openTopicTree"]] Actions that are fired when clicking on a result list item.
 * @param {String} [searchInterfaceId="topicTree"] The id of the service interface.
 * @returns {void}
 */
export default function SearchInterfaceTopicTree ({resultEvents, searchInterfaceId} = {}) {
    SearchInterface.call(this,
        "client",
        searchInterfaceId || "topicTree",
        resultEvents || {
            onClick: ["activateLayerInTopicTree", "openTopicTree"]
        });
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
