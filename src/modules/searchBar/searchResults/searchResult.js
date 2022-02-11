/**
 * A search result with its parameters.
 * For each search result there is a default value.
 * @constructs
 * @param {String} searchResult.category The category to which the search result should be assigned.
 * @param {String} searchResult.id The id of the search result.
 * @param {String} searchResult.name The name of the search result.
 *
 * @param {Object} [searchResult={}] The search result.
 * @param {String[]} [searchResult.coordinate = []] The coordinates of the search result.
 * @param {String} [searchResult.displayedInfo = ""] Info text that is displayed in the search result.
 * @param {module:ol/Feature~Feature} [searchResult.feature = {}] The ol feature of the search result.
 * @param {String} [searchResult.geometryType = ""] The geometry type of the search result.
 * @param {Object} [searchResult.gfiAttributes = {}] The get feature info attributes of the search result.
 * @param {String} [searchResult.icon = ""] The icon that can be displayed in the search result.Array
 * @param {String} [searchResult.imagePath = ""] The image that can be displayed in the search result.Array
 * @param {String} [searchResult.layerId = ""] The layer id of the search result.
 * @param {String[]} [searchResult.onClick = []] Actions that are fired when clicking on the search result.
 * @param {String[]} [searchResult.onHover = []] Actions that are fired when hovering on the search result.
 * @property {String} [toolTip=""] Text to be displayed on the search result when mousehovering.
 * @returns {void}
 */
export default function SearchResult ({category, id, name, coordinates, displayedInfo, feature, geometryType, gfiAttributes, icon, imagePath, layerId, onClick, onHover, toolTip} = {}) {
    this.category = category;
    this.id = id;
    this.name = name;

    this.coordinates = coordinates || [];
    this.displayedInfo = displayedInfo || "";
    this.feature = feature || {};
    this.geometryType = geometryType || "";
    this.gfiAttributes = gfiAttributes || {};
    this.icon = icon || "";
    this.imagePath = imagePath || "";
    this.layerId = layerId || "";
    this.onClick = onClick || [];
    this.onHover = onHover || [];
    this.toolTip = toolTip || "";
}
