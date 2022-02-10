import {expect} from "chai";
import Model from "@modules/vectorStyle/pointStyle";
import {Style, Icon, Circle} from "ol/style.js";
import {GeoJSON} from "ol/format.js";
import Util from "@testUtil";

describe("textStyleModel", function () {
    const geojsonReader = new GeoJSON(),
        jsonFeatures = {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [10.082125662581083, 53.518872973925404]
                    },
                    "properties": {
                        "id": "test1",
                        "name": "myName",
                        "value": 50,
                        "min": 10,
                        "max": 100,
                        "myObj": {
                            "myCascade": 10,
                            "myArray": [
                                {
                                    "myValue": 20
                                }
                            ]
                        }
                    }
                }
            ]
        },
        utilModel = new Util();
    let jsonObjects,
        styleModel,
        features;

    beforeEach(function () {
        styleModel = new Model();
        jsonObjects = geojsonReader.readFeatures(jsonFeatures);
        features = utilModel.createTestFeatures("resources/testFeatures.xml");
        styleModel.set("feature", jsonObjects[0], {silent: true});
        styleModel.set("isClustered", false, {silent: true});
    });

    describe("getStyle", function () {
        it("should return a style object", function () {
            expect(styleModel.getStyle()).to.be.an.instanceof(Style);
        });
    });

    describe("createIconClusterStyle", function () {
        it("should create icon cluster style", function () {
            expect(styleModel.createIconClusterStyle()).to.be.an.instanceof(Style);
            expect(styleModel.createIconClusterStyle().getImage()).to.be.an.instanceof(Icon);
            expect(styleModel.createIconClusterStyle().getImage().getScale()).to.equal(1);
        });
    });

    describe("createCircleClusterStyle", function () {
        it("should create circle cluster style", function () {
            expect(styleModel.createCircleClusterStyle()).to.be.an.instanceof(Style);
            expect(styleModel.createCircleClusterStyle().getImage()).to.be.an.instanceof(Circle);
            expect(styleModel.createCircleClusterStyle().getImage().getRadius()).to.equal(15);
        });
    });

    describe("getRotationValue", function () {
        it("should return correct rotation value", function () {
            expect(styleModel.getRotationValue({isDegree: true, value: "90"})).to.equal(1.5707963267948966);
            expect(styleModel.getRotationValue({isDegree: false, value: "10"})).to.equal(10);
            expect(styleModel.getRotationValue()).to.equal(0);
        });
        it("should return correct rotation value from an object path", function () {
            styleModel.attributes.values_ = {...styleModel.attributes.values_, angle: 20};

            expect(styleModel.getRotationValue({isDegree: false, value: "@angle"})).to.equal(20);
        });
    });

    describe("createIconPointStyle", function () {
        it("should create icon point style", function () {
            expect(styleModel.createIconPointStyle()).to.be.an.instanceof(Style);
            expect(styleModel.createIconPointStyle().getImage()).to.be.an.instanceof(Icon);
            expect(styleModel.createIconPointStyle().getImage().getScale()).to.equal(1);
        });
    });

    describe("createCirclePointStyle", function () {
        it("should create icon point style", function () {
            expect(styleModel.createCirclePointStyle()).to.be.an.instanceof(Style);
            expect(styleModel.createCirclePointStyle().getImage()).to.be.an.instanceof(Circle);
            expect(styleModel.createCirclePointStyle().getImage().getRadius()).to.equal(10);
        });
    });

    describe("createSVGStyle", function () {
        it("should create icon point style", function () {
            expect(styleModel.createSVGStyle("test")).to.be.an.instanceof(Style);
            expect(styleModel.createSVGStyle("test").getImage()).to.be.an.instanceof(Icon);
            expect(styleModel.createSVGStyle("test").getImage().getSrc()).to.equal("data:image/svg+xml;charset=utf-8,test");
        });
    });

    describe("getScalingAttributesAsObject", function () {
        it("should return an object with empty = 0 for undefined input", function () {
            expect(styleModel.getScalingAttributesAsObject(undefined)).to.be.an("object").to.include({
                empty: 0
            });
        });
        it("should return an object with empty = 0 for empty input", function () {
            expect(styleModel.getScalingAttributesAsObject({})).to.be.an("object").to.include({
                empty: 0
            });
        });
        it("should return an object with available = 0 and empty = 0 for correct input", function () {
            expect(styleModel.getScalingAttributesAsObject({available: [
                0, 220, 0, 0
            ]})).to.be.an("object").to.include({
                available: 0,
                empty: 0
            });
        });
    });

    describe("fillScalingAttributes", function () {
        it("should return an object with empty = 0 for undefined input", function () {
            expect(styleModel.fillScalingAttributes(undefined, undefined)).to.be.an("object").to.include({
                empty: 0
            });
        });
        it("should return an object with empty = 0 for empty input", function () {
            expect(styleModel.fillScalingAttributes({}), "").to.be.an("object").to.include({
                empty: 0
            });
        });
        it("should return an object with empty = 1 for object with empty: 0 and false string input", function () {
            expect(styleModel.fillScalingAttributes({empty: 0}, "test")).to.be.an("object").to.include({
                empty: 1
            });
        });
        it("should return an object with empty = 0 for undefined input", function () {
            const scalingAttributesAsObject = {
                    available: 0,
                    charging: 0,
                    outoforder: 0,
                    empty: 0
                },
                scalingAttribute = "available | available";

            expect(styleModel.fillScalingAttributes(scalingAttributesAsObject, scalingAttribute))
                .to.be.an("object").to.include({
                    available: 2,
                    charging: 0,
                    outoforder: 0,
                    empty: 0
                });
        });
    });

    describe("calculateCircleSegment", function () {
        it("should return a string that contains a circlesegment as svg-string for data of a semicircle input", function () {
            const startAngelDegree = 0,
                endAngelDegree = 180,
                circleRadius = 21,
                size = 58,
                gap = 10;

            expect(styleModel.calculateCircleSegment(startAngelDegree, endAngelDegree, circleRadius, size, gap)).to.be.a("string")
                .to.equal("M 49.920088659926655 27.16972940229918 A 21 21 0 0 0 8.079911340073345 27.16972940229918");
            expect(styleModel.calculateCircleSegment(0, 360, circleRadius, size, gap)).to.be.a("string")
                .to.equal("M 50 29 A 21 21 0 0 0 8 28.999999999999996 A 21 21 0 0 0 50 29");

        });
    });

    describe("calculateSizeIntervalCircleBar", function () {
        it("should be 10 at large circleBarRadius and small values input", function () {
            expect(styleModel.calculateSizeIntervalCircleBar(5, 1, 3, 5)).to.be.a("number").to.equal(10);
        });
        it("should be 20 at large circleBarRadius and large values input", function () {
            expect(styleModel.calculateSizeIntervalCircleBar(5, 2, 10, 5)).to.be.a("number").to.equal(30);
        });
        it("should be 10 at large circleBarRadius and stateValue is NaN input", function () {
            expect(styleModel.calculateSizeIntervalCircleBar(NaN, 2, 10, 5)).to.be.a("number").to.equal(10);
        });
    });

    describe("calculateLengthIntervalCircleBar", function () {
        it("should be 1 for positive stateValue input", function () {
            expect(styleModel.calculateLengthIntervalCircleBar(10, 1, 3, 1)).to.be.a("number").to.equal(1);
        });
        it("should be 12 fop negative stateValue input", function () {
            expect(styleModel.calculateLengthIntervalCircleBar(10, 2, -1, 5)).to.be.a("number").to.equal(12);
        });
        it("should be 0 for stateValue is NaN input", function () {
            expect(styleModel.calculateLengthIntervalCircleBar(10, 2, NaN, 5)).to.be.a("number").to.equal(0);
        });
        it("should be 0 for stateValue is undefined input", function () {
            expect(styleModel.calculateLengthIntervalCircleBar(10, 2, undefined, 5)).to.be.a("number").to.equal(0);
        });
    });

    describe("createNominalCircleSegments", function () {
        it("should be an svg by default values input", function () {
            expect(styleModel.createNominalCircleSegments(features[0]))
                .to.equal("<svg width='38' height='38' xmlns='http://www.w3.org/2000/svg'"
                + " xmlns:xlink='http://www.w3.org/1999/xlink'><circle cx='19' cy='19' r='10'"
                + " stroke='#ffffff' stroke-width='4' fill='#ffffff' fill-opacity='0'/></svg>");
        });
    });

    describe("normalizeRgbColor", function () {
        it("should be extend the given array with length 3 by value 1", function () {
            expect(styleModel.normalizeRgbColor([255, 255, 255])).to.be.an("array").to.include.ordered.members([255, 255, 255, 1]);
        });
        it("should be extend the given array with length 2 by value 1, 1", function () {
            expect(styleModel.normalizeRgbColor([255, 255])).to.be.an("array").to.include.ordered.members([255, 255, 1, 1]);
        });
        it("should be return the input value, which is an array with length 4", function () {
            expect(styleModel.normalizeRgbColor([0, 0, 0, 0])).to.be.an("array").to.include.ordered.members([0, 0, 0, 0]);
        });
        it("should be return the input value, which is an array with length > 4", function () {
            expect(styleModel.normalizeRgbColor([1, 2, 3, 4, 5])).to.be.an("array").to.include.ordered.members([1, 2, 3, 4]);
        });
    });

    describe("createIntervalCircleBar", function () {
        it("should be an svg by default values input", function () {
            expect(styleModel.createIntervalCircleBar(features[0]))
                .to.equal("<svg width='12' height='12' xmlns='http://www.w3.org/2000/svg'"
                + " xmlns:xlink='http://www.w3.org/1999/xlink'><line x1='6' y1='6' x2='6'"
                + " y2='0' stroke='#000000' stroke-width='5' /><circle cx='6' cy='6' r='6'"
                + " stroke='#000000' stroke-width='1' fill='#000000' /></svg>");
        });
    });
});
