import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import Cluster from "ol/source/Cluster.js";
import {Style, Icon} from "ol/style.js";
import map from "../../abstraction/map.js";
import defaults from "../../src/defaults";
import {WFS} from "ol/format.js";
import * as wfs from "../../src/layer/wfs";
import {featureCollection} from "./resources/wfs_features";
import {wfsFilterQuery} from "./resources/wfs_features";

describe("wfs.js", function () {
    describe("createLayer", function () {
        it("creates a VectorLayer with source", function () {
            const layer = wfs.createLayer({id: "id"});

            expect(layer).toBeInstanceOf(VectorLayer);
            expect(layer.get("id")).toEqual("id");
            expect(layer.getSource()).toBeInstanceOf(VectorSource);
        });
        it("creates a VectorLayer with style in rawLayer", function () {
            function styleFunction () {
                const icon = new Style({
                    image: new Icon({
                        src: "https://building.png",
                        scale: 0.5,
                        opacity: 1
                    })
                });

                return [icon];
            }
            const layer = wfs.createLayer({id: "id", style: styleFunction}, {});

            expect(layer.getStyleFunction()).toBeDefined();
            expect(layer.getStyleFunction()).toEqual(styleFunction);

        });
    });
    describe("createLayer with additional params and options", function () {
        it("creates a VectorLayer with layerParams", function () {
            const layerParams = {
                    name: "name",
                    layers: "layer1, layer2"
                },
                layer = wfs.createLayer({id: "id"}, layerParams);

            expect(layer).toBeInstanceOf(VectorLayer);
            expect(layer.get("name")).toEqual("name");
            expect(layer.get("layers")).toEqual("layer1, layer2");
        });
        it("creates a VectorLayer with style in options", function () {
            function styleFunction () {
                const icon = new Style({
                    image: new Icon({
                        src: "https://building.png",
                        scale: 0.5,
                        opacity: 1
                    })
                });

                return [icon];
            }
            const options = {
                    style: styleFunction
                },
                layerParams = {
                    name: "name",
                    layers: "layer1, layer2"
                },
                layer = wfs.createLayer({id: "id"}, layerParams, options);

            expect(layer.getStyleFunction()).toBeDefined();
            expect(layer.getStyleFunction()).toEqual(styleFunction);
            expect(layer.get("name")).toEqual("name");
            expect(layer.get("layers")).toEqual("layer1, layer2");
        });
    });
    describe("createLayerSource", function () {
        const consoleError = console.error;

        beforeEach(() => {
            if (global.fetch) {
                global.fetch.mockClear();
            }
        });
        // to reset show error on load in console
        afterEach(() => {
            console.error = consoleError;
        });
        it("creates a VectorSource and beforeLoading, afterLoading and featuresFilter are called", async function () {
            global.fetch = jest.fn().mockImplementationOnce(() => {
                return new Promise((resolve) => {
                    resolve({
                        ok: true,
                        status: 200,
                        text: () => {
                            return featureCollection;
                        }
                    });
                });
            });

            const map2D = map.createMap(defaults),
                url = "https://url.de",
                rawLayer = {
                    id: "id",
                    url: url,
                    featureNS: "http://www.deegree.org/app",
                    featureType: "krankenhaeuser_hh"
                },
                beforeLoadingMock = jest.fn(),
                afterLoadingMock = jest.fn(),
                featuresFilterMock = jest.fn((features) => features),
                // jest.fn().mockReturnValueOnce(10),
                options = {
                    beforeLoading: beforeLoadingMock,
                    afterLoading: afterLoadingMock,
                    featuresFilter: featuresFilterMock
                },
                layer = wfs.createLayer(rawLayer, {}, options);

            layer.getSource().loadFeatures([-10000, -10000, 10000, 10000],
                1,
                map2D.getView().getProjection());

            expect(layer.getSource()).toBeInstanceOf(VectorSource);
            expect(layer.getSource().getFormat()).toBeInstanceOf(WFS);
            // eslint-disable-next-line no-underscore-dangle
            expect(typeof layer.getSource().loader_).toEqual("function");
            expect(beforeLoadingMock.mock.calls.length).toBe(1);

            layer.getSource().on("featuresloadend", function () {
                expect(featuresFilterMock.mock.calls.length).toBe(1);
                expect(afterLoadingMock.mock.calls.length).toBe(1);
            });
        });
        it("creates a VectorSource with wfsFilter", async function () {
            let secondFetchCalled = false;

            global.fetch = jest.fn().mockImplementationOnce(() => {
                return new Promise((resolve) => {
                    resolve({
                        ok: true,
                        status: 200,
                        text: () => {
                            return wfsFilterQuery;
                        }
                    });
                });
            }).mockImplementationOnce(() => {
                return new Promise((resolve) => {
                    resolve({
                        ok: true,
                        status: 200,
                        text: () => {
                            secondFetchCalled = true;
                            return featureCollection;
                        }
                    });
                });
            });

            const map2D = map.createMap(defaults),
                url = "https://url.de",
                rawLayer = {
                    id: "id",
                    url: url,
                    featureNS: "http://www.deegree.org/app",
                    featureType: "krankenhaeuser_hh"
                },
                beforeLoadingMock = jest.fn(),
                afterLoadingMock = jest.fn(),
                featuresFilterMock = jest.fn((features) => features),
                options = {
                    wfsFilter: "resources/xml/schulstandort.staatlich.1-4.grundschulen.xml",
                    beforeLoading: beforeLoadingMock,
                    afterLoading: afterLoadingMock,
                    featuresFilter: featuresFilterMock
                },
                layer = wfs.createLayer(rawLayer, {}, options);

            layer.getSource().loadFeatures([-10000, -10000, 10000, 10000],
                1,
                map2D.getView().getProjection());

            expect(layer.getSource()).toBeInstanceOf(VectorSource);
            expect(layer.getSource().getFormat()).toBeInstanceOf(WFS);
            // eslint-disable-next-line no-underscore-dangle
            expect(typeof layer.getSource().loader_).toEqual("function");
            expect(beforeLoadingMock.mock.calls.length).toBe(1);
            layer.getSource().on("featuresloadend", function () {
                expect(secondFetchCalled).toEqual(true);
                expect(featuresFilterMock.mock.calls.length).toBe(1);
                expect(afterLoadingMock.mock.calls.length).toBe(1);
            });
        });
        it("creates a VectorSource and onLoadingError is called", async function () {
            global.fetch = jest.fn().mockImplementationOnce(() => {
                return new Promise((_g, reject) => {
                    reject({
                        ok: false,
                        status: 404,
                        text: () => {
                            return null;
                        }
                    });
                });
            });
            // to reset show error on load in console when testing 'onLoadingError'
            console.error = jest.fn();

            const map2D = map.createMap(defaults),
                url = "https://url.de",
                rawLayer = {
                    id: "id",
                    url: url,
                    featureNS: "http://www.deegree.org/app",
                    featureType: "krankenhaeuser_hh"
                },
                onLoadingErrorMock = jest.fn(),
                options = {
                    onLoadingError: onLoadingErrorMock
                },
                layer = wfs.createLayer(rawLayer, {}, options);

            layer.getSource().loadFeatures([-10000, -10000, 10000, 10000],
                1,
                map2D.getView().getProjection());

            expect(layer.getSource()).toBeInstanceOf(VectorSource);
            expect(layer.getSource().getFormat()).toBeInstanceOf(WFS);
            // eslint-disable-next-line no-underscore-dangle
            expect(typeof layer.getSource().loader_).toEqual("function");
            layer.getSource().on("featuresloaderror", function () {
                expect(onLoadingErrorMock.mock.calls.length).toBe(2);
            });
        });
        it("creates a clustered VectorSource and beforeLoading, afterLoading and featuresFilter are called", async function () {
            global.fetch = jest.fn().mockImplementationOnce(() => {
                return new Promise((resolve) => {
                    resolve({
                        ok: true,
                        status: 200,
                        text: () => {
                            return featureCollection;
                        }
                    });
                });
            });

            const map2D = map.createMap(defaults),
                url = "https://url.de",
                rawLayer = {
                    id: "id",
                    url: url,
                    featureNS: "http://www.deegree.org/app",
                    featureType: "krankenhaeuser_hh",
                    clusterDistance: 60
                },
                beforeLoadingMock = jest.fn(),
                afterLoadingMock = jest.fn(),
                featuresFilterMock = jest.fn((features) => features),
                clusterGeometryFunctionMock = jest.fn(),
                options = {
                    beforeLoading: beforeLoadingMock,
                    afterLoading: afterLoadingMock,
                    featuresFilter: featuresFilterMock,
                    clusterGeometryFunction: clusterGeometryFunctionMock
                },
                layer = wfs.createLayer(rawLayer, {}, options);

            layer.getSource().loadFeatures([-10000, -10000, 10000, 10000],
                1,
                map2D.getView().getProjection());

            expect(layer.getSource()).toBeInstanceOf(Cluster);
            expect(layer.getSource().getDistance()).toEqual(60);
            expect(layer.getSource().getSource().getFormat()).toBeInstanceOf(WFS);
            // eslint-disable-next-line no-underscore-dangle
            expect(typeof layer.getSource().loader_).toEqual("function");
            expect(beforeLoadingMock.mock.calls.length).toBe(1);
            layer.getSource().on("featuresloadend", function () {
                expect(clusterGeometryFunctionMock.mock.calls.length).toBe(1);
                expect(featuresFilterMock.mock.calls.length).toBe(1);
                expect(afterLoadingMock.mock.calls.length).toBe(1);
            });
        });
    });

    describe("updateSource", function () {
        it("updateSource will fetch layer again", function () {
            const layer = wfs.createLayer({id: "id"});

            layer.getSource().refresh = jest.fn();
            wfs.updateSource(layer);
            expect(layer.getSource().refresh.mock.calls.length).toBe(1);
        });
    });
});
