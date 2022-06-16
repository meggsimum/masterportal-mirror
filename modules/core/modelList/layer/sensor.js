import Layer from "./model";
import {SensorThingsMqtt} from "../../../../src/utils/sensorThingsMqtt.js";
import {SensorThingsHttp} from "../../../../src/utils/sensorThingsHttp.js";
import moment from "moment";
import "moment-timezone";
import {Cluster, Vector as VectorSource} from "ol/source.js";
import VectorLayer from "ol/layer/Vector.js";
import {buffer, containsExtent} from "ol/extent";
import {GeoJSON} from "ol/format.js";
import changeTimeZone from "../../../../src/utils/changeTimeZone.js";
import isObject from "../../../../src/utils/isObject.js";
import getProxyUrl from "../../../../src/utils/getProxyUrl";
import store from "../../../../src/app-store";
import {
    resetVectorLayerFeatures,
    changeFeatureGFI,
    getStyleModelById
} from "../../../../src/core/layers/RadioBridge.js";

const SensorLayer = Layer.extend(/** @lends SensorLayer.prototype */{
    defaults: Object.assign({}, Layer.prototype.defaults, {
        supported: ["2D", "3D"],
        epsg: "EPSG:4326",
        utc: "+1",
        /**
         * Timezone to use with moment-timezone.
         * @type {string}
         * @enum webpack.MomentTimezoneDataPlugin.matchZones
         */
        timezone: "Europe/Berlin",
        version: "1.1",
        subscriptionTopics: {},
        httpSubFolder: "",
        showNoDataValue: true,
        noDataValue: "no data",
        altitudeMode: "clampToGround",
        isSubscribed: false,
        moveendListener: null,
        mqttOptions: {},
        loadThingsOnlyInCurrentExtent: false,
        useProxy: false,
        mqttRh: 2,
        mqttQos: 2,
        datastreamAttributes: [
            "@iot.id",
            "@iot.selfLink",
            "Observations",
            "description",
            "name",
            "observationType",
            "observedArea",
            "phenomenonTime",
            "properties",
            "resultTime",
            "unitOfMeasurement"
        ],
        thingAttributes: [
            "@iot.id",
            "@iot.selfLink",
            "Locations",
            "description",
            "name",
            "properties"
        ]
    }),

    /**
     * @class SensorLayer
     * @extends Layer
     * @memberof Core.ModelList.Layer
     * @constructs
     * @property {String} url the url to initially call the SensorThings-API with
     * @property {String} epsg="EPSG:4326" EPSG-Code for incoming sensor geometries.
     * @property {String} utc="+1" UTC-Timezone to calculate correct time.
     * @property {String} timezone="Europe/Berlin" Sensors origin timezone name.
     * @property {String} version="1.0" The version the SensorThingsAPI is requested.
     * @property {Boolean} useProxy=false Attribute to request the URL via a reverse proxy.
     * @fires Core#RadioRequestMapViewGetOptions
     * @fires Core#RadioRequestUtilGetProxyURL
     * @fires Core#RadioTriggerUtilShowLoader
     * @fires Core#RadioTriggerUtilHideLoader
     * @fires Alerting#RadioTriggerAlertAlert
     * @fires VectorStyle#RadioRequestStyleListReturnModelById
     * @fires GFI#RadioTriggerGFIChangeFeature
     * @fires Core#RadioRequestMapViewGetCurrentExtent
     * @listens Layer#RadioRequestVectorLayerGetFeatures
     * @description This layer type requests its data from the SensorThings-API (STA).
     * The layer reacts to changes of the own features triggered by the STA.
     * The technology used therefore is WebSocketSecure (wss) and the MessageQueuingTelemetryTransport(MQTT)-Protocol.
     * This makes it possible to update vector data in the application without reloading the entire page.
     * The newest observation data of each attribute is set as follows:
     * name = If "datastream.properties.type" is not undefined, take this. Otherwise take the value in "datastream.unitOfMeasurment.name"
     * The attribute key is "dataStream_[dataStreamId]_[name]".
     * All available dataStreams, their ids, their latest observation and value are separately aggregated and stored (separated by " | ") in the following attributes:
     * dataStreamId, dataStreamName, dataStreamValue, dataStreamPhenomenonTime
     * The "name" and the "description" of each thing are also taken as "properties".
     */
    initialize: function () {
        /**
         * @deprecated in the next major-release!
         * useProxy
         * getProxyUrl()
         */
        const url = this.get("useProxy") ? getProxyUrl(this.get("url")) : this.get("url");

        this.setSubscriptionTopics({});
        this.setHttpSubFolder(url && String(url).split("/").length > 3 ? "/" + String(url).split("/").slice(3).join("/") : "");

        try {
            this.createMqttConnectionToSensorThings(url, this.get("mqttOptions"), this.get("timezone"), this.get("showNoDataValue"), this.get("noDataValue"));
        }
        catch (err) {
            console.error("Connecting to mqtt-broker failed. Won't receive live updates. Reason:", err);
        }

        if (!this.get("isChildLayer")) {
            Layer.prototype.initialize.apply(this);
        }

        moment.locale("de");
    },

    /**
     * Starts or stops subscription according to its conditions.
     * Because of usage of several listeners it's necessary to create a "isSubscribed" flag to prevent multiple executions.
     * @returns {void}
     */
    toggleSubscriptionsOnMapChanges: function () {
        const state = this.getLayerState(this.get("isOutOfRange"), this.get("isSelected"), this.get("isSubscribed"));

        if (state === true) {
            this.createLegend();
            this.startsSubscription(this.get("layer").getSource().getFeatures());
        }
        else if (state === false) {
            this.stopsSubscription();
        }
    },

    /**
     * Starts subscription
     * @param {ol/Feature[]} features all features of the Layer
     * @returns {void}
     */
    startsSubscription: function (features) {
        this.setIsSubscribed(true);
        if (!this.get("loadThingsOnlyInCurrentExtent") && Array.isArray(features) && !features.length) {
            this.initializeConnection(function () {
                this.updateSubscription();
                this.setMoveendListener(store.dispatch("Maps/registerListener", {event: "moveend", callback: this.updateSubscription.bind(this)}));
            }.bind(this));
        }
        else {
            this.updateSubscription();
            this.setMoveendListener(store.dispatch("Maps/registerListener", {event: "moveend", callback: this.updateSubscription.bind(this)}));
        }
    },

    /**
     * Stops subscription
     * @returns {void}
     */
    stopsSubscription () {
        const datastreamIds = this.getDatastreamIdsInCurrentExtent(this.get("layer").getSource().getFeatures(), store.getters["Maps/getCurrentExtent"]),
            subscriptionTopics = this.get("subscriptionTopics"),
            version = this.get("version"),
            isSelected = this.get("isSelected"),
            client = this.get("mqttClient");

        this.setIsSubscribed(false);
        store.dispatch("Maps/unregisterListener", {event: "moveend", callback: this.updateSubscription.bind(this)});
        this.setMoveendListener(null);
        this.unsubscribeFromSensorThings(datastreamIds, subscriptionTopics, version, isSelected, client);
    },

    /**
     * Returns the state of the layer based on out of range value, isSelected and isSubscribed.
     * @param {Boolean} isOutOfRange The flag if map Scale is out of defined layer minScale and maxScale.
     * @param {Boolean} isSelected The flag if value model is selected or not.
     * @param {Boolean} isSubscribed The flag to prevent multiple executions.
     * @returns {Boolean} true if layer should be subscribed, false if not
     */
    getLayerState: function (isOutOfRange, isSelected, isSubscribed) {
        if (!isOutOfRange && isSelected && !isSubscribed) {
            return true;
        }
        else if ((isOutOfRange || !isSelected) && isSubscribed) {
            return false;
        }
        return undefined;
    },

    /**
     * Creates the vectorSource.
     * @returns {void}
     */
    createLayerSource: function () {
        this.setLayerSource(new VectorSource());
        if (this.has("clusterDistance")) {
            this.createClusterLayerSource(this.get("layerSource"), this.get("clusterDistance"));
        }
    },

    /**
     * Creates the layer.
     * @listens Core#RadioTriggerMapViewChangedCenter
     * @returns {void}
     */
    createLayer: function () {
        this.setLayer(new VectorLayer({
            source: this.has("clusterDistance") ? this.get("clusterLayerSource") : this.get("layerSource"),
            name: this.get("name"),
            typ: this.get("typ"),
            gfiAttributes: this.get("gfiAttributes"),
            gfiTheme: this.get("gfiTheme"),
            id: this.get("id"),
            altitudeMode: this.get("altitudeMode")
        }));
        this.listenTo(this, {
            "change:isVisibleInMap": this.toggleSubscriptionsOnMapChanges,
            "change:isOutOfRange": this.toggleSubscriptionsOnMapChanges
        });
        this.createLegend();
    },

    /**
     * Creates ClusterLayerSource.
     * @param {ol/source/Source} layerSource the source of the layer
     * @param {Number} clusterDistance the distance where clustering should occur
     * @returns {void}
     */
    createClusterLayerSource: function (layerSource, clusterDistance) {
        this.setClusterLayerSource(new Cluster({
            source: layerSource,
            distance: clusterDistance
        }));
    },

    /**
     * Initial loading of sensor data
     * @param {Function} onsuccess a function to call on success
     * @fires Core#RadioRequestUtilGetProxyURL
     * @returns {void}
     */
    initializeConnection: function (onsuccess) {
        /**
         * @deprecated in the next major-release!
         * useProxy
         * getProxyUrl()
         */
        const url = this.get("useProxy") ? getProxyUrl(this.get("url")) : this.get("url"),
            version = this.get("version"),
            urlParams = this.get("urlParameter"),
            currentExtent = {
                extent: store.getters["Maps/getCurrentExtent"],
                sourceProjection: mapCollection.getMapView("2D").getProjection().getCode(),
                targetProjection: this.get("epsg")
            },
            intersect = typeof this.get("intersect") === "boolean" ? this.get("intersect") : true,
            mapProjection = mapCollection.getMapView("2D").getProjection(),
            epsg = this.get("epsg"),
            gfiTheme = this.get("gfiTheme"),
            utc = this.get("utc"),
            isClustered = this.has("clusterDistance");

        this.callSensorThingsAPI(url, version, urlParams, currentExtent, intersect, sensorData => {
            const features = this.createFeaturesFromSensorData(sensorData, mapProjection, epsg, gfiTheme, utc);

            this.clearLayerSource();
            if (Array.isArray(features) && features.length) {
                this.get("layerSource").addFeatures(features);
                this.prepareFeaturesFor3D(features);
                resetVectorLayerFeatures(this.get("id"), features);
            }

            if (features !== undefined) {
                this.styling(isClustered);
                this.get("layer").setStyle(this.get("style"));
            }

            features.forEach(feature => changeFeatureGFI(feature));

            if (typeof onsuccess === "function") {
                onsuccess();
            }
        }, error => {
            store.dispatch("Alerting/addSingleAlert", i18next.t("modules.core.modelList.layer.sensor.httpOnError", {name: this.get("name")}));
            console.warn(error);
        });
    },

    /**
     * Creates features from given sensor data
     * @param {Object[]} sensorData sensor with location and properties
     * @param {ol/proj/Projection} mapProjection projection of the map
     * @param {String} epsg the epsg of sensortype
     * @param {String|Object} gfiTheme The name of the gfiTheme or an object of gfiTheme
     * @param {String} utc="+1" UTC-Timezone to calculate correct time.
     * @returns {ol/Feature[]} feature to draw
     */
    createFeaturesFromSensorData: function (sensorData, mapProjection, epsg, gfiTheme, utc) {
        if (!Array.isArray(sensorData) || typeof epsg === "undefined") {
            return [];
        }
        const features = [];

        sensorData.forEach((data, index) => {
            if (!data?.location) {
                return;
            }
            let feature = this.createFeatureByLocation(
                data.location,
                mapProjection,
                epsg,
                error => {
                    console.warn(error);
                }
            );

            feature.setId(index);
            feature.setProperties(data.properties, true);

            if (isObject(gfiTheme)) {
                feature.set("gfiParams", gfiTheme?.params, true);
            }
            feature.set("utc", utc, true);
            feature = this.aggregateDataStreamValue(feature);
            feature = this.aggregateDataStreamPhenomenonTime(feature);
            features.push(feature);
        });

        return features.filter(subFeature => typeof subFeature.getGeometry() !== "undefined");
    },

    /**
     * Aggregates the value and adds them as property "dataStreamValues".
     * @param {ol/Feature} feature The ol feature.
     * @returns {ol/Feature} The feature with new attribute "dataStreamValues".
     */
    aggregateDataStreamValue: function (feature) {
        const modifiedFeature = feature,
            dataStreamValues = [];

        if (feature && feature.get("dataStreamId")) {
            feature.get("dataStreamId").split(" | ").forEach((id, i) => {
                const dataStreamName = feature.get("dataStreamName").split(" | ")[i];

                if (this.get("showNoDataValue") && !feature.get("dataStream_" + id + "_" + dataStreamName) === "") {
                    dataStreamValues.push(this.get("noDataValue"));
                }
                else if (feature.get("dataStream_" + id + "_" + dataStreamName)) {
                    dataStreamValues.push(feature.get("dataStream_" + id + "_" + dataStreamName));
                }
            });
            if (dataStreamValues.length > 0) {
                modifiedFeature.set("dataStreamValue", dataStreamValues.join(" | "), true);
            }
        }
        return modifiedFeature;
    },

    /**
     * Aggregates the phenomenonTimes and adds them as property "dataStreamPhenomenonTime".
     * @param {ol/Feature} feature The ol feature.
     * @returns {ol/Feature} The feature with new attribute "dataStreamPhenomenonTime".
     */
    aggregateDataStreamPhenomenonTime: function (feature) {
        const modifiedFeature = feature,
            dataStreamPhenomenonTimes = [];

        if (feature && feature.get("dataStreamId")) {
            feature.get("dataStreamId").split(" | ").forEach((id, i) => {
                const dataStreamName = feature.get("dataStreamName").split(" | ")[i];

                if (this.get("showNoDataValue") && !feature.get("dataStream_" + id + "_" + dataStreamName + "_phenomenonTime")) {
                    dataStreamPhenomenonTimes.push(this.get("noDataValue"));
                }
                else if (feature.get("dataStream_" + id + "_" + dataStreamName + "_phenomenonTime")) {
                    dataStreamPhenomenonTimes.push(feature.get("dataStream_" + id + "_" + dataStreamName + "_phenomenonTime"));
                }
            });
            modifiedFeature.set("dataStreamPhenomenonTime", dataStreamPhenomenonTimes.join(" | "), true);
        }
        return modifiedFeature;
    },

    /**
     * Some sensors deliver a time interval like "2020-04-02T14:00:01.000Z/2020-04-02T14:15:00.000Z".
     * Other sensors deliver a single time like "2020-04-02T14:00:01.000Z".
     * This function returns the first time given in string. Delimiter is always "/".
     * @param {String} phenomenonTime The phenomenonTime given by sensor
     * @returns {String} The first phenomenonTime
     */
    getFirstPhenomenonTime (phenomenonTime) {
        if (typeof phenomenonTime !== "string") {
            return undefined;
        }
        else if (phenomenonTime.split("/").length !== 2) {
            return phenomenonTime;
        }

        return phenomenonTime.split("/")[0];
    },

    /**
     * Returns date and time in clients local format converting utc time to sensors origin timezone.
     * @param {String} phenomenonTime phenomenonTime given by sensor
     * @param {String} timezone name of the sensors origin timezone
     * @see https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
     * @see https://momentjs.com/timezone/docs/
     * @returns {String} A date string based on phenomenonTime and timezone in clients local format or an empty string if an unknown phenomenonTime is given.
     */
    getLocalTimeFormat: function (phenomenonTime, timezone) {
        const utcTime = this.getFirstPhenomenonTime(phenomenonTime);

        if (utcTime) {
            return moment(utcTime).tz(timezone).format("LLL");
        }
        return "";
    },

    /**
     * Calls the SensorThings-API via http.
     * @param {String} url The url to service
     * @param {String} version The version from service
     * @param {Object} urlParams The url parameters
     * @param {Object} currentExtent the extent coordinates
     * @param {Boolean} intersect true if it intersects, false if not
     * @param {Function} onsuccess a callback function (result) with the result to call on success and result: all things with attributes and location
     * @param {Function} onerror a callback function (err) to pass errors with
     * @returns {void}
     */
    callSensorThingsAPI: function (url, version, urlParams, currentExtent, intersect, onsuccess, onerror) {
        const requestUrl = this.buildSensorThingsUrl(url, version, urlParams),
            http = new SensorThingsHttp(),
            /**
             * a function to receive the response of a http call
             * @param {Object} result the response from the http request as array buffer
             * @returns {void}
             */
            httpOnSuccess = function (result) {
                if (typeof onsuccess === "function") {
                    onsuccess(this.getAllThings(result, urlParams, url, version));
                }
            }.bind(this);

        if (!this.get("loadThingsOnlyInCurrentExtent")) {
            http.get(requestUrl, httpOnSuccess, null, null, onerror);
        }
        else {
            http.getInExtent(requestUrl, currentExtent, intersect, httpOnSuccess, null, null, onerror);
        }
    },

    /**
     * Prepares and Returns all things
     * @param {Object[]} sensordata response of called sensorAPI
     * @param {Object} urlParams The url parameters
     * @param {String} url The url to service
     * @param {String} version The version from service
     * @returns {Object[]} all prepared things
     */
    getAllThings: function (sensordata, urlParams, url, version) {
        let allThings;

        if (urlParams?.root === "Datastreams") {
            allThings = this.changeSensordataRootToThings(sensordata, this.get("datastreamAttributes"), this.get("thingAttributes"));
            allThings = this.unifyThingsByIds(allThings);
        }
        else {
            allThings = this.flattenArray(sensordata);
        }

        allThings = this.createPropertiesOfDatastreams(allThings, this.get("showNoDataValue"), this.get("noDataValue"), this.get("utc"), this.get("timezone"));
        allThings = this.aggregatePropertiesOfThings(allThings, url, version);

        return allThings;
    },

    /**
     * Changes the root in the sensordata from datastream to thing.
     * @param {Object[]} sensordata the sensordata with datastream as root.
     * @param {String[]} datastreamAttributes The datastream attributes.
     * @param {String[]} thingAttributes The thing attributes.
     * @returns {Object[]} The sensordata with things as root.
     */
    changeSensordataRootToThings: function (sensordata, datastreamAttributes, thingAttributes) {
        if (!Array.isArray(sensordata)) {
            return [];
        }
        const result = [],
            datastreamAttributesAssociation = this.createAssociationObject(datastreamAttributes),
            thingAttributesAssociation = this.createAssociationObject(thingAttributes);

        sensordata.forEach(stream => {
            if (!isObject(stream?.Thing)) {
                return;
            }
            const datastreamNewAttributes = {},
                thing = {
                    Datastreams: [datastreamNewAttributes]
                };

            Object.keys(stream).forEach(key => {
                if (Object.prototype.hasOwnProperty.call(datastreamAttributesAssociation, key)) {
                    datastreamNewAttributes[key] = stream[key];
                }
            });
            Object.keys(stream.Thing).forEach(key => {
                if (Object.prototype.hasOwnProperty.call(thingAttributesAssociation, key)) {
                    thing[key] = stream.Thing[key];
                }
            });

            result.push(thing);
        });

        return result;
    },

    /**
     * Converts elements of an array to keys in an object with value to be true.
     * @param {String[]} array Array with value to convert to an object.
     * @returns {Object} The object with value of the given array as keys.
     */
    createAssociationObject: function (array) {
        if (!Array.isArray(array)) {
            return {};
        }
        const associationObject = {};

        array.forEach(key => {
            associationObject[key] = true;
        });

        return associationObject;
    },

    /**
     * Merge datastreams based on the id of the thing if the ids exist multiple times.
     * @param {Object[]} allThings The sensordata with things as root.
     * @returns {Object[]} The sensordata with merged things as root.
     */
    unifyThingsByIds: function (allThings) {
        if (!Array.isArray(allThings)) {
            return [];
        }
        const allThingsAssoc = {};

        allThings.forEach(thing => {
            if (!isObject(thing)) {
                return;
            }
            else if (!isObject(allThingsAssoc[thing["@iot.id"]])) {
                allThingsAssoc[thing["@iot.id"]] = thing;
                return;
            }
            allThingsAssoc[thing["@iot.id"]].Datastreams = allThingsAssoc[thing["@iot.id"]].Datastreams.concat(thing.Datastreams);
        });

        return Object.values(allThingsAssoc);
    },

    /**
     * Iterates over the dataStreams and creates the attributes for each datastream:
     * "dataStream_[dataStreamId]_[dataStreamName]" and
     * "dataStream_[dataStreamId]_[dataStreamName]_phenomenonTime".
     * @param {Object[]} dataStreams the dataStreams of the thing.
     * @param {Object} properties the properties of the thing.
     * @param {Boolean} showNoDataValue true if "nodata" value should be shown, false if not
     * @param {String} noDataValue the value to use for "nodata"
     * @param {String} utc utc="+1" UTC-Timezone to calculate correct time.
     * @param {String} timezone name of the sensors origin timezone.
     * @returns {Boolean} true on success, false if something went wrong.
     */
    createPropertiesOfDatastreamsHelper (dataStreams, properties, showNoDataValue, noDataValue, utc, timezone) {
        if (!Array.isArray(dataStreams) || !isObject(properties)) {
            return false;
        }

        dataStreams.forEach(dataStream => {
            if (!isObject(dataStream)) {
                return;
            }
            const dataStreamId = String(dataStream["@iot.id"]),
                dataStreamName = dataStream.name,
                dataStreamValue = Array.isArray(dataStream.Observations) ? dataStream.Observations[0]?.result : "",
                key = "dataStream_" + dataStreamId + "_" + dataStreamName;
            let phenomenonTime = Array.isArray(dataStream.Observations) ? dataStream.Observations[0]?.phenomenonTime : "";

            this.moveDatastreamPropertiesToThing(properties, dataStream.properties);
            phenomenonTime = changeTimeZone(phenomenonTime?.split("/")[0], utc);

            properties.dataStreamId.push(dataStreamId);
            properties.dataStreamName.push(dataStreamName);

            if (dataStreamValue !== "") {
                properties[key] = dataStreamValue;
                properties[key + "_phenomenonTime"] = this.getLocalTimeFormat(phenomenonTime, timezone);
                properties.dataStreamValue.push(dataStreamValue);
                properties.dataPhenomenonTime.push(phenomenonTime);
            }
            else if (showNoDataValue) {
                properties[key] = noDataValue;
                properties[key + "_phenomenonTime"] = noDataValue;
                properties.dataStreamValue.push(noDataValue);
            }
        });

        return true;
    },

    /**
     * Adds data from datastream to the thing with pipe separator.
     * @param {Object} thingProperties The properties from the thing.
     * @param {Object} dataStreamProperties The properties from the dataStream.
     * @returns {Boolean} returns true on success and false if anything went wrong.
     */
    moveDatastreamPropertiesToThing: function (thingProperties, dataStreamProperties) {
        if (!isObject(thingProperties) || !isObject(dataStreamProperties)) {
            return false;
        }
        Object.entries(dataStreamProperties).forEach(([key, value]) => {
            if (typeof thingProperties[key] !== "undefined") {
                thingProperties[key] = thingProperties[key] + " | " + value;
            }
            else {
                thingProperties[key] = value;
            }
        });

        return true;
    },

    /**
     * Iterates over things and creates attributes for each observed property.
     * @param {Object[]} allThings All things.
     * @param {Boolean} showNoDataValue true if "nodata" value should be shown, false if not
     * @param {String} noDataValue the value to use for "nodata"
     * @param {String} utc utc="+1" UTC-Timezone to calculate correct time.
     * @param {String} timezone name of the sensors origin timezone.
     * @returns {Object[]} All things with the newest observation for each dataStream.
     */
    createPropertiesOfDatastreams: function (allThings, showNoDataValue, noDataValue, utc, timezone) {
        if (!Array.isArray(allThings)) {
            return [];
        }

        allThings.forEach(thing => {
            if (!isObject(thing) || !Array.isArray(thing.Datastreams)) {
                return;
            }
            else if (!isObject(thing.properties)) {
                thing.properties = {};
            }

            thing.properties.dataStreamId = [];
            thing.properties.dataStreamName = [];
            thing.properties.dataStreamValue = [];
            thing.properties.dataPhenomenonTime = [];

            this.createPropertiesOfDatastreamsHelper(thing.Datastreams, thing.properties, showNoDataValue, noDataValue, utc, timezone);

            thing.properties.dataStreamId = thing.properties.dataStreamId.join(" | ");
            thing.properties.dataStreamValue = thing.properties.dataStreamValue.join(" | ");
            thing.properties.dataStreamName = thing.properties.dataStreamName.join(" | ");
            thing.properties.dataPhenomenonTime = thing.properties.dataPhenomenonTime.join(" | ");
        });

        return allThings;
    },

    /**
     * Builds the SensorThings url.
     * @param {String} url the url to the service
     * @param {String} version the version from the service
     * @param {Object} urlParams the url parameters
     * @returns {String} url to request the sensorThings with
     */
    buildSensorThingsUrl: function (url, version, urlParams) {
        const root = urlParams?.root || "Things",
            versionAsString = typeof version === "number" ? version.toFixed(1) : version;
        let query = "";

        if (isObject(urlParams)) {
            for (const key in urlParams) {
                if (key === "root") {
                    continue;
                }
                else if (query !== "") {
                    query += "&";
                }

                if (Array.isArray(urlParams[key])) {
                    if (urlParams[key].length) {
                        query += "$" + key + "=" + urlParams[key].join(",");
                    }
                }
                else {
                    query += "$" + key + "=" + urlParams[key];
                }
            }
        }

        return `${url}/v${versionAsString}/${root}?${query}`;
    },

    /**
     * Searches the thing for its geometry location.
     * For some reason there are two different object pathes to check.
     * @param {Object} thing the aggregated thing
     * @param {Number} index the index of the location in array Locations
     * @returns {Object} the geometry object or null if none was found
     */
    getThingsGeometry: function (thing, index) {
        const locations = thing?.Locations || thing?.Thing?.Locations,
            location = locations && Object.prototype.hasOwnProperty.call(locations, index) && locations[index]?.location ? locations[index].location : null;

        if (location?.geometry && location.geometry?.type) {
            return location.geometry;
        }
        else if (location?.type) {
            return location;
        }

        return null;
    },

    /**
     * Tries to parse object to ol/format/GeoJson
     * @param {Object} data the object to parse
     * @param {ol/proj/Projection} featureProjection projection of the map
     * @param {String} dataProjection projection of the thing
     * @param {Function} onerror a function(error) to be called on error
     * @returns {ol/Feature} the ol feature
     */
    createFeatureByLocation: function (data, featureProjection, dataProjection, onerror) {
        const geojsonReader = new GeoJSON({
            featureProjection,
            dataProjection
        });

        try {
            return geojsonReader.readFeature(data);
        }
        catch (err) {
            if (typeof onerror === "function") {
                onerror(new Error("createFeatureByLocation: JSON structure in sensor thing location can't be parsed."));
            }
        }
        return null;
    },

    /**
     * Aggregates the properties of the things.
     * @param {Object[]} allThings all things
     * @param {String} url The url to service
     * @param {String} version The version from service
     * @returns {Object[]} aggregated things
     */
    aggregatePropertiesOfThings: function (allThings, url, version) {
        if (!Array.isArray(allThings)) {
            return [];
        }
        const result = [];

        allThings.forEach(thing => {
            const aggregatedThing = {};

            if (Array.isArray(thing)) {
                this.aggregatePropertiesOfThingAsArray(thing, aggregatedThing);
            }
            else {
                this.aggregatePropertiesOfOneThing(thing, aggregatedThing);
            }
            if (!isObject(aggregatedThing.properties)) {
                aggregatedThing.properties = {};
            }
            aggregatedThing.properties.requestUrl = url;
            aggregatedThing.properties.versionUrl = version;

            result.push(aggregatedThing);
        });

        return result;
    },

    /**
     * Aggregates the properties of an array of things.
     * @param {Object[]} arrayOfThings the array of things
     * @param {Object} result the thing to add aggregated properties to
     * @returns {Boolean} returns true on success and false if something went wrong
     */
    aggregatePropertiesOfThingAsArray: function (arrayOfThings, result) {
        if (!Array.isArray(arrayOfThings) || !isObject(result)) {
            return false;
        }
        let keys = [],
            props = {},
            datastreams = [];

        result.location = this.getThingsGeometry(arrayOfThings[0], 0);

        arrayOfThings.forEach(thing => {
            if (!isObject(thing) || !isObject(thing.properties)) {
                return;
            }
            keys.push(Object.keys(thing.properties));
            props = Object.assign(props, thing.properties);
            if (thing?.Datastreams) {
                datastreams = datastreams.concat(thing.Datastreams);
            }
        });

        keys = [...new Set(this.flattenArray(keys))];
        keys.push("name");
        keys.push("description");
        keys.push("@iot.id");

        result.properties = Object.assign({}, props, this.aggregateProperties(arrayOfThings, keys));
        if (datastreams.length > 0) {
            result.properties.Datastreams = datastreams;
        }

        return true;
    },

    /**
     * Aggregates the properties of one thing.
     * @param {Object} thing the thing to aggregate properties from
     * @param {Object} result the thing to add aggregated properties to
     * @returns {Boolean} returns true on success and false if something went wrong.
     */
    aggregatePropertiesOfOneThing: function (thing, result) {
        if (!isObject(thing) || !isObject(result)) {
            return false;
        }
        result.location = this.getThingsGeometry(thing, 0);
        result.properties = thing.properties;

        if (!isObject(result.properties)) {
            result.properties = {};
        }
        result.properties.name = thing.name;
        result.properties.description = thing.description;
        result.properties["@iot.id"] = thing["@iot.id"];

        if (thing?.Datastreams) {
            result.properties.Datastreams = thing.Datastreams;
        }

        return true;
    },

    /**
     * Creates a new array with concatenated sub array elements.
     * @info this is equivalent to Array.flat() - except no addition for testing is needed for this one - Array.flat() is a problem for tests and IE11 - so in sensor.js we use the this.flattenArray(arr) function - one flat() was left in sensor.js, this is solved now
     * @param {*} arr the array to flatten sub arrays or anything else
     * @returns {*} the flattened array if an array was given, the untouched input otherwise
     */
    flattenArray: function (arr) {
        if (!Array.isArray(arr)) {
            return arr;
        }
        let result = [];

        arr.forEach(value => {
            if (Array.isArray(value)) {
                result = result.concat(value);
            }
            else {
                result.push(value);
            }
        });

        return result;
    },

    /**
     * Aggregates the properties of the given keys and joins them by " | ".
     * @param {Object[]} things Array of things to aggregate
     * @param {String[]} keys Keys to aggregate
     * @returns {Object} the aggregated properties
     */
    aggregateProperties: function (things, keys) {
        const result = {};

        keys.forEach(key => {
            const value = [];

            things.forEach(thing => {
                if (key === "name" || key === "description" || key === "@iot.id") {
                    value.push(thing[key]);
                }
                else {
                    value.push(thing.properties[key]);
                }
            });
            result[key] = value.join(" | ");
        });
        return result;
    },

    /**
     * Creates style, function triggers to style_v2.json
     * @param {Boolean} isClustered true if the layer is clustered, false if not
     * @fires VectorStyle#RadioRequestStyleListReturnModelById
     * @returns {void}
     */
    styling: function (isClustered) {
        const styleListModel = getStyleModelById(this.get("styleId"));

        if (typeof styleListModel !== "undefined") {
            this.setStyle(feature => {
                return styleListModel.createStyle(feature, isClustered);
            });
        }
    },

    /**
     * Creates the connection to a given MQTT-Broker.
     * @param {String} url The url to connect with.
     * @param {Object} mqttOptions The configured mqtt options.
     * @param {String} timezone The timezone of Sensors.
     * @param {Boolean} showNoDataValue true if "nodata" value should be shown, false if not.
     * @param {String} noDataValue The value to use for "nodata".
     * @returns {void}
     */
    createMqttConnectionToSensorThings: function (url, mqttOptions, timezone, showNoDataValue, noDataValue) {
        if (typeof url !== "string" || !url) {
            return;
        }
        const mqttHost = this.getMqttHostFromUrl(url, error => {
                console.warn(error);
            }),
            options = Object.assign({
                host: mqttHost,
                rhPath: url,
                context: this,
                path: "/mqtt",
                protocol: "wss",
                mqttVersion: "3.1.1"
            }, mqttOptions),
            mqttClient = new SensorThingsMqtt(options);

        this.setMqttClient(mqttClient);

        mqttClient.on("message", (topic, observation) => {
            const datastreamId = this.getDatastreamIdFromMqttTopic(topic),
                features = typeof this.get("layerSource")?.getFeatures === "function" && this.get("layerSource").getFeatures() ? this.get("layerSource").getFeatures() : [],
                feature = this.getFeatureByDatastreamId(features, datastreamId),
                phenomenonTime = this.getLocalTimeFormat(observation.phenomenonTime, timezone);

            this.updateObservationForDatastreams(feature, datastreamId, observation);
            this.updateFeatureProperties(feature, datastreamId, observation.result, phenomenonTime, showNoDataValue, noDataValue, changeFeatureGFI);
        });
    },

    /**
     * Subscribes to the mqtt client for the given dataStreamIds.
     * @param {String[]} dataStreamIds an array of dataStreamIds to unsubscribe from
     * @param {Object} subscriptionTopics an object of subscribed ids as keys and true/false als value
     * @param {String} version the STA version to use in topic
     * @param {Object} mqttClient the mqtt client to use
     * @param {Object} mqttSubscribeOptions an object with key rh and qos to subscribe with
     * @returns {Boolean} returns true on success and false if something went wrong
     */
    subscribeToSensorThings: function (dataStreamIds, subscriptionTopics, version, mqttClient, mqttSubscribeOptions = {}) {
        if (!Array.isArray(dataStreamIds) || !isObject(subscriptionTopics) || !isObject(mqttClient)) {
            return false;
        }

        dataStreamIds.forEach(id => {
            if (id && !subscriptionTopics[id]) {
                mqttClient.subscribe("v" + version + "/Datastreams(" + id + ")/Observations", mqttSubscribeOptions);
                subscriptionTopics[id] = true;
            }
        });

        return true;
    },

    /**
     * Unsubscribes from the mqtt client with topics subscribed in the past.
     * @param {String[]} datastreamIds an array of datastreamIds to unsubscribe from
     * @param {Object} subscriptionTopics an object of subscribed ids as keys and true/false als value
     * @param {String} version the STA version to use in topic
     * @param {Boolean} isSelected the selected state of this layer
     * @param {Object} mqttClient the mqtt client to use
     * @returns {Boolean} returns true on success and false if something went wrong
     */
    unsubscribeFromSensorThings: function (datastreamIds, subscriptionTopics, version, isSelected, mqttClient) {
        if (!Array.isArray(datastreamIds) || !isObject(subscriptionTopics) || !isObject(mqttClient)) {
            return false;
        }
        const datastreamIdsAssoc = {};

        datastreamIds.forEach(datastreamId => {
            datastreamIdsAssoc[datastreamId] = true;
        });

        Object.entries(subscriptionTopics).forEach(([id, isTopicSubscribed]) => {
            if (isSelected === false || isSelected === true && isTopicSubscribed === true && !Object.prototype.hasOwnProperty.call(datastreamIdsAssoc, id)) {
                mqttClient.unsubscribe("v" + version + "/Datastreams(" + id + ")/Observations");
                subscriptionTopics[id] = false;
            }
        });

        return true;
    },

    /**
     * Refreshes all subscriptions by ending all established subscriptions and creating new ones.
     * @returns {void}
     */
    updateSubscription: function () {
        const datastreamIds = this.getDatastreamIdsInCurrentExtent(this.get("layer").getSource().getFeatures(), store.getters["Maps/getCurrentExtent"]),
            subscriptionTopics = this.get("subscriptionTopics"),
            version = this.get("version"),
            isSelected = this.get("isSelected"),
            client = this.get("mqttClient"),
            rh = this.get("mqttRh"),
            qos = this.get("mqttQos");

        if (!this.get("loadThingsOnlyInCurrentExtent")) {
            this.unsubscribeFromSensorThings(datastreamIds, subscriptionTopics, version, isSelected, client);
            this.subscribeToSensorThings(datastreamIds, subscriptionTopics, version, client, {rh, qos});
        }
        else {
            this.unsubscribeFromSensorThings(datastreamIds, subscriptionTopics, version, isSelected, client);
            this.initializeConnection(() => {
                this.subscribeToSensorThings(
                    this.getDatastreamIdsInCurrentExtent(this.get("layer").getSource().getFeatures(), store.getters["Maps/getCurrentExtent"]),
                    subscriptionTopics,
                    version,
                    client,
                    {rh, qos}
                );
            });
        }
    },

    /**
     * Getter for datastream ids of features in current extent.
     * @param {ol/Feature[]} features the features of this layer
     * @param {ol/extent} currentExtent the current browser extent
     * @returns {String[]} an array containing all datastream ids from this layer in the current extent
     */
    getDatastreamIdsInCurrentExtent: function (features, currentExtent) {
        const featuresInExtent = this.getFeaturesInExtent(features, currentExtent);

        return this.getDatastreamIds(featuresInExtent);
    },

    /**
     * Returns features in enlarged extent (enlarged by a fixed percentage to make sure moving features close to the extent can move into the mapview).
     * @param {ol/Feature[]} features all features
     * @param {ol/extent} currentExtent the current browser extent coordinates
     * @returns {ol/Feature[]} the features in the given extent
     */
    getFeaturesInExtent: function (features, currentExtent) {
        const enlargedExtent = this.enlargeExtent(currentExtent, 0.05),
            featuresInExtent = [];

        features.forEach(feature => {
            if (containsExtent(enlargedExtent, feature.getGeometry().getExtent())) {
                featuresInExtent.push(feature);
            }
        });

        return featuresInExtent;
    },

    /**
     * Enlarges the given extent by the given factor.
     * @param {ol/extent} extent extent to enlarge
     * @param {Number} factor factor to enlarge extent
     * @returns {ol/extent} the enlarged extent
     */
    enlargeExtent: function (extent, factor) {
        const bufferAmount = (extent[2] - extent[0]) * factor;

        return buffer(extent, bufferAmount);
    },

    /**
     * Updates the datastreams of the given feature with received time and result of the observation.
     * @param {ol/Feature} feature feature to be updated
     * @param {String} dataStreamId the datastream id
     * @param {Object} observation the observation to update the old observation with
     * @returns {void}
     */
    updateObservationForDatastreams: function (feature, dataStreamId, observation) {
        if (typeof feature?.get !== "function" || !Array.isArray(feature.get("Datastreams"))) {
            return;
        }

        feature.get("Datastreams").forEach(datastream => {
            if (typeof datastream["@iot.id"] !== "undefined" && String(datastream["@iot.id"]) === String(dataStreamId)) {
                datastream.Observations = [observation];
            }
        });
    },

    /**
     * Updates feature properties.
     * @param {ol/Feature} feature feature to be updated
     * @param {String} dataStreamId the datastream id
     * @param {String} result the new state
     * @param {String} phenomenonTime the new phenomenonTime
     * @param {Boolean} showNoDataValue true if "nodata" value should be shown, false if not
     * @param {String} noDataValue the value to use for "nodata"
     * @param {Function} funcChangeFeatureGFI a function to change feature gfi with
     * @returns {Boolean} true on success, false if something went wrong
     */
    updateFeatureProperties: function (feature, dataStreamId, result, phenomenonTime, showNoDataValue, noDataValue, funcChangeFeatureGFI) {
        if (
            typeof feature?.get !== "function"
            || typeof feature?.set !== "function"
            || typeof feature.get("dataStreamId") !== "string"
            || typeof feature.get("dataStreamName") !== "string"
        ) {
            return false;
        }
        const dataStreamIdIdx = feature.get("dataStreamId").split(" | ").indexOf(String(dataStreamId)),
            dataStreamNameArray = feature.get("dataStreamName").split(" | "),
            dataStreamName = Object.prototype.hasOwnProperty.call(dataStreamNameArray, dataStreamIdIdx) ? dataStreamNameArray[dataStreamIdIdx] : "",
            preparedResult = result === "" && showNoDataValue ? noDataValue : result;

        feature.set("dataStream_" + dataStreamId + "_" + dataStreamName, preparedResult, true);
        feature.set("dataStream_" + dataStreamId + "_" + dataStreamName + "_phenomenonTime", phenomenonTime, true);
        feature.set("dataStreamValue", this.replaceValueInPipedProperty(feature, "dataStreamValue", dataStreamId, preparedResult));
        feature.set("dataStreamPhenomenonTime", this.replaceValueInPipedProperty(feature, "dataStreamPhenomenonTime", dataStreamId, phenomenonTime));

        if (typeof funcChangeFeatureGFI === "function") {
            funcChangeFeatureGFI(feature);
        }

        return true;
    },

    /**
     * Replaces a value of a piped property using dataStreamId to locate the right position in the piped property.
     * @param {ol/Feature} feature the feature with properties
     * @param {String} property the property to be updated
     * @param {String} dataStreamId the datastream id
     * @param {String} value the new value
     * @returns {String} the updated property
     */
    replaceValueInPipedProperty: function (feature, property, dataStreamId, value) {
        if (
            typeof feature?.get !== "function"
            || typeof feature.get("dataStreamId") !== "string"
            || typeof feature.get(property) !== "string"
            || typeof property !== "string"
            || typeof dataStreamId !== "string"
            || typeof value !== "string"
        ) {
            return "";
        }
        const dataStreamIds = feature.get("dataStreamId").split(" | "),
            dataStreamProperty = feature.get(property).split(" | ");

        this.replaceValueInArrayByReference(dataStreamProperty, dataStreamIds, dataStreamId, value);

        return dataStreamProperty.join(" | ");
    },

    /**
     * Replaces a value in the given array by the position of an id in an array with referenced ids.
     * @param {String[]} result the result to change the value at the position where reference is found in referenceArray
     * @param {String[]} referenceArray the array to find the position in result to replace the value with
     * @param {String} reference the value to find the position in referenceArray
     * @param {String} value the value to replace the value in result found at position with
     * @returns {Boolean} true if the function ran successfull, false if not
     */
    replaceValueInArrayByReference: function (result, referenceArray, reference, value) {
        if (!Array.isArray(result) || !Array.isArray(referenceArray)) {
            return false;
        }
        const len = referenceArray.length;

        for (let i = 0; i < len; i++) {
            if (reference === referenceArray[i]) {
                result[i] = value;
            }
        }
        return true;
    },

    /**
     * Getter for datastream ids for this layer - using dataStreamId property with expected pipe delimitors.
     * @param {ol/Feature[]} features features with datastream ids or features with features (see clustering) with datastreamids
     * @returns {String[]} an array containing all datastream ids from this layer
     */
    getDatastreamIds: function (features) {
        if (!Array.isArray(features)) {
            return [];
        }
        const dataStreamIdsArray = [];

        features.forEach(feature => {
            if (typeof feature?.get === "function" && Array.isArray(feature.get("features"))) {
                feature.get("features").forEach(subfeature => {
                    this.getDatastreamIdsHelper(subfeature, dataStreamIdsArray);
                });
            }
            else {
                this.getDatastreamIdsHelper(feature, dataStreamIdsArray);
            }
        });

        return dataStreamIdsArray;
    },

    /**
     * Helper function for getDatastreamIds: Pushes the datastream ids into the given array.
     * @param {ol/Feature} feature the feature containing datastream ids
     * @param {String[]} dataStreamIdsArray the array to push the datastream ids into
     * @returns {Boolean} true if the function ran successfull, false if not
     */
    getDatastreamIdsHelper: function (feature, dataStreamIdsArray) {
        if (typeof feature?.get !== "function" || typeof feature.get("dataStreamId") !== "string" || !Array.isArray(dataStreamIdsArray)) {
            return false;
        }

        feature.get("dataStreamId").split(" | ").forEach(id => {
            dataStreamIdsArray.push(id);
        });
        return true;
    },

    /**
     * Getter for feature by a given id.
     * @param {ol/Feature[]} features the features to search through
     * @param {String} id the id to lookup the feature for
     * @returns {ol/Feature} the ol feature with the given id
     */
    getFeatureByDatastreamId: function (features, id) {
        if (!Array.isArray(features) || typeof id !== "string") {
            return null;
        }
        const len = features.length;

        for (let i = 0; i < len; i++) {
            if (
                typeof features[i]?.get !== "function"
                || typeof features[i].get("dataStreamId") !== "string"
                || !features[i].get("dataStreamId").split(" | ").includes(id)
            ) {
                continue;
            }
            return features[i];
        }
        return null;
    },

    /**
     * Extracts the datastream id from the given topic.
     * @param {String} topic the topic to extract datastream id from.
     * @returns {String} the found datastream id.
     */
    getDatastreamIdFromMqttTopic: function (topic) {
        if (typeof topic !== "string") {
            return "";
        }
        const datastreamIdx = topic.indexOf("Datastreams(");

        if (datastreamIdx === -1) {
            return "";
        }
        return topic.substring(datastreamIdx + 12, topic.indexOf(")", datastreamIdx + 12));
    },

    /**
     * Extracts the host name from the given url
     * @param {String} url the url to find the host name in
     * @param {Function} onError the function to call errors with
     * @returns {String} the extracted host name
     */
    getMqttHostFromUrl: function (url, onError) {
        if (typeof url !== "string") {
            if (typeof onError === "function") {
                onError(new Error("getMqttHostFromUrl: the given url is not a string."));
            }
            return "";
        }
        const mqttHost = url.split("/")[2];

        if (typeof mqttHost !== "string") {
            if (typeof onError === "function") {
                onError(new Error("getMqttHostFromUrl: the given url does not include the host name."));
            }
            return "";
        }

        return mqttHost;
    },

    /**
     * Creates the legend.
     * @fires VectorStyle#RadioRequestStyleListReturnModelById
     * @returns {void}
     */
    createLegend: function () {
        const styleModel = getStyleModelById(this.get("styleId"));
        let legend = this.get("legend");

        /**
         * @deprecated in 3.0.0
         */
        if (this.get("legendURL") === "ignore") {
            legend = false;
        }
        else if (this.get("legendURL")) {
            legend = this.get("legendURL");
        }

        if (Array.isArray(legend)) {
            this.setLegend(legend);
        }
        else if (styleModel && legend === true) {
            this.setLegend(styleModel.getLegendInfos());
        }
        else if (typeof legend === "string") {
            this.setLegend([legend]);
        }
    },

    /**
     * Clears all open layer features hold in the VectorSource.
     * @post VectorSource is emptied
     * @returns {void}
     */
    clearLayerSource: function () {
        this.get("layerSource").clear();
    },

    /**
     * Setter for style.
     * @param {Function} value the style function
     * @returns {void}
     */
    setStyle: function (value) {
        this.set("style", value);
    },

    /**
     * Setter for clusterLayerSource.
     * @param {ol/source/Cluster} value the clusterLayerSource
     * @returns {void}
     */
    setClusterLayerSource: function (value) {
        this.set("clusterLayerSource", value);
    },

    /**
     * Setter for isSubscribed.
     * @param {Boolean} value the value to set isSubscribed
     * @returns {void}
     */
    setIsSubscribed: function (value) {
        this.set("isSubscribed", value);
    },

    /**
     * Setter for mqttClient.
     * @param {Object} value the mqttClient to set
     * @returns {void}
     */
    setMqttClient: function (value) {
        this.set("mqttClient", value);
    },

    /**
     * Setter for moveendListener.
     * @param {Function} value the moveendListener to set
     * @returns {void}
     */
    setMoveendListener: function (value) {
        this.set("moveendListener", value);
    },

    /**
     * Setter for subscription topics for this instance.
     * @param {Object} value the subscription topic as object
     * @returns {void}
     */
    setSubscriptionTopics: function (value) {
        this.set("subscriptionTopics", value);
    },

    /**
     * Setter for the HttpSubFolder.
     * @param {String} value the httpSubFolder as String
     * @returns {void}
     */
    setHttpSubFolder: function (value) {
        this.set("httpSubFolder", value);
    }
});

export default SensorLayer;
