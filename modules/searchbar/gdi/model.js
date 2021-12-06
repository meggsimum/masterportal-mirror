import "../model";
import {initializeSearch} from "../../../src/api/elasticsearch";

const GdiModel = Backbone.Model.extend(/** @lends GdiModel.prototype */{
    defaults: {
        minChars: 3,
        serviceId: "",
        queryObject: {},
        sortByName: false
    },
    /**
     * @class GdiModel
     * @extends Backbone.Model
     * @memberof Searchbar.Gdi
     * @constructs
     * @property {Number} minChars=3 Minimum length of search string to start.
     * @property {String} serviceId="" Id of restService to derive url from.
     * @property {Object} queryObject={} Payload used to append to url.
     * @property {Boolean} sortByName=false Parameter to config if the searching result alphanumerically
     * @fires Core#RadioRequestParametricURLGetInitString
     * @fires Searchbar#RadioTriggerSearchbarPushHits
     * @fires Searchbar#RadioTriggerSearchbarRemoveHits
     * @fires Searchbar#RadioTriggerSearchbarCreateRecommendedList
     * @listens Searchbar#RadioTriggerSearchbarSearch
     */
    initialize: function () {
        const url = this.deriveUrlFromServiceIdAndAppendParameter(this.get("serviceId"));

        this.listenTo(Radio.channel("Searchbar"), {
            "search": this.search
        });
        console.warn("GDI-Search is deprecated in version 3.0.0. Please use the elasticSearch!");
        this.setUrl(url);
    },

    /**
     * Derives the url from the serviceId and appends url parameters.
     * @param {String} serviceId Service Id.
     * @returns {String} - url with appended parameters.
     */
    deriveUrlFromServiceIdAndAppendParameter: function (serviceId) {
        const restService = Radio.request("RestReader", "getServiceById", serviceId);
        let url;

        if (restService) {
            url = restService.get("url");
            url = url + "?source_content_type=application/json&source=";
        }

        return url;
    },

    /**
     * Checks if the minChars criterium is passed, then sends the request to the elastic search index.
     * @param {String} searchString The search string.
     * @returns {void}
     */
    search: async function (searchString) {
        const payload = this.appendSearchStringToPayload(this.get("queryObject"), "query_string", searchString),
            requestConfig = {
                url: this.get("url"),
                type: "GET",
                useProxy: false,
                async: false,
                payload: payload,
                responseEntryPath: "hits.hits"
            };
        let result;

        if (searchString.length >= this.get("minChars")) {
            result = await initializeSearch(requestConfig);
            this.createRecommendedList(result.hits);
        }
    },

    /**
     * Creates the recommended List
     * @param {Object[]} responseData Response data.
     * @fires Searchbar#RadioTriggerSearchbarPushHits
     * @fires Searchbar#RadioTriggerSearchbarRemoveHits
     * @fires Searchbar#RadioTriggerSearchbarCreateRecommendedList
     * @returns {void}
     */
    createRecommendedList: function (responseData) {
        const triggerEvent = {
                channel: "Parser",
                event: "addGdiLayer"
            },
            hitMap = {
                name: "_source.name",
                id: "_source.id",
                source: "_source"
            },
            hitType = i18next.t("common:modules.searchbar.type.subject"),
            hitIcon = "bi-list-ul",
            hitList = this.get("sortByName") ? "hitList" : "originalOrderHitList";

        if (responseData.length > 0) {
            responseData.forEach(result => {
                const hit = this.createHit(result, hitMap, hitType, hitIcon, triggerEvent);

                Radio.trigger("Searchbar", "pushHits", hitList, hit);
            });
        }
        else {
            Radio.trigger("Searchbar", "removeHits", hitList, {type: hitType});
        }
        Radio.trigger("Searchbar", "createRecommendedList", "gdi");
    },

    /**
     * Creates hit that is sent to the hitList.
     * @param {Object} result Result object from elastcisearch request.
     * @param {Object} hitMap Mapping object. Used to map results attributes to neccessary hit attributes.
     * @param {String} hitType Type of hit.
     * @param {String} hitIcon Icon class to show in reccomendedList
     * @param {Object} triggerEvent Object defining channel and event. used to fire event on mouseover and click in recommendedList.
     * @returns {Object} - hit.
     */
    createHit: function (result, hitMap, hitType, hitIcon, triggerEvent) {
        let hit = {};

        Object.keys(hitMap).forEach(key => {
            hit[key] = this.findAttributeByPath(result, hitMap[key]);
        });
        hit.type = hitType;
        hit.icon = hitIcon;
        if (Object.keys(triggerEvent).length > 0) {
            hit = Object.assign(hit, {triggerEvent: triggerEvent});
        }
        return hit;
    },

    /**
     * Returns the attribute value of the given object by path.
     * If path is an array, the function recursively iterates over the object for each part and pushes the value in an array.
     * Otherwise only the value of the given attribute path will be returned.
     * @param {Object} object Object to derive value from.
     * @param {String|String[]} path Path of the attribute. "." in the path indicates the next deeper level.
     * @returns {*} - Value that is at position of given path.
     */
    findAttributeByPath: function (object, path) {
        let attribute = object,
            paths;

        if (Array.isArray(path)) {
            attribute = [];
            path.forEach(pathPart => {
                attribute.push(this.findAttributeByPath(object, pathPart));
            });
        }
        else {
            paths = path.split(".");
            paths.forEach(pathPart => {
                attribute = attribute[pathPart];
            });
        }
        return attribute;
    },

    /**
     * Recursively searches for the searchStringAttribute key and sets the searchString.
     * Adds the search string to the payload using the given key
     * @param {Object} payload Payload as Object
     * @param {String} searchStringAttribute Attribute key to be added to the payload object.
     * @param {String} searchString Search string to be added using the searchStringAttribute.
     * @returns {Object} - the payload with the search string.
     */
    appendSearchStringToPayload: function (payload, searchStringAttribute, searchString) {
        Object.keys(payload).forEach(key => {
            if (typeof payload[key] === "object") {
                payload[key] = this.appendSearchStringToPayload(payload[key], searchStringAttribute, searchString);
            }
            if (key === searchStringAttribute) {
                payload[searchStringAttribute] = searchString;
            }
        });

        return payload;
    },

    /**
     * Setter for Attribute "url".
     * @param {String} value Url.
     * @returns {void}
     */
    setUrl: function (value) {
        this.set("url", value);
    }
});

export default GdiModel;
