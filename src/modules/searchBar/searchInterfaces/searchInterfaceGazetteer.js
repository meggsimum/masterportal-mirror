import SearchInterface from "./searchInterface";
import store from "../../../app-store";
import {search, setGazetteerUrl, setShowGeographicIdentifier} from "masterportalAPI/src/searchAddress";

/**
 * The search interface to the gazetteer.
 * @constructs
 * @extends SearchInterface
 * @param {String} serviceId Search service id. Resolved using the rest-services.json file.
 *
 * @param {Object} [resultEvents] Actions that are executed when an interaction, such as hover or click, is performed with a result list item.
 * @param {String[]} [resultEvents.onClick=["setMarker", "zoomToFeature"]] Actions that are fired when clicking on a result list item.
 * @param {String[]} [resultEvents.onHover=["setMarker"]] Actions that are fired when hovering on a result list item.
 * @param {Boolean} [searchDistricts=false] Defines whether district search is active.
 * @param {String} [searchInterfaceId="gazetteer"] The id of the service interface.
 * @param {Boolean} [searchAddress=false] Defines whether address search is active.
 * @param {Boolean} [searchHouseNumbers=false] Defines whether house numbers should be searched for.
 * @param {Boolean} [searchParcels=false] Defines whether parcels search is active.
 * @param {Boolean} [searchStreetKey=false] Defines whether streets should be searched for by key.
 * @param {Boolean} [searchStreets=false] Defines whether street search is active.
 * @param {Boolean} [showGeographicIdentifier=false] Defines whether GeographicIdentifier should be displayed in the search result.
 * @returns {void}
 */
export default function SearchInterfaceGazetteer ({serviceId, resultEvents, searchAddress, searchDistricts, searchInterfaceId, searchHouseNumbers, searchParcels, searchStreetKey, searchStreets, showGeographicIdentifier} = {}) {
    SearchInterface.call(this,
        "client",
        searchInterfaceId || "gazetteer",
        resultEvents || {
            onClick: ["setMarker", "zoomToFeature"],
            onHover: ["setMarker"]
        });

    this.serviceId = serviceId;

    this.showGeographicIdentifier = showGeographicIdentifier || false;
    this.searchAddress = searchAddress || false;
    this.searchDistricts = searchDistricts || false;
    this.searchHouseNumbers = searchHouseNumbers || false;
    this.searchParcels = searchParcels || false;
    this.searchStreetKey = searchStreetKey || false;
    this.searchStreets = searchStreets || false;

    setGazetteerUrl(store?.getters?.getRestServiceById(this.serviceId)?.url);
    setShowGeographicIdentifier(this.showGeographicIdentifier);
}

SearchInterfaceGazetteer.prototype = Object.create(SearchInterface.prototype);

/**
 * Search in gazetteer search interface.
 * @override
 * @param {String} searchInput The search input.
 * @returns {void}
 */
SearchInterfaceGazetteer.prototype.search = async function (searchInput) {
    const searchResults = await this.startSearch(searchInput),
        normalizedResults = this.normalizeResults(searchResults);

    this.pushObjectsToSearchResults(normalizedResults);
    this.totalHits = this.searchResults.length;

    return this.searchResults;
};

/**
 * Starts the search via the MasterportalAPI.
 * @param {String} searchInput The search input.
 * @returns {void}
 */
SearchInterfaceGazetteer.prototype.startSearch = async function (searchInput) {
    let searchResults = [];

    try {
        this.searchState = "running";
        searchResults = await search(searchInput, {
            map: store.getters["Map/ol2DMap"],
            searchAddress: this.searchAddress,
            searchStreets: this.searchStreets,
            searchDistricts: this.searchDistricts,
            searchParcels: this.searchParcels,
            searchStreetKey: this.searchStreetKey,
            searchHouseNumbers: this.searchHouseNumbers
        }, true);
        this.searchState = "finished";
    }
    catch (error) {
        this.searchState = "aborted";
        if (String(error) !== "AbortError: The user aborted a request.") {
            this.searchState = "failed";
            console.error(error);
        }
    }

    return searchResults;
};

/**
 * Normalizes the search results to display them in a SearchResult.
 * @param {Object[]} searchResults The search results of gazetter.
 * @returns {Object[]} The normalized search result.
 */
SearchInterfaceGazetteer.prototype.normalizeResults = function (searchResults) {
    const normalizedResults = [];

    searchResults.forEach(searchResult => {
        const translatedType = this.getTranslationByType(searchResult.type);

        normalizedResults.push({
            events: this.normalizeResultEvents(this.resultEvents, searchResult),
            category: translatedType,
            id: searchResult.name.replace(/ /g, "") + translatedType,
            icon: "glyphicon-road",
            name: searchResult.name
        });
    });

    return normalizedResults;
};

/**
 * Returns the translation key to a search result type.
 * @param {String} type The search result type.
 * @returns {String} The translation key.
 */
SearchInterfaceGazetteer.prototype.getTranslationByType = function (type) {
    const keys = {
        addressAffixed: "common:modules.searchbar.type.address",
        addressUnaffixed: "common:modules.searchbar.type.address",
        district: "common:modules.searchbar.type.district",
        houseNumbersForStreet: "common:modules.searchbar.type.address",
        parcel: "common:modules.searchbar.type.parcel",
        street: "common:modules.searchbar.type.street"
    };

    return i18next.t(keys[type]);
};

/**
 * Normalizes and fills the result events to use them in the search result.
 * @param {Object} resultEvents The configured result events.
 * @param {Object} searchResult The search result of gazetter.
 * @returns {Object} The normalized actions for SearchResult.
 */
SearchInterfaceGazetteer.prototype.normalizeResultEvents = function (resultEvents, searchResult) {
    const resultEventsAsObject = this.resultEventsToObject(resultEvents),
        possibleActions = this.createPossibleActions(searchResult);

    Object.keys(resultEventsAsObject).forEach(event => {
        Object.keys(resultEventsAsObject[event]).forEach(action => {
            resultEventsAsObject[event][action] = possibleActions[action];
        });
    });

    return resultEventsAsObject;
};

/**
 * Creates the possible actions and fills them.
 * @param {Object} searchResult The search result of gazetter.
 * @returns {Object} The possible actions.
 */
SearchInterfaceGazetteer.prototype.createPossibleActions = function (searchResult) {
    return {
        setMarker: {
            coordinates: searchResult.geometry.coordinates,
            closeResults: true
        },
        zoomToFeature: {
            coordinates: searchResult.geometry.coordinates,
            closeResults: true
        }
    };
};
