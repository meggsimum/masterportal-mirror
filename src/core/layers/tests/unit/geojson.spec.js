import VectorSource from "ol/source/Vector.js";
import VectorLayer from "ol/layer/Vector.js";
import Cluster from "ol/source/Cluster.js";
import {GeoJSON} from "ol/format.js";
import {expect} from "chai";
import sinon from "sinon";
import GeoJSONLayer from "../../geojson";
import mapCollection from "../../../../core/dataStorage/mapCollection.js";
import store from "../../../../app-store";

describe("src/core/layers/geojson.js", () => {
    const consoleError = console.error;
    let attributes;

    before(() => {
        mapCollection.clear();
        const map = {
            id: "ol",
            mode: "2D",
            addInteraction: sinon.stub(),
            removeInteraction: sinon.stub(),
            getView: () => {
                return {
                    getResolutions: () => [2000, 1000]
                };
            }
        };

        mapCollection.addMap(map, "ol", "2D");
        i18next.init({
            lng: "cimode",
            debug: false
        });
    });
    beforeEach(() => {
        attributes = {
            url: "https://urlgeojson.de",
            name: "geojsonTestLayer",
            id: "id",
            typ: "GeoJSON",
            gfiTheme: "gfiTheme",
            isChildLayer: false,
            transparent: false,
            isSelected: false

        };
        store.getters = {
            treeType: "custom"
        };
        console.error = sinon.stub();
    });

    afterEach(() => {
        sinon.restore();
        console.error = consoleError;
    });

    describe("createLayer", () => {
        it("createLayer shall create an ol.VectorLayer with source and style and GeoJSON-format", function () {
            const geojsonLayer = new GeoJSONLayer(attributes),
                layer = geojsonLayer.get("layer");

            expect(layer).to.be.an.instanceof(VectorLayer);
            expect(layer.getSource()).to.be.an.instanceof(VectorSource);
            expect(layer.getSource().getFormat()).to.be.an.instanceof(GeoJSON);
            expect(layer.get("id")).to.be.equals(attributes.id);
            expect(layer.get("name")).to.be.equals(attributes.name);
            expect(layer.get("gfiTheme")).to.be.equals(attributes.gfiTheme);
        });
        it("createLayer shall create an ol.VectorLayer with cluster-source", function () {
            attributes.clusterDistance = 60;
            const geojsonLayer = new GeoJSONLayer(attributes),
                layer = geojsonLayer.get("layer");


            expect(layer).to.be.an.instanceof(VectorLayer);
            expect(layer.getSource()).to.be.an.instanceof(Cluster);
            expect(layer.getSource().getDistance()).to.be.equals(attributes.clusterDistance);
            expect(layer.getSource().getSource().getFormat()).to.be.an.instanceof(GeoJSON);
            // expect(typeof layer.getStyleFunction()).to.be.equals("function");
        });
        it("createLayer with isSelected=true shall set layer visible", function () {
            attributes.isSelected = true;
            const geojsonLayer = new GeoJSONLayer(attributes),
                layer = geojsonLayer.get("layer");

            expect(layer).to.be.an.instanceof(VectorLayer);
            expect(layer.getSource()).to.be.an.instanceof(VectorSource);
            expect(geojsonLayer.get("isVisibleInMap")).to.be.true;
            expect(geojsonLayer.get("layer").getVisible()).to.be.true;
        });
        it("createLayer with isSelected=true shall set layer visible", function () {
            attributes.isSelected = false;
            const geojsonLayer = new GeoJSONLayer(attributes),
                layer = geojsonLayer.get("layer");

            expect(layer).to.be.an.instanceof(VectorLayer);
            expect(layer.getSource()).to.be.an.instanceof(VectorSource);
            expect(geojsonLayer.get("isVisibleInMap")).to.be.false;
            expect(geojsonLayer.get("layer").getVisible()).to.be.false;
        });
    });

    describe("check request by using subType", () => {
        it("should throw an error if subType is not supported", function () {
            attributes.subType = "newSubType";
            const geojsonLayer = new GeoJSONLayer(attributes);

            geojsonLayer.expandFeaturesBySubTyp(attributes.subType);
            expect(console.error.called).to.be.true;
        });
    });
    describe("getFeaturesFilterFunction", () => {
        it("getFeaturesFilterFunction shall filter getGeometry", function () {
            const geojsonLayer = new GeoJSONLayer(attributes),
                featuresFilterFunction = geojsonLayer.getFeaturesFilterFunction(attributes),
                features = [{
                    id: "1",
                    getGeometry: () => sinon.stub()
                },
                {
                    id: "2",
                    getGeometry: () => undefined
                }];

            expect(typeof featuresFilterFunction).to.be.equals("function");
            expect(featuresFilterFunction(features).length).to.be.equals(1);

        });
        it("getFeaturesFilterFunction shall filter bboxGeometry", function () {
            attributes.bboxGeometry = {
                intersectsExtent: (extent) => {
                    if (extent.includes("1")) {
                        return true;
                    }
                    return false;
                }
            };
            const geojsonLayer = new GeoJSONLayer(attributes),
                featuresFilterFunction = geojsonLayer.getFeaturesFilterFunction(attributes),
                features = [{
                    id: "1",
                    getGeometry: () => {
                        return {
                            getExtent: () => ["1"]
                        };

                    }
                },
                {
                    id: "2",
                    getGeometry: () => undefined
                },
                {
                    id: "3",
                    getGeometry: () => {
                        return {
                            getExtent: () => ["2"]
                        };
                    }
                }];

            expect(typeof featuresFilterFunction).to.be.equals("function");
            expect(featuresFilterFunction(features).length).to.be.equals(1);
            expect(featuresFilterFunction(features)[0].id).to.be.equals("1");
        });
    });
    describe("getStyleFunction", () => {
        it("getStyleFunction shall return a function", function () {
            sinon.stub(Radio, "request").callsFake((...args) => {
                let ret = null;

                args.forEach(arg => {
                    if (arg === "returnModelById") {
                        ret = {
                            id: "id",
                            createStyle: () => sinon.stub(),
                            getStyleModelById: () => sinon.stub(),
                            getLegendInfos: () => sinon.stub()
                        };
                    }
                });
                return ret;
            });
            const geojsonLayer = new GeoJSONLayer(attributes),
                styleFunction = geojsonLayer.getStyleFunction(attributes);

            expect(styleFunction).not.to.be.null;
            expect(typeof styleFunction).to.be.equals("function");
        });
    });
    describe("createLegend", () => {
        it("createLegend shall set legend", function () {
            attributes.legendURL = "https://legendUrl";
            const geojsonLayer = new GeoJSONLayer(attributes);

            expect(geojsonLayer.get("legend")).to.be.deep.equals([attributes.legendURL]);
        });
    });
    describe("functions for features", () => {
        let style1 = null,
            style2 = null,
            style3 = null;
        const features = [{
            getId: () => "1",
            get: () => sinon.stub(),
            set: () => sinon.stub(),
            setStyle: (fn) => {
                style1 = fn;
            }
        },
        {
            getId: () => "2",
            get: () => sinon.stub(),
            set: () => sinon.stub(),
            setStyle: (fn) => {
                style2 = fn;
            }
        },
        {
            getId: () => "3",
            get: () => sinon.stub(),
            set: () => sinon.stub(),
            setStyle: (fn) => {
                style3 = fn;
            }
        }];

        it("hideAllFeatures", function () {
            const geojsonLayer = new GeoJSONLayer(attributes),
                layer = geojsonLayer.get("layer"),
                clearStub = sinon.stub(layer.getSource(), "clear"),
                addFeaturesStub = sinon.stub(layer.getSource(), "addFeatures");

            sinon.stub(layer.getSource(), "getFeatures").returns(features);

            geojsonLayer.hideAllFeatures();

            expect(geojsonLayer.get("layer").getSource().getFeatures().length).to.be.equals(3);
            expect(clearStub.calledOnce).to.be.true;
            expect(addFeaturesStub.calledOnce).to.be.true;
            expect(typeof style1).to.be.equals("function");
            expect(style1()).to.be.null;
            expect(typeof style2).to.be.equals("function");
            expect(style2()).to.be.null;
            expect(typeof style3).to.be.equals("function");
            expect(style3()).to.be.null;
        });
        it("showAllFeatures", function () {
            const geojsonLayer = new GeoJSONLayer(attributes),
                layer = geojsonLayer.get("layer");

            sinon.stub(layer.getSource(), "getFeatures").returns(features);
            geojsonLayer.showAllFeatures();

            expect(geojsonLayer.get("layer").getSource().getFeatures().length).to.be.equals(3);
            expect(typeof style1).to.be.equals("undefined");
            expect(typeof style2).to.be.equals("undefined");
            expect(typeof style3).to.be.equals("undefined");
        });
        it("showFeaturesByIds", function () {
            sinon.stub(Radio, "request").callsFake((...args) => {
                let ret = null;

                args.forEach(arg => {
                    if (arg === "returnModelById") {
                        ret = {
                            id: "id",
                            createStyle: () => sinon.stub(),
                            getStyleModelById: () => sinon.stub(),
                            getLegendInfos: () => sinon.stub()
                        };
                    }
                });
                return ret;
            });
            const geojsonLayer = new GeoJSONLayer(attributes),
                layer = geojsonLayer.get("layer");

            sinon.stub(layer.getSource(), "addFeatures");
            sinon.stub(layer.getSource(), "getFeatures").returns(features);
            sinon.stub(layer.getSource(), "getFeatureById").returns(features[0]);
            geojsonLayer.showFeaturesByIds(["1"]);

            expect(geojsonLayer.get("layer").getSource().getFeatures().length).to.be.equals(3);
        });
    });
    describe("functions for styling", () => {
        it("getStyleAsFunction shall return a function", function () {
            const geojsonLayer = new GeoJSONLayer(attributes);

            /* eslint-disable-next-line require-jsdoc */
            function styleFn () {
                return "test";
            }

            let ret = geojsonLayer.getStyleAsFunction(styleFn);

            expect(typeof ret).to.be.equals("function");
            expect(ret()).to.be.equals("test");

            ret = geojsonLayer.getStyleAsFunction("test");
            expect(typeof ret).to.be.equals("function");
            expect(ret()).to.be.equals("test");
        });
        it("styling shall set style", function () {
            const geojsonLayer = new GeoJSONLayer(attributes);

            /* eslint-disable-next-line require-jsdoc */
            function styleFn () {
                return "test";
            }
            geojsonLayer.setStyle(styleFn);

            expect(typeof geojsonLayer.get("layer").getStyle()).to.be.equals("function");
            expect(geojsonLayer.get("layer").getStyle()()).to.be.equals("test");
        });
    });
});
