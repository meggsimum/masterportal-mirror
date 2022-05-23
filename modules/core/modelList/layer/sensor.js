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
import getProxyUrl from "../../../../src/utils/getProxyUrl";
import mapCollection from "../../../../src/core/maps/mapCollection";
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
            this.createMqttConnectionToSensorThings();
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
        this.setIsSubscribed(false);
        store.dispatch("Maps/unregisterListener", {event: "moveend", callback: this.updateSubscription.bind(this)});
        this.setMoveendListener(null);
        this.unsubscribeFromSensorThings();
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
        let features = [],
            feature;

        if (Array.isArray(sensorData)) {
            sensorData.forEach((data, index) => {
                if (data?.location && data.location && typeof epsg !== "undefined") {
                    feature = this.createFeatureByLocation(
                        data.location,
                        mapProjection,
                        epsg
                    );
                }
                else {
                    return;
                }

                feature.setId(index);
                feature.setProperties(data.properties, true);

                if (typeof gfiTheme === "object") {
                    feature.set("gfiParams", gfiTheme?.params, true);
                }
                feature.set("utc", utc, true);
                feature = this.aggregateDataStreamValue(feature);
                feature = this.aggregateDataStreamPhenomenonTime(feature);
                features.push(feature);
            });

            features = features.filter(subFeature => typeof subFeature.getGeometry() !== "undefined");
        }

        return features;
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
     * @param {String} urlParams The url parameters
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
                    onsuccess(this.getAllThings(result, urlParams));
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
     * @param {Object[]} result response of called sensorAPI
     * @param {String} urlParams The url parameters
     * @returns {Object[]} all prepared things
     */
    getAllThings: function (result, urlParams) {
        let allThings;

        if (urlParams?.root === "Datastreams") {
            allThings = this.getThingsFromSensorData(result, this.get("datastreamAttributes"), this.get("thingAttributes"));
        }
        else {
            allThings = this.flattenArray(result);
        }

        allThings = this.createPropertiesOfDatastreams(allThings);
        allThings = this.aggregatePropertiesOfThings(allThings);

        return allThings;
    },

    /**
     * Parse the sensorThings-API data with datastreams as root.
     * The datastreams are merged based on the id of the thing if the ids exist multiple times.
     * @param {Object[]} sensordata the sensordata with datastream as root.
     * @param {String[]} datastreamAttributes The datastream attributes.
     * @param {String[]} thingAttributes The thing attributes.
     * @returns {Object[]} The sensordata with merged things as root.
     */
    getThingsFromSensorData: function (sensordata, datastreamAttributes, thingAttributes) {
        let allThings = this.changeSensordataRootToThings(sensordata, datastreamAttributes, thingAttributes);
        const thingIds = allThings.map(thing => thing["@iot.id"]),
            uniqueThingIds = [... new Set(thingIds)];

        if (thingIds.length > uniqueThingIds.length) {
            allThings = this.unifyThingsByIds(allThings, uniqueThingIds);
        }
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
        const things = [],
            datastreamAttributesAssociation = this.createAssociationObject(datastreamAttributes),
            thingAttributesAssociation = this.createAssociationObject(thingAttributes);

        sensordata.forEach((stream, index) => {
            const datastreamNewAttributes = {};

            things.push({});
            Object.keys(stream).forEach(key => {
                if (Object.prototype.hasOwnProperty.call(datastreamAttributesAssociation, key)) {
                    datastreamNewAttributes[key] = stream[key];
                    delete things[index][key];
                }
            });
            things[index].Datastreams = [datastreamNewAttributes];
            Object.keys(stream.Thing).forEach(key => {
                if (Object.prototype.hasOwnProperty.call(thingAttributesAssociation, key)) {
                    things[index][key] = stream.Thing[key];
                }
            });
        });

        return things;
    },

    /**
     * Converts elements of an array to keys in an object with value to be true.
     * @param {String[]} [array=[]] Array with value to convert to an object.
     * @returns {Object} The object with value of the given array as keys.
     */
    createAssociationObject: function (array = []) {
        const associationObject = {};

        array.forEach(key => {
            associationObject[key] = true;
        });

        return associationObject;
    },

    /**
     * Merge datastreams based on the id of the thing if the ids exist multiple times.
     * @param {Object[]} allThings The sensordata with things as root.
     * @param {Number[]} uniqueIds The unique ids from the sensordata things.
     * @returns {Object[]} The sensordata with merged things as root.
     */
    unifyThingsByIds: function (allThings, uniqueIds) {
        const mergedThings = [];

        uniqueIds.forEach((thingId, thingIdIndex) => {
            const filterThings = allThings.filter(thing => thing["@iot.id"] === thingId);

            filterThings.forEach((thing, index) => {
                if (index === 0) {
                    mergedThings.push(thing);
                }
                else {
                    mergedThings[thingIdIndex].Datastreams = [...mergedThings[thingIdIndex].Datastreams, ...thing.Datastreams];
                }
            });
        });

        return mergedThings;
    },

    /**
     * Iterates over the dataStreams and creates the attributes for each datastream:
     * "dataStream_[dataStreamId]_[dataStreamName]" and
     * "dataStream_[dataStreamId]_[dataStreamName]_phenomenonTime".
     * @param {Object} thing thing.
     * @param {Boolean} showNoDataValue true if "nodata" value should be shown, false if not
     * @param {String} noDataValue the value to use for "nodata"
     * @returns {void}
     */
    createPropertiesOfDatastreamsHelper (thing, showNoDataValue, noDataValue) {
        const dataStreams = thing.Datastreams;

        thing.properties.dataStreamId = [];
        thing.properties.dataStreamName = [];
        thing.properties.dataStreamValue = [];
        thing.properties.dataPhenomenonTime = [];

        dataStreams.forEach(dataStream => {
            const dataStreamId = String(dataStream["@iot.id"]),
                dataStreamName = dataStream.name,
                dataStreamValue = dataStream?.Observations ? dataStream.Observations[0]?.result : "",
                key = "dataStream_" + dataStreamId + "_" + dataStreamName;
            let phenomenonTime = dataStream?.Observations ? dataStream.Observations[0]?.phenomenonTime : "";

            this.moveDatastreamPropertiesToThing(thing.properties, dataStream.properties);
            phenomenonTime = changeTimeZone(phenomenonTime?.split("/")[0], this.get("utc"));

            thing.properties.dataStreamId.push(dataStreamId);
            thing.properties.dataStreamName.push(dataStreamName);

            if (dataStreamValue !== "") {
                thing.properties[key] = dataStreamValue;
                thing.properties[key + "_phenomenonTime"] = this.getLocalTimeFormat(phenomenonTime, this.get("timezone"));
                thing.properties.dataStreamValue.push(dataStreamValue);
                thing.properties.dataPhenomenonTime.push(phenomenonTime);
            }
            else if (showNoDataValue) {
                thing.properties[key] = noDataValue;
                thing.properties[key + "_phenomenonTime"] = noDataValue;
                thing.properties.dataStreamValue.push(noDataValue);
            }

        });

        thing.properties.dataStreamId = thing.properties.dataStreamId.join(" | ");
        thing.properties.dataStreamValue = thing.properties.dataStreamValue.join(" | ");
        thing.properties.dataStreamName = thing.properties.dataStreamName.join(" | ");
        thing.properties.dataPhenomenonTime = thing.properties.dataPhenomenonTime.join(" | ");
    },

    /**
     * Adds data from datastream to the thing with pipe separator.
     * @param {Object} thingProperties The properties from the thing.
     * @param {Object} dataStreamProperties The properties from the dataStream.
     * @returns {void}
     */
    moveDatastreamPropertiesToThing: function (thingProperties, dataStreamProperties) {
        if (dataStreamProperties) {
            Object.entries(dataStreamProperties).forEach(([key, value]) => {
                if (typeof thingProperties[key] !== "undefined") {
                    thingProperties[key] = thingProperties[key] + " | " + value;
                }
                else {
                    thingProperties[key] = value;
                }
            });
        }
    },

    /**
     * Iterates over things and creates attributes for each observed property.
     * @param {Object[]} allThings All things.
     * @param {Boolean} showNoDataValue true if "nodata" value should be shown, false if not
     * @param {String} noDataValue the value to use for "nodata"
     * @returns {Object[]} All things with the newest observation for each dataStream.
     */
    createPropertiesOfDatastreams: function (allThings, showNoDataValue, noDataValue) {
        const allThingsWithSensorData = allThings;

        allThingsWithSensorData.forEach(thing => {
            if (!thing?.properties) {
                thing.properties = {};
            }
            if (thing?.Datastreams) {
                this.createPropertiesOfDatastreamsHelper(thing, showNoDataValue, noDataValue);
            }
        });

        return allThingsWithSensorData;
    },

    /**
     * Builds the SensorThings url.
     * @param {String} url the url to the service
     * @param {String} version the version from the service
     * @param {String} urlParams the url parameters
     * @returns {String} url to request the sensorThings with
     */
    buildSensorThingsUrl: function (url, version, urlParams) {
        const root = urlParams?.root || "Things",
            versionAsString = typeof version === "number" ? version.toFixed(1) : version;
        let query = "";

        if (typeof urlParams === "object") {
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

        if (location && location?.geometry && location.geometry?.type) {
            return location.geometry;
        }
        else if (location && location?.type) {
            return location;
        }

        return null;
    },

    /**
     * Tries to parse object to ol/format/GeoJson
     * @param {Object} data the object to parse
     * @param {ol/proj/Projection} mapProjection projection of the map
     * @param {String} thingEPSG projection of the thing
     * @returns {ol/Feature} the ol feature
     */
    createFeatureByLocation: function (data, mapProjection, thingEPSG) {
        const geojsonReader = new GeoJSON({
            featureProjection: mapProjection,
            dataProjection: thingEPSG
        });

        let jsonObjects;

        try {
            jsonObjects = geojsonReader.readFeature(data);
        }
        catch (err) {
            console.error("JSON structure in sensor thing location can't be parsed.");
        }

        return jsonObjects;
    },

    /**
     * Aggregates the properties of the things.
     * @param {Object[]} allThings all things
     * @returns {Object[]} aggregated things
     */
    aggregatePropertiesOfThings: function (allThings) {
        /**
         * @deprecated in the next major-release!
         * useProxy
         * getProxyUrl()
         */
        const url = this.get("useProxy") ? getProxyUrl(this.get("url")) : this.get("url"),
            aggregatedArray = [];

        allThings.forEach(thing => {
            const aggregatedThing = {};

            if (Array.isArray(thing)) {
                let keys = [],
                    props = {},
                    datastreams = [];

                aggregatedThing.location = this.getThingsGeometry(thing[0], 0);
                thing.forEach(thing2 => {
                    keys.push(Object.keys(thing2.properties));
                    props = Object.assign(props, thing2.properties);
                    if (thing2?.Datastreams) {
                        datastreams = datastreams.concat(thing2.Datastreams);
                    }
                });
                keys = [...new Set(this.flattenArray(keys))];
                keys.push("name");
                keys.push("description");
                keys.push("@iot.id");
                aggregatedThing.properties = Object.assign({}, props, this.aggregateProperties(thing, keys));
                if (datastreams.length > 0) {
                    keys = this.excludeKeysByPrefix(keys, "dataStream_");
                    aggregatedThing.properties.Datastreams = datastreams;
                }
            }
            else {
                aggregatedThing.location = this.getThingsGeometry(thing, 0);
                aggregatedThing.properties = thing.properties;
                aggregatedThing.properties.name = thing.name;
                aggregatedThing.properties.description = thing.description;
                aggregatedThing.properties["@iot.id"] = thing["@iot.id"];

                if (thing?.Datastreams) {
                    aggregatedThing.properties.Datastreams = thing.Datastreams;
                }
            }
            aggregatedThing.properties.requestUrl = url;
            aggregatedThing.properties.versionUrl = this.get("version");

            aggregatedArray.push(aggregatedThing);
        });

        return aggregatedArray;
    },

    /**
     * Creates a new array with concatenated sub array elements.
     * @info this is equivalent to Array.flat() - except no addition for testing is needed for this one
     * @param {*} array the array to flatten sub arrays or anything else
     * @returns {*} the flattened array if an array was given, the untouched input otherwise
     */
    flattenArray: function (array) {
        return Array.isArray(array) ? array.reduce((acc, val) => acc.concat(val), []) : array;
    },

    /**
     * Excludes the keys starting with the given startsWithString.
     * @param {String[]} keys keys to reduce
     * @param {String} startsWithString the prefix of keys to exclude
     * @returns {String[]} the reduced keys
     */
    excludeKeysByPrefix: function (keys, startsWithString) {
        let keysToIgnore,
            reducedKeys;

        if (keys && startsWithString) {
            keysToIgnore = keys.filter(key => key.startsWith(startsWithString));
            reducedKeys = keys.filter(key => !keysToIgnore.includes(key));
        }

        return reducedKeys;
    },

    /**
     * Aggregates the properties of the given keys and joins them by " | ".
     * @param {Object[]} thingArray Array of things to aggregate
     * @param {String[]} keys Keys to aggregate
     * @returns {Object} the aggregated properties
     */
    aggregateProperties: function (thingArray, keys) {
        const aggregatedProperties = {};

        keys.forEach(key => {
            const valuesArray = thingArray.map(thing => key === "name" || key === "description" || key === "@iot.id" ? thing[key] : thing.properties[key]);

            aggregatedProperties[key] = valuesArray.join(" | ");
        });
        return aggregatedProperties;
    },

    /**
     * Creates style, function triggers to style_v2.json
     * @param {Boolean} isClustered true if the layer is clustered, false if not
     * @fires VectorStyle#RadioRequestStyleListReturnModelById
     * @returns {void}
     */
    styling: function (isClustered) {
        const stylelistmodel = getStyleModelById(this.get("styleId"));

        if (typeof stylelistmodel !== "undefined") {
            this.setStyle(feature => {
                return stylelistmodel.createStyle(feature, isClustered);
            });
        }
    },

    /**
     * Creates the connection to a given MQTT-Broker.
     * Remember to bind this context.
     * @param {ol/Feature[]} features features with DatastreamID
     * @returns {void}
     */
    createMqttConnectionToSensorThings: function () {
        /**
         * @deprecated in the next major-release!
         * useProxy
         * getProxyUrl()
         */
        const url = this.get("useProxy") ? getProxyUrl(this.get("url")) : this.get("url"),
            mqttOptions = Object.assign({
                host: url.split("/")[2],
                rhPath: url,
                context: this,
                path: "/mqtt",
                protocol: "wss",
                mqttVersion: "3.1.1"
            }, this.get("mqttOptions")),
            mqtt = new SensorThingsMqtt(mqttOptions);

        this.setMqttClient(mqtt);

        mqtt.on("message", (topic, jsonData) => {
            const regex = /\((.*)\)/,
                result = topic.match(regex);

            if (Array.isArray(result) && result.length > 1) {
                jsonData.dataStreamId = result[1];
                this.updateFeatureByObservation(jsonData, this.get("layerSource"), this.get("timezone"), this.get("showNoDataValue"), this.get("noDataValue"));
            }
        });
    },

    /**
     * Subscribes to the mqtt client with the features in the current extent.
     * @returns {void}
     */
    subscribeToSensorThings: function () {
        const features = this.getFeaturesInExtent(this.get("layer").getSource().getFeatures(), store.getters["Maps/getCurrentExtent"]),
            dataStreamIds = this.getDatastreamIds(features),
            version = this.get("version"),
            client = this.get("mqttClient"),
            subscriptionTopics = this.get("subscriptionTopics"),
            rh = this.get("mqttRh"),
            qos = this.get("mqttQos");

        dataStreamIds.forEach(id => {
            if (client && id && !subscriptionTopics[id]) {
                client.subscribe("v" + version + "/Datastreams(" + id + ")/Observations", {rh, qos});
                subscriptionTopics[id] = true;
            }
        });
    },

    /**
     * Unsubscribes from the mqtt client with topics subscribed in the past.
     * @returns {void}
     */
    unsubscribeFromSensorThings: function () {
        const features = this.getFeaturesInExtent(this.get("layer").getSource().getFeatures(), store.getters["Maps/getCurrentExtent"]),
            dataStreamIds = this.getDatastreamIds(features),
            dataStreamIdsInverted = {},
            subscriptionTopics = this.get("subscriptionTopics"),
            version = this.get("version"),
            isSelected = this.get("isSelected"),
            client = this.get("mqttClient");
        let id;

        dataStreamIds.forEach(function (datastreamId) {
            dataStreamIdsInverted[datastreamId] = true;
        });

        for (id in subscriptionTopics) {
            if (client && id && (isSelected === false || isSelected === true && subscriptionTopics[id] === true && !Object.prototype.hasOwnProperty.call(dataStreamIdsInverted, id))) {
                client.unsubscribe("v" + version + "/Datastreams(" + id + ")/Observations");
                subscriptionTopics[id] = false;
            }
        }
    },

    /**
     * Refreshes all subscriptions by ending all established subscriptions and creating new ones.
     * @returns {void}
     */
    updateSubscription: function () {
        if (!this.get("loadThingsOnlyInCurrentExtent")) {
            this.unsubscribeFromSensorThings();
            this.subscribeToSensorThings();
        }
        else {
            this.loadFeaturesInExtentAndUpdateSubscription();
        }
    },

    /**
     * Loads things only in the current extent and updates the subscriptions.
     * @returns {void}
     */
    loadFeaturesInExtentAndUpdateSubscription: function () {
        this.unsubscribeFromSensorThings();
        this.initializeConnection(() => {
            this.subscribeToSensorThings();
        });
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
     * Updates the phenomenonTime and states of the feature.
     * This function is triggerd from mqtt.
     * @param {Object} observation The observation containing new data.
     * @param {ol/source/Source} layerSource The layer source of open layers.
     * @param {String} timezone The timezone of Sensors.
     * @param {Boolean} showNoDataValue true if "nodata" value should be shown, false if not
     * @param {String} noDataValue the value to use for "nodata"
     * @returns {void}
     */
    updateFeatureByObservation: function (observation, layerSource, timezone, showNoDataValue, noDataValue) {
        const observationToUpdate = typeof observation !== "undefined" ? observation : {},
            dataStreamId = String(observationToUpdate.dataStreamId),
            features = layerSource ? layerSource.getFeatures() : [],
            feature = this.getFeatureByDatastreamId(features, dataStreamId),
            result = observationToUpdate.result,
            phenomenonTime = this.getLocalTimeFormat(observationToUpdate.phenomenonTime, timezone);

        this.updateObservationForDatastreams(feature, dataStreamId, observation);
        this.updateFeatureProperties(feature, dataStreamId, result, phenomenonTime, showNoDataValue, noDataValue);
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
     * @fires GFI#RadioTriggerGFIChangeFeature
     * @returns {void}
     */
    updateFeatureProperties: function (feature, dataStreamId, result, phenomenonTime, showNoDataValue, noDataValue) {
        if (typeof feature?.get !== "function") {
            return;
        }
        const dataStreamIdIdx = feature.get("dataStreamId").split(" | ").indexOf(String(dataStreamId)),
            dataStreamNameArray = feature.get("dataStreamName").split(" | "),
            dataStreamName = Object.prototype.hasOwnProperty.call(dataStreamNameArray, dataStreamIdIdx) ? dataStreamNameArray[dataStreamIdIdx] : "",
            preparedResult = result === "" && showNoDataValue ? noDataValue : result;

        feature.set("dataStream_" + dataStreamId + "_" + dataStreamName, preparedResult, true);
        feature.set("dataStream_" + dataStreamId + "_" + dataStreamName + "_phenomenonTime", phenomenonTime, true);
        feature.set("dataStreamValue", this.replaceValueInPipedProperty(feature, "dataStreamValue", dataStreamId, preparedResult));
        feature.set("dataStreamPhenomenonTime", this.replaceValueInPipedProperty(feature, "dataStreamPhenomenonTime", dataStreamId, phenomenonTime));

        changeFeatureGFI(feature);
    },

    /**
     * Replaces a value of a piped property using dataStreamId to locate the right position in the piped property.
     * @param {ol/Feature} feature the feature with properties
     * @param {String} property the property to be updated
     * @param {String} dataStreamId the datastream id
     * @param {String} result the new value
     * @returns {String} the updated property
     */
    replaceValueInPipedProperty: function (feature, property, dataStreamId, result) {
        const dataStreamIds = feature.get("dataStreamId").split(" | "),
            dataStreamProperty = feature.get(property).split(" | ");

        dataStreamIds.forEach((id, index) => {
            if (id === dataStreamId) {
                dataStreamProperty[index] = result;
            }
        });

        return dataStreamProperty.join(" | ");
    },

    /**
     * Helper function for getDatastreamIds: Pushes the datastream ids into the given array.
     * @param {ol/Feature} feature the feature containing datastream ids
     * @param {String[]} dataStreamIdsArray the array to push the datastream ids into
     * @returns {void}
     */
    getDatastreamIdsHelper: function (feature, dataStreamIdsArray) {
        let dataStreamIds = feature && typeof feature.get("dataStreamId") !== "undefined" ? feature.get("dataStreamId") : "";

        if (dataStreamIds.indexOf("|") >= 0) {
            dataStreamIds = dataStreamIds.split("|");

            dataStreamIds.forEach(id => {
                dataStreamIdsArray.push(id.trim());
            });
        }
        else {
            dataStreamIdsArray.push(String(dataStreamIds));
        }
    },

    /**
     * Getter for datastream ids for this layer - using dataStreamId property with expected pipe delimitors.
     * @param {ol/Feature[]} features features with datastream ids or features with features (see clustering) with datastreamids
     * @returns {String[]} an array containing all datastream ids from this layer
     */
    getDatastreamIds: function (features) {
        const dataStreamIdsArray = [];

        if (!Array.isArray(features)) {
            return [];
        }

        features.forEach(feature => {
            if (Array.isArray(feature.get("features"))) {
                // obviously clustered featuers are activated
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
     * Getter for feature by a given id.
     * @param {ol/Feature[]} features the features to search through
     * @param {Number} id the id to lookup the feature for
     * @returns {ol/Feature} the ol feature with the given id
     */
    getFeatureByDatastreamId: function (features, id) {
        let feature;

        if (features?.length > 0 && id) {
            feature = features.filter(feat => {
                return feat.get("dataStreamId") ? feat.get("dataStreamId").includes(id) : false;
            })[0];
        }

        return feature;
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
        if (this.get("legendURL")) {
            if (this.get("legendURL") === "") {
                legend = true;
            }
            else if (this.get("legendURL") === "ignore") {
                legend = false;
            }
            else {
                legend = this.get("legendURL");
            }
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
