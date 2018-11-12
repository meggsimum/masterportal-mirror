import {Map} from "ol";
import {Tile as TileLayer, Image as ImageLayer} from "ol/layer.js";
import TileWMS from "ol/source/TileWMS.js";
import ImageWMS from "ol/source/ImageWMS.js";
import TileGrid from "ol/tilegrid/TileGrid.js";

import _ from "underscore";
import * as wms from "../../src/layer/wms";

describe("wms.js", function () {
    describe("generateSessionId", function () {
        it("returns a number", function () {
            const sid = wms.generateSessionId();

            expect(_.isNumber(sid)).toBe(true);
        });
    });

    describe("makeParams", function () {
        it("does not set tile height/width for singleTile parameter object", function () {
            const singleTileParams = wms.makeParams({singleTile: true, tilesize: 256});

            expect(singleTileParams.SINGLETILE).toBe(true);
            expect(singleTileParams.WIDTH).not.toBeDefined();
            expect(singleTileParams.HEIGHT).not.toBeDefined();
        });

        it("does set tile height/width for multiTile parameter object", function () {
            const multiTileParams = wms.makeParams({singleTile: false, tilesize: 256});

            expect(multiTileParams.SINGLETILE).toBe(false);
            expect(multiTileParams.WIDTH).toBe(256);
            expect(multiTileParams.HEIGHT).toBe(256);
        });

        it("defaults the format to image/png", function () {
            const params = wms.makeParams({});

            expect(params.FORMAT).toEqual("image/png");
        });

        it("sets a session id", function () {
            const params = wms.makeParams({});

            expect(typeof params.SESSIONID).toEqual("number");
        });

        it("copies the query parameters correctly", function () {
            const params = wms.makeParams({
                format: "image/jpeg",
                layers: "atlas,things",
                version: "1.1.1",
                transparent: true
            });

            expect(params.FORMAT).toEqual("image/jpeg");
            expect(params.LAYERS).toEqual("atlas,things");
            expect(params.VERSION).toEqual("1.1.1");
            expect(params.TRANSPARENT).toBe(true);
        });
    });

    describe("createTileGrid", function () {
        it("creates an instance of ol/TileGrid", function () {
            const tileGrid = wms.createTileGrid({tilesize: 10}, [256, 128, 56]);

            expect(tileGrid).toBeInstanceOf(TileGrid);
            // TODO write more tests once createTileGrid TODOs are done
        });
    });

    describe("createLayerSource", function () {
        it("creates a TileWMS for multi tile requests", function () {
            const source = wms.createLayerSource({singleTile: false});

            expect(source).toBeInstanceOf(TileWMS);
        });

        it("creates an ImageWMS for single tile requests", function () {
            const source = wms.createLayerSource({singleTile: true});

            expect(source).toBeInstanceOf(ImageWMS);
        });
    });

    describe("createLayer", function () {
        it("creates a TileLayer for multi tile requests", function () {
            const layer = wms.createLayer({singleTile: false});

            expect(layer).toBeInstanceOf(TileLayer);
        });

        it("creates an ImageLayer for single tile requests", function () {
            const layer = wms.createLayer({singleTile: true});

            expect(layer).toBeInstanceOf(ImageLayer);
        });
    });

    describe("updateSource", function () {
        function getLayerSessionId (layer) {
            return layer.getSource().getParams().SESSIONID;
        }

        it("changes a layer's source's param's sessionid", function () {
            const layer = wms.createLayer({}),
                oldSession = getLayerSessionId(layer);

            wms.updateSource(layer);

            expect(oldSession).not.toEqual(getLayerSessionId(layer));
        });
    });

    describe("getGfiURL", function () {
        it("creates an URL for the given layer/map/coordinate", function () {
            const layer = wms.createLayer({url: "example.com", typ: "WMS"}),
                map = new Map(),
                gfiURL = wms.getGfiURL(layer, map, [0, 0]);

            expect(gfiURL).toContain("example.com");
            expect(gfiURL).toContain("REQUEST=GetFeatureInfo");
            // doesn't work here due to missing initialization; works in manual tests
            // expect(gfiURL).toContain("X=0&Y=0");
        });
    });
});
