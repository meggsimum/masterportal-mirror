import {expect} from "chai";
import sinon from "sinon";
import WMSLayer from "../../wms";
import store from "../../../../app-store";

describe("src/core/layers/wms.js", () => {
    let attributes;

    before(() => {
        mapCollection.clear();
        const map = {
            id: "ol",
            mode: "2D",
            addInteraction: sinon.stub(),
            removeInteraction: sinon.stub(),
            addLayer: () => sinon.stub(),
            getView: () => {
                return {
                    getResolutions: () => [2000, 1000]
                };
            }
        };

        mapCollection.addMap(map, "2D");
    });
    beforeEach(() => {
        attributes = {
            name: "wmsTestLayer",
            id: "id",
            typ: "WMS",
            tilesize: 512,
            singleTile: false,
            minScale: "0",
            maxScale: "2500000",
            isChildLayer: false,
            layers: "layer1,layer2",
            transparent: false,
            isSelected: false
        };
        store.getters = {
            treeType: "custom"
        };
    });

    afterEach(() => {
        sinon.restore();
    });

    it("createLayer shall create an ol.Layer with source", function () {
        const wmsLayer = new WMSLayer(attributes),
            layer = wmsLayer.get("layer");

        expect(layer).not.to.be.undefined;
        expect(layer.getSource()).not.to.be.undefined;
    });
    it("createLayer with isSelected=true shall add layer to map", function () {
        attributes.isSelected = true;
        const wmsLayer = new WMSLayer(attributes);

        expect(wmsLayer.get("layer")).not.to.be.undefined;
        expect(wmsLayer.get("isVisibleInMap")).to.be.true;
        expect(wmsLayer.get("layer").getVisible()).to.be.true;
    });
    it("createLayer with isSelected=false shall not add layer to map", function () {
        const wmsLayer = new WMSLayer(attributes);

        expect(wmsLayer.get("layer")).not.to.be.undefined;
        expect(wmsLayer.get("isVisibleInMap")).to.be.false;
        expect(wmsLayer.get("layer").getVisible()).to.be.false;
    });
    it("createLayer with crs=EPSG:4326 shall have this projection at source", function () {
        attributes.crs = "EPSG:4326";
        const wmsLayer = new WMSLayer(attributes),
            layer = wmsLayer.get("layer");

        expect(layer).not.to.be.undefined;
        expect(layer.getSource()).not.to.be.undefined;
        expect(layer.getSource().getProjection()).not.to.be.undefined;
        expect(layer.getSource().getProjection().getCode()).to.be.equals(attributes.crs);
    });
    it("updateSourceSLDBody shall call updateParams at layers source", function () {
        attributes.SLDBody = "SLD_BODY";
        attributes.paramStyle = "paramStyle";
        const wmsLayer = new WMSLayer(attributes),
            layer = wmsLayer.get("layer");
        let paramsInCall = null;

        layer.getSource().updateParams = (params) => {
            paramsInCall = params;
        };
        wmsLayer.updateSourceSLDBody();
        expect(paramsInCall).not.to.be.null;
        expect(paramsInCall.SLD_BODY).to.be.equals("SLD_BODY");
        expect(paramsInCall.STYLES).to.be.equals("paramStyle");

    });
    it("updateSource shall change sessionId and update params of layer source", function () {
        const wmsLayer = new WMSLayer(attributes),
            layer = wmsLayer.get("layer"),
            sessionId = layer.getSource().getParams().SESSIONID;

        wmsLayer.updateSource();
        expect(wmsLayer.get("layer").getSource().getParams().SESSIONID).not.to.be.equals(sessionId);
    });

    it("createLegend shall dispatch an array of legends", function () {
        const dispatchCalls = {};
        let wmsLayer = null;

        attributes.legendURL = "";
        attributes.legend = true;
        attributes.version = "1.2.3";
        attributes.url = "http://url";
        wmsLayer = new WMSLayer(attributes);
        store.dispatch = (arg1, arg2) => {
            dispatchCalls[arg1] = arg2 !== undefined ? arg2 : "called";
        };

        wmsLayer.createLegend();
        expect(Array.isArray(dispatchCalls["Legend/setLegendOnChanged"])).to.be.true;
        expect(dispatchCalls["Legend/setLegendOnChanged"].length).to.be.equals(2);

    });
});
