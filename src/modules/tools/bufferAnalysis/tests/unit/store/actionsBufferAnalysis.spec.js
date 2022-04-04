import sinon from "sinon";
import {expect} from "chai";
import {createLayersArray} from "../utils/functions";
import actions from "../../../store/actionsBufferAnalysis";
import stateBufferAnalysis from "../../../store/stateBufferAnalysis";
import mapCollection from "../../../../../../core/dataStorage/mapCollection.js";
import {
    LineString,
    MultiLineString,
    MultiPoint,
    MultiPolygon,
    LinearRing,
    Point,
    Polygon
} from "ol/geom";

describe("src/modules/tools/bufferAnalysis/store/actionsBufferAnalysis.js", () => {
    let commit, dispatch, rootGetters, rootState, state, tick;

    before(() => {
        mapCollection.clear();
        const map = {
            id: "ol",
            mode: "2D",
            addLayer: sinon.spy(),
            removeLayer: sinon.spy()
        };

        mapCollection.addMap(map, "ol", "2D");
    });

    beforeEach(() => {
        tick = () => {
            return new Promise(resolve => {
                setTimeout(resolve, 0);
            });
        };
        commit = sinon.spy();
        dispatch = sinon.stub().resolves(true);
        rootGetters = {
            "Maps/mode": "2D"
        };
        rootState = {
            Maps: {
                mode: "2D"
            }
        };
        state = {...stateBufferAnalysis};
    });

    afterEach(() => {
        actions.resetModule({commit, dispatch, getters: state});
        sinon.restore();
    });

    describe("initJSTSParser", () => {
        it("initializes the JSTS parser by injecting open layer geometries ", () => {
            const inject = sinon.spy();

            actions.initJSTSParser({getters: {jstsParser: {inject: inject}}});
            expect(inject.calledOnce).to.be.true;

            expect(inject.args[0]).to.eql([Point, LineString, LinearRing, Polygon, MultiPoint, MultiLineString, MultiPolygon]);
        });
    });
    describe("loadSelectOptions", () => {
        it("loads a number of layers as select options and commits them", () => {

            const source = {getFeatures: ()=>[]},
                layers = createLayersArray(3);

            layers.forEach((layer, index) => {
                layers[index].get = key => key === "layerSource" ? source : null;
            });

            sinon.stub(Radio, "request").returns(layers);
            actions.loadSelectOptions({commit});

            expect(commit.calledThrice).to.be.true;
            expect(commit.args[0][0]).to.equal("addSelectOption");
            expect(commit.args[0][1]).to.equal(layers[0]);
            expect(commit.args[1][0]).to.equal("addSelectOption");
            expect(commit.args[1][1]).to.equal(layers[1]);
            expect(commit.args[2][0]).to.equal("addSelectOption");
            expect(commit.args[2][1]).to.equal(layers[2]);
        });
    });
    describe("applySelectedSourceLayer", () => {
        it("calls commit and dispatch each one time with correct parameters", () => {
            state.bufferRadius = 1000;
            const layer = createLayersArray(1)[0],
                selectOptions = createLayersArray(3);

            actions.applySelectedSourceLayer({commit, dispatch, getters: {...state, selectOptions}}, layer);

            expect(commit.calledOnce).to.be.true;
            expect(commit.args[0][0]).to.equal("setSelectedSourceLayer");
            expect(commit.args[0][1]).to.equal(layer);
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.args[0][0]).to.equal("areLayerFeaturesLoaded");
        });
    });
    describe("applySelectedSourceLayer", () => {
        it("throws an error if a layerId is not found", () => {
            expect(() => actions.applySelectedSourceLayer({commit, dispatch, getters: state}, "1234")).to.throw();
        });
    });
    describe("applySelectedTargetLayer", () => {
        it("calls commit and dispatch each one time with correct parameters", () => {
            state.bufferRadius = 1000;
            const layer = createLayersArray(1)[0];

            actions.applySelectedTargetLayer({commit, getters: state, dispatch}, layer);

            expect(commit.calledOnce).to.be.true;
            expect(commit.args[0][0]).to.equal("setSelectedTargetLayer");
            expect(commit.args[0][1]).to.equal(layer);
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.args[0][0]).to.equal("checkIntersection");
        });
    });
    describe("applySelectedTargetLayer", () => {
        it("throws an error if a layerId is not found", () => {
            expect(() => actions.applySelectedTargetLayer({commit, dispatch, getters: state}, "1234")).to.throw();
        });
    });
    describe("applyBufferRadius", () => {
        it("calls commit and dispatch each one time with correct parameters", () => {
            state.bufferRadius = 1000;
            actions.applyBufferRadius({commit, dispatch}, 1000);

            expect(commit.calledOnce).to.be.true;
            expect(commit.args[0][0]).to.equal("setBufferRadius");
            expect(commit.args[0][1]).to.equal(1000);
            expect(dispatch.calledTwice).to.be.true;
            expect(dispatch.args[0][0]).to.equal("removeGeneratedLayers");
            expect(dispatch.args[1][0]).to.equal("showBuffer");
        });
    });
    describe("checkIntersection", () => {
        it("calls dispatch five times with correct parameters and selectedTargetLayer.get() once", async () => {
            state.selectedTargetLayer = {...createLayersArray(1)[0], get: sinon.stub().returns({setOpacity: () => ({})})};
            state.bufferLayer = {...createLayersArray(1)[0], getSource: ()=> ({getFeatures: ()=>({})})};
            actions.checkIntersection({getters: state, dispatch});

            await tick();
            expect(dispatch.callCount).to.equal(5);
            expect(state.selectedTargetLayer.get.calledOnce).to.be.true;
            expect(dispatch.args[0][0]).to.equal("areLayerFeaturesLoaded");
            expect(dispatch.args[1][0]).to.equal("checkIntersectionWithBuffers");
            expect(dispatch.args[2][0]).to.equal("checkIntersectionsWithIntersections");
            expect(dispatch.args[3][0]).to.equal("convertIntersectionsToPolygons");
            expect(dispatch.args[4][0]).to.equal("addNewFeaturesToMap");
        });
    });
    describe("showBuffer", () => {
        it("calls commit and addLayer once each", async () => {
            state.selectedSourceLayer = {...createLayersArray(1)[0], get: ()=> ({getFeatures: ()=>[], setOpacity: () => ({})})};
            actions.showBuffer({commit, getters: state, dispatch, rootGetters});

            expect(commit.calledOnce).to.be.true;
            expect(mapCollection.getMap("2D").addLayer.callCount).to.equal(1);
        });
    });
    describe("removeGeneratedLayers", () => {
        it("calls commit four times and removeLayer twice", async () => {
            state.resultLayer = createLayersArray(1)[0];
            state.bufferLayer = createLayersArray(1)[0];
            actions.removeGeneratedLayers({commit, rootState, getters: state});

            expect(commit.callCount).to.equal(4);
            expect(mapCollection.getMap("2D").removeLayer.calledTwice).to.be.true;
        });
    });
    describe("resetModule", () => {
        it("calls dispatch three times and commit once", async () => {
            actions.resetModule({commit, getters: state, dispatch});

            expect(dispatch.callCount).to.equal(3);
            expect(commit.calledTwice).to.be.true;
        });
    });
});
