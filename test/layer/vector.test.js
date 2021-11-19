import VectorSource from "ol/source/Vector.js";
import Cluster from "ol/source/Cluster.js";
import {bbox} from "ol/loadingstrategy.js";
import {WFS} from "ol/format.js";
import * as vector from "../../src/layer/vector";

/* eslint-disable no-underscore-dangle */
describe("vector.js", function () {
    describe("createVectorSource", function () {
        it("creates a VectorSource with no params", function () {
            const source = vector.createVectorSource();

            expect(source).toBeInstanceOf(VectorSource);
        });
        it("creates a VectorSource with all params", function () {
            const url = "https://url.de",
                loader = jest.fn(),
                loadingStrategy = bbox,
                format = new WFS(),
                source = vector.createVectorSource(url, loader, loadingStrategy, format);

            expect(source).toBeInstanceOf(VectorSource);
            expect(source.getFormat()).toBeInstanceOf(WFS);
            expect(source.getUrl()).toEqual(url);
            expect(source.loader_).toEqual(loader);
            expect(source.strategy_).toEqual(loadingStrategy);
        });
        it("creates a VectorSource no loader", function () {
            const url = "https://url.de",
                loadingStrategy = bbox,
                format = new WFS(),
                source = vector.createVectorSource(url, null, loadingStrategy, format);

            expect(source).toBeInstanceOf(VectorSource);
            expect(source.getFormat()).toBeInstanceOf(WFS);
            expect(source.getUrl()).toEqual(url);
            expect(source.loader_).toEqual(null);
            expect(source.strategy_).toEqual(loadingStrategy);
        });
        it("creates a VectorSource no url", function () {
            const loader = jest.fn(),
                loadingStrategy = bbox,
                format = new WFS(),
                source = vector.createVectorSource(null, loader, loadingStrategy, format);

            expect(source).toBeInstanceOf(VectorSource);
            expect(source.getFormat()).toBeInstanceOf(WFS);
            expect(source.getUrl()).toEqual(null);
            expect(source.loader_).toEqual(loader);
            expect(source.strategy_).toEqual(loadingStrategy);
        });

    });
    describe("createClusterVectorSource", function () {
        it("creates a Cluster with no params", function () {
            const source = vector.createClusterVectorSource();

            expect(source).toBeInstanceOf(Cluster);
        });
        it("creates a Cluster with all params", function () {
            const layerSource = vector.createVectorSource(),
                clusterDistance = 60,
                clusterGeometryFunction = jest.fn(),
                cluster = vector.createClusterVectorSource(layerSource, clusterDistance, clusterGeometryFunction);

            expect(cluster).toBeInstanceOf(Cluster);
            expect(cluster.getDistance()).toEqual(60);
            expect(cluster.getSource()).toEqual(layerSource);
            expect(typeof cluster.geometryFunction).toEqual("function");
        });
        it("creates a Cluster without geometryFunction", function () {
            const layerSource = vector.createVectorSource(),
                clusterDistance = 60,
                cluster = vector.createClusterVectorSource(layerSource, clusterDistance, null);

            expect(cluster).toBeInstanceOf(Cluster);
            expect(cluster.getDistance()).toEqual(60);
            expect(cluster.getSource()).toEqual(layerSource);
            expect(typeof cluster.geometryFunction).toEqual("function");
        });
    });

});
