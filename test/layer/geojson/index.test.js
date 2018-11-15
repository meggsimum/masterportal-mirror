import {Vector} from "ol/layer.js";
import Feature from "ol/Feature";

import {geojson} from "../../../src";
import style from "../../../src/layer/geojson/style";

const point = {
        type: "Feature",
        geometry: {
            type: "Point",
            coordinates: [0, 0]
        }
    },
    collection = {
        type: "FeatureCollection",
        features: [point, point, point]
    },
    idCollection = {
        type: "FeatureCollection",
        features: collection.features.map((p, id) => Object.assign({id: String(id)}, p))
    };

describe("geojson/index", function () {
    describe("createLayer", function () {
        it("creates an ol/layer/Vector", function () {
            const layer = geojson.createLayer({});

            expect(layer).toBeInstanceOf(Vector);
        });

        it("uses default layer style, unless layerStyle is explicitly given", function () {
            function styleFunction () {
                return null;
            }
            const defaultLayer = geojson.createLayer({}),
                styledLayer = geojson.createLayer({}, {layerStyle: styleFunction});

            expect(defaultLayer.getStyle()).toBe(style);
            expect(styledLayer.getStyle()).toBe(styleFunction);
        });
    });

    describe("createLayerSource", function () {
        it("sets format and url for remote geojson", function () {
            const source = geojson.createLayerSource({url: "example.com/geo.json"});

            expect(source.getFormat()).toBeDefined();
            expect(source.getUrl()).toBeDefined();
        });

        it("sets features directly for local geojson", function () {
            const source = geojson.createLayerSource({features: point});

            expect(source.getFeatures().length).toBe(1);
        });

        it("sets uids for features without id", function () {
            const source = geojson.createLayerSource({features: point});

            expect(source.getFeatures()[0].getId()).toBeDefined();
        });
    });

    describe("setFeatureStyle", function () {
        it("sets a given style to all given features", function () {
            function styleFunction () {
                return null;
            }
            const features = [new Feature(), new Feature()];

            geojson.setFeatureStyle(features, styleFunction);
            expect(features[0].getStyle()).toBe(styleFunction);
            expect(features[1].getStyle()).toBe(styleFunction);
        });
    });

    describe("hideAllFeatures", function () {
        it("sets all features' styles of a layer to the null constant function", function () {
            const layer = geojson.createLayer({features: collection});

            geojson.hideAllFeatures(layer);
            layer.getSource().getFeatures().forEach(feature => expect(feature.getStyle()()).toBeNull());
        });
    });

    describe("showAllFeatures", function () {
        it("sets all features' styles of a layer to undefined", function () {
            const layer = geojson.createLayer({features: collection});

            geojson.hideAllFeatures(layer);
            geojson.showAllFeatures(layer);
            layer.getSource().getFeatures().forEach(feature => expect(feature.getStyle()).toBeUndefined());
        });
    });

    describe("showFeaturesById", function () {
        it("sets features with id visible, and all others invisible; unknown ids are ignored", function () {
            const layer = geojson.createLayer({features: idCollection}),
                [p1, p2, p3] = layer.getSource().getFeatures();

            geojson.showFeaturesById(layer, ["-1", "0", "1"]);

            expect(p1.getStyle()).toBeUndefined();
            expect(p2.getStyle()).toBeUndefined();
            expect(p3.getStyle()()).toBeNull();

            geojson.showFeaturesById(layer, []);

            expect(p1.getStyle()()).toBeNull();
            expect(p2.getStyle()()).toBeNull();
            expect(p3.getStyle()()).toBeNull();

            geojson.showFeaturesById(layer, ["2", "9"]);

            expect(p1.getStyle()()).toBeNull();
            expect(p2.getStyle()()).toBeNull();
            expect(p3.getStyle()).toBeUndefined();
        });
    });
});
