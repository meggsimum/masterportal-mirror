import "../model";
import {transformToMapProjection} from "@masterportal/masterportalapi/src/crs";
import store from "../../../src/app-store";

const OsmModel = Backbone.Model.extend(/** @lends OsmModel.prototype */{
    defaults: {
        minChars: 3,
        osmServiceUrl: "",
        limit: 50,
        street: "",
        states: "",
        searchParams: [],
        classes: [],
        ajaxRequest: null,
        serviceId: 10
    },

    /**
     * @class OsmModel
     * @description Initialization of the OSM search
     * @extends Backbone.Model
     * @memberOf Searchbar.Osm
     * @constructs
     * @property {number} minChars=3 - todo
     * @property {string} osmServiceUrl="" - todo
     * @property {number} limit=50 - todo
     * @property {string} street="" - todo
     * @property {string} states="" - todo
     * @property {Array} searchParams=[] - todo
     * @property {Array} classes=[] - todo
     * @property {*} ajaxRequest=null - todo
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
            this.setOsmServiceUrl(service.get("url"));
        }

        if (store.state.urlParams && store.state.urlParams["Search/query"]) {
            this.search(store.state.urlParams && store.state.urlParams["Search/query"]);
        }
        this.listenTo(Radio.channel("Searchbar"), {
            "searchAll": this.search
        });
    },

    /**
     * Access for the search...
     * Is triggered by the search bar.
     * @param {string} searchString - todo
     * @fires Searchbar#RadioTriggerSearchbarRemoveHits
     * @fires Searchbar#RadioTriggerSearchbarAbortSearch
     * @returns {void}
     */
    search: function (searchString) {
        if (searchString.length >= this.get("minChars")) {
            Radio.trigger("Searchbar", "removeHits", "hitList", {type: "OpenStreetMap"});
            this.suggestByOSM(searchString);
        }
        else {
            Radio.trigger("Searchbar", "abortSearch", "osm");
        }
    },

    /**
     * Search string (street HsNr) constructed by user...
     * @param {string} searchString - todo
     * @returns {void}
     */
    suggestByOSM: function (searchString) {
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

        this.setSearchParams(searchStrings);

        request = "countrycodes=de&format=json&polygon=0&addressdetails=1&extratags=1&limit=" + this.get("limit");
        request = request + "&q=" + encodeURIComponent(searchString);

        this.sendRequest(this.get("osmServiceUrl"), request, this.pushSuggestions);
    },

    /**
     * Evaluate hits of the first search; create offer list.
     * @param  {Array} data - todo
     * @fires Searchbar#RadioTriggerSearchbarPushHits
     * @fires Searchbar#RadioTriggerSearchbarCreateRecommendedList
     * @returns {void}
     */
    pushSuggestions: function (data) {
        let display,
            metaName,
            bbox,
            north,
            east,
            upper,
            lower,
            center,
            weg,
            county;

        data.forEach(hit => {
            if (this.get("states").length === 0 || this.get("states").includes(hit.address.state || hit.address.city)) {
                if (this.isSearched(hit, this.get("searchParams"))) {
                    weg = hit.address.road || hit.address.pedestrian;
                    county = hit.address.county;
                    display = hit.address.city || hit.address.city_district || hit.address.town || hit.address.village || hit.address.suburb;
                    if (county !== undefined && display === undefined) {
                        display = county;
                    }
                    if (weg !== undefined) {
                        display = display + ", " + weg;
                        if (hit.address.house_number !== undefined) {
                            display = display + " " + hit.address.house_number;
                        }
                    }

                    // Tooltip
                    metaName = display;
                    if (hit.address.postcode !== undefined && (hit.address.state !== undefined || hit.address.city !== undefined)) {
                        metaName = metaName + ", " + hit.address.postcode + " " + (hit.address.state || hit.address.city);
                        if (hit.address.suburb !== undefined) {
                            metaName = metaName + " (" + hit.address.suburb + ")";
                        }
                    }

                    bbox = hit.boundingbox;
                    if (hit?.lon && hit?.lat) {
                        center = transformToMapProjection(Radio.request("Map", "getMap"), "WGS84", [parseFloat(hit.lon), parseFloat(hit.lat)]);
                    }
                    else if (hit.address.house_number !== undefined) {
                        // Find the center of the BoundingBox and transform it from lat/lon to the target coordinate system...
                        north = (parseFloat(bbox[0]) + parseFloat(bbox[1])) / 2.0;
                        east = (parseFloat(bbox[2]) + parseFloat(bbox[3])) / 2.0;
                        center = transformToMapProjection(Radio.request("Map", "getMap"), "WGS84", [east, north]);
                    }
                    else {
                        upper = transformToMapProjection(Radio.request("Map", "getMap"), "WGS84", [parseFloat(bbox[3]), parseFloat(bbox[1])]);
                        lower = transformToMapProjection(Radio.request("Map", "getMap"), "WGS84", [parseFloat(bbox[2]), parseFloat(bbox[0])]);
                        center = [
                            lower[0],
                            lower[1],
                            upper[0],
                            upper[1]
                        ];
                    }
                    Radio.trigger("Searchbar", "pushHits", "hitList", {
                        name: display,
                        metaName: metaName,
                        type: "OpenStreetMap",
                        osm: true,
                        icon: "bi-signpost-2-fill",
                        id: Radio.request("Util", "uniqueId", "osmSuggest"),
                        marker: hit.class === "building",
                        coordinate: center
                    });
                }
            }
        });
        Radio.trigger("Searchbar", "createRecommendedList", "osm");
    },

    /**
     * Determines whether the result contains all entered parameters.
     * @param  {object[]} searched - The search result to be examined.
     * @param  {array[]} params - The split result.
     * @returns {boolean} true | false
     */
    isSearched: function (searched, params) {
        const hits = [],
            address = searched?.address || {};

        if (this.canShowHit(searched)) {
            params.forEach(param => {
                if ((address?.house_number && address.house_number !== null && address.house_number.toLowerCase() === param.toLowerCase()) ||
                    (address?.road && address.road !== null && address.road.toLowerCase().indexOf(param.toLowerCase()) > -1) ||
                    (address?.pedestrian && address.pedestrian !== null && address.pedestrian.toLowerCase().indexOf(param.toLowerCase()) > -1) ||
                    (address?.county && address.county !== null && address.county.toLowerCase().indexOf(param.toLowerCase()) > -1) ||
                    (address?.city && address.city !== null && address.city.toLowerCase().indexOf(param.toLowerCase()) > -1) ||
                    (address?.city_district && address.city_district !== null && address.city_district.toLowerCase().indexOf(param.toLowerCase()) > -1) ||
                    (address?.town && address.town !== null && address.town.toLowerCase().indexOf(param.toLowerCase()) > -1) ||
                    (address?.village && address.village !== null && address.village.toLowerCase().indexOf(param.toLowerCase()) > -1) ||
                    (address?.suburb && address.suburb !== null && address.suburb.toLowerCase().indexOf(param.toLowerCase()) > -1)
                ) {
                    hits.push(param);
                }
            });
        }

        return params.length === hits.length;
    },

    /**
     * Determines whether the hit is displayed by the parameters or not.
     * @param  {Object} hit - search hits
     * @returns {boolean} true | false
     */
    canShowHit: function (hit) {
        const classesToShow = this.get("classes").split(",");
        let result = false;

        if (classesToShow.length === 0) {
            return true;
        }

        classesToShow.forEach(classToShow => {
            if (hit?.class === classToShow || hit?.extratags && hit.extratags[classToShow] !== undefined) {
                result = true;
            }
        });

        return result;
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
     * @param  {String} url - todo
     * @param  {JSON} data - todo
     * @param  {function} successFunction - todo
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
                Radio.trigger("Searchbar", "abortSearch", "osm");
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

        Radio.trigger("Alert", "alert", i18next.t("common:modules.searchbar.osm.errorMsg") + " " + detail);
    },

    /**
     * todo
     * @returns {void}
     */
    polishAjax: function () {
        this.setAjaxRequest(null);
    },

    /**
     * Setter for inUse.
     * @param {*} value - todo
     * @returns {void}
     */
    setInUse: function (value) {
        this.set("inUse", value);
    },

    /**
     * Setter for osmServiceUrl.
     * @param {*} value - todo
     * @returns {void}
     */
    setOsmServiceUrl: function (value) {
        this.set("osmServiceUrl", value);
    },

    /**
     * Setter for searchParams.
     * @param {*} value - todo
     * @returns {void}
     */
    setSearchParams: function (value) {
        this.set("searchParams", value);
    },

    /**
     * Setter for ajaxRequest.
     * @param {*} value - todo
     * @returns {void}
     */
    setAjaxRequest: function (value) {
        this.set("ajaxRequest", value);
    }
});

export default OsmModel;
