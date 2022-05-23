import {expect} from "chai";
import sinon from "sinon";
import TileSetLayer from "../../tileset";
import store from "../../../../app-store";

describe("src/core/layers/tileset.js", () => {
    let attributes, map3D, cesium3DTilesetSpy;

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

        map3D = {
            id: "1",
            mode: "3D",
            getCesiumScene: () => {
                return {
                    primitives: {
                        show: true,
                        contains: () => true,
                        add: sinon.stub()
                    }
                };
            }
        };
        mapCollection.addMap(map, "2D");
        mapCollection.addMap(map3D, "3D");
    });
    beforeEach(() => {
        global.Cesium = {};
        global.Cesium.Cesium3DTileset = () => { /* no content*/ };
        attributes = {
            id: "4002",
            name: "Gebäude LoD2",
            url: "https://geoportal-hamburg.de/gdi3d/datasource-data/LoD2",
            typ: "TileSet3D",
            cesium3DTilesetOptions: {
                maximumScreenSpaceError: 6
            },
            isSelected: false
        };
        cesium3DTilesetSpy = sinon.spy(global.Cesium, "Cesium3DTileset");
        store.state.Maps.mode = "3D";
        store.getters = {
            "Maps/mode": store.state.Maps.mode
        };
    });

    afterEach(() => {
        sinon.restore();
        global.Cesium = null;
        store.state.Maps.mode = "2D";
    });

    /**
     * Checks the layer for attributes content.
     * @param {Object} layer the layer
     * @param {Object} tilesetLayer the tilesetLayer
     * @param {Object} attrs the attributes
     * @returns {void}
     */
    function checkLayer (layer, tilesetLayer, attrs) {
        expect(layer).not.to.be.undefined;
        expect(tilesetLayer.get("name")).to.be.equals(attrs.name);
        expect(tilesetLayer.get("id")).to.be.equals(attrs.id);
        expect(tilesetLayer.get("typ")).to.be.equals(attrs.typ);
        expect(layer.tileset.layerReferenceId).to.be.equals(attrs.id);
    }

    it("createLayer shall create a tileset layer", function () {
        const tilesetLayer = new TileSetLayer(attributes),
            layer = tilesetLayer.get("layer");

        checkLayer(layer, tilesetLayer, attributes);
        expect(cesium3DTilesetSpy.calledOnce).to.equal(true);

    });
    it("createLayer shall create a visible tileset layer", function () {
        attributes.isSelected = true;
        const tilesetLayer = new TileSetLayer(attributes),
            layer = tilesetLayer.get("layer");

        checkLayer(layer, tilesetLayer, attributes);
        expect(cesium3DTilesetSpy.calledOnce).to.equal(true);
        expect(cesium3DTilesetSpy.calledWithMatch({maximumScreenSpaceError: 6})).to.equal(true);
    });
    it("setVisible shall call setIsSelected", function () {
        const tilesetLayer = new TileSetLayer(attributes),
            layer = tilesetLayer.get("layer"),
            setIsSelectedSpy = sinon.spy(TileSetLayer.prototype, "setIsSelected");

        tilesetLayer.setVisible(true);
        checkLayer(layer, tilesetLayer, attributes);
        expect(setIsSelectedSpy.calledOnce).to.equal(true);
        expect(setIsSelectedSpy.calledWithMatch(true)).to.equal(true);
    });
    it("setIsSelected true shall create cesiumtilesetProvider", function () {
        const tilesetLayer = new TileSetLayer(attributes),
            layer = tilesetLayer.get("layer");

        tilesetLayer.setIsSelected(true);
        checkLayer(layer, tilesetLayer, attributes);
        expect(layer.tileset.show).to.be.true;
        expect(cesium3DTilesetSpy.calledOnce).to.equal(true);
        expect(cesium3DTilesetSpy.calledWithMatch({maximumScreenSpaceError: 6})).to.equal(true);
    });
    it("setIsSelected false shall create ellipsoidtilesetProvider", function () {
        const tilesetLayer = new TileSetLayer(attributes),
            layer = tilesetLayer.get("layer");

        tilesetLayer.setIsSelected(false);
        checkLayer(layer, tilesetLayer, attributes);
        expect(layer.tileset.show).to.be.false;
    });
    it("createLegend shall set legend", function () {
        attributes.legendURL = "https://legendUrl";
        const tilesetLayer = new TileSetLayer(attributes);

        tilesetLayer.createLegend();
        expect(tilesetLayer.get("legend")).to.be.deep.equals([attributes.legendURL]);
    });
    it("createLegend shall not set legend (ignore)", function () {
        attributes.legendURL = "ignore";
        const tilesetLayer = new TileSetLayer(attributes),
            setLegendSpy = sinon.spy(TileSetLayer.prototype, "setLegend");

        tilesetLayer.createLegend();
        expect(setLegendSpy.notCalled).to.equal(true);
    });
    it("setIsVisibleInMap to true shall set isVisibleInMap", function () {
        const tilesetLayer = new TileSetLayer(attributes),
            layer = tilesetLayer.get("layer");

        tilesetLayer.setIsVisibleInMap(true);
        checkLayer(layer, tilesetLayer, attributes);
        expect(tilesetLayer.get("isVisibleInMap")).to.equal(true);
        expect(cesium3DTilesetSpy.calledOnce).to.equal(true);
        expect(cesium3DTilesetSpy.calledWithMatch({maximumScreenSpaceError: 6})).to.equal(true);
    });
    it("setIsVisibleInMap to false shall set isVisibleInMap and hide layer", function () {
        const tilesetLayer = new TileSetLayer(attributes),
            layer = tilesetLayer.get("layer");

        checkLayer(layer, tilesetLayer, attributes);
        tilesetLayer.setIsVisibleInMap(false);
        expect(tilesetLayer.get("isVisibleInMap")).to.equal(false);
        expect(layer.tileset.show).to.be.false;
    });
});

