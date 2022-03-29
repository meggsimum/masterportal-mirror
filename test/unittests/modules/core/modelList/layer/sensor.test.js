import SensorLayerModel from "@modules/core/modelList/layer/sensor.js";
import * as moment from "moment";
import Feature from "ol/Feature.js";
import Point from "ol/geom/Point.js";
import LineString from "ol/geom/LineString";
import {expect} from "chai";
import VectorLayer from "ol/layer/Vector.js";
import {Vector as VectorSource} from "ol/source.js";
import sinon from "sinon";
import mapCollection from "../../../../../../src/core/dataStorage/mapCollection";

describe("core/modelList/layer/sensor", function () {
    let sensorLayer;

    before(() => {
        mapCollection.clear();
        mapCollection.addMap({
            id: "ol",
            mode: "2D",
            registerListener: sinon.spy(),
            unregisterListener: sinon.spy()
        }, "ol", "2D");

        sensorLayer = new SensorLayerModel();
        sensorLayer.set("url", "test/test/test", {silent: true});

        sensorLayer.set("url", "test/test/test", {silent: true});

        moment.locale("de");

        sinon.stub(Radio, "request").callsFake(function (channel, topic) {
            if (channel === "MapView" && topic === "getCurrentExtent") {
                return [100, 100, 200, 200];
            }
            else if (channel === "MapView" && topic === "getProjection") {
                return "EPSG:25832";
            }
            else if (channel === "Map" && topic === "registerListener") {
                return {"key": "test"};
            }

            return null;
        });
    });

    after(function () {
        sinon.restore();
    });

    describe("initialize", function () {
        it("ol/layer is not declared on startup", function () {
            expect(sensorLayer.get("layer")).to.be.undefined;
        });

        it("expect to set httpSubFolder from url on initialize", function () {
            sensorLayer.set("url", "http://example.com/foo/bar", {silent: true});
            sensorLayer.initialize();

            expect(sensorLayer.get("httpSubFolder")).to.equal("/foo/bar");
        });
    });

    describe("buildSensorThingsUrl", function () {
        it("should return an url as string for a specific input", function () {
            const testUrl = "https://www.example.com:1234/foo/bar",
                testVersion = "1.1",
                testUrlParams = {
                    "baz": 1234,
                    "qux": "foobar"
                },
                expectedOutput = "https://www.example.com:1234/foo/bar/v1.1/Things?$baz=1234&$qux=foobar";

            expect(sensorLayer.buildSensorThingsUrl(testUrl, testVersion, testUrlParams)).to.equal(expectedOutput);
        });
        it("should return an url with datastreams as root", function () {
            const testUrl = "https://www.example.com:1234/foo/bar",
                testVersion = "1.1",
                testUrlParams = {
                    "filter": "fi",
                    "expand": "ex",
                    "root": "Datastreams"
                },
                expectedOutput = "https://www.example.com:1234/foo/bar/v1.1/Datastreams?$filter=fi&$expand=ex";

            expect(sensorLayer.buildSensorThingsUrl(testUrl, testVersion, testUrlParams)).to.equal(expectedOutput);
        });
        it("should return an url as string for a specific input including nested urlParams", function () {
            const testUrl = "https://www.example.com:1234/foo/bar",
                testVersion = "1.1",
                testUrlParams = {
                    "baz": 1234,
                    "qux": [
                        "subParamA",
                        "subParamB",
                        "subParamC"
                    ]
                },
                expectedOutput = "https://www.example.com:1234/foo/bar/v1.1/Things?$baz=1234&$qux=subParamA,subParamB,subParamC";

            expect(sensorLayer.buildSensorThingsUrl(testUrl, testVersion, testUrlParams)).to.equal(expectedOutput);
        });

        it("should return an url without query if no params as object are given", function () {
            const testUrl = "https://www.example.com:1234/foo/bar",
                testVersion = "1.1",
                expectedOutput = "https://www.example.com:1234/foo/bar/v1.1/Things?";

            expect(sensorLayer.buildSensorThingsUrl(testUrl, testVersion, false)).to.equal(expectedOutput);
            expect(sensorLayer.buildSensorThingsUrl(testUrl, testVersion, undefined)).to.equal(expectedOutput);
            expect(sensorLayer.buildSensorThingsUrl(testUrl, testVersion, null)).to.equal(expectedOutput);
            expect(sensorLayer.buildSensorThingsUrl(testUrl, testVersion, "baz")).to.equal(expectedOutput);
            expect(sensorLayer.buildSensorThingsUrl(testUrl, testVersion, 12345)).to.equal(expectedOutput);
            expect(sensorLayer.buildSensorThingsUrl(testUrl, testVersion, [])).to.equal(expectedOutput);
            expect(sensorLayer.buildSensorThingsUrl(testUrl, testVersion, {})).to.equal(expectedOutput);
        });
        it("should eat any url possible without checking its target or syntax", function () {
            const testUrlParams = {
                "foo": "bar"
            };

            expect(sensorLayer.buildSensorThingsUrl("", "1.1", testUrlParams)).to.equal("/v1.1/Things?$foo=bar");
            expect(sensorLayer.buildSensorThingsUrl("http://", "1.1", testUrlParams)).to.equal("http:///v1.1/Things?$foo=bar");
            expect(sensorLayer.buildSensorThingsUrl("wfs://baz", "1.1", testUrlParams)).to.equal("wfs://baz/v1.1/Things?$foo=bar");
            expect(sensorLayer.buildSensorThingsUrl("foobar://baz////", "1.1", testUrlParams)).to.equal("foobar://baz/////v1.1/Things?$foo=bar");
        });
        it("should take any version as string unchecked", function () {
            expect(sensorLayer.buildSensorThingsUrl("", "1.1", false)).to.equal("/v1.1/Things?");
            expect(sensorLayer.buildSensorThingsUrl("", "foo", false)).to.equal("/vfoo/Things?");
            expect(sensorLayer.buildSensorThingsUrl("", "foo.bar.baz", false)).to.equal("/vfoo.bar.baz/Things?");
        });
        it("should take any version as number fixed to one decimal number", function () {
            expect(sensorLayer.buildSensorThingsUrl("", 0.5, false)).to.equal("/v0.5/Things?");
            expect(sensorLayer.buildSensorThingsUrl("", 0.55, false)).to.equal("/v0.6/Things?");
            expect(sensorLayer.buildSensorThingsUrl("", 0.00000001, false)).to.equal("/v0.0/Things?");
            expect(sensorLayer.buildSensorThingsUrl("", 999999.9999999, false)).to.equal("/v1000000.0/Things?");
        });
        it("should stringify any given parameter for url and version - no matter what", function () {
            const testUrlParams = {
                "foo": "bar"
            };

            expect(sensorLayer.buildSensorThingsUrl(undefined, undefined, testUrlParams)).to.equal("undefined/vundefined/Things?$foo=bar");
            expect(sensorLayer.buildSensorThingsUrl(null, null, testUrlParams)).to.equal("null/vnull/Things?$foo=bar");
            expect(sensorLayer.buildSensorThingsUrl([], [], testUrlParams)).to.equal("/v/Things?$foo=bar");
            expect(sensorLayer.buildSensorThingsUrl({}, {}, testUrlParams)).to.equal("[object Object]/v[object Object]/Things?$foo=bar");
        });
    });

    describe("getFirstPhenomenonTime", function () {
        it("should return undefined", function () {
            expect(sensorLayer.getFirstPhenomenonTime(undefined)).to.be.undefined;
            expect(sensorLayer.getFirstPhenomenonTime({})).to.be.undefined;
        });
        it("should return time", function () {
            expect(sensorLayer.getFirstPhenomenonTime("2020-04-02T14:00:01.100Z")).to.equal("2020-04-02T14:00:01.100Z");
        });
        it("should return first time if interval is given", function () {
            expect(sensorLayer.getFirstPhenomenonTime("2020-04-02T14:00:01.100Z/2020-04-02T14:15:00.000Z")).to.equal("2020-04-02T14:00:01.100Z");
        });
    });

    describe("getLocalTimeFormat", function () {
        it("should return an empty for undefined input", function () {
            expect(sensorLayer.getLocalTimeFormat(undefined, undefined)).that.have.string("");
        });
        it("should return an empty  string for undefined phenomenontime and utc +1", function () {
            expect(sensorLayer.getLocalTimeFormat(undefined, "Europe/Berlin")).that.have.string("");
        });
        it("should return an string in summertime", function () {
            const summerTime = "2018-06-05T12:11:47.922Z";

            expect(sensorLayer.getLocalTimeFormat(summerTime, "Europe/Berlin")).to.have.string("5. Juni 2018 14:11");
        });
        it("should return an string in wintertime", function () {
            const winterTime = "2018-01-01T12:11:47.922Z";

            expect(sensorLayer.getLocalTimeFormat(winterTime, "Europe/Berlin")).to.have.string("1. Januar 2018 13:11");
        });
    });

    describe("parseDatastreams", function () {
        it("should return an object[] with Thing data in the root and datastream data in the second level", function () {
            const sensordata = [
                    {
                        "@iot.id": 10492,
                        "@iot.selfLink": "https://sensorUrlTest",
                        "Observations": [
                            {
                                "@iot.id": 123,
                                "result": "testResult",
                                "phenomenonTime": "2021-01-22T05:11:31.222Z"
                            }
                        ],
                        "description": "Lalala",
                        "name": "abc",
                        Thing: {
                            "@iot.id": 999,
                            "name": "Thing",
                            "properties": {
                                "requestUrl": "https:sensorTestUrl"
                            },
                            Locations: [
                                {
                                    "@iot.id": 777,
                                    "name": "location"
                                }
                            ]
                        }
                    }
                ],
                datastreamAttributes = [
                    "@iot.id",
                    "@iot.selfLink",
                    "Observations",
                    "description",
                    "name"
                ],
                thingAttributes = [
                    "@iot.id",
                    "Locations",
                    "name",
                    "properties"
                ],
                parseDatastreams = sensorLayer.parseDatastreams(sensordata, datastreamAttributes, thingAttributes);

            expect(parseDatastreams).to.be.an("array");
            expect(parseDatastreams.length).equals(1);
            expect(parseDatastreams).to.deep.nested.include(
                {
                    "@iot.id": 999,
                    "name": "Thing",
                    "properties": {
                        "requestUrl": "https:sensorTestUrl"
                    },
                    Locations: [
                        {
                            "@iot.id": 777,
                            "name": "location"
                        }
                    ],
                    Datastreams: [
                        {
                            "@iot.id": 10492,
                            "@iot.selfLink": "https://sensorUrlTest",
                            "Observations": [
                                {
                                    "@iot.id": 123,
                                    "result": "testResult",
                                    "phenomenonTime": "2021-01-22T05:11:31.222Z"
                                }
                            ],
                            "description": "Lalala",
                            "name": "abc"
                        }
                    ]
                }
            );
        });
    });

    describe("mergeDatastreamsByThingId", function () {
        it("should return a thing array with merged datastreams", function () {
            const sensordata = [{
                    "@iot.id": 999,
                    "name": "Thing",
                    "properties": {
                        "requestUrl": "https:sensorTestUrl"
                    },
                    Locations: [
                        {
                            "@iot.id": 777,
                            "name": "location"
                        }
                    ],
                    Datastreams: [
                        {
                            "@iot.id": 10492,
                            "@iot.selfLink": "https://sensorUrlTest",
                            "Observations": [
                                {
                                    "@iot.id": 123,
                                    "result": "testResult",
                                    "phenomenonTime": "2021-01-22T05:11:31.222Z"
                                }
                            ],
                            "description": "Lalala",
                            "name": "abc"
                        }
                    ]
                },
                {
                    "@iot.id": 999,
                    "name": "Thing",
                    "properties": {
                        "requestUrl": "https:sensorTestUrl"
                    },
                    Locations: [
                        {
                            "@iot.id": 777,
                            "name": "location"
                        }
                    ],
                    Datastreams: [
                        {
                            "@iot.id": 10493,
                            "@iot.selfLink": "https://sensorUrlTest1",
                            "Observations": [
                                {
                                    "@iot.id": 456,
                                    "result": "testResult",
                                    "phenomenonTime": "2021-01-22T05:11:31.222Z"
                                }
                            ],
                            "description": "Lalala",
                            "name": "abc"
                        }
                    ]
                }],
                uniqueIds = [999],
                parseDatastreams = sensorLayer.mergeDatastreamsByThingId(sensordata, uniqueIds);

            expect(parseDatastreams).to.be.an("array");
            expect(parseDatastreams.length).equals(1);
            expect(parseDatastreams).to.deep.nested.include(
                {
                    "@iot.id": 999,
                    "name": "Thing",
                    "properties": {
                        "requestUrl": "https:sensorTestUrl"
                    },
                    Locations: [
                        {
                            "@iot.id": 777,
                            "name": "location"
                        }
                    ],
                    Datastreams: [
                        {
                            "@iot.id": 10492,
                            "@iot.selfLink": "https://sensorUrlTest",
                            "Observations": [
                                {
                                    "@iot.id": 123,
                                    "result": "testResult",
                                    "phenomenonTime": "2021-01-22T05:11:31.222Z"
                                }
                            ],
                            "description": "Lalala",
                            "name": "abc"
                        },
                        {
                            "@iot.id": 10493,
                            "@iot.selfLink": "https://sensorUrlTest1",
                            "Observations": [
                                {
                                    "@iot.id": 456,
                                    "result": "testResult",
                                    "phenomenonTime": "2021-01-22T05:11:31.222Z"
                                }
                            ],
                            "description": "Lalala",
                            "name": "abc"
                        }
                    ]
                }
            );
        });
    });

    describe("createFeatures", function () {
        it("should return an empty array for empty array input", function () {
            expect(sensorLayer.createFeatures([], undefined)).to.be.an("array").that.is.empty;
        });
        it("should return an empty array for undefined input", function () {
            expect(sensorLayer.createFeatures(undefined, undefined)).to.be.an("array").that.is.empty;
        });
        it("should return an empty array for obj and undefined epsg input", function () {
            const data = [{location: [10, 10]}];

            expect(sensorLayer.createFeatures(data, undefined)).to.be.an("array").that.is.empty;
        });
    });
    describe("getFeatureByDataStreamId", function () {
        it("should return undefined on undefined inputs", function () {
            expect(sensorLayer.getFeatureByDataStreamId(undefined, undefined)).to.be.undefined;
        });
        it("should return undefined on undefined array", function () {
            expect(sensorLayer.getFeatureByDataStreamId(undefined, "1")).to.be.undefined;
        });
        it("should return undefined on empty array and undefined datastreamid", function () {
            expect(sensorLayer.getFeatureByDataStreamId([], undefined)).to.be.undefined;
        });
        it("should return undefined on empty array", function () {
            expect(sensorLayer.getFeatureByDataStreamId([], "1")).to.be.undefined;
        });
        it("should return a Feature", function () {
            const feature0 = new Feature({
                    dataStreamId: "1",
                    geometry: new Point([100, 100])
                }),
                feature1 = new Feature({
                    dataStreamId: "2",
                    geometry: new Point([100, 100])
                }),
                features = [feature0, feature1];

            expect(sensorLayer.getFeatureByDataStreamId(features, "1")).to.be.an.instanceof(Feature);
        });
        it("should return a Feature with combined dataStreamId", function () {
            const feature0 = new Feature({
                    dataStreamId: "1",
                    geometry: new Point([100, 100])
                }),
                feature1 = new Feature({
                    dataStreamId: "2 | 3",
                    geometry: new Point([100, 100])
                }),
                features = [feature0, feature1];

            expect(sensorLayer.getFeatureByDataStreamId(features, "3")).to.be.an.instanceof(Feature);
        });
    });
    describe("getDataStreamIds", function () {
        it("should return a empty array for undefined input", function () {
            expect(sensorLayer.getDataStreamIds(undefined)).to.be.an("array").that.is.empty;
        });
        it("should return an array with Strings for features input", function () {
            const feature0 = new Feature({
                    geometry: new Point([100, 100])
                }),
                feature1 = new Feature({
                    geometry: new Point([100, 100])
                }),
                features = [feature0, feature1];

            expect(sensorLayer.getDataStreamIds(features)).to.be.an("array").that.includes("", "");
        });
    });
    describe("aggregateDataStreamValue", function () {
        it("should return undefined for undefined input", function () {
            expect(sensorLayer.aggregateDataStreamValue(undefined)).to.be.undefined;
        });
        it("should return feature as is", function () {
            const feature = new Feature({
                geometry: new Point([100, 100])
            });

            expect(sensorLayer.aggregateDataStreamValue(feature)).to.be.instanceof(Feature);
        });
        it("should return feature with dataStreamValue for one dataStream", function () {
            const feature = new Feature({
                dataStreamId: "123",
                dataStreamName: "ds",
                dataStream_123_ds: "a",
                geometry: new Point([100, 100])
            });

            expect(sensorLayer.aggregateDataStreamValue(feature)).to.be.instanceof(Feature);
            expect(sensorLayer.aggregateDataStreamValue(feature).get("dataStreamValue")).to.equal("a");
        });
        it("should return feature with dataStreamValue for more dataStreams", function () {
            const feature = new Feature({
                dataStreamId: "123 | 456",
                dataStreamName: "ds1 | ds2",
                dataStream_123_ds1: "a",
                dataStream_456_ds2: "b",
                geometry: new Point([100, 100])
            });

            expect(sensorLayer.aggregateDataStreamValue(feature)).to.be.instanceof(Feature);
            expect(sensorLayer.aggregateDataStreamValue(feature).get("dataStreamValue")).to.equal("a | b");
        });
    });

    describe("aggregateDataStreamPhenomenonTime", function () {
        it("should return undefined for undefined input", function () {
            expect(sensorLayer.aggregateDataStreamPhenomenonTime(undefined)).to.be.undefined;
        });
        it("should return feature as is", function () {
            const feature = new Feature({
                geometry: new Point([100, 100])
            });

            expect(sensorLayer.aggregateDataStreamPhenomenonTime(feature)).to.be.instanceof(Feature);
        });
        it("should return feature with dataStreamPhenomenonTime for one dataStream", function () {
            const feature = new Feature({
                dataStreamId: "123",
                dataStreamName: "ds",
                dataStream_123_ds_phenomenonTime: "a",
                geometry: new Point([100, 100])
            });

            expect(sensorLayer.aggregateDataStreamPhenomenonTime(feature)).to.be.instanceof(Feature);
            expect(sensorLayer.aggregateDataStreamPhenomenonTime(feature).get("dataStreamPhenomenonTime")).to.equal("a");
        });
        it("should return feature with dataStreamPhenomenonTime for more dataStreams", function () {
            const feature = new Feature({
                dataStreamId: "123 | 456",
                dataStreamName: "ds1 | ds2",
                dataStream_123_ds1_phenomenonTime: "a",
                dataStream_456_ds2_phenomenonTime: "b",
                geometry: new Point([100, 100])
            });

            expect(sensorLayer.aggregateDataStreamPhenomenonTime(feature)).to.be.instanceof(Feature);
            expect(sensorLayer.aggregateDataStreamPhenomenonTime(feature).get("dataStreamPhenomenonTime")).to.equal("a | b");
        });
    });

    describe("excludeDataStreamKeys", function () {
        it("should return undefined for undefined input", function () {
            expect(sensorLayer.excludeDataStreamKeys(undefined, undefined)).to.be.undefined;
        });
        it("should return empty array for empty keys", function () {
            expect(sensorLayer.excludeDataStreamKeys([], "test_")).to.be.an("array").that.is.empty;
        });
        it("should return empty array for empty string", function () {
            expect(sensorLayer.excludeDataStreamKeys(["test_1", "test_2"], "")).to.be.undefined;
        });
        it("should return empty array with only one key", function () {
            expect(sensorLayer.excludeDataStreamKeys(["test_1", "test_2", "hello"], "test_")).to.deep.equal(["hello"]);
        });
    });

    describe("enlargeExtent", function () {
        it("should return correctly enlarged extent", function () {
            expect(sensorLayer.enlargeExtent([100, 100, 200, 200], 0.1)).to.be.an("array").to.have.ordered.members([90, 90, 210, 210]);
        });
        it("should return correctly reduced extent", function () {
            expect(sensorLayer.enlargeExtent([100, 100, 200, 200], -0.1)).to.be.an("array").to.have.ordered.members([110, 110, 190, 190]);
        });
    });

    describe("getFeaturesInExtent", function () {
        it("should return no feature within extent", function () {
            sensorLayer.setLayer(new VectorLayer({
                source: new VectorSource(),
                name: "test",
                typ: "SensorThings",
                id: "123"
            }));
            sensorLayer.set("layerSource", sensorLayer.get("layer").getSource(), {silent: true});

            sensorLayer.get("layer").getSource().addFeatures([new Feature({
                geometry: new Point([50, 50])
            })]);

            expect(sensorLayer.getFeaturesInExtent()).to.be.an("array").that.is.empty;
        });

        it("should return only one feature within extent", function () {
            sensorLayer.get("layer").getSource().addFeatures([new Feature({
                geometry: new Point([150, 150])
            })]);

            expect(sensorLayer.getFeaturesInExtent()).to.be.an("array").to.have.lengthOf(1);
        });

        it("should also return a feature inside enlarged extent", function () {
            sensorLayer.get("layer").getSource().addFeatures([new Feature({
                geometry: new Point([201, 201])
            })]);

            expect(sensorLayer.getFeaturesInExtent()).to.be.an("array").to.have.lengthOf(2);
        });
    });

    describe("checkConditionsForSubscription", function () {
        it("should be undefined on startup", function () {
            expect(sensorLayer.checkConditionsForSubscription()).to.be.undefined;
            expect(sensorLayer.get("isSubscribed")).to.be.false;
        });

        it("should be true when inRange and selected", function () {
            sensorLayer.set("isOutOfRange", false, {silent: true});
            sensorLayer.set("isSelected", true, {silent: true});
            expect(sensorLayer.checkConditionsForSubscription()).to.be.true;
        });

        it("should be false when out of range", function () {
            sensorLayer.set("isOutOfRange", true, {silent: true});
            sensorLayer.set("isSelected", true, {silent: true});
            sensorLayer.set("isSubscribed", true, {silent: true});
            expect(sensorLayer.checkConditionsForSubscription()).to.be.false;
        });

        it("should be false when unselected", function () {
            sensorLayer.set("isOutOfRange", false, {silent: true});
            sensorLayer.set("isSelected", false, {silent: true});
            expect(sensorLayer.checkConditionsForSubscription()).to.be.false;
        });
    });

    describe("changedConditions", function () {
        it("should set moveendListener", function () {
            sensorLayer.set("mqttClient", {
                subscribe: function () {
                    return false;
                },
                unsubscribe: function () {
                    return false;
                }
            }, {silent: true});

            sensorLayer.set("isSubscribed", false, {silent: true});
            sensorLayer.set("isOutOfRange", false, {silent: true});
            sensorLayer.set("isSelected", true, {silent: true});
            sensorLayer.changedConditions();
            expect(sensorLayer.get("moveendListener")).to.not.be.null;
        });

        it("should unset moveendListener", function () {
            sensorLayer.set("isSubscribed", true, {silent: true});
            sensorLayer.set("isOutOfRange", true, {silent: true});
            sensorLayer.set("isSelected", true, {silent: true});
            sensorLayer.changedConditions();
            expect(sensorLayer.get("moveendListener")).to.be.null;
        });
    });

    describe("subscribeToSensorThings", function () {
        let topics = [];
        const feature0 = new Feature({
                dataStreamId: "1",
                geometry: new Point([100, 100])
            }),
            feature1 = new Feature({
                dataStreamId: "2 | 3",
                geometry: new Point([100, 100])
            }),
            features = [feature0, feature1];

        it("should subscribe on a topic", function () {
            sensorLayer.get("layerSource").addFeatures(features);

            topics = [];
            sensorLayer.set("mqttClient", {
                subscribe: function (topic) {
                    topics.push(topic);
                }
            }, {silent: true});

            sensorLayer.set("subscriptionTopics", {}, {silent: true});
            sensorLayer.subscribeToSensorThings();

            expect(topics).to.deep.equal([
                "v1.1/Datastreams(1)/Observations",
                "v1.1/Datastreams(2)/Observations",
                "v1.1/Datastreams(3)/Observations"
            ]);
        });
        it("should not subscribe on a topic that has already been subscribed", function () {
            topics = [];
            sensorLayer.set("mqttClient", {
                subscribe: function (topic) {
                    topics.push(topic);
                }
            }, {silent: true});

            sensorLayer.set("subscriptionTopics", {
                "1": true,
                "2": true,
                "3": true
            }, {silent: true});
            sensorLayer.subscribeToSensorThings();

            expect(topics).to.be.empty;
        });
    });

    describe("unsubscribeFromSensorThings", function () {
        let topics = [];

        it("should unsubscribe from a topic", function () {
            topics = [];
            sensorLayer.set("mqttClient", {
                unsubscribe: function (topic) {
                    topics.push(topic);
                }
            }, {silent: true});

            sensorLayer.set("subscriptionTopics", {"foo": true}, {silent: true});
            sensorLayer.unsubscribeFromSensorThings();

            expect(topics).to.deep.equal(["v1.1/Datastreams(foo)/Observations"]);
        });
        it("should not unsubscribe from a topic that is already unsubscribed", function () {
            topics = [];
            sensorLayer.set("mqttClient", {
                unsubscribe: function (topic) {
                    topics.push(topic);
                }
            }, {silent: true});

            sensorLayer.set("subscriptionTopics", {"foo": false}, {silent: true});
            sensorLayer.unsubscribeFromSensorThings();

            expect(topics).to.be.empty;
        });
    });

    describe("updateObservationForDatastreams", function () {
        const feature = new Feature({
            Datastreams: [{
                "@iot.id": "foo",
                Observations: []
            }, {
                "@iot.id": "bar",
                Observations: []
            }]
        });

        it("should add the given observation to the property Datastreams where the datastream id equals the given datastream id", function () {
            sensorLayer.updateObservationForDatastreams(feature, "foo", "qox");

            expect(feature.get("Datastreams")[0].Observations).to.deep.equal(["qox"]);
            expect(feature.get("Datastreams")[1].Observations).to.be.empty;
        });
    });

    describe("getJsonGeometry", function () {
        it("should return the location in geometry", function () {
            const testObject = {
                Locations: [
                    {
                        location: {
                            geometry: {
                                type: "Point",
                                test: "Test"
                            }
                        }
                    }
                ]
            };

            expect(sensorLayer.getJsonGeometry(testObject, 0)).to.be.an("object").to.include({test: "Test"});
            expect(sensorLayer.getJsonGeometry(testObject, 1)).to.be.null;
        });
        it("should return the location without geometry", function () {
            const testObject2 = {
                Locations: [
                    {
                        location: {
                            type: "Point",
                            test: "Test"
                        }
                    }
                ]
            };

            expect(sensorLayer.getJsonGeometry(testObject2, 0)).to.be.an("object").to.include({test: "Test"});
            expect(sensorLayer.getJsonGeometry(testObject2, 1)).to.be.null;
        });
    });

    describe("parseJson", function () {
        it("should parse point object", function () {
            const obj = {
                "type": "Point",
                "coordinates": [10.210913, 53.488449]
            };

            sensorLayer.set("epsg", "EPSG:4326", {silent: true});
            expect(sensorLayer.parseJson(obj)).to.be.an.instanceof(Feature);
            expect(sensorLayer.parseJson(obj).getGeometry()).to.be.an.instanceof(Point);
        });
    });

    describe("parseJson", function () {
        it("should parse line object", function () {
            const obj = {
                "type": "LineString",
                "coordinates": [[10.210913, 53.488449], [11.210913, 54.488449]]
            };

            sensorLayer.set("epsg", "EPSG:4326", {silent: true});
            expect(sensorLayer.parseJson(obj)).to.be.an.instanceof(Feature);
            expect(sensorLayer.parseJson(obj).getGeometry()).to.be.an.instanceof(LineString);
        });
    });

    describe("aggregatePropertiesOfThings", function () {
        it("should set one Thing in a simple way without aggregation", function () {
            const allThings = [
                    {
                        "@iot.id": "quix",
                        name: "foo",
                        description: "bar",
                        properties: {
                            "baz": "qux"
                        },
                        Locations: [{
                            location: {
                                type: "Feature",
                                geometry: {
                                    type: "Point",
                                    coordinates: [1, 2, 3]
                                }
                            }
                        }],
                        Datastreams: [{"foobar": 1}]
                    }
                ],
                expectedOutcome = [{
                    location: {
                        type: "Point",
                        coordinates: [1, 2, 3]
                    },
                    properties: {
                        baz: "qux",
                        name: "foo",
                        description: "bar",
                        "@iot.id": "quix",
                        requestUrl: "http://example.com",
                        versionUrl: "1.1",
                        Datastreams: [{"foobar": 1}]
                    }
                }];

            sensorLayer.set("url", "http://example.com", {silent: true});
            sensorLayer.set("version", "1.1", {silent: true});

            expect(sensorLayer.aggregatePropertiesOfThings(allThings)).to.deep.equal(expectedOutcome);
        });
        it("should aggregate Things if there is more than one thing", function () {
            const allThings = [[
                    {
                        "@iot.id": "quix",
                        name: "foo",
                        description: "bar",
                        properties: {
                            "baz": "qux"
                        },
                        Locations: [{
                            location: {
                                type: "Point",
                                coordinates: [3, 4, 5]
                            }
                        }],
                        Datastreams: [{"foobar": 10}]
                    },
                    {
                        "@iot.id": "xiuq",
                        name: "oof",
                        description: "rab",
                        properties: {
                            "baz": "xuq"
                        },
                        Locations: [{
                            location: {
                                type: "Feature",
                                geometry: {
                                    type: "Point",
                                    coordinates: [3, 4, 5]
                                }
                            }
                        }],
                        Datastreams: [{"foobar": 11}]
                    }
                ]],
                expectedOutcome = [{
                    location: {
                        type: "Point",
                        coordinates: [3, 4, 5]
                    },
                    properties: {
                        Datastreams: [{"foobar": 10}, {"foobar": 11}],
                        baz: "qux | xuq",
                        name: "foo | oof",
                        description: "bar | rab",
                        "@iot.id": "quix | xiuq",
                        requestUrl: "http://example.com",
                        versionUrl: "1.1"
                    }
                }];

            sensorLayer.set("url", "http://example.com", {silent: true});
            sensorLayer.set("version", "1.1", {silent: true});

            expect(sensorLayer.aggregatePropertiesOfThings(allThings)).to.deep.equal(expectedOutcome);
        });
    });
    describe("flattenArray", function () {
        it("should return flattened array", function () {
            expect(sensorLayer.flattenArray([["1", "2"], ["3"], ["4"]])).to.deep.equal(["1", "2", "3", "4"]);
        });
        it("should return empty array on empty array input", function () {
            expect(sensorLayer.flattenArray([])).to.deep.equal([]);
        });
        it("should return empty array on undefined input", function () {
            expect(sensorLayer.flattenArray(undefined)).to.be.undefined;
        });
        it("should return empty array on other input", function () {
            expect(sensorLayer.flattenArray(123)).to.equal(123);
            expect(sensorLayer.flattenArray("123")).to.equal("123");
            expect(sensorLayer.flattenArray({id: "123"})).to.deep.equal({id: "123"});
        });
    });

    describe("createAssociationObject", function () {
        it("should return an empty object for empty arry as input", function () {
            expect(sensorLayer.createAssociationObject([])).to.deep.equal({});
        });
        it("should return an object with values from input array as keys", function () {
            const array = [
                "Test",
                "Sensor",
                "Iot"
            ];

            expect(sensorLayer.createAssociationObject(array)).to.deep.equal({
                Test: true,
                Sensor: true,
                Iot: true
            });
        });
    });
});
