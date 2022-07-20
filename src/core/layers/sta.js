import Layer from "./layer";
import LoaderOverlay from "../../utils/loaderOverlay";
import * as bridge from "./RadioBridge";
import Cluster from "ol/source/Cluster";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import {buffer, containsExtent} from "ol/extent";
import {GeoJSON} from "ol/format";
import changeTimeZone from "../../utils/changeTimeZone";
import getProxyUrl from "../../utils/getProxyUrl";
import isObject from "../../utils/isObject";
import {SensorThingsMqtt} from "../../utils/sensorThingsMqtt";
import {SensorThingsHttp} from "../../utils/sensorThingsHttp";
import store from "../../app-store";
import moment from "moment";
import "moment-timezone";

/**
 * Creates a layer for the SensorThings API.
 * @param {Object} attrs attributes of the layer
 * @returns {void}
 */
export default function STALayer (attrs) {
    const defaults = {
        supported: ["2D", "3D"],
        epsg: "EPSG:4326",
        showSettings: true,
        isSecured: false,
        altitudeMode: "clampToGround",
        useProxy: false,
        sourceUpdated: false,
        subscriptionTopics: {},
        mqttClient: null,
        timezone: "Europe/Berlin",
        utc: "+1",
        version: "1.1",
        showNoDataValue: true,
        noDataValue: "no data",
        loadThingsOnlyInCurrentExtent: false,
        isSubscribed: false,
        mqttRh: 2,
        mqttQos: 2,
        mqttOptions: {},
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
    };

    this.mqttClient = null;
    this.options = {};

    this.createLayer(Object.assign(defaults, attrs));
    Layer.call(this, Object.assign(defaults, attrs), this.layer, !attrs.isChildLayer);
    this.set("style", this.getStyleFunction(attrs));

    moment.locale("de");
}
// Link prototypes and add prototype methods, means STALayer uses all methods and properties of Layer
STALayer.prototype = Object.create(Layer.prototype);

/**
 * Creates a layer for SensorThings.
 * Sets all needed attributes at the layer and the layer source.
 * @param {Object} attrs params of the raw layer
 * @returns {void}
 */
STALayer.prototype.createLayer = function (attrs) {
    let initialLoading = true;
    const rawLayerAttributes = {
            id: attrs.id,
            url: attrs.url,
            clusterDistance: attrs.clusterDistance,
            featureNS: attrs.featureNS,
            featureType: attrs.featureType,
            version: attrs.version
        },
        layerParams = {
            name: attrs.name,
            typ: attrs.typ,
            gfiAttributes: attrs.gfiAttributes,
            gfiTheme: attrs.gfiTheme,
            hitTolerance: attrs.hitTolerance,
            altitudeMode: attrs.altitudeMode,
            alwaysOnTop: attrs.alwaysOnTop,
            layerSequence: attrs.layerSequence
        },
        styleFn = this.getStyleFunction(attrs),
        options = {
            clusterGeometryFunction: (feature) => {
                if (feature.get("hideInClustering") === true) {
                    return null;
                }
                return feature.getGeometry();
            },
            featuresFilter: this.getFeaturesFilterFunction(attrs),
            beforeLoading: () => {
                if (this.get("isSelected") || attrs.isSelected) {
                    LoaderOverlay.show();
                }
            },
            afterLoading: features => {
                if (!initialLoading) {
                    return;
                }
                initialLoading = false;
                this.featuresLoaded(attrs.id, features);
                if (this.get("isSelected") || attrs.isSelected) {
                    LoaderOverlay.hide();
                }
            },
            onLoadingError: error => {
                store.dispatch("Alerting/addSingleAlert", i18next.t("modules.core.modelList.layer.sensor.httpOnError", {name: this.get("name")}));
                console.warn("masterportal SensorThingsAPI loading error:", error);
            }
        };

    if (typeof styleFn === "function") {
        styleFn.bind(this);
    }
    options.style = styleFn;

    this.layer = this.createVectorLayer(rawLayerAttributes, {layerParams, options});
    this.options = options;
};

/**
 * Creates a complete ol/Layer from rawLayer containing all required children.
 * @param {Object} rawLayer layer specification as in services.json
 * @param {Object} [optionalParams] optional params
 * @param {Object} [optionalParams.layerParams] additional layer params
 * @param {Object} [optionalParams.options] additional options
 * @returns {ol/Layer} layer that can be added to map
 */
STALayer.prototype.createVectorLayer = function (rawLayer = {}, {layerParams = {}, options = {}} = {}) {
    const source = new VectorSource(),
        layer = new VectorLayer(Object.assign({
            source: rawLayer.clusterDistance ? new Cluster({
                source,
                distance: rawLayer.clusterDistance,
                geometryFunction: options.clusterGeometryFunction
            }) : source,
            id: rawLayer.id
        }, layerParams));

    if (options.style) {
        layer.setStyle(options.style);
    }
    else if (rawLayer.style) {
        layer.setStyle(rawLayer.style);
    }

    return layer;
};

/**
 * Returns a function to filter features.
 * @param {Object} attrs params of the raw layer
 * @returns {Function} a function to filter features
 */
STALayer.prototype.getFeaturesFilterFunction = function (attrs) {
    return function (features) {
        let filteredFeatures = features.filter(feature => feature.getGeometry() !== undefined);

        if (attrs.bboxGeometry) {
            filteredFeatures = filteredFeatures.filter((feature) => attrs.bboxGeometry.intersectsExtent(feature.getGeometry().getExtent()));
        }
        return filteredFeatures;
    };
};

/**
 * Returns the property names.
 * @param {Object} attrs params of the raw layer
 * @returns {String} the property names as comma separated string
 */
STALayer.prototype.getPropertyname = function (attrs) {
    if (Array.isArray(attrs?.propertyNames)) {
        return attrs.propertyNames.join(",");
    }
    return "";
};

/**
 * Getter of style for layer.
 * @param {Object} attrs params of the raw layer
 * @returns {Function} a function to get the style with or null plus console error if no style model was found
 */
STALayer.prototype.getStyleFunction = function (attrs) {
    const styleId = attrs?.styleId,
        styleModel = bridge.getStyleModelById(styleId);

    if (typeof styleModel !== "undefined") {
        return function (feature) {
            const feat = typeof feature !== "undefined" ? feature : this,
                isClusterFeature = typeof feat.get("features") === "function" || typeof feat.get("features") === "object" && Boolean(feat.get("features"));

            return styleModel.createStyle(feat, isClusterFeature);
        };
    }
    console.error(i18next.t("common:modules.core.modelList.layer.wrongStyleId", {styleId}));

    return null;
};

/**
 * Updates the layers source by calling refresh at source. Depending on attribute 'sourceUpdated'.
 * @returns {void}
 */
STALayer.prototype.updateSource = function () {
    if (this.get("sourceUpdated") === false) {
        this.set("sourceUpdated", true);
        this.layer.getSource().refresh();
    }
};

/**
 * Creates the legend.
 * @returns {void}
 */
STALayer.prototype.createLegend = function () {
    const styleModel = bridge.getStyleModelById(this.get("styleId"));
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
        this.set("legend", legend);
    }
    else if (styleModel && legend === true) {
        this.set("legend", styleModel.getLegendInfos());
    }
    else if (typeof legend === "string") {
        this.set("legend", [legend]);
    }
};

/**
 * Hides all features by setting style=null for all features.
 * @returns {void}
 */
STALayer.prototype.hideAllFeatures = function () {
    const layerSource = this.get("layerSource") instanceof Cluster ? this.get("layerSource").getSource() : this.get("layerSource"),
        features = layerSource.getFeatures();

    layerSource.clear();
    features.forEach((feature) => {
        feature.set("hideInClustering", true);
        feature.setStyle(() => null);
    });
    layerSource.addFeatures(features);
};

/**
 * Shows all features by setting their style.
 * @returns {void}
 */
STALayer.prototype.showAllFeatures = function () {
    const layerSource = this.get("layerSource") instanceof Cluster ? this.get("layerSource").getSource() : this.get("layerSource"),
        collection = layerSource.getFeatures();

    collection.forEach((feature) => {
        const style = this.getStyleAsFunction(this.get("style"));

        feature.setStyle(style(feature));
    });
};

/**
 * Only shows features that match the given ids.
 * @param {String[]} featureIdList List of feature ids.
 * @returns {void}
 */
STALayer.prototype.showFeaturesByIds = function (featureIdList) {
    const layerSource = this.get("layerSource") instanceof Cluster ? this.get("layerSource").getSource() : this.get("layerSource"),
        allLayerFeatures = layerSource.getFeatures(),
        featuresToShow = featureIdList.map(id => layerSource.getFeatureById(id));

    this.hideAllFeatures();
    featuresToShow.forEach(feature => {
        const style = this.getStyleAsFunction(this.get("style"));

        if (feature && feature !== null) {
            feature.set("hideInClustering", false);
            feature.setStyle(style(feature));
        }
    });

    layerSource.addFeatures(allLayerFeatures);
    bridge.resetVectorLayerFeatures(this.get("id"), allLayerFeatures);
};

/**
 * Returns the style as a function.
 * @param {Function|Object} style ol style object or style function.
 * @returns {Function} style as function.
 */
STALayer.prototype.getStyleAsFunction = function (style) {
    if (typeof style === "function") {
        return style;
    }
    return function () {
        return style;
    };
};
/**
 * Sets Style for layer.
 * @returns {void}
 */
STALayer.prototype.styling = function () {
    this.layer.setStyle(this.getStyleAsFunction(this.get("style")));
};

/**
 * Creates features and initializes connections.
 * @returns {void}
 * */
STALayer.prototype.initializeSensorThings = function () {
    /**
     * @deprecated in the next major-release!
     * useProxy
     * getProxyUrl()
     */
    const url = this.get("useProxy") ? getProxyUrl(this.get("url")) : this.get("url");

    try {
        this.createMqttConnectionToSensorThings(url, this.get("mqttOptions"), this.get("timezone"), this.get("showNoDataValue"), this.get("noDataValue"));
    }
    catch (err) {
        console.error("Connecting to mqtt-broker failed. Won't receive live updates. Reason:", err);
    }

    if (typeof this.options.beforeLoading === "function") {
        this.options.beforeLoading();
    }

    bridge.listenToLayerVisibility(this, () => {
        this.toggleSubscriptionsOnMapChanges();
    });
    bridge.listenToIsOutOfRange(this, () => {
        this.toggleSubscriptionsOnMapChanges();
    });
    if (this.get("isVisibleInMap")) {
        this.toggleSubscriptionsOnMapChanges();
    }
};

/**
 * Creates the connection to a given MQTT-Broker.
 * @param {String} url The url to connect with.
 * @param {Object} mqttOptions The configured mqtt options.
 * @param {String} timezone The timezone of Sensors.
 * @param {Boolean} showNoDataValue true if "nodata" value should be shown, false if not.
 * @param {String} noDataValue The value to use for "nodata".
 * @returns {void}
 */
STALayer.prototype.createMqttConnectionToSensorThings = function (url, mqttOptions, timezone, showNoDataValue, noDataValue) {
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
        }, mqttOptions);

    this.mqttClient = new SensorThingsMqtt(options);

    this.mqttClient.on("message", (topic, observation) => {
        const datastreamId = this.getDatastreamIdFromMqttTopic(topic),
            layerSource = this.get("layerSource") instanceof Cluster ? this.get("layerSource").getSource() : this.get("layerSource"),
            features = typeof layerSource.getFeatures === "function" && Array.isArray(layerSource.getFeatures()) ? layerSource.getFeatures() : [],
            feature = this.getFeatureByDatastreamId(features, datastreamId),
            phenomenonTime = this.getLocalTimeFormat(observation.phenomenonTime, timezone);

        this.updateObservationForDatastreams(feature, datastreamId, observation);
        this.updateFeatureProperties(feature, datastreamId, observation.result, phenomenonTime, showNoDataValue, noDataValue, bridge.changeFeatureGFI);
    });
};

/**
 * Extracts the host name from the given url
 * @param {String} url the url to find the host name in
 * @param {Function} onError the function to call errors with
 * @returns {String} the extracted host name
 */
STALayer.prototype.getMqttHostFromUrl = function (url, onError) {
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
};

/**
 * Extracts the datastream id from the given topic.
 * @param {String} topic the topic to extract datastream id from.
 * @returns {String} the found datastream id.
 */
STALayer.prototype.getDatastreamIdFromMqttTopic = function (topic) {
    if (typeof topic !== "string") {
        return "";
    }
    const datastreamIdx = topic.indexOf("Datastreams(");

    if (datastreamIdx === -1) {
        return "";
    }
    return topic.substring(datastreamIdx + 12, topic.indexOf(")", datastreamIdx + 12));
};

/**
 * Getter for feature by a given id.
 * @param {ol/Feature[]} features the features to search through
 * @param {String} id the id to lookup the feature for
 * @returns {ol/Feature} the ol feature with the given id
 */
STALayer.prototype.getFeatureByDatastreamId = function (features, id) {
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
};

/**
 * Initial loading of sensor data
 * @param {Function} onsuccess a function to call on success
 * @fires Core#RadioRequestUtilGetProxyURL
 * @returns {void}
 */
STALayer.prototype.initializeConnection = function (onsuccess) {
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
        const features = this.createFeaturesFromSensorData(sensorData, mapProjection, epsg, gfiTheme, utc),
            layerSource = this.get("layerSource") instanceof Cluster ? this.get("layerSource").getSource() : this.get("layerSource");

        layerSource.clear();

        if (Array.isArray(features) && features.length) {
            layerSource.addFeatures(features);
            if (isObject(features[0]) && typeof features[0].getGeometry === "function" && (features[0].getGeometry().getType() === "Point" || features[0].getGeometry().getType() === "MultiPoint")) {
                this.prepareFeaturesFor3D(features);
            }
            bridge.resetVectorLayerFeatures(this.get("id"), features);
        }

        if (typeof features !== "undefined") {
            this.styling(isClustered);
            this.get("layer").setStyle(this.get("style"));
        }

        features.forEach(feature => bridge.changeFeatureGFI(feature));

        if (typeof onsuccess === "function") {
            onsuccess();
        }
        if (typeof this.options.afterLoading === "function") {
            this.options.afterLoading(features);
        }
    }, error => {
        if (typeof this.options.onLoadingError === "function") {
            this.options.onLoadingError(error);
        }
    });
};

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
STALayer.prototype.callSensorThingsAPI = function (url, version, urlParams, currentExtent, intersect, onsuccess, onerror) {
    const requestUrl = this.buildSensorThingsUrl(url, version, urlParams),
        http = new SensorThingsHttp({
            rootNode: urlParams?.root
        });

    if (!this.get("loadThingsOnlyInCurrentExtent")) {
        http.get(requestUrl, result => {
            if (typeof onsuccess === "function") {
                onsuccess(this.getAllThings(result, urlParams, url, version));
            }
        }, null, null, onerror);
    }
    else {
        http.getInExtent(requestUrl, currentExtent, intersect, result => {
            if (typeof onsuccess === "function") {
                onsuccess(this.getAllThings(result, urlParams, url, version));
            }
        }, null, null, onerror);
    }
};

/**
 * Builds the SensorThings url.
 * @param {String} url the url to the service
 * @param {String} version the version from the service
 * @param {Object} urlParams the url parameters
 * @returns {String} url to request the sensorThings with
 */
STALayer.prototype.buildSensorThingsUrl = function (url, version, urlParams) {
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
};

/**
 * Prepares and Returns all things
 * @param {Object[]} sensordata response of called sensorAPI
 * @param {Object} urlParams The url parameters
 * @param {String} url The url to service
 * @param {String} version The version from service
 * @returns {Object[]} all prepared things
 */
STALayer.prototype.getAllThings = function (sensordata, urlParams, url, version) {
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
};

/**
 * Changes the root in the sensordata from datastream to thing.
 * @param {Object[]} sensordata the sensordata with datastream as root.
 * @param {String[]} datastreamAttributes The datastream attributes.
 * @param {String[]} thingAttributes The thing attributes.
 * @returns {Object[]} The sensordata with things as root.
 */
STALayer.prototype.changeSensordataRootToThings = function (sensordata, datastreamAttributes, thingAttributes) {
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
};

/**
 * Converts elements of an array to keys in an object with value to be true.
 * @param {String[]} array Array with value to convert to an object.
 * @returns {Object} The object with value of the given array as keys.
 */
STALayer.prototype.createAssociationObject = function (array) {
    if (!Array.isArray(array)) {
        return {};
    }
    const associationObject = {};

    array.forEach(key => {
        associationObject[key] = true;
    });

    return associationObject;
};

/**
 * Merge datastreams based on the id of the thing if the ids exist multiple times.
 * @param {Object[]} allThings The sensordata with things as root.
 * @returns {Object[]} The sensordata with merged things as root.
 */
STALayer.prototype.unifyThingsByIds = function (allThings) {
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
};

/**
 * Creates a new array with concatenated sub array elements.
 * @info this is equivalent to Array.flat() - except no addition for testing is needed for this one - Array.flat() is a problem for tests and IE11 - so in sta.js we use the this.flattenArray(arr) function - one flat() was left in sta.js, this is solved now
 * @param {*} arr the array to flatten sub arrays or anything else
 * @returns {*} the flattened array if an array was given, the untouched input otherwise
 */
STALayer.prototype.flattenArray = function (arr) {
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
};

/**
 * Iterates over things and creates attributes for each observed property.
 * @param {Object[]} allThings All things.
 * @param {Boolean} showNoDataValue true if "nodata" value should be shown, false if not
 * @param {String} noDataValue the value to use for "nodata"
 * @param {String} utc utc="+1" UTC-Timezone to calculate correct time.
 * @param {String} timezone name of the sensors origin timezone.
 * @returns {Object[]} All things with the newest observation for each dataStream.
 */
STALayer.prototype.createPropertiesOfDatastreams = function (allThings, showNoDataValue, noDataValue, utc, timezone) {
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
};

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
STALayer.prototype.createPropertiesOfDatastreamsHelper = function (dataStreams, properties, showNoDataValue, noDataValue, utc, timezone) {
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
};

/**
 * Adds data from datastream to the thing with pipe separator.
 * @param {Object} thingProperties The properties from the thing.
 * @param {Object} dataStreamProperties The properties from the dataStream.
 * @returns {Boolean} returns true on success and false if anything went wrong.
 */
STALayer.prototype.moveDatastreamPropertiesToThing = function (thingProperties, dataStreamProperties) {
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
};

/**
 * Returns date and time in clients local format converting utc time to sensors origin timezone.
 * @param {String} phenomenonTime phenomenonTime given by sensor
 * @param {String} timezone name of the sensors origin timezone
 * @see https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
 * @see https://momentjs.com/timezone/docs/
 * @returns {String} A date string based on phenomenonTime and timezone in clients local format or an empty string if an unknown phenomenonTime is given.
 */
STALayer.prototype.getLocalTimeFormat = function (phenomenonTime, timezone) {
    const utcTime = this.getFirstPhenomenonTime(phenomenonTime);

    if (utcTime) {
        return moment(utcTime).tz(timezone).format("LLL");
    }
    return "";
};

/**
 * Some sensors deliver a time interval like "2020-04-02T14:00:01.000Z/2020-04-02T14:15:00.000Z".
 * Other sensors deliver a single time like "2020-04-02T14:00:01.000Z".
 * This function returns the first time given in string. Delimiter is always "/".
 * @param {String} phenomenonTime The phenomenonTime given by sensor
 * @returns {String} The first phenomenonTime
 */
STALayer.prototype.getFirstPhenomenonTime = function (phenomenonTime) {
    if (typeof phenomenonTime !== "string") {
        return undefined;
    }
    else if (phenomenonTime.split("/").length !== 2) {
        return phenomenonTime;
    }

    return phenomenonTime.split("/")[0];
};

/**
 * Aggregates the properties of the things.
 * @param {Object[]} allThings all things
 * @param {String} url The url to service
 * @param {String} version The version from service
 * @returns {Object[]} aggregated things
 */
STALayer.prototype.aggregatePropertiesOfThings = function (allThings, url, version) {
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
};

/**
 * Aggregates the properties of an array of things.
 * @param {Object[]} arrayOfThings the array of things
 * @param {Object} result the thing to add aggregated properties to
 * @returns {Boolean} returns true on success and false if something went wrong
 */
STALayer.prototype.aggregatePropertiesOfThingAsArray = function (arrayOfThings, result) {
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
};

/**
 * Searches the thing for its geometry location.
 * For some reason there are two different object pathes to check.
 * @param {Object} thing the aggregated thing
 * @param {Number} index the index of the location in array Locations
 * @returns {Object} the geometry object or null if none was found
 */
STALayer.prototype.getThingsGeometry = function (thing, index) {
    const locations = thing?.Locations || thing?.Thing?.Locations,
        location = locations && Object.prototype.hasOwnProperty.call(locations, index) && locations[index]?.location ? locations[index].location : null;

    if (location?.geometry && location.geometry?.type) {
        return location.geometry;
    }
    else if (location?.type) {
        return location;
    }

    return null;
};

/**
 * Aggregates the properties of the given keys and joins them by " | ".
 * @param {Object[]} things Array of things to aggregate
 * @param {String[]} keys Keys to aggregate
 * @returns {Object} the aggregated properties
 */
STALayer.prototype.aggregateProperties = function (things, keys) {
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
};

/**
 * Aggregates the properties of one thing.
 * @param {Object} thing the thing to aggregate properties from
 * @param {Object} result the thing to add aggregated properties to
 * @returns {Boolean} returns true on success and false if something went wrong.
 */
STALayer.prototype.aggregatePropertiesOfOneThing = function (thing, result) {
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
};

/**
 * Creates features from given sensor data
 * @param {Object[]} sensorData sensor with location and properties
 * @param {ol/proj/Projection} mapProjection projection of the map
 * @param {String} epsg the epsg of sensortype
 * @param {String|Object} gfiTheme The name of the gfiTheme or an object of gfiTheme
 * @param {String} utc="+1" UTC-Timezone to calculate correct time.
 * @returns {ol/Feature[]} feature to draw
 */
STALayer.prototype.createFeaturesFromSensorData = function (sensorData, mapProjection, epsg, gfiTheme, utc) {
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
};

/**
 * Tries to parse object to ol/format/GeoJson
 * @param {Object} data the object to parse
 * @param {ol/proj/Projection} featureProjection projection of the map
 * @param {String} dataProjection projection of the thing
 * @param {Function} onerror a function(error) to be called on error
 * @returns {ol/Feature} the ol feature
 */
STALayer.prototype.createFeatureByLocation = function (data, featureProjection, dataProjection, onerror) {
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
};

/**
 * Aggregates the value and adds them as property "dataStreamValues".
 * @param {ol/Feature} feature The ol feature.
 * @returns {ol/Feature} The feature with new attribute "dataStreamValues".
 */
STALayer.prototype.aggregateDataStreamValue = function (feature) {
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
};

/**
 * Aggregates the phenomenonTimes and adds them as property "dataStreamPhenomenonTime".
 * @param {ol/Feature} feature The ol feature.
 * @returns {ol/Feature} The feature with new attribute "dataStreamPhenomenonTime".
 */
STALayer.prototype.aggregateDataStreamPhenomenonTime = function (feature) {
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
};

/**
 * Starts or stops subscription according to its conditions.
 * Because of usage of several listeners it's necessary to create a "isSubscribed" flag to prevent multiple executions.
 * @returns {void}
 */
STALayer.prototype.toggleSubscriptionsOnMapChanges = function () {
    const state = this.getStateOfSTALayer(this.get("isOutOfRange"), this.get("isVisibleInMap"), this.get("isSubscribed"));

    if (state === true) {
        this.createLegend();
        this.startSubscription(this.get("layer").getSource().getFeatures());
    }
    else if (state === false) {
        this.stopSubscription();
    }
};

/**
 * Returns the state of the layer based on out of range value, isVisibleInMap and isSubscribed.
 * @param {Boolean} isOutOfRange If map Scale is out of defined layer minScale and maxScale.
 * @param {Boolean} isVisibleInMap If value model is visible or not.
 * @param {Boolean} isSubscribed To prevent multiple executions.
 * @returns {Boolean} true if layer should be subscribed, false if not
 */
STALayer.prototype.getStateOfSTALayer = function (isOutOfRange, isVisibleInMap, isSubscribed) {
    if (!isOutOfRange && isVisibleInMap && !isSubscribed) {
        return true;
    }
    else if ((isOutOfRange || !isVisibleInMap) && isSubscribed) {
        return false;
    }
    return undefined;
};

/**
 * Starts mqtt subscriptions based on the layers state.
 * @param {ol/Feature[]} features all features of the Layer
 * @returns {void}
 */
STALayer.prototype.startSubscription = function (features) {
    this.set("isSubscribed", true);
    if (!this.get("loadThingsOnlyInCurrentExtent") && Array.isArray(features) && !features.length) {
        this.initializeConnection(function () {
            this.updateSubscription();
            store.dispatch("Maps/registerListener", {type: "moveend", listener: this.updateSubscription.bind(this)});
        }.bind(this));
    }
    else {
        this.updateSubscription();
        store.dispatch("Maps/registerListener", {type: "moveend", listener: this.updateSubscription.bind(this)});
    }
};

/**
 * Stops mqtt subscriptions based on the layers state.
 * @returns {void}
 */
STALayer.prototype.stopSubscription = function () {
    const subscriptionTopics = this.get("subscriptionTopics"),
        version = this.get("version"),
        isVisibleInMap = this.get("isVisibleInMap"),
        mqttClient = this.mqttClient;

    this.set("isSubscribed", false);
    store.dispatch("Maps/unregisterListener", {type: "moveend", listener: this.updateSubscription.bind(this)});
    this.unsubscribeFromSensorThings([], subscriptionTopics, version, isVisibleInMap, mqttClient);
};

/**
 * Refreshes all subscriptions by ending all established subscriptions and creating new ones.
 * @returns {void}
 */
STALayer.prototype.updateSubscription = function () {
    const datastreamIds = this.getDatastreamIdsInCurrentExtent(this.get("layer").getSource().getFeatures(), store.getters["Maps/getCurrentExtent"]),
        subscriptionTopics = this.get("subscriptionTopics"),
        version = this.get("version"),
        isVisibleInMap = this.get("isVisibleInMap"),
        mqttClient = this.mqttClient,
        rh = this.get("mqttRh"),
        qos = this.get("mqttQos");

    if (!this.get("loadThingsOnlyInCurrentExtent")) {
        this.unsubscribeFromSensorThings(datastreamIds, subscriptionTopics, version, isVisibleInMap, mqttClient);
        this.subscribeToSensorThings(datastreamIds, subscriptionTopics, version, mqttClient, {rh, qos});
    }
    else {
        this.unsubscribeFromSensorThings(datastreamIds, subscriptionTopics, version, isVisibleInMap, mqttClient);
        this.initializeConnection(() => {
            this.subscribeToSensorThings(
                this.getDatastreamIdsInCurrentExtent(this.get("layer").getSource().getFeatures(), store.getters["Maps/getCurrentExtent"]),
                subscriptionTopics,
                version,
                mqttClient,
                {rh, qos}
            );
        });
    }
};

/**
 * Getter for datastream ids of features in current extent.
 * @param {ol/Feature[]} features the features of this layer
 * @param {ol/extent} currentExtent the current browser extent
 * @returns {String[]} an array containing all datastream ids from this layer in the current extent
 */
STALayer.prototype.getDatastreamIdsInCurrentExtent = function (features, currentExtent) {
    const featuresInExtent = this.getFeaturesInExtent(features, currentExtent);

    return this.getDatastreamIds(featuresInExtent);
};

/**
 * Returns features in enlarged extent (enlarged by a fixed percentage to make sure moving features close to the extent can move into the mapview).
 * @param {ol/Feature[]} features all features
 * @param {ol/extent} currentExtent the current browser extent coordinates
 * @returns {ol/Feature[]} the features in the given extent
 */
STALayer.prototype.getFeaturesInExtent = function (features, currentExtent) {
    const enlargedExtent = this.enlargeExtent(currentExtent, 0.05),
        featuresInExtent = [];

    features.forEach(feature => {
        if (containsExtent(enlargedExtent, feature.getGeometry().getExtent())) {
            featuresInExtent.push(feature);
        }
    });

    return featuresInExtent;
};

/**
 * Enlarges the given extent by the given factor.
 * @param {ol/extent} extent extent to enlarge
 * @param {Number} factor factor to enlarge extent
 * @returns {ol/extent} the enlarged extent
 */
STALayer.prototype.enlargeExtent = function (extent, factor) {
    const bufferAmount = (extent[2] - extent[0]) * factor;

    return buffer(extent, bufferAmount);
};

/**
 * Getter for datastream ids for this layer - using dataStreamId property with expected pipe delimitors.
 * @param {ol/Feature[]} features features with datastream ids or features with features (see clustering) with datastreamids
 * @returns {String[]} an array containing all datastream ids from this layer
 */
STALayer.prototype.getDatastreamIds = function (features) {
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
};

/**
 * Helper function for getDatastreamIds: Pushes the datastream ids into the given array.
 * @param {ol/Feature} feature the feature containing datastream ids
 * @param {String[]} dataStreamIdsArray the array to push the datastream ids into
 * @returns {Boolean} true if the function ran successfull, false if not
 */
STALayer.prototype.getDatastreamIdsHelper = function (feature, dataStreamIdsArray) {
    if (typeof feature?.get !== "function" || typeof feature.get("dataStreamId") !== "string" || !Array.isArray(dataStreamIdsArray)) {
        return false;
    }

    feature.get("dataStreamId").split(" | ").forEach(id => {
        dataStreamIdsArray.push(id);
    });
    return true;
};

/**
 * Unsubscribes from the mqtt client with topics subscribed in the past.
 * @param {String[]} datastreamIdsNotToUnsubscribe an array of datastreamIds as whitelist not to unsubscribe from
 * @param {Object} subscriptionTopics an object of subscribed ids as keys and true/false als value
 * @param {String} version the STA version to use in topic
 * @param {Boolean} isVisibleInMap if the layer is visible
 * @param {Object} mqttClient the mqtt client to use
 * @returns {Boolean} returns true on success and false if something went wrong
 */
STALayer.prototype.unsubscribeFromSensorThings = function (datastreamIdsNotToUnsubscribe, subscriptionTopics, version, isVisibleInMap, mqttClient) {
    if (!Array.isArray(datastreamIdsNotToUnsubscribe) || !isObject(subscriptionTopics) || !isObject(mqttClient)) {
        return false;
    }
    const datastreamIdsAssoc = {};

    datastreamIdsNotToUnsubscribe.forEach(datastreamId => {
        datastreamIdsAssoc[datastreamId] = true;
    });

    Object.entries(subscriptionTopics).forEach(([id, isTopicSubscribed]) => {
        if (isVisibleInMap === false || isVisibleInMap === true && isTopicSubscribed === true && !Object.prototype.hasOwnProperty.call(datastreamIdsAssoc, id)) {
            mqttClient.unsubscribe("v" + version + "/Datastreams(" + id + ")/Observations");
            subscriptionTopics[id] = false;
        }
    });

    return true;
};

/**
 * Subscribes to the mqtt client for the given dataStreamIds.
 * @param {String[]} dataStreamIds an array of dataStreamIds to unsubscribe from
 * @param {Object} subscriptionTopics an object of subscribed ids as keys and true/false als value
 * @param {String} version the STA version to use in topic
 * @param {Object} mqttClient the mqtt client to use
 * @param {Object} mqttSubscribeOptions an object with key rh and qos to subscribe with
 * @returns {Boolean} returns true on success and false if something went wrong
 */
STALayer.prototype.subscribeToSensorThings = function (dataStreamIds, subscriptionTopics, version, mqttClient, mqttSubscribeOptions = {}) {
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
};

/**
 * Updates the datastreams of the given feature with received time and result of the observation.
 * @param {ol/Feature} feature feature to be updated
 * @param {String} dataStreamId the datastream id
 * @param {Object} observation the observation to update the old observation with
 * @returns {void}
 */
STALayer.prototype.updateObservationForDatastreams = function (feature, dataStreamId, observation) {
    if (typeof feature?.get !== "function" || !Array.isArray(feature.get("Datastreams"))) {
        return;
    }

    feature.get("Datastreams").forEach(datastream => {
        if (typeof datastream["@iot.id"] !== "undefined" && String(datastream["@iot.id"]) === String(dataStreamId)) {
            datastream.Observations = [observation];
        }
    });
};

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
STALayer.prototype.updateFeatureProperties = function (feature, dataStreamId, result, phenomenonTime, showNoDataValue, noDataValue, funcChangeFeatureGFI) {
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
};

/**
 * Replaces a value of a piped property using dataStreamId to locate the right position in the piped property.
 * @param {ol/Feature} feature the feature with properties
 * @param {String} property the property to be updated
 * @param {String} dataStreamId the datastream id
 * @param {String} value the new value
 * @returns {String} the updated property
 */
STALayer.prototype.replaceValueInPipedProperty = function (feature, property, dataStreamId, value) {
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
};

/**
 * Replaces a value in the given array by the position of an id in an array with referenced ids.
 * @param {String[]} result the result to change the value at the position where reference is found in referenceArray
 * @param {String[]} referenceArray the array to find the position in result to replace the value with
 * @param {String} reference the value to find the position in referenceArray
 * @param {String} value the value to replace the value in result found at position with
 * @returns {Boolean} true if the function ran successfull, false if not
 */
STALayer.prototype.replaceValueInArrayByReference = function (result, referenceArray, reference, value) {
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
};
