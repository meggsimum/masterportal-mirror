import Model from "@modules/tools/featureLister/model.js";
import {expect} from "chai";
import sinon from "sinon";
import store from "../../../../../src/app-store";

describe("featureLister/model", function () {
    let model;

    const exampleSchool = [{
            "adresse_ort": "21147 Hamburg",
            "schulform": "Grundschule",
            "schulname": "Beispielname",
            "schultyp": "Hauptstandort",
            "stadtteil": "Neugraben-Fischbek",
            "adresse_strasse_hausnr": "Schulstraße 123",
            "Testeintrag_1": "Sollte nicht im Ergebnis enthalten sein.",
            "Testeintrag_2": "Sollte auch nicht im Ergebnis enthalten sein, da nicht in exampleGfiList."
        }],
        exampleGfiList = {
            "schulname": "Name",
            "schulform": "Schulform",
            "schultyp": "Schulstandort",
            "schwerpunktschule": "Schwerpunktschule Inklusion",
            "adresse_strasse_hausnr": "Straße",
            "adresse_ort": "Ort",
            "stadtteil": "Stadtteil"
        },
        expectedResult = [{
            Name: "Beispielname",
            Schulform: "Grundschule",
            Schulstandort: "Hauptstandort",
            Straße: "Schulstraße 123",
            Ort: "21147 Hamburg",
            Stadtteil: "Neugraben-Fischbek"
        }],
        testString = "TestString_1234_!?",
        expectedTestString = "TestString 1234_!?";

    describe("translateGFI", function () {
        model = new Model();

        it("should return the correct entries with modified keys for the entered school", function () {
            expect(model.translateGFI(exampleSchool, exampleGfiList)).to.deep.equal(expectedResult);
        });
        it("should not be equal", function () {
            delete exampleGfiList.schultyp;
            expect(model.translateGFI(exampleSchool, exampleGfiList)).to.not.deep.equal(expectedResult);
        });
        it("should be equal", function () {
            delete exampleGfiList.schultyp;
            delete expectedResult[0].Schulstandort;
            expect(model.translateGFI(exampleSchool, exampleGfiList)).to.deep.equal(expectedResult);
        });
        it("should be an empty Array for empty GfiList", function () {
            expect(model.translateGFI(exampleSchool, {})).to.deep.equal([]);
        });
        it("should be an empty Array for empty school", function () {
            expect(model.translateGFI([], exampleGfiList)).to.deep.equal([]);
        });
    });
    describe("beautifyString", function () {
        model = new Model();

        it("should be equal with the expected string", function () {
            expect(model.beautifyString(testString)).to.be.equal(expectedTestString);
        });
        it("should return an empty string", function () {
            expect(model.beautifyString("")).to.be.equal("");
        });
        it("should return an error for a number", function () {
            expect(() => model.beautifyString(1234)).to.throw(Error);
        });
        it("should return an error for NaN", function () {
            expect(() => model.beautifyString(NaN)).to.throw(Error);
        });
        it("should return an error for null", function () {
            expect(() => model.beautifyString(null)).to.throw(Error);
        });
        it("should return an error for array", function () {
            expect(() => model.beautifyString([])).to.throw(Error);
        });
        it("should return an error for object", function () {
            expect(() => model.beautifyString({})).to.throw(Error);
        });
    });
    describe("isValidKey", function () {
        const ignoredKeys = [
            "ignoredKey1",
            "ignoredKey2",
            "ignoredKey3",
            "ignoredKey4",
            "ignoredKey5"
        ];

        model = new Model();

        it("should return true for a valid key", function () {
            expect(model.isValidKey("TestKey", ignoredKeys)).to.be.true;
        });
        it("should return true for an empty key", function () {
            expect(model.isValidKey("", ignoredKeys)).to.be.true;
        });
        it("should return false for a key which is listed under the ignoredKeys in the config", function () {
            ignoredKeys.push("TESTKEY");
            expect(model.isValidKey("TESTKEY", ignoredKeys)).to.be.false;
        });
        it("should return an error for a number", function () {
            expect(() => model.isValidKey(1234, ignoredKeys)).to.throw(Error);
        });
        it("should return an error for undefined", function () {
            expect(() => model.isValidKey(undefined, ignoredKeys)).to.throw(Error);
        });
        it("should return  an error for NaN", function () {
            expect(() => model.isValidKey(NaN, ignoredKeys)).to.throw(Error);
        });
        it("should return  an error for null", function () {
            expect(() => model.isValidKey(null, ignoredKeys)).to.throw(Error);
        });
        it("should return  an error for an array", function () {
            expect(() => model.isValidKey([], ignoredKeys)).to.throw(Error);
        });
        it("should return  an error for an object", function () {
            expect(() => model.isValidKey({}, ignoredKeys)).to.throw(Error);
        });
    });
    describe("isValidValue", function () {
        model = new Model();

        it("should return true for a valid value", function () {
            expect(model.isValidValue("TestValue")).to.be.true;
        });
        it("should return false for an empty string", function () {
            expect(model.isValidValue("")).to.be.false;
        });
        it("should return false for undefined", function () {
            expect(model.isValidValue("NULL")).to.be.false;
        });
        it("should return false for a number", function () {
            expect(model.isValidValue(1234)).to.be.false;
        });
        it("should return false for undefined", function () {
            expect(model.isValidValue(undefined)).to.be.false;
        });
        it("should return false for undefined", function () {
            expect(model.isValidValue(null)).to.be.false;
        });
        it("should return false for undefined", function () {
            expect(model.isValidValue(NaN)).to.be.false;
        });
    });
    describe("highlightFeature", function () {
        model = new Model();
        const feature = {
                id: "featureId"
            },
            featureWrapper = {
                id: "featureId",
                feature: feature
            },
            layer = {
                id: "layerId",
                styleId: "styleId",
                name: "name",
                style: {},
                geometryType: "Polygon",
                features: [
                    featureWrapper
                ]
            };

        beforeEach(() => {
            model.set("layer", layer);
            store.dispatch = sinon.spy();
        });
        afterEach(() => {
            sinon.restore();
        });

        it("highlightFeature type polygon or line", function () {
            const fill = model.get("highlightVectorRulesPolygon").fill,
                stroke = model.get("highlightVectorRulesPolygon").stroke;

            model.highlightFeature("featureId");

            expect(store.dispatch.calledOnce).to.be.true;
            expect(store.dispatch.args[0]).to.include.members(["Map/highlightFeature"]);
            expect(store.dispatch.args[0][1].type).to.be.equals("highlightPolygon");
            expect(store.dispatch.args[0][1].id).to.be.equals("featureId");
            expect(store.dispatch.args[0][1].layer).to.be.deep.equals(layer);
            expect(store.dispatch.args[0][1].feature).to.be.deep.equals(feature);
            expect(store.dispatch.args[0][1].scale).to.be.undefined;
            expect(store.dispatch.args[0][1].highlightStyle).not.to.be.undefined;
            expect(store.dispatch.args[0][1].highlightStyle.fill).to.be.equals(fill);
            expect(store.dispatch.args[0][1].highlightStyle.stroke).to.be.equals(stroke);
        });
        it("highlightFeature type point", function () {
            const scale = model.get("highlightVectorRulesPointLine").image.scale;

            layer.geometryType = "Point";
            model.highlightFeature("featureId");

            expect(store.dispatch.calledOnce).to.be.true;
            expect(store.dispatch.args[0]).to.include.members(["Map/highlightFeature"]);
            expect(store.dispatch.args[0][1].type).to.be.equals("increase");
            expect(store.dispatch.args[0][1].id).to.be.equals("featureId");
            expect(store.dispatch.args[0][1].layer).to.be.deep.equals(layer);
            expect(store.dispatch.args[0][1].feature).to.be.deep.equals(feature);
            expect(store.dispatch.args[0][1].scale).to.be.equals(scale);
        });
        it("highlightFeature type MultiPoint", function () {
            const scale = model.get("highlightVectorRulesPointLine").image.scale;

            layer.geometryType = "MultiPoint";
            model.highlightFeature("featureId");

            expect(store.dispatch.calledOnce).to.be.true;
            expect(store.dispatch.args[0]).to.include.members(["Map/highlightFeature"]);
            expect(store.dispatch.args[0][1].type).to.be.equals("increase");
            expect(store.dispatch.args[0][1].id).to.be.equals("featureId");
            expect(store.dispatch.args[0][1].layer).to.be.deep.equals(layer);
            expect(store.dispatch.args[0][1].feature).to.be.deep.equals(feature);
            expect(store.dispatch.args[0][1].scale).to.be.equals(scale);
        });

    });
    describe("addLayerToList", function () {
        model = new Model();
        const feature = {
                id: "featureId",
                getGeometry: () => {
                    return {
                        getType: () => "Point"
                    };
                }
            },
            olLayer = {
                getSource: () => {
                    return {
                        getFeatures: () =>{
                            return features;
                        }
                    };
                }
            },
            layer = {
                id: "layerId",
                get: (key) => {
                    if (key === "layer") {
                        return olLayer;
                    }
                    if (key === "styleId") {
                        return "styleId";
                    }
                    if (key === "name") {
                        return "name";
                    }
                    if (key === "style") {
                        return "style";
                    }
                    return null;
                }
            };
        let features = [feature];


        beforeEach(() => {
            model.set("layerlist", []);
        });

        it("addLayerToList, layer with feature", function () {
            expect(model.get("layerlist").length).to.be.equals(0);
            model.addLayerToList(layer);

            expect(model.get("layerlist")).to.be.an("Array");
            expect(model.get("layerlist")[0].id).to.be.equals("layerId");
            expect(model.get("layerlist")[0].styleId).to.be.equals("styleId");
            expect(model.get("layerlist")[0].name).to.be.equals("name");
            expect(model.get("layerlist")[0].style).to.be.equals("style");
            expect(model.get("layerlist")[0].geometryType).to.be.equals("Point");

        });
        it("addLayerToList, layer without feature", function () {
            features = [];
            expect(model.get("layerlist").length).to.be.equals(0);
            model.addLayerToList(layer);

            expect(model.get("layerlist")).to.be.an("Array");
            expect(model.get("layerlist")[0].id).to.be.equals("layerId");
            expect(model.get("layerlist")[0].styleId).to.be.equals("styleId");
            expect(model.get("layerlist")[0].name).to.be.equals("name");
            expect(model.get("layerlist")[0].style).to.be.equals("style");
            expect(model.get("layerlist")[0].geometryType).to.be.equals("none");

        });
        it("addLayerToList, layer is undefined", function () {
            model.addLayerToList();

            expect(model.get("layerlist")).to.be.an("Array");
            expect(model.get("layerlist").length).to.be.equals(0);
        });


    });
});
