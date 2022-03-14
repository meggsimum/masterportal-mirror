import SearchHit from "./searchHit";

/**
 * A search suggestion with its parameters.
 * For each search suggestion there is a default value.
 * @constructs
 * @extends SearchHit
 * @param {String} category The category to which the search suggestion should be assigned.
 * @param {String} id The id of the search suggestion.
 * @param {String} index The index of the search suggestions, representing the order.
 * @param {String} searchInterfaceId The id of the search interface.
 * @param {String} name The name of the search suggestion.
 *
 * @param {String} [displayedInfo=""] Info text that is displayed in the search suggestion.
 * @param {String} [icon=""] The icon that can be displayed in the search suggestion.Array
 * @param {String} [imagePath=""] The image that can be displayed in the search suggestion.Array
 * @param {String} [toolTip=""] Text to be displayed on the search suggestion when mousehovering.
 * @returns {void}
 */
export default function SearchHitSuggestion ({category, id, index, name, searchInterfaceId, displayedInfo, icon, imagePath, toolTip} = {}) {
    SearchHit.call(this, {category, id, index, name, searchInterfaceId, displayedInfo, icon, imagePath, toolTip});
}

SearchHitSuggestion.prototype = Object.create(SearchHit.prototype);
