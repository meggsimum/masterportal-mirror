import {expect} from "chai";
import Model from "@modules/vectorStyle/textStyle";
import {Text} from "ol/style.js";
import {GeoJSON} from "ol/format.js";

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
        };
    let styleModel,
        jsonObjects;

    before(function () {
        styleModel = new Model();
        jsonObjects = geojsonReader.readFeatures(jsonFeatures);
        styleModel.set("feature", jsonObjects[0], {silent: true});
        styleModel.set("isClustered", false, {silent: true});
    });

    describe("getStyle", function () {
        it("should return a style object", function () {
            expect(styleModel.getStyle()).to.be.an.instanceof(Text);
        });
        it("should not break if a feature on a cluster layer has no 'features' member", function () {
            styleModel.set("isClustered", true); // while feature is still regular

            expect(styleModel.getStyle()).to.be.an.instanceof(Text);
        });
    });

    describe("createLabeledTextStyle", function () {
        it("should return aspected text style", function () {
            styleModel.set("labelField", "name", {silent: true});
            expect(styleModel.createLabeledTextStyle()).to.be.an.instanceof(Text);
            expect(styleModel.createLabeledTextStyle().getText()).to.equal("myName");
        });
    });

    describe("createClusteredTextStyle", function () {
        it("should return aspected text style for unknown clusterTextType", function () {
            styleModel.set("clusterTextType", "not exist", {silent: true});
            expect(styleModel.createClusteredTextStyle()).to.be.an.instanceof(Text);
            expect(styleModel.createClusteredTextStyle().getText()).to.equal("undefined");
        });
        it("should return aspected text style for clusterTextType text", function () {
            styleModel.set("clusterTextType", "text", {silent: true});
            styleModel.set("clusterText", "test", {silent: true});
            expect(styleModel.createClusteredTextStyle()).to.be.an.instanceof(Text);
            expect(styleModel.createClusteredTextStyle().getText()).to.equal("test");
        });
    });
});
