import "../model";
import {transformToMapProjection} from "masterportalapi/src/crs";
import store from "../../../src/app-store";

const KomootModel = Backbone.Model.extend(/** @lends KomootModel.prototype */{
    defaults: {
        minChars: 3,
        komootServiceUrl: "",
        limit: 10,
        lang: "de",
        osm_tag: undefined,
        bbox: undefined,
        lon: undefined,
        lat: undefined,
        searchOnEnter: false,
        ajaxRequest: null,
        serviceId: 11
    },

    /**
     * @class KomootModel
     * @description Initialization of the Komoot Photon search
     * @extends Backbone.Model
     * @memberOf Searchbar.Komoot
     * @constructs
     * @property {number} minChars=3 - Minimum length of search string to start.
     * @property {string} komootServiceUrl="" - Id of restService to derive url from.
     * @property {number} limit=10 - Number of requested Result
     * @property {string} lang="de" - Requested Language
     * @property {string} osm_tag=undefined - Filter for OSM Tags
     * @property {string} bbox=undefined - Extent to limit the search area.
     * @property {number} lon=undefined - longitude of the search center.
     * @property {number} lat=undefined - latitude of the search center.
     * @listens Searchbar#RadioTriggerSearchbarSearchAll
     * @fires RestReader#RadioRequestRestReaderGetServiceById
     * @fires Core#RadioRequestParametricURLGetInitString
     * @fires Searchbar#RadioTriggerSearchbarRemoveHits
     * @fires Searchbar#RadioTriggerSearchbarAbortSearch
     * @fires Searchbar#RadioTriggerSearchbarPushHits
     * @fires Searchbar#RadioTriggerSearchbarCreateRecommendedList
     * @returns {void}
     */
    initialize: function () {
        const service = Radio.request("RestReader", "getServiceById", this.get("serviceId"));

        if (service !== undefined && service.get("url") !== undefined) {
            this.setKomootServiceUrl(service.get("url"));
        }

        if (store.state.urlParams && store.state.urlParams["Search/query"]) {
            this.search(store.state.urlParams && store.state.urlParams["Search/query"]);
        }
        if (this.get("searchOnEnter")) {
            this.listenTo(Radio.channel("Searchbar"), {
                "searchAll": this.search
            });
        }
        else {
            this.listenTo(Radio.channel("Searchbar"), {
                "search": this.search,
                "searchAll": this.search
            });
        }
    },

    /**
     * Access for the search...
     * Is triggered by the search bar.
     * @param {string} searchString - The search string.
     * @fires Searchbar#RadioTriggerSearchbarRemoveHits
     * @fires Searchbar#RadioTriggerSearchbarAbortSearch
     * @returns {void}
     */
    search: function (searchString) {
        if (searchString.length >= this.get("minChars")) {
            Radio.trigger("Searchbar", "removeHits", "hitList", {type: "Komoot"});
            this.suggestByKomoot(searchString);
        }
        else {
            Radio.trigger("Searchbar", "abortSearch", "komoot");
        }
    },

    getRequestParameter: function (searchString) {
        const searchStrings = [],
            tmp = searchString.split(",");
        let request;

        tmp.forEach(elem => {
            if (elem.indexOf(" ") > -1) {
                elem.split(" ").forEach(elem2 => {
                    if (elem2.trim().length > 0) {
                        searchStrings.push(elem2);
                    }
                });
            }
            else {
                searchStrings.push(elem);
            }
        });

        request = "lang=" + this.get("lang");
        request = request + "&lon=" + this.get("lon") + "&lat=" + this.get("lat");
        if (this.get("bbox") !== undefined) {
            request += "&bbox=" + this.get("bbox");
        }
        if (this.get("osm_tag") !== undefined) {
            request += "&osm_tag=" + this.get("osm_tag");
        }
        return request + "&q=" + encodeURIComponent(searchString);
    },

    /**
     * Search string (street HsNr) constructed by user...
     * @param {string} searchString - The search string.
     * @returns {void}
     */
    suggestByKomoot: function (searchString) {
        const request = this.getRequestParameter(searchString);

        this.sendRequest(this.get("komootServiceUrl"), request, this.pushSuggestions);
    },

    /**
     * Generates the Display-Name for a Response Entry
     * @param  {*} hit - Response entry
     * @returns {String} The Name to show in the Search-result-list
     */
    getDisplayString: function (hit) {
        let display, city_display;

        display = hit.properties.name;

        const street = hit.properties.street,
            county = hit.properties.county;

        if (street !== undefined) {
            if (display !== undefined) {
                display = display + ", ";
            }
            else {
                display = "";
            }
            display = display + street;
            if (hit.properties.housenumber !== undefined) {
                display = display + " " + hit.properties.housenumber;
            }
        }

        city_display = hit.properties.city;
        if (county !== undefined && city_display === undefined) {
            city_display = county;
        }
        else if (hit.properties.postcode !== undefined) {
            city_display = hit.properties.postcode + " " + city_display;
        }
        if (hit.properties.district !== undefined) {
            city_display += " - " + hit.properties.district;
        }
        if (city_display !== undefined) {
            display += ", " + city_display;
        }
        return display;
    },

    /**
     * Generates the Tooltip for a Response Entry based on the Display-Name
     * @param  {*} hit - Response entry
     * @param  {String} display - DisplayName for the Search-result-list
     * @returns {String} Tooltip for Search-result-list
     */
    getMetadataString: function (hit, display) {
        let metaName;

        metaName = display;
        if (hit.properties.state !== undefined || hit.properties.country !== undefined) {
            metaName = metaName + ", " + hit.properties.state + " " + hit.properties.country;
            if (hit.properties.suburb !== undefined) {
                metaName = metaName + " (" + hit.properties.suburb + ")";
            }
        }
        return metaName;
    },

    /**
     * Evaluate hits of the first search; create offer list.
     * @param  {Array} data - Response data
     * @fires Searchbar#RadioTriggerSearchbarPushHits
     * @fires Searchbar#RadioTriggerSearchbarCreateRecommendedList
     * @returns {void}
     */
    pushSuggestions: function (data) {
        let display,
            metaName,
            center,
            coordinates;

        data.features.forEach(hit => {
            display = this.getDisplayString(hit);

            // Tooltip
            metaName = this.getMetadataString(hit, display);

            coordinates = hit.geometry.coordinates;
            center = transformToMapProjection(Radio.request("Map", "getMap"), "WGS84", [parseFloat(coordinates[0]), parseFloat(coordinates[1])]);

            Radio.trigger("Searchbar", "pushHits", "hitList", {
                name: display,
                metaName: metaName,
                type: "Komoot",
                komoot: true,
                glyphicon: "glyphicon-road",
                id: Radio.request("Util", "uniqueId", "komootSuggest"),
                marker: hit.class === "building",
                coordinate: center
            });
        });
        Radio.trigger("Searchbar", "createRecommendedList", "komoot");
    },

    /**
     * Abortet ggf. vorhandenen Request und initiiert neuen Request.
     * @param {String} url - URL the request is sent to.
     * @param {String} data - Data to be sent to the server
     * @param {function} successFunction - A function to be called if the request succeeds
     * @returns {void}
     */
    sendRequest: function (url, data, successFunction) {
        const ajax = this.get("ajaxRequest");

        if (ajax !== null) {
            ajax.abort();
            this.polishAjax();
        }
        this.ajaxSend(url, data, successFunction);
    },

    /**
     * Fires an HTTP GET request and saves its id.
     * @param  {String} url - URL of the Service
     * @param  {JSON} data - Data to be sent to the server
     * @param  {function} successFunction - A function to be called if the request succeeds
     * @return {void}
     */
    ajaxSend: function (url, data, successFunction) {
        this.setAjaxRequest($.ajax({
            url: url,
            data: data,
            dataType: "json",
            context: this,
            type: "GET",
            success: successFunction,
            timeout: 6000,
            error: function (err) {
                if (err.status !== 0) { // Bei abort keine Fehlermeldung
                    this.showError(err);
                }
                Radio.trigger("Searchbar", "abortSearch", "komoot");
            },
            complete: function () {
                this.polishAjax();
            }
        }));
    },

    /**
     * Triggers the display of an error message.
     * @param {object} err - Error object from Ajax request.
     * @returns {void}
     */
    showError: function (err) {
        const detail = err.statusText && err.statusText !== "" ? err.statusText : "";

        Radio.trigger("Alert", "alert", i18next.t("common:modules.searchbar.komoot.errorMsg") + " " + detail);
    },

    /**
     * Setter for polishAjax
     * @returns {void}
     */
    polishAjax: function () {
        this.setAjaxRequest(null);
    },

    /**
     * Setter for komootServiceUrl.
     * @param {*} value - The service url
     * @returns {void}
     */
    setKomootServiceUrl: function (value) {
        this.set("komootServiceUrl", value);
    },

    /**
     * Setter for ajaxRequest.
     * @param {*} value - The Ajax-Request
     * @returns {void}
     */
    setAjaxRequest: function (value) {
        this.set("ajaxRequest", value);
    }
});

export default KomootModel;
