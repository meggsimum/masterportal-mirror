import {expect} from "chai";
import sinon from "sinon";
import actions from "../../../store/actions/actionsMapAttributesMapper.js";

describe("src/core/maps/store/actions/actionsMapAttributesMapper.js", () => {
    describe("updateClick: Listener for click on the map", () => {
        it("commits setClickCoord in MODE_2D", () => {
            const getters = {
                    mode: "2D"
                },
                rootGetters = {
                    "Tools/Gfi/active": false,
                    "controls/orientation/poiModeCurrentPositionEnabled": true
                },
                commit = sinon.spy(),
                obj = {
                    coordinate: [4, 56]
                };

            actions.updateClick({commit, getters, rootGetters}, obj);
            expect(commit.calledTwice).to.be.true;
            expect(commit.firstCall.args).to.deep.equal([
                "setClickCoordinate", [4, 56]
            ]);
        });

        it("commits setClickCoord in MODE 3D", () => {
            const getters = {
                    mode: "3D"
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
                    }
                };

            actions.updateClick({commit, getters, rootGetters}, obj);
            expect(commit.calledTwice).to.be.true;
            expect(commit.firstCall.args).to.deep.equal([
                "setClickCoordinate", [4, 56]
            ]);
            expect(commit.secondCall.args).to.deep.equal([
                "setClickCartesianCoordinate", [12, 99]
            ]);
        });

        it("commits setClickCoord, setClickPixel and setFeaturesAtCoordinate if gfi tool is active", () => {
            const getters = {
                    mode: "2D"
                },
                rootGetters = {
                    "Tools/Gfi/active": true,
                    "controls/orientation/poiModeCurrentPositionEnabled": true
                },
                dispatch = sinon.spy(),
                commit = sinon.spy(),
                obj = {
                    coordinate: [4, 56]
                };

            actions.updateClick({commit, getters, dispatch, rootGetters}, obj);
            expect(commit.calledThrice).to.be.true;
            expect(dispatch.calledTwice).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equal("MapMarker/removePolygonMarker");
            expect(dispatch.secondCall.args[0]).to.equal("Maps/collectGfiFeatures");
        });
    });

    describe("setCenter", () => {
        let commit,
            setCenter,
            warn,
            mapView,
            coords,
            getters;

        beforeEach(() => {
            commit = sinon.spy();
            setCenter = sinon.spy();
            mapView = {
                getCenter: () => {
                    return coords;
                }
            };
            getters = {
                ol2DMap: {
                    getView: () => {
                        return {
                            setCenter: setCenter
                        };
                    }
                },
                getView: {
                    setCenter: setCenter
                }
            };
            warn = sinon.spy();
            sinon.stub(console, "warn").callsFake(warn);
        });
        afterEach(sinon.restore);

        /**
         * This helper function is called for the test cases in which
         * the given input for setCenter ist no valid.
         *
         * @returns {void}
         */
        function expectMutationNotCalled () {
            expect(commit.notCalled).to.be.true;
            expect(setCenter.notCalled).to.be.true;
            expect(warn.calledOnce).to.be.true;
            expect(warn.firstCall.args).to.eql(["Center was not set. Probably there is a data type error. The format of the coordinate must be an array with two numbers."]);
        }

        it("should set the center if the coordinates are given as an array of length two with two numbers", () => {
            coords = [3, 5];

            actions.setCenter({commit, getters}, mapView);

            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args).to.eql(["setCenter", coords]);
            expect(setCenter.calledOnce).to.be.true;
            expect(setCenter.firstCall.args).to.eql([coords]);
            expect(warn.notCalled).to.be.true;
        });
        it("should not set the center, if the coordinate (['3', 5]) has the wrong data type", () => {
            coords = ["3", 5];
            actions.setCenter({commit, getters}, mapView);

            expectMutationNotCalled();
        });
        it("should not set the center, if the coordinate ([3, '5']) has the wrong data type", () => {
            coords = [3, "5"];
            actions.setCenter({commit, getters}, mapView);

            expectMutationNotCalled();
        });
        it("should not set the center, if the coordinate is not an array", () => {
            coords = {3: "5"};
            actions.setCenter({commit, getters}, mapView);

            expectMutationNotCalled();
        });
        it("should not set the center, if the length of the coordinate is greater than two", () => {
            coords = [0, 3, 3];
            actions.setCenter({commit, getters}, mapView);

            expectMutationNotCalled();
        });
        it("should not set the center, if the length of the coordinate is lower than two", () => {
            coords = [8];
            actions.setCenter({commit, getters}, mapView);

            expectMutationNotCalled();
        });
    });
});
