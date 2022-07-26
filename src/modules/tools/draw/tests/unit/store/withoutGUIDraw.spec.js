import sinon from "sinon";
import {expect} from "chai";
import actions from "../../../store/actionsDraw";
import Feature from "ol/Feature";
import Polygon from "ol/geom/Polygon";
import MultiPolygon from "ol/geom/MultiPolygon";

describe("src/modules/tools/draw/store/actions/withoutGUIDraw.js", () => {
    let commit, dispatch, state, getters;

    beforeEach(() => {
        commit = sinon.spy();
        dispatch = sinon.spy();
    });

    afterEach(sinon.restore);

    describe("cancelDrawWithoutGUI", () => {
        it("should dispatch as intended", () => {
            actions.cancelDrawWithoutGUI({commit, dispatch});

            expect(commit.calledTwice).to.be.true;
            expect(commit.firstCall.args).to.eql(["setWithoutGUI", true]);
            expect(commit.secondCall.args).to.eql(["setActive", false]);
            expect(dispatch.calledThrice).to.be.true;
            expect(dispatch.firstCall.args).to.eql(["manipulateInteraction", {interaction: "draw", active: false}]);
            expect(dispatch.secondCall.args).to.eql(["manipulateInteraction", {interaction: "modify", active: false}]);
            expect(dispatch.thirdCall.args).to.eql(["manipulateInteraction", {interaction: "delete", active: false}]);
        });
    });
    describe("downloadFeaturesWithoutGUI", () => {
        const coordinates = [[
                [559656.9477852482, 5930649.742761639],
                [559514.0728624006, 5932126.116964397],
                [561180.9469622886, 5931935.617067266],
                [560831.6971508835, 5930824.367667342],
                [559656.9477852482, 5930649.742761639]
            ]],
            featureCollectionFromJson = {"type": "FeatureCollection", "features": [{"type": "Feature", "geometry": {"type": "Polygon", "coordinates": [[[559656.9477852482, 5930649.742761639], [559514.0728624006, 5932126.116964397], [561180.9469622886, 5931935.617067266], [560831.6971508835, 5930824.367667342], [559656.9477852482, 5930649.742761639]]]}, "properties": null}]},
            multiPolygonfeatColFromJson = {"type": "FeatureCollection", "features": [{"type": "Feature", "geometry": {"type": "MultiPolygon", "coordinates": [[[[559656.9477852482, 5930649.742761639], [559514.0728624006, 5932126.116964397], [561180.9469622886, 5931935.617067266], [560831.6971508835, 5930824.367667342], [559656.9477852482, 5930649.742761639]]]]}, "properties": null}]};
        let downloadedFeatures,
            item,
            rootState;

        beforeEach(() => {
            mapCollection.clear();
            const map = {
                id: "ol",
                mode: "2D",
                getView: () => ({
                    getProjection: () => ({getCode: () => "EPSG:4326"})
                })
            };

            mapCollection.addMap(map, "2D");
            item = new Feature({
                geometry: new Polygon(coordinates)
            });
            rootState = {
                Maps: {
                    mode: "2D"
                }
            };
            state = {
                layer: {
                    getSource: () => ({getFeatures: () => [item]})
                }
            };
        });

        it("should return a FeatureCollection for normal geometries", () => {
            downloadedFeatures = actions.downloadFeaturesWithoutGUI({state, rootState});

            expect(downloadedFeatures).to.eql(JSON.stringify(featureCollectionFromJson));
        });

        it("should return a multiPolygon in the FeatureCollection for multigeometries", () => {
            item = new Feature({
                geometry: new MultiPolygon([coordinates])
            });
            downloadedFeatures = actions.downloadFeaturesWithoutGUI({state, rootState}, {"geomType": "multiGeometry"});

            expect(downloadedFeatures).to.eql(JSON.stringify(multiPolygonfeatColFromJson));
        });
    });
    describe("downloadViaRemoteInterface", () => {
        const geomType = Symbol(),
            result = Symbol();

        it("should dispatch as aspected", () => {
            dispatch = sinon.stub().resolves(result);

            actions.downloadViaRemoteInterface({dispatch}, geomType);

            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args).to.eql(["downloadFeaturesWithoutGUI", geomType]);
        });
    });
    describe("editFeaturesWithoutGUI", () => {
        it("should dispatch as aspected", () => {
            actions.editFeaturesWithoutGUI({dispatch});

            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args).to.eql(["toggleInteraction", "modify"]);
        });
    });
    describe("initializeWithoutGUI", () => {
        const color = Symbol(),
            maxFeatures = Symbol();
        let drawType = Symbol(),
            request,
            rootState;

        beforeEach(() => {
            request = sinon.spy();
            state = {};
            sinon.stub(Radio, "request").callsFake(request);
            rootState = {
                Maps: {
                    mode: "2D"
                }
            };
        });

        /**
         * @param {String} id id to use for drawType and options prefix
         * @param {Object} [drawTypeOptions={}] the object to use for the drawType options
         * @param {Object} [gettersOptions={}] additional key value pairs to add to the resulting getters
         * @returns {Object}  a mocked getters for this test
         */
        function createGetters (id, drawTypeOptions = {}, gettersOptions = {}) {
            const result = Object.assign({
                drawType: {
                    id,
                    geometry: ""
                },
                styleSettings: drawTypeOptions
            }, gettersOptions);

            return result;
        }

        it("should commit and dispatch as intended if the given drawType is not a Point, LineString, Polygon or Circle", () => {
            getters = createGetters("test");
            actions.initializeWithoutGUI({state, commit, dispatch, getters, rootState}, {drawType});

            expect(commit.callCount).to.equal(2);
            expect(commit.firstCall.args).to.eql(["setFreeHand", false]);
            expect(commit.secondCall.args).to.eql(["setWithoutGUI", true]);
        });
        it("should commit and dispatch as intended if the given drawType is a Point, LineString, Polygon or Circle", async () => {
            drawType = "Point";
            getters = createGetters(drawType);
            await actions.initializeWithoutGUI({state, commit, dispatch, getters, rootState}, {drawType, maxFeatures});

            expect(commit.callCount).to.equal(4);
            expect(commit.firstCall.args).to.eql(["setFreeHand", false]);
            expect(commit.secondCall.args).to.eql(["setWithoutGUI", true]);
            expect(commit.thirdCall.args).to.eql(["setDrawType", {id: "drawSymbol", geometry: "Point"}]);
            expect(commit.lastCall.args).to.eql(["setLayer", undefined]);
            expect(dispatch.firstCall.args).to.eql(["Maps/addNewLayerIfNotExists", "importDrawLayer", {root: true}]);
            expect(dispatch.secondCall.args).to.eql(["createDrawInteractionAndAddToMap", {active: true, maxFeatures}]);
            expect(dispatch.thirdCall.args).to.eql(["createSelectInteractionAndAddToMap", false]);
            expect(dispatch.getCall(3).args).to.eql(["createModifyInteractionAndAddToMap", false]);

        });
        it("should commit and dispatch as intended if the given drawType is a Point, LineString, Polygon or Circle and the color is defined", async () => {
            drawType = "LineString";
            getters = createGetters(drawType, {color: null, colorContour: null});
            await actions.initializeWithoutGUI({state, commit, dispatch, getters, rootState}, {drawType, color, maxFeatures});

            expect(commit.callCount).to.equal(5);
            expect(commit.firstCall.args).to.eql(["setFreeHand", false]);
            expect(commit.secondCall.args).to.eql(["setWithoutGUI", true]);
            expect(commit.thirdCall.args).to.eql(["setDrawType", {id: "drawLine", geometry: "LineString"}]);
            expect(commit.getCall(3).args).to.eql(["setLineStringSettings", {color, colorContour: color}]);
            expect(commit.lastCall.args).to.eql(["setLayer", undefined]);
            expect(dispatch.firstCall.args).to.eql(["Maps/addNewLayerIfNotExists", "importDrawLayer", {root: true}]);
            expect(dispatch.secondCall.args).to.eql(["createDrawInteractionAndAddToMap", {active: true, maxFeatures}]);
            expect(dispatch.thirdCall.args).to.eql(["createSelectInteractionAndAddToMap", false]);
            expect(dispatch.getCall(3).args).to.eql(["createModifyInteractionAndAddToMap", false]);
        });
        it("should commit and dispatch as intended if the given drawType is a Point, LineString, Polygon or Circle and the opacity is defined", async () => {
            const opacity = "3.5",
                resultColor = [0, 1, 2, 3.5];

            drawType = "Polygon";
            getters = createGetters(drawType, {color: [0, 1, 2, 0], opacity: 0});

            await actions.initializeWithoutGUI({state, commit, dispatch, getters, rootState}, {drawType, opacity, maxFeatures});

            expect(commit.callCount).to.equal(5);
            expect(commit.firstCall.args).to.eql(["setFreeHand", false]);
            expect(commit.secondCall.args).to.eql(["setWithoutGUI", true]);
            expect(commit.thirdCall.args).to.eql(["setDrawType", {id: "drawArea", geometry: "Polygon"}]);
            expect(commit.getCall(3).args).to.eql(["setPolygonSettings", {color: resultColor, opacity}]);
            expect(commit.lastCall.args).to.eql(["setLayer", undefined]);
            expect(dispatch.firstCall.args).to.eql(["Maps/addNewLayerIfNotExists", "importDrawLayer", {root: true}]);
            expect(dispatch.secondCall.args).to.eql(["createDrawInteractionAndAddToMap", {active: true, maxFeatures}]);
            expect(dispatch.thirdCall.args).to.eql(["createSelectInteractionAndAddToMap", false]);
            expect(dispatch.getCall(3).args).to.eql(["createModifyInteractionAndAddToMap", false]);
        });
    });
});
