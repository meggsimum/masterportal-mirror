import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector.js";
import * as vectorBase from "../../src/layer/vectorBase";

describe("wms.js", function () {

    describe("createLayerSource", function () {
        it("creates a layerSource", function () {
            const source = vectorBase.createLayerSource();

            expect(source).toBeInstanceOf(VectorSource);
        });
    });

    describe("createLayer", function () {
        it("creates a TileLayer for multi tile requests", function () {
            const attr = {
                    altitudeMode: "clampToGround",
                    cache: false,
                    datasets: {},
                    features: {},
                    gfiAttributes: "ignore",
                    id: "imported_31",
                    isBaseLayer: false,
                    isClustered: false,
                    isSelected: true,
                    isVisibleInTree: true,
                    layerAttribution: "nicht vorhanden",
                    legendURL: "",
                    maxScale: "350000",
                    minScale: "0",
                    name: "ShapeWoBauProE2021geo",
                    parentId: "importedData",
                    supported: ["2D", "3D"],
                    transparent: true,
                    typ: "VectorBase",
                    type: "layer",
                    urlIsVisible: false,
                    useProxy: false
                },
                layer = vectorBase.createLayer(attr);

            expect(layer).toBeInstanceOf(VectorLayer);
        });
    });

    describe("updateSource", function () {
        it("updateSource will fetch layer again", function () {
            const layer = vectorBase.createLayer({id: "id"});

            layer.getSource().refresh = jest.fn();
            vectorBase.updateSource(layer);
            expect(layer.getSource().refresh.mock.calls.length).toBe(1);
        });
    });

});
