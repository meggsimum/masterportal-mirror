import {expect} from "chai";
import sinon from "sinon";
import actions from "../../../store/actions/actionsMapMode";


describe("src/core/maps/store/actions/actionsMapMode.js", () => {
    let dispatch;

    beforeEach(() => {
        dispatch = sinon.spy();
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
});
