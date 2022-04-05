import Layer from "@modules/core/modelList/layer/model.js";
import {expect} from "chai";
import sinon from "sinon";

describe("core/modelList/layer/model", function () {
    let model;


    describe("toggleIsSelected", function () {
        let secondModel;

        before(function () {
            secondModel = new Layer({channel: Radio.channel("ThisDoesNotExist")});

            model = new Layer();
            model.set("isSelected", false);
            model.set("id", "model1");
            model.set("parentId", "Baselayer");
            model.set("layerSource", {});
            model.createLayerSource = sinon.stub();
            secondModel.attributes.isSelected = true;
            secondModel.attributes.parentId = "Baselayer";
            secondModel.attributes.layerSource = {};
            secondModel.attributes.id = "model2";
            secondModel.createLayerSource = sinon.stub();

            Radio.trigger("ModelList", "addModel", model);
            Radio.trigger("ModelList", "addModel", secondModel);
        });

        afterEach(function () {
            model.set("isSelected", false);
            secondModel.attributes.isSelected = true;
            sinon.restore();
            sinon.resetHistory();
        });

        it("should deselect all other baselayers if the option singleBaselayer is set to true", function () {
            sinon.stub(Radio, "request").callsFake((...args) => {
                let ret = null;

                args.forEach(arg => {
                    if (arg === "getModelsByAttributes") {
                        ret = [model, secondModel];
                    }
                });
                return ret;
            });
            sinon.stub(Radio, "trigger").callsFake((...args) => {
                args.forEach(arg => {
                    if (arg === "addLayerToIndex") {
                        // do nothing
                    }
                });
            });
            model.set("singleBaselayer", true);
            model.toggleIsSelected();
            expect(model.attributes.isSelected).to.be.true;
            expect(secondModel.attributes.isSelected).to.be.false;
        });

        it("should lead to multiple baselayers being active if the option singleBaselayer is set to false", function () {
            sinon.stub(Radio, "request").callsFake((...args) => {
                let ret = null;

                args.forEach(arg => {
                    if (arg === "getModelsByAttributes") {
                        ret = [model, secondModel];
                    }
                });
                return ret;
            });
            sinon.stub(Radio, "trigger").callsFake((...args) => {
                args.forEach(arg => {
                    if (arg === "addLayerToIndex") {
                        // do nothing
                    }
                });
            });
            model.set("singleBaselayer", false);
            model.toggleIsSelected();
            expect(model.attributes.isSelected).to.be.true;
            expect(secondModel.attributes.isSelected).to.be.true;
        });

        it("should increase the transparency by 10 percent", function () {
            model.setTransparency("30");
            model.incTransparency();

            expect(model.get("transparency")).to.be.a("number");
            expect(model.get("transparency")).equals(40);
        });

        it("should decreases the transparency by 10 percent", function () {
            model.setTransparency("30");
            model.decTransparency();

            expect(model.get("transparency")).to.be.a("number");
            expect(model.get("transparency")).equals(20);
        });
    });
});
