import store from "../../src/app-store";

const SearchbarModel = Backbone.Model.extend(/** @lends SearchbarModel.prototype */{
    defaults: {
        placeholder: "Suche",
        recommendedList: [],
        recommendedListLength: 5,
        quickHelp: false,
        searchString: "",
        hitList: [],
        originalOrderHitList: [],
        finalHitList: [],
        isInitialSearch: true,
        isInitialRecommendedListCreated: false,
        knownInitialSearchTasks: ["gazetteer", "specialWFS", "bkg", "tree", "osm", "locationFinder", "elasticSearch", "komoot"],
        activeInitialSearchTasks: [],
        // translations
        i18nextTranslate: null,
        buttonSearchTitle: "",
        buttonOpenHelpTitle: "",
        sortByName: true,
        selectRandomHits: false,
        timeoutReference: null,
        showAllResultsText: "",
        searchResultOrder: [
            "common:modules.searchbar.type.address",
            "common:modules.searchbar.type.street",
            "common:modules.searchbar.type.parcel",
            "common:modules.searchbar.type.location",
            "common:modules.searchbar.type.district",
            "common:modules.searchbar.type.topic",
            "common:modules.searchbar.type.subject"
        ]
    },

    /**
     * @class SearchbarModel
     * @description todo
     * @extends Backbone.Model
     * @memberof Searchbar
     * @constructs
     * @property {String} placeholder="" todo
     * @property {Object[]} recommendedList=[] the list of shown (recommended) hits
     * @property {Number} recommendedListLength=5 todo
     * @property {Boolean} quickHelp=false todo
     * @property {String} searchString="" the current string in the search mask
     * @property {Object[]} hitList=[] an array of object{id, name, type} with optional values: coordinate, icon, geom, adress, locationFinder, metaName, osm, marker, geometryType, interiorGeometry, komoot
     * @property {Object[]} finalHitList=[] an array of object{id, name, type} with optional values: coordinate, icon, geom, adress, locationFinder, metaName, osm, marker, geometryType, interiorGeometry, komoot
     * @property {Boolean} isInitialSearch=true Flag that is set to false at the end of the initial search (ParametricURL).
     * @property {Boolean} isInitialRecommendedListCreated=false Has the recommended list already been generated after the initial search?
     * @property {String[]} knownInitialSearchTasks=["gazetteer", "specialWFS", "bkg", "tree", "osm", "locationFinder", "komoot"] Search algorithms for which an initial search is possible
     * @property {Array} activeInitialSearchTasks=[] Search algorithms for which an initial search is activated
     * @property {function} i18nextTranslate=null translation function named i18nextTranslate := function(setter), set during parsing the file "config.json"
     * @property {String} buttonSearchTitle="", filled with "Suchen"- translated
     * @property {String} buttonOpenHelpTitle="", filled with "Hilfe öffnen"- translated
     * @property {String} showAllResultsText="", filled with "alle Ergebnisse anzeigen"- translated
     * @listens Searchbar#RadioTriggerSearchbarCreateRecommendedList
     * @listens Searchbar#RadioTriggerSearchbarPushHits
     * @listens Searchbar#RadioTriggerSearchbarRemoveHits
     * @listens Searchbar#RadioTriggerSearchbarCheckInitialSearch
     * @listens Searchbar#RadioTriggerSearchbarAbortSearch
     * @fires ParametricURL#RadioRequestParametricURLGetInitString
     * @fires Searchbar#RadioTriggerSearchbarSetPastedHouseNumber
     * @fires Searchbar#RadioTriggerSearchbarSearch
     * @fires ViewZoom#RadioTriggerViewZoomHitSelected
     * @fires Searchbar#RadioTriggerSearchbarCheckInitialSearch
     * @returns {void}
     */
    initialize: function () {
        this.listenTo(Radio.channel("Searchbar"), {
            "createRecommendedList": this.createRecommendedList,
            "pushHits": this.pushHits,
            "removeHits": this.removeHits,
            "checkInitialSearch": this.checkInitialSearch,
            "abortSearch": this.abortSearch
        });

        this.listenTo(Radio.channel("i18next"), {
            "languageChanged": this.changeLang
        });

        if (store.state.urlParams && store.state.urlParams["Search/query"]) {
            // Speichere den Such-Parameter für die initiale Suche zur späteren Verwendung in der View
            this.setInitSearchString(store.state.urlParams["Search/query"]);
        }
        else {
            // Es wird keine initiale Suche durchgeführt
            this.set("isInitialSearch", false);
            this.set("isInitialRecommendedListCreated", true);
        }

        this.changeLang();
    },

    /**
     * change language - sets default values for the language.
     * If contents from config.json are translated, this is respected here by using the function "i18nextTranslate".
     * @param {String} lng the language changed to
     * @returns {Void} -
     */
    changeLang: function () {
        const setLanguage = {};

        if (typeof this.get("i18nextTranslate") === "function") {
            this.get("i18nextTranslate")(function (key, value) {
                setLanguage[key] = value;
            });
        }
        setLanguage.buttonSearchTitle = i18next.t("common:button.search");
        setLanguage.buttonOpenHelpTitle = i18next.t("common:modules.quickHelp.titleTag");
        setLanguage.showAllResultsText = i18next.t("common:modules.searchbar.showAllResults");

        this.set(setLanguage);
    },

    /**
     * If a search algorithm terminates the search, it is no longer necessary to wait for a result for this algorithm.
     * Therefore, this search algorithm is marked as done.
     * @param {String} triggeredBy Name of the calling search algorithm
     * @returns {void} result
     */
    abortSearch: function (triggeredBy) {
        if (this.get("isInitialSearch")) {
            // Markiere Algorithmus als abgearbeitet
            this.set("initialSearch_" + triggeredBy, true);
            // Prüfe, ob es noch ausstehende Ergebnisse gibt
            this.checkInitialSearch();
        }
    },

    /**
     * Checks whether all search algorithms of the initial search have been processed.
     * @returns {void}
     */
    checkInitialSearch: function () {
        let allDone = true;
        // Ist mindestens ein Suchalgorithmus noch als ausstehend markiert?

        this.get("activeInitialSearchTasks").forEach(taskName => {

            const status = this.get("initialSearch_" + taskName);

            if (!status) {
                allDone = false;
            }

        });

        if (allDone) {
            // Sobald alle Ergebnisse vorliegen, wird der Modus "Initiale Suche"
            // beendet und die Ergebnisliste erstmalig erzeugt.
            this.set("isInitialSearch", false);
            this.createRecommendedList("initialSearchFinished");
            this.checkInitialSearchResult(this.get("recommendedList"));
            this.set("isInitialRecommendedListCreated", true);
        }
    },

    /**
     * Creates a user message if the initialSearch has no results to inform the user.
     * @param   {Object[]} results recommendedList
     * @fires Alerting#RadioTriggerAlertAlert
     * @returns {void}
     */
    checkInitialSearchResult: function (results) {
        if (Array.isArray(results) && !results.length) {
            Radio.trigger("Alert", "alert", {
                text: i18next.t("common:modules.searchbar.noInitialResults"),
                fadeOut: 5000
            });
        }
    },

    /**
     * Check by configuration which search algorithms are activated for initial search
     * @param {Object} config Configuration
     * @returns {void}
     */
    setInitialSearchTasks: function (config) {
        const searchTasks = this.get("knownInitialSearchTasks"),
            activeSearchTasks = [];

        // Prüfe für jeden bekannten Suchalgorithmus ob er aktiviert ist. Wenn ja markiere ihn als
        // "Ergebnis ausstehend" und füge ihn der Liste aktiver Suchalgorithmen hinzu.
        searchTasks.forEach(taskName => {
            if (Object.prototype.hasOwnProperty.call(config, taskName)) {
                if (taskName === "gazetteer") {
                    // Der Suchalgorithmus "gazetteer" ist ein Sonderfall, da er mehrere Suchen durchführen kann
                    this.set("initialSearch_gazetteer_streetsOrHouseNumbers", false);
                    activeSearchTasks.push("gazetteer_streetsOrHouseNumbers");
                    this.set("initialSearch_gazetteer_streetKeys", false);
                    activeSearchTasks.push("gazetteer_streetKeys");
                }
                else {
                    this.set("initialSearch_" + taskName, false);
                    activeSearchTasks.push(taskName);
                }
            }
        });

        if (Array.isArray(config.searchResultOrder)) {
            this.set("searchResultOrder", config.searchResultOrder);
        }
        this.set("activeInitialSearchTasks", activeSearchTasks);
    },

    /**
     * Setter for attribute "initSearchString".
     * @param {String} value Search string for initial search.
     * @returns {void}
     */
    setInitSearchString: function (value) {
        this.set("initSearchString", value);
    },

    /**
    * called from view
    * @param {string} value - value from event
    * @param {string} eventType - type of the event
    * @fires Searchbar#RadioTriggerSearchbarSetPastedHouseNumber
    * @fires Searchbar#RadioTriggerSearchbarSearch
    * @returns {void}
    */
    setSearchString: function (value, eventType) {
        const splitAdress = value.split(" "),
            houseNumber = splitAdress[splitAdress.length - 1];

        // for copy/paste for addresses
        if (splitAdress.length > 1 && houseNumber.match(/\d/) && eventType === "paste") {
            Radio.trigger("Searchbar", "setPastedHouseNumber", houseNumber);
        }

        this.set("searchString", value);
        this.set("hitList", []);
        this.set("originalOrderHitList", []);
        this.set("finalHitList", []);
        Radio.trigger("Searchbar", "search", this.get("searchString"));
        $(".dropdown-menu-search").show();
    },

    /**
     * Help method to set an attribute of type Array.
     * @param  {String} attribute - todo
     * @param  {String} value - todo
     * @param  {event} evtType - todo
     * @fires ViewZoom#RadioTriggerViewZoomHitSelected
     * @return {void}
     */
    pushHits: function (attribute, value, evtType) {
        const clonedAttributes = [...this.get(attribute)];

        clonedAttributes.push(value);
        this.set(attribute, [].concat(...[].concat(...clonedAttributes)));

        if (evtType === "paste") {
            Radio.trigger("ViewZoom", "setMarkerZoom", value);
            if (clonedAttributes.length > 1) {
                Radio.trigger("Searchbar", "createRecommendedList");
            }
        }
    },

    /**
     * Removes all hits with the given filter
     * @param  {string} attribute object to be filtered
     * @param  {object[]} filter filter parameters
     * @return {Void} Nothing
     */
    removeHits: function (attribute, filter) {
        const tempArray = [...this.get(attribute)];
        let toRemove;

        if (typeof filter === "function" || typeof filter === "object") {
            toRemove = tempArray.filter(item => Object.keys(filter).every(key => item[key] === filter[key]));
            toRemove.forEach(item => {
                tempArray.splice(tempArray.indexOf(item), 1);
            });
        }
        else {
            for (let i = tempArray.length - 1; i >= 0; i--) {
                if (tempArray[i] === filter) {
                    tempArray.splice(i, 1);
                }
            }
        }
        this.set(attribute, Array.isArray(tempArray) ? tempArray.reduce((acc, val) => acc.concat(val), []) : tempArray);
    },

    /**
     * changes the filename extension of given filepath
     * @param  {String} src source string
     * @param  {String} ext file extension
     * @return {String} file extension
     */
    changeFileExtension: function (src, ext) {
        if (src === undefined) {
            return src;
        }
        if (src.substring(src.lastIndexOf("."), src.length) !== ext) {
            return src.substring(0, src.lastIndexOf(".")) + ext;
        }
        return src;
    },

    /**
     * crops names of hits to length zeichen
     * @param  {String} s todo
     * @param  {number} length todo
     * @returns {string} s todo
     */
    shortenString: function (s, length) {
        if (s === undefined) {
            return s;
        }
        if (s.length > length && length > 0) {
            return s.substring(0, length).trim() + "..";
        }
        return s;
    },

    /**
     * Generate a list with hits of the individual search algorithms.
     * @param {String} triggeredBy Calling search algorithm
     * @fires Searchbar#RadioTriggerSearchbarCheckInitialSearch
     * @fires ViewZoom#RadioTriggerViewZoomHitSelected
     * @returns {void}
     */
    createRecommendedList: function (triggeredBy) {
        const max = this.get("recommendedListLength"),
            originalOrderHitList = this.get("originalOrderHitList"),
            hitList = this.get("hitList"),
            finalHitList = hitList.concat(originalOrderHitList),
            typeList = this.prepareTypeList(finalHitList);
        let recommendedList = [];

        this.setFinalHitList(finalHitList);
        this.setTypeList(typeList);

        if (finalHitList.length > max && this.get("selectRandomHits")) {
            recommendedList = this.getRandomEntriesOfEachType(finalHitList, max);
        }
        else {
            recommendedList = this.chooseRecommendedHits(typeList, max);
            recommendedList = this.sortRecommendedList(typeList, recommendedList);
        }

        this.setRecommendedList(recommendedList);
        this.trigger("renderRecommendedList");

        if (triggeredBy === "initialSearchFinished" && finalHitList.length === 1) {
            Radio.trigger("ViewZoom", "hitSelected");
        }
    },

    /**
     * Choose the results for recommenden List
     * @param {Object[]} typeList Sorted Hits by Type.
     * @param {Number} max Length of recommended list.
     * @returns {Object[]} Hits for recommended list.
     */
    chooseRecommendedHits: function (typeList, max) {
        const recommendedList = [];

        for (let i = 0; i < max; i++) {
            typeList.forEach(typeItem => {
                if (typeItem.list[i] && recommendedList.length < max) {
                    recommendedList.push(typeItem.list[i]);
                }
            });
        }

        return recommendedList;
    },

    /**
     * Sorts list for recommended list by types of typeList.
     * @param {Object[]} typeList Sorted Hits by Type.
     * @param {Object[]} recommendedList Unsorted hits for recommended list.
     * @returns {Object[]} Sorted hits for recommended list.
     */
    sortRecommendedList: function (typeList, recommendedList) {
        const sortedRecommendedList = [],
            typeNames = typeList.map(types => types.type);

        typeNames.forEach(type => {
            recommendedList.forEach(hit => {
                if (hit.type === type) {
                    sortedRecommendedList.push(hit);
                }
            });
        });

        return sortedRecommendedList;
    },

    /**
     * @param {Object[]} hitList List of all hits from searchbar.
     * @param {Number} maxLength Configured number of hits to be shown.
     * @returns {Object[]} - random Entries. mimum length is given by attribute "maxLength".
     */
    getRandomEntriesOfEachType: function (hitList, maxLength) {
        const randomEntries = [],
            max = hitList.length < maxLength ? hitList.length : maxLength;
        let foundTypes = [],
            foundTypesIterator = 0,
            counter = 0;

        hitList.every(hit => foundTypes.push(hit.type));
        foundTypes = [...new Set(foundTypes)];

        while (counter < max) {
            const foundTypesLength = foundTypes.length,
                positionOfFoundTypes = foundTypesIterator % foundTypesLength,
                type = foundTypes[positionOfFoundTypes],
                randomEntryByType = this.getRandomEntryByType(hitList, type);

            if (!randomEntries.includes(randomEntryByType)) {
                randomEntries.push(randomEntryByType);
                counter++;
            }
            foundTypesIterator++;
        }

        return randomEntries;
    },

    /**
     * Filters the hitList by type and returns an random object of the list.
     * @param {Object[]} hitList List of all hits from searchbar.
     * @param {String} type Type of search.
     * @returns {Object} - random object of hitlist by given type.
     */
    getRandomEntryByType: function (hitList, type) {
        const hitListByType = hitList.filter(hit => hit.type === type),
            randomNumber = Math.floor(Math.random() * hitListByType.length);

        return hitListByType[randomNumber];
    },

    /**
     * Sorts the hitList by type.
     * @param {Object[]} hitList Hitlist.
     * @returns {Object[]} - sorted Hits by Type
     */
    prepareTypeList: function (hitList) {
        const typeList = [],
            types = hitList.map(hit => hit.type),
            uniqueTypes = types.reduce((unique, item) => {
                return unique.includes(item) ? unique : [...unique, item];
            }, []),
            searchResultOrder = [];

        let sortedUniqueTypes = uniqueTypes;

        if (sortedUniqueTypes.length && Array.isArray(this.get("searchResultOrder")) && this.get("searchResultOrder").length) {
            this.get("searchResultOrder").forEach(type => {
                searchResultOrder.push(i18next.t(type));
            });
            sortedUniqueTypes = this.sortUniqueTypes(uniqueTypes, searchResultOrder);
        }

        sortedUniqueTypes.forEach(type => {
            const typeListPart = hitList.filter(hit => {
                    return hit.type === type;
                }),
                typeListObj = {
                    type: type,
                    list: typeListPart
                };

            typeList.push(typeListObj);
        });

        return typeList;
    },

    /**
     * Sorts the uniqueTypes by searchResultOrder
     * @param {String[]} uniqueTypes unique types from searching results
     * @param {String[]} searchResultOrder the predefined order
     * @return {String[]} - sorted array of unique types as result order
     */
    sortUniqueTypes: function (uniqueTypes, searchResultOrder) {
        const sortedUniqueTypes = [];

        searchResultOrder.forEach(type => {
            if (uniqueTypes.includes(type)) {
                sortedUniqueTypes.push(type);
            }
        });

        uniqueTypes.forEach(type => {
            if (!searchResultOrder.includes(type)) {
                sortedUniqueTypes.push(type);
            }
        });

        return sortedUniqueTypes;
    },

    /**
     * Setter for attribute "recommendedList".
     * @param {Object[]} value recommendedList.
     * @returns {void}
     */
    setRecommendedList: function (value) {
        this.set("recommendedList", value);
    },

    /**
     * Setter for attribute "hitList".
     * @param {Object[]} value hitList.
     * @returns {void}
     */
    setHitList: function (value) {
        this.set("hitList", value);
    },

    /**
     * Setter for attribute "finalHitList".
     * @param {Object[]} value finalHitList.
     * @returns {void}
     */
    setFinalHitList: function (value) {
        this.set("finalHitList", value);
    },

    /**
     * Setter for attribute "typeList".
     * @param {Object[]} value typeList.
     * @returns {void}
     */
    setTypeList: function (value) {
        this.set("typeList", value);
    },

    /**
     * Setter for "eventType"
     * @param {String} value eventType
     * @returns {void}
     */
    setEventType: function (value) {
        this.set("eventType", value);
    },

    /**
     * Setter for "searchFieldisSelected"
     * @param {String} value searchFieldisSelected
     * @returns {void}
     */
    setSearchFieldisSelected: function (value) {
        this.set("searchFieldisSelected", value);
    },

    /**
     * Setter for "quickHelp"
     * @param {String} value quickHelp
     * @returns {void}
     */
    setQuickHelp: function (value) {
        this.set("quickHelp", value);
    },

    /**
     * Setter for "hitIsClick"
     * @param {String} value hitIsClick
     * @returns {void}
     */
    setHitIsClick: function (value) {
        this.set("hitIsClick", value);
    }
});

export default SearchbarModel;
