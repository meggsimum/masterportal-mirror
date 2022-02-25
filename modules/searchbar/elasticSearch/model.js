
import {initializeSearch} from "../../../src/api/elasticsearch";
import store from "../../../src/app-store";

const ElasticSearchModel = Backbone.Model.extend(/** @lends ElasticSearchModel.prototype */{
    defaults: {
        minChars: 3,
        serviceId: "11",
        url: "",
        payload: {},
        searchStringAttribute: "searchString",
        type: "POST",
        responseEntryPath: "",
        triggerEvent: {},
        hitMap: {
            name: "name",
            id: "id",
            coordinate: "coordinate"
        },
        hitType: "common:modules.searchbar.type.subject",
        hitGlyphicon: "glyphicon-road",
        async: false,
        useProxy: false
    },
    /**
     * @class ElasticSearchModel
     * @extends Backbone.Model
     * @memberof Searchbar.ElasticSearch
     * @constructs
     * @property {Number} minChars=3 Minimum length of search string to start.
     * @property {String} serviceId="11" Id of restService to derive url from.
     * @property {String} url="" Url derived from restService.
     * @property {Object} payload={} Payload used to POST to url.
     * @property {String} searchStringAttribute="searchString" The Search string is added to the payload object with this key.
     * @property {String} type="POST" The type of the request. "POST" or "GET".
     * @property {String} responseEntryPath="" The path of the hits in the response JSON. The different levels of the response JSON are marked with "."
     * @property {Object} triggerEvent = {} An object defining the channel and event to be posted by clicking on the search result.
     * @property {String} triggerEvent.channel = "" Channel of radio event.
     * @property {String} triggerEvent.event = "" Event of radio event.
     * @property {Object} hitMap = {name: "", id: "id", coordinate: "coordinate"} Mapping object of the response hit to fit the structure of the searchbars hits.
     * @property {String} hitType = "Elastic" Type of the hit to be appended in the recommended list.
     * @property {String} hitGlyphicon = "glyphicon-road" Css class of the glyphicon to be prepended in the recommended list.
     * @property {Boolean} async = false Flag if request should be asynchronous.
     * @property {Boolean} useProxy = false Flag if request should be proxied.
     * @fires Core#RadioRequestParametricURLGetInitString
     * @fires Searchbar#RadioTriggerSearchbarPushHits
     * @fires Searchbar#RadioTriggerSearchbarRemoveHits
     * @fires Searchbar#RadioTriggerSearchbarCreateRecommendedList
     * @listens Searchbar#RadioTriggerSearchbarSearch
     */
    initialize: function () {
        const initSearchString = store.state.urlParams && store.state.urlParams["Search/query"];

        this.listenTo(Radio.channel("Searchbar"), {
            "search": this.search
        });
        if (initSearchString) {
            this.search(initSearchString);
        }
    },

    /**
     * Checks if the minChars criterium is passed, then sends the request to the elastic search index.
     * @param {String} searchString The search string.
     * @returns {void}
     */
    search: async function (searchString) {
        const searchStringAttribute = this.get("searchStringAttribute"),
            payload = this.appendSearchStringToPayload(this.get("payload"), searchStringAttribute, searchString),
            requestConfig = {
                serviceId: this.get("serviceId"),
                /**
                * @deprecated in the next major-release!
                * useProxy
                */
                useProxy: this.get("useProxy"),
                type: this.get("type"),
                payload: payload,
                responseEntryPath: this.get("responseEntryPath")
            };
        let result;

        if (searchString.length >= this.get("minChars")) {
            result = await initializeSearch(requestConfig);
            this.createRecommendedList(result.hits);
        }
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
            else if (key === searchStringAttribute) {
                payload[searchStringAttribute] = searchString;
            }
        });

        return payload;
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
        const triggerEvent = this.get("triggerEvent"),
            hitMap = this.get("hitMap"),
            hitType = i18next.t(this.get("hitType")),
            hitGlyphicon = this.get("hitGlyphicon");

        if (responseData.length > 0) {
            responseData.forEach(result => {
                const hit = this.createHit(result, hitMap, hitType, hitGlyphicon, triggerEvent);

                Radio.trigger("Searchbar", "pushHits", "hitList", hit);
            });
            Radio.trigger("Searchbar", "createRecommendedList", "elasticSearch");
        }
        else {
            Radio.trigger("Searchbar", "removeHits", "hitList", {type: hitType});
        }
    },

    /**
     * Creates hit that is sent to the hitList.
     * @param {Object} result Result object from elastcisearch request.
     * @param {Object} hitMap Mapping object. Used to map results attributes to neccessary hit attributes.
     * @param {String} hitType Type of hit.
     * @param {String} hitGlyphicon Glyphicon class to show in reccomendedList
     * @param {Object} triggerEvent Object defining channel and event. used to fire event on mouseover and click in recommendedList.
     * @returns {Object} - hit.
     */
    createHit: function (result, hitMap, hitType, hitGlyphicon, triggerEvent) {
        let hit = {};

        hit.type = hitType;
        hit.glyphicon = hitGlyphicon;

        Object.keys(hitMap).forEach(key => {
            hit[key] = this.findAttributeByPath(result, hitMap[key]);
        });
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
    }
});

export default ElasticSearchModel;
