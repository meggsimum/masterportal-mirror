import Model from "@modules/core/modelList/list.js";
import {expect} from "chai";
import sinon from "sinon";

describe("core/modelList/list", function () {
    let model;

    const testLightModels = [
            {
                id: "713",
                transparency: 0,
                isSelected: false
            },
            {
                id: "714",
                transparency: 0,
                isSelected: false
            },
            {
                id: "715",
                transparency: 0,
                isSelected: false
            }
        ],
        testParamLayers = [
            {
                id: "713",
                transparency: 50,
                visibility: true
            }
        ],
        testParamLayersFailure = [
            {
                id: "718",
                transparency: 10,
                visibility: true
            }
        ];

    before(function () {
        model = new Model();
    });

    describe("mergeParamsToLightModels (Für dev müssen die Test angepasst werden!!)", function () {
        it("should return lightModels array reversed", function () {
            expect(model.mergeParamsToLightModels(testLightModels, undefined)[2]).to.include({
                id: "713",
                transparency: 0,
                isSelected: false
            });
        });

        it("should return unchanged lightModels array", function () {
            expect(model.mergeParamsToLightModels(testLightModels, testParamLayersFailure)).to.be.an("array").to.deep.include({
                id: "713",
                transparency: 0,
                isSelected: false
            },
            {
                id: "714",
                transparency: 0,
                isSelected: false
            },
            {
                id: "715",
                transparency: 0,
                isSelected: false
            });
        });

        it("should return reversed lightModels array with id: 713 transparency: 50 and isSelected: true", function () {
            expect(model.mergeParamsToLightModels(testLightModels, testParamLayers)[2]).to.include({
                id: "713",
                transparency: 50,
                isSelected: true
            });
        });
        describe("sortLayers", function () {
            const gModel = new Backbone.Model({
                    "id": "1001",
                    "name": "gLayer"
                }),
                xModel = new Backbone.Model({
                    "id": "1002",
                    "name": "xLayer"
                }),
                aModel = new Backbone.Model({
                    "id": "1003",
                    "name": "aLayer"
                });

            it("should return an sorted array by key", function () {
                const layer = [
                        gModel,
                        xModel,
                        aModel
                    ],
                    key = "name";

                expect(model.sortLayers(layer, key)).to.be.an("array")
                    .to.nested.include(aModel)
                    .and.to.nested.include(gModel)
                    .and.to.nested.include(xModel);
            });

            it("should return an the input array by key is undefined", function () {
                const layer = [
                    gModel,
                    xModel,
                    aModel
                ];

                let key;

                expect(model.sortLayers(layer, key)).to.be.an("array")
                    .to.nested.include(gModel)
                    .and.to.nested.include(xModel)
                    .and.to.nested.include(aModel);
            });

            it("should return an empty array by empty input", function () {
                const layer = [],
                    key = "";

                expect(model.sortLayers(layer, key)).to.be.an("array").that.is.empty;
            });
        });
        describe("removeLayerById", function () {
            const xModel = new Backbone.Model({
                    "id": "1001",
                    "name": "gLayer"
                }),
                yModel = new Backbone.Model({
                    "id": "1002",
                    "name": "xLayer"
                }),
                zModel = new Backbone.Model({
                    "id": "1003",
                    "name": "aLayer"
                });

            it("should remove layer", function () {
                model.add([xModel, yModel, zModel]);
                model.removeLayerById("1001");
                expect(model.get("1001")).to.be.undefined;
            });
            it("schould return length of collection", function () {
                model.add([xModel, yModel, zModel]);
                model.removeLayerById("1001");
                expect(model).to.have.lengthOf(2);
            });
        });
        describe("selectedChanged", () => {
            let AModel;

            before(() => {
                AModel = Backbone.Model.extend({
                    defaults: {
                        id: "9999",
                        type: "xyz",
                        isVisibleInMap: false
                    },
                    resetSelectionIDX: () => sinon.stub(),
                    setIsVisibleInMap: function (value) {
                        this.set("isVisibleInMap", value);
                    }
                });
            });

            it("should set isVisibleInMap to true if model has type layer", () => {
                const abcModel = new AModel({type: "layer"});

                model.selectedChanged(abcModel, true);
                expect(abcModel.get("isVisibleInMap")).to.be.true;
            });
            it("should set isVisibleInMap to false if model has other type", () => {
                const abcModel = new AModel({type: "abc"});

                model.selectedChanged(abcModel, true);
                expect(abcModel.get("isVisibleInMap")).to.be.false;
            });
        });
    });
});
