import {expect} from "chai";
import sinon from "sinon";
import TerrainLayer from "../../terrain";
import mapCollection from "../../../dataStorage/mapCollection.js";
import store from "../../../../app-store";

describe("src/core/layers/terrain.js", () => {
    let attributes, map3D, cesiumTerrainProviderSpy, cesiumEllipsoidTerrainProviderSpy;

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
                return {};
            }
        };
        mapCollection.addMap(map, "ol", "2D");
        mapCollection.addMap(map3D, "map3D_0", "3D");
    });
    beforeEach(() => {
        global.Cesium = {};
        global.Cesium.CesiumTerrainProvider = () => { /* no content*/ };
        global.Cesium.EllipsoidTerrainProvider = () => { /* no content*/ };
        attributes = {
            name: "terrainTestLayer",
            id: "id",
            typ: "Terrain3D",
            cesiumTerrainProviderOptions: {
                requestVertexNormals: true
            },
            isSelected: false
        };
        cesiumTerrainProviderSpy = sinon.spy(global.Cesium, "CesiumTerrainProvider");
        cesiumEllipsoidTerrainProviderSpy = sinon.spy(global.Cesium, "EllipsoidTerrainProvider");
        store.state.Map.mapId = "map3D_0";
        store.state.Map.mapMode = "3D";
    });

    afterEach(() => {
        sinon.restore();
        global.Cesium = null;
        store.state.Map.mapId = "ol";
        store.state.Map.mapMode = "2D";
    });

    /**
     * Checks the layer for attributes content.
     * @param {Object} layer the layer
     * @param {Object} terrainLayer the terrainLayer
     * @param {Object} attrs the attributes
     * @returns {void}
     */
    function checkLayer (layer, terrainLayer, attrs) {
        expect(layer).not.to.be.undefined;
        expect(terrainLayer.get("name")).to.be.equals(attrs.name);
        expect(terrainLayer.get("id")).to.be.equals(attrs.id);
        expect(terrainLayer.get("typ")).to.be.equals(attrs.typ);
    }

    it("createLayer shall create a terrain layer", function () {
        const terrainLayer = new TerrainLayer(attributes),
            layer = terrainLayer.get("layer");

        checkLayer(layer, terrainLayer, attributes);
        expect(cesiumTerrainProviderSpy.notCalled).to.equal(true);
        expect(cesiumEllipsoidTerrainProviderSpy.notCalled).to.equal(true);
    });
    it("createLayer shall create a visible terrain layer", function () {
        attributes.isSelected = true;
        const terrainLayer = new TerrainLayer(attributes),
            layer = terrainLayer.get("layer");

        checkLayer(layer, terrainLayer, attributes);
        expect(cesiumTerrainProviderSpy.calledOnce).to.equal(true);
        expect(cesiumTerrainProviderSpy.calledWithMatch({requestVertexNormals: true})).to.equal(true);
        expect(cesiumEllipsoidTerrainProviderSpy.notCalled).to.equal(true);
    });
    it("setVisible shall call setIsSelected", function () {
        const terrainLayer = new TerrainLayer(attributes),
            layer = terrainLayer.get("layer"),
            setIsSelectedSpy = sinon.spy(TerrainLayer.prototype, "setIsSelected");

        terrainLayer.setVisible(true);
        checkLayer(layer, terrainLayer, attributes);
        expect(setIsSelectedSpy.calledOnce).to.equal(true);
        expect(setIsSelectedSpy.calledWithMatch(true)).to.equal(true);
    });
    it("setIsSelected true shall create cesiumTerrainProvider", function () {
        const terrainLayer = new TerrainLayer(attributes),
            layer = terrainLayer.get("layer");

        terrainLayer.setIsSelected(true);
        checkLayer(layer, terrainLayer, attributes);
        expect(cesiumTerrainProviderSpy.calledOnce).to.equal(true);
        expect(cesiumTerrainProviderSpy.calledWithMatch({requestVertexNormals: true})).to.equal(true);
        expect(cesiumEllipsoidTerrainProviderSpy.notCalled).to.equal(true);
    });
    it("setIsSelected false shall create ellipsoidTerrainProvider", function () {
        const terrainLayer = new TerrainLayer(attributes),
            layer = terrainLayer.get("layer");

        terrainLayer.setIsSelected(false);
        checkLayer(layer, terrainLayer, attributes);
        expect(cesiumEllipsoidTerrainProviderSpy.calledOnce).to.equal(true);
        expect(cesiumTerrainProviderSpy.notCalled).to.equal(true);
    });
    it("createLegend shall set legend", function () {
        attributes.legendURL = "https://legendUrl";
        const terrainLayer = new TerrainLayer(attributes);

        terrainLayer.createLegend();
        expect(terrainLayer.get("legend")).to.be.deep.equals([attributes.legendURL]);
    });
    it("createLegend shall not set legend (ignore)", function () {
        attributes.legendURL = "ignore";
        const terrainLayer = new TerrainLayer(attributes);

        terrainLayer.createLegend();
        expect(terrainLayer.get("legend")).to.equal(false);
    });
});


