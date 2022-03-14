/**
 * A search result with its parameters.
 * For each search result there is a default value.
 * @abstract
 * @constructs
 * @param {String} category The category to which the search result should be assigned.
 * @param {String} id The id of the search result.
 * @param {String} index The index of the search results, representing the order.
 * @param {String} searchInterfaceId The id of the search interface.
 * @param {String} name The name of the search result.
 *
 * @param {String} [displayedInfo=""] Info text that is displayed in the search result.
 * @param {String} [icon=""] The icon that can be displayed in the search result.Array
 * @param {String} [imagePath=""] The image that can be displayed in the search result.Array
 * @param {String} [toolTip=""] Text to be displayed on the search result when mousehovering.
 *
 * @returns {void}
 */
export default function SearchHit ({category, id, index, name, searchInterfaceId, displayedInfo, icon, imagePath, toolTip} = {}) {
    this.category = category;
    this.id = id;
    this.index = index;
    this.name = name;
    this.searchInterfaceId = searchInterfaceId;

    this.displayedInfo = displayedInfo || "";
    this.icon = icon || "";
    this.imagePath = imagePath || "";
    this.toolTip = toolTip || "";
}
