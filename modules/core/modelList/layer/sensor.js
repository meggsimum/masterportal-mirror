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

        // set subscriptionTopics as instance variable (!)
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

        // change language from moment.js to german
        moment.locale("de");
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

        // messages from the server
        mqtt.on("message", (topic, jsonData) => {
            // search value in topic, that represents the datastreamid on position 1
            const regex = /\((.*)\)/,
                result = topic.match(regex);

            if (Array.isArray(result) && result.length > 1) {
                jsonData.dataStreamId = result[1];
                this.updateFromMqtt(jsonData);
            }
        });
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

        // subscription / unsubscription to mqtt only happens by this change events
        this.listenTo(this, {
            "change:isVisibleInMap": this.changedConditions,
            "change:isOutOfRange": this.changedConditions
        });
        this.createLegend();
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
     * Creates the vectorSource.
     * @returns {void}
     */
    createLayerSource: function () {
        this.setLayerSource(new VectorSource());
        if (this.has("clusterDistance")) {
            this.createClusterLayerSource();
        }
    },

    /**
     * Creates ClusterLayerSource.
     * @returns {void}
     */
    createClusterLayerSource: function () {
        this.setClusterLayerSource(new Cluster({
            source: this.get("layerSource"),
            distance: this.get("clusterDistance")
        }));
    },

    /**
     * Starts or stops subscription according to its conditions.
     * Because of usage of several listeners it's necessary to create a "isSubscribed" flag to prevent multiple executions.
     * @returns {void}
     */
    changedConditions: function () {
        const features = this.get("layer").getSource().getFeatures(),
            state = this.checkConditionsForSubscription();

        if (state === true) {
            this.setIsSubscribed(true);
            if (!this.get("loadThingsOnlyInCurrentExtent") && Array.isArray(features) && !features.length) {
                this.initializeConnection(function () {
                    // call subscriptions
                    this.updateSubscription();
                    // create listener of moveend event
                    this.setMoveendListener(store.dispatch("Maps/registerListener", {event: "moveend", callback: this.updateSubscription.bind(this)}));
                }.bind(this));
            }
            else {
                // call subscriptions
                this.updateSubscription();
                // create listener of moveend event
                this.setMoveendListener(store.dispatch("Maps/registerListener", {event: "moveend", callback: this.updateSubscription.bind(this)}));
            }
        }
        else if (state === false) {
            this.setIsSubscribed(false);
            // remove listener of moveend event
            store.dispatch("Maps/unregisterListener", {event: "moveend", callback: this.updateSubscription.bind(this)});
            this.setMoveendListener(null);
            // remove connection to live update
            this.unsubscribeFromSensorThings();
        }
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
            intersect = typeof this.get("intersect") === "boolean" ? this.get("intersect") : true;

        this.loadSensorThings(url, version, urlParams, intersect, function (sensorData) {
            const epsg = this.get("epsg"),
                features = this.createFeatures(sensorData, epsg),
                isClustered = this.has("clusterDistance");

            this.clearLayerSource();
            // Add features to vectorlayer
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
        }.bind(this));
    },

    /**
     * Load SensorThings
     * @param {String} url The url to service
     * @param {String} version The version from service
     * @param {String} urlParams The url parameters
     * @param {Boolean} intersect true if it intersects, false if not
     * @param {Function} onsuccess a callback function (result) with the result to call on success and result: all things with attributes and location
     * @returns {void}
     */
    loadSensorThings: function (url, version, urlParams, intersect, onsuccess) {
        const requestUrl = this.buildSensorThingsUrl(url, version, urlParams),
            http = new SensorThingsHttp(),
            currentExtent = {
                extent: store.getters["Maps/getCurrentExtent"],
                sourceProjection: mapCollection.getMapView("2D").getProjection().getCode(),
                targetProjection: this.get("epsg")
            },
            /**
             * a function to receive the response of a http call
             * @param {Object} result the response from the http request as array buffer
             * @returns {void}
             */
            httpOnSuccess = function (result) {
                let allThings;

                if (urlParams?.root === "Datastreams") {
                    allThings = this.parseDatastreams(result, this.get("datastreamAttributes"), this.get("thingAttributes"));
                }
                else {
                    allThings = this.flattenArray(result);
                }

                allThings = this.getNewestSensorData(allThings);

                allThings = this.aggregatePropertiesOfThings(allThings);

                if (typeof onsuccess === "function") {
                    onsuccess(allThings);
                }
            }.bind(this),
            /**
             * Function to call on error
             * @param {Error} error the occurring error
             * @returns {void}
             */
            httpOnError = function (error) {
                store.dispatch("Alerting/addSingleAlert", i18next.t("modules.core.modelList.layer.sensor.httpOnError", {name: this.get("name")}));
                console.warn(error);
            }.bind(this);

        if (!this.get("loadThingsOnlyInCurrentExtent")) {
            http.get(requestUrl, httpOnSuccess, null, null, httpOnError);
        }
        else {
            http.getInExtent(requestUrl, currentExtent, intersect, httpOnSuccess, null, null, httpOnError);
        }
    },

    /**
     * Iterates over things and creates attributes for each observed property.
     * @param {Object[]} allThings All things.
     * @returns {Object[]} All things with the newest observation for each dataStream.
     */
    getNewestSensorData: function (allThings) {
        const allThingsWithSensorData = allThings;

        allThingsWithSensorData.forEach(thing => {

            // A thing may not have properties. So we ensure we can access them.
            if (!thing?.properties) {
                thing.properties = {};
            }

            if (thing?.Datastreams) {
                this.getNewestSensorDataOfDatastream(thing);
            }

        });

        return allThingsWithSensorData;
    },

    /**
     * Iterates over the dataStreams and creates the attributes for each datastream:
     * "dataStream_[dataStreamId]_[dataStreamName]" and
     * "dataStream_[dataStreamId]_[dataStreamName]_phenomenonTime".
     * @param {Object} thing thing.
     * @returns {void}
     */
    getNewestSensorDataOfDatastream (thing) {
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

            this.addDatastreamProperties(thing.properties, dataStream.properties);
            phenomenonTime = changeTimeZone(phenomenonTime?.split("/")[0], this.get("utc"));

            thing.properties.dataStreamId.push(dataStreamId);
            thing.properties.dataStreamName.push(dataStreamName);

            if (dataStreamValue !== "") {
                thing.properties[key] = dataStreamValue;
                thing.properties[key + "_phenomenonTime"] = this.getLocalTimeFormat(phenomenonTime, this.get("timezone"));
                thing.properties.dataStreamValue.push(dataStreamValue);
                thing.properties.dataPhenomenonTime.push(phenomenonTime);
            }
            else if (this.get("showNoDataValue")) {
                thing.properties[key] = this.get("noDataValue");
                thing.properties[key + "_phenomenonTime"] = this.get("noDataValue");
                thing.properties.dataStreamValue.push(this.get("noDataValue"));
            }

        });

        thing.properties.dataStreamId = thing.properties.dataStreamId.join(" | ");
        thing.properties.dataStreamValue = thing.properties.dataStreamValue.join(" | ");
        thing.properties.dataStreamName = thing.properties.dataStreamName.join(" | ");
        thing.properties.dataPhenomenonTime = thing.properties.dataPhenomenonTime.join(" | ");
    },

    /**
     * Parse the sensorThings-API data with datastreams as root.
     * The datastreams are merged based on the id of the thing if the ids exist multiple times.
     * @param {Object[]} sensordata the sensordata with datastream as root.
     * @param {String[]} datastreamAttributes The datastream attributes.
     * @param {String[]} thingAttributes The thing attributes.
     * @returns {Object[]} The sensordata with merged things as root.
     */
    parseDatastreams: function (sensordata, datastreamAttributes, thingAttributes) {
        let allThings = this.changeSensordataRoot(sensordata, datastreamAttributes, thingAttributes);
        const thingIds = allThings.map(thing => thing["@iot.id"]),
            uniqueThingIds = [... new Set(thingIds)];

        if (thingIds.length > uniqueThingIds.length) {
            allThings = this.mergeDatastreamsByThingId(allThings, uniqueThingIds);
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
    changeSensordataRoot: function (sensordata, datastreamAttributes, thingAttributes) {
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
     * Merge datastreams based on the id of the thing if the ids exist multiple times.
     * @param {Object[]} allThings The sensordata with things as root.
     * @param {Number[]} uniqueIds The unique ids from the sensordata things.
     * @returns {Object[]} The sensordata with merged things as root.
     */
    mergeDatastreamsByThingId: function (allThings, uniqueIds) {
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
     * Draws points on the map
     * @param {Object[]} sensorData sensor with location and properties
     * @param {String} epsg the epsg from sensortype
     * @returns {ol/Feature[]} feature to draw
     */
    createFeatures: function (sensorData, epsg) {
        let features = [],
            feature;

        if (Array.isArray(sensorData)) {
            sensorData.forEach(function (data, index) {
                if (data?.location && data.location && epsg !== undefined) {
                    feature = this.parseJson(data.location);
                }
                else {
                    return;
                }

                feature.setId(index);
                feature.setProperties(data.properties, true);

                // for a special theme
                if (typeof this.get("gfiTheme") === "object") {
                    feature.set("gfiParams", this.get("gfiTheme").params, true);
                    feature.set("utc", this.get("utc"), true);
                }
                feature = this.aggregateDataStreamValue(feature);
                feature = this.aggregateDataStreamPhenomenonTime(feature);
                features.push(feature);
            }, this);

            // only features with geometry
            features = features.filter(subFeature => subFeature.getGeometry() !== undefined);
        }

        return features;
    },

    /**
     * Refreshes all connections by ending all established connections and creating new ones.
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
     * Unsubscribes from the mqtt client with topics subscribed in the past.
     * @returns {void}
     */
    unsubscribeFromSensorThings: function () {
        const features = this.getFeaturesInExtent(),
            dataStreamIds = this.getDataStreamIds(features),
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
     * Subscribes to the mqtt client with the features in the current extent.
     * @returns {void}
     */
    subscribeToSensorThings: function () {
        const features = this.getFeaturesInExtent(),
            dataStreamIds = this.getDataStreamIds(features),
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
     * Updates the phenomenonTime and states of the feature.
     * This function is triggerd from mqtt.
     * @param {Object} thing The thing containing a new observation and topic
     * @returns {void}
     */
    updateFromMqtt: function (thing) {
        const thingToUpdate = thing !== undefined ? thing : {},
            dataStreamId = String(thingToUpdate.dataStreamId),
            layerSource = this.get("layerSource"),
            features = layerSource ? layerSource.getFeatures() : [],
            feature = this.getFeatureByDataStreamId(features, dataStreamId),
            result = thingToUpdate.result,
            timezone = this.get("timezone"),
            phenomenonTime = this.getLocalTimeFormat(thingToUpdate.phenomenonTime, timezone);

        this.updateObservationForDatastreams(feature, dataStreamId, thing);
        this.liveUpdate(feature, dataStreamId, result, phenomenonTime);
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

        feature.get("Datastreams").forEach(function (datastream) {
            if (datastream["@iot.id"] !== undefined && String(datastream["@iot.id"]) === String(dataStreamId)) {
                datastream.Observations = [observation];
            }
        });
    },

    /**
     * Performs the live update.
     * @param {ol/Feature} feature feature to be updated
     * @param {String} dataStreamId the datastream id
     * @param {String} result the new state
     * @param {String} phenomenonTime the new phenomenonTime
     * @fires GFI#RadioTriggerGFIChangeFeature
     * @returns {void}
     */
    liveUpdate: function (feature, dataStreamId, result, phenomenonTime) {
        if (typeof feature?.get !== "function") {
            return;
        }
        const dataStreamIdIdx = feature.get("dataStreamId").split(" | ").indexOf(String(dataStreamId)),
            dataStreamNameArray = feature.get("dataStreamName").split(" | "),
            dataStreamName = Object.prototype.hasOwnProperty.call(dataStreamNameArray, dataStreamIdIdx) ? dataStreamNameArray[dataStreamIdIdx] : "",
            preparedResult = result === "" && this.get("showNoDataValue") ? this.get("noDataValue") : result;

        // Here we only work with a reference of the feature, otherwise it leads to blinking behavior with clustered features.
        feature.set("dataStream_" + dataStreamId + "_" + dataStreamName, preparedResult, true);
        feature.set("dataStream_" + dataStreamId + "_" + dataStreamName + "_phenomenonTime", phenomenonTime, true);
        feature.set("dataStreamValue", this.replaceStreamProperties(feature, "dataStreamValue", dataStreamId, preparedResult));
        feature.set("dataStreamPhenomenonTime", this.replaceStreamProperties(feature, "dataStreamPhenomenonTime", dataStreamId, phenomenonTime));

        changeFeatureGFI(feature);
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

                aggregatedThing.location = this.getJsonGeometry(thing[0], 0);
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
                    keys = this.excludeDataStreamKeys(keys, "dataStream_");
                    aggregatedThing.properties.Datastreams = datastreams;
                }
            }
            else {
                aggregatedThing.location = this.getJsonGeometry(thing, 0);
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
     * Aggregates the properties of the given keys and joins them by " | ".
     * @param {Object} thingArray Array of things to aggregate
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
     * Returns date and time in clients local format converting utc time to sensors origin timezone.
     * @param {String} phenomenonTime phenomenonTime given by sensor
     * @param {String} timezone name of the sensors origin timezone
     * @see https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
     * @returns {String} The phenomenonTime converted with UTC
     */
    getLocalTimeFormat: function (phenomenonTime, timezone) {
        const utcTime = this.getFirstPhenomenonTime(phenomenonTime);

        if (utcTime) {
            // "LLL" outputs month name, day of month, year, time in local date of the client. For example "16. März 2020 14:31"
            return moment(utcTime).tz(timezone).format("LLL");
        }

        return "";
    },

    /**
     * Adds data from datastream to the thing with pipe separator.
     * @param {Object} thingProperties The properties from the thing.
     * @param {Object} dataStreamProperties The properties from the dataStream.
     * @returns {void}
     */
    addDatastreamProperties: function (thingProperties, dataStreamProperties) {
        if (dataStreamProperties) {
            Object.entries(dataStreamProperties).forEach(([key, value]) => {
                if (thingProperties[key] !== undefined) {
                    thingProperties[key] = thingProperties[key] + " | " + value;
                }
                else {
                    thingProperties[key] = value;
                }
            });
        }
    },

    /**
     * Checks if layer is within range and selected to determine if all conditions are fullfilled.
     * @returns {Boolean} true if the layer is in range, isSelected and not subscribed, false if it is in range or not selected and subscribed, undefined in any other cases
     */
    checkConditionsForSubscription: function () {
        if (this.get("isOutOfRange") === false && this.get("isSelected") === true && this.get("isSubscribed") === false) {
            return true;
        }
        else if ((this.get("isOutOfRange") === true || this.get("isSelected") === false) && this.get("isSubscribed") === true) {
            return false;
        }

        return undefined;
    },

    /**
     * Tries to parse object to ol/format/GeoJson
     * @param {Object} data the object to parse
     * @returns {ol/Feature} the ol feature
     */
    parseJson: function (data) {
        const mapCrs = mapCollection.getMapView("2D").getProjection(),
            thingEPSG = this.get("epsg"),
            geojsonReader = new GeoJSON({
                featureProjection: mapCrs,
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
     * Creates a new array with concatenated sub array elements.
     * @info this is equivalent to Array.flat() - except no addition for testing is needed for this one
     * @param {*} array the array to flatten sub arrays or anything else
     * @returns {*} the flattened array if an array was given, the untouched input otherwise
     */
    flattenArray: function (array) {
        return Array.isArray(array) ? array.reduce((acc, val) => acc.concat(val), []) : array;
    },

    /**
     * Build SensorThings url.
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
     * Excludes the keys starting with the given startsWithString.
     * @param {String[]} keys keys to reduce
     * @param {String} startsWithString the prefix of keys to exclude
     * @returns {String[]} the reduced keys
     */
    excludeDataStreamKeys: function (keys, startsWithString) {
        let keysToIgnore,
            reducedKeys;

        if (keys && startsWithString) {
            keysToIgnore = keys.filter(key => key.startsWith(startsWithString));
            reducedKeys = keys.filter(key => !keysToIgnore.includes(key));
        }

        return reducedKeys;
    },

    /**
     * Returns features in enlarged extent (enlarged by a fixed percentage to make sure moving features close to the extent can move into the mapview).
     * @returns {ol/Feature[]} the features
     */
    getFeaturesInExtent: function () {
        const features = this.get("layer").getSource().getFeatures(),
            currentExtent = store.getters["Maps/getCurrentExtent"],
            enlargedExtent = this.enlargeExtent(currentExtent, 0.05),
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
     * Replaced a property of the feature in the place of the given datastreamId.
     * @param {ol/Feature} feature the feature with properties
     * @param {String} property the property to be updated
     * @param {String} dataStreamId the datastream id
     * @param {String} result the new value
     * @returns {String} the updated property
     */
    replaceStreamProperties: function (feature, property, dataStreamId, result) {
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
     * Getter for datastream ids for this layer - using dataStreamId property with expected pipe delimitors.
     * @param {ol/Feature[]} features features with datastream ids or features with features (see clustering) with datastreamids
     * @returns {String[]} an array containing all datastream ids from this layer
     */
    getDataStreamIds: function (features) {
        const dataStreamIdsArray = [];

        if (!Array.isArray(features)) {
            return [];
        }

        features.forEach(function (feature) {
            if (Array.isArray(feature.get("features"))) {
                // obviously clustered featuers are activated
                feature.get("features").forEach(function (subfeature) {
                    this.getDataStreamIdsHelper(subfeature, dataStreamIdsArray);
                }.bind(this));
            }
            else {
                this.getDataStreamIdsHelper(feature, dataStreamIdsArray);
            }
        }.bind(this));

        return dataStreamIdsArray;
    },

    /**
     * Helper function for getDataStreamIds: Pushes the datastream ids into the given array.
     * @param {ol/Feature} feature the feature containing datastream ids
     * @param {String[]} dataStreamIdsArray the array to push the datastream ids into
     * @returns {void}
     */
    getDataStreamIdsHelper: function (feature, dataStreamIdsArray) {
        let dataStreamIds = feature && feature.get("dataStreamId") !== undefined ? feature.get("dataStreamId") : "";

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
     * Getter for feature by a given id.
     * @param {ol/Feature[]} features the features to search through
     * @param {Number} id the id to lookup the feature for
     * @returns {ol/Feature} the ol feature with the given id
     */
    getFeatureByDataStreamId: function (features, id) {
        let feature;

        if (features?.length > 0 && id) {
            feature = features.filter(feat => {
                return feat.get("dataStreamId") ? feat.get("dataStreamId").includes(id) : false;
            })[0];
        }

        return feature;
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
     * Searches the thing for its geometry location.
     * For some reason there are two different object pathes to check.
     * @param {Object} thing the aggregated thing
     * @param {Number} index the index of the location in array Locations
     * @returns {Object} the json object or null if none was found
     */
    getJsonGeometry: function (thing, index) {
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
     * Create style, function triggers to style_v2.json
     * @param {Boolean} isClustered true if the layer should be clustered, false if not
     * @fires VectorStyle#RadioRequestStyleListReturnModelById
     * @returns {void}
     */
    styling: function (isClustered) {
        const stylelistmodel = getStyleModelById(this.get("styleId"));

        if (stylelistmodel !== undefined) {
            this.setStyle(function (feature) {
                return stylelistmodel.createStyle(feature, isClustered);
            });
        }
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
     * Setter for subscription topics.
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
