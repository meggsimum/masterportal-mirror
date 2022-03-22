import {expect} from "chai";
import sinon from "sinon";
import actions from "../../../store/actions/actionsMapMode";


describe("src/core/maps/store/actions/actionsMapMode.js", () => {
    let commit, dispatch, getters;

    beforeEach(() => {
        commit = sinon.spy();
        dispatch = sinon.spy();
        getters = sinon.spy();
    });
    afterEach(sinon.restore);

    it("deactivateOblique executes Radios", () => {
        const radioTrigger = sinon.spy(Radio, "trigger"),
            radioOnce = sinon.spy(Radio, "once");

        actions.deactivateOblique({dispatch});

        expect(radioOnce.args[0][0]).to.equal("Map");
        expect(radioOnce.args[0][1]).to.equal("change");
        expect(radioOnce.args[0][2]).to.be.a("function");
        expect(radioTrigger.calledWithExactly("ObliqueMap", "deactivate")).to.be.true;

    });
    it.skip("activateMap3D executes commits", () => {
        actions.activateMap3D({getters, dispatch, commit});

        expect(commit.calledOnce).to.be.true;
        expect(commit.args).to.deep.equal([
            "setMode", "3D"
        ]);

    });
});
