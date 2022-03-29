import {expect} from "chai";
import sinon from "sinon";
import actions from "../../../store/actions/actionsMap.js";

describe("src/modules/map/store/actions/actionsMap.js", () => {
    describe("updateClick: Listener for click on the map", () => {
        it("commits setClickCoord and setClickPixel in MODE_2D", () => {
            const getters = {
                    mapMode: "2D"
                },
                rootGetters = {
                    "Tools/Gfi/active": false,
                    "controls/orientation/poiModeCurrentPositionEnabled": true
                },
                commit = sinon.spy(),
                obj = {
                    coordinate: [4, 56],
                    pixel: [12, 99]
                };

            actions.updateClick({commit, getters, rootGetters}, obj);
            expect(commit.calledTwice).to.be.true;
            expect(commit.args).to.deep.equal([
                ["setClickCoord", [4, 56]],
                ["setClickPixel", [12, 99]]
            ]);
        });

        it("commits setClickCoord and setClickPixel in MODE_3D", () => {
            const getters = {
                    mapMode: "3D"
                },
                rootGetters = {
                    "Tools/Gfi/active": false,
                    "controls/orientation/poiModeCurrentPositionEnabled": true
                },
                commit = sinon.spy(),
                obj = {
                    pickedPosition: [4, 56],
                    position: {
                        x: 12,
                        y: 99
                    },
                    map3d: "map3d"
                };

            actions.updateClick({commit, getters, rootGetters}, obj);
            expect(commit.calledThrice).to.be.true;
            expect(commit.args).to.deep.equal([
                ["setClickCoord", [4, 56]],
                ["setClickPixel", [12, 99]],
                ["setMap3d", "map3d"]
            ]);
        });

        it("commits setClickCoord, setClickPixel and setFeaturesAtCoordinate if gfi tool is active", () => {
            const getters = {
                    mapMode: "2D"
                },
                rootGetters = {
                    "Tools/Gfi/active": true,
                    "controls/orientation/poiModeCurrentPositionEnabled": true
                },
                dispatch = sinon.spy(),
                commit = sinon.spy(),
                obj = {
                    coordinate: [4, 56],
                    pixel: [12, 99]
                };

            actions.updateClick({commit, getters, dispatch, rootGetters}, obj);
            expect(commit.calledThrice).to.be.true;
            expect(dispatch.calledTwice).to.be.true;
            expect(dispatch.args[0]).to.include.members(["MapMarker/removePolygonMarker"]);
            expect(dispatch.args[1]).to.include.members(["collectGfiFeatures"]);
        });
    });

    describe("collectGfiFeatures", () => {
        it("commits setGfiFeature", async () => {
            const getters = {
                    clickCoord: sinon.spy(),
                    mapMode: "2D",
                    visibleWmsLayerList: {
                        filter: function () {
                            return [];
                        }
                    },
                    resolution: sinon.spy(),
                    projection: sinon.spy(),
                    gfiFeaturesAtPixel: []
                },
                view = {
                    getResolution: sinon.stub(),
                    getProjection: sinon.stub()
                },
                layers = {
                    getArray: function () {
                        return [];
                    }
                },
                rootGetters = {
                    "Tools/Gfi/active": true,
                    "controls/orientation/poiModeCurrentPositionEnabled": true
                },
                commit = sinon.spy(),
                dispatch = sinon.spy(),
                obj = {
                    coordinate: [4, 56],
                    pixel: [12, 99],
                    map: {
                        getView: function () {
                            return view;
                        },
                        getLayers: function () {
                            return layers;
                        },
                        getFeaturesAtPixel: sinon.stub()
                    }
                };

            actions.updateClick({getters, commit, dispatch, rootGetters}, obj);
            expect(commit.calledThrice).to.be.true;
            expect(commit.args[1]).to.include.members(["setClickPixel"]);
        });
    });

    // describe("setCenter", () => {
    //     let commit,
    //         setCenter,
    //         warn,
    //         getters;

    //     beforeEach(() => {
    //         commit = sinon.spy();
    //         setCenter = sinon.spy();
    //         getters = {
    //             ol2DMap: {
    //                 getView: () => {
    //                     return {
    //                         setCenter: setCenter
    //                     };
    //                 }
    //             }
    //         };
    //         warn = sinon.spy();
    //         sinon.stub(console, "warn").callsFake(warn);
    //     });
    //     afterEach(sinon.restore);

    //     /**
    //      * This helper function is called for the test cases in which
    //      * the given input for setCenter ist no valid.
    //      *
    //      * @returns {void}
    //      */
    //     function expectMutationNotCalled () {
    //         expect(commit.notCalled).to.be.true;
    //         expect(setCenter.notCalled).to.be.true;
    //         expect(warn.calledOnce).to.be.true;
    //         expect(warn.firstCall.args).to.eql(["Center was not set. Probably there is a data type error. The format of the coordinate must be an array with two numbers."]);
    //     }

    //     it("should set the center if the coordinates are given as an array of length two with two numbers", () => {
    //         const coords = [3, 5];

    //         actions.setCenter({commit, getters}, coords);

    //         expect(commit.calledOnce).to.be.true;
    //         expect(commit.firstCall.args).to.eql(["setCenter", coords]);
    //         expect(setCenter.calledOnce).to.be.true;
    //         expect(setCenter.firstCall.args).to.eql([coords]);
    //         expect(warn.notCalled).to.be.true;
    //     });
    //     it("should not set the center, if the coordinate (['3', 5]) has the wrong data type", () => {
    //         actions.setCenter({commit, getters}, ["3", 5]);

    //         expectMutationNotCalled();
    //     });
    //     it("should not set the center, if the coordinate ([3, '5']) has the wrong data type", () => {
    //         actions.setCenter({commit, getters}, [3, "5"]);

    //         expectMutationNotCalled();
    //     });
    //     it("should not set the center, if the coordinate is not an array", () => {
    //         actions.setCenter({commit, getters}, {3: "5"});

    //         expectMutationNotCalled();
    //     });
    //     it("should not set the center, if the length of the coordinate is greater than two", () => {
    //         actions.setCenter({commit, getters}, [0, 3, 3]);

    //         expectMutationNotCalled();
    //     });
    //     it("should not set the center, if the length of the coordinate is lower than two", () => {
    //         actions.setCenter({commit, getters}, [8]);

    //         expectMutationNotCalled();
    //     });
    // });
});
