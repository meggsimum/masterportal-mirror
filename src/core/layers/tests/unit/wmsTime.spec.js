import {expect} from "chai";
import sinon from "sinon";
import WMSTimeLayer from "../../wmsTime";
import mapCollection from "../../../../core/dataStorage/mapCollection.js";
import store from "../../../../app-store";

describe("src/core/layers/wmsTime.js", () => {
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

        mapCollection.addMap(map, "ol", "2D");
    });
    beforeEach(() => {
        attributes = {
            name: "wmsTimeTestLayer",
            id: "id",
            typ: "WMS",
            tilesize: 512,
            singleTile: false,
            minScale: "0",
            maxScale: "2500000",
            isChildLayer: false,
            layers: "layer1,layer2",
            transparent: false,
            isSelected: false,
            time: {
                default: 1997
            }
        };
        store.getters = {
            treeType: "custom"
        };
    });

    afterEach(() => {
        sinon.restore();
    });

    it("createLayer shall create an ol/Layer with source", function () {
        const wmsTimeLayer = new WMSTimeLayer(attributes),
            layer = wmsTimeLayer.get("layer");

        expect(layer).not.to.be.undefined;
        expect(layer.getSource()).not.to.be.undefined;
    });
    it("createLayer with isSelected=true shall add layer to map", function () {
        attributes.isSelected = true;
        const wmsTimeLayer = new WMSTimeLayer(attributes);

        expect(wmsTimeLayer.get("layer")).not.to.be.undefined;
        expect(wmsTimeLayer.get("isVisibleInMap")).to.be.true;
        expect(wmsTimeLayer.get("layer").getVisible()).to.be.true;
    });
    it("createLayer with isSelected=false shall not add layer to map", function () {
        const wmsTimeLayer = new WMSTimeLayer(attributes);

        expect(wmsTimeLayer.get("layer")).not.to.be.undefined;
        expect(wmsTimeLayer.get("isVisibleInMap")).to.be.false;
        expect(wmsTimeLayer.get("layer").getVisible()).to.be.false;
    });
    it("extractExtentValues - extract an object that contains the time range", function () {
        const wmsTimeLayer = new WMSTimeLayer(attributes),
            extent = {
                values: "2006/2018/P2Y"
            };

        expect(wmsTimeLayer.extractExtentValues(extent)).deep.equals({
            step: 1,
            timeRange: [2006, 2008, 2010, 2012, 2014, 2016, 2018]
        });
    });
    it("createTimeRange - create an array with the time range", function () {
        const wmsTimeLayer = new WMSTimeLayer(attributes),
            min = 2006,
            max = 2018,
            step = 1;

        expect(wmsTimeLayer.createTimeRange(min, max, step)).to.be.an("array");
        expect(wmsTimeLayer.createTimeRange(min, max, step)).includes(2006, 2008, 2010, 2012, 2014, 2016, 2018);
    });
    it("createTimeRange - create an array with the time range", function () {
        const wmsTimeLayer = new WMSTimeLayer(attributes),
            min = 2006,
            max = 2018,
            step = 1;

        expect(wmsTimeLayer.createTimeRange(min, max, step)).to.be.an("array");
        expect(wmsTimeLayer.createTimeRange(min, max, step)).includes(2006, 2008, 2010, 2012, 2014, 2016, 2018);
    });
});
