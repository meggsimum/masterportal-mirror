import {expect} from "chai";
import sinon from "sinon";
import WMSLayer from "../../wms";
import WFSLayer from "../../wfs";
import OAFLayer from "../../oaf";
import GroupedLayers from "../../group";
import store from "../../../../app-store";

describe("src/core/layers/group.js", () => {
    let wmsLayerAttributes,
        wfsLayerAttributes,
        oafLayerAttributes,
        groupAttributes;
    const olLayer = {
        values_: {opacity: 1},
        getSource: () => {
            return {
                refresh: () => sinon.stub(),
                updateParams: () =>sinon.stub()
            };
        },
        setSource: () => sinon.spy,
        setOpacity: () => sinon.stub(),
        getOpacity: sinon.stub(),
        setVisible: () =>sinon.stub()
    };

    before(() => {
        mapCollection.clear();
        const map = {
            id: "ol",
            mode: "2D",
            addInteraction: sinon.spy(),
            removeInteraction: sinon.spy(),
            addLayer: sinon.spy(),
            getView: () => {
                return {
                    getResolutions: () => [2000, 1000]
                };
            }
        };

        mapCollection.addMap(map, "2D");
    });
    beforeEach(() => {
        wmsLayerAttributes = {
            name: "wmsTestLayer",
            id: "id_layer",
            typ: "WMS",
            tilesize: 512,
            singleTile: false,
            minScale: "0",
            maxScale: "10000",
            isChildLayer: true,
            layers: "layer1,layer2",
            transparent: false
        };
        wfsLayerAttributes = {
            name: "wfsTestLayer",
            id: "id_wfs_layer",
            url: "https://url.de",
            typ: "WFS",
            version: "2.0.0",
            isChildLayer: true,
            transparent: false,
            featureNS: "http://www.deegree.org/app",
            featureType: "krankenhaeuser_hh"
        };
        oafLayerAttributes = {
            name: "oafTestLayer",
            id: "id_oaf_layer",
            url: "https://url.de",
            typ: "OAF",
            isChildLayer: true,
            transparent: false,
            crs: "crs",
            collection: "krankenhaeuser_hh"
        };
        groupAttributes = {
            name: "groupTestLayer",
            id: "id_group",
            typ: "GROUP",
            tilesize: 512,
            singleTile: false,
            minScale: "0",
            maxScale: "20000",
            children: [wmsLayerAttributes],
            layers: [olLayer]
        };
        store.getters = {
            treeType: "custom"
        };
    });

    afterEach(() => {
        sinon.restore();
    });

    it("createLayer shall create an ol.Group with olLayer in layerSource", function () {
        groupAttributes.children.push(wfsLayerAttributes);
        groupAttributes.children.push(oafLayerAttributes);
        const groupUpdateSourceTrigger = sinon.spy(GroupedLayers.prototype, "updateSource"),
            groupCreateLegendTrigger = sinon.spy(GroupedLayers.prototype, "createLegend"),
            groupLayer = new GroupedLayers(groupAttributes),
            childLayer = groupLayer.get("layerSource"),
            wmsChildLayer = childLayer.find(layer => layer.get("typ") === "WMS"),
            wfsChildLayer = childLayer.find(layer => layer.get("typ") === "WFS"),
            oafChildLayer = childLayer.find(layer => layer.get("typ") === "OAF");

        expect(groupLayer).not.to.be.undefined;
        expect(wmsChildLayer).not.to.be.undefined;
        expect(wfsChildLayer).not.to.be.undefined;
        expect(oafChildLayer).not.to.be.undefined;
        expect(groupLayer.get("layer").values_.visible).to.be.false;
        expect(groupLayer.get("layer").getLayers().getLength()).to.be.equals(3);
        expect(childLayer).to.be.an("array").with.lengthOf(3);
        expect(wmsChildLayer.get("id")).to.be.equals(wmsLayerAttributes.id);
        expect(wmsChildLayer.get("layer")).not.to.be.undefined;
        expect(wmsChildLayer.get("typ")).to.be.equals(wmsLayerAttributes.typ);
        expect(wmsChildLayer).to.be.an.instanceof(WMSLayer);
        expect(wfsChildLayer.get("id")).to.be.equals(wfsLayerAttributes.id);
        expect(wfsChildLayer.get("typ")).to.be.equals(wfsLayerAttributes.typ);
        expect(wfsChildLayer).to.be.an.instanceof(WFSLayer);
        expect(oafChildLayer.get("id")).to.be.equals(oafLayerAttributes.id);
        expect(oafChildLayer.get("typ")).to.be.equals(oafLayerAttributes.typ);
        expect(oafChildLayer).to.be.an.instanceof(OAFLayer);
        expect(groupUpdateSourceTrigger.calledOnce).to.be.false;
        expect(groupCreateLegendTrigger.calledOnce).to.be.true;
    });
    it("createLayer with isVisibleInMap=true shall call update source", function () {
        const groupUpdateSourceTrigger = sinon.spy(GroupedLayers.prototype, "updateSource");

        groupAttributes.isVisibleInMap = true;
        new GroupedLayers(groupAttributes);

        expect(groupUpdateSourceTrigger.calledOnce).to.be.true;
    });
    it("createLayer with isVisibleInMap=true shall call update source for each layer", function () {
        const groupUpdateSourceTrigger = sinon.spy(GroupedLayers.prototype, "updateSource"),
            wmsUpdateSourceTrigger = sinon.spy(WMSLayer.prototype, "updateSource"),
            wfsUpdateSourceTrigger = sinon.spy(WFSLayer.prototype, "updateSource"),
            oafUpdateSourceTrigger = sinon.spy(OAFLayer.prototype, "updateSource");

        groupAttributes.children.push(wfsLayerAttributes);
        groupAttributes.children.push(oafLayerAttributes);
        groupAttributes.isVisibleInMap = true;
        new GroupedLayers(groupAttributes);

        expect(groupUpdateSourceTrigger.calledOnce).to.be.true;
        expect(wmsUpdateSourceTrigger.calledOnce).to.be.true;
        expect(wfsUpdateSourceTrigger.calledOnce).to.be.true;
        expect(oafUpdateSourceTrigger.calledOnce).to.be.true;
    });
    it("showLayerInformation shall dispatch", function () {
        wmsLayerAttributes.datasets = [{
            md_id: "md_id",
            csw_url: "cswUrl"
        }];
        const dispatchCalls = {},
            groupCreateLegendTrigger = sinon.spy(GroupedLayers.prototype, "createLegend"),
            groupLayer = new GroupedLayers(groupAttributes),
            layerInfo = {
                "metaID": "md_id",
                "layerName": wmsLayerAttributes.name,
                "cswUrl": "cswUrl"
            };

        store.dispatch = (arg1, arg2) => {
            dispatchCalls[arg1] = arg2 !== undefined ? arg2 : "called";
        };

        expect(groupLayer.has("layerInfoChecked")).to.be.false;
        groupLayer.showLayerInformation();
        expect(dispatchCalls["LayerInformation/layerInfo"]).to.be.an("object");
        expect(dispatchCalls["LayerInformation/layerInfo"].metaID).to.be.equals("md_id");
        expect(dispatchCalls["LayerInformation/layerInfo"].layername).to.be.equals(groupAttributes.name);
        expect(dispatchCalls["LayerInformation/layerInfo"].layerNames).to.be.deep.equals([wmsLayerAttributes.name]);
        expect(dispatchCalls["LayerInformation/activate"]).to.be.true;
        expect(dispatchCalls["LayerInformation/setCurrentLayerName"]).to.be.equals(wmsLayerAttributes.name);
        expect(dispatchCalls["LayerInformation/additionalSingleLayerInfo"]).to.be.equals("called");
        expect(dispatchCalls["LayerInformation/setMetadataURL"]).to.be.equals("md_id");
        expect(dispatchCalls["LayerInformation/setAdditionalLayer"]).to.be.deep.equals([layerInfo]);
        expect(dispatchCalls["Legend/setLayerIdForLayerInfo"]).to.be.equals(groupAttributes.id);
        expect(dispatchCalls["Legend/setLayerCounterIdForLayerInfo"]).to.be.a("number");
        expect(groupCreateLegendTrigger.calledTwice).to.be.true;
        expect(groupLayer.get("layerInfoChecked")).to.be.true;
    });
    it("checkForScale shall do nothing if options are not defined", function () {
        const groupLayer = new GroupedLayers(groupAttributes);

        expect(groupLayer.has("isOutOfRange")).to.be.false;
        groupLayer.checkForScale();

        expect(groupLayer.has("isOutOfRange")).to.be.false;
    });
    it("checkForScale shall set 'isOutOfRange'", function () {
        const groupLayer = new GroupedLayers(groupAttributes),
            options = {
                scale: "15000"
            };

        expect(groupLayer.has("isOutOfRange")).to.be.false;
        groupLayer.checkForScale(options);
        expect(groupLayer.get("isOutOfRange")).to.be.true;

        options.scale = "5000";
        groupLayer.checkForScale(options);
        expect(groupLayer.get("isOutOfRange")).to.be.false;
    });
    it("should return grouped layer as array", () => {
        const layerWrapper = new GroupedLayers(groupAttributes);

        expect(layerWrapper.getLayers().length).to.be.above(0);
    });
});
