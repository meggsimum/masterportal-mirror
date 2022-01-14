import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector.js";
import * as vectorBase from "../../src/layer/vectorBase";

describe("vectorBase.js", function () {

    describe("createLayerSource", function () {
        it("creates a layerSource", function () {
            const source = vectorBase.createLayerSource();

            expect(source).toBeInstanceOf(VectorSource);
        });
    });

    describe("createLayer", function () {
        it("creates a vector Base Layer", function () {
            const attr = {
                    name: "Albus Percival Wulfric Brian Dumbledore",
                    typ: "VectorBase",
                    gfiAttributes: "ignore",
                    id: "Rawenclaw_01"
                },
                layer = vectorBase.createLayer(attr);

            expect(layer).toBeInstanceOf(VectorLayer);
            expect(layer.get("name")).toEqual("Albus Percival Wulfric Brian Dumbledore");
            expect(layer.get("typ")).toEqual("VectorBase");
            expect(layer.get("id")).toEqual("Rawenclaw_01");
        });
    });

    describe("updateSource", function () {
        it("updateSource will fetch layer again", function () {
            const layer = vectorBase.createLayer({id: "id"}),
                layerGetSourceMock = jest.fn(() => {
                    return {
                        clear: () => this,
                        addFeatures: () => this
                    };
                });

            layer.getSource = layerGetSourceMock;
            vectorBase.updateSource(layer);
            expect(layerGetSourceMock.mock.calls.length).toBe(2);
        });
    });

});
