import "../model";
import {transformFromMapProjection as mpapiTransformToMapProjection, getProjection as mpapiGetProjection} from "@masterportal/masterportalapi/src/crs";
import getProxyUrl from "../../../src/utils/getProxyUrl";
import store from "../../../src/app-store";

const LocationFinderModel = Backbone.Model.extend(/** @lends LocationFinderModel.prototype */{
    defaults: {
        incrementalSearch: true,
        serviceUrl: undefined,
        classes: [],
        ajaxRequest: null,
        useProxy: false
    },

    /**
     * @class MapView
     * @description Initialize search via LocationFinder
     * @extends Backbone.Model
     * @memberOf Searchbar.LocationFinder
     * @constructs
     * @property {boolean} incrementalSearch=true - Enable/disable incremental search (autocomplete)
     * @property {string} serviceUrl - URL of LocationFinder-Service
     * @property {Object} classes=[] - Filter results of LocationFinder to listed classes.
     * @property {*} ajaxRequest=null - Object for controlling ajax request
     * @property {Boolean} useProxy=false Attribute to request the URL via a reverse proxy.
     * @param {Object} config - The configuration object of the LocationFinder search
     * @param {number} [config.incrementalSearch=true] - Enable/disable incremental search (autocomplete)
     * @param {number} config.serviceId - ID of rest service
     * @param {number} [config.classes] - Filter results of LocationFinder to listed classes.
     * @param {number} [config.useProxy=false] - Use proxy
     * @listens Searchbar#RadioTriggerSearchbarSearchAll
     * @fires RestReader#RadioRequestRestReaderGetServiceById
     * @fires Core#RadioRequestParametricURLGetInitString
     * @fires Core#RadioRequestUtilGetProxyURL
     * @fires Alerting#RadioTriggerAlertAlert
     * @fires Searchbar#RadioTriggerSearchbarRemoveHits
     * @fires Searchbar#RadioTriggerSearchbarAbortSearch
     * @fires Searchbar#RadioTriggerSearchbarPushHits
     * @fires Searchbar#RadioTriggerSearchbarCreateRecommendedList
     * @returns {void}
     */
    initialize: function (config) {

        const service = Radio.request("RestReader", "getServiceById", config.serviceId);

        if (typeof service === "object" && typeof service.get("url") === "string") {

            const activators = {
                "searchAll": this.search
            };

            /**
             * @deprecated in the next major-release!
             * useProxy
             * getProxyUrl()
             */
            if (this.get("useProxy")) {
                this.setServiceUrl(getProxyUrl(service.get("url")));
            }
            else {
                this.setServiceUrl(service.get("url"));
            }

            if (store.state.urlParams && store.state.urlParams["Search/query"]) {
                this.search(store.state.urlParams && store.state.urlParams["Search/query"]);
            }

            if (this.get("incrementalSearch")) {
                activators.search = this.search;
            }
            this.listenTo(Radio.channel("Searchbar"), activators);
        }
        else {
            this.showError({
                msg: i18next.t("common:modules.searchbar.locationFinder.invalidServicID")
            });
        }
    },

    /**
     * Clear hit list from previous search and prepare new search.
     * @param {string} searchString - Pattern
     * @fires Searchbar#RadioTriggerSearchbarRemoveHits
     * @returns {void}
     */
    search: function (searchString) {

        Radio.trigger("Searchbar", "removeHits", "hitList", {type: "locationFinder"});

        const url = this.get("serviceUrl") + "/Lookup",
            payload = {
                query: searchString
            };

        // Filter results by classes
        if (Array.isArray(this.get("classes")) && this.get("classes").length > 0) {
            payload.filter = "type:" + this.get("classes").map(item => item.name).join(",");
        }

        // Set target CRS
        if (this.get("spatialReference")) {
            payload.sref = this.get("spatialReference");
        }
        else {
            payload.sref = Radio.request("MapView", "getProjection").getCode();
        }

        this.sendRequest(url, payload);
    },

    /**
     * Call MasterportalAPI for transforming coordinates to map crs. introduced to make class testable.
     * @param {Object} map - The map object
     * @param {String} fromCRS - CRS of coordinates
     * @param {Array} coordinate - coordinates
     * @return {Array} transformed coordinate
     */
    transformToMapProjection: function (map, fromCRS, coordinate) {
        return mpapiTransformToMapProjection(map, fromCRS, coordinate);
    },

    /**
     * Call MasterportalAPI for checking if crs is known. Introduced to make class testable.
     * @param {String} crs - epsg-code for crs
     * @return {Boolean} true if CRS is known
     */
    getProjection: function (crs) {
        return mpapiGetProjection(crs);
    },

    /**
     * Evaluate hits of the search; create offer list.
     * @param  {Array} data - Response of service
     * @fires Searchbar#RadioTriggerSearchbarPushHits
     * @fires Searchbar#RadioTriggerSearchbarCreateRecommendedList
     * @fires Searchbar#RadioTriggerSearchbarAbortSearch
     * @returns {void}
     */
    pushSuggestions: function (data) {

        const crs = "EPSG:" + data.sref;

        // Test for sucess-status of service
        if (!data?.ok) {
            let statusText = i18next.t("common:modules.searchbar.locationFinder.serverError");

            if (data.info) {
                statusText = statusText + ": " + data.info;
            }
            this.showError({
                statusText: statusText
            });
            Radio.trigger("Searchbar", "abortSearch", "locationFinder");
            return;
        }

        // Test for valid/usable crs
        if (!this.getProjection(crs)) {
            this.showError({
                statusText: i18next.t("common:modules.searchbar.locationFinder.unknownProjection") + " (" + crs + ")"
            });
            Radio.trigger("Searchbar", "abortSearch", "locationFinder");
            return;
        }

        if (Array.isArray(data.locs)) {
            data.locs.forEach(locationFinderResult => {

                const hit = {
                    name: locationFinderResult.name,
                    id: "locationFinder_" + locationFinderResult.id,
                    locationFinder: true,
                    type: locationFinderResult.type
                };

                if (Array.isArray(this.get("classes")) && this.get("classes").length > 0) {
                    // Apply configured properties for the results class.
                    const classDefinition = this.get("classes").find(item => item.name === locationFinderResult.type);

                    if (!classDefinition) {
                        // Skip unknown class
                        return;
                    }

                    if (typeof classDefinition.icon === "string") {
                        hit.icon = classDefinition.icon;
                    }
                    else {
                        hit.icon = "bi-signpost-2-fill";
                    }

                    if (classDefinition.zoomLevel) {
                        hit.zoomLevel = classDefinition.zoomLevel;
                    }

                    if (classDefinition.zoom === "bbox") {
                        const min = this.transformToMapProjection(Radio.request("Map", "getMap"), crs, [parseFloat(locationFinderResult.xmin), parseFloat(locationFinderResult.ymin)]),
                            max = this.transformToMapProjection(Radio.request("Map", "getMap"), crs, [parseFloat(locationFinderResult.xmax), parseFloat(locationFinderResult.ymax)]);

                        hit.coordinate = [
                            min[0], min[1], max[0], min[1], max[0], max[1], min[0], max[1], min[0], min[1]
                        ];
                    }
                    else {
                        hit.coordinate = this.transformToMapProjection(Radio.request("Map", "getMap"), crs, [parseFloat(locationFinderResult.cx), parseFloat(locationFinderResult.cy)]);
                    }
                }
                else {
                    hit.icon = "bi-signpost-2-fill";
                    hit.coordinate = this.transformToMapProjection(Radio.request("Map", "getMap"), crs, [parseFloat(locationFinderResult.cx), parseFloat(locationFinderResult.cy)]);
                }

                Radio.trigger("Searchbar", "pushHits", "hitList", hit);
            });
        }

        Radio.trigger("Searchbar", "createRecommendedList", "locationFinder");
    },

    /**
     * Start request after aborting pending request (if neccessary).
     * @param {String} url - URL the request is sent to.
     * @param {String} data - Data to be sent to the server
     * @returns {void}
     */
    sendRequest: function (url, data) {
        const ajax = this.get("ajaxRequest");

        if (ajax) {
            ajax.abort();
            this.polishAjax();
        }
        this.ajaxSend(url, data);
    },

    /**
     * Fires an HTTP GET request and saves its id.
     * @param  {String} url - url of service
     * @param  {JSON} data - payload
     * @fires Searchbar#RadioTriggerAbortSearch
     * @return {void}
     */
    ajaxSend: function (url, data) {
        this.setAjaxRequest($.ajax({
            url: url,
            data: data,
            dataType: "json",
            context: this,
            type: "GET",
            success: this.pushSuggestions,
            timeout: 6000,
            error: function (err) {
                if (err.status !== 0) { // No alert for aborted requests
                    if (err.status === 404) {
                        err.statusText = i18next.t("common:modules.searchbar.locationFinder.notFound");
                    }
                    this.showError(err);
                }
                Radio.trigger("Searchbar", "abortSearch", "locationFinder");
            },
            complete: function () {
                this.polishAjax();
            }
        }));
    },

    /**
     * Triggers the display of an error message.
     * @param {object} err - Error object from Ajax request.
     * @fires Alerting#RadioTriggerAlertAlert
     * @returns {void}
     */
    showError: function (err) {

        let msg = err.msg && err.msg !== "" ? err.msg : i18next.t("common:modules.searchbar.locationFinder.errorMsg");

        if (err.statusText && err.statusText !== "") {
            msg += ": " + err.statusText;
        }

        Radio.trigger("Alert", "alert", msg);
    },

    /**
     * Clean ajax request
     * @returns {void}
     */
    polishAjax: function () {
        this.setAjaxRequest(null);
    },

    /**
     * Setter for serviceUrl
     * @param {String} value - url of LocationFinder-service
     * @returns {void}
     */
    setServiceUrl: function (value) {
        this.set("serviceUrl", value);
    },

    /**
     * Setter for ajaxRequest.
     * @param {Object} value - ajax request object
     * @returns {void}
     */
    setAjaxRequest: function (value) {
        this.set("ajaxRequest", value);
    }
});

export default LocationFinderModel;
