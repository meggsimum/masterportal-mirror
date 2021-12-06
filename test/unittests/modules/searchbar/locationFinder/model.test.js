import LocationFinderModel from "@modules/searchbar/locationFinder/model.js";
import {expect, assert} from "chai";
import sinon from "sinon";

describe("modules/searchbar/locationFinder", function () {

    let model;

    beforeEach(function () {
        model = new LocationFinderModel({
            serviceId: "testId"
        });
        model.set("serviceUrl", "testServiceUrl");
        model.transformToMapProjection = function (map, fromCRS, coordinate) {
            return coordinate;
        };
        model.getProjection = function (crs) {
            return crs === "EPSG:25832";
        };
    });

    describe("search", function () {

        it("Build URL and payload", function () {

            model.set("spatialReference", "testEpsgCode");

            model.sendRequest = function (url, payload) {
                expect(url).to.eq("testServiceUrl/Lookup");
                expect(payload).to.eql({
                    query: "helloWorld",
                    sref: "testEpsgCode"
                });
            };

            model.search("helloWorld");
        });

        it("Build URL and payload for class", function () {

            model.set("classes", [{
                name: "Adresse"
            },
            {
                name: "Straßenname"
            }]);
            model.set("spatialReference", "testEpsgCode");

            model.sendRequest = function (url, payload) {
                expect(url).to.eq("testServiceUrl/Lookup");
                expect(payload).to.eql({
                    query: "helloWorld",
                    filter: "type:Adresse,Straßenname",
                    sref: "testEpsgCode"
                });
            };

            model.search("helloWorld");

        });

        it("Push result to list", function () {

            const sandbox = sinon.createSandbox(),
                testResponse = {
                    "ok": true,
                    "info": "ok",
                    "sref": 25832,
                    "count": 4,
                    "locs": [
                        {
                            "id": 922,
                            "type": "Straßenname",
                            "name": "Feuerbacher Heide",
                            "cx": 511208.97,
                            "cy": 5403930.32,
                            "xmin": 511168.58,
                            "ymin": 5403876.51,
                            "xmax": 511480.12,
                            "ymax": 5404253.75
                        },
                        {
                            "id": 30383,
                            "type": "Adresse",
                            "name": "Feuerbacher Heide 53B",
                            "cx": 511429.4,
                            "cy": 5404212.63,
                            "xmin": 511407.82,
                            "ymin": 5404190.61,
                            "xmax": 511444.33,
                            "ymax": 5404221.86
                        }
                    ]
                };

            let numberOfPushedItems = 0;

            sandbox.stub(Radio, "request").callsFake(function () {
                // Nothing to do
            });

            sandbox.stub(Radio, "trigger").callsFake(function (channel, topic, event, value) {
                switch (topic) {
                    case "createRecommendedList":
                        expect(numberOfPushedItems).to.equal(2);
                        break;
                    case "abortSearch":
                        assert.fail("Unexpected abortSearch");
                        break;
                    case "pushHits":

                        switch (value.name) {
                            case "Feuerbacher Heide":
                                expect(value).to.deep.include({
                                    type: "Straßenname",
                                    icon: "bi-signpost-2",
                                    coordinate: [511208.97, 5403930.32]
                                });
                                numberOfPushedItems++;
                                break;
                            case "Feuerbacher Heide 53B":
                                expect(value).to.deep.include({
                                    type: "Adresse",
                                    icon: "bi-signpost-2",
                                    coordinate: [511429.4, 5404212.63]
                                });
                                numberOfPushedItems++;
                                break;
                            default:
                                assert.fail("Unexpected item");
                                break;
                        }

                        break;
                    default:
                        assert.fail("Unknown Radio request " + topic);
                        break;
                }
            });

            model.pushSuggestions(testResponse);

            sandbox.restore();

        });

        it("Push result to list after applying class settings (filter)", function () {

            const sandbox = sinon.createSandbox(),
                testResponse = {
                    "ok": true,
                    "info": "ok",
                    "sref": 25832,
                    "count": 4,
                    "locs": [
                        {
                            "id": 922,
                            "type": "Straßenname",
                            "name": "Feuerbacher Heide",
                            "cx": 511208.97,
                            "cy": 5403930.32,
                            "xmin": 511168.58,
                            "ymin": 5403876.51,
                            "xmax": 511480.12,
                            "ymax": 5404253.75
                        },
                        {
                            "id": 30383,
                            "type": "Adresse",
                            "name": "Feuerbacher Heide 53B",
                            "cx": 511429.4,
                            "cy": 5404212.63,
                            "xmin": 511407.82,
                            "ymin": 5404190.61,
                            "xmax": 511444.33,
                            "ymax": 5404221.86
                        },
                        {
                            "id": 6336,
                            "type": "Haltestelle",
                            "name": "Feuerbacher Weg",
                            "cx": 512044.83,
                            "cy": 5404896.77,
                            "xmin": 511744.83,
                            "ymin": 5404596.77,
                            "xmax": 512344.83,
                            "ymax": 5405196.77
                        }
                    ]
                };

            let numberOfPushedItems = 0;

            sandbox.stub(Radio, "request").callsFake(function () {
                // Nothing to do
            });

            sandbox.stub(Radio, "trigger").callsFake(function (channel, topic, event, value) {
                switch (topic) {
                    case "createRecommendedList":
                        expect(numberOfPushedItems).to.equal(2);
                        break;
                    case "abortSearch":
                        assert.fail("Unexpected abortSearch");
                        break;
                    case "pushHits":

                        switch (value.name) {
                            case "Feuerbacher Heide":
                                expect(value).to.deep.include({
                                    type: "Straßenname",
                                    icon: "bi-signpost-2",
                                    coordinate: [511168.58, 5403876.51, 511480.12, 5403876.51, 511480.12, 5404253.75, 511168.58, 5404253.75, 511168.58, 5403876.51]
                                });
                                numberOfPushedItems++;
                                break;
                            case "Feuerbacher Heide 53B":
                                expect(value).to.deep.include({
                                    type: "Adresse",
                                    icon: "bi-house-door-fill",
                                    coordinate: [511429.4, 5404212.63]
                                });
                                numberOfPushedItems++;
                                break;
                            default:
                                assert.fail("Unexpected item");
                                break;
                        }

                        break;
                    default:
                        assert.fail("Unknown Radio request " + topic);
                        break;
                }
            });

            model.set("classes", [
                {
                    "name": "Adresse",
                    "icon": "bi-house-door-fill"
                },
                {
                    "name": "Straßenname",
                    "zoom": "bbox"
                }
            ]);

            model.pushSuggestions(testResponse);

            sandbox.restore();

        });
    });
});
