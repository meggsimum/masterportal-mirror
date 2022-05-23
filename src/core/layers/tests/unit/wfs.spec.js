import VectorSource from "ol/source/Vector.js";
import VectorLayer from "ol/layer/Vector.js";
import Cluster from "ol/source/Cluster.js";
import {WFS} from "ol/format.js";
import {expect} from "chai";
import sinon from "sinon";
import WfsLayer from "../../wfs";
import store from "../../../../app-store";

describe("src/core/layers/wfs.js", () => {
    const consoleWarn = console.warn;
    let attributes;

    before(() => {
        mapCollection.clear();
        const map = {
            id: "ol",
            mode: "2D",
            addInteraction: sinon.stub(),
            removeInteraction: sinon.stub(),
            // addLayer: () => sinon.stub(),
            getView: () => {
                return {
                    getResolutions: () => [2000, 1000]
                };
            }
        };

        mapCollection.addMap(map, "2D");
        i18next.init({
            lng: "cimode",
            debug: false
        });
    });
    beforeEach(() => {
        attributes = {
            url: "https://url.de",
            name: "wfsTestLayer",
            id: "id",
            typ: "wfs",
            version: "2.0.0",
            gfiTheme: "gfiTheme",
            isChildLayer: false,
            transparent: false,
            isSelected: false,
            featureNS: "http://www.deegree.org/app",
            featureType: "krankenhaeuser_hh"
        };
        store.getters = {
            treeType: "custom"
        };
        console.warn = sinon.stub();
    });

    afterEach(() => {
        sinon.restore();
        console.warn = consoleWarn;
    });

    describe("createLayer", () => {
        it("createLayer shall create an ol.VectorLayer with source and style and WFS-format", function () {
            const wfsLayer = new WfsLayer(attributes),
                layer = wfsLayer.get("layer");

            expect(layer).to.be.an.instanceof(VectorLayer);
            expect(layer.getSource()).to.be.an.instanceof(VectorSource);
            expect(layer.getSource().getFormat()).to.be.an.instanceof(WFS);
            expect(typeof layer.getStyleFunction()).to.be.equals("function");
            expect(layer.get("id")).to.be.equals(attributes.id);
            expect(layer.get("name")).to.be.equals(attributes.name);
            expect(layer.get("gfiTheme")).to.be.equals(attributes.gfiTheme);
        });
        it("createLayer shall create an ol.VectorLayer with cluster-source", function () {
            attributes.clusterDistance = 60;
            const wfsLayer = new WfsLayer(attributes),
                layer = wfsLayer.get("layer");

            expect(layer).to.be.an.instanceof(VectorLayer);
            expect(layer.getSource()).to.be.an.instanceof(Cluster);
            expect(layer.getSource().getDistance()).to.be.equals(attributes.clusterDistance);
            expect(layer.getSource().getSource().getFormat()).to.be.an.instanceof(WFS);
            expect(typeof layer.getStyleFunction()).to.be.equals("function");
        });
        it("createLayer with isSelected=true shall set layer visible", function () {
            attributes.isSelected = true;
            const wfsLayer = new WfsLayer(attributes),
                layer = wfsLayer.get("layer");

            expect(layer).to.be.an.instanceof(VectorLayer);
            expect(layer.getSource()).to.be.an.instanceof(VectorSource);
            expect(wfsLayer.get("isVisibleInMap")).to.be.true;
            expect(wfsLayer.get("layer").getVisible()).to.be.true;
        });
        it("createLayer with isSelected=false shall set layer not visible", function () {
            attributes.isSelected = false;
            const wfsLayer = new WfsLayer(attributes),
                layer = wfsLayer.get("layer");

            expect(layer).to.be.an.instanceof(VectorLayer);
            expect(layer.getSource()).to.be.an.instanceof(VectorSource);
            expect(wfsLayer.get("isVisibleInMap")).to.be.false;
            expect(wfsLayer.get("layer").getVisible()).to.be.false;
        });
    });
    describe("getFeaturesFilterFunction", () => {
        it("getFeaturesFilterFunction shall filter getGeometry", function () {
            const wfsLayer = new WfsLayer(attributes),
                featuresFilterFunction = wfsLayer.getFeaturesFilterFunction(attributes),
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
                },
                getExtent: () => ["1"]
            };
            const wfsLayer = new WfsLayer(attributes),
                featuresFilterFunction = wfsLayer.getFeaturesFilterFunction(attributes),
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
    describe("getPropertyname", () => {
        it("getPropertyname shall return joined proertyNames or empty string", function () {
            attributes.propertyNames = ["app:plan", "app:name"];
            const wfsLayer = new WfsLayer(attributes);
            let propertyname = wfsLayer.getPropertyname(attributes);

            expect(propertyname).to.be.equals("app:plan,app:name");

            attributes.propertyNames = [];
            propertyname = wfsLayer.getPropertyname(attributes);
            expect(propertyname).to.be.equals("");
            attributes.propertyNames = undefined;
            propertyname = wfsLayer.getPropertyname(attributes);
            expect(propertyname).to.be.equals("");
            attributes.propertyNames = undefined;
            propertyname = wfsLayer.getPropertyname(attributes);
            expect(propertyname).to.be.equals("");
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
                            getGeometryTypeFromWFS: () => sinon.stub(),
                            getLegendInfos: () => sinon.stub()
                        };
                    }
                });
                return ret;
            });
            const wfsLayer = new WfsLayer(attributes),
                styleFunction = wfsLayer.getStyleFunction(attributes);

            expect(styleFunction).not.to.be.null;
            expect(typeof styleFunction).to.be.equals("function");
        });
    });
    describe("updateSource", () => {
        it("updateSource shall refresh source if 'sourceUpdated' is false", function () {
            const wfsLayer = new WfsLayer(attributes),
                layer = wfsLayer.get("layer"),
                spy = sinon.spy(layer.getSource(), "refresh");

            expect(wfsLayer.get("sourceUpdated")).to.be.false;
            wfsLayer.updateSource();
            expect(spy.calledOnce).to.be.true;
            expect(wfsLayer.get("sourceUpdated")).to.be.true;
        });
        it("updateSource shall not refresh source if 'sourceUpdated' is true", function () {
            attributes.sourceUpdated = true;
            const wfsLayer = new WfsLayer(attributes),
                layer = wfsLayer.get("layer"),
                spy = sinon.spy(layer.getSource(), "refresh");

            expect(wfsLayer.get("sourceUpdated")).to.be.true;
            wfsLayer.updateSource();
            expect(spy.notCalled).to.be.true;
            expect(wfsLayer.get("sourceUpdated")).to.be.true;
        });
    });
    describe("createLegend", () => {
        it("createLegend shall set legend", function () {
            attributes.legendURL = "https://legendUrl";
            const wfsLayer = new WfsLayer(attributes);

            expect(wfsLayer.get("legend")).to.be.deep.equals([attributes.legendURL]);
        });
        it("createLegend shall set not secured legend", function () {
            let count1 = 0,
                count2 = 0;

            sinon.stub(Radio, "request").callsFake((...args) => {
                let ret = null;

                args.forEach(arg => {
                    if (arg === "returnModelById") {
                        ret = {
                            id: "id",
                            getGeometryTypeFromWFS: () => {
                                ++count1;
                            },
                            getGeometryTypeFromSecuredWFS: () => {
                                ++count2;
                            },
                            getLegendInfos: () => ["legendInfos"]
                        };
                    }
                });
                return ret;
            });
            attributes.legend = true;
            const wfsLayer = new WfsLayer(attributes);

            expect(wfsLayer.get("legend")).not.to.be.true;
            expect(count1).to.be.equals(1);
            expect(count2).to.be.equals(0);
        });
        it("createLegend shall set secured legend", function () {
            let count1 = 0,
                count2 = 0;

            sinon.stub(Radio, "request").callsFake((...args) => {
                let ret = null;

                args.forEach(arg => {
                    if (arg === "returnModelById") {
                        ret = {
                            id: "id",
                            getGeometryTypeFromWFS: () => {
                                ++count1;
                            },
                            getGeometryTypeFromSecuredWFS: () => {
                                ++count2;
                            },
                            getLegendInfos: () => ["legendInfos"]
                        };
                    }
                });
                return ret;
            });
            attributes.legend = true;
            attributes.isSecured = true;
            const wfsLayer = new WfsLayer(attributes);

            expect(wfsLayer.get("legend")).not.to.be.true;
            expect(count1).to.be.equals(0);
            expect(count2).to.be.equals(1);
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
            const wfsLayer = new WfsLayer(attributes),
                layer = wfsLayer.get("layer"),
                clearStub = sinon.stub(layer.getSource(), "clear"),
                addFeaturesStub = sinon.stub(layer.getSource(), "addFeatures");

            sinon.stub(layer.getSource(), "getFeatures").returns(features);

            wfsLayer.hideAllFeatures();

            expect(wfsLayer.get("layer").getSource().getFeatures().length).to.be.equals(3);
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
            sinon.stub(Radio, "request").callsFake((...args) => {
                let ret = null;

                args.forEach(arg => {
                    if (arg === "returnModelById") {
                        ret = {
                            id: "id",
                            createStyle: () => sinon.stub(),
                            getGeometryTypeFromWFS: () => sinon.stub(),
                            getLegendInfos: () => sinon.stub()
                        };
                    }
                });
                return ret;
            });
            const wfsLayer = new WfsLayer(attributes),
                layer = wfsLayer.get("layer");

            sinon.stub(layer.getSource(), "getFeatures").returns(features);
            wfsLayer.showAllFeatures();

            expect(wfsLayer.get("layer").getSource().getFeatures().length).to.be.equals(3);
            expect(typeof style1).to.be.equals("function");
            expect(style1()).not.to.be.null;
            expect(typeof style2).to.be.equals("function");
            expect(style2()).not.to.be.null;
            expect(typeof style3).to.be.equals("function");
            expect(style3()).not.to.be.null;

        });
        it("showFeaturesByIds", function () {
            sinon.stub(Radio, "request").callsFake((...args) => {
                let ret = null;

                args.forEach(arg => {
                    if (arg === "returnModelById") {
                        ret = {
                            id: "id",
                            createStyle: () => sinon.stub(),
                            getGeometryTypeFromWFS: () => sinon.stub(),
                            getLegendInfos: () => sinon.stub()
                        };
                    }
                });
                return ret;
            });
            const wfsLayer = new WfsLayer(attributes),
                layer = wfsLayer.get("layer"),
                clearStub = sinon.stub(layer.getSource(), "clear");

            sinon.stub(layer.getSource(), "addFeatures");
            sinon.stub(layer.getSource(), "getFeatures").returns(features);
            sinon.stub(layer.getSource(), "getFeatureById").returns(features[0]);
            wfsLayer.showFeaturesByIds(["1"]);

            expect(wfsLayer.get("layer").getSource().getFeatures().length).to.be.equals(3);
            expect(typeof style1).to.be.equals("function");
            expect(style1()).not.to.be.null;
            expect(typeof style2).to.be.equals("function");
            expect(style2()).to.be.null;
            expect(typeof style3).to.be.equals("function");
            expect(style3()).to.be.null;
            expect(clearStub.calledOnce).to.be.true;
        });
    });
    describe("functions for styling", () => {
        it("getStyleAsFunction shall return a function", function () {
            const wfsLayer = new WfsLayer(attributes);

            /* eslint-disable-next-line require-jsdoc */
            function styleFn () {
                return "test";
            }

            let ret = wfsLayer.getStyleAsFunction(styleFn);

            expect(typeof ret).to.be.equals("function");
            expect(ret()).to.be.equals("test");

            ret = wfsLayer.getStyleAsFunction("test");
            expect(typeof ret).to.be.equals("function");
            expect(ret()).to.be.equals("test");
        });
        it("styling shall set style", function () {
            const wfsLayer = new WfsLayer(attributes);

            /* eslint-disable-next-line require-jsdoc */
            function styleFn () {
                return "test";
            }
            wfsLayer.set("style", styleFn);

            wfsLayer.styling();
            expect(typeof wfsLayer.get("layer").getStyle()).to.be.equals("function");
            expect(wfsLayer.get("layer").getStyle()()).to.be.equals("test");
        });
    });
});
