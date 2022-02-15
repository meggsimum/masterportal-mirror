import {expect} from "chai";
import sinon from "sinon";
import {Point, MultiPoint} from "ol/geom.js";
import Feature from "ol/Feature.js";
import Layer from "../../layer";
import Group from "../../group";
import store from "../../../../app-store";
import mapCollection from "../../../../core/dataStorage/mapCollection.js";

describe("src/core/layers/layer.js", () => {
    let attributes,
        layerRemoved = false,
        layerVisible = false,
        newLayerSource = false,
        layerOpacity = 1,
        layerResoMin = 0,
        layerResoMax = 1000,
        featureList = [];
    const olLayer = {
        values_: {opacity: layerOpacity},
        getSource: () => {
            return {
                refresh: () => sinon.spy,
                getFeatures: () => featureList
            };
        },
        setSource: () => {
            newLayerSource = true;
        },
        setOpacity: (newValue) => {
            layerOpacity = newValue;
        },
        getOpacity: () => {
            return layerOpacity;
        },
        setVisible: (value) => {
            layerVisible = value;
        },
        getVisible: () => {
            return layerVisible;
        },
        setMaxResolution: (value) => {
            layerResoMax = value;
        },
        setMinResolution: (value) => {
            layerResoMin = value;
        },
        getMaxResolution: () => {
            return layerResoMax;
        },
        getMinResolution: () => {
            return layerResoMin;
        }
    };

    before(() => {
        mapCollection.clear();
        const map = {
            id: "ol",
            mode: "2D",
            addInteraction: sinon.spy(),
            removeInteraction: sinon.spy(),
            addLayer: () => sinon.spy(),
            removeLayer: () => {
                layerRemoved = true;
            },
            getView: () => {
                return {
                    getResolutions: () => [2000, 1000]
                };
            }
        };

        mapCollection.addMap(map, "ol", "2D");
    });
    beforeEach(() => {
        attributes = {
            name: "TestLayer",
            id: "id",
            typ: "WMS",
            tilesize: 512,
            singleTile: false,
            minScale: "0",
            maxScale: "2500000",
            isChildLayer: true,
            layers: "layer1,layer2",
            transparent: false
        };
        store.getters = {
            treeType: "custom"
        };
        featureList = [];
        featureList.push(new Feature(new Point([1, 1])));
        featureList.push(new Feature(new MultiPoint([[1, 1], [2, 2]])));
    });
    afterEach(() => {
        sinon.restore();
        layerRemoved = false;
        layerVisible = false;
        newLayerSource = false;
    });

    it("createLayer shall create an ol.Layer with source", function () {
        const layerWrapper = new Layer(attributes, olLayer, false);

        expect(layerWrapper).not.to.be.undefined;
        expect(layerWrapper.get("layer")).not.to.be.undefined;
        expect(layerWrapper.get("layer").getSource()).not.to.be.undefined;
    });
    it("createLayer with isSelected=true shall add layer to map", function () {
        sinon.stub(Radio, "request").callsFake((...args) => {
            let ret = null;

            args.forEach(arg => {
                if (arg === "getResolutions") {
                    ret = [60, 20];
                }
            });
            return ret;
        });

        attributes.isSelected = true;
        const layerWrapper = new Layer(attributes, olLayer);

        expect(layerWrapper.get("layer")).not.to.be.undefined;
        expect(layerWrapper.get("layer").getVisible()).to.be.true;
        expect(layerWrapper.attributes.isVisibleInMap).to.be.true;

    });
    it("createLayer with isSelected=false shall not add layer to map", function () {
        sinon.stub(Radio, "request").callsFake((...args) => {
            let ret = null;

            args.forEach(arg => {
                if (arg === "getResolutions") {
                    ret = [60, 20];
                }
            });
            return ret;
        });

        attributes.isSelected = false;
        const layerWrapper = new Layer(attributes, olLayer);

        expect(layerWrapper.get("layer")).not.to.be.undefined;
        expect(layerWrapper.get("layer").getVisible()).to.be.false;
    });
    it("removeLayer shall remove Layer from map", function () {
        sinon.stub(Radio, "request").callsFake((...args) => {
            let ret = null;

            args.forEach(arg => {
                if (arg === "getResolutions") {
                    ret = [60, 20];
                }
            });
            return ret;
        });

        attributes.isSelected = true;
        const layerWrapper = new Layer(attributes, olLayer);

        expect(layerWrapper.get("layer")).not.to.be.undefined;
        expect(layerWrapper.get("layer").getVisible()).to.be.true;
        expect(layerWrapper.attributes.isVisibleInMap).to.be.true;

        layerWrapper.removeLayer();
        expect(layerWrapper.get("layer")).not.to.be.undefined;
        expect(layerWrapper.attributes.isVisibleInMap).to.be.false;
        expect(layerRemoved).to.be.true;
    });
    it("checkForScale shall trigger menu rerender", function () {
        let calledMenu = 0,
            calledIsOutOfRange = 0;

        sinon.stub(Radio, "trigger").callsFake((...args) => {
            args.forEach(arg => {
                if (arg === "Menu") {
                    calledMenu++;
                }
                if (arg === "change:isOutOfRange") {
                    calledIsOutOfRange++;
                }
            });
        });
        attributes.maxScale = "5000";
        attributes.minScale = "0";
        attributes.isOutOfRange = false;
        const layerWrapper = new Layer(attributes, olLayer);

        expect(layerWrapper.get("isOutOfRange")).to.be.true;
        expect(calledMenu).to.be.equals(2);
        expect(calledIsOutOfRange).to.be.equals(1);

        calledMenu = 0;
        calledIsOutOfRange = 0;
        layerWrapper.checkForScale({
            scale: "2000"
        });
        expect(layerWrapper.get("isOutOfRange")).to.be.false;
        expect(calledIsOutOfRange).to.be.equals(1);
        expect(calledMenu).to.be.equals(1);
    });
    it("setIsVisibleInMap shall change layer visibility", function () {
        const layerWrapper = new Layer(attributes, olLayer);

        expect(layerWrapper.attributes.isVisibleInMap).to.be.false;
        layerWrapper.setIsVisibleInMap(true);
        expect(layerWrapper.attributes.isVisibleInMap).to.be.true;
        expect(layerVisible).to.be.true;
    });
    it("setIsVisibleInMap shall change group layer visibility", function () {
        const groupAtts = {...attributes};
        let groupLayer = null,
            childLayer = null;

        groupAtts.typ = "GROUP";
        groupAtts.children = [attributes];
        groupAtts.layers = [olLayer];
        groupLayer = new Group(groupAtts);
        childLayer = groupLayer.get("layerSource");


        expect(groupLayer.attributes.isVisibleInMap).to.be.false;
        expect(childLayer).to.be.an("array").with.lengthOf(1);
        groupLayer.setIsVisibleInMap(true);
        expect(groupLayer.attributes.isVisibleInMap).to.be.true;
        expect(layerVisible).to.be.true;
    });
    it("setTransparency shall change layer opacity", function () {
        const layerWrapper = new Layer(attributes, olLayer);

        expect(layerWrapper.attributes.transparency).to.be.equals(0);
        expect(layerWrapper.get("layer").getOpacity()).to.be.equals(1);
        layerWrapper.setTransparency(90);
        expect(layerWrapper.attributes.transparency).to.be.equals(90);
        expect(layerWrapper.get("layer").getOpacity()).to.be.equals(0.1);

        layerWrapper.setTransparency("80");
        expect(layerWrapper.attributes.transparency).to.be.equals(80);
        expect(layerWrapper.get("layer").getOpacity()).to.be.equals(0.2);
    });
    it("decTransparency and incTransparency shall work in 10er steps and between 0 and 100", function () {
        const layerWrapper = new Layer(attributes, olLayer);

        expect(layerWrapper.attributes.transparency).to.be.equals(0);
        layerWrapper.incTransparency();
        expect(layerWrapper.attributes.transparency).to.be.equals(10);
        layerWrapper.decTransparency();
        expect(layerWrapper.attributes.transparency).to.be.equals(0);
        layerWrapper.decTransparency();
        expect(layerWrapper.attributes.transparency).to.be.equals(0);
        for (let index = 0; index < 10; index++) {
            layerWrapper.incTransparency();
        }
        expect(layerWrapper.attributes.transparency).to.be.equals(100);
        layerWrapper.incTransparency();
        expect(layerWrapper.attributes.transparency).to.be.equals(100);
    });
    it("updateLayerTransparency shall update layers opacity", function () {
        // attributes.isSelected = false;
        attributes.transparency = 50;
        const layerWrapper = new Layer(attributes, olLayer);

        expect(layerWrapper.attributes.transparency).to.be.equals(50);
        expect(layerWrapper.get("layer").getOpacity()).to.be.equals(0);
        layerWrapper.updateLayerTransparency();
        expect(layerWrapper.get("layer").getOpacity()).to.be.equals(0.5);
    });
    it("setIsVisibleInTree shall trigger menu rerender", function () {
        let calledMenu = 0,
            calledIsVisibleInTree = 0;

        sinon.stub(Radio, "trigger").callsFake((...args) => {
            args.forEach(arg => {
                if (arg === "Menu") {
                    calledMenu++;
                }
                if (arg === "change:isVisibleInTree") {
                    calledIsVisibleInTree++;
                }
            });
        });
        attributes.isOutOfRange = true;
        const layerWrapper = new Layer(attributes, olLayer);

        expect(layerWrapper.get("isVisibleInTree")).to.be.undefined;
        layerWrapper.setIsVisibleInTree(true);
        expect(layerWrapper.get("isVisibleInTree")).to.be.true;
        expect(calledIsVisibleInTree).to.be.equals(1);
        expect(calledMenu).to.be.equals(2);
    });
    it("resetSelectionIDX shall set selectionIDX to 0 and setSelectionIDX test", function () {
        const layerWrapper = new Layer(attributes, olLayer);

        expect(layerWrapper.attributes.selectionIDX).to.be.equals(0);
        layerWrapper.setSelectionIDX(1);
        expect(layerWrapper.attributes.selectionIDX).to.be.equals(1);
        layerWrapper.setSelectionIDX("2");
        expect(layerWrapper.attributes.selectionIDX).to.be.equals(2);
        layerWrapper.resetSelectionIDX();
        expect(layerWrapper.attributes.selectionIDX).to.be.equals(0);
    });
    it("toggleIsSettingVisible shall set 'isSettingVisible' of all other layers to false", function () {
        const attCopy = {...attributes};
        let layerWrapper = null,
            layerWrapper2 = null,
            layerWrapper3 = null,
            counter = 0;

        sinon.stub(Radio, "request").callsFake((...args) => {
            let ret = null;

            args.forEach(arg => {
                if (arg === "getCollection") {
                    ret = {
                        setIsSettingVisible: (newValue) => {
                            layerWrapper2.setIsSettingVisible(newValue);
                            layerWrapper3.setIsSettingVisible(newValue);
                        }
                    };
                }
            });
            return ret;
        });
        sinon.stub(Radio, "trigger").callsFake((...args) => {
            args.forEach(arg => {
                if (arg === "renderSetting") {
                    counter++;
                }
            });
        });

        attributes.isSelected = true;
        layerWrapper = new Layer(attributes, olLayer);

        attCopy.isSettingVisible = true;
        attCopy.isSelected = true;
        layerWrapper2 = new Layer(attCopy, olLayer);
        layerWrapper3 = new Layer(attCopy, olLayer);

        expect(layerWrapper.attributes.isSettingVisible).to.be.false;
        layerWrapper.toggleIsSettingVisible();
        expect(layerWrapper2.attributes.isSettingVisible).to.be.false;
        expect(layerWrapper3.attributes.isSettingVisible).to.be.false;
        expect(layerWrapper.attributes.isSettingVisible).to.be.true;
        expect(counter).to.be.equals(2);
    });
    it("setIsSelected test true with treetype light", function () {
        testSetIsSelected("light", 2, 1, true);
    });
    it("setIsSelected test false with treetype light", function () {
        testSetIsSelected("light", 2, 1, false);
    });
    it("setIsSelected test true with treetype not light", function () {
        testSetIsSelected("custom", 2, 4, true);
    });
    it("setIsSelected test false with treetype not light", function () {
        testSetIsSelected("custom", 2, 4, false);
    });
    it("toggleIsVisibleInMap is true and treeType light", function () {
        testIsVisibleInMap("light", true, 1);
    });
    it("toggleIsVisibleInMap is false and treeType light", function () {
        testIsVisibleInMap("light", false, 1);
    });
    it("toggleIsVisibleInMap is true and treeType not light", function () {
        testIsVisibleInMap("custom", true, 6);
    });
    it("toggleIsVisibleInMap is false and treeType not light", function () {
        testIsVisibleInMap("custom", false, 3);
    });

    it("updateLayerSource test", function () {
        const layerWrapper = new Layer(attributes, olLayer);

        sinon.stub(Radio, "request").callsFake((...args) => {
            let ret = null;

            args.forEach(arg => {
                if (arg === "getModelsByAttributes") {
                    ret = [olLayer];
                }
            });
            return ret;
        });
        layerWrapper.updateLayerSource();
        expect(newLayerSource).to.be.true;
    });
    it("moveDown test", function () {
        let moveModelInTree = false,
            upDown = 0;

        sinon.stub(Radio, "trigger").callsFake((...args) => {
            args.forEach(arg => {
                if (arg === "moveModelInTree") {
                    moveModelInTree = true;
                }
                if (arg === -1) {
                    upDown = arg;
                }
            });
        });
        const layerWrapper = new Layer(attributes, olLayer);

        layerWrapper.moveDown();
        expect(moveModelInTree).to.be.true;
        expect(upDown).to.be.equals(-1);
    });
    it("moveUp test", function () {
        let moveModelInTree = false,
            upDown = 0;

        sinon.stub(Radio, "trigger").callsFake((...args) => {
            args.forEach(arg => {
                if (arg === "moveModelInTree") {
                    moveModelInTree = true;
                }
                if (arg === 1) {
                    upDown = arg;
                }
            });
        });
        const layerWrapper = new Layer(attributes, olLayer);

        layerWrapper.moveUp();
        expect(moveModelInTree).to.be.true;
        expect(upDown).to.be.equals(1);
    });
    it("handleSingleBaseLayer test by calling toggleIsSelected", function () {
        const attCopy = {...attributes};
        let layerWrapper = null,
            layerWrapper2 = null,
            layerWrapper3 = null,
            rerender = false;

        sinon.stub(Radio, "trigger").callsFake((...args) => {
            args.forEach(arg => {
                if (arg === "rerender") {
                    rerender = true;
                }
            });
        });
        sinon.stub(Radio, "request").callsFake((...args) => {
            let ret = null;

            args.forEach(arg => {
                if (arg === "getModelsByAttributes") {
                    ret = [layerWrapper2, layerWrapper3];
                }
            });
            return ret;
        });
        attributes.singleBaselayer = true;
        attributes.parentId = "Baselayer";
        layerWrapper = new Layer(attributes, olLayer);

        attCopy.isSelected = true;
        attCopy.isVisibleInMap = true;
        attCopy.id = "anotherId";
        layerWrapper2 = new Layer(attCopy, olLayer);
        layerWrapper3 = new Layer(attCopy, olLayer);

        expect(layerWrapper.attributes.isSelected).to.be.false;
        expect(layerWrapper2.attributes.isSelected).to.be.true;
        expect(layerWrapper3.attributes.isSelected).to.be.true;
        layerWrapper.toggleIsSelected();
        expect(layerWrapper.attributes.isSelected).to.be.true;
        expect(layerWrapper2.attributes.isSelected).to.be.false;
        expect(layerWrapper3.attributes.isSelected).to.be.false;
        expect(rerender).to.be.true;
        expect(layerRemoved).to.be.true;
    });
    it("handleSingleBaseLayer test by calling toggleIsSelected with no singleBaselayer", function () {
        const attCopy = {...attributes};
        let layerWrapper = null,
            layerWrapper2 = null,
            layerWrapper3 = null,
            rerender = false;

        sinon.stub(Radio, "trigger").callsFake((...args) => {
            args.forEach(arg => {
                if (arg === "rerender") {
                    rerender = true;
                }
            });
        });
        sinon.stub(Radio, "request").callsFake((...args) => {
            let ret = null;

            args.forEach(arg => {
                if (arg === "getModelsByAttributes") {
                    ret = [layerWrapper2, layerWrapper3];
                }
            });
            return ret;
        });
        attributes.singleBaselayer = false;
        attributes.parentId = "Baselayer";
        layerWrapper = new Layer(attributes, olLayer);

        attCopy.isSelected = true;
        attCopy.isVisibleInMap = true;
        attCopy.id = "anotherId";
        layerWrapper2 = new Layer(attCopy, olLayer);
        layerWrapper3 = new Layer(attCopy, olLayer);

        expect(layerWrapper.attributes.isSelected).to.be.false;
        expect(layerWrapper2.attributes.isSelected).to.be.true;
        expect(layerWrapper3.attributes.isSelected).to.be.true;
        layerWrapper.toggleIsSelected();
        expect(layerWrapper.attributes.isSelected).to.be.true;
        expect(layerWrapper2.attributes.isSelected).to.be.true;
        expect(layerWrapper3.attributes.isSelected).to.be.true;
        expect(rerender).to.be.true;
        expect(layerRemoved).to.be.false;
    });
    it("showLayerInformation test", function () {
        const dispatchCalls = {},
            dataset = {
                csw_url: "https://metaver.de/csw",
                md_id: "B6A59A2B-2D40-4676-9094-0EB73039ED34",
                show_doc_url: "https://metaver.de/trefferanzeige?cmd=doShowDocument&docuuid="
            };
        let layerWrapper = null,
            layerInfo = null;

        store.dispatch = (arg1, arg2) => {
            dispatchCalls[arg1] = arg2 !== undefined ? arg2 : "called";
        };
        attributes.datasets = [dataset];
        layerWrapper = new Layer(attributes, olLayer);

        layerWrapper.showLayerInformation();
        layerInfo = dispatchCalls["LayerInformation/layerInfo"];

        expect(layerInfo.id).to.be.equals(layerWrapper.get("id"));
        expect(layerInfo.metaID).to.be.equals(dataset.md_id);
        expect(layerInfo.showDocUrl).to.be.equals(dataset.show_doc_url);
        expect(layerInfo.cswUrl).to.be.equals(dataset.csw_url);
        expect(dispatchCalls["LayerInformation/activate"]).to.be.equals(true);
        expect(dispatchCalls["LayerInformation/additionalSingleLayerInfo"]).to.be.equals("called");
        expect(dispatchCalls["LayerInformation/setMetadataURL"]).to.be.equals(dataset.md_id);
        expect(dispatchCalls["Legend/setLayerIdForLayerInfo"]).to.be.equals(layerWrapper.get("id"));
        expect(dispatchCalls["Legend/setLayerCounterIdForLayerInfo"]).not.to.be.undefined;
        expect(layerWrapper.attributes.layerInfoChecked).to.be.true;
    });
    it("set shall handle objects and key-value", function () {
        const layerWrapper = new Layer(attributes, olLayer);

        layerWrapper.set("key", "value");
        expect(layerWrapper.attributes.key).to.be.equals("value");
        layerWrapper.set(undefined, "value");
        expect(layerWrapper.attributes.undefined).to.be.equals(undefined);
        layerWrapper.set({"key": "value2"});
        expect(layerWrapper.attributes.key).to.be.equals("value2");

    });
    it("get shall handle layer and layerSource", function () {
        const layerWrapper = new Layer(attributes, olLayer);

        expect(layerWrapper.get("layer")).to.be.equals(olLayer);
        expect(layerWrapper.get("layerSource")).not.to.be.undefined;
        expect(layerWrapper.get("id")).to.be.equals("id");

    });
    it("get('layerSource') on groupLayer shall return childLayers", function () {
        const groupAtts = {...attributes};
        let groupLayer = null,
            childLayer = null;

        groupAtts.typ = "GROUP";
        groupAtts.children = [attributes];
        groupAtts.layers = [olLayer];
        groupLayer = new Group(groupAtts);
        childLayer = groupLayer.get("layerSource");

        expect(childLayer).to.be.an("array").with.lengthOf(1);
        expect(childLayer[0].attributes.id).to.be.equals(attributes.id);
    });
    it("has shall handle layer and layerSource", function () {
        const layerWrapper = new Layer(attributes, olLayer);

        expect(layerWrapper.has("layer")).to.be.true;
        expect(layerWrapper.has("layerSource")).to.be.true;
        expect(layerWrapper.has("id")).to.be.true;
        expect(layerWrapper.has("idnotthere")).to.be.false;

    });
    it("setIsJustAdded shall set isJustAdded", function () {
        const layerWrapper = new Layer(attributes, olLayer);

        expect(layerWrapper.has("isJustAdded")).to.be.false;
        layerWrapper.setIsJustAdded(true);
        expect(layerWrapper.has("isJustAdded")).to.be.true;
        expect(layerWrapper.get("isJustAdded")).to.be.true;
    });
    it("setMinMaxResolutions shall set max and min resolution at layer", function () {
        sinon.stub(Radio, "request").callsFake((...args) => {
            let ret = null;

            args.forEach(arg => {
                if (arg === "max") {
                    ret = 600;
                }
                if (arg === "min") {
                    ret = 1;
                }
            });
            return ret;
        });
        const layerWrapper = new Layer(attributes, olLayer),
            layer = layerWrapper.get("layer");

        expect(layer.getMaxResolution()).to.be.equals(600 + (600 / 100));
        expect(layer.getMinResolution()).to.be.equals(1);
    });
    it("prepareFeaturesFor3D without altitude", function () {
        attributes.altitude = undefined;
        const layerWrapper = new Layer(attributes, olLayer),
            layer = layerWrapper.get("layer");
        let alteredFeatures = null;

        layerWrapper.prepareFeaturesFor3D(layer.getSource().getFeatures());
        alteredFeatures = layer.getSource().getFeatures();

        expect(alteredFeatures[0].getGeometry()).to.be.an.instanceof(Point);
        expect(alteredFeatures[0].getGeometry().getCoordinates().length).to.be.equals(2);
        expect(alteredFeatures[0].getGeometry().getCoordinates()[0]).to.be.equals(1);
        expect(alteredFeatures[0].getGeometry().getCoordinates()[1]).to.be.equals(1);
    });
    it("prepareFeaturesFor3D without altitudeOffset", function () {
        attributes.altitudeOffset = undefined;
        const layerWrapper = new Layer(attributes, olLayer),
            layer = layerWrapper.get("layer");
        let alteredFeatures = null;

        layerWrapper.prepareFeaturesFor3D(layer.getSource().getFeatures());
        alteredFeatures = layer.getSource().getFeatures();

        expect(alteredFeatures[0].getGeometry()).to.be.an.instanceof(Point);
        expect(alteredFeatures[0].getGeometry().getCoordinates().length).to.be.equals(2);
        expect(alteredFeatures[0].getGeometry().getCoordinates()[0]).to.be.equals(1);
        expect(alteredFeatures[0].getGeometry().getCoordinates()[1]).to.be.equals(1);
    });
    it("prepareFeaturesFor3D set altitude on 2D-point geometry coordinates", function () {
        attributes.altitude = 127;
        const layerWrapper = new Layer(attributes, olLayer),
            layer = layerWrapper.get("layer");
        let alteredFeatures = null;

        layerWrapper.prepareFeaturesFor3D(layer.getSource().getFeatures());
        alteredFeatures = layer.getSource().getFeatures();

        expect(alteredFeatures[0].getGeometry()).to.be.an.instanceof(Point);
        expect(alteredFeatures[0].getGeometry().getCoordinates().length).to.be.equals(3);
        expect(alteredFeatures[0].getGeometry().getCoordinates()[0]).to.be.equals(1);
        expect(alteredFeatures[0].getGeometry().getCoordinates()[1]).to.be.equals(1);
        expect(alteredFeatures[0].getGeometry().getCoordinates()[2]).to.be.equals(attributes.altitude);

    });
    it("prepareFeaturesFor3D set altitude on 3D-point geometry coordinates", function () {
        attributes.altitude = 127;
        featureList = [];
        featureList.push(new Feature(new Point([1, 1, 1])));

        const layerWrapper = new Layer(attributes, olLayer),
            layer = layerWrapper.get("layer");
        let alteredFeatures = null;

        layerWrapper.prepareFeaturesFor3D(layer.getSource().getFeatures());
        alteredFeatures = layer.getSource().getFeatures();

        expect(alteredFeatures[0].getGeometry()).to.be.an.instanceof(Point);
        expect(alteredFeatures[0].getGeometry().getCoordinates().length).to.be.equals(3);
        expect(alteredFeatures[0].getGeometry().getCoordinates()[0]).to.be.equals(1);
        expect(alteredFeatures[0].getGeometry().getCoordinates()[1]).to.be.equals(1);
        expect(alteredFeatures[0].getGeometry().getCoordinates()[2]).to.be.equals(attributes.altitude);

    });
    it("prepareFeaturesFor3D set altitudeOffset on 2D-point geometry coordinates", function () {
        attributes.altitudeOffset = 10;
        const layerWrapper = new Layer(attributes, olLayer),
            layer = layerWrapper.get("layer");
        let alteredFeatures = null;

        layerWrapper.prepareFeaturesFor3D(layer.getSource().getFeatures());
        alteredFeatures = layer.getSource().getFeatures();

        expect(alteredFeatures[0].getGeometry()).to.be.an.instanceof(Point);
        expect(alteredFeatures[0].getGeometry().getCoordinates().length).to.be.equals(3);
        expect(alteredFeatures[0].getGeometry().getCoordinates()[0]).to.be.equals(1);
        expect(alteredFeatures[0].getGeometry().getCoordinates()[1]).to.be.equals(1);
        expect(alteredFeatures[0].getGeometry().getCoordinates()[2]).to.be.equals(attributes.altitudeOffset);

    });
    it("prepareFeaturesFor3D set altitudeOffset on 3D-point geometry coordinates", function () {
        attributes.altitudeOffset = 10;
        featureList = [];
        featureList.push(new Feature(new Point([1, 1, 1])));

        const layerWrapper = new Layer(attributes, olLayer),
            layer = layerWrapper.get("layer");
        let alteredFeatures = null;

        layerWrapper.prepareFeaturesFor3D(layer.getSource().getFeatures());
        alteredFeatures = layer.getSource().getFeatures();

        expect(alteredFeatures[0].getGeometry()).to.be.an.instanceof(Point);
        expect(alteredFeatures[0].getGeometry().getCoordinates().length).to.be.equals(3);
        expect(alteredFeatures[0].getGeometry().getCoordinates()[0]).to.be.equals(1);
        expect(alteredFeatures[0].getGeometry().getCoordinates()[1]).to.be.equals(1);
        expect(alteredFeatures[0].getGeometry().getCoordinates()[2]).to.be.equals(attributes.altitudeOffset + 1);

    });
    it("prepareFeaturesFor3D set altitude on 2D-multipoint geometry coordinates", function () {
        attributes.altitude = 127;
        const layerWrapper = new Layer(attributes, olLayer),
            layer = layerWrapper.get("layer");
        let alteredFeatures = null;

        layerWrapper.prepareFeaturesFor3D(layer.getSource().getFeatures());
        alteredFeatures = layer.getSource().getFeatures();

        expect(alteredFeatures[1].getGeometry()).to.be.an.instanceof(MultiPoint);
        expect(alteredFeatures[1].getGeometry().getCoordinates().length).to.be.equals(2);
        expect(alteredFeatures[1].getGeometry().getCoordinates()[0].length).to.be.equals(3);
        expect(alteredFeatures[1].getGeometry().getCoordinates()[1].length).to.be.equals(3);
        expect(alteredFeatures[1].getGeometry().getCoordinates()[0][0]).to.be.equals(1);
        expect(alteredFeatures[1].getGeometry().getCoordinates()[0][1]).to.be.equals(1);
        expect(alteredFeatures[1].getGeometry().getCoordinates()[0][2]).to.be.equals(attributes.altitude);
        expect(alteredFeatures[1].getGeometry().getCoordinates()[1][0]).to.be.equals(2);
        expect(alteredFeatures[1].getGeometry().getCoordinates()[1][1]).to.be.equals(2);
        expect(alteredFeatures[1].getGeometry().getCoordinates()[1][2]).to.be.equals(attributes.altitude);
    });
    it("prepareFeaturesFor3D set altitude on 2D-multipoint geometry coordinates", function () {
        attributes.altitude = 127;
        featureList = [];
        featureList.push(new Feature(new MultiPoint([[1, 1, 1], [2, 2, 2]])));

        const layerWrapper = new Layer(attributes, olLayer),
            layer = layerWrapper.get("layer");
        let alteredFeatures = null;

        layerWrapper.prepareFeaturesFor3D(layer.getSource().getFeatures());
        alteredFeatures = layer.getSource().getFeatures();

        expect(alteredFeatures[0].getGeometry()).to.be.an.instanceof(MultiPoint);
        expect(alteredFeatures[0].getGeometry().getCoordinates().length).to.be.equals(2);
        expect(alteredFeatures[0].getGeometry().getCoordinates()[0].length).to.be.equals(3);
        expect(alteredFeatures[0].getGeometry().getCoordinates()[1].length).to.be.equals(3);
        expect(alteredFeatures[0].getGeometry().getCoordinates()[0][0]).to.be.equals(1);
        expect(alteredFeatures[0].getGeometry().getCoordinates()[0][1]).to.be.equals(1);
        expect(alteredFeatures[0].getGeometry().getCoordinates()[0][2]).to.be.equals(attributes.altitude);
        expect(alteredFeatures[0].getGeometry().getCoordinates()[1][0]).to.be.equals(2);
        expect(alteredFeatures[0].getGeometry().getCoordinates()[1][1]).to.be.equals(2);
        expect(alteredFeatures[0].getGeometry().getCoordinates()[1][2]).to.be.equals(attributes.altitude);
    });
    it("prepareFeaturesFor3D set altitudeOffset on 2D-multipoint geometry coordinates", function () {
        attributes.altitudeOffset = 10;
        const layerWrapper = new Layer(attributes, olLayer),
            layer = layerWrapper.get("layer");
        let alteredFeatures = null;

        layerWrapper.prepareFeaturesFor3D(layer.getSource().getFeatures());
        alteredFeatures = layer.getSource().getFeatures();

        expect(alteredFeatures[1].getGeometry()).to.be.an.instanceof(MultiPoint);
        expect(alteredFeatures[1].getGeometry().getCoordinates().length).to.be.equals(2);
        expect(alteredFeatures[1].getGeometry().getCoordinates()[0].length).to.be.equals(3);
        expect(alteredFeatures[1].getGeometry().getCoordinates()[1].length).to.be.equals(3);
        expect(alteredFeatures[1].getGeometry().getCoordinates()[0][0]).to.be.equals(1);
        expect(alteredFeatures[1].getGeometry().getCoordinates()[0][1]).to.be.equals(1);
        expect(alteredFeatures[1].getGeometry().getCoordinates()[0][2]).to.be.equals(attributes.altitudeOffset);
        expect(alteredFeatures[1].getGeometry().getCoordinates()[1][0]).to.be.equals(2);
        expect(alteredFeatures[1].getGeometry().getCoordinates()[1][1]).to.be.equals(2);
        expect(alteredFeatures[1].getGeometry().getCoordinates()[1][2]).to.be.equals(attributes.altitudeOffset);
    });
    it("prepareFeaturesFor3D set altitudeOffset on 2D-multipoint geometry coordinates", function () {
        attributes.altitudeOffset = 10;
        featureList = [];
        featureList.push(new Feature(new MultiPoint([[1, 1, 1], [2, 2, 2]])));

        const layerWrapper = new Layer(attributes, olLayer),
            layer = layerWrapper.get("layer");
        let alteredFeatures = null;

        layerWrapper.prepareFeaturesFor3D(layer.getSource().getFeatures());
        alteredFeatures = layer.getSource().getFeatures();

        expect(alteredFeatures[0].getGeometry()).to.be.an.instanceof(MultiPoint);
        expect(alteredFeatures[0].getGeometry().getCoordinates().length).to.be.equals(2);
        expect(alteredFeatures[0].getGeometry().getCoordinates()[0].length).to.be.equals(3);
        expect(alteredFeatures[0].getGeometry().getCoordinates()[1].length).to.be.equals(3);
        expect(alteredFeatures[0].getGeometry().getCoordinates()[0][0]).to.be.equals(1);
        expect(alteredFeatures[0].getGeometry().getCoordinates()[0][1]).to.be.equals(1);
        expect(alteredFeatures[0].getGeometry().getCoordinates()[0][2]).to.be.equals(attributes.altitudeOffset + 1);
        expect(alteredFeatures[0].getGeometry().getCoordinates()[1][0]).to.be.equals(2);
        expect(alteredFeatures[0].getGeometry().getCoordinates()[1][1]).to.be.equals(2);
        expect(alteredFeatures[0].getGeometry().getCoordinates()[1][2]).to.be.equals(attributes.altitudeOffset + 2);
    });

    /**
     * testSetIsSelected
     * @param {String} treetype the treetype
     * @param {number} selectionIDX the selectionIDX
     * @param {Number} calls calls to trigger
     * @param {Boolean} isSelected true or false
     * @returns {void}
     */
    function testSetIsSelected (treetype, selectionIDX, calls, isSelected) {
        let layerWrapper = null,
            addLayerToIndex = false,
            counter = 0;

        store.getters = {
            treeType: treetype
        };
        sinon.stub(Radio, "trigger").callsFake((...args) => {
            args.forEach(arg => {
                if (arg === "rerender" || arg === "updateSelection" || arg === "updateLayerView") {
                    counter++;
                }
                if (arg === "addLayerToIndex") {
                    addLayerToIndex = true;
                }
            });
        });


        attributes.isSelected = !isSelected;
        attributes.isVisibleInMap = !isSelected;
        attributes.selectionIDX = 2;
        layerWrapper = new Layer(attributes, olLayer);

        expect(layerWrapper.attributes.isSelected).to.be.equals(!isSelected);
        expect(layerWrapper.attributes.isVisibleInMap).to.be.equals(!isSelected);
        layerWrapper.setIsSelected(isSelected);

        expect(layerWrapper.attributes.isSelected).to.be.equals(isSelected);
        expect(layerWrapper.attributes.isVisibleInMap).to.be.equals(isSelected);
        expect(layerWrapper.attributes.selectionIDX).to.be.equals(selectionIDX);
        expect(addLayerToIndex).to.be.equals(isSelected);
        expect(layerRemoved).to.be.equals(!isSelected);
        expect(counter).to.be.equals(calls);
    }

    /**
     * testIsVisibleInMap
     * @param {String} treeType the treeType
     * @param {Boolean} isVisibleInMap the attribute isVisibleInMap
     * @param {Number} calls calls to trigger
     * @returns {void}
     */
    function testIsVisibleInMap (treeType, isVisibleInMap, calls) {
        let layerWrapper = null,
            counter = 0;

        store.getters = {
            treeType: treeType
        };
        sinon.stub(Radio, "trigger").callsFake((...args) => {
            args.forEach(arg => {
                if (arg === "rerender" || arg === "updateSelection" || arg === "updateLayerView") {
                    counter++;
                }
            });
        });

        attributes.isVisibleInMap = !isVisibleInMap;
        attributes.isSelected = !isVisibleInMap;
        layerWrapper = new Layer(attributes, olLayer);

        expect(layerWrapper.attributes.isVisibleInMap).to.be.equals(!isVisibleInMap);
        layerWrapper.toggleIsVisibleInMap();
        expect(layerWrapper.attributes.isVisibleInMap).to.be.equals(isVisibleInMap);
        expect(layerVisible).to.be.equals(isVisibleInMap);
        expect(counter).to.be.equals(calls);
    }
});
