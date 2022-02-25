import sinon from "sinon";
import {expect} from "chai";
import actions from "../../../store/actionsWfsSearch";
import isObject from "../../../../../../utils/isObject";

describe("src/modules/tools/wfsSearch/store/actionsWfsSearch.js", () => {
    let commit, dispatch;

    beforeEach(() => {
        commit = sinon.spy();
        dispatch = sinon.spy();
    });

    afterEach(sinon.restore);

    describe("instanceChanged", () => {
        it("should update the currently set search instance", () => {
            const instanceIndex = 1;

            actions.instanceChanged({commit, dispatch}, instanceIndex);

            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args).to.eql(["setCurrentInstanceIndex", instanceIndex]);
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args).to.eql(["prepareModule"]);
        });
    });

    describe("prepareModule", () => {
        const typeName = "someName",
            url = "myWfs",
            userHelp = "HALP";
        let getters,
            rootGetters,
            service;

        beforeEach(() => {
            getters = {
                currentInstance: {
                    literals: [],
                    requestConfig: {
                        restLayerId: 456,
                        storedQueryId: 5
                    },
                    userHelp
                }
            };
            rootGetters = {
                getRestServiceById: id => id === 456 ? {url, featureType: typeName} : {}
            };
            service = {url};
        });

        it("should reset the module if the WFS is not given", () => {
            delete getters.currentInstance.requestConfig.restLayerId;

            actions.prepareModule({commit, dispatch, getters, rootGetters});

            expect(dispatch.calledThrice).to.be.true;
            expect(dispatch.firstCall.args).to.eql(["resetModule", false]);
            expect(dispatch.secondCall.args).to.eql(["resetModule", true]);
            expect(dispatch.thirdCall.args[0]).to.eql("Alerting/addSingleAlert");
            expect(dispatch.thirdCall.args[1]).to.eql(i18next.t("common:modules.tools.wfsSearch.wrongConfig", {id: "wfsId"}));
            expect(dispatch.thirdCall.args[2]).to.eql({root: true});
        });
        it("should prepare the module if the WFS is given", () => {
            actions.prepareModule({commit, dispatch, getters, rootGetters});

            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args).to.eql(["resetModule", false]);
            expect(commit.calledThrice).to.be.true;
            expect(commit.firstCall.args.length).to.equal(2);
            expect(commit.firstCall.args[0]).to.equal("setRequiredValues");
            expect(isObject(commit.firstCall.args[1])).to.be.true;
            expect(commit.secondCall.args).to.eql(["setUserHelp", userHelp]);
            expect(commit.thirdCall.args).to.eql(["setService", service]);
        });
        it("should prepare the module if the WFS is given while also dispatching 'retrieveData' if the parameter 'selectSource' is given in the currentInstance", () => {
            getters.currentInstance.selectSource = 122;

            actions.prepareModule({commit, dispatch, getters, rootGetters});

            expect(dispatch.calledTwice).to.be.true;
            expect(dispatch.firstCall.args).to.eql(["resetModule", false]);
            expect(dispatch.secondCall.args).to.eql(["retrieveData"]);
            expect(commit.calledThrice).to.be.true;
            expect(commit.firstCall.args.length).to.equal(2);
            expect(commit.firstCall.args[0]).to.equal("setRequiredValues");
            expect(isObject(commit.firstCall.args[1])).to.be.true;
            expect(commit.secondCall.args).to.eql(["setUserHelp", userHelp]);
            expect(commit.thirdCall.args).to.eql(["setService", service]);
        });
        it("should prepare the module if the WFS is given while also setting typename on the service with the value of the featureType if the parameter 'storedQueryId' is not given and the parameter 'layerId' is given in the currentInstance", () => {
            delete getters.currentInstance.requestConfig.storedQueryId;
            getters.currentInstance.requestConfig.layerId = 569;
            service.typeName = typeName;

            actions.prepareModule({commit, dispatch, getters, rootGetters});

            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args).to.eql(["resetModule", false]);
            expect(commit.calledThrice).to.be.true;
            expect(commit.firstCall.args.length).to.equal(2);
            expect(commit.firstCall.args[0]).to.equal("setRequiredValues");
            expect(isObject(commit.firstCall.args[1])).to.be.true;
            expect(commit.secondCall.args).to.eql(["setUserHelp", userHelp]);
            expect(commit.thirdCall.args).to.eql(["setService", service]);
        });
    });

    describe("resetModule", () => {
        it("should reset state parameters to their initial state", () => {
            actions.resetModule({commit, dispatch}, false);

            expect(commit.callCount).to.equal(4);
            expect(commit.firstCall.args).to.eql(["setRequiredValues", null]);
            expect(commit.secondCall.args).to.eql(["setSearched", false]);
            expect(commit.thirdCall.args).to.eql(["setService", null]);
            expect(commit.lastCall.args).to.eql(["setUserHelp", ""]);
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args).to.eql(["resetResult"]);
        });
        it("should reset state parameters to their initial state and reset the tool completely", () => {
            actions.resetModule({commit, dispatch}, true);

            expect(commit.callCount).to.equal(7);
            expect(commit.firstCall.args).to.eql(["setRequiredValues", null]);
            expect(commit.secondCall.args).to.eql(["setSearched", false]);
            expect(commit.thirdCall.args).to.eql(["setService", null]);
            expect(commit.getCall(3).args).to.eql(["setUserHelp", ""]);
            expect(commit.getCall(4).args).to.eql(["setCurrentInstanceIndex", 0]);
            expect(commit.getCall(5).args).to.eql(["setParsedSource", null]);
            expect(commit.lastCall.args).to.eql(["setActive", false]);
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args).to.eql(["resetResult"]);
        });
    });

    describe("resetResult", () => {
        it("should reset the results in the state", () => {
            const state = {
                    requiredValues: {Gemarkung: "Waldesch", Flur: 5}
                },
                getters = {currentInstance: {literals: []}};

            actions.resetResult({state, getters, commit, dispatch});

            expect(commit.callCount).to.equal(4);
            expect(commit.firstCall.args).to.eql(["setValuesReset", true]);
            expect(commit.secondCall.args).to.eql(["setSearched", false]);
            expect(commit.thirdCall.args).to.eql(["setResults", []]);
            expect(commit.lastCall.args).to.eql(["setSelectedOptions", {}]);
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args).to.eql(["MapMarker/removePointMarker", null, {root: true}]);
            expect(state.requiredValues).to.eql({Gemarkung: "", Flur: ""});
        });
    });
});
