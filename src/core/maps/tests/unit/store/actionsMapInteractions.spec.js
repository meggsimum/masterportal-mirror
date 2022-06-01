import {expect} from "chai";
import sinon from "sinon";
import actions from "../../../store/actions/actionsMapInteractions.js";
import Map from "ol/Map";

const {
    registerListener,
    unregisterListener
} = actions;

describe("src/core/maps/store/actions/actionsMapInteractions.js", () => {
    describe("registerlistener and unregisterlistener", () => {
        let olMap,
            payload;

        before(() => {
            olMap = new Map();
            payload = {
                type: "pointermove",
                listener: "updatePointer",
                listenerType: "dispatch"
            };
            mapCollection.clear();
            mapCollection.addMap(olMap, "2D");
        });

        it("register pointermove listener to ol map", () => {
            const dispatch = sinon.spy(),
                commit = sinon.spy();

            registerListener({commit, dispatch}, payload);
            expect(Object.keys(olMap.listeners_)).include("pointermove");
        });

        it("unregister pointermove listener from ol map", () => {
            unregisterListener({}, payload);
            expect(Object.keys(olMap.listeners_)).not.include("pointermove");
        });
    });
});
