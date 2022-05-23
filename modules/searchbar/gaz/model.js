import "../model";
import store from "../../../src/app-store";
import {search, setGazetteerUrl, setShowGeographicIdentifier} from "@masterportal/masterportalapi/src/searchAddress";

const GazetteerModel = Backbone.Model.extend({
    defaults: {
        minChars: 3,
        gazetteerURL: "",
        searchAddress: false,
        searchStreets: false,
        searchHouseNumbers: false,
        searchDistricts: false,
        searchParcels: false,
        searchStreetKey: false,
        serviceId: null,
        showGeographicIdentifier: false
    },
    /**
     * @description Initialization of the Gazetteer search
     * @param {Object} config The configuration object for the Gazetteer search.
     * @param {Boolean} [config.searchAddress=false] Should addresses be searched for.
     * @fires RestReader#RadioRequestRestReaderGetServiceById
     * @returns {void}
     */
    initialize: function (config) {
        this.listenTo(Radio.channel("Searchbar"), {
            "search": this.searchMinChars,
            "setPastedHouseNumber": this.setPastedHouseNumber
        });

        this.setGazetteerURL(store.getters.getRestServiceById(this.get("serviceId"))?.url);
        setShowGeographicIdentifier(this.get("showGeographicIdentifier"));

        if (typeof config.searchAddress === "undefined" && this.get("searchStreets") && this.get("searchHouseNumbers")) {
            this.set("searchAddress", true);
            console.warn("For backward compatibility, the 'searchAddress' attribute is set to true,"
                + " as 'searchStreets' and 'searchHouseNumbers' are set to true."
                + " Please set the 'searchAddress' attribute in config.json");
        }

        if (store?.state?.urlParams["Search/query"]) {
            this.startSearchByUrlParam(store.state.urlParams["Search/query"]);
        }
    },

    /**
     * Starts the search by entering the url param 'query'.
     * @param {String} query Search input from the url param 'query'.
     * @returns {void}
     */
    startSearchByUrlParam: function (query) {
        const splittedSearchInput = query.split(" ");

        this.setPastedHouseNumber(splittedSearchInput[splittedSearchInput.length - 1]);
        this.searchMinChars(query);
    },

    /**
     * Starts search when the minimum number of characters has been entered.
     * @param {String} searchInput The search input.
     * @returns {void}
     */
    searchMinChars: function (searchInput) {
        if (searchInput.length >= this.get("minChars")) {
            this.startSearch(searchInput);
        }
    },

    /**
     * Starts the search via the MasterportalAPI
     * @param {String} searchInput The search input.
     * @returns {void}
     */
    startSearch: function (searchInput) {
        search(searchInput, {
            map: mapCollection.getMap("2D"),
            searchAddress: this.get("searchAddress"),
            searchStreets: this.get("searchStreets"),
            searchDistricts: this.get("searchDistricts"),
            searchParcels: this.get("searchParcels"),
            searchStreetKey: this.get("searchStreetKey"),
            searchHouseNumbers: this.get("searchHouseNumbers")
        }, true)
            .then(searchResults => this.processSearchResults(searchResults))
            .catch(error => {
                if (String(error) !== "AbortError: The user aborted a request.") {
                    console.error(error);
                }
            });
    },

    /**
     * Processes the search results found.
     * A found search hit for a pasted search input is handled separately
     * @param {Object[]} searchResults The search results.
     * @fires Searchbar#RadioTriggerSearchbarCreateRecommendedList
     * @returns {void}
     */
    processSearchResults: function (searchResults) {
        const houseNumber = searchResults[0]?.properties?.hausnummer?._,
            houseNumberExtension = searchResults[0]?.properties?.hausnummernzusatz?._ || "";

        if (searchResults?.length === 1 && this.get("pastedHouseNumber") === houseNumber + houseNumberExtension) {
            this.setPastedHouseNumber(null);
            this.pushResult(searchResults[0], "paste");
        }
        else {
            this.pushAllResults(searchResults);
            Radio.trigger("Searchbar", "createRecommendedList");
        }
    },

    /**
     * Pushes all search results into the hitList.
     * @param {Object[]} [searchResults=[]] The search results.
     * @fires Util#RadioRequestUtilSort
     * @returns {void}
     */
    pushAllResults: function (searchResults = []) {
        const sortedSearchResults = Radio.request("Util", "sort", "address", searchResults, "name");

        sortedSearchResults.forEach(searchResult => {
            this.pushResult(searchResult);
        });
    },

    /**
     * Pushes a search result into the hitList.
     * @param {Object} searchResult The search result.
     * @param {String} [evtType=null] Event type via which the search input was entered.
     * @fires Searchbar#RadioTriggerSearchbarPushHits
     * @returns {void}
     */
    pushResult: function (searchResult, evtType = null) {
        const translatedType = this.getTranslationByType(searchResult.type);

        Radio.trigger("Searchbar", "pushHits", "hitList", {
            name: searchResult.name,
            type: translatedType,
            coordinate: searchResult.geometry.coordinates,
            icon: "bi-signpost-split-fill",
            id: searchResult.name.replace(/ /g, "") + translatedType
        }, evtType);
    },

    /**
     * Returns the translation key to a search result type.
     * @param {String} type The search result type.
     * @returns {String} The translation key.
     */
    getTranslationByType: function (type) {
        const keys = {
            addressAffixed: "common:modules.searchbar.type.address",
            addressUnaffixed: "common:modules.searchbar.type.address",
            district: "common:modules.searchbar.type.district",
            houseNumbersForStreet: "common:modules.searchbar.type.address",
            parcel: "common:modules.searchbar.type.parcel",
            street: "common:modules.searchbar.type.street"
        };

        return i18next.t(keys[type]);
    },

    /**
     * Set the gazetteer URL.
     * Also sets the URL in masterportalAPI.
     * @param {String} gazetteerURL The gazetteer URL.
     * @returns {void}
     */
    setGazetteerURL: function (gazetteerURL) {
        setGazetteerUrl(gazetteerURL);
        this.set("gazetteerURL", gazetteerURL);
    },

    /**
     * Set to true, if search input is paste.
     * @param {String} houseNumber The house number.
     * @returns {void}
     */
    setPastedHouseNumber: function (houseNumber) {
        this.set("pastedHouseNumber", houseNumber);
    }
});

export default GazetteerModel;
