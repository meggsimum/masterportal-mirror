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

    describe("getLegendURLs", function () {
        const expectedBaseString = "example.com&SERVICE=WMS&REQUEST=GetLegendGraphic&FORMAT=image/png?VERSION=0.0.1&LAYER=";

        it("returns the defined legendURL if given via services.json", function () {
            const legendURL = lib.getLegendURLs({
                legendURL: "example.com/legend.png",
                layers: "a,b",
                url: "example.com",
                version: "0.0.1",
                typ: "WMS"
            });

            expect(legendURL).toEqual(["example.com/legend.png"]);
        });

        it("returns an empty array if legendURL is defined as 'ignore' services.json", function () {
            const legendURL = lib.getLegendURLs({
                legendURL: "ignore",
                layers: "a,b",
                url: "example.com",
                version: "0.0.1",
                typ: "WMS"
            });

            expect(legendURL).toEqual([]);
        });

        it("returns an empty array if no layers were requested", function () {
            const legendURLs = lib.getLegendURLs({
                layers: "",
                url: "example.com",
                version: "0.0.1",
                typ: "WMS"
            });

            expect(legendURLs.length).toBe(0);
        });

        it("returns one correct legend URL if one layer was requested", function () {
            const legendURLs = lib.getLegendURLs({
                layers: "a",
                url: "example.com",
                version: "0.0.1",
                typ: "WMS"
            });

            expect(legendURLs.length).toBe(1);
            expect(legendURLs[0]).toEqual(expectedBaseString + "a");
        });

        it("returns multiple correct legend URLs if multiple layers were requested", function () {
            const legendURLs = lib.getLegendURLs({
                layers: "a,b",
                url: "example.com",
                version: "0.0.1",
                typ: "WMS"
            });

            expect(legendURLs.length).toBe(2);
            expect(legendURLs[0]).toEqual(expectedBaseString + "a");
            expect(legendURLs[1]).toEqual(expectedBaseString + "b");
        });
    });
});
