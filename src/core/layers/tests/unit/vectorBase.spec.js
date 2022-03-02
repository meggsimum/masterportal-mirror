import {expect} from "chai";
import sinon from "sinon";
import VectorBaseLayer from "../../vectorBase";
import mapCollection from "../../../../core/dataStorage/mapCollection.js";

describe("src/core/layers/vectorBase.js", () => {
    let attributes;

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

        mapCollection.addMap(map, "ol", "2D");
    });
    beforeEach(() => {
        attributes = {
            name: "vectorBaseTestLayer",
            id: "id",
            typ: "VectorBase",
            isSelected: false,
            features: sinon.stub()
        };
    });

    afterEach(() => {
        sinon.restore();
    });

    it("createLayer shall create an ol.Layer with source", function () {
        const Layer = new VectorBaseLayer(attributes),
            layer = Layer.get("layer");

        expect(layer).not.to.be.undefined;
        expect(layer.getSource()).not.to.be.undefined;
    });

    it("createLegend shall set legend", function () {
        attributes.legendURL = "https://legendUrl";
        const layer = new VectorBaseLayer(attributes);

        expect(layer.get("legend")).to.be.deep.equals([attributes.legendURL]);

    });

    it("updateSource shall update source", function () {
        const updateSourceStub = sinon.spy(VectorBaseLayer.prototype, "updateSource");

        new VectorBaseLayer(Object.assign(attributes, {isSelected: true}));

        expect(updateSourceStub.calledOnce).to.be.true;

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

        it("hideAllFeatures", function () {
            const layer = new VectorBaseLayer(attributes),
                olLayer = layer.get("layer"),
                clearStub = sinon.stub(olLayer.getSource(), "clear"),
                addFeaturesStub = sinon.stub(olLayer.getSource(), "addFeatures");

            sinon.stub(olLayer.getSource(), "getFeatures").returns(features);

            layer.hideAllFeatures();

            expect(layer.get("layer").getSource().getFeatures().length).to.be.equals(3);
            expect(clearStub.calledOnce).to.be.true;
            expect(addFeaturesStub.calledOnce).to.be.true;
            expect(typeof style1).to.be.equals("function");
            expect(style1()).to.be.null;
            expect(typeof style2).to.be.equals("function");
            expect(style2()).to.be.null;
            expect(typeof style3).to.be.equals("function");
            expect(style3()).to.be.null;

        });
        it("showAllFeatures", function () {
            const layer = new VectorBaseLayer(attributes),
                olLayer = layer.get("layer");

            sinon.stub(olLayer.getSource(), "getFeatures").returns(features);
            layer.showAllFeatures();

            expect(layer.get("layer").getSource().getFeatures().length).to.be.equals(3);
            expect(style1).to.be.equals(undefined);
            expect(style2).to.be.equals(undefined);
            expect(style3).to.be.equals(undefined);

        });
        it("showFeaturesByIds", function () {
            const layer = new VectorBaseLayer(attributes),
                olLayer = layer.get("layer"),
                clearStub = sinon.stub(olLayer.getSource(), "clear");

            sinon.stub(olLayer.getSource(), "addFeatures");
            sinon.stub(olLayer.getSource(), "getFeatures").returns(features);
            sinon.stub(olLayer.getSource(), "getFeatureById").returns(features[0]);
            layer.showFeaturesByIds(["1"]);

            expect(layer.get("layer").getSource().getFeatures().length).to.be.equals(3);
            expect(style1).to.be.equals(undefined);
            expect(typeof style2).to.be.equals("function");
            expect(style2()).to.be.null;
            expect(typeof style3).to.be.equals("function");
            expect(style3()).to.be.null;
            expect(clearStub.calledOnce).to.be.true;
        });
    });

    describe("functions for styling", () => {
        it("getStyleAsFunction shall return a function", function () {
            const layer = new VectorBaseLayer(attributes);

            /* eslint-disable-next-line require-jsdoc */
            function styleFn () {
                return "test";
            }

            let ret = layer.getStyleAsFunction(styleFn);

            expect(typeof ret).to.be.equals("function");
            expect(ret()).to.be.equals("test");

            ret = layer.getStyleAsFunction("test");
            expect(typeof ret).to.be.equals("function");
            expect(ret()).to.be.equals("test");
        });
        it("styling shall set style", function () {
            const layer = new VectorBaseLayer(attributes);

            /* eslint-disable-next-line require-jsdoc */
            function styleFn () {
                return "test";
            }
            layer.set("style", styleFn);

            layer.styling();
            expect(typeof layer.get("layer").getStyle()).to.be.equals("function");
            expect(layer.get("layer").getStyle()()).to.be.equals("test");
        });
    });
});
