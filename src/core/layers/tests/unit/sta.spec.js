import VectorSource from "ol/source/Vector.js";
import VectorLayer from "ol/layer/Vector.js";
import Cluster from "ol/source/Cluster.js";
import Feature from "ol/Feature.js";
import Point from "ol/geom/Point.js";
import {expect} from "chai";
import sinon from "sinon";
import STALayer from "../../sta";
import store from "../../../../app-store";

describe("src/core/layers/sta.js", () => {
    const consoleWarn = console.warn;
    let attributes,
        sensorLayer;

    before(() => {
        mapCollection.clear();
        const map = {
            id: "ol",
            mode: "2D",
            addInteraction: sinon.stub(),
            removeInteraction: sinon.stub(),
            addLayer: () => sinon.stub(),
            getView: () => {
                return {
                    getResolutions: () => [2000, 1000]
                };
            }
        };

        mapCollection.clear();
        mapCollection.addMap(map, "2D");
        i18next.init({
            lng: "cimode",
            debug: false
        });
    });
    beforeEach(() => {
        attributes = {
            url: "https://url.de",
            name: "staTestLayer",
            id: "id",
            typ: "SensorThings",
            version: "1.1",
            gfiTheme: "gfiTheme",
            isChildLayer: false,
            transparent: false,
            isSelected: false
        };
        store.getters = {
            treeType: "custom"
        };
        sensorLayer = new STALayer(attributes);
        console.warn = sinon.stub();
    });

    afterEach(() => {
        sinon.restore();
        console.warn = consoleWarn;
    });

    describe("createLayer", () => {
        it("should create an ol.VectorLayer with source and style", () => {
            const staLayer = new STALayer(attributes),
                layer = staLayer.get("layer");

            expect(layer).to.be.an.instanceof(VectorLayer);
            expect(layer.getSource()).to.be.an.instanceof(VectorSource);
            expect(typeof layer.getStyleFunction()).to.be.equals("function");
            expect(layer.get("id")).to.be.equals(attributes.id);
            expect(layer.get("name")).to.be.equals(attributes.name);
            expect(layer.get("gfiTheme")).to.be.equals(attributes.gfiTheme);
        });
        it("createLayer shall create an ol.VectorLayer with cluster-source", () => {
            attributes.clusterDistance = 60;
            const staLayer = new STALayer(attributes),
                layer = staLayer.get("layer");

            expect(layer).to.be.an.instanceof(VectorLayer);
            expect(layer.getSource()).to.be.an.instanceof(Cluster);
            expect(layer.getSource().getDistance()).to.be.equals(attributes.clusterDistance);
            expect(typeof layer.getStyleFunction()).to.be.equals("function");
        });
        it("createLayer with isSelected=true shall set layer visible", () => {
            attributes.isSelected = true;
            const staLayer = new STALayer(attributes),
                layer = staLayer.get("layer");

            expect(layer).to.be.an.instanceof(VectorLayer);
            expect(layer.getSource()).to.be.an.instanceof(VectorSource);
            expect(staLayer.get("isVisibleInMap")).to.be.true;
            expect(staLayer.get("layer").getVisible()).to.be.true;
        });
        it("createLayer with isSelected=false shall set layer not visible", () => {
            attributes.isSelected = false;
            const staLayer = new STALayer(attributes),
                layer = staLayer.get("layer");

            expect(layer).to.be.an.instanceof(VectorLayer);
            expect(layer.getSource()).to.be.an.instanceof(VectorSource);
            expect(staLayer.get("isVisibleInMap")).to.be.false;
            expect(staLayer.get("layer").getVisible()).to.be.false;
        });
    });

    describe("getFeaturesFilterFunction", () => {
        it("getFeaturesFilterFunction shall filter getGeometry", () => {
            const staLayer = new STALayer(attributes),
                featuresFilterFunction = staLayer.getFeaturesFilterFunction(attributes),
                features = [{
                    id: "1",
                    getGeometry: () => sinon.stub()
                },
                {
                    id: "2",
                    getGeometry: () => undefined
                }];

            expect(typeof featuresFilterFunction).to.be.equals("function");
            expect(featuresFilterFunction(features).length).to.be.equals(1);

        });
        it("getFeaturesFilterFunction shall filter bboxGeometry", () => {
            attributes.bboxGeometry = {
                intersectsExtent: (extent) => {
                    if (extent.includes("1")) {
                        return true;
                    }
                    return false;
                },
                getExtent: () => ["1"]
            };
            const staLayer = new STALayer(attributes),
                featuresFilterFunction = staLayer.getFeaturesFilterFunction(attributes),
                features = [{
                    id: "1",
                    getGeometry: () => {
                        return {
                            getExtent: () => ["1"]
                        };

                    }
                },
                {
                    id: "2",
                    getGeometry: () => undefined
                },
                {
                    id: "3",
                    getGeometry: () => {
                        return {
                            getExtent: () => ["2"]
                        };
                    }
                }];

            expect(typeof featuresFilterFunction).to.be.equals("function");
            expect(featuresFilterFunction(features).length).to.be.equals(1);
            expect(featuresFilterFunction(features)[0].id).to.be.equals("1");
        });
    });

    describe("getPropertyname", () => {
        it("getPropertyname shall return joined proertyNames or empty string", () => {
            attributes.propertyNames = ["app:plan", "app:name"];
            const staLayer = new STALayer(attributes);
            let propertyname = staLayer.getPropertyname(attributes);

            expect(propertyname).to.be.equals("app:plan,app:name");

            attributes.propertyNames = [];
            propertyname = staLayer.getPropertyname(attributes);
            expect(propertyname).to.be.equals("");
            attributes.propertyNames = undefined;
            propertyname = staLayer.getPropertyname(attributes);
            expect(propertyname).to.be.equals("");
            attributes.propertyNames = undefined;
            propertyname = staLayer.getPropertyname(attributes);
            expect(propertyname).to.be.equals("");
        });
    });

    describe("getStyleFunction", () => {
        it("getStyleFunction shall return a function", () => {
            sinon.stub(Radio, "request").callsFake((...args) => {
                let ret = null;

                args.forEach(arg => {
                    if (arg === "returnModelById") {
                        ret = {
                            id: "id",
                            createStyle: () => sinon.stub(),
                            getGeometryTypeFromWFS: () => sinon.stub(),
                            getLegendInfos: () => sinon.stub()
                        };
                    }
                });
                return ret;
            });
            const staLayer = new STALayer(attributes),
                styleFunction = staLayer.getStyleFunction(attributes);

            expect(styleFunction).not.to.be.null;
            expect(typeof styleFunction).to.be.equals("function");
        });
    });

    describe("updateSource", () => {
        it("updateSource shall refresh source if 'sourceUpdated' is false", () => {
            const staLayer = new STALayer(attributes),
                layer = staLayer.get("layer"),
                spy = sinon.spy(layer.getSource(), "refresh");

            expect(staLayer.get("sourceUpdated")).to.be.false;
            staLayer.updateSource();
            expect(spy.calledOnce).to.be.true;
            expect(staLayer.get("sourceUpdated")).to.be.true;
        });
        it("updateSource shall not refresh source if 'sourceUpdated' is true", () => {
            attributes.sourceUpdated = true;
            const staLayer = new STALayer(attributes),
                layer = staLayer.get("layer"),
                spy = sinon.spy(layer.getSource(), "refresh");

            expect(staLayer.get("sourceUpdated")).to.be.true;
            staLayer.updateSource();
            expect(spy.notCalled).to.be.true;
            expect(staLayer.get("sourceUpdated")).to.be.true;
        });
    });

    describe("functions for features", () => {
        let style1 = null,
            style2 = null,
            style3 = null;
        const features = [{
            getId: () => "1",
            get: () => sinon.stub(),
            set: () => sinon.stub(),
            setStyle: (fn) => {
                style1 = fn;
            }
        },
        {
            getId: () => "2",
            get: () => sinon.stub(),
            set: () => sinon.stub(),
            setStyle: (fn) => {
                style2 = fn;
            }
        },
        {
            getId: () => "3",
            get: () => sinon.stub(),
            set: () => sinon.stub(),
            setStyle: (fn) => {
                style3 = fn;
            }
        }];

        it("hideAllFeatures", () => {
            const staLayer = new STALayer(attributes),
                layer = staLayer.get("layer"),
                clearStub = sinon.stub(layer.getSource(), "clear"),
                addFeaturesStub = sinon.stub(layer.getSource(), "addFeatures");

            sinon.stub(layer.getSource(), "getFeatures").returns(features);

            staLayer.hideAllFeatures();

            expect(staLayer.get("layer").getSource().getFeatures().length).to.be.equals(3);
            expect(clearStub.calledOnce).to.be.true;
            expect(addFeaturesStub.calledOnce).to.be.true;
            expect(typeof style1).to.be.equals("function");
            expect(style1()).to.be.null;
            expect(typeof style2).to.be.equals("function");
            expect(style2()).to.be.null;
            expect(typeof style3).to.be.equals("function");
            expect(style3()).to.be.null;

        });
        it("showAllFeatures", () => {
            sinon.stub(Radio, "request").callsFake((...args) => {
                let ret = null;

                args.forEach(arg => {
                    if (arg === "returnModelById") {
                        ret = {
                            id: "id",
                            createStyle: () => sinon.stub(),
                            getGeometryTypeFromWFS: () => sinon.stub(),
                            getLegendInfos: () => sinon.stub()
                        };
                    }
                });
                return ret;
            });
            const staLayer = new STALayer(attributes),
                layer = staLayer.get("layer");

            sinon.stub(layer.getSource(), "getFeatures").returns(features);
            staLayer.showAllFeatures();

            expect(staLayer.get("layer").getSource().getFeatures().length).to.be.equals(3);
            expect(typeof style1).to.be.equals("function");
            expect(style1()).not.to.be.null;
            expect(typeof style2).to.be.equals("function");
            expect(style2()).not.to.be.null;
            expect(typeof style3).to.be.equals("function");
            expect(style3()).not.to.be.null;

        });
        it("showFeaturesByIds", () => {
            sinon.stub(Radio, "request").callsFake((...args) => {
                let ret = null;

                args.forEach(arg => {
                    if (arg === "returnModelById") {
                        ret = {
                            id: "id",
                            createStyle: () => sinon.stub(),
                            getGeometryTypeFromWFS: () => sinon.stub(),
                            getLegendInfos: () => sinon.stub()
                        };
                    }
                });
                return ret;
            });
            const staLayer = new STALayer(attributes),
                layer = staLayer.get("layer"),
                clearStub = sinon.stub(layer.getSource(), "clear");

            sinon.stub(layer.getSource(), "addFeatures");
            sinon.stub(layer.getSource(), "getFeatures").returns(features);
            sinon.stub(layer.getSource(), "getFeatureById").returns(features[0]);
            staLayer.showFeaturesByIds(["1"]);

            expect(staLayer.get("layer").getSource().getFeatures().length).to.be.equals(3);
            expect(typeof style1).to.be.equals("function");
            expect(style1()).not.to.be.null;
            expect(typeof style2).to.be.equals("function");
            expect(style2()).to.be.null;
            expect(typeof style3).to.be.equals("function");
            expect(style3()).to.be.null;
            expect(clearStub.calledOnce).to.be.true;
        });
    });

    describe("functions for styling", () => {
        it("getStyleAsFunction shall return a function", () => {
            const staLayer = new STALayer(attributes);

            let ret = staLayer.getStyleAsFunction(() => {
                return "test";
            });

            expect(typeof ret).to.be.equals("function");
            expect(ret()).to.be.equals("test");

            ret = staLayer.getStyleAsFunction("test");
            expect(typeof ret).to.be.equals("function");
            expect(ret()).to.be.equals("test");
        });
        it("styling shall set style", () => {
            const staLayer = new STALayer(attributes);

            staLayer.set("style", () => {
                return "test";
            });

            staLayer.styling();
            expect(typeof staLayer.get("layer").getStyle()).to.be.equals("function");
            expect(staLayer.get("layer").getStyle()()).to.be.equals("test");
        });
    });

    describe("getMqttHostFromUrl", () => {
        it("should call the error handler if anything but a string is given as first parameter and should return an empty string", () => {
            let lastError = null;
            const result = sensorLayer.getMqttHostFromUrl(undefined, error => {
                lastError = error;
            });

            expect(result).to.be.a("string").and.to.be.empty;
            expect(lastError).to.be.an.instanceof(Error);
        });
        it("should call the error handler if the given url is not valid", () => {
            let lastError = null;
            const result = sensorLayer.getMqttHostFromUrl("https:/iot.hamburg.de", error => {
                lastError = error;
            });

            expect(result).to.be.a("string").and.to.be.empty;
            expect(lastError).to.be.an.instanceof(Error);
        });
        it("should return the mqtt host from the given url", () => {
            let lastError = null;
            const result = sensorLayer.getMqttHostFromUrl("https://iot.hamburg.de", error => {
                lastError = error;
            });

            expect(result).to.equal("iot.hamburg.de");
            expect(lastError).to.not.be.an.instanceof(Error);
        });
    });

    describe("getDatastreamIdFromMqttTopic", () => {
        it("should return an empty string if anything but a string is given", () => {
            expect(sensorLayer.getDatastreamIdFromMqttTopic(undefined)).to.be.a("string").and.to.be.empty;
            expect(sensorLayer.getDatastreamIdFromMqttTopic(null)).to.be.a("string").and.to.be.empty;
            expect(sensorLayer.getDatastreamIdFromMqttTopic(1234)).to.be.a("string").and.to.be.empty;
            expect(sensorLayer.getDatastreamIdFromMqttTopic(true)).to.be.a("string").and.to.be.empty;
            expect(sensorLayer.getDatastreamIdFromMqttTopic(false)).to.be.a("string").and.to.be.empty;
            expect(sensorLayer.getDatastreamIdFromMqttTopic([])).to.be.a("string").and.to.be.empty;
            expect(sensorLayer.getDatastreamIdFromMqttTopic({})).to.be.a("string").and.to.be.empty;
        });
        it("should return an empty string if a string without a certain indicator is given", () => {
            expect(sensorLayer.getDatastreamIdFromMqttTopic("test")).to.be.a("string").and.to.be.empty;
        });
        it("should return the first occurence of an id within certain indicators", () => {
            expect(sensorLayer.getDatastreamIdFromMqttTopic("test.Datastreams(1234).Observations(5678)")).to.equal("1234");
        });
    });

    describe("getFeatureByDatastreamId", () => {
        it("should return null if the first parameter is anything but an array", () => {
            expect(sensorLayer.getFeatureByDatastreamId({}, "6789")).to.be.null;
            expect(sensorLayer.getFeatureByDatastreamId(null, "6789")).to.be.null;
            expect(sensorLayer.getFeatureByDatastreamId(undefined, "6789")).to.be.null;
            expect(sensorLayer.getFeatureByDatastreamId(123, "6789")).to.be.null;
            expect(sensorLayer.getFeatureByDatastreamId(true, "6789")).to.be.null;
            expect(sensorLayer.getFeatureByDatastreamId(false, "6789")).to.be.null;
            expect(sensorLayer.getFeatureByDatastreamId("string", "6789")).to.be.null;
        });
        it("should return null if the second parameter is anything but a string", () => {
            expect(sensorLayer.getFeatureByDatastreamId([], {})).to.be.null;
            expect(sensorLayer.getFeatureByDatastreamId([], null)).to.be.null;
            expect(sensorLayer.getFeatureByDatastreamId([], undefined)).to.be.null;
            expect(sensorLayer.getFeatureByDatastreamId([], 123)).to.be.null;
            expect(sensorLayer.getFeatureByDatastreamId([], true)).to.be.null;
            expect(sensorLayer.getFeatureByDatastreamId([], false)).to.be.null;
            expect(sensorLayer.getFeatureByDatastreamId([], [])).to.be.null;
        });
        it("should return null if the given features are an empty array", () => {
            expect(sensorLayer.getFeatureByDatastreamId([], "string")).to.be.null;
        });
        it("should return null if the given id is not included in any dataStreamId of the given features", () => {
            const features = [
                {get: () => "1234 | 5678"},
                {get: () => "2345 | 6789"},
                {get: () => "3456 | 7890"}
            ];

            expect(sensorLayer.getFeatureByDatastreamId(features, "4321")).to.be.null;
        });
        it("should return the feature where id equals the dataStreamId", () => {
            const features = [
                    {get: () => "1234 | 5678"},
                    {get: () => "2345"},
                    {get: () => "3456 | 7890"}
                ],
                result = sensorLayer.getFeatureByDatastreamId(features, "2345");

            expect(result).to.be.an("object");
            expect(result.get).to.be.a("function");
            expect(result.get()).to.equal("2345");
        });
        it("should return the feature where id is found in a piped dataStreamId string", () => {
            const features = [
                    {get: () => "1234 | 5678"},
                    {get: () => "2345 | 6789"},
                    {get: () => "3456 | 7890"}
                ],
                result = sensorLayer.getFeatureByDatastreamId(features, "6789");

            expect(result).to.be.an("object");
            expect(result.get).to.be.a("function");
            expect(result.get()).to.equal("2345 | 6789");
        });
        it("should return null if the given id is only a sub part of an id of a piped dataStreamId string", () => {
            const features = [
                {get: () => "1234 | 5678"},
                {get: () => "2345 | 6789"},
                {get: () => "3456 | 7890"}
            ];

            expect(sensorLayer.getFeatureByDatastreamId(features, "23")).to.be.null;
        });
    });

    describe("getDatastreamIdsHelper", () => {
        it("should return false if the first parameter is not an object", () => {
            expect(sensorLayer.getDatastreamIdsHelper([], [])).to.be.false;
            expect(sensorLayer.getDatastreamIdsHelper(null, [])).to.be.false;
            expect(sensorLayer.getDatastreamIdsHelper(undefined, [])).to.be.false;
            expect(sensorLayer.getDatastreamIdsHelper(123, [])).to.be.false;
            expect(sensorLayer.getDatastreamIdsHelper(true, [])).to.be.false;
            expect(sensorLayer.getDatastreamIdsHelper(false, [])).to.be.false;
            expect(sensorLayer.getDatastreamIdsHelper("string", [])).to.be.false;
        });
        it("should return false if the first parameter is an object but has no get function", () => {
            expect(sensorLayer.getDatastreamIdsHelper({}, [])).to.be.false;
        });
        it("should return false if the first parameter has not string value under dataStreamId received by getter", () => {
            expect(sensorLayer.getDatastreamIdsHelper({get: () => undefined}, [])).to.be.false;
            expect(sensorLayer.getDatastreamIdsHelper({get: () => null}, [])).to.be.false;
            expect(sensorLayer.getDatastreamIdsHelper({get: () => 123}, [])).to.be.false;
            expect(sensorLayer.getDatastreamIdsHelper({get: () => true}, [])).to.be.false;
            expect(sensorLayer.getDatastreamIdsHelper({get: () => false}, [])).to.be.false;
            expect(sensorLayer.getDatastreamIdsHelper({get: () => []}, [])).to.be.false;
            expect(sensorLayer.getDatastreamIdsHelper({get: () => {
                return {};
            }}, [])).to.be.false;
        });
        it("should return false if the second parameter is not an array", () => {
            expect(sensorLayer.getDatastreamIdsHelper({get: () => "string"}, undefined)).to.be.false;
            expect(sensorLayer.getDatastreamIdsHelper({get: () => "string"}, null)).to.be.false;
            expect(sensorLayer.getDatastreamIdsHelper({get: () => "string"}, 123)).to.be.false;
            expect(sensorLayer.getDatastreamIdsHelper({get: () => "string"}, true)).to.be.false;
            expect(sensorLayer.getDatastreamIdsHelper({get: () => "string"}, false)).to.be.false;
            expect(sensorLayer.getDatastreamIdsHelper({get: () => "string"}, {})).to.be.false;
            expect(sensorLayer.getDatastreamIdsHelper({get: () => "string"}, "string")).to.be.false;
        });
        it("should push a pipeless value into the second parameter", () => {
            const feature = {
                    get: () => "1234"
                },
                result = [];

            expect(sensorLayer.getDatastreamIdsHelper(feature, result)).to.be.true;
            expect(result).to.deep.equal(["1234"]);
        });
        it("should push all value splitted by pipe into the second parameter", () => {
            const feature = {
                    get: () => "1234 | 5678"
                },
                result = [];

            expect(sensorLayer.getDatastreamIdsHelper(feature, result)).to.be.true;
            expect(result).to.deep.equal(["1234", "5678"]);
        });
    });

    describe("getDatastreamIds", () => {
        it("should return an empty array if the given parameter is not an array", () => {
            expect(sensorLayer.getDatastreamIds(undefined)).to.be.an("array").and.to.be.empty;
            expect(sensorLayer.getDatastreamIds(null)).to.be.an("array").and.to.be.empty;
            expect(sensorLayer.getDatastreamIds(123)).to.be.an("array").and.to.be.empty;
            expect(sensorLayer.getDatastreamIds(true)).to.be.an("array").and.to.be.empty;
            expect(sensorLayer.getDatastreamIds(false)).to.be.an("array").and.to.be.empty;
            expect(sensorLayer.getDatastreamIds("string")).to.be.an("array").and.to.be.empty;
            expect(sensorLayer.getDatastreamIds({})).to.be.an("array").and.to.be.empty;
        });
        it("should return an empty array if the given parameter is an array but is empty", () => {
            expect(sensorLayer.getDatastreamIds([])).to.be.an("array").and.to.be.empty;
        });
        it("should return an empty array if the features are not objects", () => {
            expect(sensorLayer.getDatastreamIds([undefined, null, 123, true, false, "string", []])).to.be.an("array").and.to.be.empty;
        });
        it("should return an empty array if the features are objects but have no get function", () => {
            expect(sensorLayer.getDatastreamIds([{}, {get: false}])).to.be.an("array").and.to.be.empty;
        });
        it("should collect the datastream ids of the features if the features have no sub features", () => {
            const features = [
                {get: key => key === "features" ? undefined : "123"},
                {get: key => key === "features" ? undefined : "456 | 789"}
            ];

            expect(sensorLayer.getDatastreamIds(features)).to.deep.equal(["123", "456", "789"]);
        });
        it("should collect all datastream ids of all sub features if any given features have sub features", () => {
            const features = [
                {
                    get: () => [
                        {get: key => key === "features" ? undefined : "321"},
                        {get: key => key === "features" ? undefined : "654 | 987"}
                    ]
                },
                {get: key => key === "features" ? undefined : "123"},
                {get: key => key === "features" ? undefined : "456 | 789"}
            ];

            expect(sensorLayer.getDatastreamIds(features)).to.deep.equal(["321", "654", "987", "123", "456", "789"]);
        });
    });

    describe("replaceValueInArrayByReference", () => {
        it("should return false if the given result is not an array", () => {
            expect(sensorLayer.replaceValueInArrayByReference(undefined, [], "string", "value")).to.be.false;
            expect(sensorLayer.replaceValueInArrayByReference(null, [], "string", "value")).to.be.false;
            expect(sensorLayer.replaceValueInArrayByReference(123, [], "string", "value")).to.be.false;
            expect(sensorLayer.replaceValueInArrayByReference(true, [], "string", "value")).to.be.false;
            expect(sensorLayer.replaceValueInArrayByReference(false, [], "string", "value")).to.be.false;
            expect(sensorLayer.replaceValueInArrayByReference("string", [], "string", "value")).to.be.false;
            expect(sensorLayer.replaceValueInArrayByReference({}, [], "string", "value")).to.be.false;
        });
        it("should return false if the given referenceArray is not an array", () => {
            expect(sensorLayer.replaceValueInArrayByReference([], undefined, "string", "value")).to.be.false;
            expect(sensorLayer.replaceValueInArrayByReference([], null, "string", "value")).to.be.false;
            expect(sensorLayer.replaceValueInArrayByReference([], 123, "string", "value")).to.be.false;
            expect(sensorLayer.replaceValueInArrayByReference([], true, "string", "value")).to.be.false;
            expect(sensorLayer.replaceValueInArrayByReference([], false, "string", "value")).to.be.false;
            expect(sensorLayer.replaceValueInArrayByReference([], "string", "string", "value")).to.be.false;
            expect(sensorLayer.replaceValueInArrayByReference([], {}, "string", "value")).to.be.false;
        });
        it("should replace value in array by reference and return true", () => {
            const resArr = [];

            expect(sensorLayer.replaceValueInArrayByReference(resArr, ["3"], "3", "5")).to.be.true;
            expect(resArr).to.deep.equal(["5"]);
        });
        it("should return empty array if reference array does not includes the given reference", () => {
            const resArr = [];

            expect(sensorLayer.replaceValueInArrayByReference(resArr, ["3"], "4", "5")).to.be.true;
            expect(resArr).to.deep.equal([]);
        });
    });

    describe("replaceValueInPipedProperty", () => {
        it("should return an empty string if the given parameters are not correct", () => {
            expect(sensorLayer.replaceValueInPipedProperty({}, "dataStreamValue", "8805", "available")).to.be.a("string").and.to.be.empty;
            expect(sensorLayer.replaceValueInPipedProperty([], "dataStreamValue", "8805", "available")).to.be.a("string").and.to.be.empty;
            expect(sensorLayer.replaceValueInPipedProperty([], undefined, "8805", "available")).to.be.a("string").and.to.be.empty;
            expect(sensorLayer.replaceValueInPipedProperty([], "dataStreamValue", undefined, "available")).to.be.a("string").and.to.be.empty;
            expect(sensorLayer.replaceValueInPipedProperty([], "dataStreamValue", "8805", undefined)).to.be.a("string").and.to.be.empty;
            expect(sensorLayer.replaceValueInPipedProperty(undefined, undefined, undefined, undefined)).to.be.a("string").and.to.be.empty;
        });
        it("should return an empty string if the given feature has no dataStreamId", () => {
            const feature = {
                get: key => key === "dataStreamId" ? undefined : "foo | bar"
            };

            expect(sensorLayer.replaceValueInPipedProperty(feature, "property", "dataStreamId", "value")).to.be.a("string").and.to.be.empty;
        });
        it("should return an empty string if the given feature has not the expected property", () => {
            const feature = {
                get: key => key === "dataStreamId" ? "1 | 2" : undefined
            };

            expect(sensorLayer.replaceValueInPipedProperty(feature, "property", "dataStreamId", "value")).to.be.a("string").and.to.be.empty;
        });
        it("should replace value in piped properties", () => {
            const feature = {
                get: key => key === "dataStreamId" ? "1 | 2" : "foo | bar"
            };

            expect(sensorLayer.replaceValueInPipedProperty(feature, "property", "2", "baz")).to.equal("foo | baz");
        });
    });

    describe("updateFeatureProperties", () => {
        it("should return false if the given feature has no get function", () => {
            expect(sensorLayer.updateFeatureProperties(undefined)).to.be.false;
            expect(sensorLayer.updateFeatureProperties(null)).to.be.false;
            expect(sensorLayer.updateFeatureProperties(1234)).to.be.false;
            expect(sensorLayer.updateFeatureProperties(true)).to.be.false;
            expect(sensorLayer.updateFeatureProperties(false)).to.be.false;
            expect(sensorLayer.updateFeatureProperties([])).to.be.false;
            expect(sensorLayer.updateFeatureProperties({})).to.be.false;
        });
        it("should return false if the given feature has not set function", () => {
            expect(sensorLayer.updateFeatureProperties({get: () => false})).to.be.false;
        });
        it("should return false if the feature has no dataStreamId property", () => {
            expect(sensorLayer.updateFeatureProperties({get: () => false, set: () => false})).to.be.false;
        });
        it("should return false if the feature has no dataStreamName property", () => {
            expect(sensorLayer.updateFeatureProperties({get: key => key === "dataStreamId" ? "str" : false, set: () => false})).to.be.false;
        });
        it("should return false if the feature has no dataStreamName property", () => {
            expect(sensorLayer.updateFeatureProperties({get: key => key === "dataStreamId" ? "str" : false, set: () => false})).to.be.false;
        });
        it("should return true and change the feature", () => {
            const setLogger = [],
                feature = {
                    get: key => {
                        if (key === "dataStreamId") {
                            return "1 | 2";
                        }
                        else if (key === "dataStreamName") {
                            return "nameA | nameB";
                        }
                        else if (key === "dataStreamValue") {
                            return "nameA | nameB";
                        }
                        else if (key === "dataStreamPhenomenonTime") {
                            return "phenomenonTimeA | phenomenonTimeB";
                        }
                        return undefined;
                    },
                    set: (key, value) => {
                        setLogger.push({key, value});
                    }
                },
                expected = [
                    {
                        key: "dataStream_2_nameB",
                        value: "result"
                    },
                    {
                        key: "dataStream_2_nameB_phenomenonTime",
                        value: "phenomenonTime"
                    },
                    {
                        key: "dataStreamValue",
                        value: "nameA | result"
                    },
                    {
                        key: "dataStreamPhenomenonTime",
                        value: "phenomenonTimeA | phenomenonTime"
                    }
                ];

            expect(sensorLayer.updateFeatureProperties(feature, "2", "result", "phenomenonTime", "showNoDataValue", "noDataValue", "funcChangeFeatureGFI")).to.be.true;
            expect(setLogger).to.deep.equal(expected);
        });
        it("should return true and change the feature with showNoDataValue and noDataValue", () => {
            const setLogger = [],
                feature = {
                    get: key => {
                        if (key === "dataStreamId") {
                            return "1 | 2";
                        }
                        else if (key === "dataStreamName") {
                            return "nameA | nameB";
                        }
                        else if (key === "dataStreamValue") {
                            return "nameA | nameB";
                        }
                        else if (key === "dataStreamPhenomenonTime") {
                            return "phenomenonTimeA | phenomenonTimeB";
                        }
                        return undefined;
                    },
                    set: (key, value) => {
                        setLogger.push({key, value});
                    }
                },
                expected = [
                    {
                        key: "dataStream_2_nameB",
                        value: "noDataValue"
                    },
                    {
                        key: "dataStream_2_nameB_phenomenonTime",
                        value: "phenomenonTime"
                    },
                    {
                        key: "dataStreamValue",
                        value: "nameA | noDataValue"
                    },
                    {
                        key: "dataStreamPhenomenonTime",
                        value: "phenomenonTimeA | phenomenonTime"
                    }
                ];

            expect(sensorLayer.updateFeatureProperties(feature, "2", "", "phenomenonTime", true, "noDataValue", "funcChangeFeatureGFI")).to.be.true;
            expect(setLogger).to.deep.equal(expected);
        });
        it("should return true call the given change feature gfi function", () => {
            let lastFeature = null;
            const feature = {
                get: () => "1 | 2",
                set: () => false
            };

            expect(sensorLayer.updateFeatureProperties(feature, "2", "result", "phenomenonTime", "showNoDataValue", "noDataValue", feat => {
                lastFeature = feat;
            })).to.be.true;
            expect(lastFeature).to.be.an("object").and.not.to.be.null;
        });
    });

    describe("updateObservationForDatastreams", () => {
        const feature = new Feature({
            Datastreams: [{
                "@iot.id": "foo",
                Observations: []
            }, {
                "@iot.id": "bar",
                Observations: []
            }]
        });

        it("should add the given observation to the property Datastreams where the datastream id equals the given datastream id", () => {
            sensorLayer.updateObservationForDatastreams(feature, "foo", "qox");

            expect(feature.get("Datastreams")[0].Observations).to.deep.equal(["qox"]);
            expect(feature.get("Datastreams")[1].Observations).to.be.empty;
        });
    });

    describe("enlargeExtent", () => {
        it("should return correctly enlarged extent", () => {
            expect(sensorLayer.enlargeExtent([100, 100, 200, 200], 0.1)).to.be.an("array").to.have.ordered.members([90, 90, 210, 210]);
        });
        it("should return correctly reduced extent", () => {
            expect(sensorLayer.enlargeExtent([100, 100, 200, 200], -0.1)).to.be.an("array").to.have.ordered.members([110, 110, 190, 190]);
        });
    });

    describe("getFeaturesInExtent", () => {
        it("should return no feature within extent", () => {
            const features = [],
                feature1 = new Feature({
                    geometry: new Point([50, 50])
                }),
                currentExtent = [100, 100, 200, 200];

            features.push(feature1);
            expect(sensorLayer.getFeaturesInExtent(features, currentExtent)).to.be.an("array").that.is.empty;
        });

        it("should return only one feature within extent", () => {
            const features = [],
                feature1 = new Feature({
                    geometry: new Point([50, 50])
                }),
                feature2 = new Feature({
                    geometry: new Point([150, 150])
                }),
                currentExtent = [100, 100, 200, 200];

            features.push(feature1);
            features.push(feature2);

            expect(sensorLayer.getFeaturesInExtent(features, currentExtent)).to.be.an("array").to.have.lengthOf(1);
        });

        it("should also return a feature inside enlarged extent", () => {
            const features = [],
                feature1 = new Feature({
                    geometry: new Point([50, 50])
                }),
                feature2 = new Feature({
                    geometry: new Point([150, 150])
                }),
                feature3 = new Feature({
                    geometry: new Point([201, 201])
                }),
                currentExtent = [100, 100, 200, 200];

            features.push(feature1);
            features.push(feature2);
            features.push(feature3);

            expect(sensorLayer.getFeaturesInExtent(features, currentExtent)).to.be.an("array").to.have.lengthOf(2);
        });
    });

    describe("getDatastreamIds", () => {
        it("should return a empty array for undefined input", () => {
            expect(sensorLayer.getDatastreamIds(undefined)).to.be.an("array").that.is.empty;
            expect(sensorLayer.getDatastreamIds(null)).to.be.an("array").that.is.empty;
            expect(sensorLayer.getDatastreamIds({})).to.be.an("array").that.is.empty;
            expect(sensorLayer.getDatastreamIds(123)).to.be.an("array").that.is.empty;
            expect(sensorLayer.getDatastreamIds("string")).to.be.an("array").that.is.empty;
            expect(sensorLayer.getDatastreamIds(true)).to.be.an("array").that.is.empty;
            expect(sensorLayer.getDatastreamIds(false)).to.be.an("array").that.is.empty;
        });
        it("should return an array with Strings for features input", () => {
            const feature0 = new Feature({
                    geometry: new Point([100, 100]),
                    dataStreamId: "1 | 2"
                }),
                feature1 = new Feature({
                    geometry: new Point([100, 100]),
                    dataStreamId: "3 | 4"
                }),
                features = [feature0, feature1];

            expect(sensorLayer.getDatastreamIds(features)).to.be.an("array").that.includes("1", "2", "3", "4");
        });
    });

    describe("getFeatureByDatastreamId", () => {
        it("should return null on undefined inputs", () => {
            expect(sensorLayer.getFeatureByDatastreamId(undefined, undefined)).to.be.null;
        });
        it("should return null on undefined array", () => {
            expect(sensorLayer.getFeatureByDatastreamId(undefined, "1")).to.be.null;
        });
        it("should return null on empty array and undefined datastreamid", () => {
            expect(sensorLayer.getFeatureByDatastreamId([], undefined)).to.be.null;
        });
        it("should return null on empty array", () => {
            expect(sensorLayer.getFeatureByDatastreamId([], "1")).to.be.null;
        });
        it("should return a Feature", () => {
            const feature0 = new Feature({
                    dataStreamId: "1",
                    geometry: new Point([100, 100])
                }),
                feature1 = new Feature({
                    dataStreamId: "2",
                    geometry: new Point([100, 100])
                }),
                features = [feature0, feature1];

            expect(sensorLayer.getFeatureByDatastreamId(features, "1")).to.be.an.instanceof(Feature);
        });
        it("should return a Feature with combined dataStreamId", () => {
            const feature0 = new Feature({
                    dataStreamId: "1",
                    geometry: new Point([100, 100])
                }),
                feature1 = new Feature({
                    dataStreamId: "2 | 3",
                    geometry: new Point([100, 100])
                }),
                features = [feature0, feature1];

            expect(sensorLayer.getFeatureByDatastreamId(features, "3")).to.be.an.instanceof(Feature);
        });
    });

    describe("aggregatePropertiesOfThings", () => {
        it("should set one Thing in a simple way without aggregation", () => {
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

            expect(sensorLayer.aggregatePropertiesOfThings(allThings, "http://example.com", "1.1")).to.deep.equal(expectedOutcome);
        });
        it("should aggregate Things if there is more than one thing", () => {
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

            expect(sensorLayer.aggregatePropertiesOfThings(allThings, "http://example.com", "1.1")).to.deep.equal(expectedOutcome);
        });
    });

    describe("getThingsGeometry", () => {
        it("should return the location in geometry", () => {
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

            expect(sensorLayer.getThingsGeometry(testObject, 0)).to.be.an("object").to.include({test: "Test"});
            expect(sensorLayer.getThingsGeometry(testObject, 1)).to.be.null;
        });
        it("should return the location without geometry", () => {
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

            expect(sensorLayer.getThingsGeometry(testObject2, 0)).to.be.an("object").to.include({test: "Test"});
            expect(sensorLayer.getThingsGeometry(testObject2, 1)).to.be.null;
        });
    });

    describe("buildSensorThingsUrl", () => {
        it("should return an url as string for a specific input", () => {
            const testUrl = "https://www.example.com:1234/foo/bar",
                testVersion = "1.1",
                testUrlParams = {
                    "baz": 1234,
                    "qux": "foobar"
                },
                expectedOutput = "https://www.example.com:1234/foo/bar/v1.1/Things?$baz=1234&$qux=foobar";

            expect(sensorLayer.buildSensorThingsUrl(testUrl, testVersion, testUrlParams)).to.equal(expectedOutput);
        });
        it("should return an url with datastreams as root", () => {
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
        it("should return an url as string for a specific input including nested urlParams", () => {
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

        it("should return an url without query if no params as object are given", () => {
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
        it("should eat any url possible without checking its target or syntax", () => {
            const testUrlParams = {
                "foo": "bar"
            };

            expect(sensorLayer.buildSensorThingsUrl("", "1.1", testUrlParams)).to.equal("/v1.1/Things?$foo=bar");
            expect(sensorLayer.buildSensorThingsUrl("http://", "1.1", testUrlParams)).to.equal("http:///v1.1/Things?$foo=bar");
            expect(sensorLayer.buildSensorThingsUrl("wfs://baz", "1.1", testUrlParams)).to.equal("wfs://baz/v1.1/Things?$foo=bar");
            expect(sensorLayer.buildSensorThingsUrl("foobar://baz////", "1.1", testUrlParams)).to.equal("foobar://baz/////v1.1/Things?$foo=bar");
        });
        it("should take any version as string unchecked", () => {
            expect(sensorLayer.buildSensorThingsUrl("", "1.1", false)).to.equal("/v1.1/Things?");
            expect(sensorLayer.buildSensorThingsUrl("", "foo", false)).to.equal("/vfoo/Things?");
            expect(sensorLayer.buildSensorThingsUrl("", "foo.bar.baz", false)).to.equal("/vfoo.bar.baz/Things?");
        });
        it("should take any version as number fixed to one decimal number", () => {
            expect(sensorLayer.buildSensorThingsUrl("", 0.5, false)).to.equal("/v0.5/Things?");
            expect(sensorLayer.buildSensorThingsUrl("", 0.55, false)).to.equal("/v0.6/Things?");
            expect(sensorLayer.buildSensorThingsUrl("", 0.00000001, false)).to.equal("/v0.0/Things?");
            expect(sensorLayer.buildSensorThingsUrl("", 999999.9999999, false)).to.equal("/v1000000.0/Things?");
        });
        it("should stringify any given parameter for url and version - no matter what", () => {
            const testUrlParams = {
                "foo": "bar"
            };

            expect(sensorLayer.buildSensorThingsUrl(undefined, undefined, testUrlParams)).to.equal("undefined/vundefined/Things?$foo=bar");
            expect(sensorLayer.buildSensorThingsUrl(null, null, testUrlParams)).to.equal("null/vnull/Things?$foo=bar");
            expect(sensorLayer.buildSensorThingsUrl([], [], testUrlParams)).to.equal("/v/Things?$foo=bar");
            expect(sensorLayer.buildSensorThingsUrl({}, {}, testUrlParams)).to.equal("[object Object]/v[object Object]/Things?$foo=bar");
        });
    });

    describe("unifyThingsByIds", () => {
        it("should return a thing array with merged datastreams", () => {
            const sensordata = [
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
                    }
                ],
                parseDatastreams = sensorLayer.unifyThingsByIds(sensordata),
                expected = [{
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
                }];

            expect(parseDatastreams).to.deep.equal(expected);
        });
    });

    describe("createPropertiesOfDatastreamsHelper", () => {
        it("should return false if the first parameter is not an array", () => {
            expect(sensorLayer.createPropertiesOfDatastreamsHelper(undefined)).to.be.false;
            expect(sensorLayer.createPropertiesOfDatastreamsHelper(null)).to.be.false;
            expect(sensorLayer.createPropertiesOfDatastreamsHelper(123)).to.be.false;
            expect(sensorLayer.createPropertiesOfDatastreamsHelper("string")).to.be.false;
            expect(sensorLayer.createPropertiesOfDatastreamsHelper(true)).to.be.false;
            expect(sensorLayer.createPropertiesOfDatastreamsHelper(false)).to.be.false;
            expect(sensorLayer.createPropertiesOfDatastreamsHelper({})).to.be.false;
        });
        it("should return false if the second parameter is not an object", () => {
            expect(sensorLayer.createPropertiesOfDatastreamsHelper([], undefined)).to.be.false;
            expect(sensorLayer.createPropertiesOfDatastreamsHelper([], null)).to.be.false;
            expect(sensorLayer.createPropertiesOfDatastreamsHelper([], 123)).to.be.false;
            expect(sensorLayer.createPropertiesOfDatastreamsHelper([], "string")).to.be.false;
            expect(sensorLayer.createPropertiesOfDatastreamsHelper([], true)).to.be.false;
            expect(sensorLayer.createPropertiesOfDatastreamsHelper([], false)).to.be.false;
            expect(sensorLayer.createPropertiesOfDatastreamsHelper([], [])).to.be.false;
        });
        it("should return true if the first parameter is an array, should not alter the second parameter", () => {
            const properties = {};

            expect(sensorLayer.createPropertiesOfDatastreamsHelper([undefined, null, 123, "string", true, false, []], properties)).to.be.true;
            expect(properties).to.be.an("object").and.to.be.empty;
        });
    });

    describe("createPropertiesOfDatastreams", () => {
        it("should return an empty array if the first parameter is not an array", () => {
            expect(sensorLayer.createPropertiesOfDatastreams(undefined)).to.be.an("array").and.to.be.empty;
            expect(sensorLayer.createPropertiesOfDatastreams(null)).to.be.an("array").and.to.be.empty;
            expect(sensorLayer.createPropertiesOfDatastreams(123)).to.be.an("array").and.to.be.empty;
            expect(sensorLayer.createPropertiesOfDatastreams("string")).to.be.an("array").and.to.be.empty;
            expect(sensorLayer.createPropertiesOfDatastreams(true)).to.be.an("array").and.to.be.empty;
            expect(sensorLayer.createPropertiesOfDatastreams(false)).to.be.an("array").and.to.be.empty;
            expect(sensorLayer.createPropertiesOfDatastreams({})).to.be.an("array").and.to.be.empty;
        });
        it("should return the first parameter untouched if its content are no objects", () => {
            const allThings = [undefined, null, 123, "string", true, false, []],
                expected = [undefined, null, 123, "string", true, false, []];

            expect(sensorLayer.createPropertiesOfDatastreams(allThings)).to.deep.equal(expected);
        });
        it("should return the first parameter untouched if its content are objects but have no Datastreams array", () => {
            const allThings = [
                    {},
                    {Datastreams: undefined},
                    {Datastreams: null},
                    {Datastreams: 123},
                    {Datastreams: "string"},
                    {Datastreams: true},
                    {Datastreams: false},
                    {Datastreams: {}}
                ],
                expected = [
                    {},
                    {Datastreams: undefined},
                    {Datastreams: null},
                    {Datastreams: 123},
                    {Datastreams: "string"},
                    {Datastreams: true},
                    {Datastreams: false},
                    {Datastreams: {}}
                ];

            expect(sensorLayer.createPropertiesOfDatastreams(allThings)).to.deep.equal(expected);
        });
    });

    describe("moveDatastreamPropertiesToThing", () => {
        it("should return false if the first parameter is not an object", () => {
            expect(sensorLayer.moveDatastreamPropertiesToThing(undefined)).to.be.false;
            expect(sensorLayer.moveDatastreamPropertiesToThing(null)).to.be.false;
            expect(sensorLayer.moveDatastreamPropertiesToThing(123)).to.be.false;
            expect(sensorLayer.moveDatastreamPropertiesToThing("string")).to.be.false;
            expect(sensorLayer.moveDatastreamPropertiesToThing(true)).to.be.false;
            expect(sensorLayer.moveDatastreamPropertiesToThing(false)).to.be.false;
            expect(sensorLayer.moveDatastreamPropertiesToThing([])).to.be.false;
        });
        it("should return false if the second parameter is not an object", () => {
            expect(sensorLayer.moveDatastreamPropertiesToThing({}, undefined)).to.be.false;
            expect(sensorLayer.moveDatastreamPropertiesToThing({}, null)).to.be.false;
            expect(sensorLayer.moveDatastreamPropertiesToThing({}, 123)).to.be.false;
            expect(sensorLayer.moveDatastreamPropertiesToThing({}, "string")).to.be.false;
            expect(sensorLayer.moveDatastreamPropertiesToThing({}, true)).to.be.false;
            expect(sensorLayer.moveDatastreamPropertiesToThing({}, false)).to.be.false;
            expect(sensorLayer.moveDatastreamPropertiesToThing({}, [])).to.be.false;
        });
        it("should create thingProperties equal to dataStreamProperties if thingProperties are an empty object", () => {
            const thingProperties = {},
                dataStreamProperties = {
                    foo: "bar",
                    foobar: "baz"
                },
                expected = {
                    foo: "bar",
                    foobar: "baz"
                };

            expect(sensorLayer.moveDatastreamPropertiesToThing(thingProperties, dataStreamProperties)).to.be.true;
            expect(thingProperties).to.deep.equal(expected);
        });
        it("should alter thingProperties where keys equals dataStreamProperties keys and pipe the value", () => {
            const thingProperties = {
                    foo: "qux",
                    quux: "quuux"
                },
                dataStreamProperties = {
                    foo: "bar",
                    foobar: "baz"
                },
                expected = {
                    foo: "qux | bar",
                    quux: "quuux",
                    foobar: "baz"
                };

            expect(sensorLayer.moveDatastreamPropertiesToThing(thingProperties, dataStreamProperties)).to.be.true;
            expect(thingProperties).to.deep.equal(expected);
        });
    });

    describe("createAssociationObject", () => {
        it("should return an empty object if anything but an array is given", () => {
            expect(sensorLayer.createAssociationObject(undefined)).to.be.an("object").and.to.be.empty;
            expect(sensorLayer.createAssociationObject(null)).to.be.an("object").and.to.be.empty;
            expect(sensorLayer.createAssociationObject(123)).to.be.an("object").and.to.be.empty;
            expect(sensorLayer.createAssociationObject("string")).to.be.an("object").and.to.be.empty;
            expect(sensorLayer.createAssociationObject(true)).to.be.an("object").and.to.be.empty;
            expect(sensorLayer.createAssociationObject(false)).to.be.an("object").and.to.be.empty;
            expect(sensorLayer.createAssociationObject({})).to.be.an("object").and.to.be.empty;
        });
        it("should return an empty object for empty array as input", () => {
            expect(sensorLayer.createAssociationObject([])).to.deep.equal({});
        });
        it("should return an object with values from input array as keys", () => {
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

    describe("changeSensordataRootToThings", () => {
        it("should return an empty array if the first parameter is anything but an array", () => {
            expect(sensorLayer.changeSensordataRootToThings(undefined)).to.be.an("array").and.to.be.empty;
            expect(sensorLayer.changeSensordataRootToThings(null)).to.be.an("array").and.to.be.empty;
            expect(sensorLayer.changeSensordataRootToThings(123)).to.be.an("array").and.to.be.empty;
            expect(sensorLayer.changeSensordataRootToThings("string")).to.be.an("array").and.to.be.empty;
            expect(sensorLayer.changeSensordataRootToThings(true)).to.be.an("array").and.to.be.empty;
            expect(sensorLayer.changeSensordataRootToThings(false)).to.be.an("array").and.to.be.empty;
            expect(sensorLayer.changeSensordataRootToThings({})).to.be.an("array").and.to.be.empty;
        });
        it("should return an empty array if the first parameter is an array without objects", () => {
            expect(sensorLayer.changeSensordataRootToThings([undefined, null, 123, "string", true, false, []])).to.be.an("array").and.to.be.empty;
        });
        it("should return an empty array if the object entries of the first parameter have no Thing key", () => {
            expect(sensorLayer.changeSensordataRootToThings([
                {Thing: undefined},
                {Thing: null},
                {Thing: 123},
                {Thing: "string"},
                {Thing: true},
                {Thing: false},
                {Thing: []}
            ])).to.be.an("array").that.is.empty;
        });
        it("should return the expected result", () => {
            const sensordata = [{keyA: 1, keyB: 2, Thing: {keyC: 3, keyD: 4}}],
                datastreamAttributes = ["keyA", "keyB"],
                thingAttributes = ["keyC", "keyD"],
                expected = [{Datastreams: [{keyA: 1, keyB: 2}], keyC: 3, keyD: 4}];

            expect(sensorLayer.changeSensordataRootToThings(sensordata, datastreamAttributes, thingAttributes)).deep.equal(expected);
        });
    });

    describe("buildSensorThingsUrl", () => {
        it("should return an url as string for a specific input", () => {
            const testUrl = "https://www.example.com:1234/foo/bar",
                testVersion = "1.1",
                testUrlParams = {
                    "baz": 1234,
                    "qux": "foobar"
                },
                expectedOutput = "https://www.example.com:1234/foo/bar/v1.1/Things?$baz=1234&$qux=foobar";

            expect(sensorLayer.buildSensorThingsUrl(testUrl, testVersion, testUrlParams)).to.equal(expectedOutput);
        });
        it("should return an url with datastreams as root", () => {
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
        it("should return an url as string for a specific input including nested urlParams", () => {
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

        it("should return an url without query if no params as object are given", () => {
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
        it("should eat any url possible without checking its target or syntax", () => {
            const testUrlParams = {
                "foo": "bar"
            };

            expect(sensorLayer.buildSensorThingsUrl("", "1.1", testUrlParams)).to.equal("/v1.1/Things?$foo=bar");
            expect(sensorLayer.buildSensorThingsUrl("http://", "1.1", testUrlParams)).to.equal("http:///v1.1/Things?$foo=bar");
            expect(sensorLayer.buildSensorThingsUrl("wfs://baz", "1.1", testUrlParams)).to.equal("wfs://baz/v1.1/Things?$foo=bar");
            expect(sensorLayer.buildSensorThingsUrl("foobar://baz////", "1.1", testUrlParams)).to.equal("foobar://baz/////v1.1/Things?$foo=bar");
        });
        it("should take any version as string unchecked", () => {
            expect(sensorLayer.buildSensorThingsUrl("", "1.1", false)).to.equal("/v1.1/Things?");
            expect(sensorLayer.buildSensorThingsUrl("", "foo", false)).to.equal("/vfoo/Things?");
            expect(sensorLayer.buildSensorThingsUrl("", "foo.bar.baz", false)).to.equal("/vfoo.bar.baz/Things?");
        });
        it("should take any version as number fixed to one decimal number", () => {
            expect(sensorLayer.buildSensorThingsUrl("", 0.5, false)).to.equal("/v0.5/Things?");
            expect(sensorLayer.buildSensorThingsUrl("", 0.55, false)).to.equal("/v0.6/Things?");
            expect(sensorLayer.buildSensorThingsUrl("", 0.00000001, false)).to.equal("/v0.0/Things?");
            expect(sensorLayer.buildSensorThingsUrl("", 999999.9999999, false)).to.equal("/v1000000.0/Things?");
        });
        it("should stringify any given parameter for url and version - no matter what", () => {
            const testUrlParams = {
                "foo": "bar"
            };

            expect(sensorLayer.buildSensorThingsUrl(undefined, undefined, testUrlParams)).to.equal("undefined/vundefined/Things?$foo=bar");
            expect(sensorLayer.buildSensorThingsUrl(null, null, testUrlParams)).to.equal("null/vnull/Things?$foo=bar");
            expect(sensorLayer.buildSensorThingsUrl([], [], testUrlParams)).to.equal("/v/Things?$foo=bar");
            expect(sensorLayer.buildSensorThingsUrl({}, {}, testUrlParams)).to.equal("[object Object]/v[object Object]/Things?$foo=bar");
        });
    });

    describe("getLocalTimeFormat", () => {
        it("should return an empty for undefined input", () => {
            expect(sensorLayer.getLocalTimeFormat(undefined, undefined)).to.be.a("string").and.to.be.empty;
        });
        it("should return an empty  string for undefined phenomenontime and utc +1", () => {
            expect(sensorLayer.getLocalTimeFormat(undefined, "Europe/Berlin")).to.be.a("string").and.to.be.empty;
        });
        it("should return a string in summertime", () => {
            const summerTime = "2018-06-05T12:11:47.922Z";

            expect(sensorLayer.getLocalTimeFormat(summerTime, "Europe/Berlin")).to.equal("5. Juni 2018 14:11");
        });
        it("should return a string in wintertime", () => {
            const winterTime = "2018-01-01T12:11:47.922Z";

            expect(sensorLayer.getLocalTimeFormat(winterTime, "Europe/Berlin")).to.equal("1. Januar 2018 13:11");
        });
    });

    describe("getFirstPhenomenonTime", () => {
        it("should return undefined if anything but a string is given", () => {
            expect(sensorLayer.getFirstPhenomenonTime(undefined)).to.be.undefined;
            expect(sensorLayer.getFirstPhenomenonTime(null)).to.be.undefined;
            expect(sensorLayer.getFirstPhenomenonTime(123)).to.be.undefined;
            expect(sensorLayer.getFirstPhenomenonTime(true)).to.be.undefined;
            expect(sensorLayer.getFirstPhenomenonTime(false)).to.be.undefined;
            expect(sensorLayer.getFirstPhenomenonTime([])).to.be.undefined;
            expect(sensorLayer.getFirstPhenomenonTime({})).to.be.undefined;
        });
        it("should return the input as it is if a single phenomenon time is recognized", () => {
            expect(sensorLayer.getFirstPhenomenonTime("2020-04-02T14:00:01.100Z")).to.equal("2020-04-02T14:00:01.100Z");
        });
        it("should return first time if phenomenon time interval is given", () => {
            expect(sensorLayer.getFirstPhenomenonTime("2020-04-02T14:00:01.100Z/2020-04-02T14:15:00.000Z")).to.equal("2020-04-02T14:00:01.100Z");
        });
    });

    describe("aggregateDataStreamPhenomenonTime", () => {
        it("should return undefined for undefined input", () => {
            expect(sensorLayer.aggregateDataStreamPhenomenonTime(undefined)).to.be.undefined;
        });
        it("should return feature as is", () => {
            const feature = new Feature({
                geometry: new Point([100, 100])
            });

            expect(sensorLayer.aggregateDataStreamPhenomenonTime(feature)).to.be.instanceof(Feature);
        });
        it("should return feature with dataStreamPhenomenonTime for one dataStream", () => {
            const feature = new Feature({
                dataStreamId: "123",
                dataStreamName: "ds",
                dataStream_123_ds_phenomenonTime: "a",
                geometry: new Point([100, 100])
            });

            expect(sensorLayer.aggregateDataStreamPhenomenonTime(feature)).to.be.instanceof(Feature);
            expect(sensorLayer.aggregateDataStreamPhenomenonTime(feature).get("dataStreamPhenomenonTime")).to.equal("a");
        });
        it("should return feature with dataStreamPhenomenonTime for more dataStreams", () => {
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

    describe("aggregateDataStreamValue", () => {
        it("should return undefined for undefined input", () => {
            expect(sensorLayer.aggregateDataStreamValue(undefined)).to.be.undefined;
        });
        it("should return feature as is", () => {
            const feature = new Feature({
                geometry: new Point([100, 100])
            });

            expect(sensorLayer.aggregateDataStreamValue(feature)).to.be.instanceof(Feature);
        });
        it("should return feature with dataStreamValue for one dataStream", () => {
            const feature = new Feature({
                dataStreamId: "123",
                dataStreamName: "ds",
                dataStream_123_ds: "a",
                geometry: new Point([100, 100])
            });

            expect(sensorLayer.aggregateDataStreamValue(feature)).to.be.instanceof(Feature);
            expect(sensorLayer.aggregateDataStreamValue(feature).get("dataStreamValue")).to.equal("a");
        });
        it("should return feature with dataStreamValue for more dataStreams", () => {
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

    describe("aggregatePropertiesOfOneThing", () => {
        it("should return false if the first parameter is not an object", () => {
            expect(sensorLayer.aggregatePropertiesOfOneThing(undefined)).to.be.false;
            expect(sensorLayer.aggregatePropertiesOfOneThing(null)).to.be.false;
            expect(sensorLayer.aggregatePropertiesOfOneThing(123)).to.be.false;
            expect(sensorLayer.aggregatePropertiesOfOneThing("string")).to.be.false;
            expect(sensorLayer.aggregatePropertiesOfOneThing(true)).to.be.false;
            expect(sensorLayer.aggregatePropertiesOfOneThing(false)).to.be.false;
            expect(sensorLayer.aggregatePropertiesOfOneThing([])).to.be.false;
        });
        it("should return false if the second parameter is not an object", () => {
            expect(sensorLayer.aggregatePropertiesOfOneThing({}, undefined)).to.be.false;
            expect(sensorLayer.aggregatePropertiesOfOneThing({}, null)).to.be.false;
            expect(sensorLayer.aggregatePropertiesOfOneThing({}, 123)).to.be.false;
            expect(sensorLayer.aggregatePropertiesOfOneThing({}, "string")).to.be.false;
            expect(sensorLayer.aggregatePropertiesOfOneThing({}, true)).to.be.false;
            expect(sensorLayer.aggregatePropertiesOfOneThing({}, false)).to.be.false;
            expect(sensorLayer.aggregatePropertiesOfOneThing({}, [])).to.be.false;
        });
        it("should aggregate the properties of the given thing", () => {
            const thing = {
                    "@iot.id": 1024,
                    name: "foo",
                    description: "bar",
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
                    ],
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
                },
                result = {},
                expected = {
                    location: {type: "Point", test: "Test"},
                    properties: {
                        name: "foo",
                        description: "bar",
                        "@iot.id": 1024,
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
                };

            sensorLayer.aggregatePropertiesOfOneThing(thing, result);
            expect(result).to.deep.equal(expected);
        });
    });

    describe("aggregatePropertiesOfThingAsArray", () => {
        it("should return false if the given array of things is not an array", () => {
            expect(sensorLayer.aggregatePropertiesOfThingAsArray(undefined)).to.be.false;
            expect(sensorLayer.aggregatePropertiesOfThingAsArray(null)).to.be.false;
            expect(sensorLayer.aggregatePropertiesOfThingAsArray(123)).to.be.false;
            expect(sensorLayer.aggregatePropertiesOfThingAsArray("string")).to.be.false;
            expect(sensorLayer.aggregatePropertiesOfThingAsArray(true)).to.be.false;
            expect(sensorLayer.aggregatePropertiesOfThingAsArray(false)).to.be.false;
            expect(sensorLayer.aggregatePropertiesOfThingAsArray({})).to.be.false;
        });
        it("should return false if the given result is not an object", () => {
            expect(sensorLayer.aggregatePropertiesOfThingAsArray([], undefined)).to.be.false;
            expect(sensorLayer.aggregatePropertiesOfThingAsArray([], null)).to.be.false;
            expect(sensorLayer.aggregatePropertiesOfThingAsArray([], 123)).to.be.false;
            expect(sensorLayer.aggregatePropertiesOfThingAsArray([], "string")).to.be.false;
            expect(sensorLayer.aggregatePropertiesOfThingAsArray([], true)).to.be.false;
            expect(sensorLayer.aggregatePropertiesOfThingAsArray([], false)).to.be.false;
            expect(sensorLayer.aggregatePropertiesOfThingAsArray([], [])).to.be.false;
        });
        it("should aggregate the properties of the given array of things", () => {
            const things = [
                    {
                        "@iot.id": 1024,
                        name: "foo1",
                        description: "bar1",
                        properties: {
                            foo: "bar"
                        },
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
                        ],
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
                    },
                    {
                        "@iot.id": 1025,
                        name: "foo2",
                        description: "bar2",
                        properties: {
                            foo: "baz"
                        },
                        Datastreams: [
                            {
                                "@iot.id": 10493,
                                "@iot.selfLink": "https://sensorUrlTest",
                                "Observations": [
                                    {
                                        "@iot.id": 124,
                                        "result": "testResult",
                                        "phenomenonTime": "2021-01-22T05:11:31.222Z"
                                    }
                                ],
                                "description": "Lalala",
                                "name": "abc"
                            }
                        ],
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
                    }
                ],
                result = {},
                expected = {
                    location: {type: "Point", test: "Test"},
                    properties: {
                        "@iot.id": "1024 | 1025",
                        foo: "bar | baz",
                        Datastreams: [
                            {
                                "@iot.id": 10492,
                                "@iot.selfLink": "https://sensorUrlTest",
                                Observations: [
                                    {
                                        "@iot.id": 123,
                                        "phenomenonTime": "2021-01-22T05:11:31.222Z",
                                        "result": "testResult"
                                    }
                                ],
                                "description": "Lalala",
                                "name": "abc"
                            },
                            {
                                "@iot.id": 10493,
                                "@iot.selfLink": "https://sensorUrlTest",
                                Observations: [
                                    {
                                        "@iot.id": 124,
                                        "phenomenonTime": "2021-01-22T05:11:31.222Z",
                                        "result": "testResult"
                                    }
                                ],
                                description: "Lalala",
                                name: "abc"
                            }
                        ],
                        description: "bar1 | bar2",
                        name: "foo1 | foo2"
                    }
                };

            sensorLayer.aggregatePropertiesOfThingAsArray(things, result);
            expect(result).to.deep.equal(expected);
        });
    });

    describe("flattenArray", () => {
        it("should return the given input if it is not an array", () => {
            expect(sensorLayer.flattenArray(undefined)).to.be.undefined;
            expect(sensorLayer.flattenArray(null)).to.be.null;
            expect(sensorLayer.flattenArray(123)).to.equal(123);
            expect(sensorLayer.flattenArray("string")).to.equal("string");
            expect(sensorLayer.flattenArray(true)).to.be.true;
            expect(sensorLayer.flattenArray(false)).to.be.false;
            expect(sensorLayer.flattenArray({id: "123"})).to.deep.equal({id: "123"});
        });
        it("should return flattened array for two dimentional arrays", () => {
            expect(sensorLayer.flattenArray([["1", "2"], ["3"], ["4"]])).to.deep.equal(["1", "2", "3", "4"]);
        });
        it("should return empty array on empty array input", () => {
            expect(sensorLayer.flattenArray([])).to.deep.equal([]);
        });
        it("should return a flattened array for a given complex structure", () => {
            expect(sensorLayer.flattenArray([undefined, ["1", "2"], [null], ["3"], 123, "string", true, false])).to.deep.equal([undefined, "1", "2", null, "3", 123, "string", true, false]);
        });
    });

    describe("getStateOfSTALayer", () => {
        it("should return true if certain params are given", () => {
            expect(sensorLayer.getStateOfSTALayer(false, true, false)).to.be.true;
        });
        it("should return false if certain params are given", () => {
            expect(sensorLayer.getStateOfSTALayer(false, false, true)).to.be.false;
            expect(sensorLayer.getStateOfSTALayer(true, false, true)).to.be.false;
            expect(sensorLayer.getStateOfSTALayer(true, true, true)).to.be.false;
        });
        it("should return undefined if certain params are given", () => {
            expect(sensorLayer.getStateOfSTALayer(false, true, true)).to.be.undefined;
            expect(sensorLayer.getStateOfSTALayer(false, false, false)).to.be.undefined;
            expect(sensorLayer.getStateOfSTALayer(true, false, false)).to.be.undefined;
            expect(sensorLayer.getStateOfSTALayer(true, true, false)).to.be.undefined;
        });
    });

    describe("subscribeToSensorThings", () => {
        it("should return false if datastreamIds is not an array", () => {
            expect(sensorLayer.subscribeToSensorThings(undefined)).to.be.false;
            expect(sensorLayer.subscribeToSensorThings(null)).to.be.false;
            expect(sensorLayer.subscribeToSensorThings(123)).to.be.false;
            expect(sensorLayer.subscribeToSensorThings("string")).to.be.false;
            expect(sensorLayer.subscribeToSensorThings(true)).to.be.false;
            expect(sensorLayer.subscribeToSensorThings(false)).to.be.false;
            expect(sensorLayer.subscribeToSensorThings({})).to.be.false;
        });
        it("should return false if subscriptionTopics is not an object", () => {
            expect(sensorLayer.subscribeToSensorThings([], undefined)).to.be.false;
            expect(sensorLayer.subscribeToSensorThings([], null)).to.be.false;
            expect(sensorLayer.subscribeToSensorThings([], 123)).to.be.false;
            expect(sensorLayer.subscribeToSensorThings([], "string")).to.be.false;
            expect(sensorLayer.subscribeToSensorThings([], true)).to.be.false;
            expect(sensorLayer.subscribeToSensorThings([], false)).to.be.false;
            expect(sensorLayer.subscribeToSensorThings([], [])).to.be.false;
        });
        it("should return false if mqttClient is not an object", () => {
            expect(sensorLayer.subscribeToSensorThings([], {}, "version", undefined)).to.be.false;
            expect(sensorLayer.subscribeToSensorThings([], {}, "version", null)).to.be.false;
            expect(sensorLayer.subscribeToSensorThings([], {}, "version", 123)).to.be.false;
            expect(sensorLayer.subscribeToSensorThings([], {}, "version", "string")).to.be.false;
            expect(sensorLayer.subscribeToSensorThings([], {}, "version", true)).to.be.false;
            expect(sensorLayer.subscribeToSensorThings([], {}, "version", false)).to.be.false;
            expect(sensorLayer.subscribeToSensorThings([], {}, "version", [])).to.be.false;
        });
        it("should return true, subscribe with expected topics and set subscription topics to true", () => {
            const topicLogger = [],
                datastreamIds = [1, 2, 3, 4],
                subscriptionTopics = {"1": true, "2": false, "4": false},
                mqttClient = {
                    subscribe: topic => {
                        topicLogger.push(topic);
                    }
                };

            expect(sensorLayer.subscribeToSensorThings(datastreamIds, subscriptionTopics, "1.0", mqttClient)).to.be.true;
            expect(topicLogger).to.deep.equal([
                "v1.0/Datastreams(2)/Observations",
                "v1.0/Datastreams(3)/Observations",
                "v1.0/Datastreams(4)/Observations"
            ]);
            expect(subscriptionTopics).to.deep.equal({"1": true, "2": true, "4": true, "3": true});
        });
        it("should pass through the mqttSubscribeOptions to the mqtt subscribe function", () => {
            const optionsLogger = [],
                datastreamIds = [1, 2, 3],
                subscriptionTopics = {"1": true, "2": false, "3": false},
                mqttClient = {
                    subscribe: (topic, options) => {
                        optionsLogger.push(options);
                    }
                },
                mqttSubscribeOptions = {
                    foo: "bar"
                };

            expect(sensorLayer.subscribeToSensorThings(datastreamIds, subscriptionTopics, "1.0", mqttClient, mqttSubscribeOptions)).to.be.true;
            expect(optionsLogger).to.deep.equal([{foo: "bar"}, {foo: "bar"}]);
        });
    });

    describe("unsubscribeFromSensorThings", () => {
        it("should return false if datastreamIds is not an array", () => {
            expect(sensorLayer.unsubscribeFromSensorThings(undefined)).to.be.false;
            expect(sensorLayer.unsubscribeFromSensorThings(null)).to.be.false;
            expect(sensorLayer.unsubscribeFromSensorThings(123)).to.be.false;
            expect(sensorLayer.unsubscribeFromSensorThings("string")).to.be.false;
            expect(sensorLayer.unsubscribeFromSensorThings(true)).to.be.false;
            expect(sensorLayer.unsubscribeFromSensorThings(false)).to.be.false;
            expect(sensorLayer.unsubscribeFromSensorThings({})).to.be.false;
        });
        it("should return false if subscriptionTopics is not an object", () => {
            expect(sensorLayer.unsubscribeFromSensorThings([], undefined)).to.be.false;
            expect(sensorLayer.unsubscribeFromSensorThings([], null)).to.be.false;
            expect(sensorLayer.unsubscribeFromSensorThings([], 123)).to.be.false;
            expect(sensorLayer.unsubscribeFromSensorThings([], "string")).to.be.false;
            expect(sensorLayer.unsubscribeFromSensorThings([], true)).to.be.false;
            expect(sensorLayer.unsubscribeFromSensorThings([], false)).to.be.false;
            expect(sensorLayer.unsubscribeFromSensorThings([], [])).to.be.false;
        });
        it("should return false if mqttClient is not an object", () => {
            expect(sensorLayer.unsubscribeFromSensorThings([], {}, "version", "isSelected", undefined)).to.be.false;
            expect(sensorLayer.unsubscribeFromSensorThings([], {}, "version", "isSelected", null)).to.be.false;
            expect(sensorLayer.unsubscribeFromSensorThings([], {}, "version", "isSelected", 123)).to.be.false;
            expect(sensorLayer.unsubscribeFromSensorThings([], {}, "version", "isSelected", "string")).to.be.false;
            expect(sensorLayer.unsubscribeFromSensorThings([], {}, "version", "isSelected", true)).to.be.false;
            expect(sensorLayer.unsubscribeFromSensorThings([], {}, "version", "isSelected", false)).to.be.false;
            expect(sensorLayer.unsubscribeFromSensorThings([], {}, "version", "isSelected", [])).to.be.false;
        });
        it("should return true, unsubscribe with expected topics and set subscription topics to false", () => {
            const topicLogger = [],
                datastreamIds = [1, 2, 3, 4],
                subscriptionTopics = {"1": true, "2": true, "4": true},
                mqttClient = {
                    unsubscribe: topic => {
                        topicLogger.push(topic);
                    }
                };

            expect(sensorLayer.unsubscribeFromSensorThings(datastreamIds, subscriptionTopics, "1.0", false, mqttClient)).to.be.true;
            expect(topicLogger).to.deep.equal([
                "v1.0/Datastreams(1)/Observations",
                "v1.0/Datastreams(2)/Observations",
                "v1.0/Datastreams(4)/Observations"
            ]);
            expect(subscriptionTopics).to.deep.equal({"1": false, "2": false, "4": false});
        });
        it("should return true, unsubscribe with expected topics and set subscription topics to false with advanced input", () => {
            const topicLogger = [],
                datastreamIds = [1, 2, 3, 5],
                subscriptionTopics = {"1": true, "2": false, "4": true},
                mqttClient = {
                    unsubscribe: topic => {
                        topicLogger.push(topic);
                    }
                };

            expect(sensorLayer.unsubscribeFromSensorThings(datastreamIds, subscriptionTopics, "1.0", true, mqttClient)).to.be.true;
            expect(topicLogger).to.deep.equal([
                "v1.0/Datastreams(4)/Observations"
            ]);
            expect(subscriptionTopics).to.deep.equal({"1": true, "2": false, "4": false});
        });
    });

    describe("createFeaturesFromSensorData", () => {
        it("should return an empty array for any input that is not an array", () => {
            expect(sensorLayer.createFeaturesFromSensorData(undefined)).to.be.an("array").that.is.empty;
            expect(sensorLayer.createFeaturesFromSensorData(null)).to.be.an("array").that.is.empty;
            expect(sensorLayer.createFeaturesFromSensorData(123)).to.be.an("array").that.is.empty;
            expect(sensorLayer.createFeaturesFromSensorData("string")).to.be.an("array").that.is.empty;
            expect(sensorLayer.createFeaturesFromSensorData(true)).to.be.an("array").that.is.empty;
            expect(sensorLayer.createFeaturesFromSensorData(false)).to.be.an("array").that.is.empty;
            expect(sensorLayer.createFeaturesFromSensorData({})).to.be.an("array").that.is.empty;
        });
        it("should return an empty array for empty array input", () => {
            expect(sensorLayer.createFeaturesFromSensorData([])).to.be.an("array").that.is.empty;
        });
        it("should return an empty array for obj and undefined epsg input", () => {
            const data = [{location: [10, 10]}];

            expect(sensorLayer.createFeaturesFromSensorData(data, "mapProjection", undefined, "gfiTheme", "utc")).to.be.an("array").that.is.empty;
        });
    });
});
