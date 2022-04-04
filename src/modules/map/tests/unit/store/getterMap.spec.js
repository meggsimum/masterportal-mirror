/* import {expect} from "chai";
import sinon from "sinon";
import getters from "../../../store/gettersMap";
import stateMap from "../../../store/stateMap";
import Feature from "ol/Feature";
import LayerGroup from "ol/layer/Group";

describe("src/modules/map/store/gettersMap.js", () => {

    describe("Map simple getters", () => {
        it("returns the layerList from state", () => {
            const mapStub = sinon.stub(),
                state = {
                    layerList: mapStub
                };

            expect(getters.layerList(stateMap)).to.equals(null);
            expect(getters.layerList(state)).to.equals(mapStub);
        });
    });

    describe("Map custom getters", () => {
        it("returns the visibleLayerList", () => {
            const feature1 = new Feature({visible: true}),
                feature2 = new Feature({visible: true}),
                feature3 = new Feature({visible: false}),
                state = {
                    layerList: [feature1, feature2, feature3]
                };

            expect(getters.layerList(state)).to.be.an("array").that.contains(feature1, feature2);
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
                grouplayer = new LayerGroup({
                    layers: [feature1, feature2]
                }),
                state = {
                    layerList: [grouplayer, feature3]
                },
                visibleLayerListWithChildrenFromGroupLayers = [feature1, feature2, feature3];

            expect(getters.visibleWmsLayerList(state, {visibleLayerListWithChildrenFromGroupLayers})).to.be.an("array").that.contains(feature1, feature3);
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
 */
