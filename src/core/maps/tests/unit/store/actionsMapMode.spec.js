import {expect} from "chai";
import sinon from "sinon";
import actions from "../../../store/actions/actionsMapMode";
import testAction from "../../../../../../test/unittests/VueTestUtils";

const {
    deactivateOblique,
    clickEventCallback,
    controlZoomLevel
} = actions;

describe("src/core/maps/store/actions/actionsMapMode.js", () => {
    let dispatch,
        radioTrigger,
        radioOnce;

    beforeEach(() => {
        dispatch = sinon.spy();
        radioTrigger = sinon.spy(Radio, "trigger");
        radioOnce = sinon.spy(Radio, "once");
    });
    afterEach(sinon.restore);

    it("deactivateOblique executes Radios", () => {
        deactivateOblique({dispatch});

        expect(radioOnce.args[0][0]).to.equal("Map");
        expect(radioOnce.args[0][1]).to.equal("change");
        expect(radioOnce.args[0][2]).to.be.a("function");
        expect(radioTrigger.calledWithExactly("ObliqueMap", "deactivate")).to.be.true;
    });

    it("clickEventCallback", done => {
        const payload = {
            coordinate: [1, 2, 3]
        };

        testAction(clickEventCallback, payload, {}, {}, [
            {type: "updateClick", payload: Object.assign(payload, {map: "abcMap"}), dispatch: true}
        ], {}, done);

        expect(radioTrigger.calledOnce).to.be.true;
        expect(radioTrigger.args[0][0]).to.equals("Map");
        // expect(radioTrigger.args[0][1]).to.equals("clickedWindowPosition");
        expect(radioTrigger.args[0][2]).to.deep.equals({
            coordinate: [1, 2, 3],
            map: "abcMap"
        });
    });

    it("commits setClickCoord in MODE_2D", done => {
        const payload = {
                currentMapMode: "2D",
                targetMapMode: "3D"
            },
            state = {
                changeZoomLevel: {
                    "2D": null,
                    "3D": 7
                }
            },
            getters = {
                getView: {
                    zoom: 4,
                    getZoom: function () {
                        return this.zoom;
                    },
                    setZoom: function (zoomLevel) {
                        this.zoom = zoomLevel;
                    }
                },
                changeZoomLevel: state.changeZoomLevel
            };


        testAction(controlZoomLevel, payload, state, {}, [
            {type: "setChangeZoomLevel", payload: {
                "2D": 4,
                "3D": 7
            }}
        ], getters, done);

        expect(getters.getView.getZoom()).equals(7);
    });
});
