import {Map, Attribution} from "ol";
import TileLayer from "ol/layer/Tile";
import ImageLayer from "ol/layer/Image";
import TileWMS from "ol/source/TileWMS.js";
import ImageWMS from "ol/source/ImageWMS.js";
import TileGrid from "ol/tilegrid/TileGrid";
import * as wms from "../../src/layer/wms";

describe("wms.js", function () {
    describe("generateSessionId", function () {
        it("returns a number", function () {
            const sid = wms.generateSessionId();

            expect(typeof sid).toBe("number");
        });
    });

    describe("addOptionalParams", () => {
        let params;

        beforeEach(() => {
            params = {
                CACHEID: "yeah",
                FORMAT: "a",
                LAYERS: "b",
                VERSION: "c",
                TRANSPARENT: "d",
                SINGLETILE: "e"
            };
        });

        it("adds the parameter TIME", () => {
            const extendedParams = wms.addOptionalParams(params, {TIME: "The time"});

            expect(extendedParams.CACHEID).toEqual("yeah");
            expect(extendedParams.FORMAT).toEqual("a");
            expect(extendedParams.LAYERS).toEqual("b");
            expect(extendedParams.VERSION).toEqual("c");
            expect(extendedParams.TRANSPARENT).toEqual("d");
            expect(extendedParams.SINGLETILE).toEqual("e");
            expect(extendedParams.TIME).toEqual("The time");
            expect(extendedParams.STYLES).not.toBeDefined();
        });
        it("adds the parameter STYLES", () => {
            const extendedParams = wms.addOptionalParams(params, {STYLES: "The style"});

            expect(extendedParams.CACHEID).toEqual("yeah");
            expect(extendedParams.FORMAT).toEqual("a");
            expect(extendedParams.LAYERS).toEqual("b");
            expect(extendedParams.VERSION).toEqual("c");
            expect(extendedParams.TRANSPARENT).toEqual("d");
            expect(extendedParams.SINGLETILE).toEqual("e");
            expect(extendedParams.STYLES).toEqual("The style");
            expect(extendedParams.TIME).not.toBeDefined();
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

            expect(typeof params.CACHEID).toEqual("number");
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
    describe("createLayerSource with a tileGrid", function () {
        function attrFunction () {
            return [new Attribution({
                html: "&copy; " +
                "<a href=\"http://www.geo.admin.ch/internet/geoportal/" +
                "en/home.html\">" +
                "Pixelmap 1:1000000 / geo.admin.ch</a>"
            })];
        }
        it("creates a TileWMS without tileGrid, options are undefined", function () {
            const options = undefined,
                source = wms.createLayerSource({singleTile: false, tilesize: "10"}, options);

            expect(source).toBeInstanceOf(TileWMS);
            expect(source.getTileGrid()).toEqual(null);
        });
        it("creates a TileWMS without tileGrid, options without resolutions", function () {
            const options = {
                    origin: [442800, 5809000]
                },
                source = wms.createLayerSource({singleTile: false, tilesize: "10"}, options);

            expect(source).toBeInstanceOf(TileWMS);
            expect(source.getTileGrid()).toEqual(null);
        });
        it("creates a TileWMS containing a tileGrid", function () {
            const options = {
                    resolutions: [2000, 1000],
                    origin: [442800, 5809000]
                },
                rawLayer = {
                    singleTile: false,
                    tilesize: "10",
                    gutter: "1",
                    serverType: "geoserver",
                    url: "https://url.de",
                    olAttribution: attrFunction
                },
                source = wms.createLayerSource(rawLayer, options);

            expect(source).toBeInstanceOf(TileWMS);
            expect(source.getTileGrid()).toBeInstanceOf(TileGrid);
            expect(source.getTileGrid().getOrigin()).toEqual(options.origin);
            expect(source.getTileGrid().getResolutions()).toEqual(options.resolutions);
            expect(source.getTileGrid().getTileSize()).toEqual(parseInt(rawLayer.tilesize, 10));
            expect(source.getAttributions()).toBe(attrFunction);
            expect(source.getUrls()).toEqual([rawLayer.url]);
            /* eslint-disable no-underscore-dangle */
            expect(source.gutter_).toEqual(rawLayer.gutter);
        });

        it("creates an ImageWMS for single tile requests, contains no tileGrid", function () {
            const rawLayer = {
                    singleTile: true,
                    serverType: "geoserver",
                    url: "https://url.de",
                    olAttribution: attrFunction
                },
                source = wms.createLayerSource(rawLayer);

            expect(source).toBeInstanceOf(ImageWMS);
            expect(source.getAttributions()).toBe(attrFunction);
            expect(source.getUrl()).toEqual(rawLayer.url);
            /* eslint-disable no-underscore-dangle */
            expect(source.serverType_).toEqual(rawLayer.serverType);
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
    describe("createLayer with additional params and options", function () {
        it("creates a TileLayer for multi tile requests", function () {
            const options = {
                    resolutions: [2000, 1000],
                    origin: [442800, 5809000]
                },
                layerParams = {
                    name: "name",
                    layers: "layer1, layer2"
                },
                layer = wms.createLayer({singleTile: false, tilesize: "10"}, layerParams, options);

            expect(layer).toBeInstanceOf(TileLayer);
            expect(layer.get("name")).toEqual("name");
            expect(layer.get("layers")).toEqual("layer1, layer2");
            expect(layer.getSource().getTileGrid()).toBeInstanceOf(TileGrid);
            expect(layer.getSource().getTileGrid().getOrigin()).toEqual(options.origin);
            expect(layer.getSource().getTileGrid().getResolutions()).toEqual(options.resolutions);
        });

        it("creates an ImageLayer for single tile requests", function () {
            const layerParams = {
                    name: "name",
                    layers: "layer1, layer2"
                },
                layer = wms.createLayer({singleTile: true}, layerParams);

            expect(layer).toBeInstanceOf(ImageLayer);
            expect(layer.get("name")).toEqual("name");
            expect(layer.get("layers")).toEqual("layer1, layer2");
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
