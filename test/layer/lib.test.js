import * as lib from "../../src/layer/lib";

describe("wms.js", function () {
    describe("isLayerVisibleInResolution", function () {
        it("returns true if layer is visible from x to y and resolution r is x<=r<=y", function () {
            const mockLayer = {
                getMaxResolution: () => 5,
                getMinResolution: () => 2
            };

            expect(lib.isLayerVisibleInResolution(mockLayer, {resolution: 1})).toBe(false);
            expect(lib.isLayerVisibleInResolution(mockLayer, {resolution: 2})).toBe(true);
            expect(lib.isLayerVisibleInResolution(mockLayer, {resolution: 3})).toBe(true);
            expect(lib.isLayerVisibleInResolution(mockLayer, {resolution: 4})).toBe(true);
            expect(lib.isLayerVisibleInResolution(mockLayer, {resolution: 5})).toBe(true);
            expect(lib.isLayerVisibleInResolution(mockLayer, {resolution: 6})).toBe(false);
        });
    });
});
