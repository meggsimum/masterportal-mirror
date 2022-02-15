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
});
