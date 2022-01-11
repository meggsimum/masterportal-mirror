/**
 * User type definition
 * @typedef {Object} SearchBarState
 * @property {String} [id="searchBar"] Id of the SearchBar component.
 * @property {String} [minCharacters=3] Minimum amount of characters required to start a search.
 * @property {String} [placeholder="common:modules.searchbar.placeholder.address"] Input text field placeholder shown when no input has been given yet.
 * @property {Object} [searchInterfaces={}] The configurations of the search interfaces
 * @property {Number} [suggestionListLength=5] Maximum amount of entries in the suggestion list.
 * @property {Number} [zoomLevel=7] Defines the zoom level to use on zooming to a result.
 *
 * @property {String} [searchInput=""] The search input.
 * @property {Object[]} [searchResult=[]] The results of the configured searchInterfaces.
 */
const state = {
    id: "searchBar",
    minCharacters: 3,
    placeholder: "common:modules.searchbar.placeholder.address",
    searchInterfaces: {},
    suggestionListLength: 5,
    zoomLevel: 7,

    searchInput: "",
    searchResults: []
};

export default state;
