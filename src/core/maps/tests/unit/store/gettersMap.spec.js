import {expect} from "chai";
import sinon from "sinon";
import getters from "../../../store/gettersMap";
import mutations from "../../../store/mutationsMap";
import Feature from "ol/Feature";
import LayerGroup from "ol/layer/Group";
import View from "ol/View";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import mapCollection from "../../../../dataStorage/mapCollection";

const {addLayerToMap} = mutations;

describe("src/core/maps/store/gettersMap.js", () => {

    describe("Map simple getters", () => {

        it("returns the layerList from state", () => {
            expect(getters.getLayerList()).to.be.a("array");
        });
        it("returns the 2D map", () => {
            const map = {
                id: "ol",
                mode: "2D"
            };

            mapCollection.addMap(map, "ol", "2D");

            expect(getters.get2DMap()).to.deep.equal({id: "ol", mode: "2D"});
        });
        it("returns the 3D map", () => {
            const map = {
                id: "olcs",
                mode: "3D"
            };

            mapCollection.addMap(map, "olcs", "3D");

            expect(getters.get3DMap()).to.deep.equal({id: "olcs", mode: "3D"});
        });
        it("returns the map layers", () => {
            const layers = [],
                map = {
                    id: "ol",
                    mode: "2D",
                    addLayer: (layer) => {
                        layers.push(layer);
                    },
                    getLayers: () => {
                        return layer;
                    }
                },
                layer = new VectorLayer({
                    name: "layer123",
                    source: new VectorSource()
                }),
                state = {
                    mapId: "ol",
                    mapMode: "2D"
                };

            mapCollection.clear();
            mapCollection.addMap(map, "ol", "2D");
            addLayerToMap(state, layer);

            expect(getters.getLayers().values_.name).to.equals("layer123");
        });
    });

    describe("Map custom getters", () => {

        it(" gfiFeaturesAtPixel returns an array", () => {
            const map = {
                    id: "ol",
                    mode: "2D",
                    view: new View(),
                    forEachFeatureAtPixel: sinon.spy()
                },
                state = {
                    mapId: "ol",
                    mapMode: "2D"
                };

            mapCollection.clear();
            mapCollection.addMap(map, "ol", "2D");
            expect(getters.gfiFeaturesAtPixel(state, [40, 50])).be.a("array");
        });
        it("returns the visibleLayerList", () => {
            expect(getters.getVisibleLayerList()).to.be.a("array");
        });
        it("returns the visibleLayerListWithChildrenFromGroupLayers without Group layers", () => {
            const feature1 = new Feature({visible: true}),
                feature2 = new Feature({visible: true}),
                feature3 = new Feature({visible: false}),
                state = {
                    layerList: [feature1, feature2, feature3]
                },
                visibleLayerList = [feature1, feature2];

            expect(getters.visibleLayerListWithChildrenFromGroupLayers(state, {visibleLayerList})).to.be.an("array").that.contains(feature1, feature2);
        });
        it("returns the visibleLayerListWithChildrenFromGroupLayers with Group layers", () => {
            const feature1 = new Feature({visible: true}),
                feature2 = new Feature({visible: true}),
                feature3 = new Feature({visible: true}),
                grouplayer = new LayerGroup({
                    layers: [feature1, feature2]
                }),
                state = {
                    layerList: [grouplayer, feature3]
                },
                visibleLayerList = [grouplayer, feature3];

            expect(getters.visibleLayerListWithChildrenFromGroupLayers(state, {visibleLayerList})).to.be.an("array").that.contains(feature1, feature2, feature3);
        });
        it("returns the visibleWmsLayerList", () => {
            const feature1 = new Feature({visible: true, typ: "WMS"}),
                feature2 = new Feature({visible: true, typ: "WFS"}),
                feature3 = new Feature({visible: true, typ: "WMS"}),
                visibleLayerListWithChildrenFromGroupLayers = [feature1, feature2, feature3];

            expect(getters.visibleWmsLayerList({}, {visibleLayerListWithChildrenFromGroupLayers})).to.be.an("array").that.contains(feature1, feature3);
        });

        it("returns the Features in reverse order", () => {
            const feature1 = new Feature({visible: true, typ: "WMS"}),
                feature2 = new Feature({visible: true, typ: "WFS"}),
                feature3 = new Feature({visible: true, typ: "WCS"}),
                state = {
                    gfiFeatures: [feature1, feature2, feature3]
                };

            expect(getters.gfiFeaturesReverse(state)).to.eql([feature3, feature2, feature1]);
        });
    });

    describe("scaleToOne", () => {
        it("should return \"1 : scale must be a positive number\" if anything but a number is given", () => {
            expect(getters.scaleToOne(false, {scale: undefined})).to.equal("1 : scale must be a positive number");
            expect(getters.scaleToOne(false, {scale: null})).to.equal("1 : scale must be a positive number");
            expect(getters.scaleToOne(false, {scale: "string"})).to.equal("1 : scale must be a positive number");
            expect(getters.scaleToOne(false, {scale: true})).to.equal("1 : scale must be a positive number");
            expect(getters.scaleToOne(false, {scale: false})).to.equal("1 : scale must be a positive number");
            expect(getters.scaleToOne(false, {scale: {}})).to.equal("1 : scale must be a positive number");
            expect(getters.scaleToOne(false, {scale: []})).to.equal("1 : scale must be a positive number");
        });
        it("should return \"1 : scale must be a positive number\" if zero is given", () => {
            expect(getters.scaleToOne(false, {scale: 0})).to.equal("1 : scale must be a positive number");
        });
        it("should return \"1 : scale must be a positive number\" if a negative scale is given", () => {
            expect(getters.scaleToOne(false, {scale: -1})).to.equal("1 : scale must be a positive number");
        });
        it("should keep the given scale as scaleToOne untouched if scale is 1.000 or less", () => {
            expect(getters.scaleToOne(false, {scale: 1})).to.equal("1 : 1");
            expect(getters.scaleToOne(false, {scale: 123})).to.equal("1 : 123");
            expect(getters.scaleToOne(false, {scale: 999})).to.equal("1 : 999");
            expect(getters.scaleToOne(false, {scale: 1000})).to.equal("1 : 1.000");
        });
        it("should return the given scale as scaleToOne down to the fifties if scale is 10.000 or less", () => {
            expect(getters.scaleToOne(false, {scale: 1001})).to.equal("1 : 1.000");
            expect(getters.scaleToOne(false, {scale: 1024})).to.equal("1 : 1.000");
            expect(getters.scaleToOne(false, {scale: 1025})).to.equal("1 : 1.050");
            expect(getters.scaleToOne(false, {scale: 10000})).to.equal("1 : 10.000");
        });
        it("should return the given scale as scaleToOne down to five hundreds if scale is greater than 10.000", () => {
            expect(getters.scaleToOne(false, {scale: 10249})).to.equal("1 : 10.000");
            expect(getters.scaleToOne(false, {scale: 10250})).to.equal("1 : 10.500");
        });
    });
});
