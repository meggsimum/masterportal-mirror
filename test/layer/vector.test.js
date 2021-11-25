import VectorSource from "ol/source/Vector.js";
import Cluster from "ol/source/Cluster.js";
import {bbox} from "ol/loadingstrategy.js";
import {WFS} from "ol/format.js";
import * as vector from "../../src/layer/vector";

/* eslint-disable no-underscore-dangle */
describe("vector.js", function () {
    describe("createVectorSource", function () {
        it("creates a VectorSource with all params", function () {
            const loader = jest.fn(),
                loadingStrategy = bbox,
                format = new WFS(),
                source = vector.createVectorSource(loader, loadingStrategy, format);

            expect(source).toBeInstanceOf(VectorSource);
            expect(source.getFormat()).toBeInstanceOf(WFS);
            expect(source.loader_).toEqual(loader);
            expect(source.strategy_).toEqual(loadingStrategy);
        });
        it("creates a VectorSource without using a loader", function () {
            const url = "https://url.de",
                loadingStrategy = bbox,
                format = new WFS(),
                source = vector.createVectorSource(url, loadingStrategy, format);

            expect(source).toBeInstanceOf(VectorSource);
            expect(source.getFormat()).toBeInstanceOf(WFS);
            expect(source.getUrl()).toEqual(url);
            expect(source.loader_).toEqual(null);
            expect(source.strategy_).toEqual(loadingStrategy);
        });
        it("creates a VectorSource without an url", function () {
            const loader = jest.fn(),
                loadingStrategy = bbox,
                format = new WFS(),
                source = vector.createVectorSource(loader, loadingStrategy, format);

            expect(source).toBeInstanceOf(VectorSource);
            expect(source.getFormat()).toBeInstanceOf(WFS);
            expect(source.getUrl()).toEqual(null);
            expect(source.loader_).toEqual(loader);
            expect(source.strategy_).toEqual(loadingStrategy);
        });

    });
    describe("createClusterVectorSource", function () {
        it("creates a Cluster with without params", function () {
            const source = vector.createClusterVectorSource(new VectorSource());

            expect(source).toBeInstanceOf(Cluster);
        });
        it("creates a Cluster with all params", function () {
            const layerSource = new VectorSource(),
                clusterDistance = 60,
                clusterGeometryFunction = jest.fn(() => "testGeometryFn"),
                cluster = vector.createClusterVectorSource(layerSource, clusterDistance, clusterGeometryFunction);

            expect(cluster).toBeInstanceOf(Cluster);
            expect(cluster.getDistance()).toEqual(60);
            expect(cluster.getSource()).toEqual(layerSource);
            expect(typeof cluster.geometryFunction).toEqual("function");
            expect(cluster.geometryFunction()).toEqual("testGeometryFn");
        });
        it("creates a Cluster without geometryFunction", function () {
            const layerSource = new VectorSource(),
                clusterDistance = 60,
                cluster = vector.createClusterVectorSource(layerSource, clusterDistance, null);

            expect(cluster).toBeInstanceOf(Cluster);
            expect(cluster.getDistance()).toEqual(60);
            expect(cluster.getSource()).toEqual(layerSource);
            expect(typeof cluster.geometryFunction).toEqual("function");
        });
    });

});
