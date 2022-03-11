import {expect} from "chai";
import Model from "@modules/vectorStyle/style";

describe("vectorStyleModel", function () {
    let styleModel;


    before(function () {
        styleModel = new Model();
    });

    describe("prepareField", function () {
        it("Should return value from key if key is not an object path", function () {
            const field = "key1",
                featureProperties = {
                    key1: 1,
                    key2: 10
                };

            expect(styleModel.prepareField(featureProperties, field)).to.equal(1);
        });
        it("Should return value from key if key is an object path", function () {
            const field = "@Datastreams.0.Observations.0.value",
                featureProperties = {
                    key1: 1,
                    Datastreams: [
                        {
                            Observations: [
                                {
                                    value: 15
                                }
                            ]
                        }
                    ]
                };

            expect(styleModel.prepareField(featureProperties, field)).to.equal(15);
        });
        it("Should not overwrite styles if style definitions are not provided", function () {
            const defaultStyles = {
                "circleRadius": 10,
                "circleFillColor": [0, 153, 255, 1],
                "circleStrokeColor": [0, 0, 0, 1],
                "circleStrokeWidth": 2
            };

            styleModel.set(defaultStyles);
            styleModel.overwriteStyling(undefined);

            expect(styleModel.attributes).to.deep.equal(defaultStyles);
        });
    });
});
