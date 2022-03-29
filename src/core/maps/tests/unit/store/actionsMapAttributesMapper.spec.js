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
});
